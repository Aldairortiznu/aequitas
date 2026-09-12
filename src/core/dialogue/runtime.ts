import type { Action, Dialogue, DialogueNode } from '../content/schema';
import type { GameState } from '../state/gameState';
import { checkAll } from '../state/gameState';

/**
 * Intérprete de diálogos (lógica pura). Un diálogo es una lista de nodos; el nodo de
 * entrada es el primero cuyas condiciones se cumplen. Cada nodo muestra texto y, según el
 * caso, opciones, una Consulta o un testimonio. Los efectos se devuelven para que la app los
 * ejecute; los efectos modales (otra escena, audiencia, pacto) se difieren al cierre.
 */

export interface DialogueState {
  dialogueId: string;
  nodeId: string;
  /** Nodos ya mostrados (para evitar bucles infinitos por autoría). */
  visited: string[];
  /** Fase dentro del nodo actual. */
  phase: 'texto' | 'opciones' | 'consulta' | 'consulta-respuesta' | 'testimonio';
  /** Opción de consulta elegida (índice) cuando la fase es consulta-respuesta. */
  consultaElegida?: number;
}

export interface StepResult {
  state: DialogueState | null; // null = diálogo terminado
  effects: Action[]; // efectos inmediatos (flags, evidencias, legitimidad…)
  deferred: Action[]; // efectos modales que se ejecutan al cerrar el diálogo
  events: DialogueEvent[];
}

export type DialogueEvent =
  | { type: 'consulta'; id: string; correcta: boolean }
  | { type: 'testimonio'; id: string }
  | { type: 'fin' };

export const MODAL_ACTIONS = new Set<Action['type']>([
  'dialogue',
  'cutscene',
  'startAudiencia',
  'startPacto',
  'teleport',
  'endEpisode',
]);

export function splitActions(actions: Action[] | undefined): { now: Action[]; later: Action[] } {
  const now: Action[] = [];
  const later: Action[] = [];
  for (const a of actions ?? []) (MODAL_ACTIONS.has(a.type) ? later : now).push(a);
  return { now, later };
}

export function findNode(def: Dialogue, id: string): DialogueNode | undefined {
  return def.nodes.find((n) => n.id === id);
}

function phaseFor(node: DialogueNode): DialogueState['phase'] {
  if (node.consulta) return 'texto';
  if (node.testimonio) return 'texto';
  return 'texto';
}

/**
 * Nodo de entrada. Candidatos: el primer nodo y todo nodo con `requires` explícito
 * (los nodos intermedios sin condiciones no son entradas). Se elige el primer candidato
 * cuyas condiciones se cumplen.
 */
export function entryNode(def: Dialogue, gs: GameState): DialogueNode | undefined {
  return def.nodes.find(
    (n, i) => (i === 0 || n.requires !== undefined) && checkAll(gs, n.requires),
  );
}

export function startDialogue(def: Dialogue, gs: GameState): StepResult {
  const node = entryNode(def, gs);
  if (!node) return { state: null, effects: [], deferred: [], events: [{ type: 'fin' }] };
  const { now, later } = splitActions(node.effects);
  return {
    state: { dialogueId: def.id, nodeId: node.id, visited: [node.id], phase: phaseFor(node) },
    effects: now,
    deferred: later,
    events: [],
  };
}

export function currentNode(def: Dialogue, ds: DialogueState): DialogueNode {
  const n = findNode(def, ds.nodeId);
  if (!n) throw new Error(`Nodo ${ds.nodeId} no existe en ${def.id}`);
  return n;
}

/** Opciones visibles del nodo actual (filtradas por condiciones). */
export function availableChoices(def: Dialogue, ds: DialogueState, gs: GameState) {
  const node = currentNode(def, ds);
  return (node.choices ?? [])
    .map((c, index) => ({ ...c, index }))
    .filter((c) => checkAll(gs, c.requires));
}

function goTo(
  def: Dialogue,
  ds: DialogueState,
  nextId: string | undefined,
  gs: GameState,
): StepResult {
  if (!nextId) return { state: null, effects: [], deferred: [], events: [{ type: 'fin' }] };
  const node = findNode(def, nextId);
  if (!node) return { state: null, effects: [], deferred: [], events: [{ type: 'fin' }] };
  if (ds.visited.filter((v) => v === nextId).length > 3) {
    // Protección contra bucles de autoría.
    return { state: null, effects: [], deferred: [], events: [{ type: 'fin' }] };
  }
  void gs;
  const { now, later } = splitActions(node.effects);
  return {
    state: {
      dialogueId: def.id,
      nodeId: node.id,
      visited: [...ds.visited, node.id],
      phase: phaseFor(node),
    },
    effects: now,
    deferred: later,
    events: [],
  };
}

/**
 * Avanza el diálogo. `input` depende de la fase:
 * - texto: undefined (continuar). Si el nodo tiene opciones, pasa a `opciones`; si tiene
 *   consulta, a `consulta`; si tiene testimonio, a `testimonio`; si no, va a `next`.
 * - opciones: índice de la opción elegida (dentro de las disponibles).
 * - consulta: índice de la opción de la consulta.
 * - consulta-respuesta: undefined (continuar a `next`).
 * - testimonio: 'registrar' | 'omitir'.
 */
export function advance(
  def: Dialogue,
  ds: DialogueState,
  gs: GameState,
  input?: number | 'registrar' | 'omitir',
  consultaLookup?: (
    id: string,
  ) => { opciones: { correcta: boolean }[]; codice?: string } | undefined,
): StepResult {
  const node = currentNode(def, ds);
  switch (ds.phase) {
    case 'texto': {
      if (node.choices && availableChoices(def, ds, gs).length > 0) {
        return { state: { ...ds, phase: 'opciones' }, effects: [], deferred: [], events: [] };
      }
      if (node.consulta)
        return { state: { ...ds, phase: 'consulta' }, effects: [], deferred: [], events: [] };
      if (node.testimonio)
        return { state: { ...ds, phase: 'testimonio' }, effects: [], deferred: [], events: [] };
      return goTo(def, ds, node.next, gs);
    }
    case 'opciones': {
      const choices = availableChoices(def, ds, gs);
      const chosen = typeof input === 'number' ? choices[input] : undefined;
      if (!chosen) return { state: ds, effects: [], deferred: [], events: [] };
      const { now, later } = splitActions(chosen.effects);
      const next = goTo(def, ds, chosen.next, gs);
      return {
        ...next,
        effects: [...now, ...next.effects],
        deferred: [...later, ...next.deferred],
      };
    }
    case 'consulta': {
      if (typeof input !== 'number' || !node.consulta)
        return { state: ds, effects: [], deferred: [], events: [] };
      const c = consultaLookup?.(node.consulta);
      const correcta = c?.opciones[input]?.correcta ?? false;
      const effects: Action[] = [];
      if (correcta) {
        effects.push({ type: 'legitimidad', delta: 3, fuente: 'consulta' });
        if (c?.codice) effects.push({ type: 'unlockCodice', id: c.codice });
      }
      return {
        state: { ...ds, phase: 'consulta-respuesta', consultaElegida: input },
        effects,
        deferred: [],
        events: [{ type: 'consulta', id: node.consulta, correcta }],
      };
    }
    case 'consulta-respuesta': {
      const c = node.consulta ? consultaLookup?.(node.consulta) : undefined;
      const correcta =
        ds.consultaElegida !== undefined && (c?.opciones[ds.consultaElegida]?.correcta ?? false);
      if (!correcta) {
        // Volver a preguntar sin penalización.
        return {
          state: { ...ds, phase: 'consulta', consultaElegida: undefined },
          effects: [],
          deferred: [],
          events: [],
        };
      }
      return goTo(def, ds, node.next, gs);
    }
    case 'testimonio': {
      if (input === 'registrar' && node.testimonio) {
        const next = goTo(def, ds, node.next, gs);
        return {
          ...next,
          effects: [
            { type: 'registrarVoz', id: node.testimonio.id },
            { type: 'legitimidad', delta: 2, fuente: 'testimonio' },
            ...next.effects,
          ],
          events: [{ type: 'testimonio', id: node.testimonio.id }, ...next.events],
        };
      }
      return goTo(def, ds, node.next, gs);
    }
    default:
      return { state: null, effects: [], deferred: [], events: [{ type: 'fin' }] };
  }
}
