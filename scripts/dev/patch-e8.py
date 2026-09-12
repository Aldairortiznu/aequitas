import io

def rw(p, fn):
    s = io.open(p, encoding='utf-8').read()
    n = fn(s)
    assert n != s, p
    io.open(p, 'w', encoding='utf-8').write(n)
    print('patched', p)

def store(s):
    s = s.replace("export type Panel = 'zurron' | 'codice' | 'voces' | 'cuaderno' | 'mapa' | 'ajustes' | 'menu';",
                  "export type Panel = 'zurron' | 'codice' | 'voces' | 'cuaderno' | 'mapa' | 'ajustes' | 'menu' | 'atril';")
    s = s.replace("  /** Contador que la sesión incrementa cuando el estado cambia (para re-renderizar). */\n  tick: signal(0),",
                  "  /** Contador que la sesión incrementa cuando el estado cambia (para re-renderizar). */\n  tick: signal(0),\n  /** ¿Estamos en el menú de título? */\n  enTitulo: signal(false),")
    return s

def session(s):
    s = s.replace("import { loadEpisode, loadGlobalContent } from './contentLoader';",
                  "import { loadEpisode, loadGlobalContent } from './contentLoader';\nimport { buildSave, importCode, lastSlot, readSave, writeSave } from '../core/save/save';\nimport type { SaveV1, Storage } from '../core/save/save';\nimport { hasLamina } from '../engine/art/registry';\nimport { ui } from '../ui/store';")
    old = """  constructor(readonly game: Phaser.Game) {
    this.state = GS.createGameState({ episode: 'gym', map: 'plaza', spawn: 'inicio' });
  }"""
    new = """  readonly storage: Storage;

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
      if (raw) this.settings = { ...this.settings, ...(JSON.parse(raw) as Partial<SessionSettings>) };
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
  }"""
    assert old in s
    s = s.replace(old, new, 1)
    old2 = """    this.legitimidad = { [m.region]: { valor: m.legitimidad.start, porFuente: {} } };
    this.bindListeners();
    this.startWorld(m.entry.map, m.entry.spawn);"""
    new2 = """    this.legitimidad = { [m.region]: { valor: m.legitimidad.start, porFuente: {} } };
    this.actas = {};
    this.bindListeners();
    ui.enTitulo.value = false;
    this.startWorld(m.entry.map, m.entry.spawn);"""
    assert old2 in s
    s = s.replace(old2, new2, 1)
    old3 = """      case 'atril':
        this.bus.emit('ui:toast', { text: 'Atril. Aquí se guardará la partida (E8).' });
        break;"""
    new3 = """      case 'atril':
        ui.panel.value = 'atril';
        break;"""
    assert old3 in s
    s = s.replace(old3, new3, 1)
    old4 = """      case 'save':
        this.bus.emit('ui:toast', { text: 'Guardado (E8 pendiente).' });
        break;"""
    new4 = """      case 'save':
        this.save(lastSlot(this.storage) ?? 1);
        break;"""
    assert old4 in s
    return s.replace(old4, new4, 1)

def bus(s):
    old = "  /** Emitido por core cuando debe mostrarse una notificación breve. */"
    new = """  /** Emitido por la sesión al cambiar el volumen en ajustes. */
  'audio:volume': { volumen: number };
  /** Emitido por la escena de título al quedar lista (la app muestra el menú DOM). */
  'title:ready': undefined;
  /** Emitido por core cuando debe mostrarse una notificación breve. */"""
    assert old in s
    return s.replace(old, new, 1)

def title(s):
    old2 = """    const prompt = this.add
      .text(cx, 214, 'Pulsa Enter o toca la pantalla', {"""
    new2 = """    const prompt = this.add
      .text(cx, 214, '', {"""
    assert old2 in s
    s = s.replace(old2, new2)
    old3 = """    const start = (): void => {
      if (this.started) return;
      this.started = true;
      this.cameras.main.flash(180, 0xf4, 0xdc, 0x8a);
      getBus().emit('title:start');
      this.time.delayedCall(400, () => {
        this.started = false;
      });
    };

    this.input.keyboard?.on('keydown-ENTER', start);
    this.input.keyboard?.on('keydown-SPACE', start);
    this.input.on('pointerdown', start);"""
    new3 = """    this.started = false;
    getBus().emit('title:ready');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => prompt.destroy());"""
    assert old3 in s
    return s.replace(old3, new3)

def main(s):
    old4 = """getBus().on('title:start', () => {
  void session.newGame('gym').catch((err: unknown) => {
    console.error(err);
    getBus().emit('ui:toast', { text: 'No se pudo cargar el episodio. Revisa la consola.', kind: 'warn' });
  });
});"""
    new4 = """getBus().on('title:ready', () => {
  ui.enTitulo.value = true;
});"""
    assert old4 in s
    s = s.replace(old4, new4)
    return s.replace("import { getBus } from './core/bus';", "import { getBus } from './core/bus';\nimport { ui } from './ui/store';")

def app(s):
    s = s.replace("import { InterpelacionHost } from './InterpelacionView';",
                  "import { InterpelacionHost } from './InterpelacionView';\nimport { CutsceneHost } from './CutsceneView';\nimport { TitleMenu } from './TitleMenu';\nimport { AtrilHost } from './AtrilView';")
    return s.replace("      <InterpelacionHost session={session} />",
                     "      <InterpelacionHost session={session} />\n      <CutsceneHost session={session} />\n      <AtrilHost session={session} />\n      <TitleMenu session={session} visible={ui.enTitulo.value && !inWorld} />")

rw('src/ui/store.ts', store)
rw('src/app/session.ts', session)
rw('src/core/bus.ts', bus)
rw('src/engine/scenes/TitleScene.ts', title)
rw('src/main.ts', main)
rw('src/ui/App.tsx', app)
