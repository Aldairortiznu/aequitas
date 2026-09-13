# 01 · Guía técnica: contrato, flujo de trabajo y control de calidad

## 1. Estilo (léelo antes de generar nada)

El juego tiene **dos registros visuales** y no se mezclan:

| Registro | Activos                             | Estilo                                                                                                       |
| -------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Mundo    | sprites, tilesets, iconos, retratos | Pixel art 16-bit sobrio, paleta cerrada, píxel exacto                                                        |
| Cine     | láminas (`illustrations/`)          | Ilustración pintada 16:9, acabado limpio, misma luz y paleta de referencia; ver `04-LAMINAS-UI-ICONOS.md` §1 |

- **Pixel art 16-bit sobrio.** Formas legibles a 16 px, sin degradados, sin desenfoque, sin
  anti-aliasing. Contorno oscuro de 1 px solo donde separa figura de fondo. Sombreado por
  bloques de dos o tres tonos, no por texturas.
- **Caribe verosímil.** Mangle, palma, sal, ladrillo colonial, cemento agrietado, zinc,
  balcones de madera, paneles solares viejos. Nada de fantasía medieval ni «cyber».
- **Paleta cerrada (32 colores).** Toda pieza se cuantiza a esta paleta al normalizarse; si
  el generador usa otros colores, se aproximan al más cercano. Genera ya con estos tonos.

| Grupo                      | Hex                                               |
| -------------------------- | ------------------------------------------------- |
| Ceniza (neutros fríos)     | `#1b1b1f` `#2e2d33` `#4a4850` `#6f6c76` `#a29ea8` |
| Bellium (violetas)         | `#3b2a5c` `#5a3f86` `#8f6fc0`                     |
| Dorado (sellos, margarita) | `#b8892e` `#e2b94a` `#f4dc8a`                     |
| Verdes (brote a floración) | `#2f5d3a` `#4a8a4f` `#7cc46b` `#b9e39a`           |
| Aguas                      | `#1e6f7a` `#2bb5b8` `#8fe0de`                     |
| Tierras y madera           | `#7a4b2d` `#b5773f` `#d9a66b`                     |
| Sal y mar rosado           | `#f2c9d6` `#e69ab8`                               |
| Piel (cuatro tonos)        | `#f1c9a5` `#c98e5e` `#8a5a3a` `#5a3a26`           |
| Papel                      | `#f3ead8` `#eadfc6` `#cfc2a3`                     |
| Absolutos                  | `#ffffff` `#000000`                               |

- **Referencias visuales** en `art-src/referencias/` (láminas del prototipo). Sirven para el
  tono de color y la luz caribeña de las láminas, no para los personajes (el elenco cambió).
- **Nada alegórico ni cursi.** Sin auras, destellos, partículas ni símbolos flotando. La
  margarita es una planta pequeña, no un emblema luminoso.

## 2. Contrato de archivos

Ruta base: `public/assets/`. Nombres en minúsculas, kebab-case, sin espacios ni tildes.

| Tipo                | Ruta                             | Tamaño exacto                                                                         | Formato              | Cómo se usa                                                                                                      |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Sprite de personaje | `sprites/<id>.png`               | **64×96** (4 columnas × 4 filas de 16×24)                                             | PNG con alfa         | Mundo. `<id>` es el campo `sprite` de `content/personajes.json`                                                  |
| Retrato             | `portraits/<id>-<expresion>.png` | **96×96**                                                                             | PNG con alfa o fondo | Diálogos y Audiencia. Expresiones: `neutra`, `tensa`, `cordial`                                                  |
| Tileset             | `tilesets/<region>-<estado>.png` | **64 × (16·N)**, N = 16 filas en el estándar (64 celdas)                              | PNG con alfa         | Mapas. Estados: `ceniza`, `brote`, `verdor`, `floracion`; los cuatro archivos con la misma disposición de celdas |
| Lámina              | `illustrations/<id>.png`         | **1920×1080** (se acepta 960×540; siempre 16:9)                                       | PNG o JPG (< 700 KB) | Cinemáticas y escenas clave de diálogo (nodo con `lamina`)                                                       |
| Icono               | `icons/<nombre>.png`             | 10×12 (documento, folio), 10×9 (hablar), 10×10 (testimonio), 8×10 (alerta), 9×6 (ojo) | PNG con alfa         | Marcadores en el mundo                                                                                           |
| Audio               | `audio/<nombre>.ogg`             | —                                                                                     | OGG (y MP3 opcional) | Música por región en capas y efectos                                                                             |

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

### Qué hace el normalizador con las piezas de un sprite

`npm run assets:normalize -- --tipo sprite --id <id> --carpeta art-src/sprites/<id>/`:

1. Quita el fondo falso de cada pieza (tablero o color plano conectado con el borde).
2. Recorta cada pieza a su silueta y calcula **un factor de escala común** para las dieciséis,
   de modo que la más alta mida 22 px (o la más ancha 14): las proporciones no cambian entre
   cuadros.
3. Si la pieza viene a un múltiplo entero de 16×24 reduce con vecino más cercano; si no, con
   promedio de área (peor: el dibujo se emborrona). Por eso conviene generar a 128×192.
4. Apoya los pies en la fila 23, centra, cuantiza a la paleta y ensambla la hoja de 64×96.

## 4. Reglas de prompt (Nano Banana)

Estructura fija: **[qué es] + [estilo y restricciones] + [composición] + [paleta] + [negativos]**.

### Cuadros de sprite: lo que aprendimos en el Bloque A

Lo que **no** sirve: una ilustración de 800×1200 con píxeles diminutos y un tablero de ajedrez
pintado como «transparencia». Al reducirla a 16×24 se pierde el dibujo, cada cuadro sale de un
tamaño distinto y el tablero queda horneado como un rectángulo crema alrededor del personaje.

Lo que sí sirve: pedir **el sprite ya en su rejilla**, dibujado en grande.

- Tamaño de salida **128×192** (rejilla de 16×24 con píxeles de 8×8) o 256×384 (píxeles de
  16×16). El normalizador detecta el múltiplo entero y reduce con vecino más cercano: cada bloque
  se convierte en un píxel limpio. Si el generador no puede producir un tamaño tan pequeño
  (Nano Banana entrega 848×1264), pide igualmente **píxeles gruesos**: «extremely low
  resolution pixel art, only 16 by 24 visible pixels, each pixel a large flat square, no
  fine detail». Con detalle fino (ojos de dos píxeles reales, costuras) la reducción
  emborrona la cara; con bloques gruesos sale limpia. La segunda versión de Renata quedó a
  medio camino: se aprueba como base, pero la versión final se hace con bloques gruesos.
- Fondo **plano y de un solo color fuera de la paleta**: magenta `#ff00ff`. Nada de tablero de
  ajedrez, nada de sombras proyectadas sobre el fondo. El normalizador lo quita por inundación
  desde los bordes (`--fondo auto`, activo por defecto en sprites y retratos).
- **Un solo personaje por imagen**, silueta de 12-14 bloques de ancho y 20-22 de alto, pies en
  la fila inferior, centrado. Sin texto, sin marca de agua, sin rejilla dibujada.
- Genera primero `down-0` y apruébalo. Todos los demás cuadros se piden **adjuntando ese
  `down-0`** como referencia («same character, same pixel grid, same proportions and colors»)
  y cambiando solo la vista y la pose. Así los dieciséis cuadros salen del mismo tamaño.
- Vistas: `down` mira a cámara; `left`/`right` de perfil (el morral cruzado queda del mismo
  lado del cuerpo en ambas); `up` es **de espaldas**: se ve el moño y la espalda, ninguna cara.
  Nunca se clona `down` como `up`.
- Ciclo de andar: 0 quieto, 1 paso con pierna izquierda adelante, 2 quieto (puede ser copia del
  0), 3 paso con pierna derecha adelante. Los brazos se balancean al contrario de las piernas.

Plantilla para un cuadro de sprite:

> Pixel art game sprite on a strict 16 by 24 pixel grid, rendered at 128×192 with crisp 8×8
> pixel blocks, 16-bit SNES style, {personaje: descripción física y ropa de la ficha},
> {vista: facing the camera | facing left | facing right | seen from behind (back of the head,
> no face)}, {pose: standing idle | mid-step walking, left leg forward, right arm forward |
> mid-step walking, right leg forward, left arm forward}, full body, feet on the bottom row,
> centered, flat colors, hard pixel edges, no anti-aliasing, no gradients, no outline glow,
> solid flat magenta background #ff00ff, no checkerboard, no shadow on the ground, limited
> palette: {hex de la ficha}. No text, no watermark. {Adjuntar down-0 aprobado: same
> character, same pixel grid, same proportions and colors as the reference.}

Plantilla para una celda de tileset:

> Pixel art top-down tile, 16-bit, {material: cracked grey concrete floor with dry cracks},
> seamless tile that repeats on all four edges, orthographic top-down view, flat colors, hard
> pixel edges, no anti-aliasing, limited palette: {hex}. Square. No text.

Plantilla para un retrato (los de Renata y Pilar salieron bien con esta receta: 1024×1024,
tres expresiones en la misma sesión, el `neutra` aprobado como referencia de las otras dos).
El retrato se muestra sobre un recuadro oscuro `#2e2d33`, así que **el fondo oscuro forma
parte del retrato**: no hace falta clave ni recorte, y el pelo suelto no deja halo. El
normalizador solo quita fondos magenta o verde; un fondo oscuro lo conserva.

> Pixel art portrait bust, 16-bit style, {descripción}, three-quarter view facing slightly
> right, looking at the viewer, {expresión}, head and shoulders with air above the hair,
> plain dark background #2e2d33, flat colors, hard pixel edges, no anti-aliasing, limited
> palette: {hex}. Square. No text.

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
