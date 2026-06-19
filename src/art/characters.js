// Hornea los sprites pixel art en texturas de Phaser a partir de los datos
// puros de spriteData.js. Vista frontal base; las 4 direcciones llegan en Fase 2.

import { SPRITES } from './spriteData.js';

function hex(h) {
  return Phaser.Display.Color.HexStringToColor(h).color;
}

function buildOne(scene, key, def) {
  const g = scene.add.graphics();
  def.rects.forEach((rect) => {
    g.fillStyle(hex(rect.c), 1);
    g.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  g.generateTexture(key, def.w, def.h);
  g.destroy();
}

export function buildCharacterTextures(scene) {
  for (const [key, def] of Object.entries(SPRITES)) {
    buildOne(scene, key, def);
  }
}
