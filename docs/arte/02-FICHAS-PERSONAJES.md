# 02 · Fichas de personajes (sprites y retratos)

Cada ficha da lo que el generador necesita: descripción física estable, ropa, colores de la
paleta, accesorio que define la silueta y notas de actitud para el retrato. Los ids son los
de `content/personajes.json`. Reglas comunes en `01-GUIA-NANO-BANANA.md`.

Regla de silueta: a 16 px cada personaje se reconoce por **una** cosa (un morral, un pañuelo,
unas gafas, un sombrero, una túnica). No sumar más de dos accesorios.

---

## Elenco principal

### `renata` — Renata Iriarte, 24, protagonista
- **Cuerpo:** estatura media, delgada, postura recta, barbilla un poco alta.
- **Piel:** `#c98e5e`. **Pelo:** negro `#1b1b1f`, recogido en un moño bajo; un mechón suelto.
- **Ropa:** camisa violeta de la Biblioteca `#5a3f86` con cuello claro `#f3ead8`, pantalón
  gris oscuro `#2e2d33`, botas de trabajo `#7a4b2d`.
- **Silueta:** morral de cuero cruzado `#b5773f` con hebilla dorada `#e2b94a` (siempre a su
  derecha, es decir, a la izquierda del espectador cuando mira a cámara).
- **Actitud:** atenta, impaciente; en `tensa` frunce el ceño sin abrir la boca; en `cordial`
  media sonrisa de lado.
- **Objeto narrativo (solo retratos y láminas):** un anillo de sello partido, colgado del cuello.
- Prompt de sprite (cuadro `down-0`): «young Colombian Caribbean woman, medium brown skin, black
  hair in a low bun with one loose strand, purple shirt #5a3f86 with cream collar, dark grey
  trousers, brown boots, leather satchel across the chest with a small gold buckle».

### `pilar` — Pilar, 43, lideresa comunal de Altamar (se une en el Ep. 1)
- **Cuerpo:** baja y fuerte, hombros anchos, brazos cruzados con frecuencia.
- **Piel:** `#8a5a3a`. **Pelo:** negro, largo y rizado, recogido bajo un pañuelo.
- **Ropa:** pañuelo en la cabeza dorado apagado `#b8892e`, camiseta azul verdosa `#1e6f7a`,
  falda o pantalón de trabajo `#7a4b2d`, sandalias.
- **Silueta:** el pañuelo. Nada más.
- **Actitud:** rápida, concreta; mira de frente; `tensa` = mandíbula apretada; `cordial` = ceja
  levantada con media sonrisa.

### `prudencio` — Prudencio, 31, escribano falsificador (se une en el Ep. 2)
- **Cuerpo:** alto, delgado, un poco encorvado; manos largas.
- **Piel:** `#f1c9a5`. **Pelo:** castaño `#5a3a26`, corto, peinado hacia atrás.
- **Ropa:** camisa clara de manga larga `#eadfc6` remangada, chaleco gris `#4a4850`,
  pantalón gris `#2e2d33`.
- **Silueta:** gafas redondas oscuras `#1b1b1f` y una pluma o lápiz tras la oreja.
- **Actitud:** irónica, evasiva; `tensa` = mira hacia abajo; `cordial` = sonrisa torcida.

### `gerineldo` — Gerineldo, 71, magistrado retirado (se une en el Ep. 3)
- **Cuerpo:** corpulento, espalda ancha, lento.
- **Piel:** `#8a5a3a`. **Pelo:** blanco `#a29ea8` bajo un sombrero de paja `#d9a66b` de ala corta.
- **Ropa:** guayabera gris `#6f6c76` abierta sobre camiseta, pantalón oscuro remangado,
  descalzo o con sandalias (vive de pescar).
- **Silueta:** el sombrero de paja. En retrato, bigote blanco.
- **Actitud:** seco; `tensa` = ojos entrecerrados; `cordial` = casi imperceptible.

### `clemencia` — Clemencia Vidal, 64, rectora de la Biblioteca
- **Cuerpo:** delgada, muy recta, gestos pequeños.
- **Piel:** `#c98e5e`. **Pelo:** gris `#cfc2a3`, recogido tirante.
- **Ropa:** túnica larga violeta oscuro `#3b2a5c` con ribete dorado `#e2b94a` en el cuello
  (la única prenda «institucional» del juego), zapatos cerrados.
- **Silueta:** gafas de media luna `#e2b94a` y la túnica larga.
- **Actitud:** cálida y agotada; `tensa` = labios apretados, mirada baja; `cordial` = sonrisa
  contenida.

### `nepomuceno` — Nepomuceno, 58, botánico
- **Cuerpo:** medio, algo grueso, manos grandes.
- **Piel:** `#c98e5e`. **Pelo:** calvo con barba corta gris `#6f6c76`.
- **Ropa:** camisa verde oscuro `#2f5d3a` con bolsillos, pantalón caqui `#b5773f`, botas de
  caucho `#1b1b1f`.
- **Silueta:** la barba y un canasto de mimbre `#d9a66b` al costado (solo `left`/`right`).
- **Actitud:** paciente; `cordial` = sonrisa amplia.

### `casimiro` — Casimiro, 35, jurista de la primera cohorte
- **Cuerpo:** medio, atlético, muy pulcro.
- **Piel:** `#f1c9a5`. **Pelo:** negro `#1b1b1f`, corto y perfecto.
- **Ropa:** túnica corta lila `#8f6fc0` sobre camisa blanca `#f3ead8`, pantalón oscuro.
- **Silueta:** la túnica lila (más clara que la de Clemencia) y un rollo de papel en la mano.
- **Actitud:** seguro; `tensa` = sonrisa forzada.

### `moscote` — Evaristo Moscote, «el Registrador», 58 (aparece desde el Ep. 5)
- **Cuerpo:** medio, estrecho de hombros, muy erguido; movimientos lentos y exactos.
- **Piel:** `#f1c9a5`. **Pelo:** gris `#a29ea8`, corto, con raya.
- **Ropa:** saco gris oscuro `#2e2d33` abotonado, camisa clara, corbata delgada `#1b1b1f`.
  Un sello de mango de madera `#7a4b2d` en la mano derecha.
- **Silueta:** el saco (único personaje con saco) y el sello.
- **Actitud:** cortés, burocrática; nunca sonríe con los ojos. `cordial` = sonrisa mínima.

### `petra` — Petra Iriarte (solo retratos y láminas; no tiene sprite)
- 40 años en el recuerdo. Parecido evidente con Renata: mismo moño, misma barbilla. Blusa
  blanca `#f3ead8`, chaleco de la Oficina de Registro gris `#4a4850`. Un anillo de sello
  completo en el dedo índice.

---

## Sistema y genéricos

### `alguacil` — alguaciles de la Oficina (varios)
- Gorra gris con visera `#4a4850` y ribete dorado `#b8892e`, camisa gris `#6f6c76`, pantalón
  oscuro, bastón corto de madera `#7a4b2d`. Sin armas de fuego. Rangos: `alguacil` (gorra),
  `alguacil-mayor` (gorra + brazalete dorado), `capitan` (gorra + saco corto).
- Generar tres variantes: `alguacil`, `alguacil-mayor`, `capitan` (ids de sprite).

### `estudiante` — estudiantes de la Escuela (genérico, dos variantes)
- Camisa turquesa `#2bb5b8`, pantalón gris, cuaderno bajo el brazo. Variante 2: camisa
  `#8fe0de`. Ids: `estudiante`, `estudiante-2`.

### `vecino` — vecinos genéricos (seis variantes)
- Ropa de diario en tonos tierra y agua, sin accesorios. Ids: `vecino-1` … `vecino-6`
  (dos mujeres, dos hombres, una persona mayor, un joven). Pieles variadas entre los cuatro
  tonos de la paleta.

---

## Episodio 1 · Altamar

### `marrugo` — Fulgencio Marrugo, 50, administrador de Altamar
- Grueso, calvo con pelo a los lados `#4a4850`, camisa blanca sudada `#eadfc6` con el cuello
  abierto, llaves en el cinturón (silueta: el manojo de llaves `#e2b94a`), pantalón oscuro.
  Actitud: cansado y ofendido; `tensa` = ceño y sudor; `cordial` = sonrisa de vendedor.

### `tomas` — Tomás, 12, hijo de Pilar
- Pequeño (sprite de 14 px de alto dentro de la celda de 24), piel `#8a5a3a`, pelo rizado
  negro, camiseta amarilla desteñida `#f4dc8a`, pantalón corto `#4a4850`, descalzo.
  Silueta: la camiseta clara y la estatura.

### `zoraida` — Zoraida, 60, partera
- Baja, robusta, pelo gris recogido, vestido azul verdoso `#1e6f7a` con delantal claro
  `#f3ead8`, una libreta en el delantal (silueta: el delantal).

### `vigilante` — vigilantes de Marrugo (dos variantes: `vigilante`, `vigilante-2`)
- Como los alguaciles pero sin gorra: chaleco gris `#4a4850` con una franja dorada, linterna.

### Vecinos de Altamar
- Reutilizar `vecino-1` … `vecino-6`.

---

## Prólogo · Ciénaga de Bellium

- `renata`, `clemencia`, `nepomuceno`, `casimiro`, `estudiante`, `estudiante-2`.
- `eladio` — pescador de la ciénaga, 45: camisa sin mangas `#d9a66b`, sombrero de tela,
  piel `#8a5a3a`, una canoa cerca (la canoa es tile, no sprite).

---

## Orden de producción y verificación

1. `renata` completa (16 cuadros + 3 retratos). Es la referencia de proporción: todos los
   demás se generan «in the same style and proportions as the reference sprite» adjuntando
   `public/assets/sprites/renata.png` ampliado 8× como imagen de referencia.
2. Personajes del prólogo y del Episodio 1, en el orden del `README.md`.
3. Verificar cada uno en la galería y caminando en el juego (`npm run dev`, Enter, WASD).
