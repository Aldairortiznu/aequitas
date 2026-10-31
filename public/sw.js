// Service worker de "AEQUITAS": permite jugar sin conexión tras la primera
// carga, PERO siempre sirve la última versión cuando hay red.
//
// Antes usaba "stale-while-revalidate" con un nombre de cache fijo, así que el
// celular se quedaba pegado a una versión vieja para siempre (los arreglos no
// llegaban). Ahora:
//   - El DOCUMENTO (index.html) y el manifest van por RED PRIMERO (network-first):
//     siempre la última versión; el cache es solo respaldo sin conexión. Como el
//     index.html nuevo apunta a chunks con hash nuevo, el juego se actualiza solo.
//   - Las listas .json y las ilustraciones (postales, retratos) también: sus nombres
//     no cambian cuando se actualizan.
//   - Los assets con hash (JS/CSS/imágenes/audio) son inmutables → cache-first.
//   - Al subir CACHE se borran los caches viejos.

// Prefijo propio: si el juego comparte dominio con otro (p. ej. Reverdecer),
// cada uno limpia SOLO sus caches y nunca borra los del otro.
const PREFIX = 'aequitas-';
const CACHE = PREFIX + 'v2'; // v2: las ilustraciones y sus listas (.json) van por red primero
const CORE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // la versión nueva toma el control cuanto antes
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Documento, manifest, listas de datos (.json) e ilustraciones (sus nombres no
  // cambian al actualizarlas) → NETWORK-FIRST (siempre lo último; cache = respaldo).
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.json')
    || url.pathname.includes('/assets/postales/') || url.pathname.includes('/assets/retratos/');
  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Resto (assets con hash, inmutables) → CACHE-FIRST; si falta, red y se guarda.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
        return res;
      } catch (err) {
        return cached;
      }
    })
  );
});
