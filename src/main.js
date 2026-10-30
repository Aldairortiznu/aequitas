// Arranque de "AEQUITAS: El Retorno del Equilibrio".
import Phaser from 'phaser';
import { GAME, COLORS, VERSION } from './config.js';
import { getSave, newSave, writeSave } from './systems/save.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterScene from './scenes/CharacterScene.js';
import CinematicScene from './scenes/CinematicScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import TownScene from './scenes/TownScene.js';
import InterviewScene from './scenes/InterviewScene.js';
import CardScene from './scenes/CardScene.js';
import CaseFileScene from './scenes/CaseFileScene.js';
import MinigameScene from './scenes/MinigameScene.js';
import HearingScene from './scenes/HearingScene.js';
import ResolutionScene from './scenes/ResolutionScene.js';
import CaseClosedScene from './scenes/CaseClosedScene.js';
import PauseScene from './scenes/PauseScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import PostcardScene from './scenes/PostcardScene.js';
import AlbumScene from './scenes/AlbumScene.js';
import LessonScene from './scenes/LessonScene.js';
import { buildPlayer } from './scenes/BootScene.js';
import { ZOOM, installView } from './systems/view.js';

// El lienzo mide ZOOM veces la resolución base y los textos se dibujan a esa
// resolución (ver systems/view.js): letras nítidas en celular y computador.
installView();

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.WIDTH * ZOOM,
  height: GAME.HEIGHT * ZOOM,
  backgroundColor: COLORS.bgDeep,
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  // El orden es el de dibujo y de lectura del teclado: las escenas base primero y
  // las superpuestas (diálogo, cartas, pausa) después, para que queden encima y
  // la tecla que cierra un diálogo no la lea también la escena de abajo.
  scene: [BootScene, MenuScene, CharacterScene, CinematicScene, PostcardScene, AlbumScene, TownScene, HearingScene, ResolutionScene, CaseClosedScene, MinigameScene, InterviewScene, CaseFileScene, DialogueScene, CardScene, LessonScene, PauseScene, SettingsScene],
};

const game = new Phaser.Game(config);
window.__game = game;

const _ver = document.querySelector('.loader-ver');
if (_ver) _ver.textContent = VERSION;

// PWA: service worker solo en producción (en desarrollo rompería la recarga de Vite).
if ('serviceWorker' in navigator && import.meta.env && import.meta.env.PROD) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloaded) { reloaded = true; window.location.reload(); }
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => { try { reg.update(); } catch (e) { /* nada */ } }).catch(() => {});
  });
}

const hideLoader = () => {
  const el = document.getElementById('loader');
  if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 600); }
};
game.events.once('ready', hideLoader);
setTimeout(hideLoader, 8000);

import('./touchpad.js').then(({ initTouchPad }) => initTouchPad(game));

// Atajos de desarrollo (solo en `npm run dev`) para probar partes del capítulo.
if (import.meta.env && import.meta.env.DEV) {
  const ALL = ['Character', 'Town', 'Interview', 'Dialogue', 'Card', 'CaseFile', 'Minigame', 'Hearing', 'Resolution', 'CaseClosed', 'Pause', 'Settings', 'Cinematic', 'Postcard', 'Album', 'Lesson', 'Menu'];
  const stopAll = () => ALL.forEach((k) => { if (game.scene.isActive(k) || game.scene.isPaused(k)) game.scene.stop(k); });
  // __aeq.town({ hero, flags:[...], items:[...], cards:[...], at:[x,y] }): pueblo con ese avance.
  window.__aeq = {
    save: () => getSave(), // la partida en memoria (no recargar: las escenas comparten este objeto)
    fresh(opts = {}) {
      const s = newSave(opts.hero || null);
      s.stage = opts.stage || 'pueblo';
      (opts.flags || []).forEach((f) => { s.flags[f] = true; });
      (opts.items || []).forEach((i) => { s.items[i] = 1; });
      (opts.cards || []).forEach((c) => { s.codex[c] = true; });
      if (opts.at) { s.px = opts.at[0] * 16 + 8; s.py = (opts.at[1] + 1) * 16 - 2; }
      writeSave(s);
      buildPlayer(game.scene.getScene('Boot'), s);
      return s;
    },
    town(opts) { this.fresh(opts); stopAll(); game.scene.start('Town'); return 'Town'; },
    scene(key, data, opts) { this.fresh(opts || {}); stopAll(); game.scene.start(key, data || {}); return key; },
  };
}
