// Arte de AEQUITAS, dibujado por código en pixel art (sin imágenes externas,
// salvo los tiles reales de Tuxemon —CC BY-SA 3.0— para césped, tierra, arena,
// árbol, flor y roca).
//
// Mundo: un puerto fluvial de tierra caliente (lugar ficticio), siete años
// después de una larga guerra. Casas de colores remendadas, techos de zinc oxidado, palmas,
// tanques de agua, paneles solares rescatados, muelles de madera y un río ancho.
//
// Todo se hornea en texturas al arrancar (BootScene → buildAequitasTextures).

const T = 16;

// Crea una textura de canvas y entrega (ctx, px) para dibujar pixel a pixel.
function tex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const c = scene.textures.createCanvas(key, w, h);
  if (!c) return null;
  const ctx = c.context;
  ctx.imageSmoothingEnabled = false;
  const px = (color, x, y, ww = 1, hh = 1) => { ctx.fillStyle = color; ctx.fillRect(x, y, ww, hh); };
  draw(ctx, px);
  c.refresh();
  return c;
}

// Generador pseudoaleatorio estable (los mismos dibujos en cada carga).
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function img(scene, key) {
  return scene.textures.exists(key) ? scene.textures.get(key).getSourceImage() : null;
}

// ------------------------------------------------------------------ SUELOS
function buildTerrain(scene) {
  const atlas = img(scene, 'rev_terrain');
  const sand = img(scene, 'tx_sand');
  const fromAtlas = (key, frame, extra) => tex(scene, key, T, T, (ctx, px) => {
    if (atlas) ctx.drawImage(atlas, frame * T, 0, T, T, 0, 0, T, T);
    else px(['#4f9a3c', '#5aa648', '#9a7a52', '#2b6f6c'][frame], 0, 0, T, T);
    if (extra) extra(ctx, px);
  });
  fromAtlas('t_grass0', 0);
  fromAtlas('t_grass1', 1);
  fromAtlas('t_grass2', 0, (ctx, px) => {
    const r = rng(7);
    for (let i = 0; i < 6; i++) px('#3f7f33', Math.floor(r() * 15), Math.floor(r() * 14), 1, 2);
  });
  fromAtlas('t_dirt0', 2);
  fromAtlas('t_dirt1', 2, (ctx, px) => {
    const r = rng(11);
    for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 14), y = Math.floor(r() * 14); px('#b89a6c', x, y, 2, 1); px('#7d6142', x, y + 1, 2, 1); }
  });
  const sandBase = (ctx, px) => {
    if (sand) ctx.drawImage(sand, 0, 0, T, T, 0, 0, T, T);
    else px('#e2cf98', 0, 0, T, T);
  };
  tex(scene, 't_sand0', T, T, (ctx, px) => sandBase(ctx, px));
  tex(scene, 't_sand1', T, T, (ctx, px) => {
    sandBase(ctx, px);
    px('#f6efe0', 4, 5, 2, 1); px('#d0a9a0', 11, 10, 1, 1); px('#c9b37a', 8, 12, 2, 1);
  });

  // Río: verde azulado profundo con reflejos (dos cuadros para animar).
  for (let f = 0; f < 2; f++) {
    tex(scene, 't_water' + f, T, T, (ctx, px) => {
      px('#2b6f6c', 0, 0, T, T);
      const r = rng(31 + f * 7);
      for (let i = 0; i < 7; i++) px('#245f5d', Math.floor(r() * 14), Math.floor(r() * 16), 3, 1);
      for (let i = 0; i < 3; i++) px('#4c9a92', Math.floor(r() * 12), Math.floor(r() * 16), 4, 1);
      px('#7cc3b6', (f ? 9 : 3), (f ? 4 : 11), 2, 1);
    });
  }

  // Tablones del muelle (horizontales y verticales).
  tex(scene, 't_planks', T, T, (ctx, px) => {
    px('#8a5a34', 0, 0, T, T);
    for (let y = 0; y < T; y += 4) { px('#6e4527', 0, y + 3, T, 1); px('#a8743f', 0, y, T, 1); }
    px('#5a3a20', 5, 1, 1, 1); px('#5a3a20', 12, 9, 1, 1); px('#5a3a20', 3, 13, 1, 1);
    px('#6e4527', 7, 4, 1, 3); px('#6e4527', 13, 12, 1, 3);
  });
  tex(scene, 't_planksV', T, T, (ctx, px) => {
    px('#8a5a34', 0, 0, T, T);
    for (let x = 0; x < T; x += 4) { px('#6e4527', x + 3, 0, 1, T); px('#a8743f', x, 0, 1, T); }
    px('#5a3a20', 1, 5, 1, 1); px('#5a3a20', 9, 12, 1, 1);
  });
  // Rieles del astillero: durmientes de madera con dos rieles de hierro.
  tex(scene, 't_rails', T, T, (ctx, px) => {
    px('#9a7a52', 0, 0, T, T);
    for (let y = 1; y < T; y += 5) px('#6e4527', 0, y, T, 2);
    px('#5c6468', 3, 0, 2, T); px('#5c6468', 11, 0, 2, T);
    px('#8e989c', 3, 0, 1, T); px('#8e989c', 11, 0, 1, T);
  });
  // Empedrado de la plaza.
  tex(scene, 't_stone', T, T, (ctx, px) => {
    px('#a89c86', 0, 0, T, T);
    const stones = [[0, 0, 7, 5], [8, 0, 8, 5], [0, 6, 4, 5], [5, 6, 7, 5], [13, 6, 3, 5], [0, 12, 9, 4], [10, 12, 6, 4]];
    stones.forEach(([x, y, w, h]) => { px('#bdb29a', x + 1, y + 1, w - 2, h - 2); px('#cfc5ae', x + 1, y + 1, w - 3, 1); });
  });
  // Huerta: surcos de tierra oscura con matas de tomate.
  tex(scene, 't_crops', T, T, (ctx, px) => {
    px('#5a3d26', 0, 0, T, T);
    for (let y = 2; y < T; y += 7) {
      px('#4a3020', 0, y + 4, T, 1);
      for (let x = 1; x < T; x += 5) { px('#3f8a35', x, y, 3, 3); px('#6fbf55', x + 1, y, 1, 1); px('#d9493b', x + 2, y + 2, 1, 1); }
    }
  });
}

// ------------------------------------------------------------------ OBJETOS
function buildProps(scene) {
  // Palma de coco (24x40).
  tex(scene, 'pr_palm', 24, 40, (ctx, px) => {
    const trunk = [[11, 38], [11, 34], [12, 30], [12, 26], [13, 22], [13, 18], [13, 14]];
    trunk.forEach(([x, y]) => { px('#7a5a3a', x, y - 4, 3, 4); px('#5e4429', x, y - 1, 3, 1); px('#94704a', x, y - 4, 1, 3); });
    const fr = (pts, c) => pts.forEach(([x, y, w]) => px(c, x, y, w, 1));
    fr([[2, 9, 6], [1, 10, 4], [0, 11, 3], [5, 8, 6], [8, 7, 5]], '#2f7d3a');
    fr([[15, 7, 6], [18, 8, 5], [20, 9, 4], [21, 10, 3]], '#2f7d3a');
    fr([[9, 3, 4], [8, 4, 3], [7, 5, 3], [14, 3, 4], [16, 4, 3], [17, 5, 3]], '#46a04a');
    fr([[10, 6, 9], [11, 5, 7], [12, 4, 5], [4, 12, 3], [19, 12, 3], [6, 9, 4], [16, 9, 4]], '#46a04a');
    fr([[12, 6, 3], [13, 5, 2], [9, 8, 2], [17, 8, 2]], '#7bc95f');
    px('#6b4a2a', 12, 10, 2, 2); px('#6b4a2a', 14, 11, 2, 2); px('#4e341d', 13, 12, 1, 1);
  });
  // Ceiba grande de la plaza (48x52).
  tex(scene, 'pr_ceiba', 48, 52, (ctx, px) => {
    px('#6b5440', 20, 26, 8, 22); px('#574332', 20, 26, 2, 22); px('#86705a', 25, 28, 2, 18);
    px('#6b5440', 14, 44, 6, 4); px('#6b5440', 28, 44, 7, 4); px('#574332', 12, 47, 4, 2); px('#574332', 33, 47, 4, 2);
    const blob = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); px(c, cx - w, cy + y, w * 2, 1); } };
    blob(14, 18, 11, '#2c6b34'); blob(34, 17, 12, '#2c6b34'); blob(24, 12, 13, '#2c6b34');
    blob(14, 16, 8, '#3d8a42'); blob(33, 15, 9, '#3d8a42'); blob(24, 10, 10, '#3d8a42');
    blob(21, 7, 5, '#5aa65a'); blob(31, 11, 4, '#5aa65a'); blob(12, 13, 3, '#5aa65a');
  });
  tex(scene, 'pr_bush', 16, 12, (ctx, px) => {
    px('#2f6b30', 1, 4, 14, 7); px('#3f8a3d', 2, 2, 12, 6); px('#5aa65a', 4, 2, 4, 2); px('#5aa65a', 10, 4, 2, 2); px('#25521f', 1, 10, 14, 1);
  });
  tex(scene, 'pr_crate', 14, 14, (ctx, px) => {
    px('#8a6034', 0, 0, 14, 14); px('#a8783f', 1, 1, 12, 12); px('#6e4527', 0, 0, 14, 1); px('#6e4527', 0, 13, 14, 1);
    for (let i = 1; i < 13; i++) { px('#7a5228', i, i, 1, 1); px('#7a5228', 13 - i, i, 1, 1); }
  });
  tex(scene, 'pr_barrel', 12, 16, (ctx, px) => {
    px('#2f5f8a', 1, 1, 10, 15); px('#3f77a8', 2, 1, 3, 15); px('#244a6c', 9, 1, 2, 15);
    px('#1d3a55', 1, 4, 10, 1); px('#1d3a55', 1, 11, 10, 1); px('#9a5a3a', 6, 7, 3, 2); px('#9a5a3a', 3, 13, 2, 1);
    px('#5a7f9f', 2, 0, 8, 1);
  });
  tex(scene, 'pr_rubble', 16, 10, (ctx, px) => {
    px('#8e8a82', 1, 4, 6, 5); px('#a8a39a', 2, 4, 3, 2); px('#7a766e', 6, 2, 5, 7); px('#97928a', 7, 2, 3, 2);
    px('#8e8a82', 10, 5, 5, 4); px('#6b3f2a', 4, 1, 1, 4); px('#6b3f2a', 12, 2, 1, 3); px('#5f5b54', 0, 9, 16, 1);
  });
  tex(scene, 'pr_car', 32, 18, (ctx, px) => {
    px('#3a2e28', 2, 15, 28, 2);
    px('#9a4a2a', 1, 7, 30, 8); px('#b5623a', 2, 7, 28, 2); px('#7a3a22', 1, 13, 30, 2);
    px('#9a4a2a', 7, 2, 17, 6); px('#2d3a40', 9, 3, 6, 4); px('#2d3a40', 16, 3, 6, 4); px('#5c6c72', 9, 3, 2, 1);
    px('#1d1a18', 4, 13, 6, 4); px('#1d1a18', 22, 13, 6, 4);
    px('#4f9a3c', 12, 12, 3, 2); px('#6fbf55', 26, 6, 2, 2); px('#4f9a3c', 0, 14, 3, 3); px('#6fbf55', 19, 1, 2, 2);
  });
  tex(scene, 'pr_fence_h', 16, 12, (ctx, px) => {
    px('#7a5a3a', 1, 1, 2, 11); px('#7a5a3a', 13, 1, 2, 11);
    px('#9a7448', 0, 4, 16, 2); px('#9a7448', 0, 8, 16, 2); px('#6e4f31', 0, 5, 16, 1); px('#6e4f31', 0, 9, 16, 1);
  });
  tex(scene, 'pr_fence_v', 16, 16, (ctx, px) => {
    px('#7a5a3a', 7, 0, 2, 16); px('#9a7448', 6, 2, 4, 2); px('#9a7448', 6, 10, 4, 2);
  });
  // Farol solar (apagado / encendido).
  for (const on of [false, true]) {
    tex(scene, on ? 'pr_lamp_on' : 'pr_lamp_off', 12, 32, (ctx, px) => {
      px('#3a3f42', 5, 8, 2, 23); px('#5c6468', 5, 8, 1, 23); px('#2b2f31', 3, 30, 6, 2);
      px('#24435e', 1, 0, 10, 3); px('#3f6d93', 2, 0, 3, 1); px('#3f6d93', 7, 0, 3, 1); // panel
      px('#3a3f42', 3, 3, 6, 1);
      px(on ? '#fff3b0' : '#5c6468', 3, 4, 6, 4); px(on ? '#ffe070' : '#4a5054', 4, 5, 4, 2);
    });
  }
  tex(scene, 'pr_panel', 20, 14, (ctx, px) => {
    px('#3a3f42', 9, 7, 2, 7); px('#24435e', 0, 1, 20, 7); px('#3f6d93', 1, 2, 4, 2); px('#3f6d93', 6, 2, 4, 2); px('#3f6d93', 11, 2, 4, 2); px('#3f6d93', 16, 2, 3, 2);
    px('#1b3347', 0, 4, 20, 1); px('#8e989c', 0, 0, 20, 1);
  });
  // Puestos del mercado con toldo de rayas.
  const stall = (key, a, b, goods) => tex(scene, key, 32, 28, (ctx, px) => {
    px('#6e4527', 2, 9, 2, 19); px('#6e4527', 28, 9, 2, 19);
    for (let x = 0; x < 32; x += 4) px(((x / 4) % 2) ? b : a, x, 2, 4, 7);
    px('#00000033', 0, 9, 32, 1); px(a, 0, 1, 32, 1);
    px('#8a6034', 1, 16, 30, 6); px('#a8783f', 1, 16, 30, 2); px('#5a3a20', 1, 21, 30, 1);
    goods(px);
  });
  stall('pr_stall_fish', '#e8846b', '#f3ecd8', (px) => {
    for (let i = 0; i < 4; i++) { px('#9fb8c0', 4 + i * 6, 13, 5, 3); px('#6f8a94', 8 + i * 6, 14, 1, 1); px('#2a2a2a', 5 + i * 6, 14, 1, 1); }
  });
  stall('pr_stall_fruit', '#3fa3a0', '#f3ecd8', (px) => {
    const c = ['#f2b84b', '#d9493b', '#7bc95f', '#f2b84b', '#e8846b', '#9cc36b'];
    for (let i = 0; i < 6; i++) { px(c[i], 3 + i * 4, 13, 3, 3); px('#00000022', 3 + i * 4, 15, 3, 1); }
  });
  stall('pr_stall_rice', '#f2b84b', '#e8846b', (px) => {
    px('#efe3c2', 4, 11, 7, 5); px('#efe3c2', 13, 11, 7, 5); px('#efe3c2', 22, 12, 6, 4);
    px('#cdbf94', 4, 15, 7, 1); px('#cdbf94', 13, 15, 7, 1); px('#8a6034', 6, 11, 3, 1);
  });
  // Gallinero de Doña Rosa.
  tex(scene, 'pr_coop', 26, 22, (ctx, px) => {
    px('#c9a45c', 1, 2, 24, 7); px('#a8843f', 1, 8, 24, 1); px('#e0c27a', 3, 3, 8, 1); px('#e0c27a', 14, 5, 9, 1);
    px('#9a7448', 3, 9, 20, 11); px('#7a5a3a', 3, 9, 20, 1); px('#3a2a20', 11, 13, 5, 7); px('#7a5a3a', 3, 19, 20, 1);
    px('#9a7448', 16, 19, 8, 2);
  });
  tex(scene, 'pr_canoe', 30, 10, (ctx, px) => {
    px('#6e4527', 2, 3, 26, 5); px('#8a5a34', 1, 3, 28, 2); px('#4a2e18', 3, 7, 24, 2);
    px('#4a2e18', 0, 3, 2, 2); px('#4a2e18', 28, 3, 2, 2); px('#a8743f', 6, 4, 18, 1);
  });
  tex(scene, 'pr_boat', 36, 16, (ctx, px) => {
    px('#2f5f8a', 2, 6, 32, 6); px('#f3ecd8', 1, 6, 34, 2); px('#244a6c', 4, 11, 28, 2);
    px('#d9493b', 31, 3, 3, 6); px('#7a1f1a', 32, 8, 1, 4); px('#8a6034', 8, 4, 12, 2);
  });
  // La lancha en disputa sobre los rieles (72x34). La versión "raspada" deja ver
  // el nombre viejo bajo la pintura.
  for (const scraped of [false, true]) {
    tex(scene, scraped ? 'pr_lancha_raspada' : 'pr_lancha', 72, 34, (ctx, px) => {
      px('#6e4527', 6, 30, 60, 3); px('#4a2e18', 10, 32, 6, 2); px('#4a2e18', 54, 32, 6, 2);
      // casco
      px('#2f8f8a', 4, 16, 62, 12); px('#3fa3a0', 4, 16, 62, 3); px('#1f6a66', 8, 26, 54, 3);
      px('#f3ecd8', 6, 20, 58, 2);
      px('#2f8f8a', 0, 14, 8, 6); px('#2f8f8a', 64, 12, 6, 8); px('#1f6a66', 66, 18, 4, 4);
      // nombre pintado "LA ESPERANZA" (letras sugeridas)
      for (let i = 0; i < 10; i++) px('#1a2a2a', 18 + i * 3, 23, 2, 2);
      if (scraped) {
        px('#d8cbb0', 16, 22, 34, 5); px('#b5a68a', 16, 26, 34, 1);
        for (let i = 0; i < 11; i++) px('#7a1f1a', 18 + i * 3, 23, 2, 3);
        px('#2f8f8a', 46, 22, 4, 2);
      }
      // toldo y motor rojo
      px('#8a8f92', 20, 4, 2, 12); px('#8a8f92', 46, 4, 2, 12); px('#e8846b', 18, 2, 32, 4); px('#f3ecd8', 18, 2, 32, 1);
      px('#d9493b', 0, 8, 6, 9); px('#a8302a', 0, 14, 6, 3); px('#3a3f42', 2, 17, 2, 7); px('#5c6468', 1, 24, 4, 2);
    });
  }
  tex(scene, 'pr_net', 22, 18, (ctx, px) => {
    px('#7a5a3a', 1, 0, 2, 18); px('#7a5a3a', 19, 0, 2, 18);
    for (let y = 2; y < 16; y += 3) px('#c94c3c', 3, y, 16, 1);
    for (let x = 4; x < 19; x += 3) px('#c94c3c', x, 2, 1, 13);
    px('#f2b84b', 7, 15, 2, 2); px('#f2b84b', 14, 15, 2, 2);
  });
  tex(scene, 'pr_laundry', 34, 20, (ctx, px) => {
    px('#7a5a3a', 0, 0, 2, 20); px('#7a5a3a', 32, 0, 2, 20); px('#d9d2c3', 1, 2, 32, 1);
    const cl = [['#e8846b', 4, 8], ['#f2b84b', 11, 6], ['#3fa3a0', 17, 9], ['#f3ecd8', 25, 7]];
    cl.forEach(([c, x, h]) => { px(c, x, 3, 5, h); px('#00000022', x + 4, 3, 1, h); });
  });
  tex(scene, 'pr_sign', 16, 18, (ctx, px) => {
    px('#6e4527', 7, 9, 2, 9); px('#8a6034', 0, 1, 16, 9); px('#a8783f', 1, 2, 14, 7); px('#5a3a20', 0, 1, 16, 1);
    px('#3a2a20', 3, 4, 10, 1); px('#3a2a20', 3, 6, 7, 1);
  });
  tex(scene, 'pr_tank', 16, 26, (ctx, px) => {
    px('#6e4527', 2, 18, 2, 8); px('#6e4527', 12, 18, 2, 8); px('#8a6034', 1, 17, 14, 2);
    px('#2a2f33', 2, 3, 12, 14); px('#3f474c', 3, 3, 3, 14); px('#1d2124', 2, 7, 12, 1); px('#1d2124', 2, 12, 12, 1);
    px('#3f474c', 4, 1, 8, 2);
  });
  tex(scene, 'pr_antenna', 14, 40, (ctx, px) => {
    for (let y = 4; y < 38; y += 4) { px('#8e989c', 5, y, 1, 4); px('#8e989c', 8, y, 1, 4); px('#5c6468', 5, y, 4, 1); }
    px('#d9493b', 6, 0, 2, 4); px('#5c6468', 3, 38, 8, 2);
  });
  tex(scene, 'pr_scale', 20, 20, (ctx, px) => {
    px('#6e4527', 2, 14, 16, 6); px('#8a6034', 2, 14, 16, 2);
    px('#8e989c', 9, 4, 2, 10); px('#b0893f', 2, 4, 16, 2);
    px('#b0893f', 1, 9, 7, 2); px('#b0893f', 12, 9, 7, 2); px('#8e989c', 3, 6, 1, 3); px('#8e989c', 16, 6, 1, 3);
  });
  // Retén de Los del Puño: barriles, tablón y una llanta.
  tex(scene, 'pr_reten', 34, 20, (ctx, px) => {
    px('#2f5f8a', 1, 6, 9, 13); px('#3f77a8', 2, 6, 3, 13); px('#9a5a3a', 4, 10, 3, 2);
    px('#2f5f8a', 24, 6, 9, 13); px('#3f77a8', 25, 6, 3, 13);
    px('#8a6034', 0, 3, 34, 4); px('#a8783f', 0, 3, 34, 1); px('#d9493b', 6, 4, 4, 2); px('#f3ecd8', 12, 4, 4, 2); px('#d9493b', 18, 4, 4, 2); px('#f3ecd8', 24, 4, 4, 2);
    px('#1d1a18', 12, 12, 9, 7); px('#3a3532', 14, 14, 5, 3);
  });
  // Página perdida del Códice (coleccionable).
  tex(scene, 'pg_codice', 12, 14, (ctx, px) => {
    px('#efe3c2', 1, 1, 10, 12); px('#d8c79e', 9, 1, 2, 12); px('#e3b04b', 1, 1, 10, 1); px('#e3b04b', 1, 12, 10, 1);
    px('#7a5a3a', 3, 4, 6, 1); px('#7a5a3a', 3, 6, 5, 1); px('#7a5a3a', 3, 8, 6, 1); px('#b5562c', 5, 10, 2, 2);
  });
  // Animales: gallina (dos cuadros), garza.
  for (let f = 0; f < 2; f++) {
    for (const [key, body, wing] of [['an_hen', '#f6f3ea', '#ded8c8'], ['an_hen2', '#a8643a', '#7a4428']]) {
      tex(scene, key + f, 10, 10, (ctx, px) => {
        const dy = f ? 1 : 0;
        px(body, 2, 3, 6, 5); px(wing, 3, 4, 4, 3); px(body, 6, 1 + dy, 3, 3); px('#d9493b', 7, 0 + dy, 2, 1);
        px('#f2b84b', 9, 2 + dy, 1, 1); px('#1a1a1a', 7, 2 + dy, 1, 1); px(body, 1, 2, 2, 2);
        px('#e0a030', 4, 8, 1, 2); px('#e0a030', 6, 8, 1, 2);
      });
    }
  }
  tex(scene, 'an_heron', 12, 20, (ctx, px) => {
    px('#f6f3ea', 3, 7, 6, 5); px('#ded8c8', 3, 10, 6, 2); px('#f6f3ea', 7, 2, 2, 6); px('#f6f3ea', 7, 1, 3, 2);
    px('#f2b84b', 10, 2, 2, 1); px('#1a1a1a', 8, 1, 1, 1); px('#2a2a2a', 5, 12, 1, 8); px('#2a2a2a', 7, 12, 1, 8);
  });

  // Partículas.
  tex(scene, 'p_soft', 4, 4, (ctx, px) => {
    px('#ffffff', 1, 0, 2, 4); px('#ffffff', 0, 1, 4, 2);
  });
  tex(scene, 'p_spark', 5, 5, (ctx, px) => {
    px('#ffffff', 2, 0, 1, 5); px('#ffffff', 0, 2, 5, 1);
  });
}

// ------------------------------------------------------------------ CASAS
const ROOFS = {
  zinc: ['#8f9aa0', '#7d878d', '#a9b3b8', '#9a5a3a'],
  zincRojo: ['#a8574a', '#8e463b', '#c26a5a', '#6e3a30'],
  teja: ['#b4553a', '#8e3f2a', '#cf7351', '#7a3424'],
  palma: ['#c9a45c', '#a8843f', '#e0c27a', '#8a6a32'],
  plano: ['#b8b0a0', '#9f9789', '#d0c8b8', '#7f786c'],
};

// Una casa vista en 3/4: techo arriba (sobresale una baldosa) y fachada abajo.
// spec: { roof, wall, trim, door: 'center'|'left'|'right'|'big', windows,
//         boarded, vines, tank, panel, flag, cracked, seed,
//         tarp (color de la lona), tarpX, rust, patched, ruined }
export function makeBuilding(scene, key, wT, hT, spec) {
  const W = wT * T;
  const H = hT * T + T;
  const facade = Math.min(30, Math.max(22, Math.round(H * 0.38)));
  const roofH = H - facade;
  const [rb, rd, rl, rx] = ROOFS[spec.roof] || ROOFS.zinc;
  const wall = spec.wall || '#e9d8a6';
  const trim = spec.trim || '#f3ecd8';
  const r = rng(spec.seed || 1);
  tex(scene, key, W, H, (ctx, px) => {
    // Techo.
    px(rd, 0, roofH - 2, W, 2);
    px(rb, 0, 2, W, roofH - 3);
    if (spec.roof === 'zinc' || spec.roof === 'zincRojo') {
      for (let x = 1; x < W; x += 3) px(rd, x, 2, 1, roofH - 4);
      for (let x = 2; x < W; x += 6) px(rl, x, 3, 1, roofH - 6);
      for (let i = 0; i < Math.max(2, wT); i++) px(rx, Math.floor(r() * (W - 6)), 3 + Math.floor(r() * (roofH - 8)), 4 + Math.floor(r() * 4), 2);
    } else if (spec.roof === 'teja') {
      for (let y = 3; y < roofH - 3; y += 4) { px(rd, 0, y + 3, W, 1); for (let x = (y % 8 ? 2 : 0); x < W; x += 4) px(rl, x, y, 2, 1); }
    } else if (spec.roof === 'palma') {
      for (let i = 0; i < W * 2; i++) px(r() < 0.5 ? rd : rl, Math.floor(r() * W), 2 + Math.floor(r() * (roofH - 5)), 1, 3);
    } else {
      px(rl, 2, 3, W - 4, 1); px(rd, 1, roofH - 5, W - 2, 2);
    }
    px(rl, 0, 1, W, 1); px(rd, 0, 0, W, 1);
    // Óxido que chorrea del zinc.
    if (spec.rust) for (let i = 0; i < W / 5; i++) px('#9a5a3a', Math.floor(r() * W), 2 + Math.floor(r() * (roofH - 6)), 1, 2 + Math.floor(r() * 4));
    // Lona amarrada donde el techo se rompió.
    if (spec.tarp) {
      const tw = Math.min(26, W - 10);
      const tx = spec.tarpX != null ? spec.tarpX : Math.floor(W * 0.15);
      const th = Math.max(6, roofH - 10);
      px(spec.tarp, tx, 4, tw, th);
      px(shade(spec.tarp, -0.25), tx, 4 + Math.floor(th / 2), tw, 1);
      px(shade(spec.tarp, 0.2), tx + 2, 5, tw - 6, 1);
      px('#efe3c2', tx - 1, 3, 1, th + 2); px('#efe3c2', tx + tw, 3, 1, th + 2);
    }
    // Techo derrumbado: un hueco con vigas a la vista y varillas.
    if (spec.ruined) {
      const hx = Math.floor(W * 0.55);
      const hw = Math.floor(W * 0.3);
      px('#2a2420', hx, 3, hw, roofH - 6);
      for (let x = hx + 2; x < hx + hw - 1; x += 5) px('#6e4527', x, 3, 2, roofH - 6);
      for (let x = hx + 1; x < hx + hw; x += 4) px('#9a5a3a', x, 0, 1, 4);
      px('#a8a39a', hx - 2, roofH - 4, 4, 3);
    }
    if (spec.tank) { px('#2a2f33', W - 16, 4, 10, 11); px('#3f474c', W - 15, 4, 3, 11); px('#3f474c', W - 14, 2, 6, 2); }
    if (spec.panel) { px('#24435e', 4, 5, 18, 8); px('#3f6d93', 5, 6, 4, 2); px('#3f6d93', 10, 6, 4, 2); px('#3f6d93', 15, 6, 4, 2); px('#8e989c', 4, 4, 18, 1); }
    if (spec.flag) {
      const fx = Math.floor(W / 2) - 6;
      px('#5c6468', fx - 1, 0, 1, roofH - 2); px('#f2c230', fx, 1, 12, 4); px('#2a5aa8', fx, 5, 12, 2); px('#c8302a', fx, 7, 12, 2);
    }
    // Fachada.
    const fy = roofH;
    px(wall, 0, fy, W, facade);
    px('#00000026', 0, fy, W, 2);
    px('#00000018', W - 3, fy, 3, facade);
    // Remiendos de tabla y lata: así se arreglan las casas después de la guerra.
    if (spec.patched) {
      for (let i = 0; i < 3; i++) {
        const pw = 6 + Math.floor(r() * 5);
        const ph = 4 + Math.floor(r() * 3);
        const x = Math.floor(r() * (W - pw));
        const y = fy + 3 + Math.floor(r() * Math.max(1, facade - ph - 6));
        px(['#8a6034', '#5c6468', '#b5a68a'][i % 3], x, y, pw, ph); px('#3a2a20', x, y, 1, 1); px('#3a2a20', x + pw - 1, y, 1, 1);
      }
    }
    // Hollín de la guerra: manchas oscuras sobre la fachada, ya desteñidas.
    if (spec.waterline) {
      for (let i = 0; i < 3; i++) {
        const x = 3 + Math.floor(r() * (W - 14));
        const y = fy + 2 + Math.floor(r() * 4);
        px('#0000002a', x, y, 8, 2); px('#0000001c', x + 1, y + 2, 6, 2); px('#00000012', x + 2, y + 4, 4, 2);
      }
    }
    px(trim, 0, H - 2, W, 2);
    // Puerta.
    const dw = spec.door === 'big' ? Math.min(W - 12, 28) : 8;
    let dx = Math.floor(W / 2 - dw / 2);
    if (spec.door === 'left') dx = 6;
    if (spec.door === 'right') dx = W - dw - 6;
    const dh = facade - 6;
    if (spec.door === 'big') {
      px('#5c6468', dx, H - dh - 2, dw, dh); for (let y = H - dh; y < H - 2; y += 3) px('#4a5054', dx, y, dw, 1); px('#8e989c', dx, H - dh - 2, dw, 1);
      px('#c9a030', dx + dw - 5, H - 10, 3, 3); // candado
    } else {
      px('#5a3a20', dx - 1, H - dh - 3, dw + 2, dh + 1); px(spec.doorColor || '#8a5a34', dx, H - dh - 2, dw, dh); px('#e3b04b', dx + dw - 2, H - Math.floor(dh / 2) - 2, 1, 1);
    }
    // Ventanas.
    const nWin = spec.windows != null ? spec.windows : Math.max(1, Math.floor((W - 20) / 22));
    const slots = [];
    for (let i = 0; i < nWin; i++) slots.push(Math.round(((i + 1) * W) / (nWin + 1)) - 4);
    slots.filter((x) => x + 8 < dx - 2 || x > dx + dw + 2).forEach((x) => {
      const wy = fy + 6;
      px(trim, x - 1, wy - 1, 10, 9);
      px('#2d3a40', x, wy, 8, 7);
      if (spec.boarded && r() < 0.5) { px('#8a6034', x - 1, wy + 1, 10, 2); px('#8a6034', x - 1, wy + 4, 10, 2); }
      else { px('#5c7a86', x + 1, wy + 1, 2, 2); px(spec.shutter || '#3fa3a0', x - 3, wy, 2, 7); px(spec.shutter || '#3fa3a0', x + 9, wy, 2, 7); }
    });
    if (spec.cracked) { px('#00000040', Math.floor(W * 0.3), fy + 3, 1, 6); px('#00000040', Math.floor(W * 0.3) + 1, fy + 8, 1, 5); px('#00000040', Math.floor(W * 0.75), fy + 10, 4, 1); }
    if (spec.vines) {
      for (let i = 0; i < 18; i++) { const x = r() < 0.5 ? Math.floor(r() * 6) : W - 1 - Math.floor(r() * 6); px(r() < 0.5 ? '#3f8a35' : '#6fbf55', x, fy + Math.floor(r() * facade), 2, 2); }
    }
  });
}

// ------------------------------------------------------------------ PERSONAS
export const SKIN = {
  claro: ['#f1c8a0', '#d9a87e'],
  trigueno: ['#d6a275', '#b8845a'],
  medio: ['#b97c50', '#9a643d'],
  moreno: ['#8d5a3b', '#6e4429'],
  oscuro: ['#5e3a26', '#462b1c'],
};

// spec: { skin, hair, hairStyle, hat, hatColor, top, sleeves:'short'|'long',
//         bottom, skirt, apron, shoes, beard, mustache, glasses, child, elder,
//         item: 'net'|'hoe'|'cane'|'book'|'hen'|'satchel'|'ledger'|'map'|'radio',
//         coat, trim, braid,
//         // ropa del mundo después de la guerra:
//         patches (remiendos), backpack (morral con cobija), ruana, ruanaStripe,
//         neckerchief, goggles, earrings, tirepads (hombreras de llanta), hairTip }
//   hairStyle: short | long | bun | curly | braids | pigtails | ponytail | bald | undercut | bob
function drawPerson(px, s, view, frame) {
  const [sk, skd] = SKIN[s.skin] || SKIN.medio;
  const hair = s.hair || '#1d1a1c';
  const top = s.top || '#3fa3a0';
  const topD = shade(top, -0.22);
  const bottom = s.bottom || '#2f3a4a';
  const shoes = s.shoes || '#2a2420';
  const back = view === 'back';
  const ch = !!s.child;
  const o = ch ? 6 : 0; // desplazamiento vertical (los niños son más bajos)
  const torsoH = ch ? 5 : 7;
  const legH = ch ? 3 : 5;
  const ty = 12 + o; // torso
  const ly = ty + torsoH + 1; // piernas
  const feetY = ly + legH;
  const step = frame === 1 ? -1 : frame === 2 ? 1 : 0;

  // Piernas / falda.
  const legL = step < 0 ? 1 : 0;
  const legR = step > 0 ? 1 : 0;
  if (s.skirt) {
    px(s.bottom || '#c94c3c', 4, ty + torsoH, 8, ch ? 3 : 4);
    px(shade(s.bottom || '#c94c3c', -0.2), 3, ty + torsoH + (ch ? 2 : 3), 10, 1);
    px(sk, 5, ty + torsoH + (ch ? 3 : 4), 2, legH - (ch ? 2 : 3) - legL);
    px(sk, 9, ty + torsoH + (ch ? 3 : 4), 2, legH - (ch ? 2 : 3) - legR);
  } else {
    px(bottom, 5, ly - 1, 2, legH + 1 - legL);
    px(bottom, 9, ly - 1, 2, legH + 1 - legR);
    px(shade(bottom, -0.2), 4, ly - 1, 8, 1);
  }
  px(shoes, 4, feetY - legL, 3, 1);
  px(shoes, 9, feetY - legR, 3, 1);

  // Torso y abrigo.
  if (s.coat) {
    px(s.coat, 3, ty, 10, torsoH + (ch ? 2 : 4));
    px(shade(s.coat, -0.25), 3, ty + torsoH + (ch ? 1 : 3), 10, 1);
    if (!back) { px(top, 6, ty, 4, torsoH); px(s.trim || '#e3b04b', 5, ty, 1, torsoH + 3); px(s.trim || '#e3b04b', 10, ty, 1, torsoH + 3); }
    else { px(s.trim || '#e3b04b', 7, ty + 2, 2, 2); px(shade(s.coat, 0.15), 6, ty + 1, 4, 1); }
  } else {
    px(top, 4, ty, 8, torsoH);
    px(topD, 11, ty, 1, torsoH);
    if (!back && s.collar) px(s.collar, 6, ty, 4, 1);
  }
  if (s.apron && !back) { px(s.apron, 5, ty + 2, 6, torsoH + (ch ? 1 : 3)); px(shade(s.apron, -0.15), 5, ty + 2, 6, 1); }
  if (!s.skirt && !s.coat) px('#3a2a20', 4, ty + torsoH, 8, 1); // cinturón
  // Remiendos: aquí nada se bota, todo se cose otra vez.
  if (s.patches) {
    const pc = s.patchColor || '#b5562c';
    if (back) px(pc, 9, ty + 2, 2, 2);
    else { const x = s.coat ? 3 : 5; px(pc, x, ty + 3, 2, 2); px(shade(pc, -0.35), x, ty + 3, 1, 1); }
    if (!s.skirt) { px('#8a7a62', 9, ly, 2, 2); px('#6e604c', 9, ly, 1, 1); }
  }

  // Brazos (balanceo al caminar).
  const aL = step < 0 ? 1 : 0;
  const aR = step > 0 ? 1 : 0;
  const sleeve = s.coat || top;
  const longS = s.sleeves === 'long' || !!s.coat;
  for (const [x, a] of [[3, aL], [12, aR]]) {
    const ax = s.coat ? (x === 3 ? 2 : 13) : x;
    if (longS) { px(sleeve, ax, ty + a, 1, torsoH - 1); px(sk, ax, ty + torsoH - 1 + a, 1, 1); }
    else { px(sleeve, ax, ty + a, 1, 2); px(sk, ax, ty + 2 + a, 1, torsoH - 2); }
  }
  // Ruana: cubre torso y brazos; solo asoman las manos.
  if (s.ruana) {
    const rd = shade(s.ruana, -0.25);
    px(s.ruana, 3, ty, 10, torsoH);
    px(s.ruana, 2, ty + 2, 12, torsoH - 2);
    px(s.ruanaStripe || '#e3b04b', 2, ty + torsoH - 3, 12, 1);
    px(rd, 2, ty + torsoH - 1, 12, 1);
    if (!back) { px(shade(s.ruana, 0.15), 6, ty, 4, 1); px(top, 7, ty, 2, 1); }
    px(sk, 2, ty + torsoH, 1, 1); px(sk, 13, ty + torsoH, 1, 1);
  }
  // Pañoleta al cuello (contra el polvo y el sol).
  if (s.neckerchief) {
    px(s.neckerchief, 5, ty, 6, back ? 1 : 2);
    if (!back) { px(s.neckerchief, 7, ty + 2, 2, 1); px(shade(s.neckerchief, -0.25), 5, ty + 1, 6, 1); }
  }
  // Hombreras hechas con pedazos de llanta (Los del Puño).
  if (s.tirepads) {
    px('#2a2420', 2, ty - 1, 3, 3); px('#2a2420', 11, ty - 1, 3, 3);
    px('#4a4440', 3, ty, 1, 1); px('#4a4440', 12, ty, 1, 1);
  }
  // Morral con cobija enrollada: de frente se ven las correas.
  if (s.backpack) {
    const bd = shade(s.backpack, -0.3);
    if (back) {
      px('#c9b37a', 3, ty - 1, 10, 2); px('#8a7a62', 3, ty, 10, 1);
      px(s.backpack, 4, ty + 1, 8, 7); px(shade(s.backpack, 0.2), 5, ty + 2, 6, 1); px(bd, 4, ty + 7, 8, 1); px('#e3b04b', 7, ty + 4, 2, 1);
    } else { px(bd, 5, ty, 1, 5); px(bd, 10, ty, 1, 5); }
  }

  // Cabeza.
  const hy = 3 + o;
  px(sk, 7, hy + 8, 2, 1); // cuello
  px(sk, 4, hy + 1, 8, 7);
  px(skd, 4, hy + 7, 8, 1);
  px(skd, 11, hy + 1, 1, 7);
  if (!back) {
    px('#2a2220', 6, hy + 4, 1, 1); px('#2a2220', 9, hy + 4, 1, 1);
    px(shade(sk, -0.25), 7, hy + 6, 2, 1);
    if (s.glasses) { px('#2a2220', 5, hy + 4, 3, 1); px('#2a2220', 8, hy + 4, 3, 1); px('#cfe3e8', 6, hy + 4, 1, 1); px('#cfe3e8', 9, hy + 4, 1, 1); }
    if (s.mustache) px(s.beardColor || hair, 6, hy + 5, 4, 1);
    if (s.beard) { px(s.beardColor || hair, 4, hy + 5, 2, 3); px(s.beardColor || hair, 10, hy + 5, 2, 3); px(s.beardColor || hair, 5, hy + 7, 6, 2); px(shade(sk, -0.25), 7, hy + 6, 2, 1); }
  }

  // Cabello.
  const hs = s.hairStyle || 'short';
  const hairTop = () => { px(hair, 4, hy, 8, 2); px(hair, 3, hy + 1, 1, 3); px(hair, 12, hy + 1, 1, 3); };
  if (back && hs === 'undercut') {
    px(hair, 4, hy - 1, 8, 4); px(shade(hair, 0.35), 4, hy + 3, 8, 3);
  } else if (back && hs === 'bob') {
    px(hair, 3, hy, 10, 8);
  } else if (back) {
    if (hs !== 'bald') px(hair, 4, hy, 8, 7);
    if (hs === 'long' || hs === 'braids') px(hair, 4, hy + 6, 8, 6);
    if (hs === 'ponytail' || s.braid) px(hair, 7, hy + 6, 2, 8);
    if (hs === 'curly') { px(hair, 2, hy - 2, 12, 9); px(shade(hair, 0.2), 4, hy - 1, 3, 2); }
    if (hs === 'bun') px(hair, 6, hy - 2, 4, 3);
    if (hs === 'pigtails') { px(hair, 1, hy + 1, 3, 4); px(hair, 12, hy + 1, 3, 4); }
  } else if (hs === 'short') {
    hairTop();
  } else if (hs === 'long') {
    hairTop(); px(hair, 3, hy + 2, 1, 10); px(hair, 12, hy + 2, 1, 10); px(hair, 4, hy + 8, 1, 4); px(hair, 11, hy + 8, 1, 4);
  } else if (hs === 'bun') {
    hairTop(); px(hair, 6, hy - 2, 4, 3);
  } else if (hs === 'curly') {
    px(hair, 2, hy - 2, 12, 4); px(hair, 2, hy + 1, 2, 6); px(hair, 12, hy + 1, 2, 6); px(shade(hair, 0.2), 4, hy - 1, 3, 1); px(shade(hair, 0.2), 9, hy - 2, 2, 1);
  } else if (hs === 'braids') {
    hairTop(); px(hair, 3, hy + 3, 1, 10); px(hair, 12, hy + 3, 1, 10); px('#e8846b', 3, hy + 12, 1, 1); px('#e8846b', 12, hy + 12, 1, 1);
  } else if (hs === 'pigtails') {
    hairTop(); px(hair, 1, hy + 1, 3, 4); px(hair, 12, hy + 1, 3, 4); px('#f2b84b', 3, hy + 1, 1, 1); px('#f2b84b', 12, hy + 1, 1, 1);
  } else if (hs === 'ponytail') {
    hairTop();
  } else if (hs === 'bald') {
    px(hair, 3, hy + 3, 1, 3); px(hair, 12, hy + 3, 1, 3);
  } else if (hs === 'undercut') {
    // Lados rapados, copete largo hacia un lado (con las puntas teñidas).
    px(hair, 4, hy - 1, 8, 2); px(hair, 3, hy + 1, 1, 1); px(hair, 12, hy + 1, 1, 1);
    px(hair, 8, hy + 1, 4, 1); px(s.hairTip || hair, 9, hy - 1, 3, 1); px(s.hairTip || hair, 11, hy + 1, 1, 1);
    px(shade(hair, 0.35), 3, hy + 2, 1, 2); px(shade(hair, 0.35), 12, hy + 2, 1, 2);
  } else if (hs === 'bob') {
    // Melena a la altura de la mandíbula, con flequillo.
    hairTop(); px(hair, 3, hy + 1, 1, 7); px(hair, 12, hy + 1, 1, 7); px(hair, 4, hy + 2, 3, 1);
    px(hair, 4, hy + 6, 1, 2); px(hair, 11, hy + 6, 1, 2);
  }
  if (!back && s.earrings) { px('#e3b04b', 3, hy + 5, 1, 1); px('#e3b04b', 12, hy + 5, 1, 1); }
  if (s.braid && !back) { px(hair, 11, hy + 6, 2, 9); px(shade(hair, 0.25), 11, hy + 7, 1, 1); px(shade(hair, 0.25), 12, hy + 10, 1, 1); px('#e3b04b', 11, hy + 15, 2, 1); }

  // Sombreros y tocados.
  const hat = s.hat;
  const hc = s.hatColor;
  if (hat === 'vueltiao') {
    px('#efe3c2', 0, hy, 16, 2); px('#efe3c2', 4, hy - 4, 8, 4);
    for (let x = 1; x < 15; x += 3) px('#2a2420', x, hy, 1, 2);
    px('#2a2420', 4, hy - 2, 8, 1); px('#2a2420', 6, hy - 4, 1, 2); px('#2a2420', 9, hy - 4, 1, 2);
  } else if (hat === 'straw') {
    px('#d6b56b', 1, hy, 14, 2); px('#d6b56b', 4, hy - 3, 8, 3); px(hc || '#8a3a2a', 4, hy - 1, 8, 1); px('#b8964f', 1, hy + 1, 14, 1);
  } else if (hat === 'explorer') {
    px(hc || '#6b4a2f', 0, hy, 16, 2); px(hc || '#6b4a2f', 4, hy - 4, 8, 4); px('#e3b04b', 4, hy - 1, 8, 1); px(shade(hc || '#6b4a2f', 0.18), 5, hy - 4, 3, 1);
  } else if (hat === 'cap') {
    px(hc || '#d9493b', 4, hy - 1, 8, 3); if (!back) px(shade(hc || '#d9493b', -0.25), 3, hy + 2, 10, 1);
  } else if (hat === 'bandana') {
    px(hc || '#c8302a', 4, hy, 8, 2); px('#f3ecd8', 6, hy, 1, 1); px('#f3ecd8', 9, hy + 1, 1, 1); px(hc || '#c8302a', 12, hy + 1, 2, 2);
  } else if (hat === 'turban') {
    px(hc || '#f2b84b', 3, hy - 4, 10, 6); px(shade(hc || '#f2b84b', -0.2), 3, hy - 1, 10, 1); px(shade(hc || '#f2b84b', 0.2), 5, hy - 3, 4, 1); px('#c8302a', 9, hy - 4, 3, 2);
  } else if (hat === 'scarf') {
    px(hc || '#9cc36b', 3, hy - 1, 10, 4); px(hc || '#9cc36b', 3, hy + 2, 1, 6); px(hc || '#9cc36b', 12, hy + 2, 1, 6);
  }
  // Gafas de soldador subidas a la frente.
  if (s.goggles) {
    if (back) px('#3a3f42', 4, hy + 2, 8, 1);
    else {
      px('#5c6468', 4, hy, 3, 2); px('#9fd3cf', 5, hy, 1, 1); px('#5c6468', 9, hy, 3, 2); px('#9fd3cf', 10, hy, 1, 1);
      px('#3a3f42', 3, hy + 1, 1, 1); px('#3a3f42', 7, hy + 1, 2, 1); px('#3a3f42', 12, hy + 1, 1, 1);
    }
  }

  // Objetos en la mano (vista frontal).
  if (!back && s.item) {
    const iy = ty + 3;
    if (s.item === 'net') { for (let y = iy; y < iy + 7; y += 2) px('#c94c3c', 13, y, 3, 1); px('#c94c3c', 14, iy, 1, 7); }
    if (s.item === 'hoe') { px('#7a5a3a', 13, hy + 2, 1, feetY - hy - 1); px('#8e989c', 12, hy + 1, 3, 2); }
    if (s.item === 'cane') px('#6e4527', 13, iy, 1, feetY - iy + 1);
    if (s.item === 'book') { px('#6e2f2a', 11, iy + 1, 4, 3); px('#efe3c2', 12, iy + 1, 2, 3); }
    if (s.item === 'hen') { px('#f6f3ea', 10, iy, 5, 4); px('#d9493b', 13, iy - 1, 2, 1); px('#f2b84b', 15, iy + 1, 1, 1); }
    if (s.item === 'ledger') { px('#2f5a3a', 11, iy + 1, 4, 4); px('#efe3c2', 11, iy + 1, 1, 4); }
    if (s.item === 'map') { px('#efe3c2', 12, iy - 1, 2, 6); px('#c9a030', 12, iy - 1, 2, 1); px('#c9a030', 12, iy + 4, 2, 1); }
    if (s.item === 'radio') { px('#3a3f42', 11, iy + 1, 4, 3); px('#9fd3cf', 12, iy + 2, 1, 1); px('#d9493b', 14, iy + 2, 1, 1); px('#8e989c', 14, iy - 2, 1, 3); }
  }
  if ((s.item === 'satchel' || s.coat) && !s.backpack) {
    if (!back) { for (let i = 0; i < 7; i++) px('#6b4a2f', 4 + i, ty + i, 1, 1); px('#8a6034', 10, ty + 6, 4, 4); px('#e3b04b', 11, ty + 7, 1, 1); }
    else { px('#8a6034', 4, ty + 3, 8, 5); px('#6b4a2f', 4, ty + 3, 8, 1); px('#e3b04b', 7, ty + 5, 2, 1); }
  }
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1, 7), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255;
  const k = Math.abs(f);
  r = Math.round(r + (t - r) * k); g = Math.round(g + (t - g) * k); b = Math.round(b + (t - b) * k);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Hornea una persona: frente quieta + dos pasos; con { back:true } también de espaldas.
export function makePerson(scene, key, spec, opts = {}) {
  const W = 16, H = 26;
  tex(scene, key, W, H, (ctx, px) => drawPerson(px, spec, 'front', 0));
  if (opts.walk) {
    tex(scene, key + '_walkA', W, H, (ctx, px) => drawPerson(px, spec, 'front', 1));
    tex(scene, key + '_walkB', W, H, (ctx, px) => drawPerson(px, spec, 'front', 2));
  }
  if (opts.back) {
    tex(scene, key + '_back', W, H, (ctx, px) => drawPerson(px, spec, 'back', 0));
    tex(scene, key + '_back_walkA', W, H, (ctx, px) => drawPerson(px, spec, 'back', 1));
    tex(scene, key + '_back_walkB', W, H, (ctx, px) => drawPerson(px, spec, 'back', 2));
  }
}

// ------------------------------------------------------------------ COMPAÑEROS
function buildCompanions(scene) {
  // Lumen: farol-dron de la Biblioteca (dos cuadros: ojo abierto / parpadeo).
  for (let f = 0; f < 2; f++) {
    tex(scene, f ? 'lumen_blink' : 'lumen', 12, 16, (ctx, px) => {
      px('#b0893f', 4, 0, 4, 1); px('#b0893f', 3, 1, 1, 1); px('#b0893f', 8, 1, 1, 1);
      px('#8a6a32', 2, 2, 8, 2); px('#c9a24f', 3, 2, 3, 1);
      px('#f6e7a8', 2, 4, 8, 8); px('#fff6cf', 3, 5, 6, 6); px('#8a6a32', 2, 4, 1, 8); px('#8a6a32', 9, 4, 1, 8);
      if (f) px('#2b3a44', 5, 8, 2, 1);
      else { px('#2b3a44', 5, 7, 2, 2); px('#ffffff', 6, 7, 1, 1); }
      px('#8a6a32', 3, 12, 6, 2); px('#c9a24f', 4, 12, 2, 1);
      px('#e3b04b', 0, 7, 2, 1); px('#e3b04b', 10, 7, 2, 1); px('#b0893f', 5, 14, 2, 2);
    });
  }
  // Tinto: el chigüiro (capibara) que acompaña al Explorador (dos cuadros).
  for (let f = 0; f < 2; f++) {
    tex(scene, f ? 'tinto_walk' : 'tinto', 20, 13, (ctx, px) => {
      px('#8b5a35', 2, 3, 13, 8); px('#8b5a35', 1, 5, 1, 4); px('#6e4528', 3, 3, 11, 2);
      px('#a5734a', 4, 9, 10, 2);
      px('#8b5a35', 13, 2, 5, 7); px('#7a4e2e', 16, 4, 4, 5); px('#2b1d14', 19, 5, 1, 2);
      px('#1a1010', 16, 4, 1, 1); px('#5e3a22', 14, 1, 2, 2);
      const l = f ? [[3, 11], [7, 12], [11, 11], [14, 12]] : [[3, 12], [7, 11], [11, 12], [14, 11]];
      l.forEach(([x, y]) => px('#5a3a22', x, 11, 2, y - 10));
    });
  }
  // Maestra Ulpiana (holograma en la cinemática) y la Biblioteca.
  makePerson(scene, 'ulpiana', { skin: 'trigueno', hair: '#ecebe6', hairStyle: 'bun', top: '#5a3f6e', sleeves: 'long', coat: '#3a2a4e', trim: '#e3b04b', bottom: '#2a2030', glasses: true, item: 'book', elder: true });
}

// ------------------------------------------------------------------ ÍCONOS
function buildIcons(scene) {
  const icon = (key, draw) => tex(scene, key, 14, 14, draw);
  icon('ic_doc', (ctx, px) => { px('#efe3c2', 2, 1, 10, 12); px('#d8c79e', 10, 1, 2, 12); for (let y = 3; y < 12; y += 2) px('#7a5a3a', 4, y, 6, 1); px('#b5562c', 7, 10, 3, 2); });
  icon('ic_doc_torn', (ctx, px) => { px('#efe3c2', 2, 1, 10, 12); px('#081016', 7, 1, 1, 3); px('#081016', 6, 4, 2, 2); px('#081016', 7, 6, 1, 4); px('#081016', 6, 10, 1, 3); for (let y = 3; y < 12; y += 2) px('#7a5a3a', 3, y, 3, 1); });
  icon('ic_plate', (ctx, px) => { px('#8e989c', 1, 3, 12, 8); px('#b8c0c4', 1, 3, 12, 1); px('#5c6468', 1, 10, 12, 1); px('#3a3f42', 2, 4, 1, 1); px('#3a3f42', 11, 4, 1, 1); px('#3a3f42', 2, 9, 1, 1); px('#3a3f42', 11, 9, 1, 1); for (let x = 4; x < 11; x += 2) px('#2a2f33', x, 6, 1, 2); });
  icon('ic_book', (ctx, px) => { px('#2f5a3a', 2, 2, 10, 11); px('#efe3c2', 3, 3, 1, 9); px('#3f7a4e', 5, 3, 6, 2); px('#e3b04b', 6, 7, 4, 1); });
  icon('ic_brush', (ctx, px) => { px('#7a5a3a', 2, 9, 7, 2); px('#8e989c', 8, 6, 4, 6); px('#b8c0c4', 9, 6, 2, 1); px('#d8cbb0', 1, 2, 6, 3); px('#7a1f1a', 2, 3, 4, 1); });
  icon('ic_receipts', (ctx, px) => { px('#efe3c2', 4, 1, 8, 10); px('#d8c79e', 2, 3, 8, 10); px('#f6efe0', 3, 4, 6, 8); for (let y = 6; y < 12; y += 2) px('#7a5a3a', 4, y, 4, 1); });
  icon('ic_pact', (ctx, px) => { px('#efe3c2', 2, 1, 10, 12); px('#7a5a3a', 4, 3, 6, 1); px('#7a5a3a', 4, 5, 6, 1); px('#2a5aa8', 4, 9, 3, 1); px('#2a5aa8', 6, 10, 3, 1); px('#c8302a', 9, 9, 2, 2); });
  icon('ic_voice', (ctx, px) => { px('#f3ecd8', 1, 2, 12, 7); px('#f3ecd8', 3, 9, 3, 2); px('#f3ecd8', 3, 11, 1, 1); px('#3fa3a0', 3, 4, 2, 2); px('#3fa3a0', 6, 4, 2, 2); px('#3fa3a0', 9, 4, 2, 2); });
  icon('ic_law', (ctx, px) => { px('#e3b04b', 6, 1, 2, 11); px('#e3b04b', 1, 3, 12, 1); px('#e3b04b', 0, 6, 5, 1); px('#e3b04b', 9, 6, 5, 1); px('#b0893f', 1, 4, 1, 2); px('#b0893f', 12, 4, 1, 2); px('#b0893f', 4, 12, 6, 2); });
  icon('ic_key', (ctx, px) => { px('#e3b04b', 1, 4, 5, 5); px('#081016', 3, 6, 1, 1); px('#e3b04b', 6, 6, 7, 1); px('#e3b04b', 10, 7, 1, 2); px('#e3b04b', 12, 7, 1, 2); });
  icon('ic_star', (ctx, px) => { px('#e3b04b', 6, 1, 2, 12); px('#e3b04b', 1, 6, 12, 2); px('#e3b04b', 3, 3, 8, 8); px('#fff3b0', 5, 5, 4, 4); });

  // Balanza de la audiencia: pedestal, brazo y platillos (el brazo rota).
  tex(scene, 'ui_pillar', 14, 44, (ctx, px) => {
    px('#b0893f', 5, 4, 4, 34); px('#e3b04b', 6, 4, 1, 34); px('#8a6a32', 1, 38, 12, 3); px('#b0893f', 0, 41, 14, 3);
    px('#e3b04b', 4, 0, 6, 5); px('#fff3b0', 6, 1, 2, 2);
  });
  tex(scene, 'ui_beam', 64, 4, (ctx, px) => { px('#b0893f', 0, 1, 64, 2); px('#e3b04b', 0, 1, 64, 1); px('#8a6a32', 0, 0, 3, 4); px('#8a6a32', 61, 0, 3, 4); });
  tex(scene, 'ui_pan', 22, 16, (ctx, px) => {
    px('#8a6a32', 10, 0, 2, 2); px('#b0893f', 4, 2, 1, 9); px('#b0893f', 17, 2, 1, 9); px('#b0893f', 10, 2, 1, 9);
    px('#b0893f', 1, 11, 20, 3); px('#e3b04b', 2, 11, 18, 1); px('#8a6a32', 4, 14, 14, 1);
  });
}

// Viñeta de cámara (bordes más oscuros, atmósfera de cine).
function buildVignette(scene) {
  const W = 480, H = 270;
  if (scene.textures.exists('vignette')) scene.textures.remove('vignette');
  const c = scene.textures.createCanvas('vignette', W, H);
  if (!c) return;
  const ctx = c.context;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(8,16,22,0)');
  g.addColorStop(0.7, 'rgba(8,16,22,0.14)');
  g.addColorStop(1, 'rgba(6,12,16,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  c.refresh();
}

// ------------------------------------------------------------------ RUINAS
// Lo que dejó la guerra: chatarra, torres caídas, el puente volado y casas en ruinas.

// Línea de píxeles (Bresenham), para celosías y cables.
function line(px, x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 400; n++) {
    px(c, x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// Franja de río al pie de lo que quedó en el agua (empata con el agua del mapa).
function waterBand(px, w, y, h) {
  px('#2b6f6c', 0, y, w, h);
  px('#245f5d', 0, y + 2, w, 1);
  for (let x = 1; x < w - 4; x += 9) px('#7cc3b6', x, y, 4, 1);
  for (let x = 5; x < w - 4; x += 11) px('#4c9a92', x, y + 3, 5, 1);
}

function buildRuins(scene) {
  // Bus amarillo que quedó a medias en el río, donde estaba el puente (56x24).
  tex(scene, 'pr_bus', 56, 24, (ctx, px) => {
    px('#8a6a2a', 7, 1, 42, 2); for (let x = 9; x < 48; x += 6) px('#5c4a2a', x, 0, 1, 3);
    px('#b5872a', 2, 3, 52, 2);
    px('#c9962a', 1, 5, 54, 14);
    px('#2f6b3f', 1, 14, 54, 2);
    for (let i = 0; i < 7; i++) {
      const x = 4 + i * 7;
      px('#2d3a40', x, 7, 5, 6);
      if (i % 3 === 1) { px('#9fb8c0', x + 1, 8, 1, 3); px('#9fb8c0', x + 3, 9, 1, 1); } else px('#4a5a62', x + 1, 7, 2, 1);
    }
    px('#9a5a2a', 10, 12, 6, 2); px('#9a5a2a', 31, 5, 5, 1); px('#9a5a2a', 45, 11, 3, 4); px('#7a4220', 22, 16, 9, 2); px('#7a4220', 2, 6, 2, 6);
    px('#4f9a3c', 12, 2, 6, 2); px('#6fbf55', 14, 1, 2, 1); px('#4f9a3c', 38, 2, 4, 2);
    waterBand(px, 56, 18, 6);
  });
  // El campanario de la iglesia vieja en la isleta, partido por la guerra (28x60).
  tex(scene, 'pr_belfry', 28, 60, (ctx, px) => {
    px('#8e989c', 13, 0, 2, 7); px('#8e989c', 10, 2, 8, 2);
    for (let y = 7; y < 16; y++) { const w = 4 + (y - 7) * 2; px(y % 2 ? '#b4553a' : '#9a4a30', 14 - w / 2, y, w, 1); }
    px('#a89c86', 3, 16, 22, 3);
    px('#d8d0bc', 5, 19, 18, 35); px('#b8b0a0', 19, 19, 4, 35);
    px('#2a2420', 10, 22, 8, 12); px('#2a2420', 11, 21, 6, 1);
    px('#c9a030', 12, 26, 4, 5); px('#a8802a', 11, 30, 6, 1); px('#5c4a2a', 13, 23, 2, 3);
    px('#8a8270', 7, 36, 1, 5); px('#8a8270', 8, 40, 1, 4); px('#8a8270', 17, 38, 3, 1);
    px('#3f8a35', 5, 48, 3, 5); px('#5aa648', 20, 47, 3, 6); px('#3f8a35', 12, 50, 4, 3);
    // Le falta medio techo y tiene un boquete: así quedó después de la guerra.
    ctx.clearRect(15, 0, 13, 12);
    px('#9a4a30', 15, 9, 2, 3); px('#8a3a28', 17, 11, 2, 2);
    px('#2a2420', 17, 40, 4, 5); px('#5a5048', 16, 39, 6, 1); px('#5a5048', 21, 41, 1, 4);
    // La isleta: arena y piedras al pie de la torre.
    px('#c9b07a', 1, 53, 26, 3); px('#a8905a', 3, 52, 6, 1); px('#8a8270', 20, 52, 4, 2);
    waterBand(px, 28, 56, 4);
  });
  // Techo de zinc que asoma del agua, con su antena torcida (40x18).
  tex(scene, 'pr_sunken_roof', 40, 18, (ctx, px) => {
    for (let y = 0; y < 12; y++) { const w = Math.round(8 + y * 2.6); px(y % 3 ? '#8f9aa0' : '#7d878d', Math.round(20 - w / 2), y + 2, w, 1); }
    px('#9a5a3a', 12, 9, 4, 2); px('#9a5a3a', 24, 11, 5, 1); px('#9a5a3a', 18, 5, 2, 2);
    px('#5c6468', 27, 0, 1, 6); px('#5c6468', 24, 1, 7, 1); px('#5c6468', 25, 3, 4, 1);
    waterBand(px, 40, 13, 5);
  });
  // Torre de energía caída en el río (64x30).
  tex(scene, 'pr_pylon_fallen', 64, 30, (ctx, px) => {
    const c1 = '#6e5a4a';
    const c2 = '#8a7a6a';
    line(px, 2, 26, 50, 4, c1); line(px, 8, 27, 56, 9, c1);
    for (let i = 0; i < 8; i++) {
      const t0 = i / 8;
      const t1 = (i + 1) / 8;
      line(px, Math.round(2 + 48 * t0), Math.round(26 - 22 * t0), Math.round(8 + 48 * t1), Math.round(27 - 18 * t1), c2);
    }
    line(px, 46, 2, 60, 12, c1); line(px, 44, 8, 62, 4, c1);
    px('#cfe3e8', 60, 11, 2, 2); px('#cfe3e8', 61, 3, 2, 2);
    for (let x = 30; x < 46; x++) px('#2a2420', x, 12 + Math.round(Math.sin((x - 30) / 5) * 2 + (x - 30) / 3), 1, 1);
    waterBand(px, 64, 22, 8);
  });
  // Muro de concreto de un edificio que se vino abajo (48x40).
  tex(scene, 'pr_ruin', 48, 40, (ctx, px) => {
    const r = rng(53);
    for (let x = 0; x < 44; x++) {
      const top = 4 + Math.floor(Math.abs(Math.sin(x * 0.45)) * 8 + r() * 4) + (x > 30 ? 6 : 0);
      px(x % 7 === 0 ? '#9a958c' : '#a8a39a', x + 2, top, 1, 36 - top);
    }
    px('#8e8a82', 2, 34, 44, 2);
    px('#3a3632', 8, 15, 8, 7); px('#3a3632', 22, 17, 8, 7); px('#3a3632', 34, 23, 6, 6);
    px('#5f5b54', 8, 22, 8, 1); px('#5f5b54', 22, 24, 8, 1);
    for (const [x, y, h] of [[6, 2, 6], [12, 4, 5], [27, 1, 7], [38, 8, 6]]) px('#9a5a3a', x, y, 1, h);
    line(px, 18, 26, 22, 34, '#6e6a62'); line(px, 30, 8, 33, 15, '#6e6a62');
    for (let i = 0; i < 16; i++) px(r() < 0.5 ? '#3f8a35' : '#5aa648', 2 + Math.floor(r() * 10), 18 + Math.floor(r() * 16), 2, 2);
    for (let i = 0; i < 6; i++) px(r() < 0.5 ? '#3f8a35' : '#5aa648', 40 + Math.floor(r() * 6), 26 + Math.floor(r() * 8), 2, 2);
    px('#8e8a82', 0, 36, 10, 4); px('#a8a39a', 1, 36, 4, 2); px('#7a766e', 36, 35, 12, 5); px('#97928a', 38, 35, 4, 2);
  });
  // Valla publicitaria del mundo de antes, desteñida y rota (64x42). El texto
  // lo pone TownScene encima, como letrero.
  tex(scene, 'pr_billboard', 64, 42, (ctx, px) => {
    px('#5c6468', 6, 26, 2, 16); px('#5c6468', 56, 26, 2, 16);
    px('#3a3f42', 0, 0, 64, 28);
    px('#d8c8a0', 1, 1, 62, 26);
    px('#b8cfd0', 1, 1, 62, 6);
    px('#f2d48a', 54, 2, 6, 4);
    px('#c98a7a', 2, 19, 7, 7); px('#a8b88a', 54, 20, 7, 6);
    px('#8a7a62', 44, 14, 9, 7); px('#3a3f42', 53, 16, 9, 6); px('#b8a888', 43, 14, 1, 7);
    px('#9a5a3a', 12, 26, 1, 4); px('#9a5a3a', 50, 26, 1, 3); px('#9a5a3a', 30, 27, 1, 2);
  });
  // Filtro de agua de la Junta: barriles, arena y carbón (20x26).
  tex(scene, 'pr_filter', 20, 26, (ctx, px) => {
    px('#6e4527', 1, 14, 18, 2); px('#6e4527', 2, 16, 2, 10); px('#6e4527', 16, 16, 2, 10);
    px('#2f5f8a', 4, 2, 12, 12); px('#3f77a8', 5, 2, 3, 12); px('#244a6c', 13, 2, 3, 12); px('#1d3a55', 4, 6, 12, 1);
    px('#efe3c2', 3, 0, 14, 3); px('#d8c79e', 3, 2, 14, 1);
    px('#8e989c', 9, 14, 2, 3); px('#5c6468', 8, 16, 4, 1);
    px('#efe3c2', 12, 12, 3, 2);
    px('#7cc3b6', 9, 18, 1, 2);
  });
  tex(scene, 'pr_tires', 16, 12, (ctx, px) => {
    for (const [y, x] of [[8, 1], [4, 2], [0, 3]]) { px('#1d1a18', x, y, 12, 4); px('#3a3532', x + 3, y + 1, 6, 2); px('#2a2622', x, y + 3, 12, 1); }
  });
  // --- El puerto en caos: basura y el peaje del Puño.
  tex(scene, 'pr_trash', 18, 10, (ctx, px) => {
    px('#2a2f33', 1, 3, 7, 6); px('#3a3f42', 2, 3, 3, 2); px('#2a2f33', 9, 5, 6, 4); px('#3a3f42', 10, 5, 2, 1);
    px('#9fb8c0', 6, 6, 2, 3); px('#c8302a', 13, 2, 3, 3); px('#efe3c2', 4, 8, 4, 1); px('#8a6034', 15, 7, 3, 2);
    px('#5c6468', 0, 9, 18, 1);
  });
  tex(scene, 'pr_toll', 16, 22, (ctx, px) => {
    px('#5c6468', 7, 10, 2, 12);
    px('#2a2420', 0, 0, 16, 11); px('#c8302a', 1, 1, 14, 9);
    px('#efe3c2', 3, 3, 10, 1); px('#efe3c2', 3, 6, 7, 1);
    px('#1d1a18', 4, 19, 8, 3);
  });
  // Perro del barrio: suelto (dos cuadros) o amarrado y tranquilo.
  for (let f = 0; f < 2; f++) {
    tex(scene, 'an_dog' + f, 14, 10, (ctx, px) => {
      const dy = f ? 1 : 0;
      px('#a8743f', 3, 3, 8, 4); px('#8a5a34', 3, 6, 8, 1);
      px('#a8743f', 10, 1 + dy, 4, 4); px('#5a3a20', 12, 1 + dy, 2, 1); px('#1a1a1a', 12, 2 + dy, 1, 1); px('#1a1a1a', 13, 4 + dy, 1, 1);
      px('#8a5a34', 1, 2 + (f ? 1 : 0), 2, 1);
      px('#8a5a34', 4, 7, 1, 3 - dy); px('#8a5a34', 9, 7, 1, 2 + dy);
    });
  }
  tex(scene, 'an_dog_sit', 12, 12, (ctx, px) => {
    px('#a8743f', 2, 5, 6, 6); px('#8a5a34', 2, 10, 7, 1);
    px('#a8743f', 6, 1, 5, 5); px('#5a3a20', 9, 1, 2, 1); px('#1a1a1a', 9, 3, 1, 1); px('#1a1a1a', 10, 5, 1, 1);
    px('#c8302a', 6, 6, 4, 1); // collar
    px('#8a5a34', 0, 9, 3, 1);
  });
  // --- El puerto en orden: balanza pública, banderines y una cometa.
  tex(scene, 'pr_pubscale', 22, 30, (ctx, px) => {
    px('#6e4527', 10, 8, 2, 20); px('#5a3a20', 6, 27, 10, 3);
    px('#b0893f', 2, 8, 18, 2); px('#8e989c', 3, 10, 1, 4); px('#8e989c', 18, 10, 1, 4);
    px('#b0893f', 0, 14, 7, 2); px('#b0893f', 15, 14, 7, 2);
    px('#efe3c2', 3, 0, 16, 7); px('#8a6034', 3, 0, 16, 1); px('#2a5aa8', 5, 2, 12, 1); px('#2a5aa8', 5, 4, 9, 1);
  });
  tex(scene, 'pr_bunting', 96, 14, (ctx, px) => {
    const cols = ['#f2c230', '#2a5aa8', '#c8302a', '#efe3c2', '#3fa3a0', '#e8846b'];
    for (let x = 0; x < 96; x++) px('#3a2a20', x, 2 + Math.round(Math.sin((x / 96) * Math.PI) * 4), 1, 1);
    for (let i = 0; i < 12; i++) {
      const x = 4 + i * 8;
      const y = 3 + Math.round(Math.sin((x / 96) * Math.PI) * 4);
      const c = cols[i % cols.length];
      px(c, x, y, 5, 2); px(c, x + 1, y + 2, 3, 2); px(c, x + 2, y + 4, 1, 2);
    }
  });
  tex(scene, 'pr_kite', 14, 22, (ctx, px) => {
    for (let y = 0; y < 12; y++) { const w = y < 6 ? y * 2 + 1 : (11 - y) * 2 + 1; px(y < 6 ? '#e8846b' : '#f2c230', 7 - Math.floor(w / 2), y, w, 1); }
    px('#3fa3a0', 6, 3, 3, 3);
    px('#efe3c2', 7, 12, 1, 3); px('#c8302a', 6, 14, 3, 1); px('#efe3c2', 8, 15, 1, 3); px('#2a5aa8', 7, 17, 3, 1); px('#efe3c2', 7, 18, 1, 4);
  });
  // Antena parabólica caída de lado, con matas encima (18x16).
  tex(scene, 'pr_dish', 18, 16, (ctx, px) => {
    for (let y = 0; y < 12; y++) { const w = Math.round(Math.sqrt(Math.max(0, 36 - (y - 6) * (y - 6))) * 1.4); if (w > 1) px(y < 6 ? '#c9c2b0' : '#a8a090', 8 - w, y + 2, w * 2 - 2, 1); }
    px('#8e989c', 8, 6, 8, 1); px('#5c6468', 15, 5, 2, 3);
    line(px, 4, 4, 9, 11, '#7a766e');
    px('#4f9a3c', 0, 13, 6, 3); px('#6fbf55', 12, 14, 5, 2);
  });
}

export function buildAequitasTextures(scene) {
  buildTerrain(scene);
  buildProps(scene);
  buildRuins(scene);
  buildCompanions(scene);
  buildIcons(scene);
  buildVignette(scene);
}
