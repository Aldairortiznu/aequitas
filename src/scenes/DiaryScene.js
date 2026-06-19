// Diario de Sabiduría: muestra las enseñanzas que Abigail ha recogido.
// Se lanza sobre el mundo (que se pausa) con la tecla I.

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { WISDOM } from '../data/wisdom.js';

export default class DiaryScene extends Phaser.Scene {
  constructor() {
    super('Diary');
  }

  init(data) {
    this.ids = (data && data.ids) || [];
    this.returnScene = (data && data.returnScene) || 'World';
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.96);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.green).color, 1);
    g.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    this.add
      .text(WIDTH / 2, 26, 'Diario de Sabiduría', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: COLORS.gold,
      })
      .setOrigin(0.5);

    const total = Object.keys(WISDOM).length;
    this.add
      .text(WIDTH / 2, 44, `Aprendizajes: ${this.ids.length} / ${total}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#9be8a6',
      })
      .setOrigin(0.5);

    if (this.ids.length === 0) {
      this.add
        .text(WIDTH / 2, HEIGHT / 2, 'Aún no has recogido ninguna enseñanza.\nEnfrenta tus sombras y volverás más sabia.', {
          fontFamily: 'Georgia, serif',
          fontSize: '10px',
          color: COLORS.cream,
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5);
    } else {
      let y = 62;
      this.ids.forEach((id) => {
        const w = WISDOM[id];
        if (!w) return;
        this.add.text(20, y, '◆ ' + w.titulo, {
          fontFamily: 'Georgia, serif',
          fontSize: '10px',
          color: COLORS.greenLight,
        });
        const frase = this.add.text(28, y + 13, '"' + w.frase + '"', {
          fontFamily: 'Georgia, serif',
          fontSize: '9px',
          color: COLORS.cream,
          fontStyle: 'italic',
          wordWrap: { width: WIDTH - 56 },
        });
        y += 18 + frase.height + 6;
      });
    }

    this.add
      .text(WIDTH / 2, HEIGHT - 18, 'I / Esc: cerrar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#7fae8c',
      })
      .setOrigin(0.5);

    const close = () => {
      this.scene.resume(this.returnScene);
      this.scene.stop();
    };
    this.input.keyboard.on('keydown-I', close);
    this.input.keyboard.on('keydown-ESC', close);
  }
}
