# 09 · Formas de aprender: catálogo de mecánicas y minijuegos

Petición de Dirección (13 de septiembre de 2026): que las maneras de aprender derecho
dentro de la trama sean diversas, creativas y distintas entre sí, con minijuegos.

Este documento fija el catálogo, el criterio para usarlo y el orden de construcción. La
regla de oro no cambia: **cada mecánica enseña una habilidad jurídica concreta y su
solución es una regla de derecho, no un reflejo**. Nada de puzles decorativos. Y el tono
(D6): sobrio, sin gamificación ruidosa; el juego no aplaude, deja constancia.

## 1. Criterios

1. **Una habilidad, una mecánica.** Comprender (leer y clasificar), aplicar (subsumir un
   hecho en una norma), evaluar (detectar lo nulo, lo falso, lo excesivo), crear (redactar,
   pactar, decidir). Cada minijuego se etiqueta con una y con las normas que ejercita.
2. **La solución está en el Códice.** Toda mecánica se resuelve con normas que el jugador
   ya desbloqueó o que desbloquea en el intento. Nunca con adivinanza.
3. **Errores que enseñan.** Fallar muestra por qué (nota de dos líneas, como en la
   Audiencia) y permite reintentar; tres fallos dan pista escalonada; en modo Estudio
   siempre hay pista.
4. **Datos, no código.** Cada tipo de minijuego es un motor genérico (reductor puro en
   `src/core/minijuegos/<tipo>.ts` + vista Preact) y cada aparición es un JSON en
   `content/<ep>/minijuegos/`. Un episodio nuevo no programa: escribe.
5. **Variedad por episodio.** Cada episodio combina al menos cuatro formas distintas y
   ninguna se repite dos veces seguidas en el mismo episodio.
6. **Todo deja rastro.** Resultado en flags (`minijuego.<id>.superado`), Legitimidad,
   nota en el Cuaderno y «usado en» del Códice.

## 2. Las formas que ya existen

| Forma | Nivel | Qué ejercita |
|-------|-------|--------------|
| Consulta (tres opciones) | comprender | leer un caso y elegir la regla |
| Interpelación (artículo bajo presión) | recordar | recuperar la norma exacta a tiempo |
| Audiencia Dialéctica | aplicar | hecho + norma contra una afirmación errada |
| Control de legalidad del Pacto | evaluar | detectar cláusulas nulas y por qué |
| Pacto (acta) | crear | redactar un acuerdo equilibrado |
| Registro de Voces | comprender | qué es un testimonio y qué prueba |
| Cotejo de Prudencio | evaluar | autenticidad de un documento (solo con Prudencio) |

## 3. Catálogo nuevo

Tamaño: S (2-3 días), M (1 semana), L (2 semanas). «Motor» indica si el tipo es genérico
(sirve en cualquier episodio) o específico.

### 3.1 Clasificar: «¿De quién es?» · comprender · motor genérico `clasificar` · S

Tarjetas de cosas (el pasillo, el apartamento 9A, el agua del tanque, la playa, el río, el
canal, la piscina, un baldío) que hay que poner en cajas: bien privado, bien común esencial,
bien común no esencial, bien de uso público, baldío. Cada acierto abre la norma que lo
clasifica; cada error explica en dos líneas.

- Normas: Ley 675 art. 3; C.C. 674, 677; C.P. 63; Ley 160/1994 (baldíos).
- Dónde: Ep. 1 (Altamar: el pasillo y el agua; corta, en el lobby), Ep. 3 (el canal y el
  embalse), Ep. 6 (el río y la presa, versión difícil).
- Datos: `{ cajas: [...], tarjetas: [{ texto, caja, norma, nota }] }`.

### 3.2 Torre de normas · comprender · motor `ordenar` · S

Un conflicto concreto («el decreto de la Oficina dice X; la Constitución dice Y; el
reglamento del conjunto dice Z») y bloques que hay que apilar en orden de jerarquía. Si el
orden es incorrecto, la torre no se sostiene y el bloque equivocado explica por qué. Se usa
**una sola vez en toda la temporada** (Prólogo, examen de graduación) para que no se
vuelva un chiste: después, la jerarquía se da por sabida y se aplica en Audiencia.

- Normas: C.P. art. 4; Ley 153/1887 art. 5 (derogatoria); principio de especialidad.
- Datos: `{ conflicto, bloques: [{ texto, nivel, nota }] }`.

### 3.3 Cotejo de documentos · evaluar · motor `cotejar` · M

Dos versiones de un documento (un pagaré, un acta, una escritura) lado a lado, o un solo
documento con segmentos marcables. El jugador señala el requisito que falta, la cláusula
alterada o la firma que no corresponde. Se resuelve con la norma que fija los requisitos
formales del documento.

- Normas: C.Co. 621 y 709 (pagaré), Ley 675 art. 47 (actas), Decreto 960/1970 arts. 13-14
  (escrituras), CGP 244 (autenticidad).
- Dónde: Ep. 2 (los pagarés en blanco de Silvana; con Prudencio como maestro), Ep. 4 (el
  contrato de la sal), Ep. 6 (el acta de custodia con la firma de Petra).
- Datos: `{ documento: [{ id, texto, error?: { tipo, norma, nota } }], instrucciones }`.

### 3.4 Las cuentas del pagaré · aplicar · motor `cuentas` · M

Un libro de cuentas: capital, plazo, intereses de plazo, intereses de mora, «gastos»,
intereses sobre intereses. Fila por fila, el jugador acepta o rechaza el cobro citando la
norma. Los valores son del juego (bultos, jornadas) y el Códice recuerda que la tasa la fija
una autoridad periódicamente (regla de «sin cifras que cambian»).

- Normas: C.Co. 884 (interés máximo), Ley 45/1990 art. 72 (usura), C.C. 2235 y C.Co. 886
  (anatocismo), C.Co. 622 (espacios en blanco).
- Dónde: Ep. 2 (Tres Bocas). Reaparece como repaso en Ep. 5 (la tienda de raya: deudas con
  el patrón, CST 149).
- Datos: `{ deuda, filas: [{ concepto, valor, legal, norma, nota }] }`.

### 3.5 Línea de tiempo de la posesión · aplicar · motor `linea-tiempo` · M

Tarjetas de hechos (entrega de la finca, muerte del poseedor, demanda, abandono de seis
meses, reconocimiento de dominio ajeno, suma de posesiones) que se colocan en una línea de
años. El motor cuenta el tiempo útil y el jugador contesta: ¿se cumplen diez años el Año
Diez? Si un hecho interrumpe, la cuenta vuelve a cero y se ve.

- Normas: C.C. 2512, 2518-2532 (Ley 791/2002), 2522-2523 (interrupción), 778 (agregación),
  1040 y Ley 29/1982 (sucesión e igualdad de hijos).
- Dónde: Ep. 3 (el reloj de la temporada). Versión corta en Ep. 6 (el río no se gana por
  posesión: bienes imprescriptibles, C.C. 2519).
- Datos: `{ desde, hasta, hechos: [{ texto, ano, efecto: 'inicia'|'interrumpe'|'suma'|'nada', norma }], pregunta }`.

### 3.6 Nombre, trato y fama · aplicar · motor `testigos` · S

Para probar quién es alguien sin registro civil, el jugador elige entre los testimonios del
Registro de Voces los que acreditan **nombre, trato y fama** (posesión notoria del estado
civil). Tres testigos bien elegidos certifican; un testigo de oídas o interesado no sirve y
se explica por qué.

- Normas: C.C. 397-399 (posesión notoria), Decreto 1260/1970 arts. 3 y 101-105, CGP 211
  (tacha de testigo), CGP 221.
- Dónde: Ep. 1 (Tomás, con la libreta de Zoraida; cierra el episodio con un acto jurídico
  de verdad), Ep. 6 (los no inscritos de Puerto Baluarte, en masa).
- Datos: `{ persona, requisitos: ['nombre','trato','fama'], testimonios: [{ id, cubre: [...], valido, razon }] }`.

### 3.7 La ventanilla · evaluar · motor `ventanilla` · M

Una jornada como funcionaria o funcionario de la Oficina de Registro (infiltración en el
Ep. 6, o en el Ep. 5 como capataz de la tienda). Llegan peticiones; para cada una hay que
decidir: aprobar, negar con causa o devolver. La regla: no se pueden exigir requisitos que
la ley no exige, toda petición se responde de fondo y en término, y la negativa se
motiva. Cada decisión equivocada aparece después en la fila como una persona con nombre.

- Normas: C.P. 23 y 84; Ley 1755/2015 (derecho de petición); C.P.A.C.A. arts. 13-33
  (extractos); Decreto 019/2012 (antitrámites) como referencia.
- Dónde: Ep. 6 (la Oficina por dentro). Variante en Ep. 5 (la tienda: qué se puede
  descontar del salario, CST 149, 150, 152).
- Datos: `{ turno: [{ peticion, documentos, decisionCorrecta, requisitosIlegales, norma, nota }] }`.

### 3.8 Redacción por bloques · crear · motor `redactar` · M

Una cláusula se arma con bloques (quién, qué, cuánto, cuándo, con qué condición, con qué
consecuencia). Hay bloques válidos y bloques envenenados (renuncia a demandar, intereses
sobre intereses, plazo indefinido, sanción sin proceso). La cláusula se lee en voz alta al
terminar y el acta la incorpora. Es el paso siguiente al Pacto: no elegir cláusulas, sino
escribirlas.

- Normas: C.C. 1502, 1602, 1603, 1624 (interpretación contra el redactor); Ley 1480/2011
  art. 43 (cláusulas abusivas) como referencia; C.C. 1946-1954 (lesión enorme).
- Dónde: Ep. 4 (el contrato de la sal), Ep. 8 (el pacto del Litoral).
- Datos: `{ objetivo, bloques: [{ id, texto, tipo, valido, norma?, nota? }], reglas }`.

### 3.9 Asamblea · crear · motor `asamblea` · M

Grupos de personas con una preocupación cada uno (agua, expensas, seguridad, el niño sin
carné). El jugador reparte argumentos (hechos y normas) entre los grupos en turnos limitados
hasta alcanzar quórum y mayoría; cada grupo tiene un argumento que le importa y dos que le
dan igual. La asamblea aprueba el orden del día si se cumplen las reglas de convocatoria,
quórum y mayoría. Sustituye la «secuencia de asamblea» del plan (F-05.1) por un motor
genérico.

- Normas: Ley 675 arts. 39, 41, 45, 46 (convocatoria, quórum, mayorías); CST 444 (huelga por
  mayoría absoluta), CST 429.
- Dónde: Ep. 1 (epílogo opcional: la asamblea que convoca Pilar), Ep. 5 (los trabajadores
  del molino), Ep. 8 (la Asamblea del Litoral, versión grande).
- Datos: `{ grupos: [{ nombre, peso, preocupacion, convence: [...] }], argumentos, turnos, quorum, mayoria }`.

### 3.10 Interrogatorio · aplicar · motor de diálogo existente · S

Un testigo con una versión que no cuadra. Con preguntas limitadas (cinco), el jugador
encuentra las contradicciones entre lo que dice y lo que consta en el Zurrón. Cada
contradicción hallada resta credibilidad al testigo o al documento que sostiene. Se
construye con el motor de diálogo y un contador de contradicciones: sin código nuevo salvo
el marcador.

- Normas: CGP 211, 220-221 (testimonio), 176 (sana crítica), 246 (documentos).
- Dónde: Ep. 4 (el capataz de las salinas), Ep. 7 (los testigos contra el Registrador).

### 3.11 Justo precio · aplicar · motor `balanza` · S

Dos platillos: lo que se pagó y lo que valía. Los peritos (personajes) dan estimaciones con
sesgo; el jugador combina las creíbles y decide si hay lesión enorme (precio inferior a la
mitad del justo precio) y cuál es el remedio: rescindir o completar el precio.

- Normas: C.C. 1946-1954; C.C. 1947 (mitad del justo precio); 1948 (opción del comprador).
- Dónde: Ep. 4.
- Datos: `{ precioPagado, estimaciones: [{ perito, valor, fiable, razon }], umbral: 0.5 }`.

### 3.12 Compuertas del canal · aplicar · motor específico `compuertas` · M

El puzle de válvulas del Ep. 3 con una regla jurídica como solución: el orden de apertura
respeta la servidumbre de acueducto y los turnos de riego pactados (el predio sirviente no
puede quedarse sin agua; el dominante tiene el paso, no la propiedad del agua). Las
combinaciones «eficientes» que violan la servidumbre inundan o secan a alguien y el juego
lo dice.

- Normas: C.C. 919-924 (servidumbre de acueducto), 897 (servidumbres), Decreto 2811/1974
  art. 80 (aguas como bien de uso público).
- Dónde: Ep. 3.

### 3.13 El archivo sumergido · explorar · motor específico `buceo` · L

Buceo con medidor de aire y bolsas de aire para rescatar folios del casco antiguo. La
parte jurídica está en lo que se rescata: cada folio recuperado es un documento que se lee
y se coteja (3.3) para reconstruir la tradición de un predio (tracto sucesivo). El buceo es
el ritmo; la lectura, la lección.

- Normas: Ley 1579/2012 arts. 2, 8, 49 (folio de matrícula, tracto sucesivo); CGP 243-246.
- Dónde: Ep. 6.

### 3.14 La plaza · evaluar · variante de Audiencia `multitud` · M

La Audiencia del Ep. 7 no es contra una persona sino contra una multitud: varios adversarios
con turnos (Pilar incluida), un medidor de Tumulto que sube con cada argumento de venganza y
baja con cada garantía concreta. El jugador no gana convenciendo a todos: gana cuando la
plaza acepta el proceso. Se construye sobre el reductor de Audiencia (adversarios múltiples,
maniobras de multitud).

- Normas: C.P. 11, 12, 28, 29, 34, 116, 247; Ley 497/1999; Ley 2220/2022.
- Dónde: Ep. 7.

### 3.15 Repaso en el Atril · recordar · motor `repaso` · S

En cualquier Atril: cinco tarjetas del Códice ya desbloqueado, con repetición espaciada
(las que se fallan vuelven antes). Opcional, nunca obligatorio; alimenta el certificado del
Cuaderno. Es la única mecánica de memoria pura y por eso vive fuera de la trama.

- Dónde: transversal desde el Ep. 1.
- Datos: ninguno nuevo; usa el Códice y un registro de dominio por entrada.

## 4. Mapa por episodio (cuatro formas distintas como mínimo)

| Ep. | Formas nuevas (además de Consulta, Audiencia y Pacto) |
|-----|-------------------------------------------------------|
| 0 | Torre de normas (examen), Repaso en el Atril |
| 1 | ¿De quién es? (pasillo y agua), Nombre, trato y fama (Tomás), Asamblea (epílogo opcional) |
| 2 | Cotejo (pagarés), Las cuentas del pagaré, Interrogatorio (Silvana) |
| 3 | Línea de tiempo de la posesión, Compuertas del canal, ¿De quién es? (canal y embalse) |
| 4 | Cotejo (contrato), Justo precio, Redacción por bloques, Interrogatorio (capataz) |
| 5 | Asamblea (huelga), Ventanilla (la tienda), Las cuentas (deudas con el patrón) |
| 6 | Archivo sumergido, Cotejo (acta de custodia), Ventanilla (la Oficina), Nombre, trato y fama (en masa), Línea de tiempo (imprescriptible) |
| 7 | La plaza, Interrogatorio (testigos) |
| 8 | Redacción por bloques (pacto del Litoral), Asamblea (versión grande) |

## 5. Encaje en el motor

- Acción nueva `{ type: 'minijuego', id }` en `ActionSchema`; contenido en
  `content/<ep>/minijuegos/<id>.json` con `tipo` discriminado (`clasificar`, `ordenar`,
  `cotejar`, `cuentas`, `linea-tiempo`, `testigos`, `ventanilla`, `redactar`, `asamblea`,
  `balanza`, `repaso`; `compuertas` y `buceo` son escenas de Phaser).
- Marco común (`MinijuegoHost`): instrucciones, intentos, pista escalonada (misma regla
  que la Audiencia), nota jurídica al terminar, botón «Repetir», salida sin castigo. Flags
  `minijuego.<id>.superado` e `.intentos`; Legitimidad por fuente `minijuego` con tope.
- Cada tipo: reductor puro con pruebas (`tests/core/minijuegos/`), esquema zod, validador
  (normas existentes en el Códice) y una vista Preact accesible (teclado y táctil).
- La galería de contenido (`?escena=galeria`) no cambia; los minijuegos se prueban con
  `?minijuego=<id>` en desarrollo.

## 6. Orden de construcción

| Bloque | Tipos | Motivo |
|--------|-------|--------|
| MJ-1 (antes del L1 si el playtest lo permite; si no, L2) | marco común, `clasificar`, `testigos`, `repaso` | son S, dan variedad al Ep. 1 con contenido que ya existe (pasillo, agua, Tomás y Zoraida) |
| MJ-2 (L2, Ep. 2) | `cotejar`, `cuentas`, interrogatorio con el diálogo | el Episodio 2 gira sobre documentos y cuentas |
| MJ-3 (L3, Ep. 3) | `linea-tiempo`, `ordenar`, `compuertas` | el reloj de la temporada |
| MJ-4 (L4) | `balanza`, `redactar` | contratos |
| MJ-5 (L5-L6) | `asamblea`, `ventanilla`, `buceo` | asambleas y la Oficina por dentro |
| MJ-6 (L7-L8) | `multitud` | la plaza y el cierre |

Cada bloque entra al backlog como tickets `E13.n` con criterios de aceptación en
`07-backlog-opus.md`. El contenido de cada minijuego pasa por la misma revisión jurídica
que las audiencias (dossier de revisión).
