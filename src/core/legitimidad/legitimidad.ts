import type { MapState } from '../content/schema';
import { BALANCE } from '../balance';

/**
 * Legitimidad por región (Reverdecer). Lógica pura.
 * Fuentes con tope (docs/design/03-mecanicas.md §6).
 */

export type FuenteLegitimidad =
  'audiencia' | 'pacto' | 'consulta' | 'testimonio' | 'folio' | 'evento';

export interface LegitimidadRegion {
  valor: number;
  porFuente: Partial<Record<FuenteLegitimidad, number>>;
}

export type LegitimidadState = Record<string, LegitimidadRegion>;

export interface Hito {
  at: number;
  mapState: MapState;
}

export const HITOS_DEFAULT: Hito[] = [
  { at: 25, mapState: 'brote' },
  { at: 50, mapState: 'verdor' },
  { at: 75, mapState: 'floracion' },
];

export function getRegion(s: LegitimidadState, region: string): LegitimidadRegion {
  return s[region] ?? { valor: 0, porFuente: {} };
}

export interface AddResult {
  state: LegitimidadState;
  aplicado: number;
  antes: number;
  despues: number;
  hitoAlcanzado?: Hito;
}

/** Suma legitimidad respetando el tope por fuente y el máximo de 100. */
export function addLegitimidad(
  s: LegitimidadState,
  region: string,
  delta: number,
  fuente: FuenteLegitimidad = 'evento',
  hitos: Hito[] = HITOS_DEFAULT,
): AddResult {
  const r = getRegion(s, region);
  const usado = r.porFuente[fuente] ?? 0;
  const tope = BALANCE.legitimidad.topes[fuente];
  let aplicado = delta;
  if (delta > 0 && tope !== undefined) aplicado = Math.max(0, Math.min(delta, tope - usado));
  const antes = r.valor;
  const despues = Math.max(0, Math.min(100, antes + aplicado));
  aplicado = despues - antes;
  const next: LegitimidadState = {
    ...s,
    [region]: {
      valor: despues,
      porFuente: { ...r.porFuente, [fuente]: usado + Math.max(0, aplicado) },
    },
  };
  const hitoAlcanzado = [...hitos]
    .sort((a, b) => a.at - b.at)
    .filter((h) => antes < h.at && despues >= h.at)
    .pop();
  return { state: next, aplicado, antes, despues, hitoAlcanzado };
}

/** Estado de mapa que corresponde a un valor de legitimidad. */
export function mapStateFor(valor: number, hitos: Hito[] = HITOS_DEFAULT): MapState {
  let estado: MapState = 'ceniza';
  for (const h of [...hitos].sort((a, b) => a.at - b.at)) if (valor >= h.at) estado = h.mapState;
  return estado;
}
