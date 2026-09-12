import Phaser from 'phaser';
import { PALETTE } from '../../config';

/**
 * Arranque: fija el color de fondo y salta al título.
 * En E1 cargará atlas y horneará el arte provisional.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[0]);
    this.scene.start('Title');
  }
}
