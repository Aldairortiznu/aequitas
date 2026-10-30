// Resolución de dibujo de AEQUITAS.
//
// El juego se diseña en 480×270 (pixel art). Si se pinta a ese tamaño y el
// navegador lo estira, las letras salen borrosas y en escalones. Por eso el
// lienzo mide ZOOM veces la resolución base, cada cámara amplía el mundo ZOOM
// veces y cada texto se dibuja a esa misma resolución: el pixel art queda igual
// de nítido y las letras, finas y legibles. Las escenas siguen trabajando en
// coordenadas de 480×270 (GAME.WIDTH × GAME.HEIGHT).
import Phaser from 'phaser';
import { GAME } from '../config.js';

function pickZoom() {
  try {
    const dpr = window.devicePixelRatio || 1;
    const longest = Math.max(window.screen.width, window.screen.height) * dpr;
    // 2 en pantallas pequeñas, 3 en el resto: nítido sin cargar de más el celular.
    return Math.max(2, Math.min(3, Math.round(longest / GAME.WIDTH)));
  } catch (e) {
    return 2;
  }
}

export const ZOOM = pickZoom();

// Cámara de cada escena (en su `super({ key, cameras: CAMERA })`): muestra el
// mundo de 480×270 entero, ampliado ZOOM veces.
export const CAMERA = {
  zoom: ZOOM,
  scrollX: (-GAME.WIDTH * (ZOOM - 1)) / 2,
  scrollY: (-GAME.HEIGHT * (ZOOM - 1)) / 2,
  roundPixels: true,
};

// Ajustes globales para dibujar a ZOOM veces la resolución base. Se llama una
// vez, antes de crear el juego.
export function installView() {
  // Todo texto se dibuja a la resolución del lienzo y con filtro suave, para que
  // no se deshaga en escalones si una escena lo encoge o lo anima.
  const factory = Phaser.GameObjects.GameObjectFactory.prototype;
  const addText = factory.text;
  factory.text = function (x, y, text, style) {
    const t = addText.call(this, x, y, text, { resolution: ZOOM, ...style });
    t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return t;
  };

  // Phaser mide el temblor de cámara con el ancho del lienzo y lo vuelve a
  // multiplicar por el zoom: con el lienzo ampliado temblaría ZOOM² veces más.
  // Se compensa para que cada sacudida se vea como fue diseñada.
  const Shake = Phaser.Cameras.Scene2D.Effects.Shake.prototype;
  const startShake = Shake.start;
  Shake.start = function (duration, intensity = 0.05, ...rest) {
    const k = 1 / (ZOOM * ZOOM);
    const scaled = typeof intensity === 'number' ? intensity * k : new Phaser.Math.Vector2(intensity.x * k, intensity.y * k);
    return startShake.call(this, duration, scaled, ...rest);
  };
}
