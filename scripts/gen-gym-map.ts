import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Genera los mapas del episodio de prueba (`content/gym/maps/*.json`) en formato Tiled.
 * Los mapas reales se dibujan en Tiled; este generador existe para que el gimnasio
 * sea reproducible y para documentar la convención de tiles provisionales.
 *
 * Tileset provisional «provisional» (16 tiles, 4 columnas). GID = índice + 1.
 *   1 hierba · 2 camino · 3 agua · 4 muro · 5 arbusto · 6 piso interior · 7 mesa
 *   8 atril · 9 puerta · 10 hierba con flores (floración) · 11 canal seco · 12 canal con agua
 *   13 estante · 14 grieta · 15 brote · 16 vacío
 * Estados de mapa (E1.6): tabla de equivalencia en src/engine/world/mapStates.ts.
 */

type Layer =
  | {
      id: number;
      name: string;
      type: 'tilelayer';
      width: number;
      height: number;
      data: number[];
      visible: boolean;
      opacity: 1;
      x: 0;
      y: 0;
    }
  | {
      id: number;
      name: string;
      type: 'objectgroup';
      objects: TiledObj[];
      visible: boolean;
      opacity: 1;
      x: 0;
      y: 0;
      draworder: 'topdown';
    };

interface TiledObj {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0;
  visible: true;
  point?: true;
  polyline?: { x: number; y: number }[];
  properties?: { name: string; type: string; value: string | number | boolean }[];
}

const T = {
  hierba: 1,
  camino: 2,
  agua: 3,
  muro: 4,
  arbusto: 5,
  piso: 6,
  mesa: 7,
  atril: 8,
  puerta: 9,
  canalSeco: 11,
  estante: 13,
  grieta: 14,
} as const;

function grid(w: number, h: number, fill: number): number[] {
  return new Array<number>(w * h).fill(fill);
}
function set(data: number[], w: number, x: number, y: number, v: number): void {
  data[y * w + x] = v;
}
function rect(
  data: number[],
  w: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  v: number,
): void {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(data, w, x, y, v);
}

let nextId = 1;
function obj(
  name: string,
  type: string,
  tx: number,
  ty: number,
  extra: Partial<TiledObj> = {},
  props: Record<string, string | number | boolean> = {},
): TiledObj {
  const o: TiledObj = {
    id: nextId++,
    name,
    type,
    x: tx * 16,
    y: ty * 16,
    width: extra.width ?? 16,
    height: extra.height ?? 16,
    rotation: 0,
    visible: true,
    ...extra,
  };
  const entries = Object.entries(props);
  if (entries.length) {
    o.properties = entries.map(([k, v]) => ({
      name: k,
      type: typeof v === 'number' ? 'int' : typeof v === 'boolean' ? 'bool' : 'string',
      value: v,
    }));
  }
  return o;
}

function tileLayer(id: number, name: string, w: number, h: number, data: number[]): Layer {
  return {
    id,
    name,
    type: 'tilelayer',
    width: w,
    height: h,
    data,
    visible: true,
    opacity: 1,
    x: 0,
    y: 0,
  };
}

function makeMap(w: number, h: number, layers: Layer[], props: Record<string, string> = {}) {
  return {
    compressionlevel: -1,
    width: w,
    height: h,
    tilewidth: 16,
    tileheight: 16,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    type: 'map',
    version: '1.10',
    tiledversion: '1.11.0',
    nextlayerid: layers.length + 1,
    nextobjectid: nextId,
    layers,
    tilesets: [
      {
        firstgid: 1,
        name: 'provisional',
        tilewidth: 16,
        tileheight: 16,
        tilecount: 16,
        columns: 4,
        image: 'provisional.png',
        imagewidth: 64,
        imageheight: 64,
        margin: 0,
        spacing: 0,
      },
    ],
    properties: Object.entries(props).map(([name, value]) => ({ name, type: 'string', value })),
  };
}

// --------------------------------------------------------------------------
// Plaza: 40 x 24 tiles (640 x 384 px). Un claro con un canal seco, una casa y un muelle.
// --------------------------------------------------------------------------
function plaza() {
  const w = 40;
  const h = 24;
  const suelo = grid(w, h, T.hierba);
  const decoBaja = grid(w, h, 0);
  const colision = grid(w, h, 0);
  const decoAlta = grid(w, h, 0);

  // Camino en cruz
  rect(suelo, w, 0, 11, w - 1, 12, T.camino);
  rect(suelo, w, 19, 0, 20, h - 1, T.camino);
  // Agua al sur (ciénaga) con muelle
  rect(suelo, w, 0, 20, w - 1, h - 1, T.agua);
  rect(colision, w, 0, 20, w - 1, h - 1, T.agua);
  rect(suelo, w, 18, 20, 21, 22, T.camino);
  rect(colision, w, 18, 20, 21, 22, 0);
  // Canal seco que cruza el este
  rect(suelo, w, 30, 0, 30, 19, T.canalSeco);
  rect(suelo, w, 30, 11, 30, 12, T.camino);
  // Borde de muros (límite del mapa)
  rect(colision, w, 0, 0, w - 1, 0, T.muro);
  rect(colision, w, 0, 0, 0, 19, T.muro);
  rect(colision, w, w - 1, 0, w - 1, 19, T.muro);
  rect(decoAlta, w, 0, 0, w - 1, 0, T.muro);
  rect(decoAlta, w, 0, 1, 0, 19, T.muro);
  rect(decoAlta, w, w - 1, 1, w - 1, 19, T.muro);
  // Casa (estación) al noroeste: muros con puerta
  rect(suelo, w, 4, 3, 12, 8, T.piso);
  rect(colision, w, 4, 3, 12, 3, T.muro);
  rect(colision, w, 4, 3, 4, 8, T.muro);
  rect(colision, w, 12, 3, 12, 8, T.muro);
  rect(colision, w, 4, 8, 12, 8, T.muro);
  rect(decoAlta, w, 4, 3, 12, 3, T.muro);
  rect(decoAlta, w, 4, 4, 4, 8, T.muro);
  rect(decoAlta, w, 12, 4, 12, 8, T.muro);
  rect(decoAlta, w, 4, 8, 12, 8, T.muro);
  set(colision, w, 8, 8, 0);
  set(decoAlta, w, 8, 8, 0);
  set(suelo, w, 8, 8, T.puerta);
  set(decoBaja, w, 6, 4, T.estante);
  set(decoBaja, w, 10, 4, T.estante);
  set(colision, w, 6, 4, T.estante);
  set(colision, w, 10, 4, T.estante);
  // Arbustos
  for (const [x, y] of [
    [14, 2],
    [16, 5],
    [24, 3],
    [26, 7],
    [35, 4],
    [36, 15],
    [8, 15],
    [12, 17],
    [24, 16],
  ] as const) {
    set(decoBaja, w, x, y, T.arbusto);
    set(colision, w, x, y, T.arbusto);
  }
  // Atril y mesa
  set(decoBaja, w, 22, 14, T.atril);
  set(colision, w, 22, 14, T.atril);
  set(decoBaja, w, 26, 12, T.mesa);
  set(colision, w, 26, 12, T.mesa);
  // Grietas decorativas (estado ceniza)
  for (const [x, y] of [
    [15, 9],
    [33, 9],
    [28, 17],
    [6, 12],
  ] as const)
    set(decoBaja, w, x, y, T.grieta);

  const objetos: TiledObj[] = [
    obj('inicio', 'spawn', 19, 14),
    obj('desde-sotano', 'spawn', 8, 9),
    obj(
      'npc-nepomuceno',
      'npc',
      23,
      10,
      {},
      { personaje: 'nepomuceno', dialogo: 'gym-bienvenida', mirando: 'abajo' },
    ),
    obj(
      'npc-casimiro',
      'npc',
      27,
      13,
      {},
      { personaje: 'casimiro', dialogo: 'gym-casimiro', mirando: 'izquierda' },
    ),
    obj(
      'npc-estudiante',
      'npc',
      14,
      12,
      {},
      { personaje: 'estudiante', dialogo: 'gym-estudiante', mirando: 'derecha' },
    ),
    obj('ev-acta', 'evidence', 16, 16, {}, { evidencia: 'gym-acta-sin-firma' }),
    obj('folio-cp4', 'folio', 33, 14, {}, { codice: 'cp-4' }),
    obj('folio-cp14', 'folio', 6, 18, {}, { codice: 'cp-14' }),
    obj('puerta-sotano', 'door', 8, 8, {}, { mapa: 'sotano', spawn: 'entrada' }),
    obj('trigger-muelle', 'trigger', 18, 20, { width: 64, height: 16 }, { beat: 'gym-muelle' }),
    obj('atril-plaza', 'atril', 22, 14),
    obj('mesa-plaza', 'mesa', 26, 12, {}, { pacto: 'gym-pacto' }),
    obj(
      'patrulla-este',
      'patrol',
      33,
      2,
      {
        width: 0,
        height: 0,
        polyline: [
          { x: 0, y: 0 },
          { x: 0, y: 16 * 14 },
          { x: 16 * 4, y: 16 * 14 },
          { x: 16 * 4, y: 0 },
        ],
      },
      { rango: 'alguacil', articulo: 'cp-28' },
    ),
  ];

  const layers: Layer[] = [
    tileLayer(1, 'suelo', w, h, suelo),
    tileLayer(2, 'deco-baja', w, h, decoBaja),
    tileLayer(3, 'colision', w, h, colision),
    tileLayer(4, 'deco-alta', w, h, decoAlta),
    {
      id: 5,
      name: 'objetos',
      type: 'objectgroup',
      objects: objetos,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      draworder: 'topdown',
    },
  ];
  return makeMap(w, h, layers, { region: 'gimnasio', nombre: 'Plaza del gimnasio', musica: 'gym' });
}

// --------------------------------------------------------------------------
// Sótano: 20 x 14 tiles. Interior con una evidencia y una salida.
// --------------------------------------------------------------------------
function sotano() {
  const w = 20;
  const h = 14;
  const suelo = grid(w, h, T.piso);
  const decoBaja = grid(w, h, 0);
  const colision = grid(w, h, 0);
  const decoAlta = grid(w, h, 0);
  rect(colision, w, 0, 0, w - 1, 0, T.muro);
  rect(colision, w, 0, h - 1, w - 1, h - 1, T.muro);
  rect(colision, w, 0, 0, 0, h - 1, T.muro);
  rect(colision, w, w - 1, 0, w - 1, h - 1, T.muro);
  rect(decoAlta, w, 0, 0, w - 1, 0, T.muro);
  rect(decoAlta, w, 0, h - 1, w - 1, h - 1, T.muro);
  rect(decoAlta, w, 0, 1, 0, h - 2, T.muro);
  rect(decoAlta, w, w - 1, 1, w - 1, h - 2, T.muro);
  for (let x = 3; x < w - 3; x += 3) {
    set(decoBaja, w, x, 2, T.estante);
    set(colision, w, x, 2, T.estante);
  }
  set(suelo, w, 10, h - 1, T.puerta);
  set(colision, w, 10, h - 1, 0);
  set(decoAlta, w, 10, h - 1, 0);

  const objetos: TiledObj[] = [
    obj('entrada', 'spawn', 10, 11),
    obj('ev-testimonio', 'evidence', 5, 6, {}, { evidencia: 'gym-testimonio-eladio' }),
    obj('puerta-plaza', 'door', 10, 13, {}, { mapa: 'plaza', spawn: 'desde-sotano' }),
    obj(
      'trigger-sotano',
      'trigger',
      8,
      10,
      { width: 64, height: 16 },
      { beat: 'gym-entra-sotano' },
    ),
  ];
  const layers: Layer[] = [
    tileLayer(1, 'suelo', w, h, suelo),
    tileLayer(2, 'deco-baja', w, h, decoBaja),
    tileLayer(3, 'colision', w, h, colision),
    tileLayer(4, 'deco-alta', w, h, decoAlta),
    {
      id: 5,
      name: 'objetos',
      type: 'objectgroup',
      objects: objetos,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      draworder: 'topdown',
    },
  ];
  return makeMap(w, h, layers, {
    region: 'gimnasio',
    nombre: 'Sótano del gimnasio',
    musica: 'gym',
    interior: 'true',
  });
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'gym', 'maps');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'plaza.json'), JSON.stringify(plaza()) + '\n');
writeFileSync(join(outDir, 'sotano.json'), JSON.stringify(sotano()) + '\n');
console.log('mapas del gimnasio generados en', outDir);
