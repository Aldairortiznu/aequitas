import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from './config';
import { BootScene } from './engine/scenes/BootScene';
import { TitleScene } from './engine/scenes/TitleScene';
import { applyIntegerScaling } from './engine/scale';
import { mountUi } from './app/mount';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: PALETTE.ceniza[0],
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene],
});

applyIntegerScaling(game);
mountUi();

if (import.meta.env.DEV) {
  // Acceso de depuración en desarrollo (nunca en producción).
  (window as unknown as { __aequitas: unknown }).__aequitas = { game };
}
