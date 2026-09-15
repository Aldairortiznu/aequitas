import type { Objetivo } from './content/schema';
import type { GameState } from './state/gameState';
import { checkAll } from './state/gameState';

/**
 * Objetivos guiados (lógica pura). El objetivo activo es el primero cuyas condiciones
 * `hecho` no se cumplen. Los anteriores cuentan como cumplidos aunque el jugador los haya
 * resuelto en otro orden.
 */
export interface EstadoObjetivos {
  activo: Objetivo | null;
  hechos: Objetivo[];
  pendientes: Objetivo[];
}

export function estadoObjetivos(objetivos: Objetivo[], gs: GameState): EstadoObjetivos {
  const hechos: Objetivo[] = [];
  const pendientes: Objetivo[] = [];
  for (const o of objetivos) (checkAll(gs, o.hecho) ? hechos : pendientes).push(o);
  return { activo: pendientes[0] ?? null, hechos, pendientes };
}
