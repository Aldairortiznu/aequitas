# Créditos y licencias — AEQUITAS

AEQUITAS: El Retorno del Equilibrio es una iniciativa transmedia de Bellium S.A.S.
Este archivo reconoce el arte y las herramientas de terceros, con sus licencias.

## Arte de terreno (tiles)
- **Tuxemon** — césped, tierra, arena, árbol, flor y roca (`public/assets/tilesets/`:
  `reverdecer_terrain.png`, `tux_tree.png`, `tux_flower.png`, `tux_rock.png`,
  `tux_sand.png`).
  - Fuente: proyecto Tuxemon — https://github.com/Tuxemon/Tuxemon
  - Licencia: **CC BY-SA 3.0** (https://creativecommons.org/licenses/by-sa/3.0/), con arte
    de colaboradores de la comunidad (George, ArMM1998, Kelvin Shadewing, Buch, Isaiah658,
    entre otros).
  - Nota: al ser CC BY-SA, toda obra derivada que distribuya estos tiles debe mantener la
    atribución y compartirse bajo la misma licencia.

## Todo lo demás
- Personajes, casas, ruinas, interfaz, cinemáticas, íconos y efectos: **dibujados por
  código** para este proyecto (`src/art/aequitasArt.js`, `src/scenes/places.js`,
  `tools/make-icons.mjs`).
- Música y sonidos: **generados en el navegador** con Tone.js (sin archivos de audio).
- Motor y escenas adaptados de *Reverdecer*, un proyecto previo en Phaser 3 del mismo autor.

## Contenido jurídico
- Normas citadas: Constitución Política de Colombia (1991), Código Civil (Ley 84 de
  1873), Ley 2220 de 2022, Ley 446 de 1998 y Ley 2166 de 2021, según los textos de la
  Secretaría del Senado. Material pedagógico: no constituye asesoría jurídica.

## Tecnología
- **Phaser 3** — motor de juego (MIT).
- **Tone.js** — audio generativo (MIT).
- **Vite** — herramienta de build (MIT).
- **Playwright** — pruebas automáticas (Apache 2.0).
