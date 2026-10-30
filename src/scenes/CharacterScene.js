// ¿QUIÉN VIAJA A PUERTO GARZA? Elige a tu personaje entre los cuatro enviados de
// la Biblioteca (Tomás, Valeria, Río o Alex). En el juego te llaman por tu nombre,
// sin trato de género. Cada quien trae un pequeño don.
//   ← →  personaje    X / Enter  comenzar    Esc  volver

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { HEROES } from '../data/heroes.js';
import { newSave, writeSave } from '../systems/save.js';
import { startAudio, playTheme, sfx } from '../systems/audio.js';
import { buildPlayer } from './BootScene.js';
import { drawPlace } from './places.js';

const CARD_W = 106;
const CARD_H = 122;

export default class CharacterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Character', cameras: CAMERA });
  }

  init() {
    this.sel = 0;
    this.leaving = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0x2a1d2e, 0x2a1d2e, 0x14232e, 0x14232e, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    drawPlace(g, 'biblioteca');
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x081016, 0.45).setOrigin(0);
    this.add.particles(0, 0, 'p_soft', { x: { min: 0, max: WIDTH }, y: { min: 20, max: HEIGHT }, lifespan: 5000, speedY: { min: -6, max: -2 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.45, end: 0 }, tint: 0xffe0a0, frequency: 320, blendMode: 'ADD' });

    this.add.rectangle(0, 0, WIDTH, 24, 0x081016, 0.8).setOrigin(0);
    this.add.text(WIDTH / 2, 12, '¿Quién viaja a Puerto Garza?', { fontFamily: 'Georgia, serif', fontSize: '14px', color: COLORS.gold }).setOrigin(0.5);

    // Halo suave detrás de quien está elegido.
    if (!this.textures.exists('ch_glow')) {
      const c = this.textures.createCanvas('ch_glow', 64, 64);
      const gr = c.context.createRadialGradient(32, 32, 2, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,240,190,0.9)'); gr.addColorStop(1, 'rgba(255,240,190,0)');
      c.context.fillStyle = gr; c.context.fillRect(0, 0, 64, 64);
      c.refresh();
      c.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.cards = HEROES.map((h, i) => this.buildCard(h, i));
    this.buildInfo();
    this.buildButtons();
    this.refresh(false);

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.pick(this.sel - 1));
    kb.on('keydown-RIGHT', () => this.pick(this.sel + 1));
    kb.on('keydown-A', () => this.pick(this.sel - 1));
    kb.on('keydown-D', () => this.pick(this.sel + 1));
    ['X', 'ENTER', 'SPACE', 'E'].forEach((k) => kb.on('keydown-' + k, () => this.start()));
    kb.on('keydown-ESC', () => this.back());
    startAudio().then(() => playTheme('biblioteca')).catch(() => {});
    this.cameras.main.fadeIn(500, 0, 0, 0);
    // Paso en el sitio del personaje elegido.
    this.time.addEvent({ delay: 220, loop: true, callback: () => this.stepAnim() });
  }

  buildCard(h, i) {
    const x = 63 + i * 118;
    const y = 28;
    const bg = this.add.rectangle(x, y + CARD_H / 2, CARD_W, CARD_H, 0x0d1820, 0.9).setInteractive({ useHandCursor: true });
    const glow = this.add.image(x, y + 50, 'ch_glow').setScale(1.4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    const sprite = this.add.image(x, y + 86, 'hero_' + h.id).setOrigin(0.5, 1).setScale(3);
    const name = this.add.text(x, y + 89, h.name, { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.cream }).setOrigin(0.5, 0);
    const tag = this.add.text(x, y + 104, h.tag, { fontFamily: 'monospace', fontSize: '6px', color: '#9fb8c0', align: 'center', wordWrap: { width: CARD_W - 8 } }).setOrigin(0.5, 0);
    bg.on('pointerdown', () => { if (this.sel === i) this.start(); else this.pick(i); });
    return { h, x, bg, glow, sprite, name, tag, frame: 0 };
  }

  buildInfo() {
    const { WIDTH } = GAME;
    this.add.rectangle(WIDTH / 2, 190, WIDTH - 20, 64, 0x0d1820, 0.95).setStrokeStyle(1, 0xe3b04b, 0.6);
    this.bio = this.add.text(20, 164, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, wordWrap: { width: WIDTH - 40 }, lineSpacing: 2 });
    this.perk = this.add.text(20, 205, '', { fontFamily: 'monospace', fontSize: '8px', color: '#9fd3cf' });
  }

  buildButtons() {
    const { WIDTH } = GAME;
    const mk = (x, w, label, cb, fill) => {
      const bg = this.add.rectangle(x, 246, w, 22, fill, 0.96).setStrokeStyle(2, 0xe3b04b, 0.8).setInteractive({ useHandCursor: true });
      this.add.text(x, 246, label, { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
      bg.on('pointerdown', cb);
      return bg;
    };
    mk(74, 104, '◂ Volver', () => this.back(), 0x2a1d2e);
    mk(WIDTH - 104, 176, 'Comenzar el viaje ▸', () => this.start(), 0x2f6b3f);
    this.add.text(WIDTH / 2, 262, '← → elige personaje · X comenzar', { fontFamily: 'monospace', fontSize: '7px', color: '#6f9a9f' }).setOrigin(0.5);
  }

  pick(i) {
    if (this.leaving) return;
    const n = Phaser.Math.Wrap(i, 0, HEROES.length);
    if (n === this.sel) return;
    this.sel = n;
    sfx('select');
    this.refresh(true);
  }

  refresh(animated) {
    this.cards.forEach((c, i) => {
      const on = i === this.sel;
      c.bg.setStrokeStyle(on ? 2 : 1, on ? 0xe3b04b : 0x3fa3a0, on ? 1 : 0.5);
      c.name.setColor(on ? COLORS.gold : COLORS.cream);
      c.sprite.setTint(on ? 0xffffff : 0x8a8f94);
      c.glow.setAlpha(on ? 0.35 : 0);
      if (on && animated) { c.sprite.setScale(3.6); this.tweens.add({ targets: c.sprite, scale: 3.3, duration: 220, ease: 'Back.out' }); }
      else c.sprite.setScale(on ? 3.3 : 3);
      if (!on) c.sprite.setTexture('hero_' + c.h.id);
    });
    const h = HEROES[this.sel];
    this.bio.setText(h.bio);
    this.perk.setText(`Don · ${h.perk.name}: ${h.perk.desc}`);
  }

  stepAnim() {
    const c = this.cards[this.sel];
    if (!c) return;
    c.frame = (c.frame + 1) % 4;
    const key = 'hero_' + c.h.id + (c.frame === 1 ? '_walkA' : c.frame === 3 ? '_walkB' : '');
    if (this.textures.exists(key)) c.sprite.setTexture(key);
  }

  back() {
    if (this.leaving) return;
    this.leaving = true;
    sfx('select');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
  }

  start() {
    if (this.leaving) return;
    this.leaving = true;
    const h = HEROES[this.sel];
    sfx('confirm');
    const save = newSave(h.id);
    // Las dos primeras cartas llegan con la historia del comienzo.
    save.codex = { art116: true, art34: true };
    save.newCards = ['art116', 'art34'];
    writeSave(save);
    buildPlayer(this, save);
    const c = this.cards[this.sel];
    this.tweens.add({ targets: c.sprite, y: c.sprite.y - 6, duration: 160, yoyo: true });
    this.cameras.main.flash(200, 255, 240, 200);
    this.time.delayedCall(350, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Cinematic', {
        key: 'biblioteca',
        next: { scene: 'Minigame', data: { id: 'remar', next: { scene: 'Cinematic', data: { key: 'llegada', next: { scene: 'Town' } } } } },
      }));
    });
  }
}
