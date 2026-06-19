// Acertijos de "libro real" de Reverdecer.
// Juego PERSONAL: cita obras reales (filosofía, literatura y Biblia) con enseñanzas.
// La idea es que la jugadora REALMENTE lea/busque el capítulo indicado para resolverlo.
//
// Cada acertijo trae:
//  - fuente: 'filosofia' | 'literatura' | 'biblia'
//  - libro, autor, donde: dónde leer (capítulo/versículo) para hallar la respuesta
//  - pista: voz de Jerónimo o Amanda que orienta hacia el texto
//  - tipo: 'completar' (escribir) | 'ordenar' (ordenar palabras) | 'eleccion' (elegir)
//  - según el tipo: respuestas[] | fraseCorrecta | opciones[]+correcta
//  - ensenanza: lo que Abigail aprende al resolverlo
//
// Las respuestas se comparan normalizadas (sin tildes, minúsculas, sin signos).
// Estilo de los textos: español latino / neutro.

export const RIDDLES = {
  // Nivel 5 — Reconocer lo que sí has hecho. (filosofía · completar)
  n5: {
    nivel: 5,
    fuente: 'filosofia',
    libro: 'Meditaciones',
    autor: 'Marco Aurelio',
    donde: 'Libro X (busca el pasaje sobre "ser bueno" en vez de discutirlo)',
    tema: 'Reconocer el propio mérito; obrar bien sin esperar aplausos.',
    pista: 'Jerónimo: "Marco Aurelio se escribía a sí mismo para recordarse cómo vivir. Dejó dicho que no perdamos el tiempo discutiendo cómo es una buena persona..."',
    tipo: 'completar',
    pregunta: 'Marco Aurelio dice: no discutas más cómo debe ser un hombre bueno; en cambio, ____.',
    respuestas: ['selo', 'se uno', 'se bueno', 'serlo'],
    ensenanza: 'No tienes que convencer a nadie de tu valor. Basta con obrar.',
  },

  // Nivel 14 — Fluir con el cambio. (Biblia · ordenar)
  n14: {
    nivel: 14,
    fuente: 'biblia',
    libro: 'Eclesiastés',
    autor: 'capítulo 3',
    donde: 'Eclesiastés 3:1 (léelo completo: el poema de los tiempos)',
    tema: 'Aceptar que todo cambia, que hay estaciones para todo.',
    pista: 'Jerónimo: "Hay un poema antiguo que dice que nada permanece, que cada cosa tiene su momento. Léelo y ordena su primera idea."',
    tipo: 'ordenar',
    pregunta: 'Ordena la enseñanza de Eclesiastés 3:1:',
    fraseCorrecta: 'todo tiene su tiempo',
    ensenanza: 'Aferrarte a una sola estación es negarte a vivir las demás. Todo tiene su tiempo.',
  },

  // Nivel 18 — Vivir el presente. (filosofía · completar)
  n18: {
    nivel: 18,
    fuente: 'filosofia',
    libro: 'Sobre la brevedad de la vida',
    autor: 'Séneca',
    donde: 'Capítulo I (la idea con la que abre la obra)',
    tema: 'El tiempo y el presente; no posponer la vida.',
    pista: 'Jerónimo: "Séneca abre su carta con una sentencia incómoda: el problema no es cuánto tiempo tenemos, sino qué hacemos con él."',
    tipo: 'completar',
    pregunta: 'Para Séneca, no es que la vida sea corta: es que nosotros la ____.',
    respuestas: ['perdemos', 'desperdiciamos', 'malgastamos', 'la perdemos'],
    ensenanza: 'No te falta tiempo: te falta estar presente en el que tienes.',
  },

  // Nivel 19 — Caminar sin verlo todo / el mañana. (Biblia · eleccion)
  n19: {
    nivel: 19,
    fuente: 'biblia',
    libro: 'Evangelio de Mateo',
    autor: 'capítulo 6',
    donde: 'Mateo 6:34 (al final del capítulo)',
    tema: 'Soltar la angustia por el futuro; vivir el hoy.',
    pista: 'Amanda: "¡Hay una frase preciosa sobre no cargar el mañana antes de tiempo! Está casi al final del capítulo 6 de Mateo."',
    tipo: 'eleccion',
    pregunta: 'Según Mateo 6:34, ¿qué NO debemos hacer respecto al mañana?',
    opciones: [
      'Afanarnos / angustiarnos por el mañana',
      'Trabajar por el mañana',
      'Soñar con el mañana',
    ],
    correcta: 0,
    ensenanza: 'Cada día trae su propio afán. No puedes ver todo el camino para empezar a caminarlo.',
  },

  // Nivel 22 — Saberte suficiente. (filosofía · eleccion)
  n22: {
    nivel: 22,
    fuente: 'filosofia',
    libro: 'Historia del buen brahmán',
    autor: 'Voltaire',
    donde: 'El cuento completo (es muy corto: el sabio y la anciana)',
    tema: 'La suficiencia y la paz interior frente al saber inquieto.',
    pista: 'Jerónimo: "Voltaire contrasta a un brahmán sabio y angustiado con una anciana ignorante y feliz. Lee el final: ¿cambiaría el sabio su saber por la felicidad de ella?"',
    tipo: 'eleccion',
    pregunta: 'El brahmán sabio era infeliz; la anciana ignorante era feliz. Al final, el sabio...',
    opciones: [
      'No quiso ser feliz si eso significaba ser ignorante',
      'Cambió gustoso su sabiduría por la dicha',
      'Renunció a pensar para siempre',
    ],
    correcta: 0,
    ensenanza: 'Ser suficiente no es saberlo todo: es estar en paz con lo que eres.',
  },

  // Nivel 26 — Perdonarte; aceptar la dificultad. (filosofía · completar)
  n26: {
    nivel: 26,
    fuente: 'filosofia',
    libro: 'Elogio de la dificultad',
    autor: 'Estanislao Zuleta',
    donde: 'El ensayo completo (busca contra qué "ideal" advierte Zuleta)',
    tema: 'Renunciar a la ilusión del paraíso sin conflicto; amar la vida real.',
    pista: 'Jerónimo: "Zuleta desconfía de quien sueña una vida sin problemas, un paraíso perfecto. Justo elogia lo contrario."',
    tipo: 'completar',
    pregunta: 'Zuleta hace el elogio, justamente, de la ____.',
    respuestas: ['dificultad', 'la dificultad'],
    ensenanza: 'Una vida valiosa no es una vida sin dificultad, sino una vivida con ella. Date la misma compasión que te exiges.',
  },

  // Nivel 27 — Amar aun sabiendo que se pierde. (Biblia · ordenar)
  n27: {
    nivel: 27,
    fuente: 'biblia',
    libro: 'Primera carta a los Corintios',
    autor: 'capítulo 13',
    donde: '1 Corintios 13:7 (el himno al amor)',
    tema: 'El amor que permanece y sostiene, aun ante la pérdida.',
    pista: 'Jerónimo: "Hay un himno antiguo sobre el amor. Dice que el amor aguanta, cree, espera... y una cosa más. Ordénala."',
    tipo: 'ordenar',
    pregunta: 'Ordena lo que, según 1 Corintios 13:7, hace el amor:',
    fraseCorrecta: 'todo lo soporta',
    ensenanza: 'Amar siempre implica el riesgo de perder. Y aun así, el amor todo lo soporta. Vale la pena.',
  },

  // Nivel 30 — Aceptar la finitud; lo esencial. (literatura · completar)
  n30: {
    nivel: 30,
    fuente: 'literatura',
    libro: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    donde: 'Capítulo XXI (la conversación con el zorro)',
    tema: 'Lo esencial, el vínculo y la responsabilidad por lo que amamos.',
    pista: 'Amanda: "¡El zorro le confía su secreto al principito! Solo se ve bien con el corazón. Está en el capítulo del zorro."',
    tipo: 'completar',
    pregunta: 'Según el zorro: "lo esencial es invisible a los ____".',
    respuestas: ['ojos', 'los ojos'],
    ensenanza: 'La vida termina, sí; por eso lo esencial —a quién amaste, a quién cuidaste— es lo único que de verdad pesa.',
  },

  // Nivel 31 — El sentido. (filosofía · ordenar)
  n31: {
    nivel: 31,
    fuente: 'filosofia',
    libro: 'El hombre en busca de sentido',
    autor: 'Viktor Frankl',
    donde: 'La cita de Nietzsche que Frankl repite a lo largo del libro',
    tema: 'El sentido como elección que sostiene la vida.',
    pista: 'Jerónimo: "Frankl sobrevivió a lo peor citando a Nietzsche. Decía que quien tiene una razón para vivir puede soportar casi cualquier modo de vivir. Ordénalo."',
    tipo: 'ordenar',
    pregunta: 'Ordena la idea que sostuvo a Frankl (según Nietzsche):',
    fraseCorrecta: 'quien tiene un porque encuentra un como',
    ensenanza: 'El sentido no se encuentra tirado en el camino: se elige, y entonces sostiene todo lo demás.',
  },
};

// Otras obras candidatas para futuros acertijos (bibliografía de reserva):
// - Tao Te Ching (Lao Tse) — el agua, la flexibilidad (nivel 13 control / 20 ansiedad).
// - Siddhartha (Hermann Hesse) — escuchar el río, la unidad (nivel 9 rencor / 20).
// - El arte de amar (Erich Fromm) — amar como acto y no como caída (nivel 28 apego).
// - Enquiridión (Epicteto) — lo que depende de ti y lo que no (nivel 13 control).
// - Salmos 23 / Salmo 46:10 ("Estad quietos") — la calma (nivel 20 ansiedad).
// - Cartas a un joven poeta (Rilke) — vivir las preguntas (nivel 2 duda / 19 incertidumbre).
