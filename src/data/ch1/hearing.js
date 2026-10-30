// CAPÍTULO 1 — la AUDIENCIA en la Casa de la Junta, la propuesta de acuerdo,
// la clasificación de gastos y el acta.
//
// En cada declaración: E = preguntar (más detalles), X = presentar una prueba,
// un testimonio o una carta del Códice. answer: lo que la contradice (null si
// la frase es verdad: presentar algo ahí cuesta confianza). law: la carta del
// Códice con la norma que se aplica (se muestra en pantalla al acertar).

const say = (s) => (t, fx) => (fx ? { s, t, fx } : { s, t });
const F = say('fidelina');
const R = say('ramiro');
const Ca = say('carmen');
const J = say('julian');
const A = say('aurelio');
const L = say('lumen');
const Ti = say('tinto');
const E = say('explorador');
const N = say('nando');
const Lu = say('lucho');
const Ro = say('rosa');
const As = say('asamblea');
const Nar = say('narrador');

export const HEARING = {
  intro: [
    Nar('Casa de la Junta. Todo el puerto se apretuja en las bancas. Afuera, hasta las garzas parecen escuchar.'),
    F('Se abre la audiencia de conciliación de Puerto Garza. Aquí se habla, no se grita.'),
    F('Cada parte dirá su verdad. {nombre}, de la Biblioteca, podrá preguntar y presentar pruebas. Nadie será juzgado sin ser escuchado.'),
    L('Así funciona: si una frase no cuadra, pregunta (E) o presenta una prueba o una carta del Códice (X). Cambia de frase con ◀ ▶.'),
    L('Si te equivocas, la asamblea pierde confianza (♥). Si te atascas, pídeme una pista (B). Y Tinto puede calmar a la gente (C).'),
  ],
  rounds: [
    {
      who: 'julian',
      title: 'Declaración de Julián Ortega',
      intro: [F('Que hable primero la familia Ortega. Julián, tiene la palabra.'), J('Con gusto. ¡Esto es muy sencillo!')],
      statements: [
        {
          t: 'La lancha llegó sola por el río. ¡Era de nadie: el río nos la regaló!',
          press: [E('¿De nadie? ¿Cómo sabes que no tenía dueño?'), J('¡Porque nadie vino a buscarla! Y no tenía ni nombre, que yo sepa.'), L('Mmm... ¿"que yo sepa"? Piensa en lo que encontramos en el casco.')],
          answer: ['nombre_original', 'ocupacion'],
          law: 'ocupacion',
          ok: [E('¡Objeción! Bajo la pintura estaba su nombre: «Niña Mercedes». Una cosa perdida sigue teniendo dueño.', 'shake'), L('Por ocupación solo se adquiere lo que no es de nadie. Esta lancha tenía nombre... y dueño.'), J('...Bueno, sí, tenía un nombre viejo. ¡Pero eso no cambia nada!')],
          hint: 'Julián dice que la lancha "era de nadie". ¿Qué descubriste en el casco? ¿Qué dice el Códice sobre la ocupación?',
        },
        {
          t: 'Mi mamá la anotó en el libro de la Junta y avisó que la guardaba para su dueño.',
          press: [Ca('Es verdad. Lo anoté yo misma, con mi letra.'), L('Esto es cierto, y habla bien de ellos: es buena fe. No todo lo que dice un testigo es falso.')],
          answer: null,
        },
        {
          t: '¡Siete años usándola! El tiempo nos la dio. Así dice la ley.',
          press: [E('¿Qué dice exactamente la ley sobre el tiempo?'), J('¡Que si uno tiene algo mucho tiempo, ya es de uno! Todo el mundo lo sabe.'), L('"Todo el mundo lo sabe" no es una norma. Busca la carta de la prescripción.')],
          answer: ['prescripcion'],
          law: 'prescripcion',
          ok: [E('¡Objeción! Sin un título, para volverse dueño por el tiempo se necesitan diez años de posesión. Ustedes llevan siete.', 'shake'), L('Encontrar una lancha no es un título, como sí lo sería una compraventa. Siete años no bastan.'), J('¿Diez? ¿Diez años? ...Nadie me había dicho eso.'), L('Y algo más: quien guarda una cosa para su dueño no la posee como dueño. Esa espera es buena fe, no un camino para quedarse con ella.')],
          hint: 'Julián cree que siete años bastan. ¿Cuánto tiempo exige la ley cuando no hay título?',
        },
        {
          t: 'Y ese señor no puede probar nada: ¡la lancha ni siquiera tiene placa del motor!',
          press: [E('¿Estás seguro de que nunca tuvo placa?'), J('¡Segurísimo! ...Bueno, segurísimo no. Pero no la tiene.'), L('Alguien en el puerto vio algo brillante una noche...')],
          answer: ['placa_motor', 'yuli', 'lucho'],
          law: 'dominio_posesion',
          ok: [E('¡Objeción! Esta es la placa del motor: MR-4471-R. Estaba escondida en la bodega, detrás de las redes.', 'shake'), As('¡Uyyyyy!'), J('Yo... yo la escondí. Tenía miedo. Sin la lancha, mi mamá no tiene nada.'), Ca('¡Julián! ...Ay, mijo.'), L('Esconder una prueba no se arregla con un castigo. Pero hay que repararlo. Lo veremos en el acuerdo.')],
          hint: 'Julián dice que no hay placa. Pero tú encontraste algo en la bodega... y hay quien lo vio.',
        },
      ],
      outro: [F('Gracias, Julián. Siéntese. Don Anselmo, tiene usted la palabra.')],
      wrong: [J('¿Y eso qué tiene que ver? ¡No me confunda!'), J('¡Eso no prueba nada!')],
    },
    {
      who: 'aurelio',
      title: 'Declaración de Don Anselmo Mendoza',
      intro: [A('Señores, yo solo vengo por lo que es mío.')],
      statements: [
        {
          t: 'Esta lancha es la Niña Mercedes: motor rojo, serie MR-4471-R. Mi matrícula lo prueba.',
          press: [E('¿La matrícula está completa?'), A('Gracias a usted, sí. Juntamos las dos mitades.'), L('La matrícula, la placa y el nombre coinciden. Esto es cierto.')],
          answer: null,
        },
        {
          t: '¡Los Ortega me la robaron del muelle de Puerto Alcaraván!',
          press: [E('¿Usted los vio llevársela?'), A('Bueno... no. Pero desapareció la noche que la guerra llegó a Alcaraván. ¡Alguien se la llevó!'), L('¿Alguien? ¿O algo? Hay quien vio la lancha esa noche...')],
          answer: ['nando', 'libro_hallazgos'],
          law: 'buena_fe',
          ok: [E('¡Objeción! Nando la vio bajar sola y vacía por el río esa noche. Nadie la robó: se la llevó la corriente.', 'shake'), N('¡Así fue! ¡Yo la vi con estos ojos!'), A('...Entonces no fue un robo. Les pido disculpas por eso.')],
          hint: 'Anselmo habla de robo. ¿Quién vio la lancha la noche que la guerra llegó a Alcaraván?',
        },
        {
          t: 'La usaron siete años sin pagar: ¡que me paguen el arriendo de todos esos años!',
          press: [E('¿Cobrarle a quien la cuidó de buena fe?'), A('¡Ganaron plata con mi lancha! Lo justo es que paguen.'), L('Hay una carta sobre lo que produce una cosa en manos de quien la tiene de buena fe...')],
          answer: ['frutos', 'buena_fe'],
          law: 'frutos',
          ok: [E('¡Objeción! Los Ortega la tuvieron de buena fe: la anotaron y esperaron al dueño. Lo que produjo en ese tiempo no se vuelve deuda.', 'shake'), L('Quien posee de buena fe no devuelve los frutos que obtuvo antes de contestar la demanda del dueño. Y aquí no hubo ni demanda.'), A('...Está bien. No voy a cobrar lo que el río me quitó.')],
          hint: '¿Debe devolver lo producido quien poseía de buena fe? Busca la carta de los frutos.',
        },
        {
          t: 'Y las reparaciones no las pago. ¡Yo nunca se las pedí!',
          press: [E('¿Y si nadie la hubiera reparado?'), A('...Pues la lancha estaría hundida en la ciénaga. Pero no es mi problema.'), L('Sin esas reparaciones no habría lancha que reclamar. ¿Qué dice la ley de esos gastos?')],
          answer: ['expensas', 'recibos', 'hallazgo'],
          law: 'expensas',
          ok: [E('¡Objeción! Sin esas reparaciones su lancha no existiría. La ley reconoce los gastos necesarios para conservar la cosa, y las mejoras útiles a quien poseía de buena fe.', 'shake'), L('Y todo está en el cuaderno de Don Chepe, con fecha y firma.'), A('...Tiene razón. Sin ellos, la Niña Mercedes estaría en el fondo del río.')],
          hint: 'Anselmo no quiere pagar las reparaciones. ¿Qué dice la ley de los gastos necesarios? ¿Con qué los pruebas?',
        },
      ],
      outro: [R('¡Basta de tanta palabrería!'), F('Ramiro, usted no tiene la palabra... Bueno, hable. Aquí todos merecen ser escuchados.')],
      wrong: [A('Con todo respeto, eso no prueba nada.'), A('No entiendo qué tiene que ver eso conmigo.')],
    },
    {
      who: 'ramiro',
      title: 'Ramiro "El Puño" pide la palabra',
      intro: [R('¡Aquí lo que hay que hacer está clarito!')],
      statements: [
        {
          t: '¡La lancha es del pueblo! Que la Junta se la quede y se acabó el problema.',
          press: [E('¿Y si fuera su casa la que el pueblo decide quedarse?'), R('...Eso es distinto. ¡Mi casa es mía!'), L('¿Distinto? Busca la carta que habla de la confiscación... o la de la propiedad.')],
          answer: ['art34', 'art58'],
          law: 'art58',
          ok: [E('¡Objeción! La Constitución prohíbe la confiscación y protege la propiedad. Ni la mayoría puede quitarle a alguien lo que es suyo.', 'shake'), As('¡Eso es verdad!'), R('Grrr...')],
          hint: '¿Puede una asamblea quitarle a alguien sus bienes? Busca en la Constitución.',
        },
        {
          t: 'Y a ese señor de río arriba lo montamos en una canoa esta misma noche.',
          press: [E('¿Echarlo del pueblo? ¿Por reclamar lo que es suyo?'), R('¡Para que aprenda!'), L('Hay una palabra para eso en la Constitución. Y está prohibida.')],
          answer: ['art34'],
          law: 'art34',
          ok: [E('¡Objeción! El destierro está prohibido, y una asamblea no puede castigar a nadie: echarlo del pueblo viola su derecho a vivir donde quiera.', 'shake'), L('Constitución, artículos 24 y 34.'), As('¡Bien dicho!')],
          hint: 'Ramiro quiere expulsar a Anselmo. ¿Qué pena prohíbe la Constitución?',
        },
        {
          t: 'En este puerto todo se arregla a los puños. ¡Así ha sido siempre y así será!',
          press: [E('¿Siempre? ¿Hoy también?'), R('¡Hoy más que nunca!'), L('Hoy, en el barrio, una pelea se arregló sin un solo golpe. ¿Te acuerdas?')],
          answer: ['acuerdo_gallina', 'justicia_comunitaria', 'art116'],
          law: 'justicia_comunitaria',
          ok: [E('¡Objeción! Hoy mismo, Doña Rosa y Don Lucho arreglaron su pelea hablando. Aquí está su acuerdo, firmado por los dos.', 'shake'), Lu('¡Y ella me trae huevos los domingos!'), Ro('¡Y él me regala tomates!'), As('¡Así es!'), R('...Bueno. De pronto... de pronto hablando también se puede.')],
          hint: '¿Hay alguna prueba de que en este puerto los problemas se pueden arreglar hablando?',
        },
      ],
      outro: [F('Muy bien. Ya escuchamos a todos y vimos las pruebas.'), F('{nombre}, usted que conoce el Códice: ¿qué acuerdo propone?')],
      wrong: [R('¡Ja! ¿Eso es todo lo que tiene la Biblioteca?'), R('¡Palabras, palabras! ¡Eso no me convence!')],
    },
  ],
  failLines: [F('Calma, calma... La gente está muy agitada. Respiremos y volvamos a empezar esta declaración.')],
};

// Propuesta de acuerdo: cuatro decisiones. 'bad' no se puede mantener (hay que
// elegir otra vez); 'meh' se puede mantener, pero el acuerdo queda más débil.
export const RESOLUTION = {
  intro: [F('Proponga, {nombre}. La asamblea escucha.')],
  points: [
    {
      q: '¿De quién es la lancha?',
      options: [
        { t: 'De los Ortega: la salvaron y la cuidaron siete años.', v: 'bad', fb: 'Cuidar no es ser dueño. Sin título, se necesitan diez años de posesión, y van siete (C. C., art. 2532).' },
        { t: 'De Don Anselmo: probó que es suya.', v: 'ok', fb: 'La matrícula, la placa y el nombre prueban el dominio. Y el dueño puede reclamar su cosa a quien la tiene (C. C., arts. 669 y 946).', clause: 'DOMINIO' },
        { t: 'Del pueblo: que la Junta lo decida por votación.', v: 'bad', fb: 'Ni la mayoría puede confiscar: la Constitución lo prohíbe y protege la propiedad (arts. 34 y 58).' },
      ],
    },
    {
      q: '¿Y lo que los Ortega invirtieron en repararla?',
      options: [
        { t: 'Nada: arreglaron algo ajeno, problema de ellos.', v: 'bad', fb: 'Sin esos gastos no habría lancha. La ley los reconoce (C. C., arts. 965 y 966).' },
        { t: 'Don Anselmo paga el doble, como castigo por reclamar.', v: 'bad', fb: 'Reparar no es castigar: se paga lo que se debe, ni un peso más (Ley 446 de 1998, art. 16).', card: 'reparacion' },
        { t: 'Don Anselmo reconoce los gastos necesarios y las mejoras útiles.', v: 'ok', fb: 'Exacto: los gastos necesarios se le pagan a todo poseedor; las mejoras útiles, al de buena fe (C. C., arts. 965 y 966).', clause: 'MEJORAS' },
      ],
    },
    {
      q: '¿Y el trabajo del puerto? Sin lancha no hay pesca.',
      options: [
        { t: 'Un contrato: los Ortega le arriendan la lancha a Don Anselmo, y lo que él les debe se descuenta de los arriendos.', v: 'ok', fb: '¡Eso es equidad! El dueño recibe un arriendo, el puerto sigue pescando y las deudas se compensan (C. C., arts. 1973 y 1714).', clause: 'ARRIENDO', card: 'compensacion' },
        { t: 'Don Anselmo se lleva la lancha río arriba: es suya.', v: 'meh', fb: 'Es legal: el dueño puede disponer de lo suyo (C. C., art. 669)... pero el puerto se queda sin pescar. ¿No habrá algo más equitativo?', clause: 'ENTREGA' },
        { t: 'Que la use todo el que quiera, sin pagar. Así nadie pelea.', v: 'bad', fb: 'Eso desconoce la propiedad de Anselmo (Const., art. 58). Lo que es de todos sin reglas termina siendo de nadie.' },
      ],
    },
    {
      q: '¿Y Julián, que escondió la placa?',
      options: [
        { t: 'Que se vaya del puerto.', v: 'bad', fb: 'Eso sería destierro, y está prohibido (Const., art. 34).' },
        { t: 'Mejor no decir nada y olvidarlo.', v: 'meh', fb: 'Olvidarlo deja la herida abierta. La confianza se repara reconociendo el error.' },
        { t: 'Que devuelva la placa, pida perdón y repare: trabajará como lanchero de Don Anselmo.', v: 'ok', fb: 'Reparar el daño, sin castigos de más, y reconstruir la confianza: justicia que sana.', clause: 'REPARACION', card: 'reparacion' },
      ],
    },
  ],
};

// Recibos del cuaderno de Don Chepe: ¿qué se reconoce?
export const GASTOS = {
  rent: 50, // arriendo mensual pactado
  bins: [
    { k: 'nec', label: 'Necesaria', sub: 'se paga · C. C. art. 965', color: '#8fd694' },
    { k: 'util', label: 'Útil', sub: 'se paga si hubo buena fe · art. 966', color: '#6fc3d8' },
    { k: 'lujo', label: 'Voluptuaria', sub: 'de lujo: no se paga · se puede retirar · art. 967', color: '#e8a9c0' },
  ],
  items: [
    { t: 'Pistón y empaques del motor', v: 120, k: 'nec', why: 'Sin motor, la lancha no navega: es un gasto necesario para conservarla (C. C., art. 965).' },
    { t: 'Parche y brea para el casco', v: 80, k: 'nec', why: 'Sin el parche, la lancha se hunde: gasto necesario (C. C., art. 965).' },
    { t: 'Pintura anticorrosiva', v: 40, k: 'nec', why: 'Protege el casco del óxido: conserva la cosa. Necesaria (C. C., art. 965).' },
    { t: 'Toldo nuevo contra el sol', v: 60, k: 'util', why: 'No es indispensable, pero aumenta el valor de la lancha: mejora útil, que se paga al poseedor de buena fe (C. C., art. 966).' },
    { t: 'Banderines y calcomanías', v: 15, k: 'lujo', why: 'Es adorno: mejora voluptuaria. No se paga, pero quien la puso se la puede llevar si no daña la lancha (C. C., art. 967).' },
    { t: 'Parlante para la música', v: 45, k: 'lujo', why: 'Es gusto, no necesidad: mejora voluptuaria. No se paga; si Anselmo no lo quiere pagar, Julián se lo puede llevar (C. C., art. 967).' },
  ],
};

// El acta: cláusulas en orden. {MONTO} y {MESES} se completan jugando.
export const ACTA = {
  title: 'ACTA DE CONCILIACIÓN EN EQUIDAD N.º 001 · PUERTO GARZA',
  clauses: {
    PARTES: { k: 'PARTES', t: 'Anselmo Mendoza Pacheco, propietario, y la familia Ortega, que tuvo la lancha de buena fe, ante la Junta de Acción Comunal.' },
    HECHOS: { k: 'HECHOS', t: 'La lancha Niña Mercedes se perdió cuando la guerra llegó a Puerto Alcaraván. Los Ortega la hallaron, la anotaron en el libro de la Junta y la repararon.' },
    DOMINIO: { k: 'DOMINIO', t: 'Se reconoce que la lancha es de Anselmo Mendoza Pacheco.' },
    MEJORAS: { k: 'MEJORAS', t: 'Anselmo reconoce a los Ortega {MONTO} fichas por gastos necesarios y mejoras útiles. El parlante y los banderines se los quedan ellos.', blank: { key: 'MONTO', options: [240, 300, 360] } },
    ARRIENDO: { k: 'ARRIENDO', t: 'Los Ortega arriendan la lancha por 50 fichas al mes. Los primeros {MESES} meses se pagan compensando la deuda de las mejoras.', blank: { key: 'MESES', options: [3, 6, 10] } },
    ENTREGA: { k: 'ENTREGA', t: 'Anselmo se lleva la lancha y paga hoy a los Ortega lo reconocido por mejoras.' },
    REPARACION: { k: 'REPARACIÓN', t: 'Julián devuelve la placa, pide perdón y trabajará como lanchero junto a Don Anselmo.' },
    EFECTOS: { k: 'EFECTOS', t: 'Esta acta presta mérito ejecutivo y tiene carácter de cosa juzgada: obliga a quienes la firman.' },
  },
  order: ['PARTES', 'HECHOS', 'DOMINIO', 'MEJORAS', 'ARRIENDO', 'ENTREGA', 'REPARACION', 'EFECTOS'],
  signers: ['Anselmo Mendoza P.', 'Carmen Ortega', 'Julián Ortega', 'Fidelina Carrascal · Junta', '{nombre} · conciliación'],
  cards: ['contrato_ley', 'arrendamiento', 'conciliacion'],
};
