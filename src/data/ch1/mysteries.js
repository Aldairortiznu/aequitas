// LAS PREGUNTAS DEL CASO: la historia se descubre jugando. Cada pregunta se
// responde sola cuando quien juega encuentra la pista (when: condiciones como
// en talk.js). La pregunta abierta se ve arriba en el pueblo; al responderla
// aparece «¡Descubriste!» con la respuesta y la siguiente pregunta. En el
// expediente, la pestaña «Misterios» muestra las resueltas y las que faltan.
//
// La última no se responde en este capítulo: es el gancho del siguiente.

export const MYSTERIES = [
  { id: 'miedo', q: '¿Por qué Puerto Garza vive con miedo?', when: ['f:met_fidelina'],
    a: 'Desde la guerra, el Puño cobra peaje en el muelle y en el puente. La gente calla y la Junta casi no se reúne.' },
  { id: 'confianza', q: '¿Cómo se gana la confianza de un pueblo que ya no confía?', when: ['f:reten_open'],
    a: 'Resolviendo sus líos con la palabra y con la ley. Ahora el Mono te deja cruzar el puente.' },
  { id: 'lancha', q: '¿Por qué pelean dos familias por una sola lancha?', when: ['i:carmen', 'i:julian', 'i:aurelio'],
    a: 'Los Ortega la encontraron en el río hace siete años. Don Anselmo dice que es suya y que la perdió cuando la guerra llegó a Alcaraván.' },
  { id: 'nombre', q: '¿Qué esconde la pintura del casco?', when: ['i:nombre_original'],
    a: 'Un nombre: «Niña Mercedes». La lancha tuvo dueño antes de llegar a Puerto Garza.' },
  { id: 'papel', q: '¿Dónde está la otra mitad de la matrícula?', when: ['i:matricula'],
    a: 'En la cabina de la lancha. Unida a la mitad de Don Anselmo, dice quién es el propietario.' },
  { id: 'placa', q: '¿Dónde quedó la placa del motor?', when: ['i:placa_motor'],
    a: 'Escondida en la bodega, detrás de las redes. Alguien no quería que se encontrara.' },
  { id: 'quien', q: '¿Quién escondió la placa, y por qué?', when: ['f:audiencia_ok'],
    a: 'Julián. Tenía miedo de que su mamá se quedara sin nada. En el acuerdo, repara lo que hizo.' },
  { id: 'justo', q: '¿Qué acuerdo puede ser justo para todos?', when: ['f:caso_cerrado'],
    a: 'Se reconoce al dueño, se pagan las reparaciones y nadie es castigado de más. El acta lo deja por escrito.' },
  { id: 'margarita', q: '¿Florecerá la Margarita Dorada en Puerto Garza?', when: ['f:caso_cerrado'],
    a: 'Sí. Brotó en la plaza, entre el asfalto, cuando el pueblo volvió a confiar en su ley.' },
  { id: 'puentes', q: '¿Quién tiene la culpa de que cayera el puente de Siete Puentes?', when: ['never'], a: null, next: true },
];
