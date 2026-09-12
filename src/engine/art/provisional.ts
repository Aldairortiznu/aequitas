import type Phaser from 'phaser';
import { bakeAllTilesets } from './tilesetProvisional';

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
  accesorio?:
    | 'morral'
    | 'panuelo'
    | 'gafas'
    | 'sombrero'
    | 'barba'
    | 'tunica'
    | 'gorra'
    | 'baston'
    | 'canasto';
  pelo?: 'corto' | 'largo' | 'recogido' | 'calvo' | 'gris';
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
  },
  pilar: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.agua0,
    bottom: P.tierra0,
    accent: P.oro1,
    accesorio: 'panuelo',
    pelo: 'largo',
  },
  prudencio: {
    skin: P.piel0,
    hair: '#3a2a1a',
    top: P.papel2,
    bottom: P.ceniza2,
    accent: P.ceniza0,
    accesorio: 'gafas',
    pelo: 'corto',
  },
  gerineldo: {
    skin: P.piel2,
    hair: '#d8d2c4',
    top: P.ceniza3,
    bottom: P.ceniza1,
    accent: P.tierra1,
    accesorio: 'sombrero',
    pelo: 'gris',
  },
  clemencia: {
    skin: P.piel1,
    hair: '#c9c2b2',
    top: P.bellium0,
    bottom: P.ceniza1,
    accent: P.oro2,
    accesorio: 'gafas',
    pelo: 'recogido',
  },
  nepomuceno: {
    skin: P.piel1,
    hair: '#4a3a2a',
    top: P.verde0,
    bottom: P.tierra0,
    accent: P.verde2,
    accesorio: 'barba',
    pelo: 'calvo',
  },
  casimiro: {
    skin: P.piel0,
    hair: '#1a1a1a',
    top: P.bellium2,
    bottom: P.ceniza1,
    accent: P.papel,
    accesorio: 'tunica',
    pelo: 'corto',
  },
  moscote: {
    skin: P.piel0,
    hair: '#8a8478',
    top: P.ceniza1,
    bottom: P.ceniza0,
    accent: P.oro0,
    accesorio: 'gafas',
    pelo: 'gris',
  },
  alguacil: {
    skin: P.piel1,
    hair: '#2a2a2a',
    top: P.ceniza2,
    bottom: P.ceniza1,
    accent: P.oro0,
    accesorio: 'gorra',
    pelo: 'corto',
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
    accesorio: 'canasto',
    pelo: 'calvo',
  },
  tomas: {
    skin: P.piel2,
    hair: '#1a1210',
    top: P.oro2,
    bottom: P.ceniza2,
    accent: P.papel,
    pelo: 'corto',
  },
  zoraida: {
    skin: P.piel2,
    hair: '#a29ea8',
    top: P.agua0,
    bottom: P.papel,
    accent: P.papel,
    accesorio: 'panuelo',
    pelo: 'recogido',
  },
  vigilante: {
    skin: P.piel1,
    hair: '#2a2a2a',
    top: P.ceniza2,
    bottom: P.ceniza1,
    accent: P.oro0,
    accesorio: 'baston',
    pelo: 'corto',
  },
};

type Dir = 'down' | 'left' | 'right' | 'up';
export const DIRS: Dir[] = ['down', 'left', 'right', 'up'];

function drawCharacterFrame(
  ctx: Ctx,
  ox: number,
  oy: number,
  look: CharacterLook,
  dir: Dir,
  frame: number,
): void {
  const t = (x: number, y: number, c: string, w = 1, h = 1): void =>
    px(ctx, ox + x, oy + y, c, w, h);
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0; // desplazamiento de piernas
  const bob = step === 0 ? 0 : 1;
  const flip = dir === 'left';
  const X = (x: number, w = 1): number => (flip ? 16 - x - w : x);

  // Sombra
  t(4, 22, 'rgba(0,0,0,0.35)', 8, 2);
  // Piernas
  const legY = 16 - bob;
  if (dir === 'up' || dir === 'down') {
    t(5, legY, look.bottom, 2, 6 + bob);
    t(9, legY, look.bottom, 2, 6 + bob);
    if (step !== 0) {
      t(5, legY + 4, look.bottom, 2, 2 + step);
      t(9, legY + 4, look.bottom, 2, 2 - step);
    }
  } else {
    t(X(6, 2), legY, look.bottom, 2, 6 + bob);
    t(X(8 + step * 2, 2), legY, look.bottom, 2, 6 + bob);
  }
  // Zapatos
  t(5, 21, P.ceniza0, 2, 1);
  t(9, 21, P.ceniza0, 2, 1);
  // Cuerpo
  const bodyY = 9 - bob;
  t(4, bodyY, look.top, 8, 8);
  if (look.accesorio === 'tunica') t(3, bodyY + 2, look.top, 10, 7);
  // Brazos
  if (dir === 'up' || dir === 'down') {
    t(3, bodyY + 1, look.skin, 1, 5);
    t(12, bodyY + 1, look.skin, 1, 5);
  } else {
    t(X(7), bodyY + 1 + Math.abs(step), look.skin, 1, 5);
  }
  // Accesorios de cuerpo
  if (look.accesorio === 'morral' && dir !== 'up') t(X(10, 3), bodyY + 3, look.accent, 3, 4);
  if (look.accesorio === 'morral' && dir === 'up') t(4, bodyY + 2, look.accent, 8, 1);
  if (look.accesorio === 'panuelo') t(4, bodyY, look.accent, 8, 1);
  if (look.accesorio === 'canasto') t(X(11, 3), bodyY + 3, P.tierra1, 3, 3);
  if (look.accesorio === 'baston' && dir !== 'up') t(X(13), bodyY, P.tierra0, 1, 12);
  // Cabeza
  const headY = 2 - bob;
  t(5, headY, look.skin, 6, 7);
  // Pelo
  if (look.pelo !== 'calvo') {
    t(5, headY, look.hair, 6, 2);
    t(4, headY + 1, look.hair, 1, 3);
    t(11, headY + 1, look.hair, 1, 3);
    if (look.pelo === 'largo') {
      t(4, headY + 1, look.hair, 1, 7);
      t(11, headY + 1, look.hair, 1, 7);
    }
    if (look.pelo === 'recogido' && dir !== 'down') t(X(11, 2), headY + 3, look.hair, 2, 2);
    if (dir === 'up') t(5, headY, look.hair, 6, 6);
  } else {
    t(5, headY, look.skin, 6, 2);
    t(4, headY + 2, look.hair, 1, 2);
    t(11, headY + 2, look.hair, 1, 2);
  }
  // Cara
  if (dir === 'down') {
    t(6, headY + 4, P.ceniza0);
    t(9, headY + 4, P.ceniza0);
    if (look.accesorio === 'gafas') {
      t(5, headY + 4, look.accent, 3, 1);
      t(8, headY + 4, look.accent, 3, 1);
    }
    if (look.accesorio === 'barba') t(6, headY + 6, look.hair, 4, 2);
  } else if (dir !== 'up') {
    t(X(9), headY + 4, P.ceniza0);
    if (look.accesorio === 'gafas') t(X(8, 3), headY + 4, look.accent, 3, 1);
    if (look.accesorio === 'barba') t(X(7, 3), headY + 6, look.hair, 3, 2);
  }
  // Sombrero / gorra
  if (look.accesorio === 'sombrero') {
    t(3, headY, look.accent, 10, 1);
    t(5, headY - 2, look.accent, 6, 2);
  }
  if (look.accesorio === 'gorra') {
    t(5, headY - 1, look.accent, 6, 2);
    if (dir === 'down') t(4, headY + 1, look.accent, 8, 1);
    else if (dir !== 'up') t(X(4, 4), headY + 1, look.accent, 4, 1);
  }
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
