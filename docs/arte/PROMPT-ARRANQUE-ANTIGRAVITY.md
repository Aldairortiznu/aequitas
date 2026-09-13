# Prompt de arranque para Antigravity (Nano Banana) · arte de AEQUITAS

Copia todo lo que hay debajo de la línea y pégalo como primer mensaje de la sesión en
Antigravity, con el repositorio `aequitas` abierto en la rama `desarrollo`. Al terminar cada
bloque, Claude revisa lo producido en el juego y deja las correcciones en
`docs/arte/BITACORA.md`.

---

Estás en el repositorio `aequitas`, un RPG educativo sobre derecho colombiano hecho con
Phaser 3 y TypeScript. El Prólogo (Ciénaga de Bellium) y el Episodio 1 (Conjunto Altamar) ya
se juegan de punta a punta con **arte provisional generado por código**. Tu trabajo es darle al
juego su arte definitivo con Nano Banana, pieza por pieza, **sin tocar código ni contenido**:
el motor carga automáticamente cualquier archivo que cumpla el contrato de nombres y tamaños,
y sigue usando el provisional para lo que falte.

## Antes de generar nada, lee en este orden

1. `docs/arte/README.md` — cómo llega el arte al juego y el orden de producción.
2. `docs/arte/01-GUIA-NANO-BANANA.md` — contrato de archivos, paleta de 32 colores, hoja de
   sprite de 64×96, flujo de normalización, plantillas de prompt y lista de control de calidad.
3. La ficha de lo que vas a producir: `02-FICHAS-PERSONAJES.md` (sprites y retratos),
   `03-FICHAS-REGIONES.md` (tilesets de 64 celdas por región y estado) o
   `04-LAMINAS-UI-ICONOS.md` (láminas cinematográficas, iconos, interfaz).
4. `docs/design/02-narrativa.md` §1 — el tono: sobrio, nada alegórico, nada cursi. Esto manda
   también en la imagen.

## Dos registros visuales, que no se mezclan

- **Mundo** (sprites, tilesets, retratos, iconos): pixel art 16-bit sobrio, píxel exacto, paleta
  cerrada de 32 colores, sin degradados ni anti-aliasing ni brillos. Caribe verosímil: mangle,
  sal, cemento agrietado, zinc, paneles solares viejos.
- **Cine** (láminas de `public/assets/illustrations/`): ilustración pintada 16:9 a 1920×1080,
  acabado limpio, pincel visible, misma luz caribeña. Se usan en las aperturas y cierres de cada
  episodio y detrás de las **conversaciones decisivas** (el juego las muestra a pantalla
  completa bajo la caja de diálogo cuando un nodo lleva `lamina`). La lista exacta, con
  composición y luz de cada una, está en `04-LAMINAS-UI-ICONOS.md` §1. Reglas: sin texto
  legible, tercio inferior tranquilo, planos de cine (general para lugares, medio para
  conversaciones, detalle para documentos), personajes reconocibles por silueta y ropa, nunca
  rostros en primer plano que contradigan los retratos.

## Reglas que no se negocian

- Nombres y tamaños de archivo exactos. `npm run assets:scan` te dice qué falta y si algo está
  mal; `npm run assets:normalize` convierte la materia prima al formato definitivo.
- Materia prima en `art-src/<tipo>/…`; archivos definitivos solo a través del normalizador
  (excepto láminas e interfaz, que se exportan a tamaño exacto).
- Sprites: genera los 16 cuadros por separado en `art-src/sprites/<id>/down-0.png … up-3.png`
  y ensambla con `--carpeta`. Los pies tocan la fila 22-23 de la celda de 16×24; `left` y
  `right` con el morral o bastón del mismo lado del cuerpo.
- Retratos: los tres de cada personaje (`neutra`, `tensa`, `cordial`) en la misma sesión,
  adjuntando el `neutra` aprobado como referencia de los otros dos.
- Tilesets: una celda por archivo (`NN-descripcion.png`) y ensamblado con `--carpeta`. Los
  cuatro estados (`ceniza`, `brote`, `verdor`, `floracion`) comparten disposición: cambia la
  vegetación y el cuidado, no la geometría.
- Láminas de un mismo episodio: misma sesión, misma descripción de estilo, la primera aprobada
  como referencia de las siguientes.
- Nada de cuatro exploradores, flores luminosas, túnicas ni auras: el elenco y los símbolos del
  prototipo (`art-src/referencias/`) sirven solo como referencia de luz y color.
- Cada activo se verifica antes de pasar al siguiente: `npm run assets:scan`, luego
  `npm run dev` y `http://localhost:5180/?escena=galeria` (dorado = real, gris = provisional), y
  en su contexto: `http://localhost:5180/?ep=ep00` o `?ep=ep01` → Nueva partida. Si a 2× algo se
  ve sucio o irreconocible, se regenera con menos detalle o se corrige en Aseprite.
- Git: un activo o un grupo pequeño por commit, mensaje `art: <qué>`, en la rama `arte`
  (créala desde `desarrollo`). No mezcles cambios de código.

## Flujo

1. `npm install` (si hace falta), `npm run assets:scan`.
2. Produce en bloques y para al final de cada bloque para revisión:
   - **Bloque A · Renata**: sprite de 16 cuadros y 3 retratos. Es la referencia de proporción de
     todo el elenco: los demás se generan «in the same style and proportions as the reference
     sprite», adjuntando `public/assets/sprites/renata.png` ampliado 8×.
   - **Bloque B · Elenco del Episodio 1**: Pilar, Marrugo, Tomás, Zoraida, vigilante,
     vecino-1 … vecino-4 (sprite + 3 retratos cada uno, salvo vecinos y vigilante: sprite +
     retrato `neutra`).
   - **Bloque C · Tileset `altamar`** en sus cuatro estados; después `cienaga`.
   - **Bloque D · Láminas del Episodio 1** (`llegada`, `lobby`, `audiencia`, `cuaderno`,
     `registrador`, `cierre`) y `menu-fondo`.
   - **Bloque E · Elenco del Prólogo**: Nepomuceno, Clemencia, Casimiro, Eladio, estudiante,
     estudiante-2, alguacil; retratos de Moscote.
   - **Bloque F · Láminas del Prólogo** (las cinco de apertura y `ep00-lamina-encargo`).
   - **Bloque G · Iconos e interfaz** (sellos, orla de acta, medidores).
3. Al cerrar cada bloque, añade una fila a `docs/arte/BITACORA.md`: qué se produjo, qué se
   regeneró y por qué, qué queda pendiente, y una captura de la galería en
   `art-src/capturas/<bloque>.png`. Haz commit y push de la rama `arte` y avisa.

Empieza por el Bloque A. Adjunta el sprite provisional de Renata ampliado (captura de la
galería) solo como referencia de proporción, no de estilo.
