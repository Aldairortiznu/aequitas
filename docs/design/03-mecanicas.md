# 03 · Mecánicas

Cada sistema de este documento existe por una razón pedagógica o dramática que se
enuncia al principio de su sección. Si una regla no sirve a una de esas razones, se
elimina.

## 1. El bucle del episodio

```
Llegada ──► Investigación ──► Audiencia ──► Conciliación ──► Reverdecer ──► Cuaderno
  │              │  ▲              │              │
  │              │  └─ Interpelaciones (encuentros con alguaciles) durante la exploración
  │              └─ Consultas (preguntas de la gente), Registro de Voces, folios del Códice
  └─ Cinemática breve + primer diálogo que enuncia la injusticia sin explicarla
```

1. **Llegada** (5 min): se ve la injusticia antes de entenderla.
2. **Investigación** (25-40 min): hablar, leer, recoger, registrar testimonios, resolver
   Consultas, esquivar o interpelar alguaciles.
3. **Audiencia** (10-15 min): confrontación estructurada con el adversario.
4. **Conciliación** (8-12 min): redacción del pacto.
5. **Reverdecer** (2 min): transformación de la región según el pacto.
6. **Cuaderno** (opcional): repaso de conceptos, cinco preguntas, acta para compartir.

Duración objetivo por episodio: 60-90 minutos. Prólogo: 25 minutos.

## 2. Exploración

**Por qué:** el derecho se aprende mirando hechos. El jugador debe ver la válvula
cerrada antes de leer el artículo sobre bienes comunes esenciales.

### Controles

| Acción | Teclado | Táctil |
|--------|---------|--------|
| Moverse (8 direcciones) | WASD / flechas | Cruceta virtual izquierda |
| Correr | Shift (mantener) | Doble toque en cruceta |
| Interactuar / confirmar | E / Enter | Botón A |
| Cancelar / menú rápido | Esc | Botón B |
| Zurrón (evidencias) | Z | Pestaña inferior |
| Códice | C | Pestaña inferior |
| Cuaderno | N | Pestaña inferior |
| Mapa del Litoral | M | Pestaña inferior |

El mando táctil vive en la capa DOM y desaparece durante diálogos, audiencias y pactos
(que usan toques directos sobre la interfaz).

### Interactuables

| Tipo | Qué hace | Regla |
|------|----------|-------|
| **Persona** | Diálogo ramificado; puede ofrecer «Registrar testimonio» o una «Consulta» | El icono de diálogo cambia cuando la persona tiene algo nuevo según los flags del episodio |
| **Documento** | Añade una evidencia al Zurrón con una nota automática de Renata | Algunos documentos exigen Cotejo (Prudencio) para revelar su autenticidad |
| **Folio del Códice** | Página suelta; desbloquea una entrada del Códice | Se ubican donde el concepto es visible (el folio de bienes comunes junto a la válvula) |
| **Puerta con requisito** | Se abre con una evidencia, un flag o un testimonio | Nunca con «llaves» abstractas: siempre con algo que el jugador entiende por qué abre |
| **Mecanismo** | Compuertas, válvulas, dial de bóveda | Solo en Ep. 3, 6 y 8. Puzles cortos (≤ 3 min) |
| **Atril** | Guardar, abrir Cuaderno, revisar un pacto ya firmado | Uno por mapa principal |
| **Mesa de conciliación** | Inicia el Pacto cuando la Audiencia termina en allanamiento | Solo aparece tras la Audiencia |

### Registro de Voces

**Por qué:** enseña que el estado civil y los hechos se prueban, y que el testimonio es
prueba (CGP, arts. 208 y ss.). Y construye el clímax del Ep. 8: el registro nuevo se
hace con lo que el jugador recogió.

- Al hablar con ciertas personas aparece la opción «Registrar testimonio». Se anota
  nombre, hecho y fecha aproximada.
- Cada testimonio es una evidencia de tipo «testimonio» y suma +2 a la Legitimidad de
  la región.
- En el Ep. 1 el testimonio de la partera es lo que devuelve el nombre a Tomás. En el
  Ep. 3 los testimonios prueban la continuidad de la posesión. En el Ep. 8 el conjunto
  se convierte en la base del registro civil de la Asamblea.
- Regla de autoría: cada episodio ofrece entre 6 y 10 testimonios; entre 2 y 4 son
  necesarios para la Audiencia, el resto suman Legitimidad y color.

### Consultas

**Por qué:** son la evaluación integrada. Sustituyen a los acertijos de atril.

- Una persona plantea un problema real y corto («Mi vecino tapó el camino, ¿qué
  hago?»). Tres opciones; una correcta, dos verosímiles.
- Correcta: +3 Legitimidad, desbloqueo de una entrada del Códice, una línea de
  agradecimiento. Incorrecta: la persona explica por qué no le sirve y ofrece volver a
  preguntar; sin penalización.
- Entre 4 y 6 por episodio; los temas anticipan la Audiencia o repasan episodios
  anteriores (retención espaciada).

### Compañeros

- Siguen a Renata en fila. Al hablarles dan una pista contextual al beat actual (nunca la
  solución completa en modo Normal).
- **Confianza** (0-3 por compañero): sube por escenas personales y por usar su
  Facultad en el momento indicado; desbloquea una mejora de la Facultad y una escena
  personal por episodio. No hay «afinidad» romántica.

## 3. Interpelación

**Por qué:** la exploración necesita fricción sin violencia. El encuentro con un
alguacil es un pequeño examen de derechos fundamentales, repetido hasta volverse
reflejo.

- Los alguaciles patrullan rutas fijas. Si su cono de visión toca a Renata, la detienen
  con una afirmación: «Muéstreme su certificado o la llevo al Despacho.»
- Se abre una interfaz mínima: la afirmación y cuatro artículos de la Constitución.
  El jugador elige. Correcto: el alguacil retrocede y esa patrulla queda «interpelada»
  hasta que el jugador cambie de mapa. Incorrecto: «Detención» (ver abajo).
- Rangos: **alguacil** (1 afirmación), **alguacil mayor** (2 seguidas), **capitán**
  (3 y una maniobra que exige Objeción si Gerineldo está en el grupo).
- Banco de afirmaciones por episodio: detención sin orden (Art. 28), registro de
  pertenencias (Art. 15), incautación (Art. 34), impedir reunión (Art. 37), exigir
  requisitos inventados (Art. 84), obligar a declarar (Art. 33), prohibir circular
  (Art. 24).
- **Detención:** fundido a negro, Renata reaparece en el Atril más cercano con una nota
  en el Zurrón: «Acta de detención N.º…, sin orden judicial». Esa nota es evidencia
  válida en la Audiencia del episodio (el sistema del Registrador documenta sus propias
  ilegalidades). Sin pérdida de progreso.
- Temporizador de 8 s en modo Normal; sin temporizador en modo Estudio.

## 4. Audiencia Dialéctica

**Por qué:** es la mecánica central y el instrumento pedagógico principal. Enseña el
silogismo jurídico haciéndolo jugable: **Norma + Hecho = Alegato**. Reemplaza al
combate.

### Estructura

- Una Audiencia tiene 2 a 4 **rondas**. Cada ronda, el adversario expone 3 a 5
  **afirmaciones**, una a la vez, que el jugador puede recorrer adelante y atrás.
- Cada afirmación tiene un **hueco**: un hecho que la contradice, una norma que la
  invalida, o ambos (combinación). La autoría define exactamente una solución plena y,
  a veces, una o dos soluciones parciales.
- Cuando la Posición del adversario llega a cero, se **allana**: reconoce que no puede
  sostener su pretensión y acepta sentarse a conciliar. No hay «derrota».

### Acciones del jugador

| Acción | Qué hace | Costo / efecto |
|--------|----------|----------------|
| **Presionar** | Pide que el adversario amplíe la afirmación | Gratis. Puede revelar una afirmación nueva o una pista. La tercera presión seguida sobre la misma afirmación sube Tensión +5 |
| **Presentar hecho** | Elige una evidencia del Zurrón | Si es el hecho correcto y la afirmación solo requería hecho: contradicción plena. Si requería combinación: contradicción parcial («¿y qué?») |
| **Presentar norma** | Elige una entrada del Códice | Igual que arriba, para normas |
| **Fundamentar** | Elige norma **y** hecho | Contradicción plena si ambos son correctos; parcial si uno lo es; fallida si ninguno |
| **Facultad** | Usa la habilidad de un compañero presente | Usos limitados por Audiencia (ver tabla) |
| **Invocación constitucional** | Solo sobre afirmaciones marcadas como violación de derecho fundamental. Elegir el artículo correcto entre cuatro | Una vez por Audiencia. Plena: Posición −30, Tensión −20. Fallida: Tensión +20 |

### Medidores

| Medidor | Rango | Qué representa | Sube | Baja |
|---------|-------|----------------|------|------|
| **Posición** (adversario) | 100-140 según Audiencia | Cuánto puede sostener su pretensión | Maniobra exitosa (+15) | Contradicción plena (−25 base; la autoría puede fijar otro valor), parcial (−10), Invocación (−30), Cotejo (−20) |
| **Tensión** | 0-100 | Riesgo de que la comunidad abandone la palabra por la fuerza | Fallida (+15), provocación del adversario al inicio de cada ronda (+5), presión excesiva (+5), Invocación fallida (+20) | Plena (−10), Invocación plena (−20), Convocar testigo (−15) |
| **Credibilidad** (Renata) | 3 marcas | Cuántas presentaciones fallidas tolera la sala | — | Fallida (−1). Se restaura al inicio de cada ronda |

### Maniobras del adversario y Objeción

Algunas afirmaciones traen una **maniobra**: un documento sorpresa («la Oficina
certifica que…»), una amenaza velada, un intento de incautar algo en la sala. Si
Gerineldo está presente, el jugador puede **Objetar** (anula la maniobra y suma
Posición −10). Si no, la maniobra exige responder con la norma correcta o cuesta
Tensión +25. Esto da a cada compañero un momento propio y enseña que el proceso tiene
reglas de juego que también se defienden.

### Facultades (usos por Audiencia)

| Compañero | Facultad | Usos | Efecto |
|-----------|----------|------|--------|
| Pilar | Convocar testigo | 1 (2 con Confianza 3) | Añade al Zurrón un testimonio del Registro de Voces elegido por la autoría; Tensión −15 |
| Prudencio | Cotejo de documentos | 1 | Expone un documento falso del adversario: Posición −20 y anula la afirmación que lo usaba |
| Gerineldo | Objeción procesal | 2 | Anula una maniobra: Posición −10 |

### Estados finales

- **Allanamiento:** Posición = 0. Pasa a Conciliación.
- **Tumulto:** Tensión = 100. La sala se rompe; escena breve (alguien vuelca una mesa,
  el adversario se va). Se reintenta desde el inicio de la ronda con una pista de un
  compañero. Es el único «fracaso» del juego, y su lección es la del juego: cuando la
  palabra falla, vuelve la fuerza.
- **Sesión levantada:** Credibilidad = 0. El adversario se retira. Reintento desde el
  inicio de la ronda.
- En el Ep. 7 (audiencia contra la plaza), el Tumulto tiene una consecuencia narrativa
  distinta y única: ver `anexo-A-tratamientos-borrador.md`.

### Retroalimentación pedagógica

- Tras cada contradicción plena aparece una **Nota** de dos líneas: qué norma, qué
  hecho, por qué. Se guarda en el Cuaderno.
- Tras dos fallos seguidos en la misma afirmación, el compañero más pertinente ofrece
  una pista escalonada: (1) el libro del Códice, (2) el tema, (3) la entrada exacta. En
  modo Estudio las pistas están siempre disponibles.

### Reglas de autoría de afirmaciones

1. Una afirmación, una solución plena. Máximo dos parciales.
2. Los distractores deben ser normas reales del mismo libro que un estudiante podría
   confundir (no basura evidente).
3. Ninguna afirmación se resuelve con una evidencia que el jugador no pudo encontrar
   sin pista en la Investigación.
4. Al menos una afirmación por Audiencia repasa un concepto de un episodio anterior.
5. La respuesta del adversario a una contradicción plena no puede ser derrota
   teatral: reformula, cede terreno, cambia de tema. Se allana solo al final.

## 5. Conciliación (Pacto)

**Por qué:** es la práctica real de Bellium (Ley 2220 de 2022, Estatuto de
Conciliación) y la tesis del juego: la justicia restaurativa se redacta. Además, es
donde el jugador demuestra la competencia más alta: no solo reconocer una norma, sino
construir un acuerdo que la respete.

### Estructura

- El Pacto tiene 3 a 6 **puntos** (en el Ep. 8, diez). Cada punto es una pregunta
  («¿Quién administra Altamar?») con 3 o 4 **cláusulas** posibles.
- Cada cláusula tiene atributos ocultos: **legalidad** (válida o nula, con la norma
  que la anula), **intereses** (efecto de −2 a +2 sobre cada parte: comunidad,
  contraparte, terceros) y **justicia** (0-3, juicio de autoría sobre la cláusula).
- Las partes exhiben dos filas: **lo que piden** (posición) y **lo que necesitan**
  (interés). Enseña el método de negociación por intereses que usa la conciliación
  real, sin nombrarlo.

### Control de legalidad

- Antes de firmar, el jugador puede marcar cualquier cláusula como **nula**. Si marca
  una cláusula realmente nula, se retira y se elige otra (+5 Equilibrio). Si marca
  una válida, el adversario se ofende: Tensión residual +10 en la escena.
- Si el jugador firma un pacto con una cláusula nula sin detectarla, el pacto se
  **impugna** en la escena posterior al episodio: Gerineldo (o la Rectora, antes del
  Ep. 3) señala la cláusula y su norma; Legitimidad de la región −20. El pacto puede
  **revisarse** después desde cualquier Atril de esa región (rejugabilidad y segunda
  oportunidad de aprendizaje).
- En modo Normal el juego **no** avisa qué cláusulas son nulas. En modo Estudio las
  marca con un asterisco y explica.

### Puntuación: Equilibrio (0-100)

- Legalidad: 40 puntos (todas las cláusulas válidas = 40; cada nula firmada = −20).
- Balance de intereses: 30 puntos (proporcional a la suma de intereses de todas las
  partes; un pacto que aplasta a la contraparte pierde puntos aunque sea legal).
- Justicia: 30 puntos (media del atributo de justicia de las cláusulas elegidas).

| Equilibrio | Resultado | Efecto |
|-----------|-----------|--------|
| ≥ 85 | Pacto ejemplar | Región alcanza Floración; escena de cierre completa |
| 60-84 | Pacto sólido | Región alcanza Verdor; una persona queda insatisfecha (diálogo) |
| 40-59 | Pacto frágil | Región alcanza Brote; una cláusula se incumple en el siguiente episodio (evento) |
| < 40 | Sin acuerdo | La contraparte se levanta; se reintenta |

### El acta

Al firmar se genera el **Acta de Conciliación** con las cláusulas elegidas, en prosa
jurídica limpia, fechada en el calendario del juego. Se guarda en el Cuaderno y puede
exportarse como imagen. La margarita aparece en un rincón de la escena, sin animación
llamativa; el énfasis está en las firmas.

## 6. Reverdecer

**Por qué:** el progreso tiene que verse. Y la explicación es ecológica, no mágica:
donde se comparte agua y se trabaja sin miedo, la tierra responde.

- Cada región tiene un medidor de **Legitimidad** (0-100). Fuentes: Audiencia ganada
  (+20), Pacto (0 a +40 según Equilibrio), Consultas (+3 cada una, máximo +18),
  testimonios (+2 cada uno), folios (+1 cada uno).
- Hitos: 25 **Brote**, 50 **Verdor**, 75 **Floración**, 100 **Floración plena**
  (requiere revisar un pacto frágil o completar todas las Consultas).
- Cada hito cambia: el estado del tileset (la misma geometría con otra paleta y
  decorados: canal seco → canal con agua → cultivo → cultivo con margaritas en los
  bordes), los diálogos ambientales de 4 a 6 personas, y una capa de la música.
- El **Mapa del Litoral** muestra las regiones con su estado; es la pantalla de
  progreso de la temporada.
- Reglas de arte en `08-arte-audio.md`: los estados reutilizan la geometría del mapa;
  el costo es paleta + decorados, no mapas nuevos.

## 7. Códice

**Por qué:** es el libro de texto, pero se lee porque se necesita, no porque se
asigna.

- Organizado en **libros**: Constitución, Código Civil, Código de Comercio, Código
  Sustantivo del Trabajo, Propiedad Horizontal (Ley 675), Leyes especiales (tutela,
  conciliación, registro, acción popular, infancia), Jurisprudencia (sentencias citadas
  con su número), Principios (buena fe, primacía de la realidad, etc.).
- Cada **entrada** tiene: referencia («Art. 29 C.P.»), título, texto literal (o
  extracto marcado como tal), «en palabras simples» (2-3 líneas), «cómo se usa en
  Audiencia» (1-2 líneas), un ejemplo del juego, y «usado en» (lista automática de las
  Audiencias donde el jugador la presentó).
- Se desbloquean por folios en el mundo, por Consultas y por escenas. Nunca se
  desbloquean todas de golpe: en una Audiencia el Zurrón de normas tiene entre 8 y 20
  entradas, lo que hace la elección significativa.
- Buscador por texto y filtros por libro. Glosario de términos enlazado.
- Los valores que cambian con el tiempo (tasa de usura, salario mínimo, jornada)
  aparecen como «la Tasa del Códice», «el Mínimo del Códice», con una nota: «en el
  mundo real la fija cada año/mes la autoridad correspondiente».

## 8. Zurrón (evidencias)

- Tipos: **documento**, **objeto**, **testimonio**, **nota** (observaciones de Renata
  generadas al examinar algo o al ser detenida).
- Atributo **autenticidad**: algunos documentos son falsos. Presentar un documento
  falso en Audiencia sin haberlo cotejado provoca una contradicción fallida especial
  (+20 Tensión) y una nota: «verificar antes de presentar». El Cotejo de Prudencio lo
  revela en la Investigación.
- Sin límite de capacidad. Las evidencias de episodios anteriores se conservan; el
  Ep. 7 las usa.

## 9. Cuaderno del jurista

- Por episodio: conceptos aprendidos (se llenan con las Notas de la Audiencia),
  cinco preguntas de repaso opcionales (banco por episodio), el acta firmada y la
  puntuación de Equilibrio.
- **Certificado** exportable como imagen: nombre del jugador, episodio, conceptos.
  Pensado para compartir y para que Bellium lo use en formación.
- **Modo Aula**: ajuste que hace que las Audiencias y Pactos esperen confirmación
  del docente entre acciones (para votar en clase) y que activa la guía de discusión
  del episodio (texto, publicable por Editorial Al Resuelve).

## 10. Progresión

- Sin niveles ni experiencia. Lo que crece es lo que sabe el jugador y lo que tiene:
  entradas del Códice, evidencias, testimonios, compañeros, Confianza.
- La **Invocación constitucional** amplía su banco de artículos por episodio.
- Títulos cosméticos por hito de Legitimidad acumulada («Jurista de la Biblioteca»,
  «Conciliadora del Litoral»), visibles en el Cuaderno.

## 11. Guardado y episodios

- Guardado en Atriles y automático en cada frontera de beat. Tres ranuras. Exportar e
  importar por código (texto) para cambiar de dispositivo sin cuenta.
- Los episodios son paquetes independientes que se cargan al entrar. Un guardado
  hecho en el Lanzamiento N continúa en el N+1 sin conversión visible (migraciones
  internas versionadas).
- Al terminar un episodio no lanzado todavía, el Mapa del Litoral muestra la región
  siguiente con fecha estimada del lanzamiento.

## 12. Dificultad y accesibilidad

| Modo | Fallos | Pistas | Temporizadores | Control de legalidad |
|------|--------|--------|----------------|---------------------|
| **Estudio** | Sin Tumulto ni sesión levantada | Siempre | No | Cláusulas nulas marcadas |
| **Normal** | Sí | Tras dos fallos | Sí (Interpelación) | Sin ayuda |
| **Jurista** | Sí; Credibilidad 2 marcas | No | Sí | Sin ayuda; Tensión inicial +10 |

Accesibilidad: toda la interfaz de texto vive en DOM (escalado de fuente 100-160 %,
fuente alternativa de alta legibilidad, lector de pantalla), medidores con icono y
patrón además de color, sin destellos, controles reasignables, modo de una mano en
móvil vertical.

## 13. Pedagogía integrada

| Nivel | Mecánica | Evidencia de aprendizaje |
|-------|----------|--------------------------|
| Reconocer | Folios del Códice | Entrada desbloqueada y leída |
| Comprender | Consultas | Respuesta correcta a un caso corto |
| Aplicar | Audiencia | Norma + hecho correctos ante una afirmación |
| Evaluar | Control de legalidad | Detección de cláusulas nulas |
| Crear | Pacto | Acta con Equilibrio ≥ 60 |

Ritmo de texto: ninguna escena supera 90 segundos sin una decisión del jugador;
ningún diálogo supera 12 globos seguidos sin una acción.
