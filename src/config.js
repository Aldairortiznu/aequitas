// Constantes globales de "AEQUITAS: El Retorno del Equilibrio".

export const GAME = {
  // Resolución base (pixel art). Phaser la escala a la ventana manteniendo nitidez.
  WIDTH: 480,
  HEIGHT: 270,
  TITLE: 'AEQUITAS',
  SUBTITLE: 'El Retorno del Equilibrio',
  STUDIO: 'Bellium S.A.S.',
};

// Versión del juego (visible en el menú y en la carga). Súbela en cada cambio.
export const VERSION = 'v0.7';

// Paleta: río al atardecer, óxido de un mundo que se cayó, pergamino de la
// Biblioteca y el dorado de la balanza.
export const COLORS = {
  bgDeep: '#0d1820',
  night: '#14232e',
  river: '#2a7f86',
  teal: '#3fa3a0',
  rust: '#b5562c',
  parchment: '#efe3c2',
  gold: '#e3b04b',
  cream: '#f3ecd8',
  ink: '#1a1410',
  shadow: '#081016',
  good: '#8fd694',
  bad: '#e8817a',
  // Alias que siguen usando las escenas heredadas del motor.
  bgGreen: '#16303a',
  green: '#3fa3a0',
  greenLight: '#8fd6c8',
};

// Claves de guardado propias (no se mezclan con otros juegos del mismo sitio).
export const SAVE_KEY = 'aequitas_save_v1';
