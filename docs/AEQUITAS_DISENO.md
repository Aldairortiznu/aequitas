# AEQUITAS: El Retorno del Equilibrio — Documento de diseño

Versión del documento: v0.1 · Capítulo 1 jugable (Puerto Garza).

## 1. La idea en una frase
Un mundo colapsado vuelve a funcionar cuando la gente aprende a usar la ley. El jugador
no castiga a nadie: **escucha, investiga, prueba, concilia y enseña**, y la sociedad se
restablece a su alrededor.

## 2. El mundo
- **Distopía con nombres ficticios.** Una guerra de nueve años tumbó la luz, los puentes y
  las oficinas, y obligó a miles de familias a huir. Hace siete años se firmó el *Acuerdo
  de Altamar*: hay paz en el papel, pero en muchos pueblos todavía manda el más fuerte. El
  país se rehace pueblo por pueblo, unido por el río, con trueque, minga y memoria.
  Moneda: *fichas* de la Junta. La guerra es inventada: no se nombran grupos ni hechos reales.
- **Tono.** Respetuoso con el Caribe, su gente y su diáspora: personajes con dignidad y
  razones propias, sin caricatura ni chiste a costa de nadie. La cultura aparece como
  memoria viva (tambor alegre, bullerengue, décimas, la minga, el sancocho compartido) y
  el desplazamiento y el regreso (Don Anselmo, la Maestra Ulpiana) se cuentan con cuidado.
  La paz es también un mandato legal: la Constitución la llama derecho y deber (art. 22).
- **Ley real.** Las normas que se usan son colombianas y vigentes (Constitución de 1991,
  Código Civil, Ley 2220 de 2022, Ley 446 de 1998, Ley 2166 de 2021). Cada carta del Códice
  cita su artículo.
- **Lugares (todos inventados):** Altamar (la ciudad amurallada donde resiste la Biblioteca
  Experimental), Puerto Garza (capítulo 1), Puerto Alcaraván (río arriba), la Ciénaga del
  Silencio, Bahía Ceniza, el Caño Grande y Siete Puentes (capítulo 2).
- **Lo que quedó del mundo de antes:** un bus atravesado en el río donde volaron el puente,
  el campanario de la iglesia vieja partido en su isleta, torres de energía caídas,
  edificios sin techo y con hollín, paredes con agujeros tapados con latas, vallas
  desteñidas, celulares que ya no prenden.

### El mito
- **El Leviatán:** así llamaban los abuelos al Estado (jueces, escuelas, puentes,
  oficinas). En la guerra «el gigante cayó».
- **El Reino del Arbitrio:** lo que vino después: donde nadie escucha, manda el que grita.
- **La Bóveda de la Biblioteca Experimental**, bajo el mar Caribe: allí la **Orden de
  Bellium** guardó el Códice (Constitución, códigos, tratados de derechos humanos). Sus
  **Emisarios** no salen a conquistar: ayudan a cada pueblo a volver a pactar su ley.
- **La Margarita Dorada:** brota entre el asfalto donde una comunidad vuelve a confiar en
  su ley. Brota en la plaza de Puerto Garza al cerrar el caso.
- **La máxima:** «La ley del más fuerte solo deja ruinas. La ley civil es el suelo donde
  un pueblo siembra su futuro.»

### Escenas cinematográficas (postales)
Seis imágenes de los momentos míticos (heredadas de las postales de Reverdecer): *El Colapso
del Leviatán*, *La Bóveda de la Biblioteca*, *La travesía*, *La víspera*, *La Margarita
Dorada* y *Siete Puentes*. No se descargan: aparecen detrás del texto, dentro de las
cinemáticas y los diálogos, cuando una línea lleva `postal: '<clave>'`. Una línea con
`postal: 'off'` las quita. Se pueden volver a ver en «Escenas de la historia» (menú).
Están pintadas por código. Si se agregan ilustraciones en `public/assets/postales/`, el
juego las usa en su lugar (ver `docs/PROMPT_POSTALES.md`).

### Aprender de cada acierto
- **«¿Por qué funcionó?»** (`LessonScene`): después de cada objeción correcta y de cada buena
  decisión del acuerdo aparece una tarjeta en tres pasos: la norma, por qué aplica en este
  caso y qué recordar. Los textos están en `lesson` dentro de `data/ch1/hearing.js`.
- **Las preguntas del caso** (`data/ch1/mysteries.js`): una pregunta abierta guía la historia
  y se ve en el HUD. Al resolverla sale «¡Descubriste!» con la respuesta y la pregunta
  siguiente. La pestaña Misterios del expediente las reúne, y la última queda abierta como
  gancho del capítulo 2.
- **Guía:** flecha de borde con letrero (destino · distancia), chevrones junto al
  personaje y el nombre del objetivo sobre él.

## 3. La lógica del juego: del caos al equilibrio
El corazón de AEQUITAS es un ciclo que se repite en cada capítulo:

**Aprender → Aplicar → Enseñar → La comunidad lo adopta → El orden vuelve**

| Paso | En el juego |
|---|---|
| Aprender | Ganas cartas del Códice al resolver conflictos, investigar y encontrar páginas perdidas. |
| Aplicar | Usas pruebas y cartas en la audiencia (objeciones) y para proponer el acuerdo. |
| Enseñar | Ayudas a vecinos con un lío nuevo: eliges la norma que aplica y la explicas con palabras sencillas. |
| Adoptar | La gente cambia su conducta: el perro se amarra y se repara la red, se acaba el peaje, aparece una balanza pública, los niños llevan lo hallado a la Junta. |
| Restablecer | Sube el **Equilibrio del puerto** y el mundo cambia a la vista. |

### Equilibrio del puerto (0–100 %)
Etapas: **Caos** (manda el más fuerte) → **Tiranía del Puño** (la gente calla por miedo)
→ **Desconfianza** → **Convivencia** (los vecinos arreglan sus líos) → **Orden** (la Junta
vuelve a funcionar) → **Equilibrio** (la palabra pesa más que el puño).

Aportes en el capítulo 1: conocer a la Junta 5 · gallina 10 · alumbrado 10 · balanza 10 ·
retén 5 · las partes aceptan hablar 5 · cada enseñanza 5 (×4) · audiencia en paz 15 ·
acta firmada 15 (base 5). Sin las enseñanzas el capítulo termina en *Orden* (80 %); con
ellas, en *Equilibrio* (100 %).

**Cómo se ve:**
- **Color:** el puerto empieza gris y apagado, y recupera el color a medida que sube el orden.
- **Lo que desaparece:** los grafitis del Puño («AQUÍ MANDA EL PUÑO», «¡CALLADITOS!»), el
  letrero de peaje y la basura.
- **Los del Puño:** sus guardias se van.
- **Lo que aparece:** «AQUÍ SE HABLA», la balanza de la Junta, una cometa en el cielo,
  puestos nuevos en el mercado, banderines y gente celebrando.
- **Música:** tensa y en menor bajo el Puño, alegre cuando la gente vuelve a hablar, de
  fiesta cuando hay acta.
- **Personajes:** sus líneas cambian con el orden. Ramiro pasa de amenazar a aceptar la Junta.

## 4. Personajes
**Elige a quien viaja.** No hay elección de género: la gente le llama por su nombre, y su
nombre aparece en los diálogos y en el acta. Los textos se escriben en forma neutra
(«le damos la bienvenida», «gente de afuera») y usan `{nombre}` donde hace falta.

| Personaje | Quién es | Don |
|---|---|---|
Son los **Emisarios del Equilibrio** de la Orden de Bellium: llevan el tubo de códices al
hombro y el broche de la Margarita Dorada en el pecho.

| Personaje | Quién es | Don |
|---|---|---|
| Aurelio (hombre) | El Archivista: reconstruye actas y encuentra el decreto mal hecho; defiende el debido proceso | +1 pista de Lumen |
| Valeria (mujer) | La Cartógrafa: mapea los conflictos y convoca asambleas | Camina más rápido por el puerto |
| Kaelen (andrógino) | Custodio de los números: revisa cuentas y pagarés; sereno | Tinto calma dos veces por declaración |
| Sora (andrógino) | Centinela de bronce: máscara de la Orden; recuerda que los derechos no se negocian | +1 ♥ de confianza en la audiencia |

**Compañía:**
- **Lumen**, farol-archivo de la Biblioteca: da pistas y explica las normas.
- **Tinto**, el chigüiro: calma a la asamblea.
- **La Maestra Ulpiana**: guía desde la Biblioteca.

**Puerto Garza:**
- **Doña Fidelina**, presidenta de la Junta de Acción Comunal.
- **Ramiro "El Puño"** y su gente, quienes cobran peaje.
- **Las partes del caso:** los Ortega (Carmen y Julián) y Don Anselmo Mendoza.
- **Vecinos:** Rosa, Lucho, Chepe, Nubia, Nando, Mamá Tule, Yuli, el Mono, los pelaos…

## 5. Capítulo 1: recorrido
1. **Prólogo:**
   - En la Biblioteca se cuenta la guerra y el Acuerdo, y Ulpiana encarga la misión.
   - Minijuego *Remar* para llegar al puerto.
   - Llegada: el Puño cobra peaje y la Junta casi no se reúne.
2. **Confianza** (3 conflictos):
   - **La gallina de Rosa** (persecución + *Escucha activa*), carta C. C. art. 2353.
   - **La balanza de Chepe** (*El peso justo*), carta C. C. art. 1603.
   - **El muelle sin luz** (*Circuito* solar), carta C. C. art. 674.

   Con dos de ellos, el Mono abre el retén del puente.
3. **Enseñanzas** (opcionales; con 📖 sobre quien está listo para aprender):
   - el perro y la red (art. 2353);
   - el muelle es de todos (art. 674);
   - la balanza pública (art. 1603);
   - la cometa hallada (arts. 704 y 705).
4. **Investigación en el astillero:**
   - escuchar a las tres partes;
   - raspar el casco (nombre original);
   - juntar la matrícula rota (*Matrícula*);
   - buscar la placa del motor en la bodega oscura (*Linterna*);
   - conseguir el libro de hallazgos y el cuaderno de cuentas;
   - recoger los testimonios de Nando, Yuli y Lucho.
5. **Audiencia** (3 declaraciones, 11 frases, 9 contradicciones):
   - **Acciones:** preguntar, presentar pruebas o normas, pedir pistas, calma de Tinto.
   - **Al acertar:** cada objeción muestra la **norma aplicada**.
   - **Al errar:** cuesta confianza (♥).
6. **Acuerdo:**
   - **Cuatro decisiones**: dominio, gastos, futuro de la lancha y Julián. Lo ilegal no se
     puede mantener; lo "regular" sí, con otro final.
   - **Clasificar los recibos**: necesarios, útiles o voluptuarios (C. C., arts. 965 a 967).
   - **Ordenar el acta** y completar el monto (300 fichas) y los meses de arriendo
     compensados (6).
   - **Firmar.**
7. **Cierre:**
   - Epílogo (dos variantes).
   - Tres sellos: Legalidad, Equidad y Paz.
   - Rango, puntaje con récord, % de Equilibrio y "Lo que aprendiste".
   - Después, **recorrido libre por el puerto restaurado** y salida al capítulo 2.

## 6. Minijuegos
| Minijuego | Qué se juega | Qué enseña |
|---|---|---|
| Remar | Esquivar troncos y remolinos, recoger páginas | Llegada; páginas del Códice |
| Escucha activa | Elegir respuestas que bajan la tensión | Mediación; responsabilidad por animales (art. 2353) |
| El peso justo | Equilibrar la balanza con pesas | Buena fe contractual (art. 1603) |
| Circuito | Rotar cables del panel solar | Bienes de uso público (art. 674) |
| Raspar | Descubrir el nombre bajo la pintura | Ocupación: lo perdido tiene dueño (arts. 685, 704, 705) |
| Matrícula | Ordenar los pedazos del documento | Dominio y posesión (arts. 669, 762) |
| Linterna | Buscar la placa en la bodega a oscuras | Hallazgo: restituir pagando gastos (art. 708) |
| Ronda relámpago | ¿Legal o no? 10 de 24 afirmaciones, 6 s c/u | Repaso con artículo en cada respuesta |
| Enseñar | Elegir la norma y explicarla | Aplicar y transmitir la ley (4 lecciones) |
| El tablero de la Junta | 4 casos: elegir la norma y luego la conclusión; al final se ve la cadena completa | El silogismo jurídico: hechos + norma = conclusión (arts. 2353, 674, 1603; Const. arts. 13, 22, 24, 29) |
| Arma la norma | Unir cada «Si…» con su «…entonces» y ver el artículo | Estructura de la norma: supuesto de hecho y consecuencia (arts. 2341, 2353, 1602, 704–705; Const. arts. 24, 29) |

## 7. Mapa legal (el Códice)
Todas las cartas citan su fuente. Textos parafraseados con fidelidad a la norma.

| Carta | Norma | Dónde aparece |
|---|---|---|
| Ciudadanos que hacen justicia | Const. art. 116 | Inicio; objeción a Ramiro |
| Ni destierro ni confiscación | Const. art. 34 | Inicio; objeciones a Ramiro; acuerdo |
| Propiedad con función social | Const. art. 58 | Versión de Anselmo; objeción; acuerdo |
| Todos merecen ser escuchados | Const. art. 29 | Apertura de la audiencia |
| Estado social de derecho | Const. art. 1 | Página perdida |
| La vida es inviolable | Const. art. 11 | Página perdida |
| Iguales ante la ley | Const. art. 13 | Página perdida |
| Derechos con deberes | Const. art. 95 | Página perdida |
| La justicia es para todos | Const. art. 229 | Ronda relámpago |
| Jueces de paz | Const. art. 247 | Ronda relámpago |
| Dueño no es poseedor | C. C. arts. 669 y 762 | Matrícula; norma aplicada (placa) |
| Lo que es de todos | C. C. art. 674 | Circuito; enseñanza del muelle |
| Lo perdido sigue teniendo dueño | C. C. arts. 685, 704 y 705 | Raspar; objeción; enseñanza de la cometa |
| Cuando aparece el dueño | C. C. art. 708 | Linterna; objeción de gastos |
| La buena fe se presume | C. C. art. 769 | Libro de hallazgos; objeción |
| Lo producido de buena fe | C. C. art. 964 | Versión de Carmen; objeción |
| Gastos necesarios y mejoras | C. C. arts. 965 a 967 | Cuentas de Chepe; objeción; recibos |
| El tiempo cuenta, con reglas | C. C. arts. 2512, 2529 y 2532 | Versión de Julián; objeción |
| Lo pactado obliga | C. C. art. 1602 | Firma del acta |
| Cumplir de buena fe | C. C. art. 1603 | Balanza; enseñanza |
| Compensación | C. C. art. 1714 | Acuerdo (arriendo y deuda) |
| Arrendamiento | C. C. art. 1973 | Firma del acta (si hay arriendo) |
| Transacción | C. C. art. 2469 | Página perdida |
| Tu animal, tu responsabilidad | C. C. art. 2353 | Gallina; enseñanza del perro |
| Acta con mérito ejecutivo | Ley 2220 de 2022, art. 64 | Firma del acta |
| Justicia comunitaria | Ley 2220 de 2022, art. 5 · Ley 2166 de 2021, art. 50 | Fidelina; objeción a Ramiro |
| Reparar, no castigar | Ley 446 de 1998, art. 16 | Acuerdo (Julián / gastos) |

La Ronda relámpago suma además, en sus explicaciones:
- Constitución, art. 83 (buena fe ante las autoridades);
- Código Civil, art. 946 (acción reivindicatoria) y art. 2341 (responsabilidad civil).

**Revisión jurídica recomendada:** antes de publicar, el equipo legal de Bellium debería
revisar textos, ejemplos y simplificaciones (por ejemplo, la compensación entre mejoras y
arriendos, o el tratamiento de los frutos y las mejoras dentro de una conciliación).

## 8. Hoja de ruta (ideas para los capítulos siguientes)
- **Cap. 2 · Siete Puentes:** se cayó el puente colgante y nadie quiere pagarlo.
  - Responsabilidad civil y daños (C. C., arts. 2341 y ss.).
  - Culpas compartidas.
  - Reparación integral.
- **Cap. 3 · Un edificio de Altamar:** la propiedad horizontal sin administración.
  - Ley 675 de 2001: asamblea, cuotas y sanciones.
  - Bienes comunes esenciales que no se pueden restringir.
  - Jurisprudencia: no se cortan servicios por deudas de administración (SU-509 de 2001,
    T-454 de 1998, T-568 de 2002).
- **Más adelante:**
  - el agua compartida;
  - una herencia entre hermanos;
  - un contrato de trabajo en el muelle;
  - la elección de un juez de paz (Const. art. 247).

Cada capítulo repite el ciclo de restauración con su propio medidor de equilibrio.

## 9. Arquitectura (para el equipo técnico)
**Base técnica:**
- Phaser 3.90 + Vite, sin assets externos salvo cinco tiles de Tuxemon (CC BY-SA 3.0).
- Todo lo demás se dibuja por código.
- El audio es generativo, con Tone.js.

**Capítulos guiados por datos:**
- `src/data/ch1/` contiene el mapa en ASCII, los NPC y sus temas con condiciones
  (`'f:flag'`, `'c:carta'`, `'order>=60'`…), las recompensas, la audiencia, el acuerdo y
  la decoración según el orden.
- Para un capítulo nuevo se copia esa carpeta y se cambian los datos.

**Sistemas compartidos:**
- `story.js`: condiciones, objetivos y recompensas.
- `order.js`: equilibrio y etapas.
- `save.js`: guardado único en memoria.
- `text.js`: nombre del personaje (`{nombre}`) y normalización.

**Pruebas:**
- Recorridos automáticos con Playwright, de la pantalla de inicio al capítulo 2, en
  escritorio y en celular.
- Los atajos `window.__aeq` permiten saltar a cualquier punto.

## 10. Publicación
- **Repositorio oficial:** https://github.com/Aldairortiznu/aequitas (rama `main`).
- **Juego en línea:** https://aldairortiznu.github.io/aequitas/. GitHub Actions lo construye
  y lo publica en cada push a `main`.
- **Prototipo anterior:** el de septiembre (combate dialéctico; de ahí vienen los cuatro
  Emisarios) se conserva completo en la rama `prototipo-septiembre`.
- **Origen:** esta versión se desarrolló en la rama `claude/aequitas` del repositorio de
  Reverdecer, sobre su motor.
- **Convivencia:** el service worker usa su propio prefijo de caché (`aequitas-`) y el
  guardado su propia clave, así que no choca con otros juegos del mismo dominio ni con
  partidas del prototipo.
