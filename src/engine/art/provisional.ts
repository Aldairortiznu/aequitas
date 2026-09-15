import type Phaser from 'phaser';
import { bakeAllTilesets } from './tilesetProvisional';
import type { LookPersonalizado } from '../../core/jugador';
import { dibujarFigura } from './figura';
import { estiloActivo } from './estilo';
import { aplicarSepia } from './tilesetProvisional';

/**
 * Arte provisional horneado por código (decisión D4). Paleta definitiva, formas simples.
 * Se reemplaza por atlas reales sin tocar el resto del motor: las claves de textura y de
 * animación son el contrato (`tiles-<estado>`, `char-<id>`, `icon-<nombre>`).
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
  piel0: '#f1c9a5',
  piel1: '#c98e5e',
  piel2: '#8a5a3a',
  piel3: '#5a3a26',
} as const;

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, color: string, w = 1, h = 1): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Tilesets provisionales: ver tilesetProvisional.ts (64 celdas por región y estado).

// ---------------------------------------------------------------------------
// Personajes: 16x24, 4 direcciones × 4 cuadros (quieto, paso 1, quieto, paso 2).
// ---------------------------------------------------------------------------

export interface CharacterLook {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  accent: string;
  cuerpo?: 'delgado' | 'medio' | 'grueso' | 'nino';
  ropa?: 'camisa' | 'vestido' | 'chaleco' | 'saco' | 'delantal' | 'bata';
  accesorio?:
    | 'morral'
    | 'panuelo'
    | 'gafas'
    | 'sombrero'
    | 'barba'
    | 'tunica'
    | 'gorra'
    | 'baston'
    | 'canasto'
    | 'llaves'
    | 'libreta';
  pelo?: 'corto' | 'largo' | 'recogido' | 'calvo' | 'gris' | 'rizado' | 'rapado' | 'melena';
}

export const LOOKS: Record<string, CharacterLook> = {
  renata: {
    skin: P.piel1,
    hair: '#2a1a12',
    top: P.bellium1,
    bottom: P.ceniza1,
    accent: P.oro1,
    accesorio: 'morral',
    pelo: 'recogido',
    cuerpo: 'delgado',
  },
  // Protagonistas alternativos (D10): misma camisa de la Escuela y morral, otro cuerpo.
  ramiro: {
    skin: P.piel1,
    hair: '#2a1a12',
    top: P.bellium1,
    bottom: P.ceniza1,
    accent: P.oro1,
    accesorio: 'morral',
    pelo: 'corto',
    cuerpo: 'medio',
  },
  ariel: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.bellium1,
    bottom: P.ceniza2,
    accent: P.oro1,
    accesorio: 'gafas',
    pelo: 'rapado',
    cuerpo: 'delgado',
  },
  cruz: {
    skin: P.piel0,
    hair: '#3a2a1a',
    top: P.bellium1,
    bottom: P.ceniza1,
    accent: P.oro1,
    accesorio: 'panuelo',
    pelo: 'melena',
    cuerpo: 'delgado',
  },
  pilar: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.agua0,
    bottom: P.tierra0,
    accent: P.oro1,
    accesorio: 'panuelo',
    pelo: 'rizado',
    cuerpo: 'medio',
  },
  prudencio: {
    skin: P.piel0,
    hair: '#3a2a1a',
    top: P.papel2,
    bottom: P.ceniza2,
    accent: P.ceniza0,
    accesorio: 'gafas',
    pelo: 'corto',
    cuerpo: 'delgado',
    ropa: 'chaleco',
  },
  gerineldo: {
    skin: P.piel2,
    hair: '#d8d2c4',
    top: P.ceniza3,
    bottom: P.ceniza1,
    accent: P.tierra1,
    accesorio: 'baston',
    pelo: 'gris',
    cuerpo: 'delgado',
    ropa: 'saco',
  },
  clemencia: {
    skin: P.piel1,
    hair: '#c9c2b2',
    top: P.bellium0,
    bottom: P.ceniza1,
    accent: P.oro2,
    accesorio: 'gafas',
    pelo: 'recogido',
    cuerpo: 'delgado',
    ropa: 'saco',
  },
  nepomuceno: {
    skin: P.piel1,
    hair: '#4a3a2a',
    top: P.verde0,
    bottom: P.tierra0,
    accent: P.verde2,
    accesorio: 'barba',
    pelo: 'calvo',
    cuerpo: 'medio',
    ropa: 'chaleco',
  },
  casimiro: {
    skin: P.piel0,
    hair: '#1a1a1a',
    top: P.bellium2,
    bottom: P.ceniza1,
    accent: P.papel,
    accesorio: 'morral',
    pelo: 'corto',
    cuerpo: 'delgado',
    ropa: 'bata',
  },
  moscote: {
    skin: P.piel0,
    hair: '#8a8478',
    top: P.ceniza1,
    bottom: P.ceniza0,
    accent: P.oro0,
    accesorio: 'gafas',
    pelo: 'gris',
    cuerpo: 'delgado',
    ropa: 'saco',
  },
  alguacil: {
    skin: P.piel1,
    hair: '#2a2a2a',
    top: P.ceniza2,
    bottom: P.ceniza1,
    accent: P.oro0,
    accesorio: 'gorra',
    pelo: 'corto',
    cuerpo: 'medio',
    ropa: 'chaleco',
  },
  estudiante: {
    skin: P.piel1,
    hair: '#2a1a12',
    top: P.agua1,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'corto',
  },
  vecino: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.tierra2,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'corto',
  },
  'vecino-1': {
    skin: P.piel1,
    hair: '#2a1a12',
    top: P.sal1,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'largo',
    ropa: 'vestido',
  },
  'vecino-2': {
    skin: P.piel3,
    hair: '#1a1210',
    top: P.agua0,
    bottom: P.tierra0,
    accent: P.papel,
    pelo: 'corto',
  },
  'vecino-3': {
    skin: P.piel2,
    hair: '#c9c2b2',
    top: P.papel2,
    bottom: P.ceniza2,
    accent: P.tierra1,
    pelo: 'recogido',
    ropa: 'vestido',
  },
  'vecino-4': {
    skin: P.piel1,
    hair: '#1a1a1a',
    top: P.verde2,
    bottom: P.ceniza1,
    accent: P.papel,
    pelo: 'corto',
  },
  eladio: {
    skin: P.piel2,
    hair: '#2a1a12',
    top: P.tierra2,
    bottom: P.ceniza2,
    accent: P.tierra1,
    accesorio: 'sombrero',
    pelo: 'corto',
    cuerpo: 'medio',
  },
  'estudiante-2': {
    skin: P.piel2,
    hair: '#3a2a1a',
    top: P.agua2,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'largo',
  },
  marrugo: {
    skin: P.piel1,
    hair: '#4a4850',
    top: P.papel2,
    bottom: P.ceniza1,
    accent: P.oro1,
    accesorio: 'llaves',
    pelo: 'calvo',
    cuerpo: 'grueso',
  },
  tomas: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.oro2,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'rizado',
    cuerpo: 'nino',
  },
  zoraida: {
    skin: P.piel2,
    hair: '#a29ea8',
    top: P.agua0,
    bottom: P.papel,
    accent: P.papel,
    accesorio: 'libreta',
    pelo: 'recogido',
    cuerpo: 'grueso',
    ropa: 'delantal',
  },
  vigilante: {
    skin: P.piel1,
    hair: '#2a2a2a',
    top: P.ceniza2,
    bottom: P.ceniza1,
    accent: P.oro0,
    accesorio: 'baston',
    pelo: 'corto',
    cuerpo: 'medio',
    ropa: 'chaleco',
  },
};

export type Dir = 'down' | 'left' | 'right' | 'up';
export const DIRS: Dir[] = ['down', 'left', 'right', 'up'];

function drawCharacterFrame(
  ctx: Ctx,
  ox: number,
  oy: number,
  look: CharacterLook,
  dir: Dir,
  frame: number,
): void {
  dibujarFigura(ctx, ox, oy, look, dir, frame, estiloActivo());
}

export function ensureCharacterAnims(scene: Phaser.Scene, key: string): void {
  DIRS.forEach((dir) => {
    if (!scene.anims.exists(`${key}-walk-${dir}`)) {
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: [0, 1, 2, 3].map((f) => ({ key, frame: `${dir}-${f}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-idle-${dir}`)) {
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: [{ key, frame: `${dir}-0` }],
        frameRate: 1,
      });
    }
  });
}

export function bakeCharacter(scene: Phaser.Scene, id: string): string {
  const key = `char-${id}`;
  if (scene.textures.exists(key)) {
    ensureCharacterAnims(scene, key);
    return key;
  }
  const look = LOOKS[id] ?? LOOKS.vecino!;
  const tex = scene.textures.createCanvas(key, 64, 96);
  if (!tex) return key;
  const ctx = tex.getContext();
  DIRS.forEach((dir, row) => {
    for (let frame = 0; frame < 4; frame++) {
      drawCharacterFrame(ctx, frame * 16, row * 24, look, dir, frame);
    }
  });
  if (estiloActivo().posproceso === 'sepia') aplicarSepia(ctx, 64, 96);
  tex.refresh();
  DIRS.forEach((dir, row) => {
    for (let frame = 0; frame < 4; frame++) {
      tex.add(`${dir}-${frame}`, 0, frame * 16, row * 24, 16, 24);
    }
    if (!scene.anims.exists(`${key}-walk-${dir}`)) {
      scene.anims.create({
        key: `${key}-walk-${dir}`,
        frames: [0, 1, 2, 3].map((f) => ({ key, frame: `${dir}-${f}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(`${key}-idle-${dir}`)) {
      scene.anims.create({
        key: `${key}-idle-${dir}`,
        frames: [{ key, frame: `${dir}-0` }],
        frameRate: 1,
      });
    }
  });
  return key;
}

/** Tonos de piel del creador de personaje (índice 0-3), en la paleta. */
export const PIELES = [P.piel0, P.piel1, P.piel2, P.piel3] as const;
/** Opciones de color del creador (nombre → hex de la paleta). */
export const COLORES_PELO: Record<string, string> = {
  negro: '#1a1210',
  castano: '#3a2a1a',
  cobre: P.tierra1,
  gris: '#c9c2b2',
};
export const COLORES_ROPA: Record<string, string> = {
  violeta: P.bellium1,
  violetaOscuro: P.bellium0,
  agua: P.agua0,
  verde: P.verde0,
  tierra: P.tierra0,
  ceniza: P.ceniza2,
  papel: P.papel2,
  oro: P.oro0,
};

/** Convierte los parámetros del creador en un aspecto dibujable. */
export function lookDesdePersonalizado(c: LookPersonalizado): CharacterLook {
  return {
    skin: PIELES[c.piel] ?? P.piel1,
    hair: c.colorPelo,
    top: c.camisa,
    bottom: c.pantalon,
    accent: P.oro1,
    accesorio: c.accesorio === 'ninguno' ? undefined : c.accesorio,
    pelo: c.pelo,
  };
}

/** Hornea (o rehornea) un aspecto arbitrario bajo una clave dada. */
export function bakeCharacterLook(scene: Phaser.Scene, key: string, look: CharacterLook): string {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, 64, 96);
  if (!tex) return key;
  const ctx = tex.getContext();
  DIRS.forEach((dir, row) => {
    for (let frame = 0; frame < 4; frame++) {
      drawCharacterFrame(ctx, frame * 16, row * 24, look, dir, frame);
    }
  });
  if (estiloActivo().posproceso === 'sepia') aplicarSepia(ctx, 64, 96);
  tex.refresh();
  DIRS.forEach((dir, row) => {
    for (let frame = 0; frame < 4; frame++) {
      tex.add(`${dir}-${frame}`, 0, frame * 16, row * 24, 16, 24);
    }
  });
  ensureCharacterAnims(scene, key);
  return key;
}

/**
 * Dibuja un aspecto en un canvas DOM (para el creador de personaje del menú, sin Phaser).
 * Devuelve un canvas de 16×24 escalado `scale` veces con vecino más cercano.
 */
export function renderLook(
  look: CharacterLook,
  dir: Dir,
  frame: number,
  scale = 6,
): HTMLCanvasElement {
  const base = document.createElement('canvas');
  base.width = 16;
  base.height = 24;
  const ctx = base.getContext('2d');
  if (ctx) drawCharacterFrame(ctx, 0, 0, look, dir, frame);
  const out = document.createElement('canvas');
  out.width = 16 * scale;
  out.height = 24 * scale;
  const octx = out.getContext('2d');
  if (octx) {
    octx.imageSmoothingEnabled = false;
    octx.drawImage(base, 0, 0, out.width, out.height);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Iconos
// ---------------------------------------------------------------------------

export function bakeIcons(scene: Phaser.Scene): void {
  const make = (key: string, w: number, h: number, draw: (ctx: Ctx) => void): void => {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, w, h);
    if (!tex) return;
    draw(tex.getContext());
    tex.refresh();
  };
  make('icon-hablar', 10, 9, (c) => {
    px(c, 1, 0, P.papel, 8, 6);
    px(c, 0, 1, P.papel, 10, 4);
    px(c, 3, 6, P.papel, 2, 2);
    px(c, 3, 2, P.ceniza0);
    px(c, 5, 2, P.ceniza0);
    px(c, 7, 2, P.ceniza0);
  });
  make('icon-documento', 10, 12, (c) => {
    px(c, 0, 0, P.papel, 8, 12);
    px(c, 8, 2, P.papel, 2, 10);
    px(c, 7, 0, P.linea, 1, 3);
    px(c, 2, 3, P.linea, 5, 1);
    px(c, 2, 5, P.linea, 6, 1);
    px(c, 2, 7, P.linea, 4, 1);
    px(c, 2, 9, P.oro0, 3, 1);
  });
  make('icon-folio', 10, 12, (c) => {
    px(c, 0, 0, P.papel2, 10, 12);
    px(c, 1, 2, P.bellium1, 8, 1);
    px(c, 1, 4, P.linea, 8, 1);
    px(c, 1, 6, P.linea, 6, 1);
    px(c, 1, 8, P.linea, 7, 1);
    px(c, 6, 10, P.oro0, 3, 1);
  });
  make('icon-testimonio', 10, 10, (c) => {
    px(c, 3, 0, P.piel1, 4, 4);
    px(c, 2, 4, P.agua0, 6, 5);
    px(c, 0, 6, P.papel, 3, 3);
  });
  make('icon-alerta', 8, 10, (c) => {
    px(c, 3, 0, P.oro1, 2, 6);
    px(c, 3, 8, P.oro1, 2, 2);
  });
  make('icon-objetivo', 11, 12, (c) => {
    // Flecha dorada hacia abajo con borde de tinta: marcador del objetivo guiado.
    px(c, 4, 0, P.ceniza0, 3, 7);
    px(c, 5, 0, P.oro1, 1, 7);
    px(c, 1, 6, P.ceniza0, 9, 1);
    px(c, 2, 7, P.ceniza0, 7, 1);
    px(c, 3, 8, P.ceniza0, 5, 1);
    px(c, 4, 9, P.ceniza0, 3, 1);
    px(c, 5, 10, P.ceniza0, 1, 2);
    px(c, 2, 6, P.oro1, 7, 1);
    px(c, 3, 7, P.oro1, 5, 1);
    px(c, 4, 8, P.oro1, 3, 1);
    px(c, 5, 9, P.oro1, 1, 1);
  });
  make('icon-ojo', 9, 6, (c) => {
    px(c, 1, 1, P.papel, 7, 4);
    px(c, 0, 2, P.papel, 9, 2);
    px(c, 3, 2, P.ceniza0, 3, 2);
  });
  make('px', 1, 1, (c) => px(c, 0, 0, '#ffffff'));
}

export function bakeAll(
  scene: Phaser.Scene,
  characterIds: string[],
  regiones: string[] = [],
): void {
  bakeAllTilesets(scene, regiones);
  bakeIcons(scene);
  for (const id of characterIds) bakeCharacter(scene, id);
}
