// Fondos pintados de AEQUITAS: la Biblioteca, el puerto de día y el atardecer.
// Los usan las cinemáticas y la pantalla de selección de personaje.
//
// Es el mundo después de la guerra: en el horizonte asoman las torres rotas de
// la ciudad vieja; las torres de energía están caídas o torcidas
// y el campanario de la iglesia vieja tiene el agua hasta las campanas.

import Phaser from 'phaser';
import { GAME } from '../config.js';

// Generador estable: los mismos dibujos en cada carga.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Torre de la ciudad vieja con el techo arrancado y ventanas vacías.
export function brokenTower(g, x, base, w, h, color, rnd, windowColor) {
  const top = base - h;
  const pts = [{ x, y: base }, { x, y: top + Math.floor(rnd() * h * 0.2) }];
  const steps = 3 + Math.floor(rnd() * 3);
  for (let i = 1; i < steps; i++) pts.push({ x: x + (w * i) / steps, y: top + Math.floor(rnd() * h * 0.4) });
  pts.push({ x: x + w, y: top + Math.floor(rnd() * h * 0.3) });
  pts.push({ x: x + w, y: base });
  g.fillStyle(color, 1);
  g.fillPoints(pts, true);
  if (windowColor != null) {
    g.fillStyle(windowColor, 0.6);
    for (let yy = top + Math.floor(h * 0.42); yy < base - 3; yy += 6) {
      for (let xx = x + 2; xx < x + w - 3; xx += 5) if (rnd() < 0.6) g.fillRect(xx, yy, 2, 3);
    }
  }
}

// Torre de energía de celosía, ladeada (lean en radianes).
export function pylon(g, x, base, h, color, lean = 0) {
  const c = Math.cos(lean);
  const s = Math.sin(lean);
  const rot = (px, py) => { const dx = px - x; const dy = py - base; return [x + dx * c - dy * s, base + dx * s + dy * c]; };
  const L = (x1, y1, x2, y2) => { const [a, b] = rot(x1, y1); const [d, e] = rot(x2, y2); g.lineBetween(a, b, d, e); };
  g.lineStyle(1, color, 1);
  const top = base - h;
  const hw = h * 0.18;
  L(x - hw, base, x - 2, top);
  L(x + hw, base, x + 2, top);
  for (let i = 0; i < 5; i++) {
    const y0 = base - (h * i) / 5;
    const y1 = base - (h * (i + 1)) / 5;
    const w0 = hw - (hw - 2) * (i / 5);
    const w1 = hw - (hw - 2) * ((i + 1) / 5);
    L(x - w0, y0, x + w1, y1);
    L(x + w0, y0, x - w1, y1);
  }
  L(x - hw * 1.5, top + h * 0.14, x + hw * 1.5, top + h * 0.14);
  L(x - hw * 1.1, top + h * 0.3, x + hw * 1.1, top + h * 0.3);
}

// El campanario de la iglesia vieja en su isleta: le falta medio techo y la
// cruz quedó torcida desde la guerra.
export function belfry(g, x, water, color, light) {
  g.fillStyle(color, 1);
  g.fillEllipse(x, water + 1, 40, 7);
  g.fillRect(x - 9, water - 34, 18, 34);
  g.fillTriangle(x - 11, water - 34, x + 2, water - 34, x - 3, water - 46);
  g.fillTriangle(x + 2, water - 34, x + 11, water - 34, x + 6, water - 39);
  g.fillRect(x - 4, water - 52, 2, 7);
  g.fillRect(x - 7, water - 50, 7, 2);
  g.fillStyle(light, 1);
  g.fillRect(x - 5, water - 28, 10, 10);
  g.fillStyle(color, 1);
  g.fillCircle(x, water - 22, 3);
  g.fillRect(x - 1, water - 28, 2, 3);
  // Grieta.
  g.fillStyle(light, 0.5);
  g.fillRect(x + 4, water - 12, 1, 6); g.fillRect(x + 5, water - 7, 1, 4);
}

export function drawPlace(g, variant) {
  const { WIDTH, HEIGHT } = GAME;
  const rnd = rng(7);
  const palm = (x, y, s, c) => {
    g.fillStyle(c, 1);
    g.fillRect(x - 2 * s, y - 40 * s, 4 * s, 40 * s);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.55;
      g.fillTriangle(x, y - 40 * s, x + Math.cos(a - 0.15) * 30 * s, y - 40 * s + Math.sin(a - 0.15) * 30 * s + 14 * s, x + Math.cos(a + 0.15) * 30 * s, y - 40 * s + Math.sin(a + 0.15) * 30 * s + 14 * s);
    }
  };
  const dock = () => {
    g.fillStyle(0x6e4527, 1); g.fillRect(0, 204, WIDTH, HEIGHT - 204);
    for (let y = 204; y < HEIGHT; y += 7) { g.fillStyle(0x8a5a34, 1); g.fillRect(0, y, WIDTH, 5); }
    // Tablones remendados de otros colores.
    for (let i = 0; i < 9; i++) { g.fillStyle(i % 2 ? 0x5c6468 : 0x9a7448, 1); g.fillRect(20 + ((i * 131) % (WIDTH - 60)), 204 + 7 * (1 + (i % 9)), 18 + (i % 3) * 8, 5); }
    g.fillStyle(0x4a2e18, 1); g.fillRect(0, 204, WIDTH, 2);
  };

  if (variant === 'biblioteca') {
    g.fillStyle(0x2a1d1a, 1); g.fillRect(0, 0, WIDTH, 206);
    const cols = ['#8a3a2a', '#2a5aa8', '#3f8a35', '#b0893f', '#6e2f6e', '#c94c3c', '#3fa3a0', '#efe3c2'];
    for (const [x0, x1] of [[6, 176], [304, 474]]) {
      for (let y = 24; y < 200; y += 30) {
        g.fillStyle(0x4a2e18, 1); g.fillRect(x0, y + 22, x1 - x0, 4);
        for (let x = x0 + 2; x < x1 - 4;) {
          const w = 3 + Math.floor(rnd() * 4); const h = 14 + Math.floor(rnd() * 7);
          // Algunos lomos están chamuscados: estos libros se salvaron del fuego.
          const c = Phaser.Display.Color.HexStringToColor(cols[Math.floor(rnd() * cols.length)]).color;
          g.fillStyle(c, 1);
          if (rnd() < 0.08) { g.fillRect(x, y + 22 - h + 4, w + 3, h - 4); x += w + 4; continue; } // libro caído de lado
          g.fillRect(x, y + 22 - h, w, h);
          if (rnd() < 0.18) { g.fillStyle(0x000000, 0.25); g.fillRect(x, y + 22 - Math.floor(h / 3), w, Math.floor(h / 3)); }
          x += w + (rnd() < 0.15 ? 3 : 0);
        }
      }
    }
    // Ventana en arco: la ciudad amurallada junto al río y las torres rotas.
    g.fillStyle(0x4a2e18, 1); g.fillRect(186, 26, 108, 140); g.fillCircle(240, 66, 54);
    g.fillGradientStyle(0x1d3a5a, 0x1d3a5a, 0x3a6f8a, 0x3a6f8a, 1); g.fillRect(192, 66, 96, 96);
    g.fillStyle(0x1d3a5a, 1); g.fillCircle(240, 66, 48);
    g.fillStyle(0xfff3d0, 1); g.fillCircle(266, 52, 6);
    const wr = rng(19);
    brokenTower(g, 196, 132, 12, 40, 0x24384e, wr, 0x3a5a78);
    brokenTower(g, 268, 132, 14, 52, 0x24384e, wr, 0x3a5a78);
    g.fillStyle(0x2a7f86, 1); g.fillRect(192, 132, 96, 30);
    g.fillStyle(0x14232e, 1); g.fillRect(200, 122, 80, 14);
    for (let x = 200; x < 280; x += 8) g.fillRect(x, 117, 5, 6);
    g.fillRect(212, 96, 10, 26); g.fillTriangle(210, 96, 224, 96, 217, 84); g.fillRect(250, 104, 18, 18); g.fillCircle(259, 104, 9);
    g.fillStyle(0xf2c230, 0.9); for (let i = 0; i < 7; i++) g.fillRect(204 + i * 10, 126 + (i % 3) * 3, 2, 2);
    g.fillStyle(0x7cc3b6, 0.5); for (let i = 0; i < 8; i++) g.fillRect(194 + ((i * 37) % 88), 140 + ((i * 13) % 20), 6, 1);
    g.fillStyle(0x4a2e18, 1); g.fillRect(238, 20, 4, 146); g.fillRect(186, 104, 108, 4);
    // Un vidrio roto, pegado con cinta.
    g.lineStyle(1, 0xcfe3e8, 0.55); g.lineBetween(250, 70, 262, 84); g.lineBetween(262, 84, 258, 98); g.lineBetween(262, 84, 276, 90);
    g.fillStyle(0xd6c29a, 0.8); g.fillRect(252, 74, 8, 2); g.fillRect(264, 86, 2, 8);
    // Bombillos colgantes, alimentados por baterías rescatadas.
    for (const x of [92, 388]) {
      g.fillStyle(0x3a2a20, 1); g.fillRect(x, 0, 1, 40);
      for (let r = 34; r > 0; r -= 4) { g.fillStyle(0xffd27a, 0.025 + (34 - r) / 900); g.fillCircle(x, 46, r); }
      g.fillStyle(0xffe9a0, 1); g.fillCircle(x, 46, 5);
    }
    g.fillStyle(0x3a2a20, 1); g.fillRect(0, 204, WIDTH, HEIGHT - 204);
    for (let x = 0; x < WIDTH; x += 24) { g.fillStyle(0x2e2018, 1); g.fillRect(x, 204, 1, HEIGHT - 204); }
    // Libros apilados en el piso, secándose.
    for (const [x, n] of [[24, 4], [446, 3]]) for (let i = 0; i < n; i++) { g.fillStyle(Phaser.Display.Color.HexStringToColor(cols[(i * 3 + x) % cols.length]).color, 1); g.fillRect(x + (i % 2), 200 - i * 4, 18, 4); }
    return;
  }

  // Puerto de día o al atardecer.
  const sunset = variant === 'atardecer';
  const sx = sunset ? 240 : 392;
  const sy = sunset ? 150 : 64;
  for (let r = 90; r > 0; r -= 6) { g.fillStyle(sunset ? 0xffb070 : 0xfff2c0, 0.035 + (90 - r) / 1500); g.fillCircle(sx, sy, r); }
  g.fillStyle(sunset ? 0xffd38a : 0xfff6d8, 1); g.fillCircle(sx, sy, sunset ? 26 : 16);
  // La ciudad vieja en el horizonte, con las torres rotas por la guerra.
  const tr = rng(23);
  const far = sunset ? 0x8a5a6a : 0x86a4a8;
  const farWin = sunset ? 0xb07a7a : 0xa8c2c4;
  for (const [x, w, h] of [[60, 18, 44], [84, 12, 30], [150, 22, 62], [178, 14, 38], [300, 16, 50], [322, 24, 70], [352, 12, 34], [420, 18, 46]]) brokenTower(g, x, 142, w, h, far, tr, farWin);
  pylon(g, 120, 142, 46, far, 0.18);
  pylon(g, 262, 142, 40, far, -0.32);
  g.fillStyle(sunset ? 0x5a3a4a : 0x2f5a4a, 1);
  for (let x = 0; x < WIDTH; x += 14) { const h = 6 + Math.floor(rnd() * 10); g.fillRect(x, 140 - h, 14, h + 4); }
  g.fillStyle(sunset ? 0xb05a4a : 0x2a7f86, 1); g.fillRect(0, 144, WIDTH, 62);
  for (let i = 0; i < 40; i++) {
    g.fillStyle(sunset ? 0xffc08a : 0x7cc3b6, 0.5);
    const w = 6 + Math.floor(rnd() * 16);
    const x = sunset ? sx - 40 + Math.floor(rnd() * 80) : Math.floor(rnd() * WIDTH);
    g.fillRect(x, 148 + Math.floor(rnd() * 54), w, 1);
  }
  // El campanario partido en su isleta y el bus que quedó donde estaba el puente.
  belfry(g, sunset ? 112 : 300, 178, sunset ? 0x3a2030 : 0x5c6468, sunset ? 0xb05a4a : 0x2a7f86);
  g.fillStyle(sunset ? 0x3a2030 : 0xb5872a, 1); g.fillRect(170, 182, 44, 6);
  g.fillStyle(sunset ? 0x2a1824 : 0x7a5a20, 1); for (let x = 174; x < 210; x += 7) g.fillRect(x, 183, 4, 3);
  if (!sunset) {
    // Palafitos remendados, con lonas y paneles rescatados.
    const cols = [0xe8846b, 0xf2b84b, 0x3fa3a0, 0x9cc36b];
    for (let i = 0; i < 4; i++) {
      const x = 14 + i * 34;
      g.fillStyle(0x6e4527, 1); g.fillRect(x + 4, 130, 2, 18); g.fillRect(x + 22, 130, 2, 18);
      g.fillStyle(cols[i], 1); g.fillRect(x, 104, 28, 26);
      g.fillStyle(i % 2 ? 0x8a6034 : 0x5c6468, 1); g.fillRect(x + 3 + i * 3, 110 + (i % 2) * 6, 7, 6); // remiendo
      g.fillStyle(0x8f9aa0, 1); g.fillTriangle(x - 3, 106, x + 31, 106, x + 14, 92);
      if (i === 1) { g.fillStyle(0x2a5aa8, 1); g.fillTriangle(x + 4, 104, x + 24, 104, x + 14, 95); }
      if (i === 2) { g.fillStyle(0x24435e, 1); g.fillRect(x + 6, 96, 12, 4); }
    }
  } else {
    g.fillStyle(0x3a2030, 1); g.fillRect(320, 156, 60, 8); g.fillTriangle(380, 156, 392, 156, 380, 164); g.fillRect(336, 146, 22, 10);
  }
  palm(452, 206, 1.1, sunset ? 0x3a2030 : 0x2f6b3a);
  palm(24, 206, 0.9, sunset ? 0x3a2030 : 0x2f6b3a);
  dock();
}
