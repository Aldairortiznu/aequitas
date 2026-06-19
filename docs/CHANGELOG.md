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
