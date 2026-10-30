// Diálogos: caja inferior con retrato, nombre coloreado y texto con efecto
// máquina de escribir. Se lanza sobre otra escena (que se pausa).
//
// Uso: this.scene.launch('Dialogue', { convo: [...], returnScene: 'Town' });
//      this.scene.pause();
//
// Una línea con { postal: 'clave' } abre detrás del texto esa escena
// cinematográfica (data/postales.js) y se queda hasta que otra línea la cambie
// o diga { postal: 'off' }: así una leyenda o un recuerdo se cuentan con imagen.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { SPEAKERS } from '../data/speakers.js';
import { fmt } from '../systems/text.js';
import { sfx } from '../systems/audio.js';
import { getPostal } from '../data/postales.js';
import { postalBackdrop } from '../art/postales.js';
import { unlockPostal } from '../systems/postales.js';

export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Dialogue', cameras: CAMERA });
  }

  init(data) {
    this.convo = data.convo || [];
    this.returnScene = data.returnScene || 'Town';
    this.index = 0;
    this.closing = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const bx = 8;
    const bw = WIDTH - 16;
    const bh = 76;
    const by = HEIGHT - bh - 8;

    // Caja con borde.
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.shadow).color, 0.98);
    g.fillRoundedRect(bx, by, bw, bh, 6);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.green).color, 1);
    g.strokeRoundedRect(bx, by, bw, bh, 6);

    // Marco del retrato.
    this.portraitBox = this.add.graphics().setDepth(10);
    this.portraitBox.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgGreen).color, 1);
    this.portraitBox.fillRoundedRect(bx + 8, by + 8, 40, 40, 4);
    this.portrait = this.add.image(bx + 28, by + 47, 'player').setOrigin(0.5, 1).setDepth(10);

    // Nombre.
    this.nameText = this.add.text(bx + 58, by + 8, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: COLORS.cream,
    }).setDepth(10);

    // Cuerpo del texto.
    this.bodyText = this.add.text(bx + 58, by + 26, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: COLORS.cream,
      wordWrap: { width: bw - 70 },
      lineSpacing: 3,
    }).setDepth(10);

    // Indicador "continuar".
    this.cont = this.add
      .text(bx + bw - 14, by + bh - 14, '▼', { fontFamily: 'monospace', fontSize: '10px', color: COLORS.gold })
      .setVisible(false).setDepth(10);
    this.tweens.add({ targets: this.cont, y: this.cont.y - 2, duration: 500, yoyo: true, repeat: -1 });

    // Controles.
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-X', () => this.advance()); // botón X del celular
    this.input.keyboard.on('keydown-E', () => this.advance()); // botón E (Hablar) del celular
    this.input.on('pointerdown', () => this.advance());
    // Una línea vacía cerraría el diálogo sin mostrar nada: se protege.
    if (!this.convo.length) { this.time.delayedCall(0, () => this.close()); return; }

    this.showLine();
  }

  showLine() {
    const line = this.convo[this.index];
    const sp = SPEAKERS[line.s] || SPEAKERS.narrador;

    this.nameText.setText(fmt(sp.name)).setColor(sp.color);
    this.bodyText.setColor(sp.color === '#ffffff' ? COLORS.cream : '#f3efe0');
    this.bodyText.setFontStyle(sp.italic ? 'italic' : 'normal');

    if (line.postal) this.setBackdrop(line.postal);

    const portrait = sp.portrait;
    if (portrait && this.textures.exists(portrait)) {
      this.portrait.setTexture(portrait).setVisible(true);
      // Escala el retrato para que quepa en el marco (~34 px).
      const fw = this.portrait.width || 1, fh = this.portrait.height || 1;
      this.portrait.setScale(Math.min(34 / fw, 34 / fh, 1.6));
      this.portraitBox.setVisible(true);
    } else {
      this.portrait.setVisible(false);
      this.portraitBox.setVisible(true);
    }

    // Máquina de escribir. El texto se corta en líneas antes de escribirlo, así
    // ninguna palabra salta de renglón a mitad de camino.
    this.full = this.bodyText.getWrappedText(fmt(line.t)).join('\n');
    if (line.sfx) sfx(line.sfx);
    // Efectos de la línea: una objeción sacude la caja, una revelación destella.
    if (line.fx === 'shake') { this.cameras.main.shake(220, 0.008); sfx('hit'); }
    else if (line.fx === 'flash') this.cameras.main.flash(250, 240, 235, 200);
    this.shown = 0;
    this.typing = true;
    this.cont.setVisible(false);
    this.bodyText.setText('');
    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: this.registry.get('textSpeed') || 22,
      loop: true,
      callback: () => {
        this.shown++;
        this.bodyText.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) {
          this.typing = false;
          this.typer.remove();
          this.cont.setVisible(true);
        }
      },
    });
  }

  // Escena cinematográfica detrás del diálogo (se funde con la anterior).
  setBackdrop(key) {
    if (key === this.backKey) return;
    this.backKey = key;
    const old = this.backdrop;
    if (old) this.tweens.add({ targets: old, alpha: 0, duration: 600, onComplete: () => old.destroy() });
    this.backdrop = null;
    const p = key !== 'off' && getPostal(key);
    if (!p) return;
    unlockPostal(key);
    this.backdrop = postalBackdrop(this, p, { depth: 1, offsetY: -44 });
  }

  advance() {
    if (this.typing) {
      // Completar la línea de inmediato.
      this.typer.remove();
      this.bodyText.setText(this.full);
      this.typing = false;
      this.cont.setVisible(true);
      return;
    }
    this.index++;
    if (this.index >= this.convo.length) {
      this.close();
    } else {
      this.showLine();
    }
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
