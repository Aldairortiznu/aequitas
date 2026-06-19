// Constantes globales del juego "El Jardín de los Miedos".

export const GAME = {
  // Resolución base (pixel art). Phaser la escala a la ventana manteniendo nitidez.
  WIDTH: 480,
  HEIGHT: 270,
  TITLE: 'Reverdecer',
  SUBTITLE: 'La travesía de Abigail',
  HEROINE: 'Abigail',
  TOTAL_LEVELS: 32, // + prólogo (nivel 0)
};

// Paleta verde base del juego (se ajusta por reino más adelante).
export const COLORS = {
  bgDeep: '#0b1410',
  bgGreen: '#13301f',
  green: '#2f6b3f',
  greenLight: '#5bbf6a',
  gold: '#e9c46a',
  cream: '#f3efe0',
  ink: '#0a1a12',
  shadow: '#06100b',
};

// Compañeros.
export const DOGS = {
  jeronimo: { name: 'Jerónimo', role: 'sabio', color: '#f3efe0' },
  amanda: { name: 'Amanda', role: 'valiente', color: '#ffffff' },
};

// Clave de guardado en localStorage.
export const SAVE_KEY = 'jardin_miedos_save_v1';
