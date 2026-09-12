# Prompt de arranque para una sesión de arte en Antigravity (Nano Banana)

Copia y pega esto al empezar. Ajusta la última línea con el activo por el que quieres empezar.

---

Estás en el repositorio `aequitas`, un RPG educativo de derecho colombiano en pixel art 16-bit
(Phaser 3). Tu tarea es producir arte con Nano Banana y dejarlo integrado en el juego sin tocar
código. El motor carga automáticamente cualquier archivo que cumpla el contrato y usa arte
provisional para lo que falte.

Antes de generar nada, lee en este orden:
1. `docs/arte/README.md` (cómo llega el arte al juego).
2. `docs/arte/01-GUIA-NANO-BANANA.md` (contrato de archivos, paleta, flujo, plantillas de prompt, control de calidad).
3. La ficha del activo que vas a producir: `docs/arte/02-FICHAS-PERSONAJES.md`, `docs/arte/03-FICHAS-REGIONES.md` o `docs/arte/04-LAMINAS-UI-ICONOS.md`.
4. `docs/design/02-narrativa.md` §1 (tono: nada alegórico, nada cursi) si vas a hacer láminas.

Reglas que no se negocian:
- Paleta cerrada de 32 colores (está en la guía). Pixel art limpio: sin degradados, sin
  anti-aliasing, sin brillos ni auras.
- Nombres y tamaños de archivo exactos. `npm run assets:scan` te dice qué falta y si algo
  está mal; `npm run assets:normalize` convierte tu materia prima al formato definitivo.
- Materia prima en `art-src/<tipo>/…`; archivos definitivos solo a través del normalizador.
- Sprites: genera los 16 cuadros por separado en `art-src/sprites/<id>/down-0.png … up-3.png`
  y ensambla con `--carpeta`. Tilesets: genera cada celda por separado (`NN-descripcion.png`)
  y ensambla con `--carpeta`. Los cuatro estados de un tileset comparten disposición.
- Después de cada activo: `npm run assets:scan`, abre `http://localhost:5180/?escena=galeria`
  (`npm run dev`) y verifica según la lista de control de calidad. Si algo se ve mal a 2×,
  regenera con menos detalle o corrige en Aseprite.
- Confirma con git (`art: <qué>`), un activo o un grupo pequeño por commit.

Flujo:
1. `npm install` (si hace falta) y `npm run assets:scan`.
2. Toma el primer activo de la lista «Faltan» según la prioridad del `README.md`.
3. Genera → normaliza → verifica → confirma. Repite.
4. Al terminar la sesión, deja un resumen en `docs/arte/BITACORA.md`: qué se produjo, qué se
   regeneró y por qué, qué queda pendiente.

Empieza por: `renata` (16 cuadros de sprite y 3 retratos). Adjunta el sprite provisional
ampliado (captura de la galería) solo como referencia de proporción, no de estilo.
