import Phaser from 'phaser';
import { PALETTE } from '../../config';
import { getBus } from '../../core/bus';

/**
 * Arranque: fija el color de fondo y avisa a la app, que decide qué precargar
 * (la app conoce el contenido; el motor no).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[0]);
    getBus().emit('boot:ready');
  }
}
