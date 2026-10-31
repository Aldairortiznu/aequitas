// LA MATRÍCULA ROTA: las dos mitades (la de Anselmo y la de la cabina) están
// hechas trizas. Coloca cada pedazo en su lugar, en orden de lectura.

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { MATRICULA } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const SW = 170;
const SH = 18;

export default {
  name: 'La matrícula rota',
  how: 'Junta las dos mitades del documento. El espacio que brilla es el siguiente: elige el pedazo que va ahí (tócalo, o muévete con las flechas y pulsa X). Lee con cuidado: cada mitad continúa la frase de la otra.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillGradientStyle(0x3a2a1a, 0x3a2a1a, 0x1d1410, 0x1d1410, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    s.title('La matrícula rota', 'Pedazos en orden de lectura');
    // El documento.
    const dx = WIDTH / 2 - SW - 6;
    const dy = 54;
    g.fillStyle(0xefe3c2, 1); g.fillRoundedRect(dx - 8, dy - 6, SW * 2 + 28, 4 * (SH + 6) + 8, 4);
    g.lineStyle(1, 0xb5a68a, 1); g.strokeRoundedRect(dx - 8, dy - 6, SW * 2 + 28, 4 * (SH + 6) + 8, 4);
    s.slots = MATRICULA.pieces.map((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = dx + col * (SW + 12) + SW / 2;
      const y = dy + row * (SH + 6) + SH / 2;
      const r = s.add.rectangle(x, y, SW, SH, 0xd8c79e, 0.6).setStrokeStyle(1, 0xb5a68a, 0.9);
      return { x, y, r, filled: false };
    });
    s.add.text(WIDTH / 2, dy + 4 * (SH + 6) + 8, 'Mitad de Anselmo (izquierda) · mitad de la cabina (derecha)', { fontFamily: 'monospace', fontSize: '7px', color: '#bfa98a' }).setOrigin(0.5, 0);
    // Los pedazos, revueltos.
    const order = Phaser.Utils.Array.Shuffle(MATRICULA.pieces.map((p, i) => i));
    s.pieces = order.map((idx, k) => {
      const p = MATRICULA.pieces[idx];
      const col = k % 3;
      const row = Math.floor(k / 3);
      const x = 86 + col * 154;
      const y = 184 + row * 26;
      const c = s.add.container(x, y).setDepth(10);
      const bg = s.add.rectangle(0, 0, 148, 20, p.side === 'A' ? 0xefe3c2 : 0xd8cbb0).setStrokeStyle(1, 0x8a7a62);
      const t = s.add.text(0, 0, p.t, { fontFamily: 'monospace', fontSize: '8px', color: '#2a2018' }).setOrigin(0.5);
      const stain = s.add.rectangle(p.side === 'A' ? 68 : -68, 0, 8, 20, 0x8a7a62, 0.35);
      c.add([bg, stain, t]);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => { if (s.playing && !s.ended) this.place(s, k); });
      // Torcidos apenas: revueltos, pero sin taparse unos a otros.
      c.setAngle(Phaser.Math.Between(-2, 2));
      return { idx, c, bg, t, placed: false, home: { x, y } };
    });
    s.slotIdx = 0;
    s.sel = 0;
    s.selBox = s.add.rectangle(0, 0, 154, 26).setStrokeStyle(2, 0xffe070).setDepth(9).setVisible(false);
  },

  start(s) {
    s.timer(60, () => s.lose('Se acabó el tiempo y los pedazos se volaron con la brisa. ¡Inténtalo otra vez!'));
    s.key(['LEFT', 'A'], () => this.moveSel(s, -1));
    s.key(['RIGHT', 'D'], () => this.moveSel(s, 1));
    s.key(['UP', 'W'], () => this.moveSel(s, -3));
    s.key(['DOWN', 'S'], () => this.moveSel(s, 3));
    s.key(['X', 'E', 'SPACE', 'ENTER'], () => this.place(s, s.sel));
    this.highlight(s);
    this.moveSel(s, 0);
  },

  free(s) { return s.pieces.filter((p) => !p.placed); },

  // Mueve la selección al siguiente pedazo libre (d = ±1 o ±3 por filas).
  moveSel(s, d) {
    const n = s.pieces.length;
    let k = s.sel;
    if (d === 0 && !s.pieces[k].placed) {
      // se queda donde está
    } else {
      const step = d || 1;
      for (let tries = 0; tries < n; tries++) {
        k = Phaser.Math.Wrap(k + step, 0, n);
        if (!s.pieces[k].placed) break;
      }
    }
    s.sel = k;
    const p = s.pieces[k];
    s.selBox.setPosition(p.c.x, p.c.y).setVisible(!p.placed);
  },

  highlight(s) {
    s.slots.forEach((sl, i) => sl.r.setStrokeStyle(i === s.slotIdx ? 2 : 1, i === s.slotIdx ? 0xe3b04b : 0xb5a68a, 1));
    const sl = s.slots[s.slotIdx];
    if (sl) { s.tweens.killTweensOf(sl.r); sl.r.setAlpha(1); s.tweens.add({ targets: sl.r, alpha: 0.5, duration: 400, yoyo: true, repeat: -1 }); }
  },

  place(s, k) {
    const p = s.pieces[k];
    if (!p || p.placed) return;
    if (p.idx !== s.slotIdx) {
      s.bad();
      s.tweens.add({ targets: p.c, x: p.home.x + 6, duration: 50, yoyo: true, repeat: 3 });
      s.pop('No encaja ahí', '#e8817a', 150, '12px');
      return;
    }
    p.placed = true;
    const sl = s.slots[s.slotIdx];
    s.tweens.killTweensOf(sl.r);
    sl.r.setAlpha(1);
    // El papel se estira al ancho del espacio; la letra no (se compensa).
    s.tweens.add({ targets: p.c, x: sl.x, y: sl.y, angle: 0, scaleX: SW / 148, scaleY: SH / 20, duration: 260, ease: 'Cubic.out' });
    s.tweens.add({ targets: p.t, scaleX: 148 / SW, scaleY: 20 / SH, duration: 260, ease: 'Cubic.out' });
    sfx('page');
    s.slotIdx++;
    if (s.slotIdx >= MATRICULA.pieces.length) {
      s.selBox.setVisible(false);
      s.time.delayedCall(400, () => {
        const stamp = s.add.text(GAME.WIDTH / 2, 92, 'COMPLETA', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#b5302a' }).setOrigin(0.5).setAngle(-12).setAlpha(0).setScale(2.2).setDepth(20);
        s.tweens.add({ targets: stamp, alpha: 0.85, scale: 1, duration: 260, ease: 'Back.in' });
        s.cameras.main.shake(140, 0.006);
        sfx('seal');
        s.time.delayedCall(1300, () => s.win(1, 'La matrícula dice: lancha «Niña Mercedes», motor rojo serie MR-4471-R, propietario Anselmo Mendoza Pacheco. Si encontramos la placa del motor, sabremos si es la misma.'));
      });
      return;
    }
    this.highlight(s);
    this.moveSel(s, 1);
  },
};
