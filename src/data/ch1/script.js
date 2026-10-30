// CAPÍTULO 1 — escenas de la historia: cinemáticas, eventos del pueblo y lo que
// pasa al ganar cada minijuego (líneas + recompensas).

const say = (s) => (t, fx) => (fx ? { s, t, fx } : { s, t });
const F = say('fidelina');
const R = say('ramiro');
const Ro = say('rosa');
const Lu = say('lucho');
const C = say('chepe');
const Nu = say('nubia');
const Ca = say('carmen');
const J = say('julian');
const A = say('aurelio');
const L = say('lumen');
const Ti = say('tinto');
const E = say('explorador');
const P = say('pensamiento');
const U = say('ulpiana');
const Nar = say('narrador');
const Nota = say('nota');
const Pe = say('pescador');
const Vna = say('vecina');
const N = say('nando');
const Pu = say('puno');
const Pa = say('pelaa');
const Po = say('pelao');

export const CINEMATICS = {
  biblioteca: {
    title: 'AEQUITAS',
    subtitle: 'El Retorno del Equilibrio',
    palette: ['#2a1d2e', '#14232e'],
    scene: 'biblioteca',
    cast: ['ulpiana', 'explorador', 'lumen', 'tinto'],
    slots: [0.2, 0.47, 0.67, 0.84],
    lines: [
      Nar('Hubo una guerra que duró nueve años. Pocos recuerdan cómo empezó; nadie olvida lo que se perdió.'),
      Nar('Se cayeron la luz, los puentes y las oficinas. Miles de familias huyeron río abajo con lo que llevaban puesto.'),
      Nar('Hace siete años se firmó el Acuerdo de Altamar. Desde entonces el país se rehace pueblo por pueblo, unido por el río: con trueque, con minga y con memoria.'),
      Nar('En Altamar, la ciudad amurallada, la Biblioteca Experimental guarda el Códice: la memoria de nuestras leyes, que nadie logró quemar.'),
      Nar('Sus custodios, la Orden de Bellium, lo protegieron en la Bóveda, bajo el mar. Ahora sus Emisarios del Equilibrio salen a recorrer el río.'),
      U('{nombre}, llegó una carta de Puerto Garza. Dos familias pelean por la única lancha del pueblo... y hay quien quiere arreglarlo a puños.'),
      E('¿Y qué puedo hacer yo, Maestra? No soy juez.'),
      U('No vas a juzgar a nadie. Vas a ayudar a que la gente encuentre un acuerdo justo. La Constitución permite que particulares sirvan como conciliadores.'),
      U('Tus herramientas son tres: la palabra, la prueba y la ley. Ninguna se dispara. Todas se piensan.'),
      L('Y yo voy contigo. Lumen, archivo portátil de la Biblioteca: cuatro mil leyes en la memoria y una batería solar.', 'flash'),
      L('Tinto también viene. Donde él llega, la gente baja la voz.'),
      U('Estas páginas salieron conmigo al exilio y volvieron conmigo: la Constitución de 1991 y el Código Civil.'),
      U('Sobrevivieron a la guerra. Ahora hay que hacerlos valer otra vez.'),
      U('Lleva el tubo de códices y este broche: la Margarita Dorada. Dicen que florece donde un pueblo vuelve a confiar en su ley.', 'flash'),
      U('Y recuerda la máxima de la Biblioteca: la ley del más fuerte solo deja ruinas. La ley civil es el suelo donde un pueblo siembra su futuro.'),
      U('La Constitución dice que la paz es un derecho y un deber de obligatorio cumplimiento. El Acuerdo se firmó en Altamar; la paz hay que hacerla en cada pueblo.'),
      U('Escucha a todos, incluso al que grita. El derecho no es un estorbo: es lo que nos permite volver a vivir juntos.'),
    ],
  },
  llegada: {
    title: 'Capítulo 1',
    subtitle: 'Puerto Garza · La lancha de la discordia',
    palette: ['#3a6f8a', '#2b6f6c'],
    scene: 'puerto',
    cast: ['ramiro', 'explorador', 'fidelina'],
    lines: [
      Nar('Puerto Garza: palafitos remendados, techos de zinc con cicatrices y un río tan ancho que parece mar.'),
      Nar('En la isleta sigue en pie el campanario de la iglesia vieja, partido por la guerra. Más allá, un bus quedó a medias en el río, donde antes había un puente.'),
      R('¿Y ahora quién llegó? ¡Más gente de afuera!', 'shake'),
      R('Aquí manda el Puño. El muelle, el puente y la lancha: todo pasa por nosotros. Y el que pasa, paga peaje.'),
      F('¡Ramiro, compórtese! Viene de la Biblioteca. Nosotros le escribimos.'),
      R('Pues aquí las cosas se arreglan como se arreglan. Y esa lancha no sale del puerto.'),
      Nar('Ramiro se va escupiendo al agua. Nadie en el muelle se atreve a mirarlo a los ojos.'),
      F('Desde la guerra, ellos cobran y gritan... y la gente calla. Aquí ya se vivió demasiado miedo; la Junta casi ni se reúne.'),
      F('Le damos la bienvenida, {nombre}. Cuando quiera, búsqueme en la plaza de la Junta. Tenemos mucho de qué hablar.'),
      L('Esto es lo que en la Biblioteca llaman el Reino del Arbitrio: donde no hay quien escuche, manda el que grita.'),
      L('Primer consejo de campo: la ley protege también a quien grita. A nadie se le puede echar del pueblo ni despojar a la fuerza.'),
    ],
  },
  epilogo: {
    title: 'Caso cerrado',
    subtitle: 'La Niña Mercedes vuelve al agua',
    palette: ['#e8846b', '#2b4f6c'],
    scene: 'atardecer',
    cast: ['aurelio', 'julian', 'carmen'],
    lines: [
      Nar('Esa tarde, la Niña Mercedes volvió al agua.'),
      A('Muchacho... ¿sabes manejar ese motor rojo?'),
      J('Mejor que nadie, Don Anselmo. Y perdón... por lo de la placa.'),
      A('Perdonado. Ahora vamos, que hay mucho río por delante.', 'heart'),
      Ca('Gracias, {nombre}. Nadie ganó todo... pero nadie perdió todo. Y el puerto sigue comiendo.'),
      L('Así se ve el equilibrio: no es que todos ganen lo mismo. Es que todos puedan seguir.'),
      R('...La próxima vez que haya un lío, primero la Junta. Y si no funciona... pues también la Junta.'),
      Nar('Esa noche, por primera vez desde la guerra, la Junta se reunió con las puertas abiertas. Mamá Tule cantó un bullerengue, y nadie tuvo miedo de cantar con ella.'),
      Nar('En Puerto Garza, la palabra volvió a pesar más que el puño. Y en la plaza, entre las grietas del asfalto, algo dorado empezó a brotar.', 'flash'),
    ],
  },
  // Variante: si el acuerdo fue que Anselmo se llevara la lancha.
  epilogo_entrega: {
    title: 'Caso cerrado',
    subtitle: 'La Niña Mercedes se va río arriba',
    palette: ['#e8846b', '#2b4f6c'],
    scene: 'atardecer',
    cast: ['aurelio', 'julian', 'carmen'],
    lines: [
      Nar('Esa tarde, la Niña Mercedes se fue río arriba con su dueño.'),
      A('Señora Carmen: aquí está lo de las reparaciones, completo. Gracias por cuidarla.'),
      J('Don Anselmo... perdón por lo de la placa.'),
      A('Perdonado, muchacho. Cuídate.'),
      Ca('Gracias, {nombre}. Fue justo... aunque el muelle quedó muy vacío. ¿Ahora con qué pescamos?'),
      L('Fue legal y nadie salió herido. Pero a veces la ley deja espacio para algo más: un acuerdo en el que todos puedan seguir.'),
      R('...Bueno. Al menos ahora el lío se arregla en la Junta y no en el muelle.'),
      Nar('En Puerto Garza, la palabra volvió a pesar más que el puño. Y en la plaza, entre las grietas del asfalto, algo dorado empezó a brotar.', 'flash'),
    ],
  },
  siguiente: {
    title: 'Continuará',
    subtitle: 'Capítulo 2 · Siete Puentes',
    palette: ['#2a1d2e', '#14232e'],
    scene: 'biblioteca',
    cast: ['ulpiana', 'explorador'],
    lines: [
      U('Buen trabajo, {nombre}. Puerto Garza ya tiene su acta... y algo más difícil de conseguir: confianza.'),
      U('Me contaron que en la plaza floreció una Margarita Dorada. La primera desde la guerra.', 'heart'),
      U('Pero el río no descansa. En Siete Puentes se cayó el puente colgante, y nadie quiere pagarlo.'),
      E('Entonces allá voy, Maestra.'),
      U('Prepárate: responsabilidad, daños y culpas compartidas. Te espera tu siguiente caso.'),
    ],
  },
};

// Eventos dentro del pueblo (diálogos normales).
export const EVENTS = {
  astillero: [
    J('¡Váyase, señor! ¡Esa lancha es nuestra!'),
    A('¡Es mía, muchacho! ¡Tiene el nombre de mi madre debajo de esa pintura!'),
    Ca('¡Julián, cálmate! ...Señor, nosotros no robamos nada.'),
    J('¿Y usted qué mira?'),
    P('Tinto se sienta en medio de los dos, muy quieto. Poco a poco, todos bajan la voz.'),
    L('Tinto acaba de declarar un receso. Hablemos con cada uno, por turnos. Así empieza la justicia: escuchando.'),
  ],
  chase_start: [
    L('La Copetona se escapó del patio. Acércate despacio y recógela antes de que vuelva a la huerta.'),
  ],
  chase_fail: [
    Lu('Se fue otra vez. Con lo que cuesta una cosecha en estos tiempos...'),
    L('Habla otra vez con Don Lucho para intentarlo de nuevo. Consejo: llévala hacia una cerca, sin asustarla.'),
  ],
  chase_win: [
    Lu('Ahí está. Gracias.'),
    Ro('¡Mi Copetona! Don Lucho, con sus huevos comemos mis nietos y yo.'),
    Lu('Y con esa huerta como yo, Doña Rosa. Es lo único que me dejó la guerra.'),
    L('Los dos tienen algo que cuidar. Escuchemos a ambos: elige bien tus palabras.'),
  ],
  reten_abierto: [
    { s: 'narrador', t: 'El Mono rueda los barriles a un lado. El puente queda libre.' },
  ],
  listo: [
    L('¡Tenemos el caso! Pruebas, testimonios y la confianza del puerto. Vamos donde Doña Fidelina a pedir la audiencia.'),
  ],
};

// Lo que pasa al ganar cada minijuego: líneas y recompensas.
export const WINS = {
  escucha: {
    lines: [
      L('El Código Civil es claro: el dueño de un animal responde por los daños que este cause.'),
      Ro('...Está bien. La Copetona se comió sus tomates. Yo le resiembro las matas y le hago un corral.'),
      Lu('Y yo le devuelvo la gallina. Cuando la cosecha se recupere, compartimos.'),
      Ro('Y mientras tanto le traigo huevos cada semana. Así hacíamos los vecinos antes de la guerra.'),
      Lu('Trato hecho, vecina.'),
      L('Escribamos el acuerdo, con fecha y firma de los dos. Un acuerdo escrito vale más que mil gritos.'),
    ],
    give: ['f:gallina_done', 'i:acuerdo_gallina', 'c:art2353'],
  },
  peso: {
    lines: [
      L('¡Ahí está! El platillo estaba doblado: a más peso, más se equivocaba. Nadie quiso engañar, pero el resultado era injusto.'),
      C('¿Doblado? ¡Pero si yo...! Ay, Nubia. Le debo dos kilos. Perdóneme.'),
      Nu('...Bueno. Si me paga y endereza esa balanza, quedamos en paz.'),
      L('En los negocios, la buena fe no es solo no querer engañar: es cumplir bien lo pactado.'),
    ],
    give: ['f:peso_done', 'c:art1603'],
  },
  circuito: {
    lines: [
      Nota('Los faroles del muelle se encienden uno a uno. Desde una casa, alguien empieza a tocar un tambor alegre.'),
      Pe('¡Luz! ¡Volvió la luz al muelle!'),
      L('El muelle es como las plazas y los caminos: es de todos, y entre todos se cuida.'),
      Nota('Al rato llega un pescador remando y amarra su canoa al muelle iluminado.'),
    ],
    give: ['f:alumbrado_done', 'c:art674'],
  },
  raspar: {
    lines: [
      P('«NIÑA MERCEDES». El nombre viejo aparece bajo la pintura.'),
      L('Tenía nombre y tenía dueño. Lo perdido no se vuelve de quien lo encuentra: hay que buscar a su dueño.'),
    ],
    give: ['i:nombre_original', 'c:ocupacion'],
  },
  matricula: {
    lines: [
      A('¡Ahí está, completa! Niña Mercedes, motor serie MR-4471-R... ¡a mi nombre!'),
      L('Quien posee una cosa se tiene por dueño... hasta que otro demuestra serlo. Y este documento demuestra mucho.'),
      L('Si la placa del motor dice MR-4471-R, no quedará duda de que es la misma lancha.'),
    ],
    give: ['i:matricula', 'c:dominio_posesion'],
  },
  linterna: {
    lines: [
      P('Detrás de las redes viejas algo brilla: una placa metálica. «MR-4471-R».'),
      L('Coincide con la matrícula. Y la escondieron hace poco: no tiene ni polvo.'),
      L('Otra cosa: cuando aparece el dueño de algo perdido, se le devuelve... pagando lo que costó recogerlo y conservarlo, y lo que la ley reconozca a quien lo encontró.'),
    ],
    give: ['i:placa_motor', 'c:hallazgo'],
  },
  quiz: {
    lines: [U('¡Bien jugado! Cada respuesta es una herramienta más para tu viaje.')],
    give: ['c:art229', 'c:art247'],
  },
  // Práctica de razonamiento jurídico (se puede repetir).
  silogismo: {
    lines: [
      L('Hechos, norma y conclusión. Cuando uno de los tres falla, la decisión falla. Por eso en la audiencia preguntamos y probamos.'),
      L('Y una norma nueva para el Códice: la paz no es solo un derecho; también es un deber de cada persona.'),
    ],
    give: ['c:art22'],
  },
  norma: {
    lines: [
      { s: 'yuli', t: '¡Ya sé leerlas! Primero el «si», y después el «entonces».' },
      L('Supuesto de hecho y consecuencia jurídica. Con eso, Yuli, ya puedes leer casi cualquier artículo.'),
    ],
    give: ['c:art2341'],
  },
  // Enseñanzas: la gente adopta la norma y el puerto cambia.
  teach_perro: {
    lines: [
      Vna('...Tiene razón. El Canelo es mío, y lo que dañe también. Le ayudo a remendar la red.'),
      Pe('Así sí. Y si lo amarra de noche, el Canelo hasta puede cuidar las canoas.'),
      L('Lo resolvieron ellos: tú solo les recordaste la regla. Así vuelve el orden, cuando la gente aprende a usar la ley.'),
    ],
    give: ['f:teach_perro'],
  },
  teach_muelle: {
    lines: [
      N('¿Entonces nadie puede cobrar por amarrar? ¡Se acabó el peaje!'),
      Pu('...Bueno, bueno. Si es de todos, que lo cuiden todos. Yo me voy a pescar.'),
      N('¡Minga el sábado para limpiar el muelle! Y pintamos otra vez el reglamento.'),
      L('Cuando la gente conoce sus derechos, el abuso se queda sin piso.'),
    ],
    give: ['f:teach_muelle'],
  },
  teach_balanza: {
    lines: [
      Nu('¡Una balanza de todos! Así nadie desconfía de nadie.'),
      C('Yo pongo las pesas y la Junta la revisa cada lunes. Palabra de comerciante.'),
      L('La buena fe también se organiza: reglas claras y que cualquiera pueda verificar.'),
    ],
    give: ['f:teach_balanza'],
  },
  teach_cometa: {
    lines: [
      Po('¿Y si el dueño no aparece?'),
      F('La anoto en el libro de hallazgos y pongo un aviso en la Junta. Mientras tanto, ustedes dos la cuidan... ¡y la elevan juntos!'),
      Pa('¡Juntos! ¡Mire cómo vuela!'),
      L('Hasta los pelaos ya lo saben: lo que se encuentra se anota, y se busca a su dueño.'),
    ],
    give: ['f:teach_cometa'],
  },
};
