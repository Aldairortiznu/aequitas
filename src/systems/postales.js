import Phaser from 'phaser';

// Álbum de postales: cuáles se han visto. Se guarda aparte de la partida, así
// el álbum sigue lleno aunque se empiece un juego nuevo.

const KEY = 'aequitas-postales';

export function unlockedPostales() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
}

export function unlockPostal(key) {
  const all = unlockedPostales();
  if (all[key]) return;
  all[key] = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* sin almacenamiento */ }
}

// Ilustraciones hechas a mano (opcionales): public/assets/postales/postales.json
// y public/assets/retratos/retratos.json dicen qué archivos hay, p. ej.
//   { "boveda": "boveda.webp" }   →  textura 'postal_boveda'
//   { "sora": "sora.webp" }       →  textura 'retrato_sora'
// Si un archivo no está, el juego usa la pintura por código. Se suavizan al
// llegar (el juego en general se dibuja con píxeles nítidos).
export function loadIllustrations(scene) {
  const add = (json, dir, prefix) => {
    scene.load.json(json, `assets/${dir}/${json}.json`);
    scene.load.once(`filecomplete-json-${json}`, (key, type, data) => {
      Object.entries(data || {}).forEach(([k, file]) => scene.load.image(prefix + k, `assets/${dir}/${file}`));
    });
  };
  scene.load.on('filecomplete', (key) => {
    if (/^(postal|retrato)_/.test(key) && scene.textures.exists(key)) scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  });
  add('postales', 'postales', 'postal_');
  add('retratos', 'retratos', 'retrato_');
}
