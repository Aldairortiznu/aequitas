// Carga en segundo plano: las ilustraciones (postales y retratos) se bajan
// mientras ya se ve el menú. Esta escena no dibuja nada y nunca se detiene,
// así cambiar de pantalla no corta la descarga. Si una imagen aún no llegó,
// el juego usa la pintura por código.

import Phaser from 'phaser';
import { loadIllustrations } from '../systems/postales.js';

export default class AssetsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Assets' });
  }

  create() {
    loadIllustrations(this);
    this.load.start();
  }
}
