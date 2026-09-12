import type Phaser from 'phaser';
import type { Action, MapState, Pacto } from '../core/content/schema';
import type { ValidatedEpisode } from '../core/content/validate';
import { getBus } from '../core/bus';
import { matchBeats } from '../core/beats';
import { BALANCE } from '../core/balance';
import type { BeatEvent } from '../core/beats';
import { addLegitimidad, mapStateFor } from '../core/legitimidad/legitimidad';
import type { LegitimidadState } from '../core/legitimidad/legitimidad';
import type { Evaluacion } from '../core/pacto/engine';
import * as GS from '../core/state/gameState';
import type { GameState } from '../core/state/gameState';
import { loadEpisode, loadGlobalContent } from './contentLoader';
import { buildSave, importCode, lastSlot, readSave, writeSave } from '../core/save/save';
import type { SaveV1, Storage } from '../core/save/save';
import { hasLamina } from '../engine/art/registry';
import { capasPara } from '../engine/audio/synth';
import { ui } from '../ui/store';
import type { LoadedContent } from './contentLoader';
import { WorldScene } from '../engine/world/WorldScene';
import type { WorldSceneData } from '../engine/world/WorldScene';

/**
 * Sesión de juego: une el estado (core), el contenido y las escenas (engine) a través
 * del bus. Es la única pieza que conoce a las tres capas.
 *
 * Las acciones modales (diálogo, cinemática, audiencia, pacto) se resuelven con promesas
 * que la UI cumple al cerrarse; en E1 son marcadores que se completan en épicas posteriores.
 */
export interface ModalHandlers {
  dialogue: (id: string, session: Session) => Promise<{ deferred: Action[] }>;
  cutscene: (id: string, session: Session) => Promise<void>;
  audiencia: (id: string, session: Session) => Promise<void>;
  pacto: (id: string, session: Session) => Promise<void>;
  interpelacion: (
    e: { name: string; rank: string; articulo?: string },
    session: Session,
  ) => Promise<'interpelada' | 'detenida'>;
}

const noopModals: ModalHandlers = {
  dialogue: async () => ({ deferred: [] }),
  cutscene: async () => undefined,
  audiencia: async () => undefined,
  pacto: async () => undefined,
  interpelacion: async () => 'interpelada',
};

export interface SessionSettings {
  modo: 'estudio' | 'normal' | 'jurista';
  textScale: number;
  font: 'pixel' | 'legible';
  modoAula: boolean;
  volumen: number;
}

export class Session {
  state: GameState;
  settings: SessionSettings = {
    modo: 'normal',
    textScale: 1,
    font: 'legible',
    modoAula: false,
    volumen: 0.8,
  };
  episode: ValidatedEpisode | null = null;
  content: LoadedContent | null = null;
  legitimidad: LegitimidadState = {};
  /** Actas redactadas (texto) por id de pacto, para el Cuaderno. */
  actas: Record<string, string> = {};
  private running = false;
  private queue: Action[][] = [];
  private modals: ModalHandlers = noopModals;
  private listenersBound = false;

  readonly storage: Storage;

  constructor(
    readonly game: Phaser.Game,
    storage?: Storage,
  ) {
    this.state = GS.createGameState({ episode: 'gym', map: 'plaza', spawn: 'inicio' });
    this.storage = storage ?? window.localStorage;
    this.loadSettings();
  }

  // ---------------------------------------------------------------------
  // Ajustes
  // ---------------------------------------------------------------------

  private loadSettings(): void {
    try {
      const raw = this.storage.getItem('aequitas.settings');
      if (raw)
        this.settings = { ...this.settings, ...(JSON.parse(raw) as Partial<SessionSettings>) };
    } catch {
      /* ajustes por defecto */
    }
    this.applySettings();
  }

  updateSettings(next: SessionSettings): void {
    this.settings = next;
    this.storage.setItem('aequitas.settings', JSON.stringify(next));
    this.applySettings();
    this.bus.emit('state:changed', { reason: 'settings' });
  }

  private applySettings(): void {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(this.settings.textScale));
    root.classList.toggle('font-pixel', this.settings.font === 'pixel');
    this.bus.emit('audio:volume', { volumen: this.settings.volumen });
  }

  // ---------------------------------------------------------------------
  // Guardado
  // ---------------------------------------------------------------------

  buildSave(slot: number): SaveV1 {
    return buildSave(slot, this.state, this.legitimidad, this.actas);
  }

  save(slot: number): void {
    writeSave(this.storage, this.buildSave(slot));
    this.bus.emit('ui:toast', { text: `Partida guardada en la ranura ${slot}.`, kind: 'ok' });
  }

  lastSave(): SaveV1 | null {
    const slot = lastSlot(this.storage);
    return slot ? readSave(this.storage, slot) : null;
  }

  importFromCode(code: string): void {
    const save = importCode(code);
    writeSave(this.storage, { ...save, slot: 3 });
    this.bus.emit('ui:toast', { text: 'Partida importada en la ranura 3.', kind: 'ok' });
  }

  async load(slot: number): Promise<void> {
    const save = readSave(this.storage, slot);
    if (!save) throw new Error(`No hay partida en la ranura ${slot}`);
    const [content, episode] = await Promise.all([
      loadGlobalContent(),
      loadEpisode(save.state.episode),
    ]);
    this.content = content;
    this.episode = episode;
    this.state = save.state;
    this.legitimidad = save.legitimidad;
    this.actas = save.actas;
    this.bindListeners();
    ui.enTitulo.value = false;
    this.startWorld(this.state.map, this.state.spawn);
    this.bus.emit('ui:toast', { text: `Partida de ${this.state.playerName} cargada.`, kind: 'ok' });
  }

  /** Lámina provisional (del prototipo) para una cinemática cuyo archivo real no existe. */
  provisionalLamina(id: string): string | null {
    if (hasLamina(id)) return null;
    const prov: Record<string, string> = {
      'ep00-lamina-1': 'prov-fractura',
      'ep00-lamina-2': 'prov-fractura',
      'ep00-lamina-3': 'prov-codice',
      'ep00-lamina-4': 'prov-biblioteca',
      'ep00-lamina-5': 'prov-biblioteca',
    };
    const p = prov[id];
    return p && hasLamina(p) ? `assets/illustrations/${p}.jpg` : null;
  }

  setModals(m: Partial<ModalHandlers>): void {
    this.modals = { ...this.modals, ...m };
  }

  get bus() {
    return getBus();
  }

  /** Empieza un episodio desde cero. */
  async newGame(episodeId: string, playerName?: string): Promise<void> {
    const [content, episode] = await Promise.all([loadGlobalContent(), loadEpisode(episodeId)]);
    this.content = content;
    this.episode = episode;
    const m = episode.manifest;
    this.state = GS.createGameState({
      playerName,
      episode: m.id,
      map: m.entry.map,
      spawn: m.entry.spawn,
      flagsInit: m.flagsInit,
      party: m.party,
      legitimidadStart: { [m.region]: m.legitimidad.start },
    });
    this.legitimidad = { [m.region]: { valor: m.legitimidad.start, porFuente: {} } };
    this.actas = {};
    for (const c of m.codice) this.state = GS.unlockCodice(this.state, c);
    this.bindListeners();
    ui.enTitulo.value = false;
    this.startWorld(m.entry.map, m.entry.spawn);
    await this.fire({ type: 'episodeStart' });
    await this.fire({ type: 'enterMap', map: m.entry.map });
  }

  private bindListeners(): void {
    if (this.listenersBound) return;
    this.listenersBound = true;
    const bus = this.bus;
    bus.on('world:interact', (e) => void this.onInteract(e.kind, e.id, e.payload ?? {}));
    bus.on('world:door', (e) => void this.onDoor(e.map, e.spawn));
    bus.on('world:trigger', (e) => void this.fire({ type: 'interact', object: e.name }));
    bus.on('world:patrol', (e) => void this.onPatrol(e));
    bus.on('ui:closed', (e) => {
      if (e.panel === 'audiencia' || e.panel === 'pacto') this.emitWorldMusic();
    });
  }

  /** Vuelve a la música de la región del mapa actual. */
  private emitWorldMusic(): void {
    const map = this.episode?.maps[this.state.map];
    const musica = map?.properties?.find((p) => p.name === 'musica')?.value;
    const region = this.episode?.manifest.region ?? '';
    const estado = mapStateFor(
      this.legitimidad[region]?.valor ?? 0,
      this.episode?.manifest.legitimidad.hitos,
    );
    if (typeof musica === 'string')
      this.bus.emit('audio:music', { pista: musica, capas: capasPara(estado) });
  }

  // ---------------------------------------------------------------------
  // Mundo
  // ---------------------------------------------------------------------

  private worldData(mapKey: string, spawn: string): WorldSceneData {
    const ep = this.episode;
    if (!ep) throw new Error('No hay episodio cargado');
    const map = ep.maps[mapKey];
    if (!map) throw new Error(`El mapa ${mapKey} no existe en ${ep.manifest.id}`);
    const region = ep.manifest.region;
    const mapState: MapState =
      this.state.mapStates[mapKey] ??
      mapStateFor(this.legitimidad[region]?.valor ?? 0, ep.manifest.legitimidad.hitos);
    const hidden: string[] = [];
    const characters = new Set<string>();
    const objLayer = map.layers.find((l) => l.name === 'objetos');
    for (const o of objLayer?.objects ?? []) {
      const type = (o.class ?? o.type ?? '').trim();
      const prop = (n: string): string | undefined =>
        o.properties?.find((p) => p.name === n)?.value as string | undefined;
      if (type === 'evidence' && this.state.evidence.includes(prop('evidencia') ?? ''))
        hidden.push(o.name);
      if (type === 'folio' && this.state.foliosLeidos.includes(o.name)) hidden.push(o.name);
      if (type === 'npc' && prop('personaje')) characters.add(prop('personaje')!);
    }
    return {
      episodeId: ep.manifest.id,
      mapKey,
      map,
      spawn,
      mapState,
      party: this.state.party,
      hidden,
      characters: [...characters],
      debug: import.meta.env.DEV,
    };
  }

  startWorld(mapKey: string, spawn: string): void {
    this.state = GS.setLocation(this.state, mapKey, spawn);
    const data = this.worldData(mapKey, spawn);
    const scene = this.game.scene;
    if (
      scene.isActive(WorldScene.KEY) ||
      scene.isSleeping(WorldScene.KEY) ||
      scene.isPaused(WorldScene.KEY)
    ) {
      scene.stop(WorldScene.KEY);
    }
    if (scene.isActive('Title')) scene.stop('Title');
    scene.start(WorldScene.KEY, data);
    this.bus.emit('state:changed', { reason: 'map' });
  }

  private async onDoor(mapKey: string, spawn: string): Promise<void> {
    if (!this.episode?.maps[mapKey]) {
      this.bus.emit('ui:toast', {
        text: `Esa puerta lleva a ${mapKey}, que no existe todavía.`,
        kind: 'warn',
      });
      return;
    }
    this.bus.emit('world:freeze', { frozen: true });
    this.startWorld(mapKey, spawn);
    await this.fire({ type: 'enterMap', map: mapKey });
  }

  private async onInteract(kind: string, id: string, props: Record<string, string>): Promise<void> {
    const ep = this.episode;
    if (!ep) return;
    switch (kind) {
      case 'npc': {
        const dlg = props.dialogo;
        if (dlg) await this.runActions([{ type: 'dialogue', id: dlg }]);
        break;
      }
      case 'evidence': {
        const evId = props.evidencia;
        if (evId && !this.state.evidence.includes(evId)) {
          this.bus.emit('world:hideObject', { name: id });
          await this.runActions([{ type: 'addEvidence', id: evId }]);
        }
        break;
      }
      case 'folio': {
        const codice = props.codice;
        if (codice) {
          this.state = GS.markFolioLeido(this.state, id);
          this.bus.emit('world:hideObject', { name: id });
          await this.runActions([
            { type: 'unlockCodice', id: codice },
            { type: 'legitimidad', delta: 1, fuente: 'folio' },
          ]);
        }
        break;
      }
      case 'companion': {
        const name = this.content?.personajes.find((p) => p.id === id)?.nombre ?? id;
        this.bus.emit('ui:toast', {
          text: `${name}: «Todavía no tengo nada que decirte. Sigue mirando.»`,
        });
        break;
      }
      case 'atril':
        ui.panel.value = 'atril';
        break;
      case 'mesa': {
        const pacto = props.pacto;
        const requiere = props.requiereFlag;
        if (requiere && !this.state.flags[requiere]) {
          this.bus.emit('ui:toast', {
            text: props.textoBloqueo ?? 'Todavía no hay nada que firmar en esta mesa.',
          });
          break;
        }
        if (pacto) await this.runActions([{ type: 'startPacto', id: pacto }]);
        break;
      }
      default:
        await this.fire({ type: 'interact', object: id });
        break;
    }
  }

  private async onPatrol(e: { name: string; rank: string; articulo?: string }): Promise<void> {
    const outcome = await this.modals.interpelacion(e, this);
    this.bus.emit('world:patrolResolved', { name: e.name, outcome });
    if (outcome === 'detenida') await this.detencion();
  }

  /**
   * Detención: fundido, Renata reaparece en el Atril más cercano (spawn «atril» o el de
   * entrada del mapa) con una nota en el Zurrón. Sin pérdida de progreso.
   */
  private async detencion(): Promise<void> {
    const ep = this.episode;
    if (!ep) return;
    const nota = `${ep.manifest.id}-acta-detencion`;
    if (ep.evidence[nota] && !this.state.evidence.includes(nota)) {
      this.state = GS.addEvidence(this.state, nota);
      this.bus.emit('ui:toast', {
        text: `Nota en el zurrón: ${ep.evidence[nota]?.nombre ?? 'Acta de detención'}`,
        kind: 'warn',
      });
    } else {
      this.bus.emit('ui:toast', {
        text: 'La llevan al Despacho y la sueltan sin explicación.',
        kind: 'warn',
      });
    }
    this.bus.emit('world:freeze', { frozen: true });
    const map = ep.maps[this.state.map];
    const objetos = map?.layers.find((l) => l.name === 'objetos')?.objects ?? [];
    const hasAtril = objetos.some((o) => (o.class ?? o.type) === 'spawn' && o.name === 'atril');
    const spawn = hasAtril
      ? 'atril'
      : this.state.map === ep.manifest.entry.map
        ? ep.manifest.entry.spawn
        : 'inicio';
    this.startWorld(this.state.map, spawn);
    this.bus.emit('state:changed', { reason: 'detencion' });
  }

  // ---------------------------------------------------------------------
  // Beats y acciones
  // ---------------------------------------------------------------------

  async fire(ev: BeatEvent): Promise<void> {
    const ep = this.episode;
    if (!ep) return;
    const beats = matchBeats(ep.manifest.beats, this.state, ev);
    for (const b of beats) {
      if (b.once) this.state = GS.markBeatDone(this.state, b.id);
      await this.runActions(b.actions);
    }
  }

  /**
   * Ejecuta acciones de inmediato, aunque haya una cola en marcha (lo usan los paneles
   * modales para efectos no modales: flags, evidencias, legitimidad).
   */
  async applyNow(actions: Action[]): Promise<void> {
    for (const a of actions) await this.runAction(a);
  }

  /** Ejecuta acciones en orden; si ya hay una cola en marcha, las encola detrás. */
  async runActions(actions: Action[]): Promise<void> {
    this.queue.push(actions);
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const batch = this.queue.shift()!;
        for (const a of batch) await this.runAction(a);
      }
    } finally {
      this.running = false;
      this.bus.emit('world:freeze', { frozen: false });
    }
  }

  private async runAction(a: Action): Promise<void> {
    const ep = this.episode;
    if (!ep) return;
    const region = ep.manifest.region;
    switch (a.type) {
      case 'dialogue': {
        const r = await this.modals.dialogue(a.id, this);
        for (const d of r.deferred) await this.runAction(d);
        break;
      }
      case 'cutscene':
        await this.modals.cutscene(a.id, this);
        break;
      case 'setFlag':
        this.state = GS.setFlag(this.state, a.flag, a.value);
        this.bus.emit('state:changed', { reason: 'flag' });
        await this.fire({ type: 'flag', flag: a.flag, value: a.value });
        break;
      case 'addEvidence': {
        const had = this.state.evidence.includes(a.id);
        this.state = GS.addEvidence(this.state, a.id);
        if (!had) {
          const ev = ep.evidence[a.id];
          this.bus.emit('ui:toast', { text: `Evidencia: ${ev?.nombre ?? a.id}`, kind: 'ok' });
          this.bus.emit('state:changed', { reason: 'evidence' });
          await this.fire({ type: 'evidence', id: a.id });
        }
        break;
      }
      case 'removeEvidence':
        this.state = GS.removeEvidence(this.state, a.id);
        this.bus.emit('state:changed', { reason: 'evidence' });
        break;
      case 'unlockCodice': {
        const had = this.state.codice.includes(a.id);
        this.state = GS.unlockCodice(this.state, a.id);
        if (!had) {
          const entry = this.content?.codice[a.id];
          this.bus.emit('ui:toast', {
            text: `Códice: ${entry?.referencia ?? a.id} · ${entry?.titulo ?? ''}`,
            kind: 'ok',
          });
          this.bus.emit('state:changed', { reason: 'codice' });
        }
        break;
      }
      case 'registrarVoz': {
        const ev = ep.evidence[a.id];
        this.state = GS.registrarVoz(this.state, {
          id: a.id,
          nombre: ev?.nombre ?? a.id,
          hecho: ev?.descripcion ?? '',
          fecha: `Día ${this.state.diaDeJuego}`,
        });
        this.bus.emit('ui:toast', { text: `Registro de Voces: ${ev?.nombre ?? a.id}`, kind: 'ok' });
        this.bus.emit('state:changed', { reason: 'voces' });
        break;
      }
      case 'legitimidad':
        this.addLegitimidad(a.region ?? region, a.delta, a.fuente ?? 'evento');
        break;
      case 'startAudiencia':
        await this.modals.audiencia(a.id, this);
        break;
      case 'startPacto':
        await this.modals.pacto(a.id, this);
        break;
      case 'setMapState':
        this.state = GS.setMapState(this.state, a.map, a.state);
        this.bus.emit('world:setMapState', { map: a.map, state: a.state });
        break;
      case 'teleport':
        this.bus.emit('world:freeze', { frozen: true });
        this.startWorld(a.map, a.spawn);
        await this.fire({ type: 'enterMap', map: a.map });
        break;
      case 'joinParty':
        this.state = GS.joinParty(this.state, a.companion);
        this.bus.emit('state:changed', { reason: 'party' });
        break;
      case 'leaveParty':
        this.state = GS.leaveParty(this.state, a.companion);
        this.bus.emit('state:changed', { reason: 'party' });
        break;
      case 'confianza':
        this.state = GS.addConfianza(this.state, a.companion, a.delta);
        break;
      case 'toast':
        this.bus.emit('ui:toast', { text: a.text });
        break;
      case 'save':
        this.save(lastSlot(this.storage) ?? 1);
        break;
      case 'endEpisode':
        await this.endEpisode();
        break;
      default:
        break;
    }
  }

  // ---------------------------------------------------------------------
  // Fin de episodio
  // ---------------------------------------------------------------------

  /**
   * Fin de episodio: si el manifiesto apunta a un episodio publicado, se continúa con el
   * estado acumulado (zurrón, códice, voces, compañía, legitimidad, cuaderno). Si no hay
   * siguiente, se vuelve al título con la partida ya guardada.
   */
  async endEpisode(): Promise<void> {
    const ep = this.episode;
    if (!ep) return;
    const nextId = ep.manifest.ending.nextEpisode;
    const entry = nextId ? this.content?.index.episodes.find((e) => e.id === nextId) : undefined;
    if (nextId && entry?.released) {
      await this.continueTo(nextId);
      return;
    }
    this.returnToTitle(nextId ? 'Continuará en el próximo episodio.' : 'Fin del episodio.');
  }

  /** Carga el siguiente episodio conservando lo que Renata lleva consigo. */
  private async continueTo(episodeId: string): Promise<void> {
    const episode = await loadEpisode(episodeId);
    const m = episode.manifest;
    const prev = this.state;
    this.episode = episode;
    this.state = {
      ...prev,
      episode: m.id,
      map: m.entry.map,
      spawn: m.entry.spawn,
      flags: { ...prev.flags, ...m.flagsInit },
      party: [...new Set([...prev.party, ...m.party])],
      legitimidad: {
        ...prev.legitimidad,
        [m.region]: prev.legitimidad[m.region] ?? m.legitimidad.start,
      },
      mapStates: {},
      diaDeJuego: prev.diaDeJuego + 1,
    };
    for (const c of m.codice) this.state = GS.unlockCodice(this.state, c);
    if (!this.legitimidad[m.region]) {
      this.legitimidad = {
        ...this.legitimidad,
        [m.region]: { valor: m.legitimidad.start, porFuente: {} },
      };
    }
    this.bus.emit('world:freeze', { frozen: true });
    this.startWorld(m.entry.map, m.entry.spawn);
    this.save(lastSlot(this.storage) ?? 1);
    this.bus.emit('ui:toast', { text: `Episodio: ${m.title}`, kind: 'ok' });
    await this.fire({ type: 'episodeStart' });
    await this.fire({ type: 'enterMap', map: m.entry.map });
  }

  /** Cierra el mundo y vuelve al menú de título. */
  private returnToTitle(text: string): void {
    this.bus.emit('world:freeze', { frozen: true });
    const scene = this.game.scene;
    if (scene.isActive(WorldScene.KEY)) scene.stop(WorldScene.KEY);
    scene.start('Title');
    this.bus.emit('ui:toast', { text, kind: 'ok' });
  }

  /** Muestra un diálogo y espera a que se cierre (para paneles que encadenan diálogos). */
  async showDialogue(id: string): Promise<void> {
    if (!this.episode?.dialogues[id]) return;
    const r = await this.modals.dialogue(id, this);
    for (const d of r.deferred) await this.runAction(d);
  }

  /** Nota del Cuaderno para el episodio actual. */
  addNota(nota: string): void {
    const ep = this.episode?.manifest.id ?? 'general';
    this.state = GS.addNota(this.state, ep, nota);
    this.bus.emit('state:changed', { reason: 'nota' });
  }

  /** Registra un pacto firmado: resultado, legitimidad e impugnación si hay nulas. */
  async registrarPacto(
    def: Pacto,
    elegidas: Record<string, string>,
    ev: Evaluacion,
    acta: string,
  ): Promise<void> {
    const region = def.region ?? this.episode?.manifest.region ?? 'general';
    this.state = GS.setPactoResultado(this.state, def.id, {
      equilibrio: ev.equilibrio,
      clausulas: Object.entries(elegidas).map(([p, c]) => `${p}:${c}`),
      impugnado: ev.nulasFirmadas.length > 0,
      fechaJuego: `Día ${this.state.diaDeJuego}`,
    });
    this.state = GS.addNota(
      this.state,
      this.episode?.manifest.id ?? 'general',
      `Acta «${def.titulo}»: Equilibrio ${ev.equilibrio}.`,
    );
    this.actas[def.id] = acta;
    const delta = Math.round((ev.equilibrio / 100) * BALANCE.legitimidad.pactoMax);
    this.addLegitimidad(region, delta, 'pacto');
    if (ev.nulasFirmadas.length) {
      this.addLegitimidad(region, -BALANCE.pacto.penalizacionImpugnacion, 'evento');
    }
    // Efectos de las cláusulas elegidas
    for (const [puntoId, clausulaId] of Object.entries(elegidas)) {
      const c = def.puntos
        .find((p) => p.id === puntoId)
        ?.clausulas.find((x) => x.id === clausulaId);
      if (c?.efectos) await this.applyNow(c.efectos);
    }
    this.state = GS.avanzarDia(this.state, 1);
    this.bus.emit('state:changed', { reason: 'pacto' });
  }

  /** Consulta respondida correctamente (para el Cuaderno y las estadísticas de aula). */
  markConsultaResuelta(id: string): void {
    const before = this.state;
    this.state = GS.markConsultaResuelta(this.state, id);
    if (this.state !== before) this.bus.emit('state:changed', { reason: 'consulta' });
  }

  markCodiceUsed(id: string, audienciaId: string): void {
    this.state = GS.markCodiceUsed(this.state, id, audienciaId);
  }

  /** Busca una evidencia en el episodio actual (Ep. 7 ampliará al zurrón global). */
  evidenceFromAnyEpisode(id: string) {
    return this.episode?.evidence[id];
  }

  /** Cotejo de Prudencio: revela la autenticidad de un documento. */
  cotejar(id: string): void {
    if (!this.state.party.includes('prudencio')) return;
    const ev = this.episode?.evidence[id];
    if (!ev?.cotejo || this.state.evidenceCotejada.includes(id)) return;
    this.state = GS.markCotejada(this.state, id);
    this.bus.emit('ui:toast', {
      text: ev.autentico ? `Cotejo: ${ev.nombre} es auténtico.` : `Cotejo: ${ev.nombre} es falso.`,
      kind: ev.autentico ? 'ok' : 'warn',
    });
    this.bus.emit('state:changed', { reason: 'cotejo' });
  }

  addLegitimidad(
    region: string,
    delta: number,
    fuente: 'audiencia' | 'pacto' | 'consulta' | 'testimonio' | 'folio' | 'evento',
  ): void {
    const hitos = this.episode?.manifest.legitimidad.hitos;
    const r = addLegitimidad(this.legitimidad, region, delta, fuente, hitos);
    this.legitimidad = r.state;
    this.state = { ...this.state, legitimidad: { ...this.state.legitimidad, [region]: r.despues } };
    this.bus.emit('state:changed', { reason: 'legitimidad' });
    if (r.hitoAlcanzado) {
      this.bus.emit('legitimidad:hito', {
        region,
        estado: r.hitoAlcanzado.mapState,
        valor: r.despues,
      });
      // El mapa actual de la región cambia de estado si no tiene uno fijado a mano.
      const ep = this.episode;
      if (ep && ep.manifest.region === region && !this.state.mapStates[this.state.map]) {
        this.bus.emit('world:setMapState', {
          map: this.state.map,
          state: r.hitoAlcanzado.mapState,
        });
      }
    }
  }
}
