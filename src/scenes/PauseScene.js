// Menú de pausa (Esc): se lanza sobre la escena actual, que queda pausada.
// Reanudar, Expediente, Ajustes y Menú principal.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { sfx } from '../systems/audio.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause', cameras: CAMERA });
  }

  init(data) {
    this.returnScene = (data && data.returnScene) || 'Town';
    this.selected = 0;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x081016, 0.7).setOrigin(0);
    const pw = 190;
    const ph = 132;
    const px = WIDTH / 2 - pw / 2;
    const py = HEIGHT / 2 - ph / 2;
    const g = this.add.graphics();
    g.fillStyle(0x0d1820, 1); g.fillRoundedRect(px, py, pw, ph, 8);
    g.lineStyle(2, 0xe3b04b, 0.9); g.strokeRoundedRect(px, py, pw, ph, 8);
    this.add.text(WIDTH / 2, py + 14, 'Pausa', { fontFamily: 'Georgia, serif', fontSize: '15px', color: COLORS.gold }).setOrigin(0.5);
    this.options = [
      { label: 'Reanudar', action: () => this.resume() },
      { label: 'Expediente', action: () => this.swap('CaseFile') },
      { label: 'Ajustes', action: () => this.swap('Settings') },
      { label: 'Menú principal', action: () => this.toMenu() },
    ];
    this.texts = this.options.map((o, i) => {
      const t = this.add.text(WIDTH / 2, py + 42 + i * 21, o.label, { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.cream }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.selected = i; this.refresh(); });
      t.on('pointerdown', () => { this.selected = i; this.refresh(); o.action(); });
      return t;
    });
    this.refresh();
    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => { this.selected = Phaser.Math.Wrap(this.selected - 1, 0, this.options.length); this.refresh(); sfx('select'); });
    kb.on('keydown-DOWN', () => { this.selected = Phaser.Math.Wrap(this.selected + 1, 0, this.options.length); this.refresh(); sfx('select'); });
    ['ENTER', 'SPACE', 'X', 'E'].forEach((k) => kb.on('keydown-' + k, () => { sfx('confirm'); this.options[this.selected].action(); }));
    kb.on('keydown-ESC', () => this.resume());
  }

  refresh() {
    this.texts.forEach((t, i) => {
      const on = i === this.selected;
      t.setColor(on ? COLORS.gold : COLORS.cream).setText((on ? '❯ ' : '  ') + this.options[i].label).setScale(on ? 1.06 : 1);
    });
  }

  resume() {
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }

  // Abre otra capa encima de la escena pausada (al cerrarla, la reanuda).
  swap(key) {
    this.scene.stop();
    this.scene.launch(key, { returnScene: this.returnScene, pausedReturn: true });
  }

  toMenu() {
    this.scene.stop(this.returnScene);
    this.scene.stop();
    this.scene.start('Menu');
  }
}
