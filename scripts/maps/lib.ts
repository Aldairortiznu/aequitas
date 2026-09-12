/**
 * Biblioteca para construir mapas Tiled por código con el tileset estándar de 64 celdas
 * (docs/arte/03-FICHAS-REGIONES.md §1). Los mapas definitivos pueden retocarse en Tiled;
 * estos generadores los producen de forma reproducible.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Índices del tileset estándar (GID = índice + 1). */
export const T = {
  suelo: 0,
  sueloVar: 1,
  sueloDetalle: 2,
  camino: 3,
  caminoIzq: 4,
  caminoDer: 5,
  agua: 6,
  orilla: 7,
  muro: 8,
  muroRemate: 9,
  muroEsquina: 10,
  puerta: 11,
  piso: 12,
  pisoVar: 13,
  alfombra: 14,
  escalera: 15,
  arbusto: 16,
  copaIzq: 17,
  copaDer: 18,
  tronco: 19,
  mesa: 20,
  silla: 21,
  atril: 22,
  estante: 23,
  banca: 24,
  barril: 25,
  cerca: 26,
  poste: 27,
  canal: 28,
  valvula: 29,
  tuberia: 30,
  tanque: 31,
  ventana: 32,
  balcon: 33,
  reja: 34,
  escombro: 35,
  panelSolar: 36,
  enredadera: 37,
  huerta: 38,
  margarita: 39,
  muelle: 40,
  muelleBorde: 41,
  canoa: 42,
  red: 43,
  cartel: 44,
  fila: 45,
  muroCarnes: 46,
  piscina: 47,
  // 48-63 por región
  r48: 48,
  r49: 49,
  r50: 50,
  r51: 51,
  r52: 52,
  r53: 53,
  r54: 54,
  r55: 55,
  r56: 56,
  r57: 57,
  r58: 58,
  r59: 59,
  r60: 60,
  r61: 61,
  r62: 62,
  r63: 63,
} as const;

/** Celdas con colisión por defecto. */
export const SOLIDOS = new Set<number>([
  T.agua,
  T.muro,
  T.muroRemate,
  T.muroEsquina,
  T.arbusto,
  T.copaIzq,
  T.copaDer,
  T.tronco,
  T.mesa,
  T.atril,
  T.estante,
  T.banca,
  T.barril,
  T.cerca,
  T.poste,
  T.valvula,
  T.tanque,
  T.reja,
  T.escombro,
  T.panelSolar,
  T.canoa,
  T.cartel,
  T.muroCarnes,
]);

export interface Prop {
  name: string;
  type: string;
  value: string | number | boolean;
}

export interface TiledObj {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0;
  visible: true;
  polyline?: { x: number; y: number }[];
  properties?: Prop[];
}

export class MapBuilder {
  readonly w: number;
  readonly h: number;
  suelo: number[];
  decoBaja: number[];
  colision: number[];
  decoAlta: number[];
  /** Capas de decorado por estado (se activan/desactivan con Reverdecer). */
  decoEstado: Record<string, number[]> = {};
  objetos: TiledObj[] = [];
  private nextId = 1;
  props: Record<string, string> = {};

  constructor(
    w: number,
    h: number,
    base: number = T.suelo,
    public tileset = 'provisional',
  ) {
    this.w = w;
    this.h = h;
    this.suelo = new Array<number>(w * h).fill(base + 1);
    this.decoBaja = new Array<number>(w * h).fill(0);
    this.colision = new Array<number>(w * h).fill(0);
    this.decoAlta = new Array<number>(w * h).fill(0);
  }

  private idx(x: number, y: number): number {
    return y * this.w + x;
  }

  /** Pinta suelo (índice de celda). */
  ground(x: number, y: number, t: number): this {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.suelo[this.idx(x, y)] = t + 1;
    return this;
  }

  groundRect(x0: number, y0: number, x1: number, y1: number, t: number): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.ground(x, y, t);
    return this;
  }

  /** Decorado bajo (sobre suelo, bajo el jugador). Colisión según SOLIDOS salvo que se indique. */
  deco(x: number, y: number, t: number, solid?: boolean): this {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.decoBaja[this.idx(x, y)] = t + 1;
    if (solid ?? SOLIDOS.has(t)) this.colision[this.idx(x, y)] = t + 1;
    return this;
  }

  /** Decorado alto (se dibuja sobre el jugador): remates de muro, copas de árbol. */
  alto(x: number, y: number, t: number, solid = true): this {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.decoAlta[this.idx(x, y)] = t + 1;
    if (solid) this.colision[this.idx(x, y)] = t + 1;
    return this;
  }

  solid(x: number, y: number, v = true): this {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.colision[this.idx(x, y)] = v ? T.muro + 1 : 0;
    return this;
  }

  solidRect(x0: number, y0: number, x1: number, y1: number, v = true): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.solid(x, y, v);
    return this;
  }

  /** Muro perimetral de un rectángulo (sólido, dibujado alto) con puerta opcional en el borde inferior. */
  building(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    piso: number = T.piso,
    puertaX?: number,
  ): this {
    this.groundRect(x0, y0, x1, y1, piso);
    for (let x = x0; x <= x1; x++) {
      this.alto(x, y0, T.muroRemate);
      this.alto(x, y1, T.muro);
    }
    for (let y = y0 + 1; y < y1; y++) {
      this.alto(x0, y, T.muro);
      this.alto(x1, y, T.muro);
    }
    this.alto(x0, y0, T.muroEsquina);
    this.alto(x1, y0, T.muroEsquina);
    if (puertaX !== undefined) {
      this.decoAlta[this.idx(puertaX, y1)] = 0;
      this.colision[this.idx(puertaX, y1)] = 0;
      this.ground(puertaX, y1, T.puerta);
    }
    return this;
  }

  /** Borde del mapa (muro sólido invisible o agua). */
  border(t: number = T.muro, draw = true): this {
    for (let x = 0; x < this.w; x++) {
      this.solid(x, 0);
      this.solid(x, this.h - 1);
      if (draw) {
        this.alto(x, 0, t);
        this.alto(x, this.h - 1, t);
      }
    }
    for (let y = 0; y < this.h; y++) {
      this.solid(0, y);
      this.solid(this.w - 1, y);
      if (draw) {
        this.alto(0, y, t);
        this.alto(this.w - 1, y, t);
      }
    }
    return this;
  }

  water(x0: number, y0: number, x1: number, y1: number): this {
    this.groundRect(x0, y0, x1, y1, T.agua);
    this.solidRect(x0, y0, x1, y1);
    for (let x = x0; x <= x1; x++) if (y0 > 0) this.ground(x, y0, T.orilla);
    return this;
  }

  /** Camino horizontal o vertical con bordes. */
  path(x0: number, y0: number, x1: number, y1: number): this {
    this.groundRect(x0, y0, x1, y1, T.camino);
    return this;
  }

  /** Decorado que solo existe en un estado (por ejemplo ropa tendida en verdor). */
  decoEn(estado: string, x: number, y: number, t: number): this {
    if (!this.decoEstado[estado])
      this.decoEstado[estado] = new Array<number>(this.w * this.h).fill(0);
    this.decoEstado[estado]![this.idx(x, y)] = t + 1;
    return this;
  }

  obj(
    name: string,
    type: string,
    tx: number,
    ty: number,
    props: Record<string, string | number | boolean> = {},
    extra: Partial<TiledObj> = {},
  ): this {
    const o: TiledObj = {
      id: this.nextId++,
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
    this.objetos.push(o);
    return this;
  }

  spawn(name: string, tx: number, ty: number): this {
    return this.obj(name, 'spawn', tx, ty);
  }

  npc(
    name: string,
    tx: number,
    ty: number,
    personaje: string,
    dialogo: string,
    mirando = 'abajo',
  ): this {
    return this.obj(name, 'npc', tx, ty, { personaje, dialogo, mirando });
  }

  evidence(name: string, tx: number, ty: number, evidencia: string): this {
    return this.obj(name, 'evidence', tx, ty, { evidencia });
  }

  folio(name: string, tx: number, ty: number, codice: string): this {
    return this.obj(name, 'folio', tx, ty, { codice });
  }

  door(
    name: string,
    tx: number,
    ty: number,
    mapa: string,
    spawn: string,
    extra: Record<string, string> = {},
  ): this {
    return this.obj(name, 'door', tx, ty, { mapa, spawn, ...extra });
  }

  trigger(name: string, tx: number, ty: number, w: number, h: number, beat: string): this {
    return this.obj(name, 'trigger', tx, ty, { beat }, { width: w * 16, height: h * 16 });
  }

  atril(name: string, tx: number, ty: number): this {
    this.deco(tx, ty, T.atril);
    return this.obj(name, 'atril', tx, ty);
  }

  mesa(
    name: string,
    tx: number,
    ty: number,
    pacto?: string,
    gate?: { requiereFlag: string; textoBloqueo?: string },
  ): this {
    this.deco(tx, ty, T.mesa);
    const props: Record<string, string> = {};
    if (pacto) props.pacto = pacto;
    if (gate) {
      props.requiereFlag = gate.requiereFlag;
      if (gate.textoBloqueo) props.textoBloqueo = gate.textoBloqueo;
    }
    return this.obj(name, 'mesa', tx, ty, props);
  }

  patrol(name: string, points: [number, number][], rango = 'alguacil', articulo?: string): this {
    const [x0, y0] = points[0]!;
    return this.obj(
      name,
      'patrol',
      x0,
      y0,
      { rango, ...(articulo ? { articulo } : {}) },
      {
        width: 0,
        height: 0,
        polyline: points.map(([x, y]) => ({ x: (x - x0) * 16, y: (y - y0) * 16 })),
      },
    );
  }

  toJSON(): unknown {
    const layers: unknown[] = [];
    let id = 1;
    const tl = (name: string, data: number[]): unknown => ({
      id: id++,
      name,
      type: 'tilelayer',
      width: this.w,
      height: this.h,
      data,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
    });
    layers.push(tl('suelo', this.suelo));
    layers.push(tl('deco-baja', this.decoBaja));
    layers.push(tl('colision', this.colision));
    layers.push(tl('deco-alta', this.decoAlta));
    for (const [estado, data] of Object.entries(this.decoEstado))
      layers.push(tl(`deco-${estado}`, data));
    layers.push({
      id: id++,
      name: 'objetos',
      type: 'objectgroup',
      objects: this.objetos,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      draworder: 'topdown',
    });
    return {
      compressionlevel: -1,
      width: this.w,
      height: this.h,
      tilewidth: 16,
      tileheight: 16,
      infinite: false,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      type: 'map',
      version: '1.10',
      tiledversion: '1.11.0',
      nextlayerid: id,
      nextobjectid: this.nextId,
      layers,
      tilesets: [
        {
          firstgid: 1,
          name: this.tileset,
          tilewidth: 16,
          tileheight: 16,
          tilecount: 64,
          columns: 4,
          image: `${this.tileset}-ceniza.png`,
          imagewidth: 64,
          imageheight: 256,
          margin: 0,
          spacing: 0,
        },
      ],
      properties: Object.entries(this.props).map(([name, value]) => ({
        name,
        type: 'string',
        value,
      })),
    };
  }
}

export function writeMaps(dir: string, maps: Record<string, MapBuilder>): void {
  mkdirSync(dir, { recursive: true });
  for (const [name, b] of Object.entries(maps)) {
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(b.toJSON()) + '\n');
  }
}
