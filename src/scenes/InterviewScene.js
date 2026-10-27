// ENTREVISTA: retrato grande de la persona y la lista de temas para preguntarle.
// Al elegir, guarda el tema en el registry ('interviewPick') y vuelve al pueblo,
// que reproduce el diálogo y aplica sus efectos.

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { SPEAKERS } from '../data/speakers.js';
import { fmt } from '../systems/text.js';
import { sfx } from '../systems/audio.js';

export default class InterviewScene extends Phaser.Scene {
  constructor() {
    super('Interview');
  }

  init(data) {
    this.npc = data.npc;
    this.topics = data.topics || [];
    this.sel = 0;
    this.closing = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const sp = SPEAKERS[this.npc] || {};
    const col = Phaser.Display.Color.HexStringToColor(sp.color || '#efe3c2').color;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x081016, 0.55).setOrigin(0);
    const panel = this.add.graphics();
    panel.fillStyle(0x0d1820, 0.96); panel.fillRoundedRect(16, 22, WIDTH - 32, HEIGHT - 44, 10);
    panel.lineStyle(2, 0xe3b04b, 0.8); panel.strokeRoundedRect(16, 22, WIDTH - 32, HEIGHT - 44, 10);
    // Retrato.
    const glow = this.add.graphics();
    for (let r = 58; r > 0; r -= 6) { glow.fillStyle(col, 0.02 + (58 - r) / 1600); glow.fillCircle(92, 128, r); }
    const key = sp.portrait && this.textures.exists(sp.portrait) ? sp.portrait : 'player';
    const img = this.add.image(92, 178, key).setOrigin(0.5, 1).setScale(4);
    this.tweens.add({ targets: img, y: 175, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.text(92, 196, fmt(sp.name || ''), { fontFamily: 'Georgia, serif', fontSize: '13px', color: sp.color || COLORS.cream }).setOrigin(0.5, 0).setShadow(1, 1, '#000', 2);

    this.add.text(176, 34, '¿De qué quieres hablar?', { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.gold });
    const items = [...this.topics.map((t) => ({ ...t })), { id: null, label: 'Despedirse', isNew: false }];
    this.items = items;
    this.rows = items.map((t, i) => {
      const y = 58 + i * 28;
      const bg = this.add.rectangle(176, y, WIDTH - 210, 24, 0x16303a, 0.9).setOrigin(0).setStrokeStyle(1, 0x3fa3a0, 0.5).setInteractive({ useHandCursor: true });
      const label = (t.isNew ? '● ' : '') + fmt(t.label);
      const tx = this.add.text(186, y + 12, label, { fontFamily: 'Georgia, serif', fontSize: '10px', color: t.id ? COLORS.cream : '#9fb8c0', wordWrap: { width: WIDTH - 230 } }).setOrigin(0, 0.5);
      bg.on('pointerover', () => { this.sel = i; this.refresh(); });
      bg.on('pointerdown', () => { this.sel = i; this.refresh(); this.pick(); });
      return { bg, tx };
    });
    this.refresh();
    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-W', () => this.move(-1));
    kb.on('keydown-S', () => this.move(1));
    ['ENTER', 'SPACE', 'X', 'E'].forEach((k) => kb.on('keydown-' + k, () => this.pick()));
    kb.on('keydown-ESC', () => { this.sel = this.items.length - 1; this.pick(); });
    this.cameras.main.fadeIn(150, 0, 0, 0);
  }

  move(d) {
    this.sel = Phaser.Math.Wrap(this.sel + d, 0, this.items.length);
    this.refresh();
    sfx('select');
  }

  refresh() {
    this.rows.forEach((r, i) => {
      const on = i === this.sel;
      r.bg.setFillStyle(on ? 0x2a5a5e : 0x16303a, 0.95).setStrokeStyle(1, on ? 0xe3b04b : 0x3fa3a0, on ? 1 : 0.5);
      r.tx.setColor(on ? COLORS.gold : this.items[i].id ? COLORS.cream : '#9fb8c0');
    });
  }

  pick() {
    if (this.closing) return;
    this.closing = true;
    sfx('confirm');
    this.registry.set('interviewPick', this.items[this.sel].id);
    if (this.scene.isPaused('Town')) this.scene.resume('Town');
    this.scene.stop();
  }
}
