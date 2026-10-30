// Pinturas de las POSTALES CINEMATOGRÁFICAS (ver data/postales.js). Cada una se
// dibuja a la resolución base (480×270) dentro de un contenedor, así sirve igual
// para la escena, para las miniaturas del álbum y para guardar la imagen.
//
// Si hay una ilustración hecha a mano para esa postal (cargada como textura
// 'postal_<key>'), se usa esa y no la pintura por código.

import { brokenTower, pylon } from '../scenes/places.js';

const W = 480;
const H = 270;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const sky = (g, top, bot, h = H) => { g.fillGradientStyle(top, top, bot, bot, 1); g.fillRect(0, 0, W, h); };
const glow = (g, x, y, r, color, k = 1) => { for (let i = r; i > 0; i -= 5) { g.fillStyle(color, (0.03 + (r - i) / (r * 22)) * k); g.fillCircle(x, y, i); } };

// Una margarita: pétalos en rombo alrededor de un botón.
export function daisy(g, x, y, r, petal = 0xf2c43b, center = 0xc8641e, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const w = r * 0.32;
    g.fillStyle(petal, 1);
    g.fillPoints([
      { x: x + c * r * 0.25 - s * w * 0.4, y: y + s * r * 0.25 + c * w * 0.4 },
      { x: x + c * r * 0.6 - s * w, y: y + s * r * 0.6 + c * w },
      { x: x + c * r, y: y + s * r },
      { x: x + c * r * 0.6 + s * w, y: y + s * r * 0.6 - c * w },
      { x: x + c * r * 0.25 + s * w * 0.4, y: y + s * r * 0.25 - c * w * 0.4 },
    ], true);
  }
  g.fillStyle(center, 1); g.fillCircle(x, y, r * 0.3);
  g.fillStyle(0xffe08a, 0.8); g.fillCircle(x - r * 0.08, y - r * 0.08, r * 0.12);
}

// Una persona del juego, ampliada (los sprites ya están horneados).
function person(scene, c, key, x, y, scale, tint) {
  if (!scene.textures.exists(key)) return null;
  const img = scene.add.image(x, y, key).setOrigin(0.5, 1).setScale(scale);
  if (tint != null) img.setTint(tint);
  c.add(img);
  return img;
}

// ----------------------------------------------------------- 1 · el Leviatán
function leviatan(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(11);
  sky(g, 0x1a1028, 0x8a3a2a, 190);
  glow(g, 360, 150, 120, 0xff8a4a, 1.2);
  // Humo de la guerra.
  for (let i = 0; i < 9; i++) { g.fillStyle(0x2a1a24, 0.25); g.fillCircle(60 + i * 50 + r() * 20, 70 + r() * 50, 30 + r() * 26); }
  // La ciudad caída.
  for (const [x, w, h] of [[10, 26, 70], [40, 18, 46], [70, 30, 96], [104, 16, 54], [128, 24, 80], [300, 20, 60], [326, 34, 104], [366, 18, 50], [392, 28, 84], [430, 22, 58]]) brokenTower(g, x, 172, w, h, 0x24141e, r, 0xff9a5a);
  pylon(g, 180, 172, 60, 0x24141e, 0.5);
  pylon(g, 250, 172, 52, 0x24141e, -0.62);
  // El río, con el reflejo del fuego.
  g.fillGradientStyle(0x5a2a2a, 0x5a2a2a, 0x140c14, 0x140c14, 1); g.fillRect(0, 172, W, H - 172);
  for (let i = 0; i < 36; i++) { g.fillStyle(0xffa060, 0.35); g.fillRect(300 + r() * 120, 178 + r() * 70, 6 + r() * 14, 1); }
  // El gigante: una cabeza de piedra derribada, medio hundida en el río.
  const hx = 330, hy = 206;
  g.fillStyle(0x4a3a40, 1); g.fillEllipse(hx, hy, 150, 74);
  g.fillStyle(0x5c4a50, 1); g.fillEllipse(hx - 6, hy - 8, 132, 52);
  g.fillStyle(0x3a2c32, 1); g.fillRect(hx - 30, hy - 12, 26, 3); g.fillRect(hx + 12, hy - 12, 26, 3); // ojos cerrados
  g.fillTriangle(hx - 2, hy - 8, hx + 8, hy - 8, hx + 3, hy + 10); // nariz
  g.fillRect(hx - 12, hy + 16, 30, 3); // boca
  g.fillStyle(0x2a1e24, 1); g.fillTriangle(hx + 48, hy - 30, hx + 70, hy - 10, hx + 40, hy + 4); // grieta
  // La corona de laurel, rota.
  g.fillStyle(0x7a6a3a, 1); for (let i = 0; i < 7; i++) g.fillEllipse(hx - 60 + i * 12, hy - 30 - Math.sin(i / 2) * 6, 10, 5);
  g.fillStyle(0x140c14, 0.55); g.fillRect(hx - 80, hy + 18, 160, 30); // el agua le tapa la barbilla
  // La balanza de la justicia, caída en la orilla.
  g.lineStyle(3, 0x6a5a3a, 1); g.lineBetween(70, 214, 150, 186); g.lineBetween(110, 200, 112, 236);
  g.fillStyle(0x6a5a3a, 1); g.fillEllipse(70, 222, 26, 7); g.fillEllipse(150, 194, 26, 7);
  g.lineStyle(1, 0x6a5a3a, 1); g.lineBetween(70, 214, 62, 220); g.lineBetween(70, 214, 78, 220); g.lineBetween(150, 186, 142, 192); g.lineBetween(150, 186, 158, 192);
  // Gente que huye con sus cosas, por la orilla.
  g.fillStyle(0x0a0608, 1);
  for (let i = 0; i < 7; i++) {
    const x = 180 + i * 16, y = 232 + (i % 2) * 3;
    g.fillRect(x, y - 14, 4, 14); g.fillCircle(x + 2, y - 16, 2.5);
    if (i % 2) g.fillRect(x - 3, y - 13, 4, 5); else g.fillCircle(x + 5, y - 12, 3);
  }
  g.fillStyle(0x0a0608, 1); g.fillRect(0, 248, W, 22);
}

// -------------------------------------------------------------- 2 · la Bóveda
function boveda(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(5);
  sky(g, 0x0f3a4a, 0x04121a);
  // Rayos de luz que bajan desde la superficie.
  for (const [x, w] of [[80, 40], [190, 60], [330, 46], [420, 30]]) { g.fillStyle(0x9fe3e0, 0.06); g.fillTriangle(x, 0, x + w, 0, x + w * 2.4, 230); }
  // Estanterías de piedra con tubos de códices.
  for (const x0 of [10, 352]) {
    g.fillStyle(0x0a2028, 1); g.fillRect(x0, 40, 118, 190);
    for (let y = 56; y < 220; y += 32) {
      g.fillStyle(0x163a44, 1); g.fillRect(x0 + 4, y + 18, 110, 4);
      for (let x = x0 + 8; x < x0 + 108; x += 9) { g.fillStyle(r() < 0.5 ? 0xc9a030 : 0xa07a2a, 1); g.fillRect(x, y + 2, 6, 16); g.fillStyle(0xf2d070, 1); g.fillRect(x, y + 2, 6, 2); }
    }
  }
  // La compuerta redonda, con la Margarita en el centro.
  const cx = 240, cy = 118;
  glow(g, cx, cy, 110, 0xf2c43b, 0.9);
  g.fillStyle(0x3a2a14, 1); g.fillCircle(cx, cy, 82);
  g.fillStyle(0x8a6a32, 1); g.fillCircle(cx, cy, 76);
  g.fillStyle(0x6e5228, 1); g.fillCircle(cx, cy, 64);
  g.fillStyle(0x8a6a32, 1); g.fillCircle(cx, cy, 52);
  g.lineStyle(2, 0xc9a24f, 1); g.strokeCircle(cx, cy, 70); g.strokeCircle(cx, cy, 46);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillStyle(0xe3b04b, 1); g.fillCircle(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70, 3); }
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; g.fillStyle(0x4a3418, 1); g.fillRect(cx + Math.cos(a) * 58 - 3, cy + Math.sin(a) * 58 - 3, 6, 6); }
  daisy(g, cx, cy, 32);
  // Piso de la Bóveda.
  g.fillStyle(0x0a1a20, 1); g.fillRect(0, 222, W, H - 222);
  for (let x = 0; x < W; x += 30) { g.fillStyle(0x12303a, 1); g.fillRect(x, 222, 28, 2); }
  // Burbujas.
  for (let i = 0; i < 26; i++) { g.lineStyle(1, 0xbfeff0, 0.5); g.strokeCircle(30 + r() * 420, 20 + r() * 190, 1 + r() * 2.5); }
  // Quien sale de la Bóveda, de espaldas, hacia la compuerta; Lumen y Tinto.
  person(scene, c, 'player_back', cx, 234, 3.4);
  person(scene, c, 'lumen', cx + 54, 180, 2.4);
  person(scene, c, 'tinto', cx - 58, 234, 2.6);
}

// ------------------------------------------------------------ 3 · la travesía
function travesia(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(3);
  sky(g, 0x0a1028, 0x24365a, 160);
  for (let i = 0; i < 90; i++) { g.fillStyle(0xffffff, 0.3 + r() * 0.6); g.fillRect(r() * W, r() * 140, 1, 1); }
  glow(g, 360, 58, 70, 0xdfe7ff, 1);
  g.fillStyle(0xf3f0e0, 1); g.fillCircle(360, 58, 14);
  // Pilares del puente que ya no está.
  for (const [x, h] of [[90, 46], [150, 40], [300, 44]]) { g.fillStyle(0x1a2238, 1); g.fillRect(x, 160 - h, 14, h + 4); g.fillRect(x - 3, 160 - h, 20, 4); }
  // Manglares a lado y lado.
  for (const x0 of [0, 410]) {
    g.fillStyle(0x0a1418, 1);
    for (let i = 0; i < 6; i++) g.fillCircle(x0 + 10 + i * 12, 120 + (i % 3) * 8, 22);
    g.fillRect(x0, 120, 70, 44);
    g.lineStyle(1, 0x0a1418, 1); for (let i = 0; i < 8; i++) g.lineBetween(x0 + 6 + i * 8, 150, x0 + 2 + i * 9, 168);
  }
  // El río y el camino de la luna.
  g.fillGradientStyle(0x1a2a48, 0x1a2a48, 0x060a18, 0x060a18, 1); g.fillRect(0, 160, W, H - 160);
  for (let i = 0; i < 30; i++) { g.fillStyle(0xdfe7ff, 0.55 - i * 0.012); g.fillRect(340 + r() * 40 - i * 0.6, 164 + i * 3.4, 10 + r() * 20, 1); }
  // La canoa.
  g.fillStyle(0x2a1a10, 1); g.fillPoints([{ x: 180, y: 214 }, { x: 300, y: 214 }, { x: 288, y: 226 }, { x: 194, y: 226 }], true);
  g.fillStyle(0x4a2e18, 1); g.fillRect(186, 212, 108, 3);
  g.lineStyle(2, 0x4a2e18, 1); g.lineBetween(270, 190, 296, 236); // el remo
  person(scene, c, 'player_back', 246, 216, 2.4, 0x9aa8d0);
  person(scene, c, 'tinto', 206, 214, 1.8, 0x9aa8d0);
  person(scene, c, 'lumen', 282, 186, 1.8);
  // Ondas y luciérnagas.
  for (let i = 0; i < 8; i++) { g.fillStyle(0xbcd0f0, 0.4); g.fillRect(170 + i * 18, 230 + (i % 2) * 4, 10, 1); }
  for (let i = 0; i < 22; i++) { const x = r() * W, y = 100 + r() * 110; g.fillStyle(0xf2e07a, 0.25); g.fillCircle(x, y, 3); g.fillStyle(0xfff6b0, 1); g.fillRect(x, y, 1, 1); }
}

// ------------------------------------------------------------- 4 · la víspera
function asamblea(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(17);
  sky(g, 0x0c1430, 0x2a2440, 190);
  for (let i = 0; i < 70; i++) { g.fillStyle(0xffffff, 0.3 + r() * 0.5); g.fillRect(r() * W, r() * 110, 1, 1); }
  // Casa de la Junta: madera remendada, techo de zinc, la puerta abierta y encendida.
  const x0 = 140, w = 200, top = 70;
  g.fillStyle(0x3a2a24, 1); g.fillRect(x0, top + 30, w, 120);
  g.fillStyle(0x5c6468, 1); g.fillTriangle(x0 - 14, top + 32, x0 + w + 14, top + 32, x0 + w / 2, top - 6);
  g.fillStyle(0x4a5054, 1); for (let x = x0; x < x0 + w; x += 12) g.fillRect(x, top + 26, 2, 6);
  for (let y = top + 40; y < top + 150; y += 8) { g.fillStyle(0x2e2018, 1); g.fillRect(x0, y, w, 1); }
  g.fillStyle(0x5a4a3a, 1); g.fillRect(x0 + 22, top + 60, 18, 12); g.fillRect(x0 + 150, top + 84, 16, 10); // remiendos
  glow(g, x0 + w / 2, top + 116, 90, 0xffc870, 1.1);
  g.fillStyle(0xffd68a, 1); g.fillRect(x0 + w / 2 - 22, top + 82, 44, 68);
  g.fillStyle(0xffeec0, 1); g.fillRect(x0 + w / 2 - 14, top + 90, 28, 60);
  for (const wx of [x0 + 26, x0 + w - 50]) { g.fillStyle(0xf2b84b, 1); g.fillRect(wx, top + 92, 24, 18); g.fillStyle(0x3a2a24, 1); g.fillRect(wx + 11, top + 92, 2, 18); }
  // El letrero del lema.
  g.fillStyle(0xefe3c2, 1); g.fillRect(x0 + 40, top + 44, 120, 20);
  g.lineStyle(1, 0x6e4527, 1); g.strokeRect(x0 + 40, top + 44, 120, 20);
  c.add(scene.add.text(x0 + 100, top + 54, 'AQUÍ SE HABLA,\nNO SE GRITA', { fontFamily: 'Georgia, serif', fontSize: '7px', color: '#3a2418', align: 'center', lineSpacing: -1 }).setOrigin(0.5));
  // Guirnalda de bombillos.
  g.lineStyle(1, 0x2a2420, 1);
  for (let i = 0; i < 16; i++) { const x = 20 + i * 28; const y = 40 + Math.sin(i * 0.9) * 6; g.lineBetween(x, y, x + 28, 40 + Math.sin((i + 1) * 0.9) * 6); g.fillStyle(0xffe08a, 1); g.fillCircle(x, y + 3, 2); }
  // Plaza y vecinos que llegan.
  g.fillStyle(0x1a1420, 1); g.fillRect(0, 220, W, H - 220);
  g.fillStyle(0x6e4527, 0.5); g.fillRect(x0 + w / 2 - 40, 220, 80, 50);
  const night = 0x8a90b8;
  [['npc_tule', 70, 2.4], ['npc_rosa', 104, 2.4], ['npc_lucho', 380, 2.4], ['npc_nubia', 414, 2.4], ['npc_carmen', 196, 2.6], ['npc_aurelio', 290, 2.6], ['player_back', 240, 3]].forEach(([k, x, s]) => person(scene, c, k, x, 236, s, k === 'player_back' ? 0xc8c0d8 : night));
}

// ----------------------------------------------------- 5 · la Margarita Dorada
function margarita(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(29);
  sky(g, 0x3a5a8a, 0xf2b884, 170);
  glow(g, 240, 170, 130, 0xffd08a, 1.1);
  g.fillStyle(0xfff0c0, 1); g.fillCircle(240, 168, 20);
  // El pueblo al fondo, ya con banderines.
  g.fillStyle(0x6a5a6a, 1);
  for (const [x, w, h] of [[10, 50, 34], [66, 40, 26], [112, 56, 40], [330, 50, 30], [386, 44, 38], [436, 44, 26]]) { g.fillRect(x, 170 - h, w, h); g.fillTriangle(x - 4, 170 - h, x + w + 4, 170 - h, x + w / 2, 160 - h); }
  const flags = [0xe8846b, 0xf2b84b, 0x3fa3a0, 0x9cc36b, 0xc8302a];
  g.lineStyle(1, 0x3a2a30, 1); g.lineBetween(0, 96, W, 104);
  for (let i = 0; i < 24; i++) { const x = 6 + i * 20; const y = 96 + (i * 20 / W) * 8; g.fillStyle(flags[i % flags.length], 1); g.fillTriangle(x, y, x + 10, y, x + 5, y + 9); }
  // La plaza de asfalto, agrietada.
  g.fillGradientStyle(0x5a5660, 0x5a5660, 0x2a2830, 0x2a2830, 1); g.fillRect(0, 170, W, H - 170);
  g.lineStyle(1, 0x1a181e, 1);
  for (const [a, b, d, e] of [[240, 226, 180, 250], [180, 250, 120, 262], [240, 226, 300, 244], [300, 244, 380, 252], [240, 226, 236, 270], [240, 226, 210, 196], [240, 226, 276, 200], [120, 200, 60, 212], [380, 196, 440, 214]]) g.lineBetween(a, b, d, e);
  // El resplandor y la flor.
  glow(g, 240, 214, 60, 0xf2c43b, 1.6);
  g.fillStyle(0x3a7a3a, 1); g.fillRect(239, 196, 3, 32);
  g.fillEllipse(230, 218, 16, 5); g.fillEllipse(250, 210, 16, 5);
  daisy(g, 240, 192, 15);
  for (let i = 0; i < 14; i++) { g.fillStyle(0xfff0a0, 0.8); g.fillRect(200 + r() * 80, 150 + r() * 70, 1, 1); }
  // Quien llegó, Lumen y Tinto, mirando la flor.
  person(scene, c, 'player', 330, 236, 3.2);
  person(scene, c, 'tinto', 150, 234, 2.6).setFlipX(true);
  person(scene, c, 'lumen', 368, 180, 2.2);
}

// --------------------------------------------------------- 6 · Siete Puentes
function sietePuentes(scene, c) {
  const g = scene.add.graphics(); c.add(g);
  const r = rng(41);
  sky(g, 0x8aa6b4, 0xd8d0b8, 160);
  // Montañas en capas de bruma.
  for (const [col, y, amp] of [[0x7a96a4, 110, 26], [0x5a7a80, 130, 30], [0x3a5a5a, 150, 34]]) {
    g.fillStyle(col, 1);
    const pts = [{ x: 0, y: H }];
    for (let x = 0; x <= W; x += 24) pts.push({ x, y: y - Math.abs(Math.sin(x * 0.013 + y)) * amp - r() * 8 });
    pts.push({ x: W, y: H });
    g.fillPoints(pts, true);
  }
  // El cañón y el río.
  g.fillStyle(0x24382e, 1); g.fillPoints([{ x: 0, y: 120 }, { x: 150, y: 150 }, { x: 190, y: H }, { x: 0, y: H }], true);
  g.fillPoints([{ x: W, y: 116 }, { x: 330, y: 150 }, { x: 300, y: H }, { x: W, y: H }], true);
  g.fillGradientStyle(0x4a7a80, 0x4a7a80, 0x2a4a50, 0x2a4a50, 1); g.fillPoints([{ x: 150, y: 150 }, { x: 330, y: 150 }, { x: 300, y: H }, { x: 190, y: H }], true);
  // Siete pilares que se pierden río arriba.
  for (let i = 0; i < 7; i++) {
    const k = 1 - i * 0.12;
    const x = 240 + (i % 2 ? 1 : -1) * 14 * k;
    const base = 250 - i * 16;
    g.fillStyle(0x6a6458, 1); g.fillRect(x - 6 * k, base - 40 * k, 12 * k, 40 * k);
    g.fillStyle(0x8a8474, 1); g.fillRect(x - 6 * k, base - 40 * k, 3 * k, 40 * k);
  }
  // El puente colgante roto: las cuerdas cuelgan y las tablas caen al agua.
  g.lineStyle(1, 0x2a2018, 1);
  g.lineBetween(150, 150, 210, 186); g.lineBetween(150, 156, 206, 196);
  g.lineBetween(330, 150, 290, 180); g.lineBetween(330, 156, 296, 192);
  for (let i = 0; i < 6; i++) { g.fillStyle(0x6e4527, 1); g.fillRect(156 + i * 9, 154 + i * 6, 6, 2); g.fillRect(324 - i * 6, 154 + i * 6, 5, 2); }
  // Bruma y garzas.
  for (let i = 0; i < 5; i++) { g.fillStyle(0xffffff, 0.12); g.fillEllipse(80 + i * 90, 160 + (i % 2) * 14, 160, 16); }
  g.lineStyle(1, 0x2a2a2a, 1);
  for (const [x, y] of [[90, 60], [104, 54], [116, 64], [380, 46], [392, 52]]) { g.lineBetween(x - 5, y - 2, x, y); g.lineBetween(x, y, x + 5, y - 2); }
}

const PAINT = { leviatan, boveda, travesia, asamblea, margarita, siete_puentes: sietePuentes };

// Pinta la postal en un contenedor nuevo (0,0 = esquina de la postal).
export function paintPostal(scene, key) {
  const c = scene.add.container(0, 0);
  const tex = 'postal_' + key;
  if (scene.textures.exists(tex)) {
    const img = scene.add.image(W / 2, H / 2, tex);
    const k = Math.max(W / img.width, H / img.height);
    img.setScale(k);
    c.add(img);
    return c;
  }
  (PAINT[key] || leviatan)(scene, c);
  return c;
}

// --------------------------------------------------------- dentro de una escena
// La postal como fondo cinematográfico de un diálogo o una cinemática: ocupa
// la pantalla, se acerca despacio y lleva su título arriba a la izquierda.
// offsetY sube la pintura para que lo importante no quede bajo la caja de texto.
export function postalBackdrop(scene, postal, { depth = 5, offsetY = -40 } = {}) {
  const c = scene.add.container(W / 2, H / 2).setDepth(depth);
  const art = paintPostal(scene, postal.key);
  art.setPosition(-W / 2, -H / 2 + offsetY);
  c.add(art);
  const veil = scene.add.rectangle(-W / 2, -H / 2, W, 16, 0x05080a, 1).setOrigin(0);
  const title = scene.add.text(-W / 2 + 12, -H / 2 + 22, postal.title, { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#e3b04b', stroke: '#140c08', strokeThickness: 3 });
  const sub = scene.add.text(-W / 2 + 13, -H / 2 + 39, postal.sub, { fontFamily: 'Georgia, serif', fontSize: '8px', fontStyle: 'italic', color: '#efe3c2', stroke: '#140c08', strokeThickness: 2 });
  c.add([veil, title, sub]);
  c.setAlpha(0);
  scene.tweens.add({ targets: c, alpha: 1, duration: 700 });
  scene.tweens.add({ targets: art, scale: 1.06, x: -W / 2 * 1.06, y: (-H / 2 + offsetY) * 1.06, duration: 14000, ease: 'Sine.inOut' });
  return c;
}

export { W as POSTAL_W, H as POSTAL_H };
