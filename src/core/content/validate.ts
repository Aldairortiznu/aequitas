import type { ZodType } from 'zod';
import {
  ActionSchema,
  AudienciaSchema,
  CodiceFileSchema,
  ConsultasSchema,
  ContentIndexSchema,
  CutsceneSchema,
  DialogueSchema,
  EpisodeManifestSchema,
  EvidencesSchema,
  InterpelacionesSchema,
  OBJECT_LAYER,
  OBJECT_TYPES,
  PersonajesSchema,
  REQUIRED_TILE_LAYERS,
  SOFT_DIALOGUE_TEXT,
  TiledMapSchema,
  tiledObjectType,
  tiledProp,
} from './schema';
import type {
  Action,
  Audiencia,
  CodiceEntry,
  Condition,
  Consulta,
  ContentIndex,
  Cutscene,
  Dialogue,
  EpisodeManifest,
  Evidence,
  Interpelacion,
  Pacto,
  Personaje,
  TiledMap,
} from './schema';
import { PactoSchema } from './schema';

/**
 * Validación de contenido independiente del sistema de archivos.
 * El script de CI y el cargador del navegador le entregan los JSON ya leídos;
 * aquí se validan los esquemas y las referencias cruzadas.
 */

export type Severity = 'error' | 'warn';
export interface Issue {
  severity: Severity;
  where: string;
  message: string;
}

export interface RawEpisode {
  id: string;
  manifest: unknown;
  dialogues: Record<string, unknown>;
  evidence: unknown;
  audiencias: Record<string, unknown>;
  pactos: Record<string, unknown>;
  consultas: unknown;
  cutscenes: Record<string, unknown>;
  maps: Record<string, unknown>;
}

export interface RawContent {
  index: unknown;
  personajes: unknown;
  codice: Record<string, unknown>;
  interpelaciones?: unknown;
  episodes: RawEpisode[];
}

export interface ValidatedEpisode {
  manifest: EpisodeManifest;
  dialogues: Record<string, Dialogue>;
  evidence: Record<string, Evidence>;
  audiencias: Record<string, Audiencia>;
  pactos: Record<string, Pacto>;
  consultas: Record<string, Consulta>;
  cutscenes: Record<string, Cutscene>;
  maps: Record<string, TiledMap>;
}

export interface ValidationResult {
  issues: Issue[];
  ok: boolean;
  index?: ContentIndex;
  personajes?: Personaje[];
  codice?: Record<string, CodiceEntry>;
  interpelaciones?: Interpelacion[];
  episodes: Record<string, ValidatedEpisode>;
}

class Collector {
  issues: Issue[] = [];
  error(where: string, message: string): void {
    this.issues.push({ severity: 'error', where, message });
  }
  warn(where: string, message: string): void {
    this.issues.push({ severity: 'warn', where, message });
  }
  parse<T>(schema: ZodType<T>, raw: unknown, where: string): T | undefined {
    const r = schema.safeParse(raw);
    if (r.success) return r.data;
    for (const issue of r.error.issues) {
      const path = issue.path.length ? issue.path.map(String).join('.') : '(raíz)';
      this.error(where, `${path}: ${issue.message}`);
    }
    return undefined;
  }
}

interface EpisodeRefs {
  dialogues: Set<string>;
  evidence: Set<string>;
  audiencias: Set<string>;
  pactos: Set<string>;
  consultas: Set<string>;
  cutscenes: Set<string>;
  maps: Set<string>;
  spawns: Map<string, Set<string>>; // map -> spawn names
  beats: Set<string>;
}

interface GlobalRefs {
  codice: Set<string>;
  personajes: Set<string>;
  regiones: Set<string>;
  episodes: Set<string>;
  evidenceAll: Set<string>;
  flagsWritten: Set<string>;
}

function walkConditions(conds: Condition[] | undefined, fn: (c: Condition) => void): void {
  for (const c of conds ?? []) fn(c);
}

/** Valida todo el contenido y devuelve los paquetes ya tipados. */
export function validateContent(raw: RawContent): ValidationResult {
  const col = new Collector();
  const result: ValidationResult = { issues: col.issues, ok: false, episodes: {} };

  const index = col.parse(ContentIndexSchema, raw.index, 'content/index.json');
  const personajes = col.parse(PersonajesSchema, raw.personajes, 'content/personajes.json');
  const codice: Record<string, CodiceEntry> = {};
  for (const [file, data] of Object.entries(raw.codice)) {
    const entries = col.parse(CodiceFileSchema, data, `content/codice/${file}`);
    for (const e of entries ?? []) {
      if (codice[e.id])
        col.error(`content/codice/${file}`, `entrada duplicada del Códice: ${e.id}`);
      codice[e.id] = e;
    }
  }
  if (!index || !personajes) return result;

  result.index = index;
  result.personajes = personajes;
  result.codice = codice;
  const interpelaciones =
    raw.interpelaciones === undefined
      ? []
      : (col.parse(InterpelacionesSchema, raw.interpelaciones, 'content/interpelaciones.json') ??
        []);
  for (const i of interpelaciones) {
    if (!codice[i.articulo])
      col.error('content/interpelaciones.json', `${i.id}: artículo desconocido ${i.articulo}`);
    if (!i.opciones.includes(i.articulo))
      col.error(
        'content/interpelaciones.json',
        `${i.id}: el artículo correcto no está entre las opciones`,
      );
    for (const o of i.opciones)
      if (!codice[o]) col.error('content/interpelaciones.json', `${i.id}: opción desconocida ${o}`);
  }
  result.interpelaciones = interpelaciones;

  const g: GlobalRefs = {
    codice: new Set(Object.keys(codice)),
    personajes: new Set(personajes.map((p) => p.id)),
    regiones: new Set(index.regiones.map((r) => r.id)),
    episodes: new Set(index.episodes.map((e) => e.id)),
    evidenceAll: new Set(),
    flagsWritten: new Set(),
  };
  if (!g.personajes.has('narrador'))
    col.warn('content/personajes.json', 'no existe el personaje `narrador`');

  const seenIds = new Set<string>();
  for (const e of index.episodes) {
    if (seenIds.has(e.id)) col.error('content/index.json', `episodio duplicado: ${e.id}`);
    seenIds.add(e.id);
    if (!g.regiones.has(e.region))
      col.error('content/index.json', `episodio ${e.id}: región desconocida ${e.region}`);
    if (!raw.episodes.some((r) => r.id === e.id))
      col.error('content/index.json', `episodio ${e.id} listado pero sin carpeta content/${e.id}/`);
  }
  for (const r of raw.episodes) {
    if (!g.episodes.has(r.id))
      col.error(`content/${r.id}`, 'carpeta de episodio no listada en index.json');
  }

  // Primera pasada: recoger todos los flags escritos y evidencias (referencias cruzadas entre episodios).
  const parsed: { raw: RawEpisode; ep: ValidatedEpisode; refs: EpisodeRefs }[] = [];
  for (const entry of index.episodes) {
    const rawEp = raw.episodes.find((r) => r.id === entry.id);
    if (!rawEp) continue;
    const ep = parseEpisode(rawEp, col);
    if (!ep) continue;
    const refs = collectRefs(ep, col, rawEp.id);
    for (const id of refs.evidence) g.evidenceAll.add(id);
    collectWrittenFlags(ep, g.flagsWritten);
    parsed.push({ raw: rawEp, ep, refs });
  }

  // Segunda pasada: referencias.
  for (const { raw: rawEp, ep, refs } of parsed) {
    checkEpisodeRefs(rawEp.id, ep, refs, g, col);
    result.episodes[rawEp.id] = ep;
  }

  result.ok = col.issues.every((i) => i.severity !== 'error');
  return result;
}

function parseEpisode(rawEp: RawEpisode, col: Collector): ValidatedEpisode | undefined {
  const base = `content/${rawEp.id}`;
  const manifest = col.parse(EpisodeManifestSchema, rawEp.manifest, `${base}/manifest.json`);
  if (!manifest) return undefined;
  if (manifest.id !== rawEp.id)
    col.error(`${base}/manifest.json`, `id ${manifest.id} no coincide con la carpeta ${rawEp.id}`);

  const ep: ValidatedEpisode = {
    manifest,
    dialogues: {},
    evidence: {},
    audiencias: {},
    pactos: {},
    consultas: {},
    cutscenes: {},
    maps: {},
  };

  for (const [file, data] of Object.entries(rawEp.dialogues)) {
    const d = col.parse(DialogueSchema, data, `${base}/dialogues/${file}`);
    if (!d) continue;
    if (ep.dialogues[d.id]) col.error(`${base}/dialogues/${file}`, `diálogo duplicado ${d.id}`);
    ep.dialogues[d.id] = d;
  }
  const evidences = col.parse(EvidencesSchema, rawEp.evidence, `${base}/evidence.json`) ?? [];
  for (const e of evidences) {
    if (ep.evidence[e.id]) col.error(`${base}/evidence.json`, `evidencia duplicada ${e.id}`);
    ep.evidence[e.id] = e;
  }
  for (const [file, data] of Object.entries(rawEp.audiencias)) {
    const a = col.parse(AudienciaSchema, data, `${base}/audiencias/${file}`);
    if (a) ep.audiencias[a.id] = a;
  }
  for (const [file, data] of Object.entries(rawEp.pactos)) {
    const p = col.parse(PactoSchema, data, `${base}/pactos/${file}`);
    if (p) ep.pactos[p.id] = p;
  }
  const consultas = col.parse(ConsultasSchema, rawEp.consultas, `${base}/consultas.json`) ?? [];
  for (const c of consultas) {
    if (ep.consultas[c.id]) col.error(`${base}/consultas.json`, `consulta duplicada ${c.id}`);
    ep.consultas[c.id] = c;
    const correctas = c.opciones.filter((o) => o.correcta).length;
    if (correctas !== 1)
      col.error(
        `${base}/consultas.json`,
        `consulta ${c.id}: debe tener exactamente una opción correcta`,
      );
  }
  for (const [file, data] of Object.entries(rawEp.cutscenes)) {
    const c = col.parse(CutsceneSchema, data, `${base}/cutscenes/${file}`);
    if (c) ep.cutscenes[c.id] = c;
  }
  for (const [file, data] of Object.entries(rawEp.maps)) {
    const m = col.parse(TiledMapSchema, data, `${base}/maps/${file}`);
    if (m) ep.maps[file.replace(/\.json$/, '')] = m;
  }
  return ep;
}

function collectRefs(ep: ValidatedEpisode, col: Collector, epId: string): EpisodeRefs {
  const refs: EpisodeRefs = {
    dialogues: new Set(Object.keys(ep.dialogues)),
    evidence: new Set(Object.keys(ep.evidence)),
    audiencias: new Set(Object.keys(ep.audiencias)),
    pactos: new Set(Object.keys(ep.pactos)),
    consultas: new Set(Object.keys(ep.consultas)),
    cutscenes: new Set(Object.keys(ep.cutscenes)),
    maps: new Set(Object.keys(ep.maps)),
    spawns: new Map(),
    beats: new Set(ep.manifest.beats.map((b) => b.id)),
  };
  for (const [name, map] of Object.entries(ep.maps)) {
    const spawns = new Set<string>();
    const objLayer = map.layers.find((l) => l.name === OBJECT_LAYER && l.type === 'objectgroup');
    for (const o of objLayer?.objects ?? []) {
      if (tiledObjectType(o) === 'spawn' && o.name) spawns.add(o.name);
    }
    refs.spawns.set(name, spawns);
  }
  const dup = ep.manifest.beats.map((b) => b.id).filter((id, i, arr) => arr.indexOf(id) !== i);
  for (const d of dup) col.error(`content/${epId}/manifest.json`, `beat duplicado ${d}`);
  return refs;
}

function collectWrittenFlags(ep: ValidatedEpisode, out: Set<string>): void {
  for (const k of Object.keys(ep.manifest.flagsInit)) out.add(k);
  const fromActions = (actions: Action[] | undefined): void => {
    for (const a of actions ?? []) if (a.type === 'setFlag') out.add(a.flag);
  };
  for (const b of ep.manifest.beats) fromActions(b.actions);
  for (const d of Object.values(ep.dialogues)) {
    for (const n of d.nodes) {
      fromActions(n.effects);
      for (const c of n.choices ?? []) fromActions(c.effects);
    }
  }
  for (const p of Object.values(ep.pactos)) {
    for (const pt of p.puntos) for (const c of pt.clausulas) fromActions(c.efectos);
  }
  // Flags que escribe el propio motor.
  for (const a of Object.values(ep.audiencias)) out.add(`audiencia.${a.id}.ganada`);
  for (const p of Object.values(ep.pactos)) out.add(`pacto.${p.id}.firmado`);
  for (const p of Object.values(ep.pactos)) out.add(`pacto.${p.id}.equilibrio`);
}

function checkEpisodeRefs(
  epId: string,
  ep: ValidatedEpisode,
  refs: EpisodeRefs,
  g: GlobalRefs,
  col: Collector,
): void {
  const base = `content/${epId}`;
  const m = ep.manifest;
  const where = `${base}/manifest.json`;

  if (!g.regiones.has(m.region)) col.error(where, `región desconocida ${m.region}`);
  for (const map of m.maps)
    if (!refs.maps.has(map)) col.error(where, `mapa ${map} no existe en ${base}/maps/`);
  for (const map of refs.maps)
    if (!m.maps.includes(map)) col.warn(where, `mapa ${map} existe pero no está listado en maps`);
  if (!refs.maps.has(m.entry.map)) col.error(where, `entry.map ${m.entry.map} no existe`);
  else if (!refs.spawns.get(m.entry.map)?.has(m.entry.spawn))
    col.error(where, `entry.spawn ${m.entry.spawn} no existe en el mapa ${m.entry.map}`);
  for (const c of m.party) if (!g.personajes.has(c)) col.error(where, `compañero desconocido ${c}`);
  for (const c of m.codice)
    if (!g.codice.has(c)) col.error(where, `entrada del Códice desconocida ${c}`);
  if (m.ending.cutscene && !refs.cutscenes.has(m.ending.cutscene))
    col.error(where, `cinemática final ${m.ending.cutscene} no existe`);
  if (m.ending.nextEpisode && !g.episodes.has(m.ending.nextEpisode))
    col.error(where, `nextEpisode ${m.ending.nextEpisode} no existe`);
  const hitos = [...m.legitimidad.hitos].map((h) => h.at);
  if (hitos.some((v, i) => i > 0 && v <= (hitos[i - 1] ?? -1)))
    col.error(where, 'los hitos de legitimidad deben ir en orden ascendente');

  const checkCondition = (c: Condition, w: string): void => {
    if ('flag' in c) {
      if (!g.flagsWritten.has(c.flag)) col.error(w, `flag leído pero nunca escrito: ${c.flag}`);
    } else if ('hasEvidence' in c) {
      if (!g.evidenceAll.has(c.hasEvidence)) col.error(w, `evidencia desconocida ${c.hasEvidence}`);
    } else if ('notEvidence' in c) {
      if (!g.evidenceAll.has(c.notEvidence)) col.error(w, `evidencia desconocida ${c.notEvidence}`);
    } else if ('inParty' in c) {
      if (!g.personajes.has(c.inParty)) col.error(w, `compañero desconocido ${c.inParty}`);
    } else if ('hasCodice' in c) {
      if (!g.codice.has(c.hasCodice)) col.error(w, `entrada del Códice desconocida ${c.hasCodice}`);
    }
  };

  const checkAction = (a: Action, w: string): void => {
    switch (a.type) {
      case 'dialogue':
        if (!refs.dialogues.has(a.id)) col.error(w, `diálogo desconocido ${a.id}`);
        break;
      case 'cutscene':
        if (!refs.cutscenes.has(a.id)) col.error(w, `cinemática desconocida ${a.id}`);
        break;
      case 'addEvidence':
      case 'removeEvidence':
        if (!refs.evidence.has(a.id))
          col.error(w, `evidencia desconocida ${a.id} (debe estar en ${base}/evidence.json)`);
        break;
      case 'unlockCodice':
        if (!g.codice.has(a.id)) col.error(w, `entrada del Códice desconocida ${a.id}`);
        break;
      case 'registrarVoz':
        if (!refs.evidence.has(a.id))
          col.error(w, `testimonio ${a.id} debe existir como evidencia de tipo testimonio`);
        else if (ep.evidence[a.id]?.tipo !== 'testimonio')
          col.error(w, `registrarVoz ${a.id}: la evidencia no es de tipo testimonio`);
        break;
      case 'legitimidad':
        if (a.region && !g.regiones.has(a.region)) col.error(w, `región desconocida ${a.region}`);
        break;
      case 'startAudiencia':
        if (!refs.audiencias.has(a.id)) col.error(w, `audiencia desconocida ${a.id}`);
        break;
      case 'startPacto':
        if (!refs.pactos.has(a.id)) col.error(w, `pacto desconocido ${a.id}`);
        break;
      case 'setMapState':
        if (!refs.maps.has(a.map)) col.error(w, `mapa desconocido ${a.map}`);
        break;
      case 'teleport':
        if (!refs.maps.has(a.map)) col.error(w, `mapa desconocido ${a.map}`);
        else if (!refs.spawns.get(a.map)?.has(a.spawn))
          col.error(w, `spawn ${a.spawn} no existe en ${a.map}`);
        break;
      case 'joinParty':
      case 'leaveParty':
      case 'confianza':
        if (!g.personajes.has(a.companion)) col.error(w, `compañero desconocido ${a.companion}`);
        break;
      default:
        break;
    }
  };

  // Beats
  for (const b of m.beats) {
    const w = `${where} beat ${b.id}`;
    const t = b.trigger;
    if (t.type === 'enterMap' && !refs.maps.has(t.map)) col.error(w, `mapa desconocido ${t.map}`);
    if (t.type === 'flag' && !g.flagsWritten.has(t.flag))
      col.error(w, `flag leído pero nunca escrito: ${t.flag}`);
    if (t.type === 'evidence' && !g.evidenceAll.has(t.id))
      col.error(w, `evidencia desconocida ${t.id}`);
    if (t.type === 'audienciaWon' && !refs.audiencias.has(t.id))
      col.error(w, `audiencia desconocida ${t.id}`);
    if (t.type === 'pactoSigned' && !refs.pactos.has(t.id))
      col.error(w, `pacto desconocido ${t.id}`);
    walkConditions(b.requires, (c) => checkCondition(c, w));
    for (const a of b.actions) checkAction(a, w);
  }

  // Diálogos
  for (const d of Object.values(ep.dialogues)) {
    const w = `${base}/dialogues (${d.id})`;
    const nodeIds = new Set(d.nodes.map((n) => n.id));
    const dupNodes = d.nodes.map((n) => n.id).filter((id, i, arr) => arr.indexOf(id) !== i);
    for (const id of dupNodes) col.error(w, `nodo duplicado ${id}`);
    for (const n of d.nodes) {
      if (!g.personajes.has(n.speaker))
        col.error(w, `nodo ${n.id}: personaje desconocido ${n.speaker}`);
      if (n.text.length > SOFT_DIALOGUE_TEXT)
        col.warn(
          w,
          `nodo ${n.id}: texto de ${n.text.length} caracteres (máximo recomendado ${SOFT_DIALOGUE_TEXT})`,
        );
      if (n.next && !nodeIds.has(n.next)) col.error(w, `nodo ${n.id}: next ${n.next} no existe`);
      if (n.next && n.choices) col.error(w, `nodo ${n.id}: no puede tener next y choices a la vez`);
      if (n.consulta && !refs.consultas.has(n.consulta))
        col.error(w, `nodo ${n.id}: consulta desconocida ${n.consulta}`);
      if (n.testimonio && !refs.evidence.has(n.testimonio.id))
        col.error(
          w,
          `nodo ${n.id}: el testimonio ${n.testimonio.id} debe existir en evidence.json como tipo testimonio`,
        );
      walkConditions(n.requires, (c) => checkCondition(c, `${w} nodo ${n.id}`));
      for (const a of n.effects ?? []) checkAction(a, `${w} nodo ${n.id}`);
      for (const ch of n.choices ?? []) {
        if (ch.next && !nodeIds.has(ch.next))
          col.error(w, `nodo ${n.id}: opción «${ch.text}» apunta a ${ch.next}, que no existe`);
        walkConditions(ch.requires, (c) => checkCondition(c, `${w} nodo ${n.id}`));
        for (const a of ch.effects ?? []) checkAction(a, `${w} nodo ${n.id}`);
      }
    }
  }

  // Consultas
  for (const c of Object.values(ep.consultas)) {
    if (c.codice && !g.codice.has(c.codice))
      col.error(
        `${base}/consultas.json`,
        `consulta ${c.id}: entrada del Códice desconocida ${c.codice}`,
      );
  }

  // Audiencias
  for (const a of Object.values(ep.audiencias)) {
    const w = `${base}/audiencias (${a.id})`;
    const afirmacionIds = new Set<string>();
    const evidenceScope = a.zurronGlobal ? g.evidenceAll : refs.evidence;
    if (!g.personajes.has(a.adversario.id))
      col.error(w, `adversario desconocido ${a.adversario.id}`);
    for (const k of Object.keys(a.facultades)) {
      if (!m.party.includes(k))
        col.warn(w, `facultad de ${k} definida pero ${k} no está en party del episodio`);
    }
    for (const r of a.rondas) {
      for (const af of r.afirmaciones) {
        if (afirmacionIds.has(af.id)) col.error(w, `afirmación duplicada ${af.id}`);
        afirmacionIds.add(af.id);
        const s = af.solucion;
        if (s.tipo === 'hecho' || s.tipo === 'combinacion') {
          for (const e of s.evidencia)
            if (!evidenceScope.has(e))
              col.error(w, `afirmación ${af.id}: evidencia desconocida ${e}`);
        }
        if (s.tipo === 'norma' || s.tipo === 'combinacion') {
          for (const c of s.codice)
            if (!g.codice.has(c))
              col.error(w, `afirmación ${af.id}: entrada del Códice desconocida ${c}`);
        }
        if (s.tipo === 'combinacion' && s.parcial) {
          for (const e of s.parcial.evidencia ?? [])
            if (!evidenceScope.has(e))
              col.error(w, `afirmación ${af.id}: evidencia parcial desconocida ${e}`);
          for (const c of s.parcial.codice ?? [])
            if (!g.codice.has(c))
              col.error(w, `afirmación ${af.id}: norma parcial desconocida ${c}`);
        }
        if (s.tipo === 'cierta' && af.respuestas.parcial)
          col.warn(w, `afirmación ${af.id}: una afirmación cierta no usa respuesta parcial`);
        if (
          s.tipo !== 'combinacion' &&
          af.respuestas.parcial === undefined &&
          s.tipo !== 'cierta'
        ) {
          // hecho/norma pueden tener parcial si la autoría lo desea; no es error.
        }
        if (af.repasa && !g.episodes.has(af.repasa))
          col.error(w, `afirmación ${af.id}: repasa un episodio desconocido ${af.repasa}`);
        for (const p of af.presionar ?? []) {
          if (p.revela?.evidencia && !refs.evidence.has(p.revela.evidencia))
            col.error(
              w,
              `afirmación ${af.id}: presionar revela evidencia desconocida ${p.revela.evidencia}`,
            );
        }
      }
      if (r.maniobra) {
        if (r.maniobra.respuestaNorma && !g.codice.has(r.maniobra.respuestaNorma))
          col.error(w, `maniobra ${r.maniobra.id}: norma desconocida ${r.maniobra.respuestaNorma}`);
        if (r.maniobra.tras && !r.afirmaciones.some((x) => x.id === r.maniobra?.tras))
          col.error(
            w,
            `maniobra ${r.maniobra.id}: 'tras' apunta a una afirmación que no está en la ronda`,
          );
      }
    }
    for (const r of a.rondas) {
      for (const af of r.afirmaciones) {
        for (const p of af.presionar ?? []) {
          if (p.revela?.afirmacion && !afirmacionIds.has(p.revela.afirmacion))
            col.error(
              w,
              `afirmación ${af.id}: presionar revela afirmación desconocida ${p.revela.afirmacion}`,
            );
        }
      }
    }
    const revealed = new Set<string>();
    for (const r of a.rondas)
      for (const af of r.afirmaciones)
        for (const p of af.presionar ?? [])
          if (p.revela?.afirmacion) revealed.add(p.revela.afirmacion);
    for (const r of a.rondas)
      for (const af of r.afirmaciones)
        if (af.oculta && !revealed.has(af.id))
          col.error(w, `afirmación ${af.id} está oculta pero nada la revela`);
    if (a.invocacion) {
      if (!afirmacionIds.has(a.invocacion.afirmacion))
        col.error(w, `invocación: afirmación desconocida ${a.invocacion.afirmacion}`);
      if (!a.invocacion.opciones.includes(a.invocacion.correcta))
        col.error(w, 'invocación: la respuesta correcta no está entre las opciones');
      for (const o of a.invocacion.opciones)
        if (!g.codice.has(o)) col.error(w, `invocación: entrada del Códice desconocida ${o}`);
    }
    for (const [k, id] of Object.entries(a.final)) {
      if (!refs.dialogues.has(id)) col.error(w, `final.${k}: diálogo desconocido ${id}`);
    }
    const tieneRepaso = a.rondas.some((r) => r.afirmaciones.some((af) => af.repasa));
    if (!tieneRepaso && epId !== 'gym' && epId !== 'ep00')
      col.warn(w, 'ninguna afirmación repasa un episodio anterior (regla de autoría 4)');
  }

  // Pactos
  for (const p of Object.values(ep.pactos)) {
    const w = `${base}/pactos (${p.id})`;
    const partes = new Set(p.partes.map((x) => x.id));
    if (p.region && !g.regiones.has(p.region)) col.error(w, `región desconocida ${p.region}`);
    for (const pt of p.puntos) {
      if (!pt.clausulas.some((c) => c.legal))
        col.error(w, `punto ${pt.id}: ninguna cláusula válida`);
      if (!pt.clausulas.some((c) => c.legal && c.justicia >= 2))
        col.warn(w, `punto ${pt.id}: ninguna cláusula válida con justicia ≥ 2`);
      for (const c of pt.clausulas) {
        for (const k of Object.keys(c.intereses))
          if (!partes.has(k))
            col.error(w, `cláusula ${c.id}: interés de una parte desconocida ${k}`);
        if (c.nula && !g.codice.has(c.nula.norma))
          col.warn(w, `cláusula ${c.id}: la norma ${c.nula.norma} no está en el Códice`);
        for (const a of c.efectos ?? []) checkAction(a, `${w} cláusula ${c.id}`);
      }
    }
  }

  // Mapas
  for (const [name, map] of Object.entries(ep.maps)) {
    const w = `${base}/maps/${name}.json`;
    const tileLayers = map.layers.filter((l) => l.type === 'tilelayer');
    for (const req of REQUIRED_TILE_LAYERS) {
      if (!tileLayers.some((l) => l.name === req)) col.error(w, `falta la capa de tiles «${req}»`);
    }
    for (const l of tileLayers) {
      if (l.data && l.data.length !== map.width * map.height)
        col.error(
          w,
          `capa ${l.name}: data tiene ${l.data.length} celdas, se esperaban ${map.width * map.height}`,
        );
    }
    const objLayer = map.layers.find((l) => l.name === OBJECT_LAYER);
    if (!objLayer || objLayer.type !== 'objectgroup') {
      col.error(w, `falta la capa de objetos «${OBJECT_LAYER}»`);
      continue;
    }
    const names = new Set<string>();
    for (const o of objLayer.objects ?? []) {
      const type = tiledObjectType(o);
      const ow = `${w} objeto ${o.name || o.id}`;
      if (!(OBJECT_TYPES as readonly string[]).includes(type)) {
        col.error(ow, `tipo de objeto desconocido «${type}»`);
        continue;
      }
      if (o.name) {
        if (names.has(o.name)) col.error(ow, `nombre de objeto duplicado ${o.name}`);
        names.add(o.name);
      }
      switch (type) {
        case 'spawn':
          if (!o.name) col.error(ow, 'spawn sin nombre');
          break;
        case 'npc': {
          const pid = tiledProp(o, 'personaje');
          const dlg = tiledProp(o, 'dialogo');
          if (!pid || !g.personajes.has(pid))
            col.error(ow, `npc con personaje desconocido ${pid ?? '(vacío)'}`);
          if (!dlg || !refs.dialogues.has(dlg))
            col.error(ow, `npc con diálogo desconocido ${dlg ?? '(vacío)'}`);
          break;
        }
        case 'evidence': {
          const id = tiledProp(o, 'evidencia');
          if (!id || !refs.evidence.has(id))
            col.error(ow, `evidencia desconocida ${id ?? '(vacío)'}`);
          break;
        }
        case 'folio': {
          const id = tiledProp(o, 'codice');
          if (!id || !g.codice.has(id))
            col.error(ow, `folio con entrada desconocida ${id ?? '(vacío)'}`);
          break;
        }
        case 'door': {
          const target = tiledProp(o, 'mapa');
          const spawn = tiledProp(o, 'spawn');
          if (!target || !refs.maps.has(target))
            col.error(ow, `puerta hacia mapa desconocido ${target ?? '(vacío)'}`);
          else if (!spawn || !refs.spawns.get(target)?.has(spawn))
            col.error(ow, `puerta hacia spawn desconocido ${spawn ?? '(vacío)'} en ${target}`);
          const req = tiledProp(o, 'requiereEvidencia');
          if (req && !g.evidenceAll.has(req))
            col.error(ow, `puerta requiere evidencia desconocida ${req}`);
          const reqFlag = tiledProp(o, 'requiereFlag');
          if (reqFlag && !g.flagsWritten.has(reqFlag))
            col.error(ow, `puerta requiere flag nunca escrito ${reqFlag}`);
          break;
        }
        case 'trigger': {
          const beat = tiledProp(o, 'beat');
          if (!beat || !refs.beats.has(beat))
            col.error(ow, `trigger hacia beat desconocido ${beat ?? '(vacío)'}`);
          break;
        }
        case 'patrol': {
          if (!o.polyline || o.polyline.length < 2) col.error(ow, 'patrulla sin polilínea de ruta');
          const rango = tiledProp(o, 'rango') ?? 'alguacil';
          if (!['alguacil', 'alguacil-mayor', 'capitan'].includes(rango))
            col.error(ow, `rango desconocido ${rango}`);
          break;
        }
        case 'mesa': {
          const pacto = tiledProp(o, 'pacto');
          if (pacto && !refs.pactos.has(pacto))
            col.error(ow, `mesa con pacto desconocido ${pacto}`);
          break;
        }
        default:
          break;
      }
    }
    // Todo trigger de beat de tipo interact debe existir como objeto en algún mapa del episodio.
  }
  for (const b of m.beats) {
    if (b.trigger.type === 'interact') {
      const obj = b.trigger.object;
      const exists = Object.values(ep.maps).some((map) =>
        map.layers.some(
          (l) => l.name === OBJECT_LAYER && (l.objects ?? []).some((o) => o.name === obj),
        ),
      );
      if (!exists)
        col.error(
          `${where} beat ${b.id}`,
          `interact: no existe ningún objeto llamado ${obj} en los mapas del episodio`,
        );
    }
  }
}

/** Utilidad para validar una acción suelta (usada por herramientas). */
export function parseAction(raw: unknown): Action {
  return ActionSchema.parse(raw);
}
