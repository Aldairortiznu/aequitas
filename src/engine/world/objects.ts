import type { TiledMap, TiledObject } from '../../core/content/schema';
import { OBJECT_LAYER, tiledObjectType, tiledProp } from '../../core/content/schema';

/** Objeto de mapa ya interpretado (independiente de Phaser). */
export interface WorldObject {
  name: string;
  type: string;
  x: number; // esquina superior izquierda en px
  y: number;
  width: number;
  height: number;
  cx: number; // centro
  cy: number;
  props: Record<string, string>;
  polyline?: { x: number; y: number }[]; // puntos absolutos
}

export function parseObjects(map: TiledMap): WorldObject[] {
  const layer = map.layers.find((l) => l.name === OBJECT_LAYER && l.type === 'objectgroup');
  const out: WorldObject[] = [];
  for (const o of layer?.objects ?? []) {
    out.push(toWorldObject(o));
  }
  return out;
}

function toWorldObject(o: TiledObject): WorldObject {
  const width = o.width ?? 0;
  const height = o.height ?? 0;
  const props: Record<string, string> = {};
  for (const p of o.properties ?? []) {
    const v = tiledProp(o, p.name);
    if (v !== undefined) props[p.name] = v;
  }
  return {
    name: o.name,
    type: tiledObjectType(o),
    x: o.x,
    y: o.y,
    width,
    height,
    cx: o.x + (width || 16) / 2,
    cy: o.y + (height || 16) / 2,
    props,
    polyline: o.polyline?.map((p) => ({ x: o.x + p.x, y: o.y + p.y })),
  };
}

export function findSpawn(objects: WorldObject[], name: string): WorldObject | undefined {
  return objects.find((o) => o.type === 'spawn' && o.name === name);
}
