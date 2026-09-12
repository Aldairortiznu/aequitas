// Constantes globales de "AEQUITAS: El Retorno del Equilibrio".
// Bellium S.A.S. · Publicación Editorial Al Resuelve (Cartagena de Indias, Colombia).

export const GAME = {
  WIDTH: 480,
  HEIGHT: 270,
  TITLE: 'AEQUITAS',
  SUBTITLE: 'El Retorno del Equilibrio',
  TAGLINE: 'Donde impera la arbitrariedad, la ley hace florecer la paz.',
  ORGANIZATION: 'Bellium S.A.S. · Al Resuelve (Cartagena de Indias)',
  TOTAL_LEVELS: 4,
};

export const COLORS = {
  bgDeep: '#0e0414',
  bgPurple: '#1f082e',
  purpleBellium: '#420060',
  purpleRoyal: '#9945de',
  purpleLight: '#c9a7eb',
  gold: '#e3940b',
  goldLight: '#ffd875',
  green: '#10b981',
  bgGreen: '#183121',
  greenForest: '#355E3B',
  greenLight: '#5bbf6a',
  greenEmerald: '#10b981',
  cream: '#faf8f6',
  ink: '#1a0d00',
  shadow: '#08020c',
};

// Roster de los Cuatro Exploradores de la Biblioteca Experimental.
export const EXPLORERS = {
  aurelio: {
    id: 'aurelio',
    name: 'Aurelio',
    title: 'El Archivista Errante',
    specialty: 'Debido Proceso & Códice Civil (Art. 29 C.P.)',
    bio: 'Erudito con lentes y zurrón de cuero. Rescató los códices del Estado de Derecho y detecta vicios procesales al instante.',
    color: '#c9a7eb',
    sprite: 'aurelio',
  },
  valeria: {
    id: 'valeria',
    name: 'Valeria',
    title: 'La Cartógrafa de Aguas',
    specialty: 'Propiedad Horizontal & Servidumbres (Ley 675 / Art. 919 C.C.)',
    bio: 'Agrimensora con brújula y plano topográfico. Sabe que sin orden común y sin cauces comunitarios, las colonias agrícolas perecen.',
    color: '#88c292',
    sprite: 'valeria',
  },
  kaelen: {
    id: 'kaelen',
    name: 'Kaelen',
    title: 'El Custodio de la Balanza',
    specialty: 'Títulos Valores & Erradicación de Usura (C.Co)',
    bio: 'Custodio andrógino de túnica grafito. Porta la balanza dorada para anular pagarés abusivos y restablecer el comercio justo.',
    color: '#ffd875',
    sprite: 'kaelen',
  },
  sora: {
    id: 'sora',
    name: 'Sora',
    title: 'La Centinela Constitucional',
    specialty: 'Derechos Fundamentales & Dignidad Humana',
    bio: 'Centinela con la máscara floral de bronce de Bellium y el báculo del equilibrio. Recuerda que la dignidad humana es inalienable.',
    color: '#ffffff',
    sprite: 'sora',
  },
};

// Capítulos jugables de la campaña.
export const CAPITULOS = [
  {
    nivel: 0,
    id: 'biblioteca',
    nombre: 'La Legendaria Biblioteca Experimental',
    lugar: 'Bóvedas Subterráneas del Caribe',
    norma: 'Art. 1 a 4 C.P. · Primacía de la Constitución',
    meta: 'Rescata el Códice de la Convivencia y parte al yermo.',
    color: '#420060',
  },
  {
    nivel: 1,
    id: 'torre_ceniza',
    nombre: 'Torre Ceniza & El Edicto de Expulsión',
    lugar: 'Sabana Urbana Central',
    norma: 'Art. 29 C.P. · Debido Proceso y Ley 675 de 2001',
    meta: 'Frena el destierro arbitrario de Doña Inés y convoca la Asamblea Comunal.',
    color: '#3b204e',
  },
  {
    nivel: 2,
    id: 'embarcadero',
    nombre: 'El Embarcadero & El Pagaré en Blanco',
    lugar: 'Puerto Fluvial de la Ciénaga',
    norma: 'Art. 621, 622, 871 y 884 C.Co · Buena Fe y Usura',
    meta: 'Desarma la extorsión de Silas y devuelve la lancha a Mateo.',
    color: '#1a3328',
  },
  {
    nivel: 3,
    id: 'terrazas',
    nombre: 'Las Terrazas & El Agua Secuestrada',
    lugar: 'Páramos Andinos de Boyacá',
    norma: 'Art. 919 y 931 Código Civil · Servidumbre de Acueducto',
    meta: 'Demuestra el derecho al agua y reconecta la acequia de la comunidad.',
    color: '#26422d',
  },
  {
    nivel: 4,
    id: 'santuario',
    nombre: 'El Gran Concilio del Santuario',
    lugar: 'El Santuario de la Margarita Dorada',
    norma: 'Pacto de Convivencia General · Restauración del Equilibrio',
    meta: 'Firma el tratado de paz y haz florecer el yermo con la luz de Bellium.',
    color: '#420060',
  },
];

export const SAVE_KEY = 'aequitas_bellium_save_v2';
