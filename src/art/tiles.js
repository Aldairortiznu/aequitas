// Tiles del mundo de "Reverdecer", dibujados por código (placeholder de calidad
// hasta integrar packs CC0 en la Fase 7). Base verde: césped, sendero, árboles,
// flores y agua.

function hex(h) {
  if (!h) return 0xffffff;
  return Phaser.Display.Color.HexStringToColor(h).color;
}

const T = 16; // tamaño de tile

export function buildWorldTextures(scene) {
  const g = scene.add.graphics();

  const fill = (color, x, y, w, h) => {
    g.fillStyle(hex(color), 1);
    g.fillRect(x, y, w, h);
  };

  // --- Césped base ---
  g.clear();
  fill('#3a7d4a', 0, 0, T, T);
  fill('#347044', 2, 3, 2, 2);
  fill('#347044', 9, 7, 2, 2);
  fill('#428952', 12, 12, 2, 2);
  fill('#46925a', 5, 11, 2, 1);
  g.generateTexture('t_grass', T, T);

  // --- Césped con flores ---
  g.clear();
  fill('#3a7d4a', 0, 0, T, T);
  fill('#347044', 3, 10, 2, 2);
  fill('#e9c46a', 4, 4, 2, 2); // flor amarilla
  fill('#f0e6a0', 4, 4, 1, 1);
  fill('#e7e7f0', 10, 8, 2, 2); // flor blanca
  fill('#d98ab0', 8, 3, 2, 2); // flor rosa
  g.generateTexture('t_flower', T, T);

  // --- Sendero de tierra ---
  g.clear();
  fill('#b89b6a', 0, 0, T, T);
  fill('#a98c5b', 2, 2, 3, 2);
  fill('#c7ab7d', 9, 6, 3, 2);
  fill('#a98c5b', 6, 11, 3, 2);
  g.generateTexture('t_path', T, T);

  // --- Agua ---
  g.clear();
  fill('#2f6fb0', 0, 0, T, T);
  fill('#3f86cf', 2, 3, 5, 2);
  fill('#3f86cf', 8, 9, 5, 2);
  fill('#bfe0f5', 4, 8, 2, 1);
  g.generateTexture('t_water', T, T);

  // --- Árbol (16x24): tronco + copa frondosa ---
  g.clear();
  // tronco
  fill('#6b4a2f', 6, 16, 4, 8);
  fill('#5b3d26', 6, 16, 1, 8);
  // copa
  fill('#246b39', 3, 2, 10, 12);
  fill('#2f7d45', 4, 1, 8, 6);
  fill('#1f5a30', 3, 10, 10, 4);
  fill('#3a9457', 6, 3, 3, 3); // brillo
  g.generateTexture('t_tree', T, 24);

  // --- Arbusto pequeño (decoración, sin colisión) ---
  g.clear();
  fill('#246b39', 2, 6, 12, 8);
  fill('#2f7d45', 4, 4, 8, 6);
  fill('#3a9457', 6, 6, 3, 2);
  g.generateTexture('t_bush', T, T);

  g.destroy();
}
