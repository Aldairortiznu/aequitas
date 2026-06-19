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

## Sesión 5 — 2026-06-19
**Fase:** 3 (Diálogos) ✅ + correcciones.
**Hecho:**
- **Correcciones pedidas:** (1) los perros ya no se amontonan: seguimiento por
  **rastro de distancia** (`trailPointBehind`) con separación fija (Amanda 16px,
  Jerónimo 30px) y suavizado. (2) **Rediseño de la cara de Abigail**: ojos más grandes
  con brillo, mejillas, sonrisa; **gafas como monturas redondas** con puente alto y
  patillas y lentes transparentes (ya no parece antifaz).
- **Sistema de diálogos:** `src/data/dialogues.js` (4 voces: abigail, pensamiento,
  jeronimo, amanda, guia) + `src/scenes/DialogueScene.js` (caja pixel, retrato, nombre
  coloreado, máquina de escribir, ▼ para continuar; se lanza sobre World que se pausa).
- En World: NPC **El Jardinero** (sprite `npc_guia`) con burbuja "!", intro del prólogo
  automática al empezar, y tecla **E** para hablar con quien esté cerca (NPC/Amanda/Jerónimo).
- Verificado: consola sin errores; DialogueScene probada por eval (renderiza nombre/texto/typewriter).

**Pendiente / siguiente:** Fase 4 — guardado completo (puntos de guardado, continuar)
o Fase 5 — combate en tiempo real. Falta aún la foto real de Abigail.

---

## Sesión 6 — 2026-06-19
**Fase:** 5 (Combate en tiempo real) ✅
**Hecho:**
- Sprites nuevos: `sombra` (enemigo), `sombra_core` (punto débil), `slash` (destello).
- Combate integrado en WorldScene:
  - Ataque con **Espacio** (hitbox según orientación), enemigo sombra que persigue,
    daño por contacto con retroceso e i-frames, barras de vida (Abigail en HUD, sombra en mundo).
  - **Valor (V)** de Amanda: +daño y +velocidad temporal con recarga.
  - **Sabiduría (B)** de Jerónimo: revela el núcleo; sin revelar, los golpes "rebotan".
  - Derrota de Abigail → reaparece curada con mensaje; victoria → cura + enseñanza.
- Diálogos `sombra_aviso` (tutorial) y `sombra_vencida` (enseñanza), en español latino.
- Verificado por eval: mundo+combate sin errores; cadena Sabiduría→golpes→derrota del enemigo OK.

**Pendiente / siguiente:** Fase 4 (guardado completo: puntos de guardado, continuar real)
o empezar Fase 8 (plantilla de niveles para construir los 32 reinos). Falta foto de Abigail.

---

## Sesión 7 — 2026-06-19
**Fase:** 4 (Guardado completo) ✅
**Hecho:**
- Sprite `fuente` (punto de guardado). `src/data/wisdom.js` (registro de enseñanzas) y
  `src/scenes/DiaryScene.js` (Diario de Sabiduría, tecla I), registrada en main.js.
- En WorldScene: punto de guardado (fuente, E para guardar con destello + burbuja),
  restauración de posición al cargar, guardado automático al vencer la sombra, y la
  enseñanza se suma al diario (`gainWisdom`). HUD actualizado con todas las teclas.
- `save.js` ya soportaba estos campos; ahora se usan px/py/wisdomDiary/firstShadowBeaten.
- Verificado: guardado persiste posición/vida/diario en localStorage (eval); DiaryScene
  renderiza la enseñanza. Nota: introspección de escenas por eval resulta poco fiable al
  encadenar muchas; se valida por separado y probando en el navegador real.

**Pendiente / siguiente:** Fase 8 — plantilla de niveles para construir los 32 reinos
(portal → acertijo → Guardián → enseñanza). Falta la foto de Abigail.

---

## Sesión 8 — 2026-06-19
**Fase:** 6 (Acertijos) base ✅ + ampliación de libros.
**Hecho:**
- Ampliados los acertijos de libros reales (`src/data/bookRiddles.js`): ahora con **fuente**
  (filosofía/Biblia/literatura), **dónde leer** (capítulo/versículo para leer la obra real),
  pista, y 3 **tipos** de acertijo. Añadidas obras bíblicas (Eclesiastés 3, Mateo 6:34,
  1 Corintios 13) y reserva (Tao Te Ching, Hesse, Fromm, Epicteto, Salmos, Rilke).
- `src/systems/text.js`: normalización de respuestas (sin tildes/mayúsculas/signos) — testeado.
- `src/scenes/RiddleScene.js`: acertijo jugable con tipos completar/ordenar/elección,
  encabezado del libro, "dónde leer", pista, evaluación y pantalla de Aprendizaje.
- En WorldScene: **atril** (pedestal) que lanza un acertijo demo (Eclesiastés, ordenar);
  estado persistente en `save.riddlesSolved`. Burbujas/teclas E.
- Verificado: normalización OK; RiddleScene activa con World pausado (forzando el bucle por
  el throttling de rAF en pestaña de fondo); acertijo "ordenar" resuelto sin errores.

**Pendiente / siguiente:** Fase 8 — plantilla de niveles (portal→acertijo→Guardián→enseñanza)
y construir los 32 reinos. Falta la foto de Abigail.

---

## Sesión 9 — 2026-06-19
**Fase:** 8 (Contenido) — plantilla lista + Diario ampliado.
**Hecho:**
- Diario consultable AMPLIADO: ahora guarda enseñanzas completas {id,titulo,frase} y recoge
  tanto la de la sombra como las de los acertijos (DiaryScene reescrito; `gainWisdom` por objeto).
- `src/data/reinos.js`: los 33 reinos (prólogo + 32) con nombre, aprendizaje, Guardián,
  enseñanza, color y riddleId.
- WorldScene ahora es **consciente del reino** (getReino por save.level): título de HUD,
  tinte de ambiente, Guardián y acertijo según el nivel. Nuevo sprite `portal` que se abre
  al cumplir los retos (Guardián vencido + acertijo resuelto) y al entrar **avanza de reino**
  (sube save.level, suma la enseñanza al diario, cura y reinicia la escena tematizada).
- Verificado por eval (forzando el bucle por el throttling de rAF): Reino 1 y Reino 14 se
  tematizan bien (Guardián/atril correctos); vencer al Guardián abre el portal; advanceReino
  sube el nivel y agrega la enseñanza al diario. Sin errores en consola.

**Pendiente / siguiente:** mapas/diálogos únicos por reino y el jefe final especial (nivel 32).
Falta la foto de Abigail. (Aún sin alojamiento web: corre local con Vite.)

---

## Sesión 10 — 2026-06-19
**Fase:** 8 + 7 — **Sistema de biomas** (cada reino se siente distinto).
**Hecho:**
- `src/data/biomes.js`: **13 biomas** (jardín, bosque, ruinas, pradera, cripta, pantano,
  niebla, nieve, seto, cristal, costa, nocturno, paraíso) con paleta de suelo, sendero,
  borde, agua, decorados, monstruo, stats (vida/velocidad/tamaño) y partículas ambientales.
  Mapa nivel→bioma para los 33 reinos (`getBiome`).
- `src/art/biomeTextures.js`: texturas por código de **suelos por bioma**, **decorados**
  (pino, árbol muerto, roca, columna rota, seto, cristal, hongo, junco, farol místico,
  mata florida), **5 monstruos** (sombra/bestia/espectro/enredadera/reflejo), **orbe-tesoro**
  y mota de partícula. Registradas en `BootScene`.
- `WorldScene` reescrita para ser **consciente del bioma**: suelo, senderos, borde, agua
  (estanque/ciénaga/mar), decorados y partículas se generan según el bioma; **RNG sembrado
  por nivel** → cada reino tiene su mapa propio y estable entre sesiones. El Guardián usa
  el monstruo y stats del bioma (la velocidad de persecución sale de `stats.speed`).
- **Tesoros**: 4 orbes de luz por reino, posición sembrada; al tocarlos curan +10, sueltan
  destellos y se guardan en `save.treasuresByReino` (no reaparecen). Mensaje al juntarlos todos.
- Verificado en navegador (¡el WebGL ahora sí se captura!): biomas bosque/pantano/cristal/
  nocturno/paraíso se construyen sin errores; el nocturno (azul estrellado) y el paraíso
  (verde radiante) se ven radicalmente distintos. Consola limpia tras cambiar entre reinos.

**Pendiente / siguiente:** diálogos propios por Guardián, jefe final del Nivel 32 (abrazar),
y seguir afinando decorados/retos únicos por reino. Falta la foto de Abigail.

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
