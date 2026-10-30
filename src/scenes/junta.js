// La Casa de la Junta por dentro: paredes de madera, ventanas al atardecer,
// bandera, letrero y el público en las bancas. La usan la audiencia y el acuerdo.

import Phaser from 'phaser';
import { GAME } from '../config.js';

const CROWD = ['npc_vecino', 'npc_rosa', 'npc_lucho_sin', 'npc_pelao', 'npc_chepe', 'npc_nubia', 'npc_tule', 'npc_yuli', 'npc_pescador', 'npc_vecina', 'npc_mono', 'npc_pelaa', 'npc_nando'];

export function drawJunta(s) {
  const { WIDTH } = GAME;
  const g = s.add.graphics().setDepth(0);
  g.fillStyle(0x6e4527, 1); g.fillRect(0, 0, WIDTH, 150);
  for (let x = 0; x < WIDTH; x += 12) { g.fillStyle(0x7a5228, 1); g.fillRect(x, 0, 10, 150); g.fillStyle(0x5a3a20, 1); g.fillRect(x + 10, 0, 2, 150); }
  // Ventanas al atardecer.
  for (const x of [52, 372]) {
    g.fillStyle(0x3a2a1a, 1); g.fillRect(x - 4, 26, 64, 56);
    g.fillGradientStyle(0xe8846b, 0xe8846b, 0xf2c48a, 0xf2c48a, 1); g.fillRect(x, 30, 56, 48);
    g.fillStyle(0x2a7f86, 1); g.fillRect(x, 66, 56, 12);
    g.fillStyle(0x2a1d2e, 1); g.fillRect(x + 6, 50, 3, 16); g.fillTriangle(x + 1, 52, x + 15, 52, x + 7, 42);
    g.fillStyle(0x3a2a1a, 1); g.fillRect(x + 26, 30, 4, 48); g.fillRect(x, 52, 56, 3);
  }
  // Bandera y letrero.
  g.fillStyle(0xf2c230, 1); g.fillRect(150, 18, 40, 13); g.fillStyle(0x2a5aa8, 1); g.fillRect(150, 31, 40, 7); g.fillStyle(0xc8302a, 1); g.fillRect(150, 38, 40, 7);
  g.fillStyle(0x5c6468, 1); g.fillRect(148, 14, 2, 40);
  g.fillStyle(0xefe3c2, 1); g.fillRect(206, 18, 140, 24); g.lineStyle(2, 0x8a6034, 1); g.strokeRect(206, 18, 140, 24);
  s.add.text(276, 30, 'JUNTA DE ACCIÓN COMUNAL\nPUERTO GARZA', { fontFamily: 'monospace', fontSize: '7px', color: '#5a3a20', align: 'center' }).setOrigin(0.5).setDepth(1);
  // Remiendos de la pared: tablas de otros colores y una lámina de zinc.
  for (const [x, y, w, h, c] of [[14, 96, 30, 10, 0x9a7448], [118, 40, 24, 14, 0x5c6468], [300, 104, 40, 8, 0x9a7448], [444, 30, 26, 18, 0x8f9aa0], [168, 120, 20, 12, 0x5c6468]]) {
    g.fillStyle(c, 1); g.fillRect(x, y, w, h);
    g.fillStyle(0x3a2a20, 1); g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + w - 2, y + 1, 1, 1);
  }
  g.fillStyle(0x9a5a3a, 0.8); g.fillRect(450, 36, 1, 10); g.fillRect(458, 34, 1, 13);
  // La pared guarda la guerra: agujeros tapados con latas, sin pintar encima.
  for (const [x, y] of [[22, 60], [30, 66], [26, 74], [180, 84], [186, 92], [446, 64], [452, 72]]) {
    g.fillStyle(0x8f9aa0, 1); g.fillRect(x - 3, y - 3, 6, 6);
    g.fillStyle(0x3a2a20, 1); g.fillRect(x - 3, y - 3, 1, 1); g.fillRect(x + 2, y + 2, 1, 1);
  }
  // Lema pintado a mano, bajo la ventana derecha: ahí no lo tapan los títulos,
  // las normas ni los recibos que aparecen en el centro.
  g.fillStyle(0xefe3c2, 0.95); g.fillRect(368, 86, 66, 24); g.lineStyle(1, 0x8a6034, 1); g.strokeRect(368, 86, 66, 24);
  s.add.text(401, 98, 'AQUÍ SE HABLA,\nNO SE GRITA', { fontFamily: 'monospace', fontSize: '7px', color: '#a8302a', align: 'center' }).setOrigin(0.5).setDepth(1);
  // Un bombillo colgado de un cable que baja hasta una batería de carro.
  g.lineStyle(1, 0x2a2420, 1); g.lineBetween(120, 0, 128, 22); g.lineBetween(128, 0, 470, 4); g.lineBetween(470, 4, 470, 146);
  g.fillStyle(0xfff3c0, 1); g.fillCircle(128, 25, 3);
  for (let r = 18; r > 0; r -= 3) { g.fillStyle(0xffe9a0, 0.02 + (18 - r) / 700); g.fillCircle(128, 25, r); }
  // Piso.
  g.fillStyle(0x8a6034, 1); g.fillRect(0, 150, WIDTH, 120);
  for (let y = 150; y < 270; y += 10) { g.fillStyle(0x7a5228, 1); g.fillRect(0, y, WIDTH, 1); }
  g.fillStyle(0x2a2f33, 1); g.fillRect(462, 140, 16, 10); g.fillStyle(0xc8302a, 1); g.fillRect(464, 138, 3, 2); g.fillStyle(0x2a2420, 1); g.fillRect(474, 138, 3, 2);
  // Mesa de la Junta.
  g.fillStyle(0x4a2e18, 1); g.fillRect(196, 112, 92, 26); g.fillStyle(0x5a3a20, 1); g.fillRect(196, 112, 92, 4);
  g.fillStyle(0xc9a030, 1); g.fillCircle(276, 108, 5); g.fillRect(275, 100, 2, 4);
  return g;
}

// El público: dos filas de bancas con vecinos que reaccionan.
export function buildCrowd(s) {
  const crowd = [];
  const g = s.add.graphics().setDepth(3);
  for (const y of [150, 168]) { g.fillStyle(0x4a2e18, 1); g.fillRect(16, y, 160, 6); g.fillRect(304, y, 160, 6); }
  const spots = [];
  for (let i = 0; i < 6; i++) { spots.push([30 + i * 26, 152]); spots.push([318 + i * 26, 152]); }
  spots.push([44, 170]); spots.push([440, 170]);
  spots.forEach(([x, y], i) => {
    const key = CROWD[i % CROWD.length];
    if (!s.textures.exists(key)) return;
    const im = s.add.image(x, y, key).setOrigin(0.5, 1).setScale(1.3).setDepth(y >= 168 ? 4 : 2);
    im.baseY = y;
    crowd.push(im);
  });
  return crowd;
}

// La balanza de la Junta. bal.set(ángulo): negativo o positivo = inclinada,
// 0 = en equilibrio.
export function buildBalance(s, x = 222, y = 82) {
  s.add.image(x, y + 32, 'ui_pillar').setOrigin(0.5, 1).setScale(0.8).setDepth(6);
  const beam = s.add.image(x, y, 'ui_beam').setScale(0.9, 1).setDepth(7);
  const panL = s.add.image(x - 28, y, 'ui_pan').setOrigin(0.5, 0).setScale(0.8).setDepth(7);
  const panR = s.add.image(x + 28, y, 'ui_pan').setOrigin(0.5, 0).setScale(0.8).setDepth(7);
  const bal = { angle: 0, tween: null };
  const apply = (a) => {
    bal.angle = a;
    beam.setAngle(a);
    const r = Phaser.Math.DegToRad(a);
    panL.setPosition(x - Math.cos(r) * 28, y - Math.sin(r) * 28);
    panR.setPosition(x + Math.cos(r) * 28, y + Math.sin(r) * 28);
  };
  bal.set = (target, animated = true) => {
    if (bal.tween) bal.tween.stop();
    if (!animated) { apply(target); return; }
    const o = { a: bal.angle };
    bal.tween = s.tweens.add({ targets: o, a: target, duration: 900, ease: 'Back.out', onUpdate: () => apply(o.a) });
  };
  return bal;
}

export function cheer(s, crowd, mood) {
  crowd.forEach((im, i) => {
    s.tweens.add({ targets: im, y: im.baseY - (mood === 'good' ? 5 : 2), duration: 110 + (i % 4) * 30, yoyo: true, repeat: mood === 'good' ? 1 : 0, delay: (i % 5) * 40 });
  });
}

export function murmur(s, text, color = '#efe3c2') {
  const x = Phaser.Math.Between(60, GAME.WIDTH - 60);
  const t = s.add.text(x, 150, text, { fontFamily: 'Georgia, serif', fontSize: '9px', color, fontStyle: 'italic' }).setOrigin(0.5).setDepth(30);
  s.tweens.add({ targets: t, y: 128, alpha: 0, duration: 1300, onComplete: () => t.destroy() });
}
