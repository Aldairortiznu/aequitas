# 11 · Jugabilidad y formato: diagnóstico y decisión

Petición de Dirección (15 de septiembre de 2026): que el juego sea guiado y no tan difícil,
refinar el primer nivel, verificar la jugabilidad y decidir si hay un formato mejor.
Referencias que puso Dirección: *Zelda: A Link to the Past*, *Final Fantasy Tactics*,
*Pokémon Rubí/Zafiro/Esmeralda*.

## 1. Qué formato tiene hoy el juego

Es un RPG de vista cenital de la era GBA: mapas de tiles de 16 px, personaje que camina en
cuatro direcciones, pueblos con gente a la que se le habla, objetos que se recogen, y
confrontaciones por turnos en pantallas propias (la Audiencia, el Pacto). Es, casi
literalmente, la estructura de *Pokémon Esmeralda*: exploración en el mundo, «combates»
en una pantalla aparte con cuatro acciones numeradas (Presionar, Presentar hecho, Presentar
norma, Fundamentar son los cuatro «movimientos»), medidores en vez de puntos de vida
(Posición, Tensión, Credibilidad), y un menú con mochila (Zurrón), enciclopedia (Códice),
diario (Cuaderno) y mapa. *Zelda* aporta lo que ya está en Altamar: pisos apilados, llaves
que son papeles, una válvula que hay que encontrar. De *Final Fantasy Tactics* solo hace falta
una cosa, y ya existe: que cada enfrentamiento sea un caso con reglas propias y no un
enemigo con más vida.

Conclusión: **el formato es correcto y coincide con las referencias**. No hay que cambiar
de género. Lo que fallaba era la guía (el jugador no sabía adónde ir), la densidad de los
mapas (demasiado vacío entre una cosa y la siguiente) y la presentación de la Audiencia,
que todavía no se parece a una pantalla de combate.

## 2. Qué se probó y qué se encontró

Se jugó el Prólogo y el Episodio 1 en Chromium de escritorio y en un perfil móvil de
360×740 con toque (Playwright, `--project=mobile`), y Dirección lo probó en su teléfono.

| Hallazgo | Gravedad | Qué se hizo |
|----------|----------|-------------|
| No se sabe qué hacer después del primer diálogo; el lobby es grande y no señala nada | alta | **Objetivos guiados**: un texto en el HUD («Habla con Pilar, la mujer del pañuelo junto a la columna»), lista completa en el Cuaderno con lo hecho tachado, y un **marcador dorado** sobre el destino en el mundo; si el destino está en otro mapa, el marcador señala la puerta que lleva allí |
| Caminar en el teléfono con la cruceta virtual cansa en mapas de 40 tiles | alta | **Viaje rápido** desde el panel Mapa (lista de lugares del episodio con «Ir») y botón «Ir al objetivo». Quien quiera caminar, camina; quien no, llega |
| Escaleras, sótanos y oficinas no se distinguen de la pared | media | **Letreros** interactivos en cada salida y edificio (lobby, estación, laboratorio) |
| Nadie explica los controles | media | Tres pistas de control, una sola vez por instalación, en el momento en que sirven (al aparecer, al recoger, en el atril) |
| La Audiencia puede terminar en «sesión levantada» con tres fallos | media | Credibilidad de Marrugo sube a 4; las pistas escalonadas ya existían; el modo Estudio da pista siempre |
| Las cinemáticas dicen «Renata» aunque juegue Ramiro | alta | resuelto con las plantillas de texto (D10) |
| Los sprites provisionales no se distinguen entre sí a 2× | media | llega arte real por bloques; Renata, Pilar y Marrugo ya tienen retrato |

Todo esto está activado por defecto (ajuste «Modo guiado») y se puede apagar para jugar
sin ayudas.

## 3. Sobre reutilizar el arte del prototipo

Se revisó la rama `prototipo-2026`. Sus personajes y sus tiles también estaban dibujados
por código (rectángulos en `spriteData.js` y `tiles.js`), con otro elenco (Aurelio,
Valeria, Kaelen, Sora), otra proporción (18×28) y solo vista frontal: no hay hojas de
sprites ni tilesets que portar. Lo que sí sirve, y ya se usa, son sus diez ilustraciones
pintadas (`prov-*`), que hacen de láminas provisionales hasta que Antigravity entregue las
definitivas. Para el aspecto de los mapas, el camino corto es el tileset real de Altamar
(Bloque C de Antigravity), no el prototipo.

## 4. Lo que sigue para parecerse más a las referencias

1. **Pantalla de Audiencia como combate** (E14): adversario grande a la derecha con su
   retrato y sus medidores, quien juega abajo a la izquierda, las cuatro acciones en una
   rejilla de 2×2 como los movimientos de Pokémon, el registro de la sala como el texto
   del combate. Mismo reductor, otra piel. Es la mejora de presentación con más impacto.
2. **Densidad de mapas**: la regla de Pokémon es «algo cada ocho pasos»: una persona, un
   cartel, un objeto o una puerta. El lobby de Altamar y la estación se rellenan con vecinos
   con una línea cada uno, y con objetos de ambiente (el Sistema apagado, radios, ropa
   tendida) antes del playtest.
3. **Minimapa por episodio** en el panel Mapa (tres o cuatro mapas dibujados en pixel art
   con la posición actual y el marcador), en lugar de solo la lista de lugares.
4. **Modo relato** (más adelante, para el aula): las mismas escenas, audiencias y pactos
   sin caminar, como novela visual; el contenido ya está separado del motor de mundo, así
   que es un secuenciador de beats, no un juego nuevo.

## 5. Decisión

Se mantiene el formato RPG cenital estilo GBA con confrontaciones en pantalla propia. El
modo guiado y el viaje rápido quedan activados por defecto. La pantalla de Audiencia se
rediseña como pantalla de combate en el siguiente bloque de interfaz (E14), antes del
playtest.

## 6. ¿Y si fuera un metroidvania? (pregunta de Dirección, 15 de septiembre)

Un metroidvania es tres cosas: **un mundo único e interconectado** en vez de niveles
sueltos; **puertas que solo se abren con una capacidad que se gana más adelante**, de modo
que volver atrás con algo nuevo es parte del juego; y **un mapa que se va revelando**. Casi
siempre viene además con vista lateral y salto (*Metroid*, *Castlevania: Symphony of the
Night*, *Hollow Knight*), pero eso es la piel, no la estructura: *Zelda* en vista cenital es
un metroidvania sin salto.

### Qué encaja con AEQUITAS

- Las **puertas por capacidad** encajan mejor que en ningún otro género, porque aquí las
  capacidades son documentos y conocimientos: no se entra a la Oficina sin el poder; no se
  contesta al Parte sin saber qué es la rectificación; no se abre la torre sin la válvula. Ya
  existe en Altamar («llaves que son papeles») y en el Códice, que crece con lo aprendido.
- El **mundo interconectado** encaja si el Litoral se juega como un solo mapa unido por el
  río (viaje en canoa, regiones que se abren episodio a episodio), con los episodios como
  capítulos dentro de ese mundo y no como mapas sueltos. La estructura de producción (un
  episodio cada cinco semanas, revisión jurídica por bloque) se conserva.
- El **mapa que se revela** es el minimapa que ya está en la lista (§4.3), con las zonas
  cerradas en gris hasta que se tiene el papel que las abre.

### Qué no encaja: la vista lateral con salto

1. **Motor nuevo.** Física de plataformas, colisiones, cámara lateral: unas tres semanas de
   motor de mundo antes de volver a tener lo que hoy funciona.
2. **Arte.** Todo el arte cenital ya entregado o contratado (sprites de cuatro direcciones,
   tilesets) se descarta; solo sobreviven retratos, láminas e interfaz. Habría que rehacer
   el contrato de `docs/arte` y el bloque de Antigravity desde el principio.
3. **Diseño de niveles.** Un mapa metroidvania bueno es el trabajo más caro del género:
   *Hollow Knight* fue el trabajo de tres personas durante años. No hay presupuesto ni
   calendario para eso en la Temporada 1.
4. **Teléfono.** El plataformeo con botones virtuales es lo que peor se controla en pantalla
   táctil, y Dirección pidió un juego guiado y no difícil. En un metroidvania lateral la
   dificultad está en el salto; aquí tiene que estar en el derecho.
5. **Público.** Estudiantes, comunidades y aulas: el formato cenital con toque y viaje rápido
   es el que menos destreza pide.

### Recomendación: metroidvania de papeles, en vista cenital

Adoptar la **estructura** metroidvania sin cambiar la vista:

- **Dentro del episodio**: el mundo del episodio como un solo espacio con puertas por
  documento y regreso al centro con nuevas llaves. Altamar ya lo hace (válvula → torre,
  carne → sótanos, acta → piscina); se hará explícito en el panel Mapa con las zonas en gris
  y el papel que las abre.
- **Entre episodios**: el río como mapa-mundo continuo con la canoa, regiones cerradas hasta
  su episodio y abiertas después para volver (misiones secundarias, Reverdecer visible).
- **Capacidades que abren puertas**, todas reales: poder de representación, derecho de
  petición, acta de asamblea, certificado de existencia, cotejo de folios. Cada una se gana
  jugando y queda en el Códice; volver atrás con ella cambia lo que se puede hacer.

Si Dirección quiere ver la vista lateral antes de decidir, se puede montar una prueba de
un solo mapa (la torre de Altamar) en un día; no conviene invertir más sin verla.

La prueba lateral quedó montada ese mismo día (`?escena=lateral`, `src/engine/scenes/LateralScene.ts`). La
revisión de referentes que Dirección pidió después, y la propuesta de bucle de juego, están en
`13-referentes-y-dinamica.md`.
