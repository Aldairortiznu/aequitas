// ¡NUEVA CARTA DEL CÓDICE! La carta gira, brilla y se guarda. Es el momento de
// aprender una norma en palabras sencillas (y queda en el Expediente).

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { CODEX, FAMILIES } from '../data/codex.js';
import { sfx } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';

export default class CardScene extends Phaser.Scene {
  constructor() {
    super('Card');
  }

  init(data) {
    this.card = CODEX[data.id];
    this.returnScene = data.returnScene || 'Town';
    this.ready = false;
    this.closing = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    if (!this.card) { this.close(); return; }
    const fam = FAMILIES[this.card.fam] || FAMILIES.civil;
    const fc = Phaser.Display.Color.HexStringToColor(fam.color).color;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x05080a, 0.78).setOrigin(0);
    // Rayos de luz detrás de la carta.
    const rays = this.add.graphics({ x: WIDTH / 2, y: HEIGHT / 2 });
    for (let i = 0; i < 12; i++) { rays.fillStyle(fc, 0.07); rays.slice(0, 0, 220, (i * Math.PI) / 6, (i * Math.PI) / 6 + 0.16); rays.fillPath(); }
    this.tweens.add({ targets: rays, rotation: Math.PI * 2, duration: 30000, repeat: -1 });
    this.add.text(WIDTH / 2, 18, '¡NUEVA CARTA DEL CÓDICE!', { fontFamily: 'monospace', fontSize: '10px', color: COLORS.gold }).setOrigin(0.5).setLetterSpacing(2);

    const cw = 300;
    const ch = 200;
    const c = this.add.container(WIDTH / 2, HEIGHT / 2 + 6);
    const g = this.add.graphics();
    g.fillStyle(0xefe3c2, 1); g.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 10);
    g.lineStyle(3, fc, 1); g.strokeRoundedRect(-cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, 8);
    g.fillStyle(fc, 1); g.fillRoundedRect(-cw / 2 + 8, -ch / 2 + 8, cw - 16, 26, 5);
    c.add(g);
    c.add(this.add.image(-cw / 2 + 22, -ch / 2 + 21, 'ic_law').setScale(1.3));
    c.add(this.add.text(-cw / 2 + 36, -ch / 2 + 13, this.card.ley, { fontFamily: 'monospace', fontSize: '8px', color: '#1a1410', wordWrap: { width: cw - 54 } }));
    c.add(this.add.text(0, -ch / 2 + 46, this.card.titulo, { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1a1410', align: 'center', wordWrap: { width: cw - 24 } }).setOrigin(0.5, 0));
    c.add(this.add.text(-cw / 2 + 14, -ch / 2 + 72, this.card.texto, { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#2a2018', wordWrap: { width: cw - 28 }, lineSpacing: 2 }));
    const ex = this.add.text(-cw / 2 + 14, ch / 2 - 46, '▸ ' + this.card.ejemplo, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#7a3a1a', fontStyle: 'italic', wordWrap: { width: cw - 28 } });
    c.add(ex);
    c.add(this.add.text(cw / 2 - 12, ch / 2 - 12, fam.label, { fontFamily: 'monospace', fontSize: '7px', color: '#7a6a52' }).setOrigin(1, 1));
    // Entrada: gira desde el dorso.
    c.setScale(0.1, 1).setAlpha(0);
    this.tweens.add({ targets: c, scaleX: 1, alpha: 1, duration: 450, ease: 'Back.out', onComplete: () => { this.ready = true; } });
    sfx('seal');
    vibrate(30);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const sp = this.add.image(WIDTH / 2, HEIGHT / 2, 'p_spark').setTint(fc).setDepth(5);
      this.tweens.add({ targets: sp, x: WIDTH / 2 + Math.cos(a) * 170, y: HEIGHT / 2 + Math.sin(a) * 120, alpha: 0, duration: 700, onComplete: () => sp.destroy() });
    }
    this.cont = this.add.text(WIDTH / 2, HEIGHT - 12, 'Toca o pulsa X para guardarla en el Códice', { fontFamily: 'monospace', fontSize: '8px', color: '#9fb8c0' }).setOrigin(0.5);
    this.tweens.add({ targets: this.cont, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
    const go = () => { if (this.ready) this.close(); };
    ['X', 'E', 'ENTER', 'SPACE', 'ESC'].forEach((k) => this.input.keyboard.on('keydown-' + k, go));
    this.input.on('pointerdown', go);
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    sfx('confirm');
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
