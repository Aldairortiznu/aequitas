// EL ALUMBRADO DEL MUELLE: gira los tramos de cable para llevar la energía del
// panel solar a los cuatro faroles. Toca una pieza (o muévete y pulsa X).

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { CIRCUITO } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const SZ = 32;
const DIRS = ['N', 'E', 'S', 'W'];
const OFF = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

const rot = (conns, r) => conns.map((c) => DIRS[(DIRS.indexOf(c) + r) % 4]);

export default {
  name: 'El alumbrado del muelle',
  how: 'Los cables quedaron revueltos. Gira las piezas para que la energía del panel solar llegue a los cuatro faroles. Toca una pieza para girarla (o muévete con las flechas y pulsa X).',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillGradientStyle(0x14232e, 0x14232e, 0x2b4f6c, 0x2b4f6c, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 50; i++) { g.fillStyle(0xffffff, 0.2 + (i % 4) / 10); g.fillRect((i * 97) % WIDTH, (i * 41) % 90, 1, 1); }
    s.title('El alumbrado del muelle', 'Lleva la luz a los 4 faroles');
    const W = CIRCUITO.w;
    const H = CIRCUITO.h;
    s.ox = WIDTH / 2 - (W * SZ) / 2;
    s.oy = 52;
    const board = s.add.graphics();
    board.fillStyle(0x3a2a1a, 1); board.fillRoundedRect(s.ox - 8, s.oy - 8, W * SZ + 16, H * SZ + 16, 6);
    board.fillStyle(0x5a3a20, 1); board.fillRoundedRect(s.ox - 4, s.oy - 4, W * SZ + 8, H * SZ + 8, 4);
    s.cells = {};
    CIRCUITO.cells.forEach((c) => {
      const cell = { ...c, conns: c.c.split(''), r: 0 };
      cell.g = s.add.graphics({ x: s.ox + c.x * SZ + SZ / 2, y: s.oy + c.y * SZ + SZ / 2 }).setDepth(5);
      s.cells[c.x + ',' + c.y] = cell;
    });
    s.cursor = { x: 1, y: 2 };
    s.cursorBox = s.add.rectangle(0, 0, SZ, SZ).setStrokeStyle(2, 0xffe070, 1).setDepth(6).setVisible(false);
    s.moves = 0;
    s.movesText = s.add.text(WIDTH - 12, 50, '', { fontFamily: 'monospace', fontSize: '8px', color: '#bfe0d8' }).setOrigin(1, 0);
  },

  start(s) {
    // Desordena las piezas (sin dejar el circuito resuelto).
    do {
      Object.values(s.cells).forEach((c) => { if (c.k === 'P') c.r = Phaser.Math.Between(0, 3); });
    } while (this.litLamps(s) >= 4);
    this.draw(s);
    s.cursorBox.setVisible(true);
    this.moveCursor(s, 0, 0);
    s.input.on('pointerdown', (p) => {
      if (!s.playing || s.ended) return;
      const x = Math.floor((p.x - s.ox) / SZ);
      const y = Math.floor((p.y - s.oy) / SZ);
      if (s.cells[x + ',' + y]) { s.cursor = { x, y }; this.moveCursor(s, 0, 0); this.turn(s, x, y); }
    });
    s.key(['LEFT', 'A'], () => this.moveCursor(s, -1, 0));
    s.key(['RIGHT', 'D'], () => this.moveCursor(s, 1, 0));
    s.key(['UP', 'W'], () => this.moveCursor(s, 0, -1));
    s.key(['DOWN', 'S'], () => this.moveCursor(s, 0, 1));
    s.key(['X', 'E', 'SPACE', 'ENTER'], () => this.turn(s, s.cursor.x, s.cursor.y));
  },

  moveCursor(s, dx, dy) {
    s.cursor.x = Phaser.Math.Clamp(s.cursor.x + dx, 0, CIRCUITO.w - 1);
    s.cursor.y = Phaser.Math.Clamp(s.cursor.y + dy, 0, CIRCUITO.h - 1);
    s.cursorBox.setPosition(s.ox + s.cursor.x * SZ + SZ / 2, s.oy + s.cursor.y * SZ + SZ / 2);
  },

  turn(s, x, y) {
    const c = s.cells[x + ',' + y];
    if (!c || c.k !== 'P' || s.solved) return;
    c.r = (c.r + 1) % 4;
    s.moves++;
    sfx('select');
    this.draw(s);
    c.g.setAngle(-90);
    s.tweens.add({ targets: c.g, angle: 0, duration: 120 });
    const lit = this.litLamps(s);
    if (lit >= 4) {
      s.solved = true;
      sfx('portal');
      s.cameras.main.flash(300, 255, 240, 180);
      s.time.delayedCall(900, () => s.win(s.moves, `¡Luz en el muelle con ${s.moves} giros! El muelle es como las plazas y los caminos: un bien que es de todos y que entre todos se cuida.`));
    }
  },

  conns(c) { return c.k === 'P' ? rot(c.conns, c.r) : c.conns; },

  // Qué celdas reciben energía desde el panel (conexiones mutuas).
  lit(s) {
    const src = Object.values(s.cells).find((c) => c.k === 'S');
    const seen = new Set([src.x + ',' + src.y]);
    const q = [src];
    while (q.length) {
      const c = q.shift();
      for (const d of this.conns(c)) {
        const [dx, dy] = OFF[d];
        const n = s.cells[(c.x + dx) + ',' + (c.y + dy)];
        if (!n || seen.has(n.x + ',' + n.y)) continue;
        if (!this.conns(n).includes(OPP[d])) continue;
        seen.add(n.x + ',' + n.y);
        q.push(n);
      }
    }
    return seen;
  },

  litLamps(s) {
    const lit = this.lit(s);
    return Object.values(s.cells).filter((c) => c.k === 'B' && lit.has(c.x + ',' + c.y)).length;
  },

  draw(s) {
    const lit = this.lit(s);
    let lamps = 0;
    Object.values(s.cells).forEach((c) => {
      const on = lit.has(c.x + ',' + c.y);
      const g = c.g;
      g.clear();
      g.fillStyle(0x2a1d14, 1); g.fillRect(-SZ / 2 + 1, -SZ / 2 + 1, SZ - 2, SZ - 2);
      const col = on ? 0xffd25a : 0x8a5a34;
      this.conns(c).forEach((d) => {
        const [dx, dy] = OFF[d];
        g.fillStyle(col, 1);
        if (dx) g.fillRect(dx > 0 ? 0 : -SZ / 2, -3, SZ / 2, 6);
        else g.fillRect(-3, dy > 0 ? 0 : -SZ / 2, 6, SZ / 2);
      });
      g.fillStyle(col, 1); g.fillCircle(0, 0, 4);
      if (c.k === 'S') { g.fillStyle(0x24435e, 1); g.fillRect(-11, -9, 22, 16); g.fillStyle(0x3f6d93, 1); g.fillRect(-9, -7, 8, 5); g.fillRect(1, -7, 8, 5); g.fillRect(-9, 0, 8, 5); g.fillRect(1, 0, 8, 5); }
      if (c.k === 'B') {
        if (on) { lamps++; for (let r = 15; r > 0; r -= 3) { g.fillStyle(0xffe070, 0.06 + (15 - r) / 60); g.fillCircle(0, 0, r); } }
        g.fillStyle(on ? 0xfff3b0 : 0x5c6468, 1); g.fillCircle(0, 0, 7);
        g.fillStyle(0x3a3f42, 1); g.fillRect(-3, c.conns[0] === 'N' ? -12 : 7, 6, 5);
      }
    });
    s.movesText.setText(`Faroles: ${lamps}/4 · Giros: ${s.moves}`);
  },
};
