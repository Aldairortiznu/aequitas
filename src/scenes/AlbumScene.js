// ESCENAS DE LA HISTORIA: las escenas cinematográficas que ya se han visto, en
// una cuadrícula de 3 × 2. Tocar una (o elegirla con flechas y X) la vuelve a
// mostrar. Las que faltan se ven veladas.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { POSTALES } from '../data/postales.js';
import { paintPostal, POSTAL_W, POSTAL_H } from '../art/postales.js';
import { unlockedPostales } from '../systems/postales.js';
import { sfx } from '../systems/audio.js';

const TW = 132;
const TH = Math.round((TW * POSTAL_H) / POSTAL_W);

export default class AlbumScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Album', cameras: CAMERA });
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0x1a1028, 0x1a1028, 0x0c1420, 0x0c1420, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 60; i++) { g.fillStyle(0xffffff, 0.15 + ((i * 7) % 5) / 14); g.fillRect((i * 97) % WIDTH, (i * 53) % HEIGHT, 1, 1); }
    this.add.text(WIDTH / 2, 12, 'Escenas de la historia', { fontFamily: 'Georgia, serif', fontSize: '16px', color: COLORS.gold, stroke: '#140c08', strokeThickness: 3 }).setOrigin(0.5, 0);
    const got = unlockedPostales();
    this.add.text(WIDTH / 2, 33, `${Object.keys(got).filter((k) => POSTALES.some((p) => p.key === k)).length} de ${POSTALES.length} · los momentos de la historia`, { fontFamily: 'monospace', fontSize: '8px', color: '#cfc3a8' }).setOrigin(0.5, 0);

    this.cards = POSTALES.map((p, i) => {
      const x = WIDTH / 2 + ((i % 3) - 1) * (TW + 14);
      const y = 50 + Math.floor(i / 3) * (TH + 30) + TH / 2;
      const open = !!got[p.key];
      const frame = this.add.rectangle(x, y, TW + 6, TH + 6, 0xefe3c2, 1).setStrokeStyle(2, 0xe3b04b, 0.4);
      if (open) {
        const rt = this.add.renderTexture(x, y, POSTAL_W, POSTAL_H).setScale(TW / POSTAL_W);
        const art = paintPostal(this, p.key);
        rt.draw(art);
        art.destroy();
      } else {
        this.add.rectangle(x, y, TW, TH, 0x24182e, 1);
        this.add.text(x, y - 4, '?', { fontFamily: 'Georgia, serif', fontSize: '20px', color: '#6a5a7a' }).setOrigin(0.5);
        this.add.text(x, y + 16, 'Sigue jugando', { fontFamily: 'monospace', fontSize: '7px', color: '#8a7a9a' }).setOrigin(0.5);
      }
      const label = this.add.text(x, y + TH / 2 + 6, open ? p.title : '· · ·', { fontFamily: 'Georgia, serif', fontSize: '9px', color: open ? COLORS.cream : '#6a5a7a' }).setOrigin(0.5, 0);
      frame.setInteractive({ useHandCursor: true });
      frame.on('pointerover', () => { this.sel = i; this.paint(); });
      frame.on('pointerdown', () => { this.sel = i; this.paint(); this.openCard(); });
      return { p, frame, label, open };
    });

    const back = this.add.text(WIDTH / 2, HEIGHT - 14, '◂ Volver al menú', { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, backgroundColor: '#2a1d2ee0', padding: { x: 8, y: 3 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.leave());

    this.sel = Math.max(0, this.cards.findIndex((c) => c.open));
    this.paint();
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.move(-1));
    kb.on('keydown-RIGHT', () => this.move(1));
    kb.on('keydown-UP', () => this.move(-3));
    kb.on('keydown-DOWN', () => this.move(3));
    ['X', 'ENTER', 'SPACE', 'E'].forEach((k) => kb.on('keydown-' + k, () => this.openCard()));
    kb.on('keydown-ESC', () => this.leave());
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  move(d) {
    this.sel = Phaser.Math.Wrap(this.sel + d, 0, this.cards.length);
    sfx('select');
    this.paint();
  }

  paint() {
    this.cards.forEach((c, i) => {
      const on = i === this.sel;
      c.frame.setStrokeStyle(2, on ? 0xffe070 : 0xe3b04b, on ? 1 : 0.35);
      c.label.setColor(on && c.open ? '#ffe2a0' : c.open ? COLORS.cream : '#6a5a7a');
    });
  }

  openCard() {
    const c = this.cards[this.sel];
    if (!c || !c.open || this.leaving) { sfx('select'); return; }
    this.leaving = true;
    sfx('confirm');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Postcard', { key: c.p.key, album: true }));
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
  }
}
