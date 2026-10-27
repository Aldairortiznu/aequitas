// CAPÍTULO 1 — datos de los minijuegos.

// "Escucha activa": mediar entre Rosa y Lucho eligiendo la respuesta que baja
// la tensión. ok: índice de la respuesta correcta. tip: la lección de la ronda.
export const ESCUCHA = {
  rounds: [
    {
      who: 'lucho', t: '¡Esa gallina es una plaga y su dueña una irresponsable!',
      options: ['Usted está muy molesto: perdió meses de trabajo en la huerta.', 'Cálmese, que es solo una gallina.', '¡Pues usted tampoco puso una cerca!'],
      ok: 0, tip: 'Reconocer la emoción y la pérdida baja la tensión. Minimizar o contraatacar la sube.',
    },
    {
      who: 'rosa', t: '¡Ese viejo me quiere robar mi gallina!',
      options: ['Ya, Doña Rosa, nadie le va a robar nada. No exagere.', 'Si la gallina dañó la huerta, usted la pierde y punto.', 'La Copetona es muy importante para usted y teme perderla.'],
      ok: 2, tip: 'Detrás de cada grito hay algo que la persona teme perder.',
    },
    {
      who: 'lucho', t: 'Lo único que quiero es que respeten mi huerta.',
      options: ['Pues compre una escopeta.', 'Entonces lo que necesita es que la huerta quede protegida.', 'Eso no es problema mío, Don Lucho.'],
      ok: 1, tip: 'Las posiciones chocan; las necesidades se pueden negociar.',
    },
    {
      who: 'rosa', t: 'Yo nunca quise hacerle daño a nadie...',
      options: ['Pero lo hizo, así que pague y ya.', '¿Qué podría hacer usted para reparar lo que pasó?', 'Bueno, entonces aquí no pasó nada.'],
      ok: 1, tip: 'Preguntar por la reparación mira hacia el futuro, sin humillar a nadie.',
    },
  ],
  need: 3,
  seconds: 9,
};

// "Ronda relámpago" por radio: ¿es legal o no? (se juegan 10 al azar).
export const QUIZ = [
  { t: 'La asamblea puede votar para quitarle la casa a un vecino.', a: false, why: 'Se prohíbe la confiscación y se protege la propiedad (Const. arts. 34 y 58).' },
  { t: 'Si encuentras algo que parece perdido, debes buscar a su dueño.', a: true, why: 'Hay que ponerlo a disposición de su dueño o de la autoridad (C. C. arts. 704 y 705).' },
  { t: 'Un conciliador puede imponer castigos físicos.', a: false, why: 'Conciliar es ayudar a las partes a acordar, nunca castigar.' },
  { t: 'Un contrato bien hecho obliga a quienes lo firman.', a: true, why: 'Es ley para los contratantes (C. C. art. 1602).' },
  { t: 'Si tu perro daña la huerta del vecino, respondes tú.', a: true, why: 'El dueño del animal responde por sus daños (C. C. art. 2353).' },
  { t: 'Al que roba se le puede desterrar del pueblo.', a: false, why: 'El destierro está prohibido (Const. art. 34).' },
  { t: 'Todos tienen derecho a ser escuchados antes de una decisión que los afecta.', a: true, why: 'Es parte del debido proceso (Const. art. 29).' },
  { t: 'La plaza del pueblo es de quien la cerque primero.', a: false, why: 'Las plazas son bienes de uso público: de todos (C. C. art. 674).' },
  { t: 'La buena fe se presume; la mala fe hay que probarla.', a: true, why: 'Así lo dice el Código Civil (art. 769).' },
  { t: 'Por ley, las hijas heredan menos que los hijos.', a: false, why: 'Todas las personas son iguales ante la ley (Const. art. 13).' },
  { t: 'Si un derecho es tuyo, puedes abusar de él.', a: false, why: 'Es deber no abusar de los propios derechos (Const. art. 95).' },
  { t: 'La Constitución permite la pena de muerte para los crímenes más graves.', a: false, why: 'El derecho a la vida es inviolable: no hay pena de muerte (Const. art. 11).' },
  { t: 'Dos personas que se deben dinero mutuamente pueden compensar sus deudas.', a: true, why: 'Es la compensación (C. C. art. 1714).' },
  { t: 'Un acuerdo de conciliación no sirve de nada si una parte se arrepiente.', a: false, why: 'El acta presta mérito ejecutivo y tiene carácter de cosa juzgada (Ley 2220 de 2022, art. 64).' },
  { t: 'Particulares y autoridades deben actuar de buena fe.', a: true, why: 'Lo manda la Constitución, que además presume la buena fe en las gestiones ante las autoridades (art. 83).' },
  { t: 'Quien por su culpa le causa un daño a otro debe indemnizarlo.', a: true, why: 'Es la responsabilidad civil extracontractual (C. C. art. 2341).' },
  { t: 'El dueño de una cosa puede reclamarla a quien la tenga en su poder.', a: true, why: 'Es la acción reivindicatoria o de dominio (C. C. art. 946).' },
  { t: 'Con siete años de posesión, sin ningún título, ya eres dueño.', a: false, why: 'Sin título, la prescripción extraordinaria exige 10 años (C. C. art. 2532).' },
  { t: 'Las mejoras de lujo (voluptuarias) siempre se tienen que pagar.', a: false, why: 'No se pagan, aunque quien las hizo puede retirarlas si no daña la cosa (C. C. art. 967).' },
  { t: 'La ley puede crear jueces de paz que resuelvan conflictos en equidad.', a: true, why: 'Lo permite la Constitución (art. 247).' },
  { t: 'Una transacción puede evitar un pleito que todavía no ha empezado.', a: true, why: 'La transacción termina un litigio pendiente o precave uno eventual (C. C. art. 2469).' },
  { t: 'Quien poseía de buena fe debe devolver todo lo que la cosa le produjo.', a: false, why: 'No devuelve los frutos percibidos antes de contestar la demanda (C. C. art. 964).' },
  { t: 'Toda persona tiene derecho a acceder a la justicia.', a: true, why: 'Lo garantiza la Constitución (art. 229).' },
  { t: 'Una persona particular nunca puede ayudar a administrar justicia.', a: false, why: 'Puede hacerlo de forma transitoria, por ejemplo como conciliadora o árbitra (Const. art. 116).' },
];
export const QUIZ_ROUNDS = 10;

// ENSEÑAR: {el} {explorador} aplica una norma que ya aprendió y se la explica a
// la gente con palabras sencillas. Paso 1: ¿qué carta del Códice aplica?
// Paso 2: ¿cómo lo explicas? Si la entienden, la adoptan y el puerto recupera
// orden. left/right: quienes están en el lío.
export const TEACH = {
  perro: {
    title: 'El perro y la red',
    left: 'npc_pescador', right: 'npc_vecina',
    situation: 'El Canelo, el perro de la vecina, rompió la red del pescador. Ella dice: «El perro es libre, no es culpa mía».',
    card: 'art2353', distractors: ['art674', 'art13'],
    q: '¿Cómo se lo explicas con tus palabras?',
    options: [
      { t: 'El perro es libre: nadie tiene que responder por lo que haga.', ok: false, fb: 'Así no: el dueño de un animal responde por los daños que cause (C. C., art. 2353).' },
      { t: 'Quien es dueña del perro responde por el daño: arreglen la red entre los dos y amarren al Canelo de noche.', ok: true, fb: 'El dueño de un animal responde por los daños que este cause (C. C., art. 2353). Y repararlo juntos evita la pelea.' },
      { t: 'El pescador se puede quedar con el perro hasta que le paguen.', ok: false, fb: 'Eso sería hacerse justicia por mano propia. Lo que corresponde es reparar el daño.' },
    ],
  },
  muelle: {
    title: '¿De quién es el muelle?',
    left: 'npc_nando', right: 'npc_puno',
    situation: 'Los del Puño cobran dos fichas por amarrar en el muelle. Nando no sabe si tienen derecho a cobrar.',
    card: 'art674', distractors: ['art58', 'art1603'],
    q: '¿Qué le explicas a Nando?',
    options: [
      { t: 'El muelle es de quien lo vigila: si el Puño lo cuida, puede cobrar.', ok: false, fb: 'No: los bienes de uso público son de todos y nadie se los puede apropiar (C. C., art. 674).' },
      { t: 'El muelle es de uso público: su uso es de todos y nadie puede cobrar por él. Por eso lo cuidamos entre todos.', ok: true, fb: 'Los bienes de uso público pertenecen a la Nación y su uso es de todos los habitantes (C. C., art. 674).' },
      { t: 'Es del que llegue primero cada mañana.', ok: false, fb: 'Tampoco: su uso pertenece a todos los habitantes, no al más madrugador (C. C., art. 674).' },
    ],
  },
  balanza: {
    title: 'Pesar justo',
    left: 'npc_nubia', right: 'npc_chepe',
    situation: 'Nubia y Chepe ya hicieron las paces, pero los otros vendedores temen que las balanzas vuelvan a fallar.',
    card: 'art1603', distractors: ['art2353', 'art11'],
    q: '¿Qué les propones?',
    options: [
      { t: 'Que cada quien use su balanza; el que se deje engañar, pierde.', ok: false, fb: 'No: los contratos se cumplen de buena fe (C. C., art. 1603). Aprovecharse del otro rompe la confianza.' },
      { t: 'Prohibir las balanzas: que todo se venda «al ojo».', ok: false, fb: 'Al ojo nadie sabe si cumple. La buena fe necesita reglas claras (C. C., art. 1603).' },
      { t: 'Una balanza de la Junta en la plaza, revisada cada semana, para que cualquiera verifique el peso.', ok: true, fb: 'Así todos cumplen de buena fe y nadie tiene que adivinar (C. C., art. 1603).' },
    ],
  },
  cometa: {
    title: 'La cometa hallada',
    left: 'npc_pelao', right: 'npc_pelaa',
    situation: 'Los pelaos encontraron una cometa entre los escombros y se la pelean: «¡La vi primero!», «¡No, yo!».',
    card: 'ocupacion', distractors: ['art2353', 'art95'],
    q: '¿Cómo se lo explicas?',
    options: [
      { t: 'La llevan a la Junta, la anotan en el libro de hallazgos y buscan a su dueño. Mientras tanto, la cuidan entre los dos.', ok: true, fb: 'Quien encuentra algo perdido debe ponerlo a disposición de su dueño o de la autoridad (C. C., arts. 704 y 705).' },
      { t: 'El que la vio primero se la queda.', ok: false, fb: 'Lo que tiene dueño no se vuelve de quien lo encuentra: por ocupación solo se adquiere lo que no es de nadie (C. C., art. 685).' },
      { t: 'Rómpanla, así nadie pelea.', ok: false, fb: 'Romperla no arregla nada y daña algo ajeno. Lo justo es buscar a su dueño.' },
    ],
  },
};
export const QUIZ_SECONDS = 6;

// "El peso justo": equilibrar la balanza con pesas de la Junta.
// shown: lo que marca la balanza de Chepe; real: lo que de verdad pesa.
export const PESO = {
  weights: [1, 2, 2, 5],
  rounds: [
    { what: 'Racimo de plátanos', shown: 3, real: 3 },
    { what: 'Bocachicos de Nubia', shown: 5, real: 6 },
    { what: 'Bulto de pescado (el de la pelea)', shown: 8, real: 10 },
  ],
};

// "El alumbrado": girar los cables para llevar la luz del panel (S) a los cuatro
// faroles (B). c: conexiones en la posición resuelta (N, E, S, W). Las piezas
// P se desordenan girándolas al azar; algunas sobran (no llevan a ningún farol).
export const CIRCUITO = {
  w: 6,
  h: 5,
  cells: [
    { x: 0, y: 2, k: 'S', c: 'E' },
    { x: 1, y: 2, k: 'P', c: 'EW' },
    { x: 2, y: 2, k: 'P', c: 'NESW' },
    { x: 2, y: 1, k: 'P', c: 'SE' },
    { x: 3, y: 1, k: 'P', c: 'EW' },
    { x: 4, y: 1, k: 'P', c: 'WN' },
    { x: 4, y: 0, k: 'B', c: 'S' },
    { x: 2, y: 3, k: 'P', c: 'NS' },
    { x: 2, y: 4, k: 'B', c: 'N' },
    { x: 3, y: 2, k: 'P', c: 'EW' },
    { x: 4, y: 2, k: 'P', c: 'WES' },
    { x: 5, y: 2, k: 'P', c: 'WN' },
    { x: 5, y: 1, k: 'P', c: 'NS' },
    { x: 5, y: 0, k: 'B', c: 'S' },
    { x: 4, y: 3, k: 'P', c: 'NE' },
    { x: 5, y: 3, k: 'P', c: 'WS' },
    { x: 5, y: 4, k: 'B', c: 'N' },
    // piezas que sobran
    { x: 0, y: 0, k: 'P', c: 'ES' },
    { x: 1, y: 0, k: 'P', c: 'NS' },
    { x: 3, y: 0, k: 'P', c: 'WS' },
    { x: 0, y: 4, k: 'P', c: 'NE' },
    { x: 1, y: 4, k: 'P', c: 'EW' },
    { x: 3, y: 4, k: 'P', c: 'NE' },
  ],
};

// "La bodega a oscuras": linterna, cachivaches y la placa escondida.
export const LINTERNA = {
  seconds: 40,
  junk: ['Redes viejas', 'Un remo roto', 'Latas de pintura', 'Un motor sin piezas', 'Una llanta', 'Cajas de anzuelos', 'Una nevera oxidada'],
};

// "La matrícula": las dos mitades rotas; hay que ordenar los pedazos.
export const MATRICULA = {
  pieces: [
    { t: 'CAPITANÍA FLUVIAL · MATRÍCULA', side: 'A' },
    { t: 'DE EMBARCACIÓN FLUVIAL', side: 'B' },
    { t: 'NOMBRE: NIÑA', side: 'A' },
    { t: 'MERCEDES · TIPO: LANCHA', side: 'B' },
    { t: 'MOTOR: ROJO · SERIE', side: 'A' },
    { t: 'MR-4471-R', side: 'B' },
    { t: 'PROPIETARIO: AURELIO', side: 'A' },
    { t: 'MENDOZA PACHECO · ALCARAVÁN', side: 'B' },
  ],
};

// "Remar a Puerto Garza": esquivar troncos y recoger páginas que flotan.
export const REMAR = { seconds: 38, lives: 3 };
