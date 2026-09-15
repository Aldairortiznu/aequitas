import type Phaser from 'phaser';
import type { MapState } from '../../core/content/schema';
import { GAME_HEIGHT, GAME_WIDTH } from '../../config';

/**
 * Fondo del mundo lateral, construido por código: cielo, siluetas lejanas de la región,
 * vegetación en dos planos con paralaje y un primer plano de lianas y hojas. La vegetación
 * cambia con el estado de la región (ceniza → floración), que es el Reverdecer visto de
 * lado. Dirección pidió que se viera «botánico», como Animal Well o Chasm: denso, oscuro,
 * con acentos que brillan.
 */
/** Las capas son imágenes fijas con factor de desplazamiento; no hay trabajo por cuadro. */
export type FondoLateral = Phaser.GameObjects.Image[];

type Ctx = CanvasRenderingContext2D;

interface Paleta {
  cieloArriba: string;
  cieloAbajo: string;
  lejos: string;
  medio: string;
  cerca: string;
  primer: string;
  acento: string | null;
}

const PALETAS: Record<MapState, Paleta> = {
  ceniza: {
    cieloArriba: '#2e2d33',
    cieloAbajo: '#7a7780',
    lejos: '#4a4850',
    medio: '#3a3c3d',
    cerca: '#26282a',
    primer: '#1b1b1f',
    acento: null,
  },
  brote: {
    cieloArriba: '#2f3236',
    cieloAbajo: '#8a8c82',
    lejos: '#4d5350',
    medio: '#34483b',
    cerca: '#24332a',
    primer: '#181f1a',
    acento: null,
  },
  verdor: {
    cieloArriba: '#243a42',
    cieloAbajo: '#9fb08f',
    lejos: '#3d5a52',
    medio: '#2f5d3a',
    cerca: '#1f4029',
    primer: '#14231a',
    acento: '#7cc46b',
  },
  floracion: {
    cieloArriba: '#3b2a5c',
    cieloAbajo: '#d9a66b',
    lejos: '#4a5a6a',
    medio: '#3f7a48',
    cerca: '#2f5d3a',
    primer: '#1a2e20',
    acento: '#f4dc8a',
  },
};

const INTERIOR: Record<string, string> = {
  altamar: '#2a2930',
  cienaga: '#242c27',
  gimnasio: '#2a2930',
  provisional: '#2a2930',
};

/** Generador determinista (mulberry32) para que el fondo sea el mismo en cada carga. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ primitivas vegetales

function palma(c: Ctx, x: number, base: number, h: number, col: string, r: () => number): void {
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = Math.max(2, h / 22);
  const lean = (r() - 0.5) * h * 0.35;
  c.beginPath();
  c.moveTo(x, base);
  c.quadraticCurveTo(x + lean * 0.3, base - h * 0.6, x + lean, base - h);
  c.stroke();
  const tx = x + lean;
  const ty = base - h;
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * 0.95 + (i / (n - 1)) * Math.PI * 0.9 + (r() - 0.5) * 0.3;
    const len = h * (0.32 + r() * 0.18);
    const ex = tx + Math.cos(a) * len;
    const ey = ty + Math.sin(a) * len * 0.55 + len * 0.35;
    c.beginPath();
    c.moveTo(tx, ty);
    c.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.1, ex, ey);
    c.lineTo(ex - Math.cos(a) * 3, ey + 3);
    c.quadraticCurveTo(tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.2 + 4, tx, ty + 3);
    c.closePath();
    c.fill();
  }
}

function mangle(c: Ctx, x: number, base: number, h: number, col: string, r: () => number): void {
  c.fillStyle = col;
  c.strokeStyle = col;
  c.lineWidth = Math.max(2, h / 18);
  // Raíces en arco
  const raices = 3 + Math.floor(r() * 3);
  for (let i = 0; i < raices; i++) {
    const dx = (r() - 0.5) * h * 0.9;
    const top = base - h * (0.25 + r() * 0.2);
    c.beginPath();
    c.moveTo(x, top);
    c.quadraticCurveTo(x + dx * 0.7, top + (base - top) * 0.3, x + dx, base);
    c.stroke();
  }
  // Tronco
  c.lineWidth = Math.max(3, h / 12);
  c.beginPath();
  c.moveTo(x, base - h * 0.2);
  c.lineTo(x + (r() - 0.5) * 6, base - h * 0.7);
  c.stroke();
  // Copa: manchas
  const cx = x + (r() - 0.5) * 8;
  const cy = base - h * 0.78;
  for (let i = 0; i < 5; i++) {
    const ox = (r() - 0.5) * h * 0.7;
    const oy = (r() - 0.5) * h * 0.25;
    c.beginPath();
    c.ellipse(
      cx + ox,
      cy + oy,
      h * (0.16 + r() * 0.12),
      h * (0.09 + r() * 0.06),
      0,
      0,
      Math.PI * 2,
    );
    c.fill();
  }
}

function helecho(c: Ctx, x: number, base: number, s: number, col: string, r: () => number): void {
  c.strokeStyle = col;
  c.fillStyle = col;
  const n = 4 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 0.9;
    const len = s * (0.6 + r() * 0.6);
    const ex = x + Math.cos(a) * len;
    const ey = base + Math.sin(a) * len;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x, base);
    c.quadraticCurveTo(x + Math.cos(a) * len * 0.5, base + Math.sin(a) * len * 0.5 - 4, ex, ey);
    c.stroke();
    // foliolos
    const k = Math.floor(len / 5);
    for (let j = 1; j < k; j++) {
      const t = j / k;
      const px = x + (ex - x) * t;
      const py = base + (ey - base) * t - 4 * Math.sin(t * Math.PI);
      const w = (1 - t) * 5 + 1;
      c.beginPath();
      c.ellipse(px, py, w, 1.6, a + Math.PI / 2, 0, Math.PI * 2);
      c.fill();
    }
  }
}

function junco(c: Ctx, x: number, base: number, h: number, col: string, r: () => number): void {
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = 1;
  const n = 3 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const dx = (r() - 0.5) * 10;
    const hh = h * (0.6 + r() * 0.5);
    c.beginPath();
    c.moveTo(x + dx, base);
    c.quadraticCurveTo(
      x + dx + (r() - 0.5) * 6,
      base - hh * 0.6,
      x + dx + (r() - 0.5) * 8,
      base - hh,
    );
    c.stroke();
    if (r() > 0.6) c.fillRect(x + dx - 1, base - hh - 5, 2, 6);
  }
}

function arbusto(c: Ctx, x: number, base: number, rad: number, col: string, r: () => number): void {
  c.fillStyle = col;
  const n = 4 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const ox = (r() - 0.5) * rad * 1.6;
    const oy = -r() * rad * 0.9;
    const rr = rad * (0.35 + r() * 0.4);
    c.beginPath();
    c.arc(x + ox, base + oy, rr, 0, Math.PI * 2);
    c.fill();
  }
}

function liana(c: Ctx, x: number, top: number, len: number, col: string, r: () => number): void {
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = 1.5;
  const sway = (r() - 0.5) * 24;
  c.beginPath();
  c.moveTo(x, top);
  c.quadraticCurveTo(x + sway, top + len * 0.5, x + sway * 0.4, top + len);
  c.stroke();
  const k = Math.floor(len / 9);
  for (let j = 1; j <= k; j++) {
    const t = j / (k + 1);
    const px = x + sway * (2 * t * (1 - t)) + sway * 0.4 * t * t;
    const py = top + len * t;
    const side = j % 2 ? 1 : -1;
    c.beginPath();
    c.ellipse(px + side * 3, py, 4, 2, side * 0.6, 0, Math.PI * 2);
    c.fill();
  }
}

function torre(
  c: Ctx,
  x: number,
  base: number,
  w: number,
  h: number,
  col: string,
  r: () => number,
): void {
  c.fillStyle = col;
  c.fillRect(x, base - h, w, h);
  // ventanas apagadas (huecos ligeramente más claros) y antena
  c.fillStyle = 'rgba(255,255,255,0.05)';
  for (let y = base - h + 6; y < base - 6; y += 9) {
    for (let xx = x + 3; xx < x + w - 4; xx += 7) if (r() > 0.45) c.fillRect(xx, y, 3, 4);
  }
  c.fillStyle = col;
  if (r() > 0.5) c.fillRect(x + w / 2 - 1, base - h - 8, 2, 8);
}

function puntosLuz(
  c: Ctx,
  w: number,
  y0: number,
  y1: number,
  col: string,
  n: number,
  r: () => number,
): void {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = y0 + r() * (y1 - y0);
    c.globalAlpha = 0.35 + r() * 0.5;
    c.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  c.globalAlpha = 1;
}

// ------------------------------------------------------------------ capas

const ANCHO = GAME_WIDTH * 2; // el patrón se repite cada dos pantallas

/**
 * Lienzo de una capa. `y0` recorta la textura a la banda vertical que usa (las capas de
 * vegetación solo ocupan la parte baja de la pantalla): el dibujo sigue en coordenadas de
 * pantalla y la imagen se coloca en `y0`. Menos píxeles transparentes que pintar por cuadro.
 */
function lienzo(scene: Phaser.Scene, key: string, w: number, h: number, y0 = 0): Ctx | null {
  if (scene.textures.exists(key)) return null;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return null;
  const c = tex.getContext();
  c.translate(0, -y0);
  return c;
}

function refrescar(scene: Phaser.Scene, key: string): void {
  const tex = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  tex.refresh();
}

export function crearFondoLateral(
  scene: Phaser.Scene,
  opts: { region: string; estado: MapState; interior: boolean; ancho: number; alto: number },
): FondoLateral {
  const pal = PALETAS[opts.estado];
  const H = GAME_HEIGHT;
  const horizonte = H - 46; // línea del suelo en pantalla (mapas de 17 filas: suelo en la 14)
  const base = `fondo-${opts.region}-${opts.estado}`;
  const capas: Phaser.GameObjects.Image[] = [];
  /**
   * Coloca copias de una textura de ANCHO px para cubrir la cámara en todo el recorrido del
   * mapa con el factor de desplazamiento dado (sin TileSprite: no se redibuja por cuadro).
   */
  const extender = (
    key: string,
    fx: number,
    fy: number,
    depth: number,
    alpha = 1,
    y0 = 0,
    repetirY = false,
  ): void => {
    const recorridoX = Math.max(0, opts.ancho - GAME_WIDTH) * fx + GAME_WIDTH;
    const recorridoY = Math.max(0, opts.alto - H) * fy + H;
    const nx = Math.ceil(recorridoX / ANCHO) + 1;
    const ny = repetirY ? Math.max(1, Math.ceil((recorridoY - 8) / H)) : 1;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        capas.push(
          scene.add
            .image(i * ANCHO, j * H + y0, key)
            .setOrigin(0, 0)
            .setScrollFactor(fx, fy)
            .setDepth(depth)
            .setAlpha(alpha),
        );
      }
    }
  };

  if (opts.interior) {
    // Plano de pared del interior con un rastro de textura y humedad
    const key = `${base}-interior`;
    const c = lienzo(scene, key, ANCHO, H);
    if (c) {
      const r = rng(11);
      c.fillStyle = INTERIOR[opts.region] ?? INTERIOR.provisional!;
      c.fillRect(0, 0, ANCHO, H);
      c.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = 0; y < H; y += 16) c.fillRect(0, y, ANCHO, 1);
      for (let x = 0; x < ANCHO; x += 32)
        c.fillRect(x + (Math.floor(x / 32) % 2 ? 16 : 0), 0, 1, H);
      // manchas de humedad y musgo según el estado
      const musgo = opts.estado === 'ceniza' ? 'rgba(90,95,90,0.16)' : 'rgba(74,138,79,0.16)';
      c.fillStyle = musgo;
      for (let i = 0; i < 26; i++) {
        c.beginPath();
        c.ellipse(r() * ANCHO, r() * H, 10 + r() * 30, 4 + r() * 10, 0, 0, Math.PI * 2);
        c.fill();
      }
      refrescar(scene, key);
    }
    extender(key, 1, 1, -5, 1, 0, true);
    return capas;
  }

  // --- Cielo
  {
    const key = `${base}-cielo`;
    const c = lienzo(scene, key, GAME_WIDTH, H);
    if (c) {
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, pal.cieloArriba);
      g.addColorStop(1, pal.cieloAbajo);
      c.fillStyle = g;
      c.fillRect(0, 0, GAME_WIDTH, H);
      if (pal.acento) puntosLuz(c, GAME_WIDTH, 0, H * 0.5, pal.acento, 40, rng(3));
      refrescar(scene, key);
    }
    capas.push(scene.add.image(0, 0, key).setOrigin(0, 0).setScrollFactor(0).setDepth(-6));
  }

  // --- Lejos: perfil de la región
  {
    const key = `${base}-lejos`;
    const y0 = horizonte - 150;
    const c = lienzo(scene, key, ANCHO, H - y0, y0);
    if (c) {
      const r = rng(7);
      let x = 0;
      while (x < ANCHO) {
        if (opts.region === 'altamar') {
          const w = 16 + Math.floor(r() * 30);
          const h = 50 + Math.floor(r() * 90);
          torre(c, x, horizonte, w, h, pal.lejos, r);
          x += w + 4 + Math.floor(r() * 14);
          if (r() > 0.7) palma(c, x, horizonte, 38 + r() * 16, pal.lejos, r);
        } else if (opts.region === 'cienaga') {
          mangle(c, x, horizonte, 60 + r() * 50, pal.lejos, r);
          x += 30 + Math.floor(r() * 40);
        } else {
          // colinas suaves con palmas
          c.fillStyle = pal.lejos;
          const w = 120 + r() * 160;
          c.beginPath();
          c.moveTo(x - 10, horizonte);
          c.quadraticCurveTo(x + w / 2, horizonte - 50 - r() * 50, x + w + 10, horizonte);
          c.closePath();
          c.fill();
          palma(c, x + w * 0.3, horizonte - 20, 30 + r() * 20, pal.lejos, r);
          x += w * 0.8;
        }
      }
      refrescar(scene, key);
    }
    extender(key, 0.15, 0.05, -5, 1, y0);
  }

  // --- Medio: banda densa de vegetación
  {
    const key = `${base}-medio`;
    const y0 = horizonte - 80;
    const c = lienzo(scene, key, ANCHO, H - y0, y0);
    if (c) {
      const r = rng(13);
      c.fillStyle = pal.medio;
      c.fillRect(0, horizonte + 6, ANCHO, H - horizonte);
      for (let x = 0; x < ANCHO; x += 6 + Math.floor(r() * 10)) {
        const k = r();
        if (k < 0.35) helecho(c, x, horizonte + 8, 16 + r() * 14, pal.medio, r);
        else if (k < 0.6) junco(c, x, horizonte + 8, 22 + r() * 18, pal.medio, r);
        else if (k < 0.8) arbusto(c, x, horizonte + 8, 8 + r() * 10, pal.medio, r);
        else if (opts.region === 'cienaga')
          mangle(c, x, horizonte + 8, 40 + r() * 30, pal.medio, r);
        else palma(c, x, horizonte + 8, 40 + r() * 30, pal.medio, r);
      }
      if (pal.acento) puntosLuz(c, ANCHO, horizonte - 30, H, pal.acento, 90, r);
      refrescar(scene, key);
    }
    extender(key, 0.4, 0.15, -4, 1, y0);
  }

  // --- Cerca: plantas grandes sueltas, detrás de los tiles
  {
    const key = `${base}-cerca`;
    const y0 = horizonte - 110;
    const c = lienzo(scene, key, ANCHO, H - y0, y0);
    if (c) {
      const r = rng(21);
      for (let x = 20; x < ANCHO; x += 70 + Math.floor(r() * 120)) {
        const k = r();
        if (opts.region === 'cienaga' && k < 0.5)
          mangle(c, x, horizonte + 22, 70 + r() * 40, pal.cerca, r);
        else if (k < 0.7) palma(c, x, horizonte + 22, 60 + r() * 40, pal.cerca, r);
        else helecho(c, x, horizonte + 20, 26 + r() * 16, pal.cerca, r);
      }
      refrescar(scene, key);
    }
    extender(key, 0.7, 0.4, -3, 1, y0);
  }

  // --- Primer plano: lianas desde arriba y hojas abajo, por delante de todo (dos bandas)
  {
    const arriba = `${base}-primer-arriba`;
    const c = lienzo(scene, arriba, ANCHO, 60);
    if (c) {
      const r = rng(31);
      for (let x = 10; x < ANCHO; x += 40 + Math.floor(r() * 90)) {
        liana(c, x, -4, 18 + r() * 34, pal.primer, r);
      }
      refrescar(scene, arriba);
    }
    extender(arriba, 1.25, 0, 12000, 0.9);
    const abajo = `${base}-primer-abajo`;
    const y0 = H - 44;
    const c2 = lienzo(scene, abajo, ANCHO, 44, y0);
    if (c2) {
      const r = rng(37);
      for (let x = 0; x < ANCHO; x += 90 + Math.floor(r() * 160)) {
        helecho(c2, x, H + 6, 22 + r() * 18, pal.primer, r);
      }
      refrescar(scene, abajo);
    }
    extender(abajo, 1.25, 0, 12000, 0.9, y0);
  }

  return capas;
}
