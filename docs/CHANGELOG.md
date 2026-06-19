# 📜 REGISTRO DE CAMBIOS — *Reverdecer*

> Una entrada por sesión. Lo más reciente arriba. Anota: fecha, qué se hizo,
> decisiones, y dónde quedó para retomar.

---

## Sesión 2 — 2026-06-19
**Fase:** 1 (Andamiaje técnico) ✅
**Hecho:**
- Heroína nombrada: **Abigail**.
- Proyecto Vite + **Phaser 3.90** instalado (`npm install`, 13 paquetes).
- Estructura: `src/{scenes,systems,entities,data}`, `config.js`, `index.html`, `main.js`.
- Config Phaser: 480x270, `pixelArt:true`, escala FIT centrada, física arcade.
- Escenas: **Boot** (genera texturas placeholder: abigail, jeronimo, amanda, leaf) →
  **Menu** (fondo verde degradado, hojas flotando, título, menú Nueva/Continuar) →
  **Placeholder** (intro narrativa del Prólogo, temporal hasta Fase 2).
- **Sistema de guardado** básico en localStorage (`systems/save.js`): new/load/write/delete.
- Añadido server "jardin" a `C:\Users\Aldai\.claude\launch.json` (puerto 5173).
- Verificado: `npm run dev` levanta y Phaser arranca **sin errores** (consola limpia).
  Nota: el previsualizador headless no captura el canvas WebGL; se verifica por consola.

- **Cambio de nombre del juego:** ahora se llama **"Reverdecer"** (subtítulo "La
  travesía de Abigail"), más acorde a la filosofía de florecer/aprender/amarse.
  Actualizado en config, pantalla de título, package.json, README y todos los docs.
  (La carpeta sigue siendo `JardinDeLosMiedos` para no romper rutas de launch.json/git.)

**Pendiente / siguiente:** Fase 2 — tilemap verde de prueba, Abigail con animaciones de
caminar (4 direcciones), colisiones, cámara, y que Jerónimo y Amanda la sigan.

---

## Sesión 3 — 2026-06-19
**Fase:** 7 (Arte) parcial — diseño de personajes.
**Hecho:**
- Creados los sprites pixel art frontales de **Abigail** (pelo negro liso, piel clara,
  túnica verde), **Jerónimo** (perro viejo blanco/gris, orejas caídas) y **Amanda**
  (perra joven blanca, orejas en punta). Dibujados por código.
- Arquitectura del arte: datos puros en `src/art/spriteData.js` (rects + paleta,
  sin Phaser) reutilizados por `src/art/characters.js` (hornea texturas Phaser) y por
  la vista previa `personajes.html` (canvas 2D). Sin duplicación.
- `BootScene` ahora genera estos sprites; `MenuScene` muestra el trío con nombres y
  una animación de "respiración".
- Verificado sin errores en consola. Vista previa abierta en el navegador.

**Notas:**
- ⚠️ La **foto de Abigail no llegó adjunta**; se diseñó según la descripción (pelo negro
  liso, caucásica). Ajustar cuando llegue la imagen.
- El previsualizador headless no captura canvas WebGL y se colgó; se verifica por consola
  y por `personajes.html` abierto en el navegador real.

**Pendiente / siguiente:** Fase 2 — mundo jugable (tilemap, caminar 4 direcciones,
colisiones, cámara, perros que siguen a Abigail).

---

## Sesión 4 — 2026-06-19
**Fase:** 2 (Movimiento y mundo base) ✅
**Hecho:**
- `src/art/tiles.js`: tiles por código (césped, flores, sendero, agua, árbol, arbusto).
- `src/scenes/WorldScene.js`: jardín explorable 50x34 tiles. Abigail (física arcade)
  camina en 4 direcciones (sprite frontal + de espaldas `abigail_back` + flip lateral)
  con "pasito" (bob). Colisiones con árboles (cuerpo solo en el tronco, `refreshBody`)
  y con el estanque. Cámara con seguimiento y límites. HUD (zona + controles).
- **Jerónimo y Amanda** siguen a Abigail en fila usando un historial de posiciones
  (Amanda más cerca con lag 10, Jerónimo detrás con lag 22).
- `main.js` expone `window.__game` para pruebas; "Comenzar" ahora entra a `World`.
- Añadido sprite `abigail_back` en spriteData.
- Verificado: consola sin errores (318 entradas); World se crea sin fallos al iniciarla.
  El previsualizador headless no captura WebGL; se probó abriendo el juego en el navegador.

**Pendiente / siguiente:** Fase 3 — sistema de diálogos (NPCs, Jerónimo, Amanda,
reflexión propia) con caja pixel y efecto máquina de escribir.

---

## Sesión 1 — 2026-06-18
**Fase:** 0 (Planificación) ✅
**Hecho:**
- Definido el concepto: RPG pixel art top-down, 31 reinos = 31 miedos interiores.
- Personajes confirmados: Heroína + **Jerónimo** (perrito viejito sabio, blanco) +
  **Amanda** (perrita joven valiente, blanca).
- Decisiones cerradas: Phaser 3 + Vite, combate en tiempo real, narrativa con NPCs
  guía y reflexiones, puzzles/acertijos (algunos remiten a libros reales),
  guardado de progreso, arte CC0, perspectiva cenital, español.
- Verificado entorno: Node 24.15, npm 11.12, git 2.53, Python 3.11 (todo OK).
- Creados documentos de seguimiento: CONTEXTO.md, PLAN.md, CHANGELOG.md, GDD_NIVELES.md.
- `git init`.

**Decisiones de diseño nuevas:**
- Combate definido como **acción en tiempo real**, con la narrativa profunda llevada
  por diálogos (NPCs + perros + reflexión propia), no por menús de batalla.

**Pendiente / siguiente:** Fase 1 — andamiar proyecto Phaser + Vite y dejar
`npm run dev` corriendo. Hacer primer commit.

**Ajuste posterior (misma sesión):**
- Cambio de alcance: ahora **32 niveles** (cumple 32 años), enmarcados como
  **aprendizajes** (no como miedos): cada reino guarda una sabiduría a conquistar y un
  Guardián que la bloquea. Se añadió un **Prólogo "El Despertar"** (tutorial).
- Tono reforzado: **filosófico y profundo** (estoicismo, Frankl, Jung, budismo),
  acertijos multi-paso y combates que premian usar a Jerónimo (debilidad) y Amanda (Valor).
- `GDD_NIVELES.md` reescrito completo. Actualizados CONTEXTO y PLAN.
