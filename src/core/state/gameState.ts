import type { Condition, FlagValue, MapState } from '../content/schema';

/**
 * Estado del juego (lógica pura). Todo cambio pasa por las funciones de este módulo,
 * que devuelven un estado nuevo (inmutable por convención) y no tocan Phaser ni el DOM.
 */

export interface TestimonioRegistrado {
  id: string;
  nombre: string;
  hecho: string;
  fecha: string;
  episodio: string;
}

export interface PactoResultado {
  equilibrio: number;
  clausulas: string[];
  impugnado: boolean;
  fechaJuego: string;
}

export interface GameState {
  version: 1;
  playerName: string;
  episode: string;
  map: string;
  spawn: string;
  flags: Record<string, FlagValue>;
  evidence: string[];
  evidenceCotejada: string[];
  voces: TestimonioRegistrado[];
  codice: string[];
  codiceUsedIn: Record<string, string[]>;
  legitimidad: Record<string, number>;
  mapStates: Record<string, MapState>;
  party: string[];
  confianza: Record<string, number>;
  pactos: Record<string, PactoResultado>;
  beatsDone: string[];
  notas: Record<string, string[]>;
  consultasResueltas: string[];
  foliosLeidos: string[];
  diaDeJuego: number;
}

export interface NewGameOptions {
  playerName?: string;
  episode: string;
  map: string;
  spawn: string;
  flagsInit?: Record<string, FlagValue>;
  party?: string[];
  legitimidadStart?: Record<string, number>;
}

export function createGameState(o: NewGameOptions): GameState {
  return {
    version: 1,
    playerName: o.playerName?.trim() || 'Renata',
    episode: o.episode,
    map: o.map,
    spawn: o.spawn,
    flags: { ...(o.flagsInit ?? {}) },
    evidence: [],
    evidenceCotejada: [],
    voces: [],
    codice: [],
    codiceUsedIn: {},
    legitimidad: { ...(o.legitimidadStart ?? {}) },
    mapStates: {},
    party: [...(o.party ?? [])],
    confianza: {},
    pactos: {},
    beatsDone: [],
    notas: {},
    consultasResueltas: [],
    foliosLeidos: [],
    diaDeJuego: 1,
  };
}

// --- Flags -----------------------------------------------------------------

export function getFlag(s: GameState, flag: string): FlagValue | undefined {
  return s.flags[flag];
}

export function setFlag(s: GameState, flag: string, value: FlagValue): GameState {
  if (s.flags[flag] === value) return s;
  return { ...s, flags: { ...s.flags, [flag]: value } };
}

/** Evalúa una condición contra el estado. Un flag ausente cuenta como `false`/0. */
export function checkCondition(s: GameState, c: Condition): boolean {
  if ('flag' in c) {
    const v = s.flags[c.flag];
    const actual: FlagValue = v === undefined ? (typeof c.value === 'number' ? 0 : false) : v;
    switch (c.op) {
      case 'eq':
        return actual === c.value;
      case 'ne':
        return actual !== c.value;
      case 'gte':
        return typeof actual === 'number' && typeof c.value === 'number' && actual >= c.value;
      case 'lte':
        return typeof actual === 'number' && typeof c.value === 'number' && actual <= c.value;
      default:
        return false;
    }
  }
  if ('hasEvidence' in c) return s.evidence.includes(c.hasEvidence);
  if ('notEvidence' in c) return !s.evidence.includes(c.notEvidence);
  if ('inParty' in c) return s.party.includes(c.inParty);
  if ('hasCodice' in c) return s.codice.includes(c.hasCodice);
  return false;
}

export function checkAll(s: GameState, conds: Condition[] | undefined): boolean {
  return (conds ?? []).every((c) => checkCondition(s, c));
}

// --- Evidencias, testimonios, Códice ----------------------------------------

export function addEvidence(s: GameState, id: string): GameState {
  if (s.evidence.includes(id)) return s;
  return { ...s, evidence: [...s.evidence, id] };
}

export function removeEvidence(s: GameState, id: string): GameState {
  if (!s.evidence.includes(id)) return s;
  return { ...s, evidence: s.evidence.filter((e) => e !== id) };
}

export function markCotejada(s: GameState, id: string): GameState {
  if (s.evidenceCotejada.includes(id)) return s;
  return { ...s, evidenceCotejada: [...s.evidenceCotejada, id] };
}

export function registrarVoz(s: GameState, t: Omit<TestimonioRegistrado, 'episodio'>): GameState {
  if (s.voces.some((v) => v.id === t.id)) return s;
  const next = addEvidence(s, t.id);
  return { ...next, voces: [...next.voces, { ...t, episodio: s.episode }] };
}

export function unlockCodice(s: GameState, id: string): GameState {
  if (s.codice.includes(id)) return s;
  return { ...s, codice: [...s.codice, id] };
}

export function markCodiceUsed(s: GameState, id: string, audienciaId: string): GameState {
  const prev = s.codiceUsedIn[id] ?? [];
  if (prev.includes(audienciaId)) return s;
  return { ...s, codiceUsedIn: { ...s.codiceUsedIn, [id]: [...prev, audienciaId] } };
}

export function markFolioLeido(s: GameState, objectName: string): GameState {
  if (s.foliosLeidos.includes(objectName)) return s;
  return { ...s, foliosLeidos: [...s.foliosLeidos, objectName] };
}

export function markConsultaResuelta(s: GameState, id: string): GameState {
  if (s.consultasResueltas.includes(id)) return s;
  return { ...s, consultasResueltas: [...s.consultasResueltas, id] };
}

// --- Grupo -------------------------------------------------------------------

export function joinParty(s: GameState, id: string): GameState {
  if (s.party.includes(id)) return s;
  return { ...s, party: [...s.party, id] };
}

export function leaveParty(s: GameState, id: string): GameState {
  if (!s.party.includes(id)) return s;
  return { ...s, party: s.party.filter((p) => p !== id) };
}

export function addConfianza(s: GameState, id: string, delta: number): GameState {
  const v = Math.max(0, Math.min(3, (s.confianza[id] ?? 0) + delta));
  return { ...s, confianza: { ...s.confianza, [id]: v } };
}

// --- Posición, beats, notas --------------------------------------------------

export function setLocation(s: GameState, map: string, spawn: string): GameState {
  return { ...s, map, spawn };
}

export function setEpisode(s: GameState, episode: string, map: string, spawn: string): GameState {
  return { ...s, episode, map, spawn };
}

export function markBeatDone(s: GameState, id: string): GameState {
  if (s.beatsDone.includes(id)) return s;
  return { ...s, beatsDone: [...s.beatsDone, id] };
}

export function addNota(s: GameState, episode: string, nota: string): GameState {
  const prev = s.notas[episode] ?? [];
  if (prev.includes(nota)) return s;
  return { ...s, notas: { ...s.notas, [episode]: [...prev, nota] } };
}

export function setMapState(s: GameState, map: string, state: MapState): GameState {
  if (s.mapStates[map] === state) return s;
  return { ...s, mapStates: { ...s.mapStates, [map]: state } };
}

export function setPactoResultado(s: GameState, id: string, r: PactoResultado): GameState {
  return { ...s, pactos: { ...s.pactos, [id]: r } };
}

export function avanzarDia(s: GameState, dias = 1): GameState {
  return { ...s, diaDeJuego: s.diaDeJuego + dias };
}
