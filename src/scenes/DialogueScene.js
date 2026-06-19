// Sistema de diálogos de "Reverdecer" (Fase 3).
// Caja pixel inferior con retrato, nombre coloreado y texto con efecto
// máquina de escribir. Se lanza sobre otra escena (que se pausa).
//
// Uso: this.scene.launch('Dialogue', { convo: [...], returnScene: 'World' });
//      this.scene.pause();

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { SPEAKERS } from '../data/dialogues.js';

export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super('Dialogue');
  }

  init(data) {
    this.convo = data.convo || [];
    this.returnScene = data.returnScene || 'World';
    this.index = 0;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const bx = 8;
    const bw = WIDTH - 16;
    const bh = 76;
    const by = HEIGHT - bh - 8;

    // Caja con borde.
    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.shadow).color, 0.92);
    g.fillRoundedRect(bx, by, bw, bh, 6);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.green).color, 1);
    g.strokeRoundedRect(bx, by, bw, bh, 6);

    // Marco del retrato.
    this.portraitBox = this.add.graphics();
    this.portraitBox.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgGreen).color, 1);
    this.portraitBox.fillRoundedRect(bx + 8, by + 8, 40, 40, 4);
    this.portrait = this.add.image(bx + 28, by + 47, 'abigail').setOrigin(0.5, 1);

    // Nombre.
    this.nameText = this.add.text(bx + 58, by + 8, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: COLORS.cream,
    });

    // Cuerpo del texto.
    this.bodyText = this.add.text(bx + 58, by + 26, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: COLORS.cream,
      wordWrap: { width: bw - 70 },
      lineSpacing: 3,
    });

    // Indicador "continuar".
    this.cont = this.add
      .text(bx + bw - 14, by + bh - 14, '▼', { fontFamily: 'monospace', fontSize: '10px', color: COLORS.gold })
      .setVisible(false);
    this.tweens.add({ targets: this.cont, y: this.cont.y - 2, duration: 500, yoyo: true, repeat: -1 });

    // Controles.
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());

    this.showLine();
  }

  showLine() {
    const line = this.convo[this.index];
    const sp = SPEAKERS[line.s] || SPEAKERS.abigail;

    this.nameText.setText(sp.name).setColor(sp.color);
    this.bodyText.setColor(sp.color === '#ffffff' ? COLORS.cream : '#f3efe0');
    this.bodyText.setFontStyle(sp.italic ? 'italic' : 'normal');

    if (sp.portrait) {
      this.portrait.setTexture(sp.portrait).setVisible(true);
      this.portraitBox.setVisible(true);
    } else {
      this.portrait.setVisible(false);
      this.portraitBox.setVisible(true);
    }

    // Máquina de escribir.
    this.full = line.t;
    this.shown = 0;
    this.typing = true;
    this.cont.setVisible(false);
    this.bodyText.setText('');
    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: 22,
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
    this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
