// CAPÍTULO 1 — quién está en el puerto y de qué se puede hablar con cada uno.
//
// Tema: { id, label, req, lines, give, act, repeat }
//   req  : condiciones — 'f:x' (hito), '!f:x', 'i:x' (pruebas), '!i:x', 'c:x'
//          (carta), 'trust>=N', 'ready' / '!ready' (lista la audiencia).
//   give : al terminar — 'f:x' marca un hito, 'i:x' agrega al expediente,
//          'c:x' entrega una carta del Códice.
//   act  : acción que dispara el pueblo al terminar (minijuego, persecución...).
//   repeat: el tema no desaparece después de escucharlo.

const say = (s) => (t) => ({ s, t });
const F = say('fidelina');
const R = say('ramiro');
const M = say('mono');
const Ro = say('rosa');
const Lu = say('lucho');
const C = say('chepe');
const Nu = say('nubia');
const Y = say('yuli');
const T = say('tule');
const N = say('nando');
const Ca = say('carmen');
const J = say('julian');
const A = say('aurelio');
const L = say('lumen');
const Ti = say('tinto');
const E = say('explorador');
const P = say('pensamiento');
const Nota = say('nota');

// Personas en el mapa (baldosas). showIf: solo aparecen cuando se cumple.
export const NPCS = [
  { id: 'fidelina', tex: 'npc_fidelina', x: 30, y: 7 },
  { id: 'ramiro', tex: 'npc_ramiro', x: 36, y: 9, wander: 1 },
  { id: 'tule', tex: 'npc_tule', x: 15, y: 9 },
  { id: 'vecino', tex: 'npc_vecino', x: 23, y: 8 },
  { id: 'pelao', tex: 'npc_pelao', x: 34, y: 11, wander: 2 },
  { id: 'pelaa', tex: 'npc_pelaa', x: 28, y: 11, wander: 2 },
  { id: 'rosa', tex: 'npc_rosa', x: 6, y: 21 },
  { id: 'lucho', tex: 'npc_lucho', x: 11, y: 24 },
  { id: 'chepe', tex: 'npc_chepe', x: 25, y: 20 },
  { id: 'nubia', tex: 'npc_nubia', x: 36, y: 23 },
  { id: 'yuli', tex: 'npc_yuli', x: 30, y: 25, wander: 2 },
  { id: 'mono', tex: 'npc_mono', x: 42, y: 12 },
  { id: 'vecina', tex: 'npc_vecina', x: 7, y: 29 },
  { id: 'pescador', tex: 'npc_pescador', x: 9, y: 33 },
  { id: 'nando', tex: 'npc_nando', x: 32, y: 41, showIf: 'f:alumbrado_done' },
  { id: 'carmen', tex: 'npc_carmen', x: 49, y: 27 },
  { id: 'julian', tex: 'npc_julian', x: 58, y: 26 },
  { id: 'aurelio', tex: 'npc_aurelio', x: 54, y: 23 },
  // Los del Puño: cobran peaje y vigilan; se van cuando la gente aprende sus derechos.
  { id: 'puno1', tex: 'npc_puno', x: 33, y: 32, showIf: '!f:teach_muelle' },
  { id: 'puno2', tex: 'npc_puno2', x: 39, y: 24, showIf: 'order<60' },
];

// Cosas que se examinan con E (x, y en baldosas; r: radio en px).
export const SPOTS = [
  { id: 'letrero_muelle', x: 28, y: 34, r: 22 },
  { id: 'panel', x: 35, y: 35, r: 22 },
  { id: 'antena', x: 10, y: 9, r: 22 },
  { id: 'casco', x: 53, y: 31, r: 20 },
  { id: 'cabina', x: 56, y: 27, r: 20 },
  { id: 'bodega', x: 56, y: 21, r: 22 },
  { id: 'junta_puerta', x: 32, y: 6, r: 18 },
  // Restos del mundo de antes.
  { id: 'valla', x: 10, y: 12, r: 28 },
  { id: 'filtro', x: 40, y: 20, r: 20 },
  { id: 'bus', x: 16, y: 35, r: 26 },
  { id: 'campanario', x: 50, y: 35, r: 26 },
  { id: 'viaje', x: 32, y: 44, r: 22 },
];

export const TALK = {
  fidelina: [
    { id: 'mision', label: '¿Qué está pasando en el puerto?', req: ['!f:met_fidelina'], give: ['f:met_fidelina', 'c:justicia_comunitaria'], lines: [
      F('¡Bienvenid{o} a Puerto Garza! Soy Fidelina Carrascal, presidenta de la Junta de Acción Comunal.'),
      F('Siete años después del Acuerdo volvimos a pescar, a sembrar... y a discutir, que también es de humanos.'),
      F('Los Ortega y un señor de río arriba, Don Aurelio, se disputan la lancha. Es la única del puerto: con ella pescamos para todos.'),
      F('Ramiro y su gente estuvieron en la guerra y se quedaron con la costumbre de mandar a punta de puño: cobran peaje en el puente y en el muelle, y el que reclama se las ve con ellos.'),
      F('Quieren arreglar lo de la lancha a los golpes. Yo quiero arreglarlo bien. Por eso le escribimos a la Biblioteca.'),
      L('La Junta puede conciliar en equidad los conflictos de la comunidad. Nosotros ayudamos: escuchar, buscar pruebas, entender... y luego, la audiencia.'),
      F('Un consejo: aquí nadie le cree a un forastero. Ayude a la gente con sus líos y verá cómo se le abren las puertas. Hasta el retén del puente.'),
      L('Y algo más: cada norma que aprendas, enséñala. Cuando la gente sabe usar la ley, el Puño se queda sin poder. Mira la barra de Equilibrio del puerto.'),
    ] },
    { id: 'audiencia', label: '⚖ ¡Tengo el caso listo! Llamemos a audiencia', req: ['ready'], act: 'hearing', lines: [
      F('¿Ya tiene todo? ¡Entonces que suene la campana de la Junta!'),
      F('Ramiro, Carmen, Julián, Don Aurelio... ¡todo el mundo a la Casa de la Junta!'),
    ] },
    { id: 'confianza', label: '¿Cómo me gano la confianza del puerto?', req: ['f:met_fidelina', '!f:reten_open'], repeat: true, lines: [
      F('Hay tres líos esperando. En el barrio, Don Lucho tiene encerrada la gallina de Doña Rosa: dice que le dañó la cosecha.'),
      F('En el muelle, los faroles llevan semanas apagados. Y en el mercado, Nubia jura que la balanza de Chepe roba.'),
      F('Resuelva dos y el Mono le abre el puente. Resuelva los tres y el puerto entero le va a escuchar.'),
    ] },
    { id: 'libro', label: 'Carmen dice que anotó la lancha en un libro', req: ['i:carmen', '!i:libro_hallazgos'], give: ['i:libro_hallazgos', 'c:buena_fe'], lines: [
      F('¡El libro de hallazgos! Desde la guerra, todo lo que el río trae o la gente deja atrás se anota aquí. Para que nadie se adueñe de lo ajeno.'),
      Nota('«Año 1 después del Acuerdo. Carmen Ortega encontró una lancha encallada en la ciénaga, sin nadie a bordo. Motor rojo. Se guarda para su dueño.»'),
      L('Carmen anotó el hallazgo y esperó al dueño: eso es buena fe. Y la ley la presume. Lo que hay que probar es la mala fe.'),
    ] },
    { id: 'falta', label: '¿Podemos hacer ya la audiencia?', req: ['f:met_fidelina', '!ready'], repeat: true, act: 'missing', lines: [
      F('Todavía no. Si vamos a la audiencia sin pruebas, el Puño nos come vivos.'),
    ] },
    { id: 'despues', label: '¿Cómo sigue el puerto, Doña Fidelina?', req: ['f:caso_cerrado'], repeat: true, lines: [
      F('¡La Junta se reúne cada domingo, con las puertas abiertas! Hasta Ramiro viene... a escuchar.'),
      F('Ya nadie cobra peaje. Y cuando hay un lío, la gente dice: «llevémoslo a la Junta». ¿Quién lo hubiera creído?'),
    ] },
    { id: 'guerra', label: '¿Qué pasó en la guerra?', req: ['f:met_fidelina'], lines: [
      F('Nueve años, {explorador}. Se cayeron la luz, los puentes, las oficinas... y muchos tuvimos que huir. Algunos volvieron; otros todavía no.'),
      F('Los que se quedaron y los que regresaron tuvieron que aprender a vivir juntos otra vez. Para eso existe la Junta.'),
      L('El Acuerdo de Altamar puso fin a la guerra. Pero la paz, dice la Constitución, es también un deber de cada persona.'),
    ] },
  ],

  ramiro: [
    { id: 'quien', label: '¿Usted es Ramiro?', req: ['!f:met_ramiro'], give: ['f:met_ramiro'], lines: [
      R('¿Y usted quién es? ¿Otro que viene a decirnos qué hacer?'),
      R('Aquí la ley se murió en la guerra. Lo único que sirve es esto.'),
      P('Me muestra el puño. Tinto se pega a mis botas.'),
      L('Para que conste: la Constitución prohíbe el destierro y la confiscación. Ni el más fuerte del puerto puede saltarse eso.'),
    ] },
    { id: 'lancha', label: 'Hablemos de la lancha', req: ['f:met_ramiro'], lines: [
      R('La lancha es del pueblo, punto. Ese viejo Aurelio que se devuelva por donde vino.'),
      E('¿Y si la lancha sí es suya?'),
      R('...Pues que lo pruebe. Pero si los Ortega se quedan sin con qué pescar, ¿quién le da de comer a mis pelaos?'),
      P('Detrás del puño hay miedo. Miedo a quedarse sin nada.'),
    ] },
    { id: 'charla', label: '¿Qué opina de la audiencia?', req: ['f:met_ramiro', 'order<60'], repeat: true, lines: [
      R('¿Audiencia? Vaya, vaya a jugar a la justicia. Aquí lo espero cuando se canse.'),
    ] },
    { id: 'cambio', label: '¿Qué le pasa, Ramiro?', req: ['f:met_ramiro', 'order>=60', '!f:caso_cerrado'], repeat: true, lines: [
      R('¿Qué les anda enseñando usted a la gente? Ya nadie me paga el peaje. Todos quieren «hablar» y «llevarlo a la Junta».'),
      L('Nada mágico, Ramiro: aprendieron a usar la ley. Funciona mejor que el miedo.'),
      R('...Hmm.'),
    ] },
    { id: 'despues', label: '¿Y ahora, Ramiro?', req: ['f:caso_cerrado'], repeat: true, lines: [
      R('Primero la Junta. Después... también la Junta. ¿Así es la cosa?'),
      R('No me mire así. Uno también aprende.'),
    ] },
  ],

  mono: [
    { id: 'reten', label: '¿Puedo pasar al astillero?', req: ['!f:reten_open', 'trust<2'], repeat: true, act: 'trust', lines: [
      M('¡Alto ahí! Por orden del Puño, ningún forastero pasa al astillero.'),
      M('...A menos que la gente del puerto responda por usted. Ahí sí, de pronto.'),
    ] },
    { id: 'abre', label: '¿Ahora sí puedo pasar?', req: ['!f:reten_open', 'trust>=2'], give: ['f:reten_open'], act: 'open_reten', lines: [
      M('Ajá, ya me llegó el chisme: que usted anda arreglando los líos del puerto. ¡Hasta Doña Nubia habla bien de usted!'),
      M('Pase, pues. Pero no le diga al Puño que fui yo el que corrió los barriles.'),
    ] },
    { id: 'charla', label: '¿Todo bien por aquí?', req: ['f:reten_open'], repeat: true, lines: [
      M('Todo tranquilo. ¡Muy tranquilo! ...Oiga, ¿usted cree que yo serviría para conciliador?'),
    ] },
  ],

  rosa: [
    { id: 'gallina', label: '¿Qué le pasa, Doña Rosa?', req: ['!f:gallina_done', '!f:rosa_hablo'], give: ['f:rosa_hablo'], lines: [
      Ro('Ay, mij{o}. Don Lucho tiene encerrada a la Copetona, mi gallina. Con sus huevos comemos mis nietos y yo.'),
      Ro('Dice que se le metió a la huerta y le dañó la cosecha, y que no la devuelve hasta que alguien responda.'),
      L('Los dos pueden tener razón en algo. Vamos a escuchar a Don Lucho.'),
    ] },
    { id: 'espera', label: '¿Cómo sigue la Copetona?', req: ['!f:gallina_done', 'f:rosa_hablo'], repeat: true, lines: [
      Ro('¿Ya habló con Don Lucho? Mis nietos preguntan por la Copetona.'),
    ] },
    { id: 'charla', label: '¿Cómo va todo?', req: ['f:gallina_done'], repeat: true, lines: [
      Ro('La Copetona tiene corral nuevo, y Don Lucho y yo nos cambiamos huevos por tomates. Así vivíamos antes de la guerra.'),
    ] },
  ],

  lucho: [
    { id: 'gallina', label: 'Esa gallina es de Doña Rosa...', req: ['!f:gallina_done', '!f:gallina_caught'], repeat: true, act: 'chase', lines: [
      Lu('Tres veces se me ha metido esa gallina a la huerta. Tres.'),
      Lu('Mire mis tomates: picoteados. Meses de trabajo, en un tiempo en que no sobra nada.'),
      E('Entiendo su rabia, Don Lucho. ¿Y si lo resolvemos hablando con Doña Rosa?'),
      Lu('Hablando... ojalá. ¡Ay, se abrió el patio! Recójala, por favor, antes de que llegue otra vez a la huerta.'),
    ] },
    { id: 'mediar', label: 'Hablemos los tres, con calma', req: ['f:gallina_caught', '!f:gallina_done'], repeat: true, act: 'mg:escucha', lines: [
      Lu('Está bien, hablemos los tres. Con respeto, eso sí.'),
    ] },
    { id: 'noche', label: '¿Ha visto algo raro en el puerto?', req: ['f:gallina_done', '!i:lucho'], give: ['i:lucho'], lines: [
      Lu('Ahora que somos amigos le cuento: la otra noche, desde la huerta, vi al pelao Julián cargando algo de metal hacia la bodega de Chepe.'),
      Lu('Brillaba con la luna. Y caminaba como quien no quiere que lo vean.'),
    ] },
    { id: 'charla', label: '¿Cómo va la huerta?', req: ['f:gallina_done'], repeat: true, lines: [
      Lu('Rosa me trae huevos cada semana y yo le llevo tomates. Volvimos a ser vecinos.'),
    ] },
  ],

  chepe: [
    { id: 'peso', label: '¿Qué pasa con su balanza?', req: ['!f:peso_done'], repeat: true, act: 'mg:peso', lines: [
      C('Bienvenid{o} a Variedades Chepe. Aquí se cambia arroz por gasolina y gasolina por anzuelos.'),
      Nu('¡Y se pierde en el peso!'),
      C('Mi balanza es honrada, Nubia. Como yo.'),
      Nu('Le vendí diez kilos de bocachico y me pagó ocho. ¡Ocho!'),
      L('Hagamos una prueba con las pesas de la Junta. Sin acusar a nadie: que hable la balanza.'),
    ] },
    { id: 'cuentas', label: '¿Los Ortega le compraron repuestos?', req: ['f:peso_done', 'f:met_partes', '!i:recibos'], give: ['i:recibos', 'c:expensas'], lines: [
      C('¡Claro! El pistón, el parche, la pintura, el toldo... ¡hasta un parlante! Todo anotado, con fecha y firma.'),
      C('Un comerciante sin cuaderno es un comerciante sin memoria. Tome una copia.'),
      L('Estos recibos dicen cuánto se invirtió en la lancha. Ojo: la ley no trata igual un gasto necesario que un capricho.'),
    ] },
    { id: 'llave', label: '¿Me presta la llave de la bodega?', req: ['f:peso_done', 'f:met_partes', '!i:llave_bodega'], give: ['i:llave_bodega'], lines: [
      C('¿La bodega? Ahí no hay sino cosas de antes de la guerra... Pero tome.'),
      C('Entre con cuidado, que el piso está flojo.'),
    ] },
    { id: 'charla', label: '¿Cómo va el negocio?', req: ['f:peso_done'], repeat: true, lines: [
      C('Desde que arreglamos la balanza, Nubia me compra hasta el café. ¡Así da gusto!'),
    ] },
  ],

  nubia: [
    { id: 'ensenar', label: '📖 Enseñar: ¿cómo evitar otra pelea por el peso?', req: ['f:peso_done', '!f:teach_balanza'], repeat: true, teach: true, act: 'teach:balanza', lines: [
      Nu('Con Chepe ya estamos en paz... pero los otros vendedores andan desconfiados. ¿Y si otra balanza se tuerce?'),
      L('Tú ya sabes qué dice la ley de los contratos. ¿Se lo explicas?'),
    ] },
    { id: 'peso', label: '¿Qué pasó con el pescado?', req: ['!f:peso_done'], repeat: true, lines: [
      Nu('Ese Chepe... diez kilos de bocachico y me pagó ocho. ¡Ocho! Yo no sé de leyes, pero sé contar pescados.'),
    ] },
    { id: 'charla', label: '¿Quedaron en paz?', req: ['f:peso_done'], repeat: true, lines: [
      Nu('Ya me pagó lo que faltaba y arregló la balanza. Mire: hasta le regalé un bocachico.'),
    ] },
  ],

  yuli: [
    { id: 'hola', label: '¡Hola, Yuli!', lines: [
      Y('¿Usted viene de la Biblioteca? ¿Es verdad que allá guardan los libros que se salvaron?'),
      L('Muchos, Yuli. Y yo llevo copia de algunos: soy un archivo que habla.'),
      Y('Mi abuela dice que en la guerra se quemó la escuela. ¿Usted me enseña algo?'),
      L('Lo que quieras. Empecemos por esto: aquí todas las personas tienen derecho a ser escuchadas.'),
    ] },
    { id: 'julian', label: '¿Conoces a Julián?', req: ['f:met_partes', '!i:yuli'], give: ['i:yuli'], lines: [
      Y('Julián es mi primo. Anoche lo vi escondiendo una placa brillante en la bodega, detrás de las redes viejas.'),
      Y('No le diga que yo le dije... ¿Eso es chismear o es decir la verdad?'),
      L('Decir la verdad para que nadie salga perjudicado no es chisme, Yuli. Es valentía.'),
    ] },
    { id: 'charla', label: '¿Qué quieres ser de grande?', repeat: true, lines: [
      Y('¡Exploradora de la Biblioteca! O piloto de lancha. O las dos cosas.'),
    ] },
  ],

  tule: [
    { id: 'memoria', label: 'Cuénteme de los tiempos de antes', lines: [
      T('Mij{o}, yo tengo noventa años. Vi este puerto con fiesta, lo vi en la guerra y ahora lo veo levantarse.'),
      T('En la guerra nos quitaron casi todo. Lo que no pudieron quitarnos fue el canto: los bullerengues, las décimas y los nombres de los que no volvieron, que seguimos diciendo.'),
      L('La memoria también es una forma de justicia, Mamá Tule.'),
    ] },
    { id: 'lancha', label: '¿Usted conocía esa lancha?', req: ['f:met_fidelina', '!i:tule'], give: ['i:tule'], lines: [
      T('Esa lancha yo la vi en Puerto Alcaraván, antes de la guerra, cuando iba al mercado. Motor rojo, de los que suenan como tos de viejo.'),
      T('Y tenía nombre de niña, eso sí me acuerdo. ¿Cómo era...? Ay, la memoria.'),
    ] },
    { id: 'charla', label: '¿Algún consejo, Mamá Tule?', repeat: true, lines: [
      T('Lo que la guerra rompió no lo arregla nadie solo, mij{o}. Se arregla entre todos, y hablando.'),
    ] },
  ],

  nando: [
    { id: 'ensenar', label: '📖 Enseñar: ¿pueden cobrar por usar el muelle?', req: ['c:art674', '!f:teach_muelle'], repeat: true, teach: true, act: 'teach:muelle', lines: [
      N('Volvió la luz, pero los del Puño siguen cobrando dos fichas por amarrar. Dicen que el muelle es de ellos.'),
      L('Tú ya conoces la regla de los bienes de uso público. ¿Se la explicas?'),
    ] },
    { id: 'luces', label: '¡Volvió la luz!', lines: [
      N('¡Por fin luz en el muelle! Ya se puede pescar de noche sin partirse una pata.'),
    ] },
    { id: 'lancha', label: '¿Qué sabe de la lancha de los Ortega?', req: ['!i:nando'], give: ['i:nando'], lines: [
      N('La noche que la guerra llegó a Puerto Alcaraván, yo estaba río abajo, escondido entre los manglares.'),
      N('Vi bajar esa lancha sola, vacía, dando vueltas en la corriente. Nadie la venía manejando.'),
      N('Si alguien dice que se la robaron... no fue así. Se la llevó el río.'),
    ] },
    { id: 'charla', label: '¿Qué tal la pesca?', repeat: true, lines: [
      N('¿Ve esas luces? Las encendió usted. Ahora el muelle es de todos otra vez.'),
    ] },
  ],

  carmen: [
    { id: 'version', label: 'Cuénteme su versión', req: ['!i:carmen'], give: ['i:carmen', 'c:frutos'], lines: [
      Ca('La encontramos encallada en la ciénaga, llena de barro. La sacamos entre seis vecinos.'),
      Ca('La anoté en el libro de la Junta, como se debe. Esperamos un año, dos, tres... nadie vino. Pensamos que su dueño no había sobrevivido.'),
      Ca('La arreglamos con lo poco que teníamos. Con ella comió este puerto siete años.'),
      L('Lo que la lancha produjo mientras la tuvieron de buena fe no se vuelve una deuda. Anótalo.'),
    ] },
    { id: 'gastos', label: '¿Cuánto invirtieron en ella?', req: ['i:carmen'], repeat: true, lines: [
      Ca('Todo está en el cuaderno de Chepe: el pistón, el parche, la pintura... Chepe anota hasta los suspiros.'),
    ] },
    { id: 'miedo', label: '¿Qué es lo que más le preocupa?', req: ['i:carmen'], lines: [
      Ca('No me da miedo perder la lancha, {explorador}. Me da miedo que el puerto vuelva a pasar hambre.'),
    ] },
  ],

  julian: [
    { id: 'version', label: 'Cuéntame tu versión', req: ['!i:julian'], give: ['i:julian', 'c:prescripcion'], lines: [
      J('¡Esa lancha es nuestra! Él la perdió, nosotros la salvamos. ¡Siete años, compadre!'),
      J('La ley dice que si uno tiene algo mucho tiempo, ya es de uno. ¿O no?'),
      L('La ley sí le da valor al tiempo... pero con reglas precisas. Guardemos esto para la audiencia.'),
    ] },
    { id: 'placa', label: '¿Sabes algo de la placa del motor?', req: ['i:julian'], repeat: true, lines: [
      J('¿Placa? ¿Cuál placa? Yo... yo no sé de ninguna placa. ¡Esa lancha nunca tuvo placa!'),
      P('Julián mira para otro lado. Le sudan las manos.'),
    ] },
  ],

  aurelio: [
    { id: 'version', label: 'Cuénteme su versión, Don Aurelio', req: ['!i:aurelio'], give: ['i:aurelio', 'c:art58'], lines: [
      A('Aurelio Mendoza Pacheco, para servirle. Esa lancha es la Niña Mercedes, como mi madre. La compré con veinte años de trabajo.'),
      A('Cuando la guerra llegó a Alcaraván tuve que huir con lo que llevaba puesto. La lancha se quedó en el muelle.'),
      A('Viví siete años desplazado, río arriba. Tengo la matrícula... bueno, media. La otra mitad se quemó con mi casa.'),
      L('La Constitución protege la propiedad. Y también le recuerda que tiene una función social. Las dos cosas valen.'),
    ] },
    { id: 'matricula', label: 'Encontré la otra mitad de un documento', req: ['i:media_matricula', '!i:matricula'], repeat: true, act: 'mg:matricula', lines: [
      A('¿Usted encontró la otra mitad? ¡Déjeme ver! Ayúdeme a juntarla, que los años la dejaron hecha trizas.'),
    ] },
    { id: 'ramiro', label: '¿Y lo del Puño?', req: ['i:aurelio'], lines: [
      A('Ese señor me quiere echar del pueblo. Yo no vine a quitarle la comida a nadie. Vine por lo que es mío... y a volver a trabajar.'),
    ] },
    { id: 'charla', label: '¿Cómo se siente, Don Aurelio?', req: ['i:aurelio'], repeat: true, lines: [
      A('Mi madre decía: «lo que es de uno vuelve». Yo también volví. Nunca dijo que fuera fácil.'),
    ] },
  ],

  vecino: [
    { id: 'charla', label: '¿Qué opina del lío de la lancha?', repeat: true, lines: [
      { s: 'vecino', t: 'Yo voto porque se resuelva hablando. Con el Puño ya tuvimos suficiente.' },
    ] },
    { id: 'antes', label: '¿Cómo era esto antes de la guerra?', lines: [
      { s: 'vecino', t: 'Por aquí pasaba la carretera, ¿sabe? Había luz toda la noche, señal de celular, bus cada hora...' },
      { s: 'vecino', t: 'En la guerra volaron el puente, y el bus quedó ahí, a medias en el río. Uno aprende a vivir con lo que queda.' },
      L('Se cayeron los puentes y las oficinas, pero no las leyes: siguen escritas, esperando que alguien las use.'),
    ] },
  ],
  vecina: [
    { id: 'charla', label: '¡Buenas!', repeat: true, lines: [
      { s: 'vecina', t: 'Aquí, cuando algo se arregla, se celebra con sancocho para todos en la Junta. Ojalá sea pronto.' },
    ] },
    { id: 'fichas', label: '¿Qué son esas fichas que usan para pagar?', lines: [
      { s: 'vecina', t: 'Son la plata de ahora: tapas marcadas con el sello de la Junta. Una ficha, una libra de arroz.' },
      { s: 'vecina', t: 'Valen porque todos confiamos en ellas. El día que alguien haga trampa con las fichas, se nos cae el pueblo.' },
      L('Una moneda, como un contrato, vale lo que vale la confianza. Por eso la ley protege la buena fe.'),
    ] },
  ],
  pescador: [
    { id: 'red', label: '¿Qué le pasó a su red?', req: ['!c:art2353', '!f:teach_perro'], lines: [
      { s: 'pescador', t: 'El Canelo, el perro de la vecina, me la rompió. Y aquí, desde la guerra, el que reclama termina a los golpes.' },
      L('Guardemos esto: cuando aprendamos qué dice la ley sobre los daños de los animales, podremos ayudarles.'),
    ] },
    { id: 'ensenar', label: '📖 Enseñar: el perro de la vecina rompió la red', req: ['c:art2353', '!f:teach_perro'], repeat: true, teach: true, act: 'teach:perro', lines: [
      { s: 'pescador', t: '¡Mire mi red! El Canelo la dejó hecha flecos.' },
      { s: 'vecina', t: '¡El perro es libre! Yo no tengo la culpa de lo que haga.' },
      L('Tú ya aprendiste esta regla con la gallina de Doña Rosa. ¿Les ayudas a entenderla?'),
    ] },
    { id: 'canelo', label: '¿Cómo va el Canelo?', req: ['f:teach_perro'], repeat: true, lines: [
      { s: 'pescador', t: 'Amarrado de noche y cuidando las canoas de día. ¡Ese perro ya es empleado del muelle!' },
    ] },
    { id: 'charla', label: '¿Cómo está el río?', repeat: true, lines: [
      { s: 'pescador', t: 'Desde que la Biblioteca reabrió la ruta del Caño Grande, bajan comerciantes otra vez. Y con ellos... los líos.' },
    ] },
    { id: 'gasolina', label: '¿Por qué pesca con remo?', lines: [
      { s: 'pescador', t: 'Porque la gasolina vale más que el pescado. Un galón cuesta veinte fichas, y eso si baja el bote de los combustibles.' },
      { s: 'pescador', t: 'Por eso la lancha de los Ortega es tan importante: es la única con motor. Sin ella, el puerto pesca la mitad.' },
    ] },
  ],
  pelao: [
    { id: 'cometa', label: '¿Por qué pelean?', req: ['!c:ocupacion', '!f:teach_cometa'], repeat: true, lines: [
      { s: 'pelao', t: '¡Encontré una cometa en las ruinas y ella dice que es suya!' },
      { s: 'pelaa', t: '¡Yo la vi primero!' },
      L('¿Lo perdido es de quien lo encuentra? Guardemos la pregunta: pronto vamos a saber la respuesta.'),
    ] },
    { id: 'ensenar', label: '📖 Enseñar: ¿de quién es la cometa?', req: ['c:ocupacion', '!f:teach_cometa'], repeat: true, teach: true, act: 'teach:cometa', lines: [
      { s: 'pelao', t: '¡Es mía, la encontré yo!' },
      { s: 'pelaa', t: '¡Mentira, yo la vi primero!' },
      L('Con la lancha aprendiste qué pasa con lo que se encuentra. ¿Se lo enseñas?'),
    ] },
    { id: 'charla', label: '¡Hola!', repeat: true, lines: [
      { s: 'pelao', t: '¿Ese chigüiro viaja con usted? ¿Lo puedo acariciar?' },
      L('Despacio y con cuidado: así se gana su confianza. Igual que con la gente.'),
    ] },
    { id: 'celular', label: '¿Qué tienes ahí?', lines: [
      { s: 'pelao', t: 'Un celular del mundo de antes. Lo saqué de los escombros. No prende... pero lo guardo.' },
      P('En la pantalla rota se ve mi cara y, detrás, el cielo del puerto.'),
      { s: 'pelao', t: 'Mi abuela dice que con estos se hablaba con gente de otros países. Mi tío vive lejos desde la guerra. Algún día lo voy a llamar.' },
    ] },
  ],
  pelaa: [{ id: 'charla', label: '¡Hola!', repeat: true, lines: [
    { s: 'pelaa', t: 'Cuando vuelva la luz al muelle, mi abuela va a tocar el tambor alegre otra vez. Dice que la cumbia también es memoria.' },
  ] }],

  puno1: [{ id: 'peaje', label: '¿Por qué cobran peaje?', repeat: true, lines: [
    { s: 'puno', t: 'Porque el muelle es del Puño. Dos fichas por amarrar. ¿Algún problema?' },
    L('El muelle es un bien de todos. Cuando la gente conozca esa regla, este peaje se acaba solo.'),
  ] }],
  puno2: [{ id: 'circule', label: '¿Todo bien por aquí?', repeat: true, lines: [
    { s: 'puno', t: 'Circule, circule. Aquí no se pregunta: aquí se obedece.' },
    P('Los vendedores bajan la mirada cuando pasa. El miedo también es una forma de desorden.'),
  ] }],

  // ------------------------------------------------------------ cosas
  letrero_muelle: [{ id: 'leer', label: 'Leer', repeat: true, lines: [
    Nota('REGLAMENTO DEL MUELLE · Junta de Acción Comunal. 1. El muelle es de todos. 2. Nadie cobra por usarlo. 3. Las luces se cuidan entre todos.'),
  ] }],
  panel: [
    { id: 'arreglar', label: 'Revisar el panel', req: ['!f:alumbrado_done'], repeat: true, act: 'mg:circuito', lines: [
      Nota('El panel solar funciona... pero los cables a los faroles están revueltos, como si alguien los hubiera conectado a ciegas.'),
      L('Si reconectamos el circuito, el muelle vuelve a tener luz. ¡Manos a la obra!'),
    ] },
    { id: 'listo', label: 'Revisar el panel', req: ['f:alumbrado_done'], repeat: true, lines: [Nota('El panel zumba contento. Los faroles brillan sobre el agua.')] },
  ],
  antena: [{ id: 'radio', label: 'Usar la radio de la Biblioteca', repeat: true, act: 'mg:quiz', lines: [
    { s: 'ulpiana', t: 'Aquí la Biblioteca. ¿Me escuchas, {Explorador}? ¿List{o} para una Ronda Relámpago? Diez preguntas, seis segundos cada una.' },
  ] }],
  casco: [
    { id: 'antes', label: 'Mirar la lancha', req: ['!f:met_partes'], repeat: true, lines: [Nota('Una lancha turquesa sobre los rieles. En el casco dice «LA ESPERANZA».')] },
    { id: 'raspar', label: 'Examinar el casco', req: ['f:met_partes', '!i:nombre_original'], repeat: true, act: 'mg:raspar', lines: [
      P('Debajo de la pintura nueva se adivinan letras viejas. Si raspo con cuidado...'),
    ] },
    { id: 'despues', label: 'Mirar el casco', req: ['i:nombre_original'], repeat: true, lines: [P('«NIÑA MERCEDES». El nombre viejo asoma bajo la pintura.')] },
  ],
  cabina: [
    { id: 'antes', label: 'Mirar la cabina', req: ['!f:met_partes'], repeat: true, lines: [Nota('La cabina de la lancha. Mejor no tocar nada sin hablar antes con los dueños... o con quienes dicen serlo.')] },
    { id: 'buscar', label: 'Revisar la cabina', req: ['f:met_partes', '!i:media_matricula', '!i:matricula'], give: ['i:media_matricula'], lines: [
      P('Bajo el banco de la cabina hay un papel viejo, clavado con una tachuela.'),
      Nota('Es la mitad de un documento: «...ATRÍCULA DE EMBARC... MOTOR SERIE MR-44...»'),
      L('¡La otra mitad de la matrícula de Don Aurelio! Llévasela.'),
    ] },
    { id: 'vacia', label: 'Mirar la cabina', req: ['i:media_matricula'], repeat: true, lines: [Nota('Bajo el banco quedó la marca de la tachuela.')] },
  ],
  bodega: [
    { id: 'cerrada', label: 'Abrir la bodega', req: ['!i:llave_bodega'], repeat: true, lines: [
      Nota('La puerta de la bodega tiene un candado oxidado. Don Chepe guarda las llaves de todo el mercado.'),
    ] },
    { id: 'entrar', label: 'Entrar a la bodega', req: ['i:llave_bodega', '!i:placa_motor'], repeat: true, act: 'mg:linterna', lines: [
      P('La llave entra. Adentro está oscuro como boca de lobo.'),
    ] },
    { id: 'vista', label: 'Mirar la bodega', req: ['i:placa_motor'], repeat: true, lines: [Nota('La bodega huele a redes viejas y a gasolina.')] },
  ],
  valla: [{ id: 'leer', label: 'Leer la valla vieja', repeat: true, lines: [
    Nota('Una valla del mundo de antes, desteñida por el sol: «PUERTO GARZA · CONSTRUIMOS FUTURO».'),
    Nota('Debajo, alguien escribió con carbón: «Y LO VAMOS A LOGRAR. PERO HABLANDO».'),
    L('Antes el futuro se prometía en vallas. Ahora se construye en la Junta, un acuerdo a la vez.'),
  ] }],
  filtro: [{ id: 'mirar', label: 'Mirar el filtro de agua', repeat: true, lines: [
    Nota('Un filtro hecho con barriles, arena y carbón. El letrero dice: «AGUA HERVIDA · GRATIS · CUIDARLA ES DE TODOS».'),
    L('El agua limpia aquí es un bien común: nadie la vende, la Junta la cuida y cada familia pone su turno de leña.'),
  ] }],
  bus: [{ id: 'mirar', label: 'Mirar el bus del puente', repeat: true, lines: [
    Nota('Un bus amarillo, a medias en el río, donde antes estaba el puente. En el letrero de la ruta todavía se lee: «ALCARAVÁN — ALTAMAR».'),
    P('Dicen que lo atravesaron para cerrar el paso en la guerra, y que el puente cayó después.'),
    L('Ahora las garzas anidan en él. La vida vuelve a ocupar lo que dejó la guerra.'),
  ] }],
  campanario: [{ id: 'mirar', label: 'Mirar el campanario', repeat: true, lines: [
    Nota('El campanario de la iglesia vieja, en la isleta. Le falta medio techo desde la guerra, y la campana no ha vuelto a sonar.'),
    L('Los pescadores lo usan de faro. Dicen que el día que haya paz de verdad en el puerto, alguien la volverá a tocar.'),
  ] }],
  viaje: [
    { id: 'antes', label: 'Mirar la canoa de la Biblioteca', req: ['!f:caso_cerrado'], repeat: true, lines: [
      Nota('La canoa de la Biblioteca espera amarrada al final del muelle. Todavía no: hay un caso que resolver.'),
    ] },
    { id: 'seguir', label: 'Seguir el viaje (Capítulo 2)', req: ['f:caso_cerrado'], repeat: true, act: 'next_chapter', lines: [
      L('Puerto Garza ya puede andar sin nosotros. ¿Seguimos río abajo?'),
    ] },
  ],
  junta_puerta: [{ id: 'puerta', label: 'Mirar la Casa de la Junta', repeat: true, lines: [
    Nota('JUNTA DE ACCIÓN COMUNAL · PUERTO GARZA. En la puerta, una campana de bronce y un letrero: «Aquí se habla, no se grita».'),
  ] }],
};
