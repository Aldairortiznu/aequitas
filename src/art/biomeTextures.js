// Texturas de los biomas: suelos por bioma, decorados compartidos, monstruos
// variados, el orbe-tesoro y una mota suave para las partículas ambientales.
// Todo dibujado por código (sin assets externos), horneado una vez en Boot.

import { BIOMES } from '../data/biomes.js';

function hex(h) {
  if (!h) return 0xffffff;
  return Phaser.Display.Color.HexStringToColor(h).color;
}

const T = 16;

export function buildBiomeTextures(scene) {
  const g = scene.add.graphics();
  const fill = (color, x, y, w, h) => {
    g.fillStyle(hex(color), 1);
    g.fillRect(x, y, w, h);
  };

  // ---------------------------------------------------------- suelos por bioma
  // Para cada bioma se hornean dos tiles: base ('g_<key>') y acento ('g_<key>_a').
  for (const [key, b] of Object.entries(BIOMES)) {
    const { base, accent, fleck } = b.ground;
    // base
    g.clear();
    fill(base, 0, 0, T, T);
    fill(fleck, 2, 3, 2, 2);
    fill(fleck, 10, 8, 2, 2);
    fill(accent, 6, 11, 2, 1);
    g.generateTexture('g_' + key, T, T);
    // acento (manchas/flores)
    g.clear();
    fill(base, 0, 0, T, T);
    fill(accent, 3, 4, 2, 2);
    fill(accent, 9, 9, 3, 2);
    fill(fleck, 11, 3, 2, 2);
    fill('#f0e6a0', 4, 4, 1, 1);
    g.generateTexture('g_' + key + '_a', T, T);
  }

  // ----------------------------------------------------------------- senderos
  // Un sendero por bioma con su color propio.
  for (const [key, b] of Object.entries(BIOMES)) {
    g.clear();
    fill(b.ground.path, 0, 0, T, T);
    fill(b.ground.fleck, 2, 2, 3, 2);
    fill(b.ground.accent, 9, 6, 3, 2);
    g.generateTexture('p_' + key, T, T);
  }

  // --------------------------------------------------------- agua turbia (pantano)
  g.clear();
  fill('#34401f', 0, 0, T, T);
  fill('#3f5026', 2, 3, 5, 2);
  fill('#2c3819', 8, 9, 5, 2);
  fill('#5a6a2f', 4, 8, 2, 1);
  g.generateTexture('w_murky', T, T);

  // ============================================================ DECORADOS
  // Pino / conífera (16x24), colisiona en el tronco.
  g.clear();
  fill('#5b3d26', 7, 18, 3, 6);
  fill('#1f5a32', 3, 11, 10, 6);
  fill('#246b39', 4, 6, 8, 6);
  fill('#2c7d44', 6, 2, 4, 5);
  fill('#3a9457', 7, 4, 2, 2);
  g.generateTexture('d_pine', T, 24);

  // Árbol muerto (16x24).
  g.clear();
  fill('#6a6258', 7, 8, 3, 16);
  fill('#534c44', 7, 8, 1, 16);
  fill('#6a6258', 3, 9, 4, 1);
  fill('#6a6258', 10, 6, 4, 1);
  fill('#6a6258', 2, 5, 2, 1);
  fill('#6a6258', 12, 11, 3, 1);
  g.generateTexture('d_deadtree', T, 24);

  // Roca / canto (16x14), colisiona.
  g.clear();
  fill('#8a8f96', 2, 5, 12, 8);
  fill('#a4a9b0', 3, 4, 8, 3);
  fill('#6f747b', 2, 11, 12, 2);
  fill('#b7bcc2', 5, 5, 3, 2);
  g.generateTexture('d_rock', T, 14);

  // Columna rota (14x26), colisiona.
  g.clear();
  fill('#9b9384', 3, 4, 8, 20);
  fill('#b3ab9c', 3, 4, 3, 20);
  fill('#7d7568', 3, 22, 8, 2);
  fill('#c3bbac', 2, 2, 10, 2);
  fill('#3a9457', 3, 12, 2, 4); // hiedra
  fill('#3a9457', 9, 16, 2, 4);
  g.generateTexture('d_pillar', 14, 26);

  // Seto recortado (16x16), colisiona.
  g.clear();
  fill('#1f5a32', 1, 4, 14, 11);
  fill('#246b39', 2, 3, 12, 6);
  fill('#2c7d44', 4, 4, 4, 2);
  fill('#184a28', 1, 13, 14, 2);
  g.generateTexture('d_hedge', T, T);

  // Cristal luminoso (14x22), colisiona.
  g.clear();
  fill('#3a6f8a', 5, 12, 4, 10);
  fill('#5aa9c4', 4, 4, 3, 12);
  fill('#7ec9dc', 8, 2, 3, 14);
  fill('#a9e8f0', 6, 6, 2, 6);
  fill('#ffffff', 9, 4, 1, 3);
  g.generateTexture('d_crystal', 14, 22);

  // Hongo (12x12).
  g.clear();
  fill('#c44a3a', 1, 2, 10, 5);
  fill('#e0664f', 2, 1, 6, 3);
  fill('#ffffff', 3, 3, 2, 2);
  fill('#ffffff', 7, 4, 2, 1);
  fill('#e7e3d6', 4, 7, 4, 5);
  g.generateTexture('d_mushroom', 12, 12);

  // Junco / espadaña (10x18).
  g.clear();
  fill('#3f6b2e', 4, 4, 2, 14);
  fill('#4d8038', 2, 8, 2, 10);
  fill('#4d8038', 6, 6, 2, 12);
  fill('#6b4a2f', 4, 2, 2, 4); // espiga
  g.generateTexture('d_reed', 10, 18);

  // Farol místico flotante (12x22).
  g.clear();
  fill('#3a3326', 5, 0, 2, 5);     // cordón
  fill('#5a4a2f', 3, 5, 6, 2);     // tapa
  fill('#6b5836', 3, 7, 6, 9);     // cuerpo
  fill('#f6e6a8', 4, 8, 4, 7);     // luz
  fill('#fff6d2', 5, 9, 2, 4);     // núcleo brillante
  fill('#5a4a2f', 3, 16, 6, 2);    // base
  g.generateTexture('d_lantern', 12, 22);

  // Mata florida (14x12), sin colisión.
  g.clear();
  fill('#246b39', 1, 5, 12, 6);
  fill('#2c7d44', 3, 3, 8, 5);
  fill('#e9c46a', 3, 4, 2, 2);
  fill('#e7e7f0', 8, 5, 2, 2);
  fill('#d98ab0', 6, 3, 2, 2);
  g.generateTexture('d_flowerbush', 14, 12);

  // Orbe-tesoro (10x10): se tinta con el color del reino al colocarlo.
  g.clear();
  fill('#ffffff', 3, 1, 4, 1);
  fill('#ffffff', 2, 2, 6, 6);
  fill('#ffffff', 3, 8, 4, 1);
  fill('#f6f6ff', 4, 3, 3, 3);
  g.generateTexture('d_orb', 10, 10);

  // Mota suave para partículas (4x4, se tinta por bioma).
  g.clear();
  fill('#ffffff', 1, 0, 2, 1);
  fill('#ffffff', 0, 1, 4, 2);
  fill('#ffffff', 1, 3, 2, 1);
  g.generateTexture('p_soft', 4, 4);

  // ============================================================ MONSTRUOS
  // Bestia de sombra a cuatro patas (rápida, agresiva).
  g.clear();
  fill('#241f30', 3, 5, 14, 6);   // lomo
  fill('#241f30', 1, 6, 3, 4);    // cabeza
  fill('#241f30', 4, 11, 2, 4);   // patas
  fill('#241f30', 8, 11, 2, 4);
  fill('#241f30', 13, 11, 2, 4);
  fill('#241f30', 16, 7, 3, 2);   // cola
  fill('#3a3152', 5, 6, 10, 3);   // bruma
  fill('#ff6b6b', 2, 7, 2, 2);    // ojo
  fill('#ffffff', 2, 7, 1, 1);
  g.generateTexture('mon_beast', 20, 16);

  // Espectro alto y etéreo (lento, tenaz).
  g.clear();
  fill('#2e2a44', 4, 1, 8, 6);    // capucha
  fill('#3a3556', 3, 7, 10, 9);   // manto
  fill('#2e2a44', 3, 16, 3, 3);   // jirones
  fill('#2e2a44', 7, 16, 3, 4);
  fill('#2e2a44', 11, 16, 2, 3);
  fill('#c3a9ec', 5, 4, 2, 2);    // ojos
  fill('#c3a9ec', 9, 4, 2, 2);
  fill('#ffffff', 5, 4, 1, 1);
  fill('#ffffff', 9, 4, 1, 1);
  g.generateTexture('mon_specter', 16, 22);

  // Enredadera espinosa con ojo-flor (muy lenta, resistente).
  g.clear();
  fill('#3a5a2a', 4, 8, 10, 8);   // mata
  fill('#2e4a22', 4, 13, 10, 3);
  fill('#4d7a34', 2, 6, 3, 4);    // zarcillos
  fill('#4d7a34', 13, 6, 3, 4);
  fill('#5a8a3c', 6, 3, 6, 6);    // flor
  fill('#c44a3a', 8, 5, 2, 2);    // ojo
  fill('#ffffff', 8, 5, 1, 1);
  fill('#244018', 5, 14, 1, 2);   // espinas
  fill('#244018', 9, 14, 1, 2);
  fill('#244018', 12, 14, 1, 2);
  g.generateTexture('mon_vine', 18, 18);

  // Reflejo cristalino (espejo que imita; rápido).
  g.clear();
  fill('#4a5a7a', 4, 2, 8, 14);   // cuerpo de cristal
  fill('#6a82a8', 5, 3, 3, 12);
  fill('#9bb6d8', 6, 5, 2, 8);    // reflejo
  fill('#cfe0f0', 7, 4, 1, 4);
  fill('#2e3a52', 4, 14, 8, 3);   // base sombría
  fill('#ffffff', 5, 7, 1, 2);    // destellos
  fill('#ffffff', 9, 10, 1, 1);
  g.generateTexture('mon_mirror', 16, 18);

  g.destroy();
}
