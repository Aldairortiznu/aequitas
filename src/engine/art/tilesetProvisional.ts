import type Phaser from 'phaser';
import type { MapState } from '../../core/content/schema';

/**
 * Tileset provisional de 64 celdas (4 columnas × 16 filas) por región y estado, dibujado
 * por código con la paleta Bellium. Sigue el índice semántico de
 * docs/arte/03-FICHAS-REGIONES.md §1; el arte real lo reemplaza archivo a archivo.
 */

const P = {
  ceniza0: '#1b1b1f',
  ceniza1: '#2e2d33',
  ceniza2: '#4a4850',
  ceniza3: '#6f6c76',
  ceniza4: '#a29ea8',
  bellium0: '#3b2a5c',
  bellium1: '#5a3f86',
  bellium2: '#8f6fc0',
  oro0: '#b8892e',
  oro1: '#e2b94a',
  oro2: '#f4dc8a',
  verde0: '#2f5d3a',
  verde1: '#4a8a4f',
  verde2: '#7cc46b',
  verde3: '#b9e39a',
  agua0: '#1e6f7a',
  agua1: '#2bb5b8',
  agua2: '#8fe0de',
  tierra0: '#7a4b2d',
  tierra1: '#b5773f',
  tierra2: '#d9a66b',
  sal0: '#f2c9d6',
  sal1: '#e69ab8',
  papel: '#f3ead8',
  papel2: '#eadfc6',
  linea: '#cfc2a3',
} as const;

type Ctx = CanvasRenderingContext2D;

interface Material {
  /** suelo base, variante, detalle */
  suelo: [string, string, string];
  camino: [string, string];
  agua: [string, string, string];
  muro: [string, string, string];
  piso: [string, string];
  madera: [string, string];
  metal: string;
}

function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function materialFor(region: string, state: MapState): Material {
  const verde = state === 'verdor' || state === 'floracion';
  const brote = state === 'brote';
  switch (region) {
    case 'cienaga':
      return {
        suelo: verde
          ? [P.verde0, P.verde1, P.tierra0]
          : brote
            ? [P.ceniza2, P.verde0, P.tierra0]
            : [P.ceniza2, P.ceniza3, P.tierra0],
        camino: [P.ceniza3, P.ceniza4],
        agua: verde ? ['#1a5a4a', '#2a7f68', P.agua2] : ['#233b36', '#2f4d45', '#3f6a5e'],
        muro: [P.ceniza2, P.ceniza3, P.verde0],
        piso: [P.papel2, P.linea],
        madera: [P.tierra0, P.tierra1],
        metal: P.ceniza4,
      };
    case 'altamar':
      return {
        suelo: verde
          ? [P.verde1, P.verde2, P.tierra1]
          : brote
            ? [P.ceniza3, P.verde0, P.ceniza2]
            : [P.ceniza3, P.ceniza4, P.ceniza2],
        camino: [P.ceniza4, '#bdb9c2'],
        agua: verde ? [P.agua0, P.agua1, P.agua2] : ['#3d5b60', '#4f7278', '#6f9a9c'],
        muro: [P.ceniza3, P.ceniza4, P.ceniza2],
        piso: ['#f6f2ea', '#d9d4cc'],
        madera: [P.tierra0, P.tierra1],
        metal: '#8a8478',
      };
    default:
      return {
        suelo: verde
          ? [P.verde0, P.verde1, P.tierra1]
          : brote
            ? [P.ceniza2, P.verde0, P.tierra0]
            : [P.ceniza2, P.ceniza3, P.tierra0],
        camino: [P.tierra1, P.tierra2],
        agua: [P.agua0, P.agua1, P.agua2],
        muro: [P.ceniza1, P.ceniza3, P.ceniza0],
        piso: [P.papel2, P.linea],
        madera: [P.tierra0, P.tierra1],
        metal: P.ceniza4,
      };
  }
}

function drawCell(
  ctx: Ctx,
  i: number,
  ox: number,
  oy: number,
  m: Material,
  state: MapState,
  region: string,
): void {
  const t = (x: number, y: number, c: string, w = 1, h = 1): void => {
    ctx.fillStyle = c;
    ctx.fillRect(ox + x, oy + y, w, h);
  };
  const noise = (x: number, y: number, s = 0): number => hash(x + ox * 7, y + oy * 13, i * 31 + s);
  const verde = state === 'verdor' || state === 'floracion';
  const flor = state === 'floracion';
  const sueloBase = (): void => {
    t(0, 0, m.suelo[0], 16, 16);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) if (noise(x, y) > 0.74) t(x, y, m.suelo[1]);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) if (noise(x, y, 5) > 0.94) t(x, y, m.suelo[2]);
  };
  const muroBase = (): void => {
    t(0, 0, m.muro[0], 16, 16);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 === 0 ? 0 : 4;
      for (let col = -1; col < 3; col++) {
        const x = col * 8 + off + 1;
        const w = Math.min(6, 16 - Math.max(0, x));
        if (w > 0) t(Math.max(0, x), row * 4 + 1, m.muro[1], w, 2);
      }
    }
  };
  const pisoBase = (): void => {
    t(0, 0, m.piso[0], 16, 16);
    t(0, 0, m.piso[1], 16, 1);
    t(0, 0, m.piso[1], 1, 16);
    t(8, 0, m.piso[1], 1, 16);
    t(0, 8, m.piso[1], 16, 1);
  };
  const aguaBase = (): void => {
    t(0, 0, m.agua[0], 16, 16);
    for (let y = 1; y < 16; y += 5) t(((y * 3) % 11) + 1, y, m.agua[1], 5, 1);
    t(9, 6, m.agua[2], 3, 1);
    t(2, 13, m.agua[2], 2, 1);
  };
  switch (i) {
    case 0:
      sueloBase();
      if (flor) {
        t(2, 3, P.oro1);
        t(11, 10, P.oro1);
        t(13, 4, P.papel);
      }
      break;
    case 1:
      t(0, 0, m.suelo[1], 16, 16);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) if (noise(x, y) > 0.7) t(x, y, m.suelo[0]);
      break;
    case 2: // detalle por estado: grieta / brote / margarita
      sueloBase();
      if (state === 'ceniza' || state === 'brote') {
        t(2, 3, P.ceniza0, 3, 1);
        t(5, 4, P.ceniza0, 4, 1);
        t(9, 5, P.ceniza0, 2, 1);
        t(11, 6, P.ceniza0, 3, 1);
        t(7, 8, P.ceniza0, 1, 3);
        if (state === 'brote') {
          t(8, 6, P.verde2, 1, 2);
          t(7, 5, P.verde1, 1, 1);
        }
      } else if (state === 'verdor') {
        t(5, 9, P.verde2, 2, 3);
        t(9, 7, P.verde2, 2, 3);
      } else {
        t(4, 4, P.oro1, 2, 2);
        t(5, 6, P.verde1, 1, 4);
        t(10, 8, P.papel, 2, 2);
        t(11, 10, P.verde1, 1, 3);
      }
      break;
    case 3:
      t(0, 0, m.camino[0], 16, 16);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) if (noise(x, y) > 0.8) t(x, y, m.camino[1]);
      break;
    case 4:
    case 5: {
      sueloBase();
      const left = i === 4;
      t(left ? 6 : 0, 0, m.camino[0], 10, 16);
      for (let y = 0; y < 16; y++) if (noise(0, y) > 0.5) t(left ? 5 : 10, y, m.camino[0]);
      break;
    }
    case 6:
      aguaBase();
      break;
    case 7: // orilla: agua arriba, suelo abajo
      aguaBase();
      t(0, 10, m.suelo[0], 16, 6);
      for (let x = 0; x < 16; x++) if (noise(x, 0) > 0.5) t(x, 9, m.suelo[0]);
      t(0, 8, m.agua[2], 16, 1);
      break;
    case 8:
      muroBase();
      break;
    case 9: // remate
      muroBase();
      t(0, 0, m.muro[2], 16, 3);
      t(0, 3, P.ceniza0, 16, 1);
      break;
    case 10: // esquina
      muroBase();
      t(0, 0, m.muro[2], 16, 3);
      t(0, 0, m.muro[2], 3, 16);
      break;
    case 11: // puerta
      t(0, 0, m.muro[0], 16, 16);
      t(3, 0, m.madera[0], 10, 16);
      t(4, 1, m.madera[1], 8, 15);
      t(10, 8, P.oro1, 1, 2);
      break;
    case 12:
      pisoBase();
      break;
    case 13:
      pisoBase();
      t(3, 3, m.piso[1], 2, 2);
      t(11, 11, m.piso[1], 2, 2);
      break;
    case 14: // alfombra / estera
      pisoBase();
      t(1, 1, region === 'altamar' ? P.bellium0 : P.tierra1, 14, 14);
      t(2, 2, region === 'altamar' ? P.bellium1 : P.tierra2, 12, 12);
      break;
    case 15: // escalera
      pisoBase();
      for (let y = 1; y < 16; y += 3) t(1, y, P.ceniza2, 14, 1);
      for (let y = 2; y < 16; y += 3) t(1, y, m.piso[1], 14, 1);
      break;
    case 16: // arbusto
      sueloBase();
      t(3, 4, verde ? P.verde0 : P.ceniza2, 10, 10);
      t(4, 3, verde ? P.verde1 : P.ceniza3, 8, 10);
      t(2, 6, verde ? P.verde1 : P.ceniza3, 12, 6);
      t(5, 4, verde ? P.verde2 : P.ceniza4, 3, 2);
      break;
    case 17:
    case 18: {
      // copa izquierda / derecha
      sueloBase();
      const left = i === 17;
      const c0 = verde ? P.verde0 : P.ceniza2;
      const c1 = verde ? P.verde1 : P.ceniza3;
      t(left ? 4 : 0, 2, c0, 12, 14);
      t(left ? 6 : 0, 0, c1, 10, 12);
      t(left ? 9 : 2, 3, verde ? P.verde2 : P.ceniza4, 3, 3);
      break;
    }
    case 19: // tronco / palmera
      sueloBase();
      t(6, 0, m.madera[0], 4, 16);
      t(7, 0, m.madera[1], 1, 16);
      break;
    case 20: // mesa
      pisoBase();
      t(1, 3, m.madera[0], 14, 8);
      t(2, 2, m.madera[1], 12, 8);
      t(2, 11, m.madera[0], 2, 4);
      t(12, 11, m.madera[0], 2, 4);
      t(5, 4, P.papel, 6, 4);
      break;
    case 21: // silla
      pisoBase();
      t(4, 2, m.madera[0], 8, 2);
      t(4, 4, m.madera[1], 8, 6);
      t(4, 10, m.madera[0], 2, 5);
      t(10, 10, m.madera[0], 2, 5);
      break;
    case 22: // atril
      sueloBase();
      t(7, 6, m.madera[0], 2, 9);
      t(4, 14, m.madera[0], 8, 1);
      t(3, 3, m.madera[1], 10, 4);
      t(4, 2, P.papel, 8, 4);
      t(5, 3, P.linea, 6, 1);
      break;
    case 23: // estante
      pisoBase();
      t(1, 1, m.madera[0], 14, 14);
      t(2, 2, m.madera[1], 12, 12);
      for (let k = 0; k < 5; k++) t(3 + k * 2, 3, k % 2 ? P.bellium1 : P.verde0, 1, 4);
      for (let k = 0; k < 5; k++) t(3 + k * 2, 9, k % 3 ? P.oro0 : P.agua0, 1, 4);
      break;
    case 24: // banca / cama
      pisoBase();
      t(1, 5, m.madera[1], 14, 6);
      t(1, 11, m.madera[0], 2, 3);
      t(13, 11, m.madera[0], 2, 3);
      break;
    case 25: // barril / tanque
      sueloBase();
      t(4, 2, m.metal, 8, 12);
      t(5, 1, m.metal, 6, 1);
      t(4, 5, P.ceniza1, 8, 1);
      t(4, 10, P.ceniza1, 8, 1);
      break;
    case 26: // cerca
      sueloBase();
      t(0, 6, m.madera[1], 16, 2);
      t(0, 10, m.madera[1], 16, 2);
      t(2, 3, m.madera[0], 2, 12);
      t(12, 3, m.madera[0], 2, 12);
      break;
    case 27: // poste / farol
      sueloBase();
      t(7, 3, m.madera[0], 2, 12);
      t(5, 1, P.oro0, 6, 3);
      t(6, 2, verde ? P.oro2 : P.ceniza4, 4, 1);
      break;
    case 28: // canal (seco / con agua)
      sueloBase();
      t(0, 0, m.suelo[2], 16, 16);
      if (verde) {
        t(2, 0, m.agua[0], 12, 16);
        t(4, 3, m.agua[1], 6, 1);
        t(6, 10, m.agua[1], 6, 1);
      } else {
        t(2, 0, P.ceniza2, 12, 16);
        for (let y = 0; y < 16; y++)
          for (let x = 2; x < 14; x++) if (noise(x, y) > 0.86) t(x, y, P.ceniza3);
        t(6, 2, P.ceniza1, 1, 5);
        t(9, 8, P.ceniza1, 1, 6);
      }
      break;
    case 29: // válvula / compuerta
      sueloBase();
      t(6, 6, m.metal, 4, 4);
      t(3, 7, m.metal, 10, 2);
      t(7, 3, m.metal, 2, 10);
      t(7, 7, verde ? P.agua1 : P.oro0, 2, 2);
      break;
    case 30: // tubería
      sueloBase();
      t(0, 6, m.metal, 16, 4);
      t(0, 7, P.ceniza4, 16, 1);
      break;
    case 31: // tanque de agua
      sueloBase();
      t(2, 1, m.metal, 12, 10);
      t(3, 0, m.metal, 10, 1);
      t(2, 4, P.ceniza1, 12, 1);
      t(4, 11, m.madera[0], 2, 5);
      t(10, 11, m.madera[0], 2, 5);
      break;
    case 32: // ventana
      muroBase();
      t(4, 4, P.ceniza0, 8, 8);
      t(5, 5, verde ? P.agua2 : P.ceniza4, 6, 6);
      t(8, 5, P.ceniza0, 1, 6);
      break;
    case 33: // balcón
      muroBase();
      t(0, 8, m.madera[0], 16, 2);
      for (let x = 1; x < 16; x += 3) t(x, 4, m.madera[1], 1, 4);
      break;
    case 34: // reja
      sueloBase();
      for (let x = 1; x < 16; x += 3) t(x, 1, m.metal, 1, 14);
      t(0, 3, m.metal, 16, 1);
      t(0, 12, m.metal, 16, 1);
      break;
    case 35: // escombro
      sueloBase();
      t(3, 9, P.ceniza3, 10, 5);
      t(5, 6, P.ceniza2, 6, 4);
      t(8, 4, P.ceniza3, 4, 3);
      t(4, 11, P.ceniza1, 2, 2);
      if (flor) {
        t(3, 8, P.verde1, 3, 2);
        t(9, 5, P.verde2, 3, 2);
      }
      break;
    case 36: // panel solar
      sueloBase();
      t(1, 3, P.ceniza1, 14, 10);
      t(2, 4, P.agua0, 12, 8);
      for (let x = 2; x < 14; x += 4) t(x, 4, P.ceniza1, 1, 8);
      t(6, 8, P.ceniza1, 8, 1);
      t(9, 5, P.ceniza2, 3, 2);
      break;
    case 37: // enredadera sobre muro
      muroBase();
      t(2, 0, verde ? P.verde1 : P.ceniza3, 2, 16);
      t(9, 0, verde ? P.verde1 : P.ceniza3, 2, 12);
      t(1, 4, verde ? P.verde2 : P.ceniza4, 2, 2);
      t(10, 7, verde ? P.verde2 : P.ceniza4, 2, 2);
      break;
    case 38: // huerta / maceta
      sueloBase();
      t(2, 8, m.madera[0], 12, 6);
      t(3, 9, P.tierra0, 10, 4);
      if (state === 'brote') t(7, 6, P.verde2, 2, 3);
      if (verde) {
        t(4, 5, P.verde1, 2, 4);
        t(7, 4, P.verde2, 2, 5);
        t(10, 5, P.verde1, 2, 4);
      }
      if (flor) t(7, 3, P.oro1, 2, 1);
      break;
    case 39: // margarita (solo floración)
      sueloBase();
      if (flor) {
        t(7, 8, P.verde1, 1, 6);
        t(5, 5, P.papel, 5, 1);
        t(7, 3, P.papel, 1, 5);
        t(6, 4, P.papel, 3, 3);
        t(7, 5, P.oro1);
      }
      break;
    case 40: // muelle
      t(0, 0, m.madera[1], 16, 16);
      for (let y = 3; y < 16; y += 4) t(0, y, m.madera[0], 16, 1);
      t(5, 0, m.madera[0], 1, 16);
      t(11, 0, m.madera[0], 1, 16);
      break;
    case 41: // borde de muelle
      aguaBase();
      t(0, 0, m.madera[1], 16, 8);
      t(0, 7, m.madera[0], 16, 1);
      t(2, 8, m.madera[0], 2, 6);
      t(12, 8, m.madera[0], 2, 6);
      break;
    case 42: // canoa
      aguaBase();
      t(2, 6, m.madera[0], 12, 5);
      t(3, 5, m.madera[1], 10, 5);
      t(1, 7, m.madera[0], 1, 3);
      t(14, 7, m.madera[0], 1, 3);
      break;
    case 43: // red
      sueloBase();
      for (let y = 3; y < 14; y += 3) t(2, y, P.tierra2, 12, 1);
      for (let x = 2; x < 14; x += 3) t(x, 3, P.tierra2, 1, 11);
      break;
    case 44: // cartel
      sueloBase();
      t(7, 6, m.madera[0], 2, 9);
      t(2, 2, m.madera[1], 12, 6);
      t(3, 3, P.papel, 10, 4);
      t(4, 4, P.linea, 8, 1);
      t(4, 6, P.linea, 5, 1);
      break;
    case 45: // marcador de fila
      sueloBase();
      t(1, 7, P.oro0, 14, 2);
      t(1, 3, P.oro0, 2, 2);
      t(1, 11, P.oro0, 2, 2);
      break;
    case 46: // muro de carnés
      muroBase();
      for (let y = 2; y < 14; y += 4) for (let x = 2; x < 14; x += 4) t(x, y, P.papel, 3, 3);
      for (let y = 3; y < 14; y += 4) for (let x = 3; x < 14; x += 4) t(x, y, P.oro0, 1, 1);
      break;
    case 47: // piscina seca / sembrada
      if (verde) {
        t(0, 0, P.tierra0, 16, 16);
        for (let y = 0; y < 16; y++)
          for (let x = 0; x < 16; x++) if (noise(x, y) > 0.7) t(x, y, P.tierra1);
        t(3, 3, P.verde2, 2, 3);
        t(9, 7, P.verde1, 2, 3);
        t(6, 11, P.verde2, 2, 3);
        if (flor) t(12, 3, P.oro1);
      } else {
        t(0, 0, '#a9c7cc', 16, 16);
        t(0, 0, '#8fb0b6', 16, 1);
        t(0, 0, '#8fb0b6', 1, 16);
        t(8, 0, '#8fb0b6', 1, 16);
        t(0, 8, '#8fb0b6', 16, 1);
        t(3, 5, P.ceniza2, 5, 1);
        t(10, 9, P.ceniza2, 4, 1);
      }
      break;
    default: {
      // 48-63: reservado por región (provisional: variantes útiles)
      const k = i - 48;
      if (region === 'altamar') {
        if (k === 0) {
          pisoBase();
        } else if (k === 1) {
          pisoBase();
          t(6, 6, P.ceniza2, 5, 1);
          t(9, 2, P.ceniza2, 1, 5);
        } else if (k === 2) {
          pisoBase();
          t(1, 4, m.madera[0], 14, 8);
          t(2, 3, m.madera[1], 12, 8);
        } else if (k === 3) {
          t(0, 0, m.muro[0], 16, 16);
          t(3, 0, m.madera[0], 10, 16);
          t(4, 1, m.madera[1], 8, 15);
          t(6, 3, P.papel, 4, 3);
        } else if (k === 5) {
          t(0, 0, m.muro[0], 16, 16);
          for (let y = 1; y < 16; y += 3) t(1, y, m.metal, 14, 1);
        } else if (k === 6) {
          sueloBase();
          t(7, 2, '#8a5a3a', 2, 12);
          t(6, 1, '#8a5a3a', 4, 2);
        } else if (k === 7 && verde) {
          sueloBase();
          t(0, 2, P.sal0, 16, 5);
          t(0, 7, P.oro1, 16, 1);
        } else if (k === 8 && verde) {
          sueloBase();
          t(0, 3, P.linea, 16, 1);
          t(2, 4, P.agua1, 3, 5);
          t(7, 4, P.papel, 3, 6);
          t(12, 4, P.sal1, 3, 5);
        } else if (k === 10) {
          t(0, 0, '#8fb0b6', 16, 16);
          t(0, 0, '#a9c7cc', 16, 8);
        } else if (k === 11) {
          // Escalerilla de la piscina
          t(0, 0, '#8fb0b6', 16, 16);
          t(4, 0, m.metal, 2, 16);
          t(10, 0, m.metal, 2, 16);
          for (let y = 2; y < 16; y += 4) t(6, y, m.metal, 4, 1);
        } else if (k === 12) {
          sueloBase();
          t(2, 1, m.metal, 12, 10);
          t(4, 11, m.madera[0], 2, 5);
          t(10, 11, m.madera[0], 2, 5);
        } else if (k === 13) {
          muroBase();
          t(3, 2, P.ceniza0, 10, 12);
          t(4, 3, m.metal, 8, 10);
          t(7, 3, P.ceniza0, 2, 10);
        } else {
          t(0, 0, 'rgba(0,0,0,0)', 16, 16);
        }
      } else if (region === 'cienaga') {
        if (k === 0) {
          pisoBase();
          t(1, 3, m.madera[0], 14, 8);
          t(2, 4, P.verde0, 12, 6);
          t(4, 5, P.verde2, 2, 3);
          t(9, 5, P.verde1, 2, 3);
        } else if (k === 1) {
          pisoBase();
          t(2, 2, m.metal, 12, 12);
          t(3, 3, P.agua0, 10, 10);
          t(5, 6, P.agua2, 3, 1);
        } else if (k === 2) {
          muroBase();
          t(2, 2, m.madera[1], 12, 12);
          t(4, 4, P.papel, 3, 4);
          t(9, 5, P.papel, 3, 4);
        } else if (k === 3) {
          aguaBase();
          t(6, 4, m.madera[0], 4, 12);
          t(2, 9, m.madera[0], 12, 2);
        } else if (k === 5) {
          sueloBase();
          t(7, 2, m.madera[0], 2, 12);
          t(5, 0, P.oro2, 6, 3);
        } else if (k === 8) {
          pisoBase();
          t(2, 3, m.madera[1], 12, 10);
          t(3, 4, P.verde3, 10, 8);
          t(6, 6, P.oro1, 2, 2);
        } else if (k === 9) {
          aguaBase();
          t(6, 0, m.madera[1], 4, 16);
        } else if (k === 10) {
          aguaBase();
          t(6, 5, P.sal1, 4, 4);
        } else if (k === 11) {
          sueloBase();
          t(2, 2, m.madera[1], 12, 8);
          t(3, 3, P.papel, 10, 6);
          t(4, 4, P.bellium1, 8, 1);
        } else {
          t(0, 0, 'rgba(0,0,0,0)', 16, 16);
        }
      } else {
        t(0, 0, 'rgba(0,0,0,0)', 16, 16);
      }
    }
  }
}

export const REGIONES_PROVISIONALES = ['provisional', 'cienaga', 'altamar'];

export function bakeTileset(scene: Phaser.Scene, region: string, state: MapState): string {
  const key = `tiles-${region}-${state}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 64, 256);
  if (!tex) return key;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, 64, 256);
  const m = materialFor(region, state);
  for (let i = 0; i < 64; i++)
    drawCell(ctx, i, (i % 4) * 16, Math.floor(i / 4) * 16, m, state, region);
  tex.refresh();
  return key;
}

export function bakeAllTilesets(
  scene: Phaser.Scene,
  regiones: string[] = REGIONES_PROVISIONALES,
): void {
  const states: MapState[] = ['ceniza', 'brote', 'verdor', 'floracion'];
  for (const r of new Set([...REGIONES_PROVISIONALES, ...regiones]))
    for (const s of states) bakeTileset(scene, r, s);
}
