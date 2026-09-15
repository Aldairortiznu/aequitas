import type Phaser from 'phaser';
import type { TiledMap } from '../../core/content/schema';
import { TILE_SIZE } from '../../config';

/**
 * Mundo en vista lateral (decisión D15): gravedad, escaleras y puertas por documento.
 * Un mapa es lateral cuando trae la propiedad `lateral: true` (las franjas de
 * `scripts/maps/lateral.ts`). Aquí viven los ayudantes que no dependen de la escena.
 */

/** Índice de celda de la escalera en el tileset (scripts/maps/lib.ts → T.escalera) + 1 (gid). */
export const GID_ESCALERA = 16;

export const GRAVEDAD = 900;
export const VELOCIDAD_TREPAR = 70;

export function esLateral(map: TiledMap): boolean {
  return map.properties?.some((p) => p.name === 'lateral' && p.value === 'true') ?? false;
}

/**
 * Localiza las escaleras en las capas dibujadas y convierte el tile superior de cada tramo en
 * una plataforma de un solo sentido dentro de la capa de colisión: se pisa desde arriba y se
 * atraviesa trepando (mientras se trepa, el cuerpo no comprueba el suelo).
 */
export function instalarEscaleras(
  capas: Record<string, Phaser.Tilemaps.TilemapLayer>,
  colision: Phaser.Tilemaps.TilemapLayer | undefined,
): Set<string> {
  const celdas = new Set<string>();
  for (const nombre of ['suelo', 'deco-baja']) {
    const capa = capas[nombre];
    if (!capa) continue;
    capa.forEachTile((t) => {
      if (t.index === GID_ESCALERA) celdas.add(`${t.x},${t.y}`);
    });
  }
  if (colision) {
    for (const c of celdas) {
      const [xs, ys] = c.split(',');
      const x = Number(xs);
      const y = Number(ys);
      if (celdas.has(`${x},${y - 1}`)) continue; // no es el tramo superior
      const tile = colision.putTileAt(GID_ESCALERA, x, y);
      tile?.setCollision(false, false, true, false, true);
    }
  }
  return celdas;
}

/** ¿Hay escalera en alguno de estos puntos del mundo (px)? */
export function hayEscalera(celdas: Set<string>, x: number, ys: number[]): boolean {
  const tx = Math.floor(x / TILE_SIZE);
  return ys.some((y) => celdas.has(`${tx},${Math.floor(y / TILE_SIZE)}`));
}
