// Escena de arranque: prepara texturas mínimas por código (placeholders)
// hasta que integremos los assets CC0 en la Fase 7. Luego pasa al Menú.

import Phaser from 'phaser';
import { buildCharacterTextures } from '../art/characters.js';
import { buildWorldTextures } from '../art/tiles.js';
import { buildBiomeTextures } from '../art/biomeTextures.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('intro_colapso', './assets/intro/intro_colapso.jpg');
    this.load.image('intro_biblioteca', './assets/intro/intro_biblioteca.jpg');
    this.load.image('intro_exploradores', './assets/intro/intro_exploradores.jpg');
    this.load.image('intro_concilio', './assets/intro/intro_concilio.jpg');
    this.load.image('menu_bg', './assets/intro/menu_bg.jpg');
  }

  create() {
    // Dibuja por código los sprites y los tiles del mundo.
    buildCharacterTextures(this);
    buildWorldTextures(this);
    buildBiomeTextures(this);

    // Si ya vio el prólogo en esta sesión, ir a Menú; de lo contrario, mostrar la intro cinemática
    const seen = sessionStorage.getItem('aequitas_intro_seen');
    if (seen) {
      this.scene.start('Menu');
    } else {
      sessionStorage.setItem('aequitas_intro_seen', 'true');
      this.scene.start('Intro');
    }
  }
}
