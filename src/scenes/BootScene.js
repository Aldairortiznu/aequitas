// Escena de arranque: prepara texturas mínimas por código (placeholders)
// hasta que integremos los assets CC0 en la Fase 7. Luego pasa al Menú.

import Phaser from 'phaser';
import { buildCharacterTextures } from '../art/characters.js';
import { buildWorldTextures } from '../art/tiles.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    // Dibuja por código los sprites y los tiles del mundo.
    buildCharacterTextures(this);
    buildWorldTextures(this);
    this.scene.start('Menu');
  }
}
