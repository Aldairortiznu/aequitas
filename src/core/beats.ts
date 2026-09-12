import type { Beat, BeatTrigger, FlagValue } from './content/schema';
import type { GameState } from './state/gameState';
import { checkAll } from './state/gameState';

/**
 * Evaluación de beats (lógica pura). Un evento del mundo se compara con los disparadores
 * de los beats del episodio; se devuelven los beats que deben ejecutarse, en orden.
 */
export type BeatEvent =
  | { type: 'episodeStart' }
  | { type: 'enterMap'; map: string }
  | { type: 'flag'; flag: string; value: FlagValue }
  | { type: 'evidence'; id: string }
  | { type: 'audienciaWon'; id: string }
  | { type: 'pactoSigned'; id: string; equilibrio: number }
  | { type: 'interact'; object: string };

function matches(trigger: BeatTrigger, ev: BeatEvent): boolean {
  switch (trigger.type) {
    case 'episodeStart':
      return ev.type === 'episodeStart';
    case 'enterMap':
      return ev.type === 'enterMap' && ev.map === trigger.map;
    case 'flag':
      return ev.type === 'flag' && ev.flag === trigger.flag && ev.value === trigger.equals;
    case 'evidence':
      return ev.type === 'evidence' && ev.id === trigger.id;
    case 'audienciaWon':
      return ev.type === 'audienciaWon' && ev.id === trigger.id;
    case 'pactoSigned':
      return (
        ev.type === 'pactoSigned' &&
        ev.id === trigger.id &&
        (trigger.minEquilibrio === undefined || ev.equilibrio >= trigger.minEquilibrio)
      );
    case 'interact':
      return ev.type === 'interact' && ev.object === trigger.object;
    default:
      return false;
  }
}

export function matchBeats(beats: Beat[], state: GameState, ev: BeatEvent): Beat[] {
  return beats.filter((b) => {
    if (b.once && state.beatsDone.includes(b.id)) return false;
    if (!matches(b.trigger, ev)) return false;
    return checkAll(state, b.requires);
  });
}
