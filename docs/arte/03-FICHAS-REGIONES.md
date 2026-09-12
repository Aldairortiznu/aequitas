# 03 · Regiones: índice del tileset estándar y fichas por región

## 1. Índice semántico del tileset (64 celdas, 4 columnas × 16 filas)

Todas las regiones dibujan **las mismas 64 celdas** con su propio material. Un mapa hecho
para una región funciona con el tileset de cualquier otra. El índice `NN` es el nombre de
archivo de la pieza en `art-src/tilesets/<region>-<estado>/NN-descripcion.png`.

Marcas: **[T]** tileable (repite en mosaico) · **[E]** cambia con el estado · **[C]** con colisión.

| NN | Celda | Notas |
|----|-------|-------|
| 00 | suelo base | [T][E] hierba / arena / cemento según región; en `floracion` con puntos de flor en los bordes |
| 01 | suelo variante | [T][E] misma base con más textura |
| 02 | suelo detalle | [E] grieta en `ceniza`/`brote`; brotes en `verdor`; margarita pequeña en `floracion` |
| 03 | camino | [T] tierra pisada, adoquín o tablón según región |
| 04 | camino borde izquierdo | transición camino → suelo |
| 05 | camino borde derecho | transición |
| 06 | agua | [T][E] turbia en `ceniza`, clara en `verdor`; [C] |
| 07 | orilla | agua arriba, suelo abajo |
| 08 | muro | [T][C] ladrillo, cemento, madera o mangle según región |
| 09 | remate de muro | borde superior del muro (se ve la parte alta) |
| 10 | esquina de muro | |
| 11 | puerta | sin colisión; el motor la usa como umbral |
| 12 | piso interior | [T] baldosa o tabla |
| 13 | piso interior variante | [T] |
| 14 | alfombra / estera | [T] |
| 15 | escalera | tramo de escalera vista desde arriba |
| 16 | arbusto | [C][E] seco en `ceniza`, verde después |
| 17 | copa de árbol (izquierda) | [C] la copa ocupa dos celdas: 17 y 18; el tronco es 19 |
| 18 | copa de árbol (derecha) | [C] |
| 19 | tronco / palmera | [C] |
| 20 | mesa | [C] |
| 21 | silla | |
| 22 | atril | [C] atril de madera con un libro abierto |
| 23 | estante | [C] con libros o carpetas |
| 24 | banca / cama | [C] |
| 25 | barril / tanque | [C] |
| 26 | cerca | [C] madera o alambre |
| 27 | poste / farol | [C] |
| 28 | canal | [T][E] seco (grietas) en `ceniza`/`brote`; con agua en `verdor`/`floracion` |
| 29 | válvula / compuerta | [C] rueda de válvula o tabla de compuerta |
| 30 | tubería | [T] |
| 31 | tanque de agua | [C] tanque elevado o cisterna |
| 32 | ventana | sobre muro |
| 33 | balcón | sobre muro |
| 34 | reja | [C] |
| 35 | escombro | [C][E] montón de escombro; en `floracion` cubierto de enredadera |
| 36 | panel solar | [C] viejo, con una placa rota |
| 37 | enredadera | [E] sobre muro; más frondosa en `verdor` |
| 38 | maceta / huerta | [E] tierra en `ceniza`, brotes en `brote`, mata en `verdor`, flor en `floracion` |
| 39 | margarita de Bellium | solo dibujada en `floracion`; transparente en los demás estados |
| 40 | muelle | [T] tablones sobre agua |
| 41 | borde de muelle | |
| 42 | canoa | [C] |
| 43 | red / nasa | |
| 44 | aviso / cartel | [C] tablero con papel pegado (sin texto legible) |
| 45 | marcador de fila | pintura en el suelo que marca dónde hacer fila |
| 46 | muro de carnés | [C] tablero con tarjetas colgadas (Altamar) |
| 47 | piscina seca | [T][E] fondo de piscina agrietado; en `verdor` sembrado |
| 48-63 | reservado por región | ver fichas; se dejan transparentes si no aplican |

## 2. Estados del mundo (Reverdecer)

| Estado | Qué cambia visualmente |
|--------|------------------------|
| `ceniza` | Suelo gris con grietas, agua turbia, arbustos secos, canales secos, escombros a la vista, huertas vacías |
| `brote` | Parches de tierra y algún brote; el agua sigue turbia; grietas |
| `verdor` | Suelo verde o limpio, agua clara, canales con agua, arbustos verdes, huertas con matas, sin grietas |
| `floracion` | Igual que verdor con margaritas discretas en `02`, `38`, `39` y bordes de `00`; enredaderas sobre el escombro |

## 3. Fichas de región (primer lanzamiento en detalle)

### `cienaga` — Ciénaga de Bellium (Prólogo y Episodio 8)

- **Materiales:** mangle, tablones grises, agua verde oscura, paneles solares en los techos,
  concreto de la vieja estación de investigación, tanques de agua, herbario con mesas largas.
- **Luz:** amanecer; sombras largas y frías.
- **Estado inicial:** `floracion` (la ciénaga es la referencia de a dónde puede llegar el
  resto). Generar los cuatro estados de todos modos.
- **Celdas específicas (48-63):** 48 mesa de herbario con plantas, 49 tanque de cría, 50
  panel de corcho con hojas, 51 raíz de mangle [C], 52 tablón roto, 53 lámpara solar, 54
  silla de laboratorio, 55 caja de archivo, 56 vitrina de herbario [C], 57 muelle con
  escalera, 58 boya, 59 cartel de la estación, 60-63 libres.
- **Prompt de material (para 00):** «top-down seamless tile, mossy grey concrete slab of an
  old research station in a mangrove swamp, damp, small green specks, 16-bit pixel art».

### `altamar` — Conjunto Altamar (Episodio 1)

- **Materiales:** cemento gris de torres a medio construir, varillas oxidadas, baldosa
  blanca de lobby rota, piscina vacía agrietada, escaleras, pasillos con puertas numeradas,
  playa gris al fondo, un muro de carnés en el lobby, filas pintadas en el piso.
- **Luz:** mediodía duro, sin sombra; en `verdor` se abren toldos y aparece ropa tendida.
- **Estado inicial:** `ceniza`.
- **Celdas específicas (48-63):** 48 baldosa de lobby [T], 49 baldosa rota, 50 mostrador de
  administración [C], 51 puerta de apartamento con número (sin dígito legible), 52 pasillo
  con barandilla, 53 escalera de emergencia, 54 varilla oxidada [C], 55 toldo (solo
  `verdor`/`floracion`), 56 ropa tendida (solo `verdor`/`floracion`), 57 candado en válvula,
  58 borde de piscina [T], 59 escalera de piscina, 60 tanque de reserva del ático, 61
  ascensor muerto [C], 62 carné suelto (decorado), 63 libre.
- **Mapas del episodio:** lobby y pisos (la torre se recorre por plantas apiladas en un solo
  mapa alto), sótanos, ático, piscina (anfiteatro de la Audiencia).
- **Prompt de material (para 00):** «top-down seamless tile, cracked grey concrete floor of
  an unfinished beach tower, dust, dry cracks, 16-bit pixel art, flat colors».
- **Prompt (para 47, piscina seca):** «top-down seamless tile, empty swimming pool floor,
  pale blue tiles with cracks and dirt, 16-bit pixel art».

## 4. Fichas breves del resto de regiones (se detallan en su fase)

| Región | Materiales | Acento de color | Celdas específicas previstas |
|--------|-----------|-----------------|-----------------------------|
| `tres-bocas` | Palafitos, muelles de tabla, mercado flotante, barcazas, cuerdas | Madera `#b5773f` y agua verde `#1e6f7a` | Puesto de mercado, saco de pescado, poste de amarre, casa de empeño |
| `sinuaco` | Terrazas de cultivo, canal de riego con compuertas, embalse, ranchos de tabla | Tierras y verdes | Terraza escalonada, compuerta, estaca de agrimensor, guanábano, piedra grabada |
| `salinas` | Charcas de sal blancas, mar rosado, capilla encalada, guarnición de bloque | Rosa `#e69ab8` y blanco `#f3ead8` | Montículo de sal, rastrillo, banco de capilla, reja de guarnición, cruz sencilla |
| `bellavista` | Palma de aceite en hileras, molino, barracas de zinc, tienda de raya | Verde oscuro y óxido | Palma en hilera, engranaje del molino, mostrador de tienda con fichas, catre, cerca alta |
| `puerto-baluarte` | Ladrillo colonial, muralla, balcones de madera, agua en las calles bajas, bóveda | Ladrillo `#7a4b2d` y dorado | Ventanilla de la Oficina, fila con cadena, archivador, bóveda con dial, presa |

## 5. Verificación de un tileset

1. `npm run assets:normalize -- --tipo tileset --id altamar --estado ceniza --filas 16 --carpeta art-src/tilesets/altamar-ceniza`
2. Repetir para `brote`, `verdor`, `floracion` (mismas celdas, distinto aspecto).
3. `npm run dev` → `?escena=galeria`: los cuatro estados aparecen en fila; comprobar que las
   celdas coinciden entre estados y que 00, 06, 08, 12, 28, 40 y 47 repiten sin costura.
4. Jugar el episodio de la región y cambiar de estado con un pacto (o desde la consola:
   `__aequitas.session.bus.emit('world:setMapState', { map: 'plaza', state: 'verdor' })`).
