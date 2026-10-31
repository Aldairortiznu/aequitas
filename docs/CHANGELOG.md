# AEQUITAS · Registro de cambios

## v0.8.1 — Arreglo: la matrícula de Don Anselmo
- **Después de armar la matrícula, el juego no avanzaba:** Don Anselmo pedía otra vez
  el mismo documento. El minijuego guardaba su contador de pedazos con el mismo nombre
  que usa la escena para saber a dónde ir al terminar, así que al completarlo se perdía
  el resultado y la matrícula no llegaba al expediente. Ahora cada uno tiene su nombre.
- Revisión de los demás minijuegos: el de la balanza también usaba un nombre reservado
  (el cargador de Phaser) y se corrigió. Los diez minijuegos del pueblo devuelven su
  resultado (comprobado uno por uno).
- Las partidas que se quedaron trabadas siguen: basta hablar con Don Anselmo y armar la
  matrícula otra vez.

## v0.8 — Las ilustraciones de la historia
- Llegaron las **seis escenas ilustradas** (el Colapso del Leviatán, la Bóveda, la
  travesía, la víspera, la Margarita Dorada y Siete Puentes) y los **retratos de los
  cuatro Emisarios**, hechos con Antigravity. Reemplazan a la pintura por código, que se
  queda como respaldo.
- **Livianas:** se pasaron a WebP con el tamaño que el juego usa (de 10 MB a menos de
  1 MB). Los originales quedan en `art-src/`.
- **Sin esperas:** se cargan en segundo plano mientras ya se ve el menú (escena
  `Assets`). Si alguna no ha llegado, se usa la pintura por código.
- **Arreglo del modo sin conexión:** el service worker guardaba para siempre la lista de
  ilustraciones y el juego no se enteraba de las nuevas. Ahora las listas y las
  ilustraciones van por red primero, y los caches viejos se borran (`aequitas-v2`).
- **Arreglo:** al cambiar de personaje o continuar una partida, el sprite del protagonista
  se repinta en el mismo lienzo en lugar de borrarse. Antes, si el menú lo estaba
  dibujando en ese instante, podía salir un error de imagen sin textura.

## v0.7 — Botones que hablan claro · celular en vertical
**Botones**
- Cambian de rótulo según la pantalla: «Seguir» en los diálogos, «Preguntar» y
  «Presentar» en la audiencia, «Aceptar» y «Volver» en los menús, «Caminar» o «Mover»
  en la palanca… Los que no sirven en esa pantalla se atenúan.
- «Hablar» (E) se enciende cuando hay alguien cerca con quien conversar.
- Rombo de botones como en las consolas: C arriba, B a la izquierda, X grande a la
  derecha y E abajo, donde descansa el pulgar. Expediente y Menú son botones de sistema,
  arriba (como Select y Start).
- Palanca de bronce con un pomo dorado y flechas guía; vibración corta al tocar (se
  apaga en Ajustes).
- En horizontal, los botones son más pequeños y ya no se salen del borde, y Expediente y
  Menú pasan al costado derecho para no tapar el panel de confianza.

**Celular en vertical**
- El juego queda arriba y debajo hay un **panel de estado en letra grande**:
  - en el pueblo: la pregunta del caso, el objetivo, el equilibrio, la confianza y lo
    último que descubriste (el HUD de arriba se esconde y el mapa queda libre);
  - en los diálogos y cinemáticas: el retrato, el nombre y el texto. Tocar el panel
    sigue el diálogo, y la escena (y las postales) se ve completa arriba;
  - en la audiencia: la frase que se discute, con lo que puedes hacer con ella;
  - en los minijuegos: sus instrucciones.
- Consola con los colores del juego (violeta y dorado), en lugar del verde de antes.

## v0.6 — Entender cada acierto · una historia por descubrir · una guía clara
**Cada acierto se explica**
- Nueva tarjeta **«¿Por qué funcionó?»** después de cada objeción correcta en la audiencia
  y de cada buena decisión en el acuerdo (13 en total). Tiene tres pasos: **la norma**
  (qué dice y dónde), **en este caso** (por qué aplica a la lancha) y **para recordar**
  (la idea que queda).
- Los minijuegos ya explicaban cada respuesta (✓/✗ con su artículo); eso se mantiene.

**La historia se descubre jugando**
- **Las preguntas del caso:** arriba, en el pueblo, siempre hay una pregunta abierta
  («¿Por qué pelean dos familias por una sola lancha?», «¿Qué esconde la pintura del
  casco?»…). Al encontrar la pista sale **«✦ ¡Descubriste!»** con la respuesta y la
  pregunta siguiente.
- Nueva pestaña **Misterios** en el expediente: resueltas (✔), la abierta (❓, con pista),
  las que vienen (🔒) y una que queda abierta para el capítulo 2.

**La flecha guía**
- Flecha más grande, con contorno y pulso. Lleva un letrero que la sigue con el destino
  y la distancia («Doña Fidelina · 33 pasos»).
- Junto al personaje, tres chevrones que se encienden en ola hacia el objetivo. Cuando el
  objetivo está en pantalla, su nombre aparece sobre él.

**Las escenas cinematográficas, dentro de la historia**
- Las postales ya no se descargan y dejan de ser pantallas sueltas: aparecen **detrás del
  texto** en los momentos que cuentan algo:
  - la guerra y el Leviatán, y la Bóveda, en la Biblioteca;
  - el río de noche al llegar;
  - la víspera, al abrir la audiencia;
  - la Margarita Dorada, en el epílogo;
  - Siete Puentes, en el anuncio del capítulo 2;
  - y en los recuerdos de Nando, de Don Anselmo y de Mamá Tule.
- El álbum del menú pasa a llamarse **«Escenas de la historia»**, para volver a verlas.

## v0.5 — Los Emisarios del Equilibrio · el mito · postales
**Personajes (del dossier narrativo)**
- Los cuatro que viajan ahora son los Emisarios del Equilibrio: Aurelio, el Archivista;
  Valeria, la Cartógrafa; Kaelen, Custodio de los números; y Sora, Centinela de bronce
  (con su máscara de bronce y su capucha). Todos llevan el tubo de códices al hombro y
  el broche de la Margarita Dorada.
- El vecino que reclama la lancha pasa a llamarse Don Anselmo Mendoza, para no
  confundirse con Aurelio.
- Partidas guardadas con Tomás, Río o Alex siguen funcionando (pasan a Aurelio, Kaelen
  y Sora).

**Sprites más bonitos**
- Todas las personas tienen ahora contorno oscuro, luz y sombra en la ropa, brillo en el
  pelo, cejas, nariz y mejillas.

**El mito**
- El Leviatán (el Estado que cayó en la guerra), el Reino del Arbitrio, la Bóveda bajo
  el mar Caribe, la Orden de Bellium y la Margarita Dorada que brota cuando un pueblo
  vuelve a confiar en su ley. La Maestra Ulpiana entrega el broche y recita la máxima de
  la Biblioteca; Mamá Tule cuenta la leyenda de la Margarita.
- No cambia la estructura del capítulo ni el caso.

**Postales cinematográficas** (heredadas de Reverdecer)
- Seis momentos a pantalla completa, con acercamiento lento y barras de cine: el Colapso
  del Leviatán, la Bóveda, la travesía, la víspera de la audiencia, la Margarita Dorada
  y Siete Puentes.
- Nuevo **Álbum de postales** en el menú; cada postal se puede guardar como imagen.
- Espacio listo para ilustraciones: si se agregan imágenes en `public/assets/postales/`
  y retratos en `public/assets/retratos/`, el juego los usa (ver `docs/PROMPT_POSTALES.md`).
- El menú aprieta un poco sus botones cuando aparece el álbum, para no tapar el lema.

## v0.4 — Sin trato de género · aprender a razonar · revisión legal
**Sin elección de género**
- Ya no se elige *Explorador / Exploradora / Exploradore*. La pantalla de personaje solo
  pide a quién quieres llevar, y en el pueblo te llaman por tu nombre. Todas las frases que
  dependían del trato se reescribieron en forma neutra («Le damos la bienvenida», «gente de
  afuera», «¿Te animas…?»).

**Fidelina**
- Arreglado: después de cerrar el caso, hablar con Fidelina ya no ofrecía otra vez
  «Empezar la audiencia» ni las preguntas de antes; solo quedan las conversaciones del
  después.
- Se fue el «Nueve años, exploradore.» y frases parecidas.

**Dos minijuegos nuevos para aprender derecho**
- *El tablero de la Junta* (en la puerta de la Casa de la Junta, después de conocer a
  Fidelina): el silogismo jurídico. Lees los hechos de un caso, eliges la norma que aplica y
  luego la conclusión; al final ves la cadena HECHOS → NORMA → CONCLUSIÓN. Siete casos
  (animales, caminos públicos, destierro, igualdad de los desplazados, buena fe, debido
  proceso, la paz). Da la carta *La paz es un derecho y un deber* (Const., art. 22).
- *Arma la norma* (con Yuli): unes cada «Si…» con su «…entonces» y aparece el artículo.
  Enseña que toda norma tiene un supuesto de hecho y una consecuencia. Da la carta *Quien
  causa un daño, lo repara* (C. C., art. 2341).
- El Códice pasa de 27 a 29 cartas.

**Revisión legal**
- Se cotejaron todas las citas con los textos de la Secretaría del Senado (Constitución,
  Código Civil, Ley 2220 de 2022, Ley 2166 de 2021 y Ley 446 de 1998). Los números de artículo estaban bien;
  se corrigieron diez frases imprecisas:
  - art. 34: prohíbe el destierro y la confiscación (no «echar del pueblo»); expulsar a
    alguien de donde vive se apoya también en el art. 24;
  - hallazgo (art. 708), frutos (art. 964, «antes de contestar la demanda»), mejoras
    voluptuarias (art. 967: se las lleva si no daña la cosa y el dueño no quiere pagarlas);
  - compensación (arts. 1714 y 1715), conciliación en equidad de la Junta (Ley 2220,
    arts. 5 y 84, y Ley 2166: solo si su conciliador está formado y nombrado), bienes de uso público (art. 674);
  - la audiencia, el acta y la Ronda Relámpago se ajustaron con las mismas precisiones.

## v0.3 — Después de la guerra · nueva presentación
**Historia**
- El mundo ya no viene de una inundación sino de una guerra de nueve años que terminó
  con el Acuerdo de Altamar. Don Aurelio es un desplazado que regresa; la Maestra
  Ulpiana salvó el Códice en el exilio; Ramiro y el Puño son excombatientes que siguen
  mandando a la fuerza. La lógica jurídica del caso no cambia.
- Nueva idea en la Biblioteca y en la radio: la paz es un derecho y un deber (Const., art. 22).

**Tono respetuoso**
- Fuera los chistes a costa de la gente: la gallina «secuestrada» y el «sancocho», el
  «viejo cascarrabias», la lavandera, el farol que grita, los «¡Ñiiic!» de Tinto.
- Los líos del barrio conservan su peso real (la cosecha, los huevos de los nietos).
- La cultura del Caribe aparece como memoria viva: tambor alegre, bullerengue, décimas,
  minga; un pelao que sueña con llamar a su tío, que vive lejos desde la guerra.

**Ilustración**
- Campanario partido en su isleta, hollín en las fachadas, agujeros tapados en la pared
  de la Junta, libros chamuscados en la Biblioteca.
- Presentación animada (Bellium S.A.S. presenta → amanecer → la balanza → AEQUITAS letra
  por letra) y un menú nuevo: ciudad en tres capas de bruma, sol con rayos y reflejo,
  nubes, garzas, palmas y botones enmarcados en dorado.

## v0.2 — Letras nítidas y pantallas sin montarse
**Legibilidad**
- El juego se pinta a 2 o 3 veces su resolución base y cada texto se dibuja a esa
  resolución: las letras ya no salen borrosas ni en escalones, en celular ni en computador.
- Paneles opacos (HUD del pueblo, audiencia, acuerdo, cierre, entrevistas, «Acerca de»):
  ya no se ven letreros ni siluetas detrás del texto.
- Títulos de los minijuegos con contorno y subtítulos sobre fondo oscuro: se leen sobre
  cielo claro, toldos o noche.
- Etiquetas pequeñas del HUD, de 6 a 7 px; las piezas de «La matrícula rota», de 7 a 8 px.
- Diálogos y cinemáticas: las palabras ya no saltan de renglón mientras se escriben, y el
  texto del narrador queda centrado en su caja.
- En celular vertical, un consejo discreto: girar el celular agranda el juego.

**Sin superposiciones**
- Audiencia: la placa «Norma aplicada» sale justo encima de la declaración y ya no se
  monta con el título ni con los letreros; el lema «AQUÍ SE HABLA, NO SE GRITA» pasa bajo
  la ventana (el recibo de gastos lo tapaba y solo se leía «HABLA, GRITA»).
- Las sacudidas de cámara volvieron a su tamaño (con la nueva resolución eran 9 veces más
  fuertes y desplazaban el diálogo de la objeción).
- Minijuegos: avisos de inicio, victoria y derrota ajustados a su texto; la burbuja de
  «Escucha activa» ya no tapa la barra de tensión; los pedazos de la matrícula ya no se
  montan entre sí ni estiran la letra al colocarlos.
- La entrevista cubre el HUD del pueblo; el expediente indica cuántas entradas hay
  y permite bajar o subir la lista con flechas tocables.
- La gente del puerto ya no atraviesa puestos ni se para encima de otra persona al pasear.

**Otros**
- Ajustes: la dificultad «Normal» ya no dice «El explorador» (el trato es el que elijas).

## v0.1.1 — Controles en celular
- En vertical, la consola muestra siempre la palanca y los botones. Antes se escondían
  en el menú, la selección de personaje, las cinemáticas y los diálogos, y la consola
  parecía vacía.
- En horizontal siguen apartándose en esas pantallas para no tapar el texto.

## v0.1 — Capítulo 1 jugable: Puerto Garza
**Base**
- Nace AEQUITAS sobre el motor de Reverdecer (Phaser 3 + Vite + Tone.js), en su propia
  rama, con marca, menú, íconos, guardado y caché propios.

**Personajes**
- Pantalla de selección con cuatro personajes: Tomás (hombre), Valeria (mujer), Río y
  Alex (andróginos).
- Cada uno trae su historia y un don, y se elige el trato (Explorador, Exploradora o
  Exploradore). Su nombre aparece en diálogos y en el acta.

**Mundo**
- Postapocalíptico con lugares ficticios: Altamar, Puerto Garza, Puerto Alcaraván,
  Ciénaga del Silencio, Bahía Ceniza, Caño Grande y Siete Puentes.
- Ruinas en el mapa: bus hundido, campanario en el río, torres caídas, edificio
  derrumbado, valla vieja.
- Casas con lonas, óxido y remiendos. Bruma, polvo y horizonte de ciudad hundida.

**El orden se restablece**
- Medidor de *Equilibrio del puerto*, que va de Caos a Equilibrio.
- El mapa cambia con el avance:
  - vuelve el color;
  - se van los grafitis, la basura, el peaje y los guardias del Puño;
  - aparecen la balanza pública, la cometa, los banderines y la fiesta.
- También cambian la música y las líneas de la gente; Ramiro termina aceptando la Junta.
- Cuatro **enseñanzas**: aplicar una norma y explicarla para que la comunidad la adopte.
- **Recorrido libre** por el puerto restaurado al cerrar el caso.

**Ley real, explícita**
- 27 cartas del Códice con su artículo.
- **Norma aplicada** en pantalla tras cada objeción de la audiencia.
- Citas en el acuerdo y en los recibos (gastos necesarios, útiles y voluptuarios, C. C.
  arts. 965 a 967).
- Ronda relámpago con 24 afirmaciones verificadas.

**Juego**
- Investigación y audiencia dialéctica (objeciones, confianza, pistas, calma).
- Acuerdo con decisiones, clasificación de recibos, acta ordenada y firmas.
- Cierre con sellos, rango, récord y "Lo que aprendiste".
- 9 minijuegos.

**Celular**
- Controles táctiles que se esconden en las pantallas que se manejan tocando.
