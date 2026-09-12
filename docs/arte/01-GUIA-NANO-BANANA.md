# 01 · Guía técnica: contrato, flujo de trabajo y control de calidad

## 1. Estilo (léelo antes de generar nada)

- **Pixel art 16-bit sobrio.** Formas legibles a 16 px, sin degradados, sin desenfoque, sin
  anti-aliasing. Contorno oscuro de 1 px solo donde separa figura de fondo. Sombreado por
  bloques de dos o tres tonos, no por texturas.
- **Caribe verosímil.** Mangle, palma, sal, ladrillo colonial, cemento agrietado, zinc,
  balcones de madera, paneles solares viejos. Nada de fantasía medieval ni «cyber».
- **Paleta cerrada (32 colores).** Toda pieza se cuantiza a esta paleta al normalizarse; si
  el generador usa otros colores, se aproximan al más cercano. Genera ya con estos tonos.

| Grupo | Hex |
|-------|-----|
| Ceniza (neutros fríos) | `#1b1b1f` `#2e2d33` `#4a4850` `#6f6c76` `#a29ea8` |
| Bellium (violetas) | `#3b2a5c` `#5a3f86` `#8f6fc0` |
| Dorado (sellos, margarita) | `#b8892e` `#e2b94a` `#f4dc8a` |
| Verdes (brote a floración) | `#2f5d3a` `#4a8a4f` `#7cc46b` `#b9e39a` |
| Aguas | `#1e6f7a` `#2bb5b8` `#8fe0de` |
| Tierras y madera | `#7a4b2d` `#b5773f` `#d9a66b` |
| Sal y mar rosado | `#f2c9d6` `#e69ab8` |
| Piel (cuatro tonos) | `#f1c9a5` `#c98e5e` `#8a5a3a` `#5a3a26` |
| Papel | `#f3ead8` `#eadfc6` `#cfc2a3` |
| Absolutos | `#ffffff` `#000000` |

- **Referencias visuales** en `art-src/referencias/` (láminas del prototipo). Sirven para el
  tono de color y la luz caribeña de las láminas, no para los personajes (el elenco cambió).
- **Nada alegórico ni cursi.** Sin auras, destellos, partículas ni símbolos flotando. La
  margarita es una planta pequeña, no un emblema luminoso.

## 2. Contrato de archivos

Ruta base: `public/assets/`. Nombres en minúsculas, kebab-case, sin espacios ni tildes.

| Tipo | Ruta | Tamaño exacto | Formato | Cómo se usa |
|------|------|---------------|---------|-------------|
| Sprite de personaje | `sprites/<id>.png` | **64×96** (4 columnas × 4 filas de 16×24) | PNG con alfa | Mundo. `<id>` es el campo `sprite` de `content/personajes.json` |
| Retrato | `portraits/<id>-<expresion>.png` | **96×96** | PNG con alfa o fondo | Diálogos y Audiencia. Expresiones: `neutra`, `tensa`, `cordial` |
| Tileset | `tilesets/<region>-<estado>.png` | **64 × (16·N)**, N = 16 filas en el estándar (64 celdas) | PNG con alfa | Mapas. Estados: `ceniza`, `brote`, `verdor`, `floracion`; los cuatro archivos con la misma disposición de celdas |
| Lámina | `illustrations/<id>.png` | **960×540** (se aceptan otras 16:9) | PNG o JPG | Cinemáticas del prólogo y cierres |
| Icono | `icons/<nombre>.png` | 10×12 (documento, folio), 10×9 (hablar), 10×10 (testimonio), 8×10 (alerta), 9×6 (ojo) | PNG con alfa | Marcadores en el mundo |
| Audio | `audio/<nombre>.ogg` | — | OGG (y MP3 opcional) | Música por región en capas y efectos |

### Hoja de personaje (64×96)

```
        col 0      col 1      col 2      col 3
fila 0  down-0     down-1     down-2     down-3      (mirando a la cámara / abajo)
fila 1  left-0     left-1     left-2     left-3      (mirando a la izquierda)
fila 2  right-0    right-1    right-2    right-3     (mirando a la derecha)
fila 3  up-0       up-1       up-2       up-3        (de espaldas / arriba)
```
- Cuadros: 0 quieto · 1 paso con pierna izquierda · 2 quieto · 3 paso con pierna derecha.
  El motor reproduce 0-1-2-3 en bucle a 8 cuadros por segundo.
- Celda de 16×24: el personaje ocupa como máximo 14 px de ancho y 22 de alto; **los pies
  tocan la fila 22 o 23** (borde inferior), centrado horizontalmente. Cabeza de 6-7 px,
  cuerpo de 8 px, piernas de 6-7 px. Sombra opcional de 1 px bajo los pies.
- Fondo transparente. Sin contorno exterior grueso.
- `left` y `right` pueden ser espejo, pero los accesorios asimétricos (morral, bastón) deben
  quedar del mismo lado del cuerpo en ambas vistas.

### Retrato (96×96)

Busto a partir del pecho, tres cuartos ligeramente girado hacia la derecha del espectador,
mirando al espectador. Fondo plano `#2e2d33` o transparente. La expresión cambia solo cejas,
ojos y boca: `neutra` (atención), `tensa` (ceño, boca cerrada), `cordial` (media sonrisa).
Mismo encuadre y misma ropa en las tres.

### Tileset estándar (64 celdas, 4 columnas × 16 filas)

Cada región dibuja las mismas 64 celdas semánticas con su propio material. El índice de cada
celda está en `03-FICHAS-REGIONES.md` §1. Los cuatro estados (`ceniza`, `brote`, `verdor`,
`floracion`) tienen la misma disposición; solo cambia el aspecto (agua en los canales,
verde en la vegetación, flores en los bordes, sin grietas). Las celdas que no apliquen a
una región se dejan transparentes.

## 3. Flujo de trabajo en Antigravity (paso a paso)

1. Abre el repositorio `aequitas` y lee `docs/arte/README.md` y este documento.
2. Ejecuta `npm run assets:scan`. La lista «Faltan» es la cola de trabajo, en orden.
3. Para cada activo, abre su ficha (`02-…` o `03-…`), copia el prompt, genera con Nano
   Banana y guarda la materia prima en `art-src/<tipo>/`.
   - **Sprites**: lo más fiable es generar **cada cuadro por separado** (16 imágenes) y
     dejarlas en `art-src/sprites/<id>/down-0.png … up-3.png`. Genera grande (por ejemplo
     256×384, proporción 2:3) con el personaje centrado y los pies en el borde inferior.
   - **Tilesets**: genera **cada celda por separado** en `art-src/tilesets/<region>-<estado>/`
     con el nombre `NN-descripcion.png` (`NN` = índice 00-63). Cuadradas, por ejemplo 256×256.
     Las celdas que se repiten en mosaico (suelo, agua, muro) deben ser **tileables**: pide
     explícitamente «seamless tile, repeats on all four edges».
   - **Retratos y láminas**: una imagen por archivo.
4. Normaliza. El script reduce, cuantiza y escribe el archivo definitivo:
   ```
   npm run assets:normalize -- --tipo sprite  --id renata --carpeta art-src/sprites/renata
   npm run assets:normalize -- --tipo tileset --id altamar --estado ceniza --filas 16 --carpeta art-src/tilesets/altamar-ceniza
   npm run assets:normalize -- --tipo retrato --id renata --expresion neutra --in art-src/portraits/renata-neutra.png
   npm run assets:normalize -- --tipo lamina  --id ep00-lamina-1 --in art-src/illustrations/ep00-lamina-1.png
   npm run assets:normalize -- --tipo icono   --id hablar --ancho 10 --alto 9 --in art-src/icons/hablar.png
   ```
5. Revisa en `http://localhost:5180/?escena=galeria` (con `npm run dev`) o jugando. Un
   sprite se ve mal casi siempre por dos causas: pies que no tocan el borde inferior, o
   detalles más finos que 1 px que al reducir se vuelven ruido. Vuelve a generar con menos
   detalle o corrige a mano en Aseprite (`File → Open` sobre `public/assets/...png`).
6. Confirma con `git add public/assets art-src && git commit -m "art: <qué>"`. La materia
   prima de `art-src/` se versiona para poder regenerar variantes.

## 4. Reglas de prompt (Nano Banana)

Estructura fija: **[qué es] + [estilo y restricciones] + [composición] + [paleta] + [negativos]**.

Plantilla para un cuadro de sprite:
> Pixel art sprite, single frame, 16-bit SNES style, {personaje: descripción física y ropa
> de la ficha}, {vista: facing the camera | facing left | facing right | seen from behind},
> {pose: standing idle | mid-step walking, left leg forward | mid-step walking, right leg
> forward}, full body, feet touching the bottom edge, centered, 2:3 aspect ratio, flat
> colors, hard pixel edges, no anti-aliasing, no gradients, no outline glow, transparent
> background, limited palette: {hex de la ficha}. No text, no watermark, no background.

Plantilla para una celda de tileset:
> Pixel art top-down tile, 16-bit, {material: cracked grey concrete floor with dry cracks},
> seamless tile that repeats on all four edges, orthographic top-down view, flat colors, hard
> pixel edges, no anti-aliasing, limited palette: {hex}. Square. No text.

Plantilla para un retrato:
> Pixel art portrait bust, 16-bit style, {descripción}, three-quarter view facing slightly
> right, looking at the viewer, {expresión}, plain dark background #2e2d33, flat colors,
> hard pixel edges, no anti-aliasing, limited palette: {hex}. Square. No text.

Plantilla para una lámina:
> Pixel art illustration, 16-bit SNES cutscene, {escena de la ficha}, {hora y luz}, Caribbean
> Colombia, sober and realistic mood, no fantasy glow, wide 16:9 composition, limited palette
> dominated by {colores}, detailed but readable at 960×540. No text, no letters, no logo.

Negativos siempre: `no text, no watermark, no signature, no blur, no gradients, no lens
flare, no glow, no chibi, no anime eyes, no realistic photo`.

## 5. Control de calidad (antes de dar por bueno un activo)

- [ ] El archivo tiene el nombre y el tamaño exactos (`npm run assets:scan` sin ✗).
- [ ] Se ve bien en la galería a escala 2× y 3× (no solo ampliado en el visor).
- [ ] Sprite: pies en el borde inferior en los 16 cuadros; la cabeza no cambia de tamaño entre
      cuadros; el accesorio está en el mismo lado en `left` y `right`.
- [ ] Tileset: suelo, agua y muro repiten sin costura; los cuatro estados coinciden celda a
      celda; nada de flores en `ceniza` ni grietas en `floracion`.
- [ ] Retrato: las tres expresiones tienen el mismo encuadre y ropa.
- [ ] Lámina: sin texto incrustado; la composición deja libre el tercio inferior para el
      subtítulo del juego.
- [ ] Paleta: ningún color fuera de los 32 (el normalizador lo garantiza; revisa que no haya
      «manchas» por la cuantización).
