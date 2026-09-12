# 08 · Dirección de arte y audio

## 1. Principios

1. **Retro 16-bit contenido.** Píxel limpio, sin filtros, sin partículas de brillo.
   La belleza está en la paleta y en la luz, no en efectos.
2. **Caribe verosímil.** Mangle, palma, sal, ladrillo, cemento agrietado, zinc,
   balcones coloniales. Nada de fantasía.
3. **El mundo cambia por causas visibles.** Los cuatro estados de una región muestran
   agua, cultivos y gente, no destellos.
4. **Legibilidad primero.** El texto vive en DOM con tipografías de alta legibilidad;
   el píxel es para el mundo.

## 2. Resolución y escala

- Mundo: 480×270 lógicos, escala entera al tamaño de la ventana (2× a 4×), letterbox
  neutro.
- UI DOM: resolución nativa del dispositivo; tamaño base de texto 16 px, escalable a
  160 %.
- Retratos: 96×96 píxeles, 3 expresiones (neutra, tensa, cordial).
- Personajes: 16×24 píxeles, 4 direcciones, ciclos de caminar (4 cuadros) e idle (2).
- Tiles: 16×16. Láminas de cinemática: 960×540, pintadas o generadas y limpiadas en
  el estilo de las cinco del prólogo.

## 3. Paleta base (24 colores)

| Uso | Colores (hex) |
|-----|---------------|
| Neutros de ceniza | #1b1b1f, #2e2d33, #4a4850, #6f6c76, #a29ea8 |
| Bellium (Biblioteca, UI) | #3b2a5c, #5a3f86, #8f6fc0 |
| Dorado (sellos, margarita, acentos) | #b8892e, #e2b94a, #f4dc8a |
| Verdes (brote → floración) | #2f5d3a, #4a8a4f, #7cc46b, #b9e39a |
| Aguas | #1e6f7a, #2bb5b8, #8fe0de |
| Tierras y ladrillo | #7a4b2d, #b5773f, #d9a66b |
| Sal y mar rosado (Salinas) | #f2c9d6, #e69ab8 |
| Piel (rango) | #f1c9a5, #c98e5e, #8a5a3a, #5a3a26 |

Regla: cada región usa la paleta completa pero con un acento propio (Altamar:
cemento y turquesa; Tres Bocas: madera y agua verde; Sinuaco: tierras y verdes; Salinas:
rosa y blanco; Bellavista: verde oscuro y óxido; Puerto Baluarte: ladrillo y dorado).

## 4. Estados de tileset

Cada región tiene un tileset con cuatro columnas de variantes por tile y una capa de
decorados por estado.

| Estado | Suelo | Agua | Vegetación | Gente y objetos |
|--------|-------|------|------------|-----------------|
| Ceniza | Gris, grietas, basura | Canales secos, tanques vacíos | Palmas secas, troncos | Filas, candados, avisos de la Oficina |
| Brote | Gris con parches de tierra | Agua en canales principales | Brotes, huertas pequeñas | Menos filas, puertas abiertas |
| Verdor | Tierra y caminos limpios | Agua en todos los canales | Cultivos, sombra | Mercado, escuela abierta |
| Floración | Igual que verdor | Igual | Cultivos maduros; margaritas en los bordes de los cultivos, discretas | Gente sentada, niños, ropa tendida |

Presupuesto: un tileset por región (≈ 200 tiles × 4 estados), una semana de trabajo
por región para un pixel artist; con generación asistida, tres días más limpieza.

## 5. Interfaz

- Estética de papel y tinta: fondos crema (#f3ead8) con bordes de una línea, sellos en
  dorado apagado para hitos, tipografía de alta legibilidad (Atkinson Hyperlegible o
  similar) con opción de fuente de píxel.
- Medidores con icono y patrón además de color: Posición (balanza inclinada),
  Tensión (línea de temblor), Credibilidad (tres marcas de sello).
- Audiencia: adversario a la derecha con retrato y gesto; afirmación al centro;
  acciones abajo; Zurrón y Códice como cajones laterales.
- Pacto: dos columnas de partes (pide / necesita) arriba; puntos como fichas; acta
  como documento desplegable.

## 6. Audio

- **Música.** Chiptune con base rítmica caribeña (cumbia, bullerengue, porro) y
  timbres de gaita y tambora emulados. Sin voces. Tempo bajo en exploración, medio en
  Audiencia, lento en Pacto.
- **Capas por región.** Cada pista tiene tres capas (base, ritmo, melodía) que entran
  con los hitos de Legitimidad.
- **Motivos.** Un motivo para la Biblioteca (arpegio ascendente de cuatro notas), uno
  para la Oficina (ritmo seco de sello, dos golpes), uno para el Pacto (el motivo de la
  Biblioteca en tempo lento). No hay tema de «villano».
- **Efectos.** 25 base (pasos por superficie, papel, sello, agua, puerta, válvula,
  contradicción plena/parcial/fallida, firma, hito) más 5 por episodio.
- **Formato.** OGG y MP3, bucles de 60-90 s, ≤ 400 KB por capa.

## 7. Pipeline

1. Bocetos de región (una imagen) → aprobación de Dirección.
2. Tileset estado ceniza → estados restantes por paleta y decorados.
3. Personajes: hoja base de Renata como referencia de proporción; los demás derivan.
4. Exportación: Aseprite → PNG + JSON en `public/assets/sprites/<id>/`; Tiled →
   `content/epXX/maps/`.
5. Integración por Opus con el episodio de prueba; corrección de nombres y pesos.

## 8. Presupuesto de activos por episodio (típico)

| Activo | Cantidad |
|--------|----------|
| Mapas Tiled | 3-5 |
| Tileset con 4 estados | 1 |
| Personajes nuevos | 8-14 |
| Retratos con 3 expresiones | 5-7 |
| Láminas | 1-2 |
| Pistas de música (con capas) | 2 |
| Efectos nuevos | 5 |
