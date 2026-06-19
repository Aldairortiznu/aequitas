// Escena de arranque: prepara texturas mínimas por código (placeholders)
// hasta que integremos los assets CC0 en la Fase 7. Luego pasa al Menú.

import Phaser from 'phaser';
import { COLORS } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.createPlaceholderTextures();
    this.scene.start('Menu');
  }

  // Genera unos sprites cuadrados de colores como marcadores de posición.
  createPlaceholderTextures() {
    const make = (key, color, size = 16) => {
      const g = this.add.graphics();
      g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
      g.fillRect(0, 0, size, size);
      g.generateTexture(key, size, size);
      g.destroy();
    };

    make('abigail', COLORS.gold, 14);
    make('jeronimo', COLORS.cream, 12);
    make('amanda', '#ffffff', 12);
    make('leaf', COLORS.greenLight, 8);
  }
}
