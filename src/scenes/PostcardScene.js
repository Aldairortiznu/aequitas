// POSTAL CINEMATOGRÁFICA: una imagen a pantalla completa que se acerca despacio
// (efecto Ken Burns), barras de cine, el título y unas líneas del narrador. Al
// final se puede guardar la postal como imagen. Se desbloquea en el álbum.
//
// Uso: this.scene.start('Postcard', { key, next: { scene, data } })
//      { key, album: true } — vista desde el álbum (vuelve al álbum).

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { getPostal } from '../data/postales.js';
import { paintPostal, downloadPostal } from '../art/postales.js';
import { unlockPostal } from '../systems/postales.js';
import { fmt } from '../systems/text.js';
import { sfx } from '../systems/audio.js';

export default class PostcardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Postcard', cameras: CAMERA });
  }

  init(data) {
    this.postal = getPostal(data.key);
    this.next = data.next || (data.album ? { scene: 'Album' } : { scene: 'Menu' });
    this.album = !!data.album;
    this.index = -1;
    this.leaving = false;
    this.done = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    if (!this.postal) { this.scene.start(this.next.scene, this.next.data || {}); return; }
    unlockPostal(this.postal.key);
    this.cam = this.cameras.main;

    // La pintura, que se acerca despacio desde el centro.
    this.art = paintPostal(this, this.postal.key);
    this.art.setSize(WIDTH, HEIGHT);
    const zoomIn = this.add.container(WIDTH / 2, HEIGHT / 2, [this.art]);
    this.art.setPosition(-WIDTH / 2, -HEIGHT / 2 - 30); // la franja de abajo tapa solo el suelo
    this.tweens.add({ targets: zoomIn, scale: 1.07, duration: 16000, ease: 'Sine.inOut' });
    this.add.particles(0, 0, 'p_soft', {
      x: { min: 0, max: WIDTH }, y: { min: 40, max: 230 }, lifespan: 5000,
      speedY: { min: -10, max: -2 }, speedX: { min: -5, max: 5 },
      scale: { start: 0.7, end: 0 }, alpha: { start: 0.5, end: 0 }, tint: 0xffe9a0, frequency: 260, blendMode: 'ADD',
    }).setDepth(5);

    // Barras de cine: arriba una delgada; abajo la franja del texto, que no tapa
    // a nadie de la imagen.
    this.add.rectangle(0, 0, WIDTH, 16, 0x05080a, 1).setOrigin(0).setDepth(30);
    const veil = this.add.graphics().setDepth(20);
    veil.fillGradientStyle(0x05080a, 0x05080a, 0x05080a, 0x05080a, 0, 0, 1, 1);
    veil.fillRect(0, HEIGHT - 84, WIDTH, 24);
    this.add.rectangle(0, HEIGHT - 60, WIDTH, 60, 0x05080a, 1).setOrigin(0).setDepth(30);
    this.add.rectangle(WIDTH / 2, HEIGHT - 60, WIDTH - 120, 1, 0xe3b04b, 0.45).setDepth(31);

    // Título de la postal: arriba a la izquierda, como un rótulo de película.
    const n = this.postal.key;
    this.titleT = this.add.text(18, 24, this.postal.title, { fontFamily: 'Georgia, serif', fontSize: '18px', color: COLORS.gold, stroke: '#140c08', strokeThickness: 3 }).setDepth(31).setAlpha(0);
    this.subT = this.add.text(19, 46, this.postal.sub, { fontFamily: 'Georgia, serif', fontSize: '10px', fontStyle: 'italic', color: COLORS.cream, stroke: '#140c08', strokeThickness: 2 }).setDepth(31).setAlpha(0);
    this.tagT = this.add.text(WIDTH - 18, 26, '✿ POSTAL', { fontFamily: 'monospace', fontSize: '8px', color: '#f2c43b', backgroundColor: '#140c08b0', padding: { x: 4, y: 2 } }).setOrigin(1, 0).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: [this.titleT, this.subT, this.tagT], alpha: 1, duration: 900, delay: 300 });
    this.textKey = n;

    this.body = this.add.text(WIDTH / 2, HEIGHT - 31, '', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#f5f1e4', align: 'center', wordWrap: { width: WIDTH - 70 }, lineSpacing: 3 }).setOrigin(0.5).setDepth(31);
    this.cont = this.add.text(WIDTH - 22, HEIGHT - 18, '▼', { fontFamily: 'monospace', fontSize: '10px', color: COLORS.gold }).setDepth(31).setVisible(false);
    this.tweens.add({ targets: this.cont, y: this.cont.y - 2, duration: 500, yoyo: true, repeat: -1 });
    this.toast = this.add.text(WIDTH / 2, 70, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#9be8a6', backgroundColor: '#0d1820e0', padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(40).setAlpha(0);

    const adv = () => this.advance();
    ['SPACE', 'ENTER', 'X', 'E'].forEach((k) => this.input.keyboard.on('keydown-' + k, adv));
    this.input.keyboard.on('keydown-P', () => this.save());
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    this.input.on('pointerdown', (p, over) => { if (!over || !over.length) adv(); });

    this.cam.fadeIn(900, 0, 0, 0);
    this.time.delayedCall(900, () => { if (this.index < 0) this.advance(); });
  }

  advance() {
    if (this.leaving) return;
    if (this.typing) { this.typer.remove(); this.body.setText(this.full); this.typing = false; this.cont.setVisible(true); return; }
    if (this.done) { this.leave(); return; }
    this.index++;
    if (this.index >= this.postal.lines.length) { this.showEnd(); return; }
    this.full = this.body.getWrappedText(fmt(this.postal.lines[this.index])).join('\n');
    this.body.setText('');
    this.shown = 0;
    this.typing = true;
    this.cont.setVisible(false);
    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({ delay: this.registry.get('textSpeed') || 24, loop: true, callback: () => {
      this.shown++;
      this.body.setText(this.full.slice(0, this.shown));
      if (this.shown >= this.full.length) { this.typing = false; this.typer.remove(); this.cont.setVisible(true); }
    } });
  }

  // Al final: la frase para recordar y los botones.
  showEnd() {
    const { WIDTH, HEIGHT } = GAME;
    this.done = true;
    this.cont.setVisible(false);
    this.body.setText('«' + this.postal.memory + '»').setFontStyle('italic').setColor('#f2d98a').setY(HEIGHT - 45);
    const mk = (x, w, label, cb, fill) => {
      const bg = this.add.rectangle(x, HEIGHT - 19, w, 18, fill, 0.95).setStrokeStyle(2, 0xe3b04b, 0.9).setDepth(32).setInteractive({ useHandCursor: true });
      const t = this.add.text(x, HEIGHT - 19, label, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream }).setOrigin(0.5).setDepth(33);
      bg.on('pointerover', () => bg.setFillStyle(0x2a5a5e, 1));
      bg.on('pointerout', () => bg.setFillStyle(fill, 0.95));
      bg.on('pointerdown', cb);
      return [bg, t];
    };
    mk(WIDTH / 2 - 82, 150, '📷 Guardar la postal', () => this.save(), 0x2a1d2e);
    mk(WIDTH / 2 + 82, 150, this.album ? 'Volver al álbum' : 'Continuar ▸', () => this.leave(), 0x2f6b3f);
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    sfx('confirm');
    downloadPostal(this, this.postal, (ok) => {
      this.saving = false;
      this.toast.setText(ok ? '✿ Postal guardada' : 'No se pudo guardar').setColor(ok ? '#9be8a6' : '#e89a9a').setAlpha(1);
      this.tweens.add({ targets: this.toast, alpha: 0, delay: 2000, duration: 700 });
    });
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    this.cam.fadeOut(600, 0, 0, 0);
    this.cam.once('camerafadeoutcomplete', () => this.scene.start(this.next.scene, this.next.data || {}));
  }
}
