// Diario de Sabiduría: muestra las enseñanzas que Abigail ha recogido.
// Se lanza sobre el mundo (que se pausa) con la tecla I.
// Recibe entries: [{ id, titulo, frase }].

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { REINOS } from '../data/reinos.js';

export default class DiaryScene extends Phaser.Scene {
  constructor() {
    super('Diary');
  }

  init(data) {
    this.entries = (data && data.entries) || [];
    this.returnScene = (data && data.returnScene) || 'World';
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.97);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.green).color, 1);
    g.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    this.add
      .text(WIDTH / 2, 24, 'Diario de Sabiduría', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: COLORS.gold,
      })
      .setOrigin(0.5);

    // Total posible = prólogo + 32 reinos.
    const total = REINOS.length;
    this.add
      .text(WIDTH / 2, 42, `Aprendizajes recogidos: ${this.entries.length}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#9be8a6',
      })
      .setOrigin(0.5);

    if (this.entries.length === 0) {
      this.add
        .text(WIDTH / 2, HEIGHT / 2,
          'Aún no has recogido ninguna enseñanza.\nEnfrenta tus sombras y resuelve los acertijos:\nvolverás más sabia.', {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream,
          align: 'center', lineSpacing: 4,
        })
        .setOrigin(0.5);
    } else {
      // Lista desplazable simple: mostramos las últimas que caben.
      let y = 58;
      const maxY = HEIGHT - 34;
      for (let i = 0; i < this.entries.length && y < maxY; i++) {
        const w = this.entries[i];
        this.add.text(20, y, '◆ ' + (w.titulo || 'Enseñanza'), {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.greenLight,
          wordWrap: { width: WIDTH - 44 },
        });
        const frase = this.add.text(28, y + 13, '"' + w.frase + '"', {
          fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream,
          fontStyle: 'italic', wordWrap: { width: WIDTH - 56 },
        });
        y += 16 + frase.height + 7;
      }
    }

    this.add
      .text(WIDTH / 2, HEIGHT - 18, 'I / Esc: cerrar', {
        fontFamily: 'monospace', fontSize: '8px', color: '#7fae8c',
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
