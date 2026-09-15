# 12 · Estética del arte construido: tres direcciones para decidir

Petición de Dirección (15 de septiembre de 2026): trabajar una nueva estética, revisar cómo
mejorar la jugabilidad, generar versiones alternativas para decidir, priorizar el arte
construido por código como en el prototipo (Reverdecer), y que el juego pueda volverse un
referente.

## 1. Qué se construyó

El arte por código deja de ser un relleno de rectángulos y pasa a ser una **capa base con
dirección**: todo lo que no tenga arte real se dibuja con las mismas reglas, y cuando llega
un activo real (Antigravity) lo reemplaza sin tocar código, porque el contrato de
`docs/arte` no cambia.

| Pieza | Qué hace | Dónde |
|-------|----------|-------|
| Sistema de estilos | Una dirección estética fija contorno, proporción, tonos de sombreado, textura de tiles, luz por estado del mapa, partículas y posproceso. Se elige con `?estilo=<id>` para comparar; la decisión D14 fija el valor por defecto. | `src/engine/art/estilo.ts`, `src/main.ts` |
| Figura v2 | Personajes de 16×24 con sombra en el suelo, piernas que alternan, zancada en perfil, brazos que balancean al contrario, cabeza según proporción, ocho peinados, seis prendas, accesorios (morral, canasto, bastón, llaves, libreta, pañuelo, sombrero, gorra, gafas, barba) y contorno. | `src/engine/art/figura.ts`, `provisional.ts` |
| Tiles con textura y acabado | Muros por hiladas con juntas, losas de piso con junta, agua con oleaje, vetas en tierra, techos de zinc; pasada final de luz arriba y sombra abajo en muros, contorno y sombra proyectada en decorados. | `src/engine/art/tilesetProvisional.ts` |
| Escena | Tinte de luz por estado (ceniza, brote, verdor, floración), viñeta suave, partículas ambientales (luciérnagas en ciénaga y gimnasio, polvo en Altamar). | `src/engine/world/WorldScene.ts` |
| Audiencia como combate (E14) | Adversario arriba a la derecha con retrato y medidores, afirmación en tarjeta, quien juega abajo a la izquierda con su credibilidad, cuatro movimientos en rejilla 2×2 con tecla, registro de la sala a la derecha. Mismo reductor. | `src/ui/AudienciaView.tsx`, `styles/audiencia.css` |
| Densidad de mapas | Lobby de Altamar y estación del prólogo con columnas, bancas, barriles, cercas, arbustos, ropa tendida, canoa, red, letreros y techos. | `scripts/maps/ep01.ts`, `ep00.ts` |
| Capturas y comparación | Sondas que capturan galería, lobby, torre, piscina, audiencia y estación con cada estilo y componen las comparaciones. | `scripts/dev/shot-estilos.mjs`, `componer-estilos.mjs` |

## 2. Las tres direcciones

Las tres comparten paleta (08 §3), contrato de activos y contenido. Cambian el dibujo.

### A · Esmeralda

GBA clásico: contorno negro, personajes cabezones (2,5 cabezas), dos tonos, tiles planos y
limpios, sin luz de escena ni partículas. Es la referencia de Dirección (*Pokémon
Esmeralda*) tomada al pie de la letra.

- A favor: máxima legibilidad en pantallas pequeñas; el más barato de mantener; el que más
  se parece a lo que la gente reconoce como «juego de GBA».
- En contra: es un estilo muy visto; el cabezón le quita gravedad a un juego de abogados y
  choca con la proporción natural de los sprites reales que ya entregó Antigravity (Renata,
  Marrugo), que se verían de otra familia.

### B · Litoral (recomendado)

16-bit sobrio: proporción natural (3,5 cabezas), contorno del propio material (oscuro, no
negro), tres tonos, tiles con textura, luz de tarde que cambia con el estado de la región,
luciérnagas y polvo discretos. Es la traducción visual del tono del juego (D6): serio,
caribeño, sin efectos.

- A favor: coincide con el arte real de Antigravity (misma proporción y contorno), así que
  el mundo mezcla activos reales y de código sin costura; la luz por estado hace visible el
  Reverdecer sin tocar el contenido; es la dirección con más identidad propia.
- En contra: un poco menos legible que A en teléfonos de gama baja (se compensa con el
  contorno y la sombra); las partículas contradicen la letra del principio 08 §1 («sin
  partículas de brillo»), que habría que enmendar: *partículas solo diegéticas y discretas*
  (luciérnagas, polvo, ceniza), nunca destellos.

### C · Grabado

Tinta y papel: el mundo entero pasa a una rampa sepia (tinta → papel) y solo sobreviven el
violeta de la Biblioteca y el dorado de los sellos; contorno negro; luz de tinta. Como un
códice ilustrado o un expediente antiguo.

- A favor: es la dirección más distinta y la más «de derecho»; en capturas sueltas es la
  más memorable.
- En contra: **mata el Reverdecer**: la progresión de una región (ceniza → floración) se
  cuenta con color, y en sepia el verde no existe; recolorea los sprites y láminas reales
  de Antigravity, tirando su paleta; cansa en sesiones largas; y en el teléfono, con luz de
  día, los grises medios se pierden.

## 3. Comparación

Capturas en `art-src/capturas/estilos/` (se regeneran con
`node scripts/dev/shot-estilos.mjs` y `node scripts/dev/componer-estilos.mjs`):

- `comparacion-<escena>.png`: las tres direcciones lado a lado, media escala, para
  galería, lobby, estación, torre, piscina y audiencia.
- `detalle-<escena>.png`: recortes al píxel (2× en la galería, 1,5× en los mapas).

| Criterio | A Esmeralda | B Litoral | C Grabado |
|----------|-------------|-----------|-----------|
| Legibilidad en teléfono | alta | media-alta | media |
| Tono sobrio (D6) | medio | alto | alto |
| Muestra el Reverdecer | sí | sí, reforzado por la luz | no |
| Encaja con el arte real entregado | no (proporción) | sí | no (recolorea) |
| Identidad propia | baja | alta | alta |
| Coste de mantener | bajo | medio | medio |
| Rendimiento en móvil | mejor | bien (partículas ≤ 40) | bien |

## 4. Recomendación

**B · Litoral** como dirección del arte construido, con dos matices: partículas solo en
exteriores y solo diegéticas; viñeta sutil (nunca oscurece la zona de juego). Si el playtest
en teléfonos muestra problemas de lectura, la opción es pasar los personajes a contorno
negro (una línea en `estilo.ts`), no cambiar de dirección. **C** queda como tratamiento
puntual: puede usarse para las láminas del archivo sumergido y de los documentos del Códice,
donde el papel es el tema, sin aplicarse al mundo.

## 5. Lo que el arte por código no da, dicho con claridad

La capa base da coherencia, atmósfera y un mundo completo desde el primer día. No da por sí
sola la calidad de un referente: eso lo dan siluetas con carácter, decorados dibujados a
mano, agua animada, cuadros de reposo en los personajes, muros con altura (cara y coronación)
y láminas pintadas. La ruta sigue siendo la de D9 y el bloque de Antigravity: **la capa de
código debajo, el arte real encima, activo por activo, con el mismo contrato**. Lo que sí
cambia con este trabajo es que, mientras llega cada activo, el juego ya se ve como una obra
con dirección y no como un andamio.

## 6. Jugabilidad: qué cambió y qué sigue

Hecho en este bloque: Audiencia como pantalla de combate (la mejora de presentación de más
impacto, 11 §4.1), mapas más densos (11 §4.2), luz y partículas que hacen legible el estado
de cada región.

Siguiente, en orden:

1. **Fondo de escena en la Audiencia**: la lámina del lugar (o el mapa desenfocado) detrás
   de los medidores, para que la pantalla de combate tenga sitio y no un panel vacío.
2. **Cuadros de reposo** (idle, 2 cuadros) en la figura v2 y vecinos que caminan por rutas
   cortas: un lobby con gente parada parece un museo.
3. **Minimapa por episodio** en el panel Mapa (11 §4.3), con las zonas que aún no se pueden
   abrir en gris (ver 11 §6, estructura de puertas por documento).
4. **Tarde y noche**: el Parte de las Seis como cambio de luz y sonido, no solo de texto.
5. **Muros con altura** en los tilesets por código (cara + coronación) antes de que lleguen
   los tilesets reales de Antigravity.

Sobre si el juego debería ser un *metroidvania*, ver `11-jugabilidad-y-formato.md` §6.
