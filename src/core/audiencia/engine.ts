import { BALANCE } from '../balance';
import type {
  Afirmacion,
  Audiencia,
  CodiceEntry,
  Evidence,
  Maniobra,
  Ronda,
} from '../content/schema';

/**
 * Motor de la Audiencia Dialéctica (lógica pura). docs/design/03-mecanicas.md §4.
 * `reduce(def, state, action, ctx)` devuelve `{ state, events }`. Nada aquí toca la UI.
 */

export type Modo = 'estudio' | 'normal' | 'jurista';

export interface AudienciaContext {
  evidence: string[];
  codice: string[];
  party: string[];
  cotejadas: string[];
  evidenceDefs: Record<string, Evidence>;
  codiceDefs: Record<string, CodiceEntry>;
  modo: Modo;
}

export type Fase =
  'afirmacion' | 'maniobra' | 'allanamiento' | 'tumulto' | 'sesionLevantada' | 'finAlternativo';

export interface AudienciaState {
  id: string;
  ronda: number;
  afirmacion: number; // índice dentro de las visibles de la ronda
  posicion: number;
  posicionMax: number;
  tension: number;
  credibilidad: number;
  credibilidadMax: number;
  resueltas: string[];
  parcialHecho: string[];
  parcialNorma: string[];
  presiones: Record<string, number>;
  fallos: Record<string, number>;
  reveladas: string[];
  evidenciasGanadas: string[];
  facultadesUsadas: Record<string, number>;
  invocacionUsada: boolean;
  maniobraActiva: string | null;
  maniobrasResueltas: string[];
  fase: Fase;
  rondasCompletadas: number;
  /** Instantánea al inicio de la ronda actual, para reintentar. */
  snapshot: Omit<AudienciaState, 'snapshot'> | null;
}

export type AudienciaAction =
  | { type: 'siguiente' }
  | { type: 'anterior' }
  | { type: 'presionar' }
  | { type: 'presentarHecho'; evidencia: string }
  | { type: 'presentarNorma'; codice: string }
  | { type: 'fundamentar'; evidencia: string; codice: string }
  | { type: 'facultad'; quien: 'pilar' | 'prudencio' | 'gerineldo'; evidencia?: string }
  | { type: 'invocar'; codice: string }
  | { type: 'responderManiobra'; codice: string | null }
  | { type: 'reintentarRonda' };

export type AudienciaEvent =
  | {
      type: 'contradiccion';
      resultado: 'plena' | 'parcial' | 'fallida';
      afirmacion: string;
      texto: string;
      nota?: string;
    }
  | { type: 'presion'; afirmacion: string; texto: string }
  | { type: 'cierta'; afirmacion: string; texto: string }
  | { type: 'afirmacionRevelada'; afirmacion: string }
  | { type: 'evidenciaRevelada'; evidencia: string }
  | { type: 'maniobra'; maniobra: string; texto: string }
  | {
      type: 'maniobraResuelta';
      maniobra: string;
      texto: string;
      conObjecion: boolean;
      costo: number;
    }
  | { type: 'facultad'; quien: string; texto: string }
  | { type: 'invocacion'; correcta: boolean; texto: string }
  | { type: 'medidores'; posicion: number; tension: number; credibilidad: number }
  | { type: 'ronda'; ronda: number }
  | { type: 'fin'; fase: Exclude<Fase, 'afirmacion' | 'maniobra'> }
  | { type: 'pista'; nivel: 1 | 2 | 3; texto: string };

export interface ReduceResult {
  state: AudienciaState;
  events: AudienciaEvent[];
}

const B = BALANCE.audiencia;

// ---------------------------------------------------------------------------
// Consultas de solo lectura
// ---------------------------------------------------------------------------

export function ronda(def: Audiencia, s: AudienciaState): Ronda {
  const r = def.rondas[s.ronda];
  if (!r) throw new Error(`Ronda ${s.ronda} fuera de rango en ${def.id}`);
  return r;
}

/** Afirmaciones visibles de la ronda (las ocultas solo tras ser reveladas). */
export function visibles(def: Audiencia, s: AudienciaState): Afirmacion[] {
  return ronda(def, s).afirmaciones.filter((a) => !a.oculta || s.reveladas.includes(a.id));
}

export function actual(def: Audiencia, s: AudienciaState): Afirmacion | undefined {
  return visibles(def, s)[s.afirmacion];
}

export function pendientes(def: Audiencia, s: AudienciaState): Afirmacion[] {
  return visibles(def, s).filter((a) => !s.resueltas.includes(a.id));
}

export function puedeInvocar(def: Audiencia, s: AudienciaState): boolean {
  const a = actual(def, s);
  return Boolean(
    def.invocacion &&
    a &&
    !s.invocacionUsada &&
    def.invocacion.afirmacion === a.id &&
    !s.resueltas.includes(a.id),
  );
}

export function usosFacultad(
  def: Audiencia,
  s: AudienciaState,
  quien: 'pilar' | 'prudencio' | 'gerineldo',
  ctx: AudienciaContext,
): number {
  if (!ctx.party.includes(quien)) return 0;
  const max = def.facultades[quien] ?? 0;
  return Math.max(0, max - (s.facultadesUsadas[quien] ?? 0));
}

// ---------------------------------------------------------------------------
// Creación
// ---------------------------------------------------------------------------

export function createAudiencia(def: Audiencia, ctx: AudienciaContext): AudienciaState {
  const cred = ctx.modo === 'jurista' ? B.credibilidadJurista : def.credibilidad;
  const tension = Math.min(
    100,
    def.tension.inicial + (ctx.modo === 'jurista' ? B.tensionInicialJurista : 0),
  );
  const base: Omit<AudienciaState, 'snapshot'> = {
    id: def.id,
    ronda: 0,
    afirmacion: 0,
    posicion: def.adversario.posicion,
    posicionMax: def.adversario.posicion,
    tension,
    credibilidad: cred,
    credibilidadMax: cred,
    resueltas: [],
    parcialHecho: [],
    parcialNorma: [],
    presiones: {},
    fallos: {},
    reveladas: [],
    evidenciasGanadas: [],
    facultadesUsadas: {},
    invocacionUsada: false,
    maniobraActiva: null,
    maniobrasResueltas: [],
    fase: 'afirmacion',
    rondasCompletadas: 0,
  };
  const s: AudienciaState = { ...base, snapshot: base };
  const first = def.rondas[0]?.maniobra;
  if (first && !first.tras) return { ...s, maniobraActiva: first.id, fase: 'maniobra' };
  return s;
}

// ---------------------------------------------------------------------------
// Reductor
// ---------------------------------------------------------------------------

function clampMeters(s: AudienciaState): AudienciaState {
  return {
    ...s,
    posicion: Math.max(0, Math.min(s.posicionMax, s.posicion)),
    tension: Math.max(0, Math.min(100, s.tension)),
    credibilidad: Math.max(0, s.credibilidad),
  };
}

function medidores(s: AudienciaState): AudienciaEvent {
  return {
    type: 'medidores',
    posicion: s.posicion,
    tension: s.tension,
    credibilidad: s.credibilidad,
  };
}

/** Comprueba estados finales; en modo Estudio no hay tumulto ni sesión levantada. */
function checkEnd(
  def: Audiencia,
  s: AudienciaState,
  ctx: AudienciaContext,
  events: AudienciaEvent[],
): AudienciaState {
  if (s.posicion <= 0) {
    events.push({ type: 'fin', fase: 'allanamiento' });
    return { ...s, fase: 'allanamiento' };
  }
  if (ctx.modo === 'estudio') return s;
  if (s.tension >= 100) {
    const fase: Fase = def.finAlternativo ? 'finAlternativo' : 'tumulto';
    events.push({ type: 'fin', fase });
    return { ...s, fase };
  }
  if (s.credibilidad <= 0) {
    events.push({ type: 'fin', fase: 'sesionLevantada' });
    return { ...s, fase: 'sesionLevantada' };
  }
  return s;
}

/** Coloca el cursor en la siguiente afirmación pendiente (tras la actual, o la primera). */
function moverAPendiente(def: Audiencia, s: AudienciaState): AudienciaState {
  const vis = visibles(def, s);
  const cur = vis[s.afirmacion];
  if (cur && !s.resueltas.includes(cur.id)) return s;
  const idx = vis.findIndex((a, i) => i > s.afirmacion && !s.resueltas.includes(a.id));
  const idx2 = idx >= 0 ? idx : vis.findIndex((a) => !s.resueltas.includes(a.id));
  return { ...s, afirmacion: idx2 >= 0 ? idx2 : s.afirmacion };
}

function marcarResuelta(
  def: Audiencia,
  s: AudienciaState,
  af: Afirmacion,
  events: AudienciaEvent[],
): AudienciaState {
  let next: AudienciaState = moverAPendiente(def, { ...s, resueltas: [...s.resueltas, af.id] });
  // Maniobra «tras» esta afirmación
  const r = ronda(def, next);
  if (
    r.maniobra &&
    r.maniobra.tras === af.id &&
    !next.maniobrasResueltas.includes(r.maniobra.id) &&
    next.maniobraActiva === null
  ) {
    next = { ...next, maniobraActiva: r.maniobra.id, fase: 'maniobra' };
    events.push({ type: 'maniobra', maniobra: r.maniobra.id, texto: r.maniobra.texto });
    return next;
  }
  // ¿Ronda completa?
  if (pendientes(def, next).length === 0) return avanzarRonda(def, next, events);
  return next;
}

function avanzarRonda(def: Audiencia, s: AudienciaState, events: AudienciaEvent[]): AudienciaState {
  if (s.ronda >= def.rondas.length - 1) {
    // Última ronda completa: si aún queda Posición, el adversario se allana por agotamiento de argumentos.
    events.push({ type: 'fin', fase: 'allanamiento' });
    return { ...s, posicion: 0, fase: 'allanamiento', rondasCompletadas: s.rondasCompletadas + 1 };
  }
  const nextRonda = s.ronda + 1;
  const base: Omit<AudienciaState, 'snapshot'> = {
    ...s,
    snapshot: undefined,
    ronda: nextRonda,
    afirmacion: 0,
    tension: Math.min(100, s.tension + def.tension.provocacionPorRonda),
    credibilidad: s.credibilidadMax,
    rondasCompletadas: s.rondasCompletadas + 1,
    fase: 'afirmacion',
    maniobraActiva: null,
  } as Omit<AudienciaState, 'snapshot'>;
  delete (base as { snapshot?: unknown }).snapshot;
  let next: AudienciaState = { ...base, snapshot: base };
  events.push({ type: 'ronda', ronda: nextRonda });
  const m = def.rondas[nextRonda]?.maniobra;
  if (m && !m.tras) {
    next = { ...next, maniobraActiva: m.id, fase: 'maniobra' };
    events.push({ type: 'maniobra', maniobra: m.id, texto: m.texto });
  }
  return next;
}

function fallida(
  def: Audiencia,
  s: AudienciaState,
  af: Afirmacion,
  texto: string,
  tensionDelta: number,
  events: AudienciaEvent[],
  ctx: AudienciaContext,
): AudienciaState {
  const fallos = (s.fallos[af.id] ?? 0) + 1;
  let next: AudienciaState = clampMeters({
    ...s,
    tension: s.tension + tensionDelta,
    credibilidad: s.credibilidad - 1,
    fallos: { ...s.fallos, [af.id]: fallos },
  });
  events.push({ type: 'contradiccion', resultado: 'fallida', afirmacion: af.id, texto });
  const pista = pistaPara(def, next, af, ctx);
  if (pista) events.push(pista);
  events.push(medidores(next));
  next = checkEnd(def, next, ctx, events);
  return next;
}

function plena(
  def: Audiencia,
  s: AudienciaState,
  af: Afirmacion,
  events: AudienciaEvent[],
  ctx: AudienciaContext,
  dano?: number,
): AudienciaState {
  const d = dano ?? af.danoPosicion ?? B.danoPlena;
  let next: AudienciaState = clampMeters({
    ...s,
    posicion: s.posicion - d,
    tension: s.tension + B.tensionPlena,
  });
  events.push({
    type: 'contradiccion',
    resultado: 'plena',
    afirmacion: af.id,
    texto: af.respuestas.plena,
    nota: af.nota,
  });
  next = marcarResuelta(def, next, af, events);
  events.push(medidores(next));
  return checkEnd(def, next, ctx, events);
}

function parcial(
  def: Audiencia,
  s: AudienciaState,
  af: Afirmacion,
  texto: string,
  events: AudienciaEvent[],
  ctx: AudienciaContext,
): AudienciaState {
  const next: AudienciaState = clampMeters({ ...s, posicion: s.posicion - B.danoParcial });
  events.push({ type: 'contradiccion', resultado: 'parcial', afirmacion: af.id, texto });
  events.push(medidores(next));
  return checkEnd(def, next, ctx, events);
}

/** Pista escalonada tras fallos repetidos (siempre en modo Estudio). */
export function pistaPara(
  def: Audiencia,
  s: AudienciaState,
  af: Afirmacion,
  ctx: AudienciaContext,
): AudienciaEvent | null {
  const fallos = s.fallos[af.id] ?? 0;
  const nivel: 1 | 2 | 3 | 0 =
    ctx.modo === 'estudio' ? 3 : fallos >= 4 ? 3 : fallos >= 3 ? 2 : fallos >= 2 ? 1 : 0;
  if (!nivel) return null;
  const sol = af.solucion;
  const libroDe = (id: string): string => ctx.codiceDefs[id]?.libro ?? 'el Códice';
  const nombreLibro: Record<string, string> = {
    constitucion: 'la Constitución',
    civil: 'el Código Civil',
    comercio: 'el Código de Comercio',
    laboral: 'el Código del Trabajo',
    ph: 'la Ley de Propiedad Horizontal',
    especial: 'una ley especial',
    jurisprudencia: 'la jurisprudencia',
    principios: 'los principios generales',
  };
  if (sol.tipo === 'cierta')
    return {
      type: 'pista',
      nivel,
      texto: 'Lo que dice es verdad. No se contradice: se presiona para que precise.',
    };
  const partes: string[] = [];
  if (sol.tipo === 'hecho' || sol.tipo === 'combinacion') {
    const ev = ctx.evidenceDefs[sol.evidencia[0] ?? ''];
    if (nivel === 1) partes.push('Hay un hecho en el zurrón que lo contradice.');
    else if (nivel === 2)
      partes.push(
        `Busca en el zurrón ${ev ? `un ${ev.tipo}` : 'una evidencia'} relacionado con esto.`,
      );
    else partes.push(`El hecho: ${ev?.nombre ?? sol.evidencia[0]}.`);
  }
  if (sol.tipo === 'norma' || sol.tipo === 'combinacion') {
    const id = sol.codice[0] ?? '';
    const libro = nombreLibro[libroDe(id)] ?? 'el Códice';
    if (nivel === 1) partes.push(`La norma está en ${libro}.`);
    else if (nivel === 2)
      partes.push(
        `Mira las entradas de ${libro} sobre ${(ctx.codiceDefs[id]?.etiquetas ?? []).slice(0, 2).join(' y ') || 'este tema'}.`,
      );
    else partes.push(`La norma: ${ctx.codiceDefs[id]?.referencia ?? id}.`);
  }
  if (sol.tipo === 'combinacion' && nivel >= 2)
    partes.push('Hacen falta el hecho y la norma juntos (Fundamentar).');
  return { type: 'pista', nivel, texto: partes.join(' ') };
}

function evidenciaFalsaSinCotejo(ctx: AudienciaContext, id: string): boolean {
  const ev = ctx.evidenceDefs[id];
  return Boolean(ev && ev.autentico === false && !ctx.cotejadas.includes(id));
}

export function reduce(
  def: Audiencia,
  s: AudienciaState,
  action: AudienciaAction,
  ctx: AudienciaContext,
): ReduceResult {
  const events: AudienciaEvent[] = [];
  if (s.fase !== 'afirmacion' && s.fase !== 'maniobra' && action.type !== 'reintentarRonda')
    return { state: s, events };

  if (action.type === 'reintentarRonda') {
    if (!s.snapshot) return { state: s, events };
    const restored: AudienciaState = {
      ...s.snapshot,
      snapshot: s.snapshot,
      fase: 'afirmacion',
      maniobraActiva: null,
    };
    events.push({ type: 'ronda', ronda: restored.ronda });
    events.push(medidores(restored));
    const m = def.rondas[restored.ronda]?.maniobra;
    if (m && !m.tras && !restored.maniobrasResueltas.includes(m.id)) {
      events.push({ type: 'maniobra', maniobra: m.id, texto: m.texto });
      return { state: { ...restored, maniobraActiva: m.id, fase: 'maniobra' }, events };
    }
    return { state: restored, events };
  }

  // --- Maniobra activa: solo Objeción o responder
  if (s.fase === 'maniobra') {
    const m = ronda(def, s).maniobra as Maniobra;
    const cerrar = (conObjecion: boolean, costo: number, texto: string): ReduceResult => {
      let next: AudienciaState = clampMeters({
        ...s,
        tension: s.tension + costo,
        posicion: s.posicion - (conObjecion ? B.danoObjecion : 0),
        maniobraActiva: null,
        maniobrasResueltas: [...s.maniobrasResueltas, m.id],
        fase: 'afirmacion',
        facultadesUsadas: conObjecion
          ? { ...s.facultadesUsadas, gerineldo: (s.facultadesUsadas.gerineldo ?? 0) + 1 }
          : s.facultadesUsadas,
      });
      events.push({ type: 'maniobraResuelta', maniobra: m.id, texto, conObjecion, costo });
      events.push(medidores(next));
      if (pendientes(def, next).length === 0) next = avanzarRonda(def, next, events);
      else next = moverAPendiente(def, next);
      next = checkEnd(def, next, ctx, events);
      return { state: next, events };
    };
    if (action.type === 'facultad' && action.quien === 'gerineldo') {
      if (usosFacultad(def, s, 'gerineldo', ctx) <= 0) return { state: s, events };
      return cerrar(true, 0, m.objecionTexto);
    }
    if (action.type === 'responderManiobra') {
      if (action.codice && m.respuestaNorma && action.codice === m.respuestaNorma) {
        return cerrar(false, 0, 'La norma responde a la maniobra. El documento no cambia nada.');
      }
      return cerrar(
        false,
        m.costoTension,
        'La sala murmura. El documento queda sobre la mesa sin respuesta.',
      );
    }
    return { state: s, events };
  }

  const af = actual(def, s);
  if (!af) return { state: s, events };
  const vis = visibles(def, s);

  switch (action.type) {
    case 'siguiente':
      return { state: { ...s, afirmacion: (s.afirmacion + 1) % vis.length }, events };
    case 'anterior':
      return { state: { ...s, afirmacion: (s.afirmacion - 1 + vis.length) % vis.length }, events };

    case 'presionar': {
      const n = (s.presiones[af.id] ?? 0) + 1;
      let next: AudienciaState = { ...s, presiones: { ...s.presiones, [af.id]: n } };
      const resp = af.presionar?.[n - 1];
      if (resp) {
        events.push({ type: 'presion', afirmacion: af.id, texto: resp.respuesta });
        if (resp.revela?.afirmacion && !next.reveladas.includes(resp.revela.afirmacion)) {
          next = { ...next, reveladas: [...next.reveladas, resp.revela.afirmacion] };
          events.push({ type: 'afirmacionRevelada', afirmacion: resp.revela.afirmacion });
        }
        if (resp.revela?.evidencia && !next.evidenciasGanadas.includes(resp.revela.evidencia)) {
          next = { ...next, evidenciasGanadas: [...next.evidenciasGanadas, resp.revela.evidencia] };
          events.push({ type: 'evidenciaRevelada', evidencia: resp.revela.evidencia });
        }
      } else {
        events.push({ type: 'presion', afirmacion: af.id, texto: 'No tiene nada más que añadir.' });
        if (n > B.presionesAntesDeTension) {
          next = clampMeters({ ...next, tension: next.tension + B.tensionPresionExcesiva });
          events.push(medidores(next));
        }
      }
      if (
        af.solucion.tipo === 'cierta' &&
        n >= af.solucion.presionesNecesarias &&
        !s.resueltas.includes(af.id)
      ) {
        next = clampMeters({ ...next, posicion: next.posicion - af.solucion.efectoPosicion });
        events.push({ type: 'cierta', afirmacion: af.id, texto: af.respuestas.plena });
        events.push({
          type: 'contradiccion',
          resultado: 'plena',
          afirmacion: af.id,
          texto: af.respuestas.plena,
          nota: af.nota,
        });
        next = marcarResuelta(def, next, af, events);
        events.push(medidores(next));
      }
      next = checkEnd(def, next, ctx, events);
      return { state: next, events };
    }

    case 'presentarHecho':
    case 'presentarNorma':
    case 'fundamentar': {
      if (s.resueltas.includes(af.id)) return { state: s, events };
      const ev = action.type === 'presentarNorma' ? undefined : action.evidencia;
      const norma = action.type === 'presentarHecho' ? undefined : action.codice;
      if (ev && evidenciaFalsaSinCotejo(ctx, ev)) {
        return {
          state: fallida(
            def,
            s,
            af,
            'Ese documento no es lo que parece. Verifica antes de presentar.',
            B.tensionEvidenciaFalsa,
            events,
            ctx,
          ),
          events,
        };
      }
      const sol = af.solucion;
      if (sol.tipo === 'cierta') {
        return {
          state: fallida(def, s, af, af.respuestas.fallida, B.tensionFallida, events, ctx),
          events,
        };
      }
      if (sol.tipo === 'hecho') {
        if (ev && sol.evidencia.includes(ev))
          return { state: plena(def, s, af, events, ctx), events };
        return {
          state: fallida(def, s, af, af.respuestas.fallida, B.tensionFallida, events, ctx),
          events,
        };
      }
      if (sol.tipo === 'norma') {
        if (norma && sol.codice.includes(norma))
          return { state: plena(def, s, af, events, ctx), events };
        return {
          state: fallida(def, s, af, af.respuestas.fallida, B.tensionFallida, events, ctx),
          events,
        };
      }
      // combinación
      const okEv = Boolean(ev && sol.evidencia.includes(ev));
      const okNorma = Boolean(norma && sol.codice.includes(norma));
      const parcialEv = Boolean(ev && sol.parcial?.evidencia?.includes(ev));
      const parcialNorma = Boolean(norma && sol.parcial?.codice?.includes(norma));
      if (okEv && okNorma) return { state: plena(def, s, af, events, ctx), events };
      const yaHecho = s.parcialHecho.includes(af.id);
      const yaNorma = s.parcialNorma.includes(af.id);
      if (okEv && !yaHecho) {
        const next: AudienciaState = { ...s, parcialHecho: [...s.parcialHecho, af.id] };
        if (yaNorma)
          return {
            state: plena(
              def,
              next,
              af,
              events,
              ctx,
              Math.max(0, (af.danoPosicion ?? B.danoPlena) - B.danoParcial),
            ),
            events,
          };
        return {
          state: parcial(
            def,
            next,
            af,
            sol.parcial?.respuesta ?? af.respuestas.parcial ?? '¿Y con eso qué?',
            events,
            ctx,
          ),
          events,
        };
      }
      if (okNorma && !yaNorma) {
        const next: AudienciaState = { ...s, parcialNorma: [...s.parcialNorma, af.id] };
        if (yaHecho)
          return {
            state: plena(
              def,
              next,
              af,
              events,
              ctx,
              Math.max(0, (af.danoPosicion ?? B.danoPlena) - B.danoParcial),
            ),
            events,
          };
        return {
          state: parcial(
            def,
            next,
            af,
            af.respuestas.parcial ?? 'La norma sola no prueba nada.',
            events,
            ctx,
          ),
          events,
        };
      }
      if ((okEv && yaHecho) || (okNorma && yaNorma)) {
        events.push({
          type: 'contradiccion',
          resultado: 'parcial',
          afirmacion: af.id,
          texto: 'Eso ya está dicho. Falta la otra mitad del argumento.',
        });
        return { state: s, events };
      }
      if (parcialEv || parcialNorma) {
        return {
          state: parcial(
            def,
            s,
            af,
            sol.parcial?.respuesta ?? af.respuestas.parcial ?? '¿Y con eso qué?',
            events,
            ctx,
          ),
          events,
        };
      }
      return {
        state: fallida(def, s, af, af.respuestas.fallida, B.tensionFallida, events, ctx),
        events,
      };
    }

    case 'facultad': {
      if (usosFacultad(def, s, action.quien, ctx) <= 0) return { state: s, events };
      const used = {
        ...s.facultadesUsadas,
        [action.quien]: (s.facultadesUsadas[action.quien] ?? 0) + 1,
      };
      if (action.quien === 'pilar') {
        let next: AudienciaState = clampMeters({
          ...s,
          tension: s.tension + B.tensionConvocarTestigo,
          facultadesUsadas: used,
        });
        let texto = 'Pilar pide la palabra por la comunidad. La sala baja la voz.';
        if (
          action.evidencia &&
          !next.evidenciasGanadas.includes(action.evidencia) &&
          !ctx.evidence.includes(action.evidencia)
        ) {
          next = { ...next, evidenciasGanadas: [...next.evidenciasGanadas, action.evidencia] };
          events.push({ type: 'evidenciaRevelada', evidencia: action.evidencia });
          texto = `Pilar convoca un testimonio: ${ctx.evidenceDefs[action.evidencia]?.nombre ?? action.evidencia}.`;
        }
        events.push({ type: 'facultad', quien: 'pilar', texto });
        events.push(medidores(next));
        return { state: next, events };
      }
      if (action.quien === 'prudencio') {
        const doc = af.documentoFalso;
        if (!doc) {
          events.push({
            type: 'facultad',
            quien: 'prudencio',
            texto: 'Prudencio revisa el documento. «Este es auténtico. No hay nada que exponer.»',
          });
          return { state: { ...s, facultadesUsadas: used }, events };
        }
        let next: AudienciaState = clampMeters({
          ...s,
          posicion: s.posicion - B.danoCotejo,
          facultadesUsadas: used,
        });
        events.push({
          type: 'facultad',
          quien: 'prudencio',
          texto: `Prudencio expone el documento: ${ctx.evidenceDefs[doc]?.cotejo?.revela ?? 'la tinta y el folio no coinciden.'}`,
        });
        events.push({
          type: 'contradiccion',
          resultado: 'plena',
          afirmacion: af.id,
          texto: af.respuestas.plena,
          nota: af.nota,
        });
        next = marcarResuelta(def, next, af, events);
        events.push(medidores(next));
        return { state: checkEnd(def, next, ctx, events), events };
      }
      // gerineldo fuera de maniobra: no hace nada
      events.push({
        type: 'facultad',
        quien: 'gerineldo',
        texto: 'Gerineldo: «No hay nada que objetar todavía.»',
      });
      return { state: s, events };
    }

    case 'invocar': {
      if (!puedeInvocar(def, s) || !def.invocacion) return { state: s, events };
      const correcta = action.codice === def.invocacion.correcta;
      let next: AudienciaState = clampMeters({
        ...s,
        invocacionUsada: true,
        posicion: s.posicion - (correcta ? B.danoInvocacion : 0),
        tension: s.tension + (correcta ? B.tensionInvocacionPlena : B.tensionInvocacionFallida),
      });
      events.push({
        type: 'invocacion',
        correcta,
        texto: correcta
          ? `Renata invoca ${ctx.codiceDefs[action.codice]?.referencia ?? action.codice}. La sala guarda silencio.`
          : 'La invocación no responde a lo que se discute. La sala se impacienta.',
      });
      if (correcta) {
        events.push({
          type: 'contradiccion',
          resultado: 'plena',
          afirmacion: af.id,
          texto: af.respuestas.plena,
          nota: af.nota,
        });
        next = marcarResuelta(def, next, af, events);
      }
      events.push(medidores(next));
      return { state: checkEnd(def, next, ctx, events), events };
    }

    default:
      return { state: s, events };
  }
}
