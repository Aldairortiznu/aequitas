// Acertijos de "libro real" de Reverdecer.
// Juego PERSONAL: cita obras reales de filosofía/literatura con enseñanzas.
// La jugadora busca/recuerda la respuesta leyendo la obra. La comparación de la
// respuesta es flexible (se normaliza: minúsculas, sin tildes, sin signos).
//
// Estilo de los textos: español latino / neutro.

export const BOOK_RIDDLES = {
  // Nivel 5 — Reconocer lo que sí has hecho.
  n5: {
    nivel: 5,
    libro: 'Meditaciones',
    autor: 'Marco Aurelio',
    tema: 'Reconocer el propio mérito; obrar bien sin esperar aplausos.',
    pista: 'Jerónimo: "Marco Aurelio se escribía a sí mismo para recordarse cómo vivir. Decía que un hombre debe ser bueno, no parecerlo. Busca en sus Meditaciones."',
    pregunta: 'Según Marco Aurelio, en lugar de discutir cómo debe ser una buena persona, ¿qué debes hacer?',
    respuestas: ['serlo', 'ser una', 'ser buena', 'serla'],
    ensenanza: 'No tienes que convencer a nadie de tu valor. Basta con obrar.',
  },

  // Nivel 18 — Vivir el presente.
  n18: {
    nivel: 18,
    libro: 'Sobre la brevedad de la vida',
    autor: 'Séneca',
    tema: 'El tiempo y el presente; no posponer la vida.',
    pista: 'Jerónimo: "Séneca dice algo incómodo: no es que tengamos poco tiempo... es otra cosa. Recuérdalo."',
    pregunta: 'Para Séneca, no es que la vida sea corta, sino que nosotros la hacemos ____ (¿qué le hacemos al tiempo?).',
    respuestas: ['corta', 'la perdemos', 'perdemos', 'la desperdiciamos', 'desperdiciamos'],
    ensenanza: 'No te falta tiempo: te falta estar presente en el que tienes.',
  },

  // Nivel 22 — Saberte suficiente.
  n22: {
    nivel: 22,
    libro: 'Historia del buen brahmán',
    autor: 'Voltaire',
    tema: 'La suficiencia y la paz interior frente al saber inquieto.',
    pista: 'Jerónimo: "Voltaire cuenta de un sabio que lo sabía casi todo y vivía angustiado, y de una anciana ignorante y feliz. Pregúntate qué prefería, en el fondo, cada quien."',
    pregunta: 'El buen brahmán era muy sabio pero vivía ____ ; la pobre vecina nada sabía y era ____ .',
    respuestas: ['infeliz y feliz', 'desdichado y feliz', 'infeliz feliz', 'triste y feliz'],
    ensenanza: 'Ser suficiente no es saberlo todo: es estar en paz con lo que eres.',
  },

  // Nivel 26 — Perdonarte; aceptar la dificultad.
  n26: {
    nivel: 26,
    libro: 'Elogio de la dificultad',
    autor: 'Estanislao Zuleta',
    tema: 'Renunciar a la ilusión del paraíso sin conflicto; amar la vida real.',
    pista: 'Jerónimo: "Zuleta desconfía de quien sueña una vida sin problemas, un paraíso perfecto. Dice que ese deseo nos vuelve duros con nosotros mismos."',
    pregunta: 'Zuleta hace el elogio, justamente, de la ____ (lo que solemos querer evitar).',
    respuestas: ['dificultad', 'la dificultad'],
    ensenanza: 'Date compasión: una vida valiosa no es una vida sin dificultad, sino una vivida con ella.',
  },

  // Nivel 30 — Aceptar la finitud; el legado y lo que amamos.
  n30: {
    nivel: 30,
    libro: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    tema: 'Lo esencial, el vínculo y la responsabilidad por lo que amamos.',
    pista: 'Amanda: "¡El zorro le enseña su secreto al principito! Algo que solo se ve con el corazón."',
    pregunta: 'Según el zorro, "lo esencial es invisible a los ____".',
    respuestas: ['ojos', 'los ojos'],
    ensenanza: 'La vida termina, sí; por eso lo esencial —a quién amaste, a quién cuidaste— es lo único que de verdad pesa.',
  },

  // Nivel 31 — El sentido.
  n31: {
    nivel: 31,
    libro: 'El hombre en busca de sentido',
    autor: 'Viktor Frankl',
    tema: 'El sentido como elección que sostiene la vida.',
    pista: 'Jerónimo: "Frankl sobrevivió a lo peor y descubrió qué mantiene viva a una persona. No es la suerte ni la fuerza."',
    pregunta: 'Frankl cita a Nietzsche: quien tiene un ____ para vivir, soporta casi cualquier ____ .',
    respuestas: ['porque y como', 'por que y como', 'porqué y cómo', 'porque como', 'un porque', 'porqué'],
    ensenanza: 'El sentido no se encuentra tirado en el camino: se elige, y entonces sostiene todo lo demás.',
  },
};
