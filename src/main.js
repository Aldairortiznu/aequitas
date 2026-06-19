// Arranque de "El Jardín de los Miedos".
import Phaser from 'phaser';
import { GAME, COLORS } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import PlaceholderScene from './scenes/PlaceholderScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: COLORS.bgDeep,
  pixelArt: true, // nitidez de pixel art
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT, // escala a la ventana manteniendo proporción
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, MenuScene, PlaceholderScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
