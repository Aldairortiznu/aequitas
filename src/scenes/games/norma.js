// ARMA LA NORMA: casi todo artículo tiene dos mitades. El supuesto de hecho
// («si pasa esto...») y la consecuencia jurídica («...entonces esto»). Quien
// juega une cada «si...» con su «entonces...». Yuli aprende a leer una norma.

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { NORMAS } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const LX = 124;
const RX = 356;
const CW = 214;
const CH = 34;

export default {
  name: 'Arma la norma',
  how: 'Casi toda norma tiene dos mitades: «si pasa esto...» y «...entonces la ley dice esto». Toca un «si» de la izquierda y luego el «entonces» que le corresponde a la derecha (o flechas y X).',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    // Un tablero de escuela improvisado, con tiza.
    g.fillStyle(0x2a3a2e, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle(0x24332a, 1); for (let y = 40; y < HEIGHT; y += 6) g.fillRect(0, y, WIDTH, 1);
    g.lineStyle(3, 0x6e4527, 1); g.strokeRect(4, 34, WIDTH - 8, HEIGHT - 38);
    s.add.image(WIDTH - 22, HEIGHT - 6, 'npc_yuli').setOrigin(0.5, 1).setScale(1.6).setDepth(5);
    s.title('Arma la norma', 'Si pasa esto... entonces la ley dice esto');
    s.add.text(LX, 44, 'SI...  (supuesto de hecho)', { fontFamily: 'monospace', fontSize: '8px', color: '#d8e8d0' }).setOrigin(0.5).setDepth(20);
    s.add.text(RX, 44, '...ENTONCES  (consecuencia)', { fontFamily: 'monospace', fontSize: '8px', color: '#d8e8d0' }).setOrigin(0.5).setDepth(20);
    s.lines = s.add.graphics().setDepth(15);
  },

  start(s) {
    const pairs = Phaser.Utils.Array.Shuffle([...NORMAS.pairs]).slice(0, NORMAS.rounds);
    const right = Phaser.Utils.Array.Shuffle(pairs.map((p, i) => i));
    s.done = 0;
    s.mistakes = 0;
    s.pickL = null;
    const card = (x, y, text, side, idx) => {
      const c = s.add.container(x, y).setDepth(20);
      const bg = s.add.rectangle(0, 0, CW, CH, 0xf3ecd8, 0.95).setStrokeStyle(2, 0xb0a080, 1);
      const t = s.add.text(0, 0, text, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', align: 'center', wordWrap: { width: CW - 14 } }).setOrigin(0.5);
      c.add([bg, t]);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => { if (s.playing && !s.ended) this.tap(s, side, idx); });
      return { c, bg, t, side, idx, done: false };
    };
    s.left = pairs.map((p, i) => card(LX, 70 + i * 44, p.si, 'L', i));
    s.right = right.map((pi, j) => ({ ...card(RX, 70 + j * 44, pairs[pi].entonces, 'R', j), pair: pi }));
    s.pairs = pairs;
    s.cur = { side: 'L', i: 0 };
    s.key(['UP', 'W'], () => this.move(s, 0, -1));
    s.key(['DOWN', 'S'], () => this.move(s, 0, 1));
    s.key(['LEFT', 'A'], () => this.move(s, -1, 0));
    s.key(['RIGHT', 'D'], () => this.move(s, 1, 0));
    s.key(['X', 'ENTER', 'SPACE', 'E'], () => this.tap(s, s.cur.side, s.cur.i));
    this.paint(s);
  },

  list(s, side) { return side === 'L' ? s.left : s.right; },

  move(s, dx, dy) {
    if (dx) s.cur.side = dx < 0 ? 'L' : 'R';
    if (dy) s.cur.i = Phaser.Math.Wrap(s.cur.i + dy, 0, s.left.length);
    sfx('select');
    this.paint(s);
  },

  paint(s) {
    [...s.left, ...s.right].forEach((c) => {
      const cur = s.cur.side === c.side && s.cur.i === c.idx;
      const chosen = c.side === 'L' && s.pickL === c.idx;
      if (c.done) c.bg.setStrokeStyle(2, 0x2f6b3f, 1);
      else c.bg.setStrokeStyle(cur || chosen ? 3 : 2, chosen ? 0xe3b04b : cur ? 0xffe070 : 0xb0a080, 1);
      c.bg.setFillStyle(c.done ? 0xd8ecc8 : chosen ? 0xfbe8b8 : 0xf3ecd8, 0.95);
    });
  },

  tap(s, side, i) {
    const c = this.list(s, side)[i];
    if (!c || c.done) return;
    s.cur = { side, i };
    if (side === 'L') { s.pickL = i; sfx('select'); this.paint(s); return; }
    if (s.pickL == null) { s.pop('Primero elige un «si...»', '#f3d0c0', 240, '11px'); this.paint(s); return; }
    const L = s.left[s.pickL];
    if (c.pair !== s.pickL) {
      s.mistakes++;
      s.bad();
      s.tweens.add({ targets: c.c, x: c.c.x + 4, duration: 50, yoyo: true, repeat: 3 });
      s.pop('Esa consecuencia es de otra norma', '#f3d0c0', 240, '11px');
      return;
    }
    // Pareja correcta: se unen con una línea de tiza y aparece el artículo.
    L.done = true; c.done = true;
    s.lines.lineStyle(2, 0xf3ecd8, 0.85);
    s.lines.lineBetween(LX + CW / 2, L.c.y, RX - CW / 2, c.c.y);
    const mx = (LX + RX) / 2;
    s.add.text(mx, (L.c.y + c.c.y) / 2 - 6, s.pairs[c.pair].ley, { fontFamily: 'monospace', fontSize: '7px', color: '#ffe9a0', backgroundColor: '#2a3a2ee6', padding: { x: 2, y: 1 } }).setOrigin(0.5).setDepth(25);
    s.good(c.c.x, c.c.y);
    s.pickL = null;
    s.done++;
    this.paint(s);
    if (s.done >= s.pairs.length) {
      s.time.delayedCall(700, () => s.win(Math.max(1, 4 - s.mistakes), 'Supuesto de hecho y consecuencia jurídica: las dos mitades de casi toda norma. Si sabes cuál es el «si», sabes cuándo se aplica la ley.'));
    }
  },
};
