// Escena temporal que se mostrará tras "Comenzar" hasta construir el mundo (Fase 2).
// Muestra la apertura narrativa del Prólogo "El Despertar".

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';

const PROLOGUE = [
  'Prólogo — El Despertar',
  '',
  'Abigail abre los ojos en una alcoba en penumbra.',
  'Afuera, un jardín inmenso amanece en verde.',
  '',
  'Dos perritos blancos la esperan:',
  'Jerónimo, viejo y sabio. Amanda, joven y valiente.',
  '',
  'Para salvar el mundo deberá cruzar 32 reinos',
  'y conquistar, en cada uno, un aprendizaje.',
  '',
  '(El mundo jugable llega en la Fase 2)',
];

export default class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('Placeholder');
  }

  init(data) {
    this.save = data.save;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    const c = Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color;
    g.fillStyle(c, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);

    this.add
      .text(WIDTH / 2, 40, PROLOGUE[0], {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: COLORS.gold,
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, 130, PROLOGUE.slice(2).join('\n'), {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: COLORS.cream,
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, HEIGHT - 16, 'Esc: volver al menú', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#7fae8c',
      })
      .setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }
}
