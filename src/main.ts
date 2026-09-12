import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from './config';
import { BootScene } from './engine/scenes/BootScene';
import { PreloadScene } from './engine/scenes/PreloadScene';
import { TitleScene } from './engine/scenes/TitleScene';
import { GaleriaScene } from './engine/scenes/GaleriaScene';
import { WorldScene } from './engine/world/WorldScene';
import { applyIntegerScaling } from './engine/scale';
import { mountUi } from './app/mount';
import { Session } from './app/session';
import { installModals } from './app/modals';
import { loadGlobalContent } from './app/contentLoader';
import { getBus } from './core/bus';
import { ui } from './ui/store';

const params = new URLSearchParams(window.location.search);
const escena = params.get('escena');

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
  scene: [BootScene, PreloadScene, TitleScene, GaleriaScene, WorldScene],
});

applyIntegerScaling(game);
const session = new Session(game);
installModals(session);
mountUi(session);

/** Tras el arranque: cargar el índice de contenido y precargar el arte real que exista. */
const onBoot = (): void => {
  getBus().off('boot:ready', onBoot);
  void loadGlobalContent()
    .then((content) => {
      const sprites = content.personajes.filter((p) => p.sprite).map((p) => p.sprite as string);
      const tilesets = ['provisional', ...content.index.regiones.map((r) => r.id)];
      const galeria = escena === 'galeria';
      game.scene.start('Preload', {
        sprites,
        tilesets,
        next: galeria ? 'Galeria' : 'Title',
        nextData: galeria ? { sprites, tilesets } : undefined,
      });
    })
    .catch((err: unknown) => {
      console.error(err);
      game.scene.start('Title');
      getBus().emit('ui:toast', {
        text: 'No se pudo cargar el contenido. Revisa la consola.',
        kind: 'warn',
      });
    });
};
getBus().on('boot:ready', onBoot);

getBus().on('title:ready', () => {
  ui.enTitulo.value = true;
});

// Acceso de lectura para depuración y pruebas de navegador (no expone nada que el
// jugador no pueda ver ya).
(window as unknown as { __aequitas: unknown }).__aequitas = { game, session };
