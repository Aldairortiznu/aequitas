// Datos puros de los sprites pixel art de AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Sprites de los 4 Exploradores, compañeros, antagonistas, alegatos y la Margarita Dorada.

export const PAL = {
  skin: '#f2c9a0', skinSh: '#d7a87d', blush: '#e69a8d',
  hair: '#15151f', hairHi: '#2c2c3e', hairBrown: '#3e2723', hairGrey: '#78909c',
  eye: '#23232c', mouth: '#b35c54', white: '#ffffff',
  
  // Paleta Bellium
  purpleBellium: '#420060', purpleDeep: '#420060', purpleRoyal: '#9945de', purpleLight: '#c9a7eb',
  gold: '#e3940b', goldLight: '#ffd875', goldPale: '#fef1d6',
  greenForest: '#355E3B', greenLight: '#88c292', greenEmerald: '#10b981',
  
  // Materiales y ropa
  dress: '#2f6b3f', dressSh: '#214d2e', trim: '#6cc77a',
  tunicAurelio: '#32104a', tunicAurelioTrim: '#e3940b',
  vestValeria: '#274b33', vestValeriaSh: '#183121',
  robeKaelen: '#282430', robeKaelenTrim: '#ffd875',
  cloakSora: '#1e1b24', maskBronze: '#d97706',
  
  belt: '#6b4a2f', boot: '#4a3322', leather: '#5d4037', parchment: '#f4ecdc',
  fur: '#f6f3ea', furSh: '#ded8c8', grey: '#c7c1b1', nose: '#2a2530',
  glass: '#3b82d6', glassHi: '#8fc1f0',
};

const r = (x, y, c, w = 1, h = 1) => ({ x, y, w, h, c });

export const SPRITES = {
  // ------------------------------------------------------------- 1. AURELIO (El Archivista)
  aurelio: {
    w: 18, h: 28,
    rects: [
      // Cabello castaño canoso con raya
      r(4, 1, PAL.hairBrown, 10, 3), r(3, 3, PAL.hairBrown, 12, 7),
      r(3, 7, PAL.hairGrey, 2, 4), r(13, 7, PAL.hairGrey, 2, 4),
      // Rostro
      r(5, 5, PAL.skin, 8, 7), r(6, 12, PAL.skin, 6, 1), r(6, 11, PAL.skinSh, 6, 1),
      // Gafas redondas de erudito
      r(4, 7, PAL.gold, 4, 1), r(4, 10, PAL.gold, 4, 1),
      r(4, 8, PAL.glass, 1, 2), r(7, 8, PAL.glass, 1, 2),
      r(10, 7, PAL.gold, 4, 1), r(10, 10, PAL.gold, 4, 1),
      r(10, 8, PAL.glass, 1, 2), r(13, 8, PAL.glass, 1, 2),
      r(8, 7, PAL.gold, 2, 1), r(4, 7, PAL.glassHi, 1, 1), r(10, 7, PAL.glassHi, 1, 1),
      // Ojos y boca
      r(5, 8, PAL.eye, 1, 1), r(11, 8, PAL.eye, 1, 1),
      r(8, 11, PAL.mouth, 2, 1),
      // Túnica púrpura de Bellium con bordados dorados
      r(4, 14, PAL.tunicAurelio, 10, 3), r(4, 17, PAL.tunicAurelio, 10, 5),
      r(8, 14, PAL.tunicAurelioTrim, 2, 8), // estola dorada
      // Bolso de cuero / Códice Civil bajo el brazo
      r(2, 15, PAL.tunicAurelio, 2, 4), r(13, 15, PAL.leather, 3, 5),
      r(14, 16, PAL.parchment, 2, 3), r(14, 17, PAL.gold, 1, 1), // sello del códice
      r(3, 19, PAL.skin, 2, 2), r(13, 20, PAL.skin, 2, 1),
      // Cinturón y faldón
      r(4, 21, PAL.belt, 10, 1), r(8, 21, PAL.gold, 2, 1),
      r(4, 22, PAL.tunicAurelio, 10, 3), r(3, 24, PAL.tunicAurelio, 12, 1),
      // Botas
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  // ------------------------------------------------------------- 2. VALERIA (La Cartógrafa de Aguas)
  valeria: {
    w: 18, h: 28,
    rects: [
      // Cabello castaño recogido con cinta verde
      r(4, 1, PAL.hairBrown, 10, 3), r(3, 3, PAL.hairBrown, 12, 8),
      r(2, 9, PAL.hairBrown, 3, 8), r(13, 9, PAL.hairBrown, 3, 8),
      r(5, 3, PAL.greenLight, 8, 1), // pañuelo verde
      // Rostro
      r(5, 5, PAL.skin, 8, 7), r(6, 12, PAL.skin, 6, 1), r(6, 11, PAL.skinSh, 6, 1),
      r(5, 8, PAL.eye, 2, 2), r(11, 8, PAL.eye, 2, 2),
      r(6, 8, PAL.white, 1, 1), r(12, 8, PAL.white, 1, 1),
      r(4, 10, PAL.blush, 1, 1), r(13, 10, PAL.blush, 1, 1),
      r(8, 11, PAL.mouth, 2, 1),
      // Chaleco de expedición verde bosque
      r(4, 14, PAL.vestValeria, 10, 7), r(6, 14, PAL.parchment, 6, 5), // camisa crema interior
      r(3, 15, PAL.vestValeria, 2, 4), r(13, 15, PAL.vestValeria, 2, 4),
      r(3, 19, PAL.skin, 2, 2), r(13, 19, PAL.skin, 2, 2),
      // Brújula de latón en el pecho
      r(8, 16, PAL.gold, 2, 2), r(8, 17, '#bfe0f5', 1, 1),
      // Cinturón con tubos de mapas
      r(4, 21, PAL.belt, 10, 1), r(2, 19, PAL.parchment, 2, 4), // plano enrollado
      // Pantalón y botas de campo
      r(5, 22, PAL.vestValeriaSh, 8, 3),
      r(5, 25, PAL.boot, 3, 3), r(10, 25, PAL.boot, 3, 3),
    ],
  },

  // ------------------------------------------------------------- 3. KAELEN (El Custodio de la Balanza)
  kaelen: {
    w: 18, h: 28,
    rects: [
      // Cabello negro liso medio
      r(4, 1, PAL.hair, 10, 3), r(3, 3, PAL.hair, 12, 8),
      r(3, 8, PAL.hair, 2, 6), r(13, 8, PAL.hair, 2, 6),
      // Rostro sereno
      r(5, 5, PAL.skin, 8, 7), r(6, 12, PAL.skin, 6, 1),
      r(5, 8, PAL.eye, 1, 2), r(11, 8, PAL.eye, 1, 2),
      r(8, 11, PAL.mouth, 2, 1),
      // Túnica grafito con ribetes de oro ámbar
      r(4, 14, PAL.robeKaelen, 10, 8), r(4, 14, PAL.robeKaelenTrim, 1, 8), r(13, 14, PAL.robeKaelenTrim, 1, 8),
      // Balanza dorada sostenida en mano derecha
      r(2, 15, PAL.gold, 1, 6), r(0, 17, PAL.gold, 5, 1), // barra de balanza
      r(0, 18, PAL.goldLight, 2, 2), r(3, 18, PAL.goldLight, 2, 2), // platillos
      r(3, 19, PAL.skin, 2, 2), r(13, 19, PAL.skin, 2, 2),
      // Faldón de túnica
      r(4, 22, PAL.robeKaelen, 10, 3), r(3, 24, PAL.robeKaelen, 12, 1),
      // Botas
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  // ------------------------------------------------------------- 4. SORA (La Centinela Constitucional)
  sora: {
    w: 18, h: 28,
    rects: [
      // Capucha y capa oscura
      r(4, 1, PAL.cloakSora, 10, 4), r(3, 3, PAL.cloakSora, 12, 8),
      // Máscara floral de bronce de Bellium
      r(5, 5, PAL.maskBronze, 8, 7),
      r(6, 6, PAL.gold, 2, 2), r(10, 6, PAL.gold, 2, 2), // pétalos esculpidos
      r(6, 8, PAL.white, 2, 1), r(10, 8, PAL.white, 2, 1), // rendijas de visión
      r(8, 9, PAL.goldLight, 2, 2), // centro floral
      // Capa y báculo de la dignidad
      r(4, 14, PAL.cloakSora, 10, 8), r(8, 14, PAL.purpleRoyal, 2, 8),
      r(14, 6, PAL.gold, 1, 18), // báculo
      r(13, 4, PAL.goldLight, 3, 3), r(14, 5, PAL.greenEmerald, 1, 1), // remate de flor
      r(3, 19, PAL.skin, 2, 2), r(13, 17, PAL.skin, 2, 2),
      // Túnica inferior
      r(4, 22, PAL.cloakSora, 10, 3), r(3, 24, PAL.cloakSora, 12, 1),
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  // Alias para retrocompatibilidad (Abigail usa Aurelio o Valeria según rol)
  abigail: {
    w: 18, h: 28,
    rects: [
      r(4, 1, PAL.hairBrown, 10, 3), r(3, 3, PAL.hairBrown, 12, 7),
      r(3, 7, PAL.hairGrey, 2, 4), r(13, 7, PAL.hairGrey, 2, 4),
      r(5, 5, PAL.skin, 8, 7), r(6, 12, PAL.skin, 6, 1),
      r(4, 7, PAL.gold, 4, 1), r(4, 10, PAL.gold, 4, 1),
      r(10, 7, PAL.gold, 4, 1), r(10, 10, PAL.gold, 4, 1),
      r(8, 7, PAL.gold, 2, 1),
      r(5, 8, PAL.eye, 1, 1), r(11, 8, PAL.eye, 1, 1),
      r(4, 14, PAL.tunicAurelio, 10, 3), r(4, 17, PAL.tunicAurelio, 10, 5),
      r(8, 14, PAL.tunicAurelioTrim, 2, 8),
      r(3, 19, PAL.skin, 2, 2), r(13, 19, PAL.skin, 2, 2),
      r(4, 21, PAL.belt, 10, 1),
      r(4, 22, PAL.tunicAurelio, 10, 3), r(3, 24, PAL.tunicAurelio, 12, 1),
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  // ------------------------------------------------------------- COMPAÑEROS
  jeronimo: {
    w: 20, h: 18,
    rects: [
      r(4, 3, PAL.fur, 3, 6), r(13, 3, PAL.fur, 3, 6),
      r(4, 6, PAL.furSh, 3, 3), r(13, 6, PAL.furSh, 3, 3),
      r(6, 2, PAL.fur, 8, 7),
      r(7, 3, PAL.grey, 2, 1), r(11, 3, PAL.grey, 2, 1),
      r(7, 4, PAL.eye, 1, 1), r(12, 4, PAL.eye, 1, 1),
      r(8, 6, PAL.grey, 4, 3), r(9, 7, PAL.nose, 2, 2),
      r(5, 9, PAL.fur, 10, 7), r(5, 13, PAL.furSh, 10, 1),
      r(6, 13, PAL.fur, 2, 4), r(12, 13, PAL.fur, 2, 4),
      r(3, 10, PAL.fur, 2, 4),
    ],
  },

  amanda: {
    w: 18, h: 16,
    rects: [
      r(5, 0, PAL.fur, 2, 4), r(11, 0, PAL.fur, 2, 4),
      r(5, 2, PAL.furSh, 1, 2), r(12, 2, PAL.furSh, 1, 2),
      r(6, 2, PAL.fur, 7, 6),
      r(7, 4, PAL.eye, 1, 1), r(10, 4, PAL.eye, 1, 1),
      r(8, 6, PAL.fur, 3, 2), r(9, 6, PAL.nose, 1, 1),
      r(4, 8, PAL.fur, 11, 4), r(4, 11, PAL.furSh, 11, 1),
      r(5, 11, PAL.fur, 1, 4), r(8, 11, PAL.fur, 1, 4),
      r(11, 11, PAL.fur, 1, 4), r(13, 11, PAL.fur, 1, 4),
      r(15, 5, PAL.fur, 2, 2), r(16, 4, PAL.fur, 1, 2),
    ],
  },

  // ------------------------------------------------------------- ANTAGONISTAS
  murociego: {
    w: 20, h: 30,
    rects: [
      // Sombrero militar / tricornio gris
      r(4, 1, '#37474f', 12, 3), r(2, 3, '#263238', 16, 2),
      // Rostro severo con cicatriz
      r(5, 5, PAL.skinSh, 10, 7), r(6, 8, '#b0bec5', 2, 1), r(12, 8, PAL.eye, 1, 1),
      r(7, 11, '#5d4037', 6, 1), // bigote
      // Chaqueta de mando militar desgastada
      r(3, 13, '#263238', 14, 9), r(9, 13, PAL.gold, 2, 9), // botones dorados
      r(1, 14, '#263238', 3, 6), r(16, 14, '#263238', 3, 6),
      r(1, 20, PAL.skinSh, 2, 2), r(17, 19, '#6d4c41', 2, 3), // martillo de remate
      // Cinturón y botas
      r(4, 22, '#212121', 12, 2), r(5, 24, '#263238', 10, 3),
      r(5, 27, '#111111', 4, 3), r(11, 27, '#111111', 4, 3),
    ],
  },

  silas: {
    w: 18, h: 28,
    rects: [
      // Pelo ralo engominado
      r(4, 2, '#212121', 10, 3), r(3, 4, '#212121', 12, 4),
      // Rostro astuto
      r(5, 6, PAL.skin, 8, 6), r(6, 8, PAL.eye, 1, 1), r(11, 8, PAL.eye, 1, 1),
      r(7, 11, PAL.mouth, 4, 1), // sonrisa torcida
      // Chaleco de comerciante fluvial
      r(4, 13, '#4a154b', 10, 7), r(7, 13, PAL.goldLight, 4, 5),
      r(3, 14, '#4a154b', 2, 5), r(13, 14, '#4a154b', 2, 5),
      r(2, 17, PAL.parchment, 3, 4), // pagaré en blanco enrollado
      r(13, 18, PAL.skin, 2, 2),
      // Pantalón y zapatos
      r(5, 20, PAL.belt, 8, 1), r(5, 21, '#2c3e50', 8, 4),
      r(5, 25, '#111111', 3, 3), r(10, 25, '#111111', 3, 3),
    ],
  },

  // Personajes del poblado
  dona_ines: {
    w: 16, h: 26,
    rects: [
      // Pañoleta morada
      r(4, 1, PAL.purpleRoyal, 8, 4), r(3, 3, PAL.purpleRoyal, 10, 3),
      r(4, 5, PAL.skinSh, 8, 6), r(5, 7, PAL.eye, 1, 1), r(10, 7, PAL.eye, 1, 1),
      r(4, 11, '#5d4037', 8, 10), r(6, 12, PAL.parchment, 4, 7), // delantal
      r(4, 21, '#3e2723', 8, 4), r(5, 24, PAL.boot, 2, 2), r(9, 24, PAL.boot, 2, 2),
    ],
  },

  mateo: {
    w: 16, h: 26,
    rects: [
      // Sombrero de paja de pescador
      r(3, 1, '#d7ccc8', 10, 2), r(1, 3, '#bcaaa4', 14, 1),
      r(5, 4, PAL.skinSh, 6, 6), r(6, 6, PAL.eye, 1, 1), r(9, 6, PAL.eye, 1, 1),
      r(4, 10, '#37474f', 8, 8), r(2, 11, '#37474f', 2, 5), r(12, 11, '#37474f', 2, 5),
      r(4, 18, '#546e7a', 8, 5), r(5, 23, PAL.boot, 2, 3), r(9, 23, PAL.boot, 2, 3),
    ],
  },

  // Sombra genérica (agente de la arbitrariedad)
  sombra: {
    w: 18, h: 18,
    rects: [
      r(5, 3, '#2a083b', 8, 3), r(3, 5, '#1b0526', 12, 7), r(4, 12, '#2a083b', 10, 3),
      r(2, 8, '#420060', 1, 3), r(15, 8, '#420060', 1, 3),
      r(4, 15, '#1b0526', 2, 2), r(8, 15, '#1b0526', 2, 2), r(12, 15, '#1b0526', 2, 2),
      r(6, 7, '#e3940b', 2, 2), r(10, 7, '#e3940b', 2, 2),
      r(7, 8, '#ffffff', 1, 1), r(11, 8, '#ffffff', 1, 1),
    ],
  },

  sombra_core: {
    w: 6, h: 6,
    rects: [
      r(1, 0, PAL.gold, 4, 1), r(0, 1, PAL.goldLight, 6, 4), r(1, 5, PAL.gold, 4, 1),
      r(2, 2, '#ffffff', 2, 2),
    ],
  },

  // ------------------------------------------------------------- ELEMENTOS DIALÉCTICOS Y PROPS
  // Proyectil de Alegato Jurídico (reemplaza espada slash)
  alegato: {
    w: 16, h: 16,
    rects: [
      r(4, 2, PAL.goldLight, 8, 2), r(2, 4, PAL.gold, 12, 8),
      r(4, 12, PAL.goldLight, 8, 2),
      r(5, 5, PAL.parchment, 6, 6),
      r(6, 7, PAL.purpleRoyal, 4, 1), r(6, 9, PAL.purpleRoyal, 4, 1), // líneas de texto legal
      r(7, 3, '#ffffff', 2, 2), // chispa de verdad
    ],
  },

  // Alias slash para retrocompatibilidad
  slash: {
    w: 16, h: 16,
    rects: [
      r(4, 2, PAL.goldLight, 8, 2), r(2, 4, PAL.gold, 12, 8),
      r(4, 12, PAL.goldLight, 8, 2),
      r(5, 5, PAL.parchment, 6, 6),
      r(6, 7, PAL.purpleRoyal, 4, 1), r(6, 9, PAL.purpleRoyal, 4, 1),
    ],
  },

  // Margarita Dorada de Bellium floreciente
  bellium_flower: {
    w: 16, h: 16,
    rects: [
      // Pétalos dorados
      r(6, 1, PAL.goldLight, 4, 3), r(6, 12, PAL.goldLight, 4, 3),
      r(1, 6, PAL.goldLight, 3, 4), r(12, 6, PAL.goldLight, 3, 4),
      r(3, 3, PAL.gold, 3, 3), r(10, 3, PAL.gold, 3, 3),
      r(3, 10, PAL.gold, 3, 3), r(10, 10, PAL.gold, 3, 3),
      // Núcleo verde esmeralda y oro
      r(5, 5, PAL.gold, 6, 6), r(6, 6, PAL.greenEmerald, 4, 4),
      r(7, 7, '#ffffff', 2, 2),
    ],
  },

  // Fuente de guardado / Monumento al Estado de Derecho
  fuente: {
    w: 18, h: 22,
    rects: [
      r(3, 14, '#420060', 12, 6), r(3, 18, '#1b0526', 12, 2), r(2, 12, '#9945de', 14, 2),
      r(4, 13, '#ffd875', 10, 2), // agua dorada bioluminiscente
      r(8, 6, '#420060', 2, 7),
      r(6, 3, PAL.gold, 6, 4), r(7, 4, '#ffffff', 4, 2),
    ],
  },

  // Portal de Convivencia
  portal: {
    w: 18, h: 26,
    rects: [
      r(2, 3, PAL.purpleBellium, 14, 3),
      r(2, 5, PAL.purpleBellium, 2, 18), r(14, 5, PAL.purpleBellium, 2, 18),
      r(4, 6, PAL.purpleRoyal, 10, 17),
      r(5, 7, PAL.gold, 8, 15),
      r(6, 8, PAL.goldLight, 6, 13),
      r(7, 9, '#ffffff', 4, 11),
    ],
  },

  // Atril de Jurisprudencia
  atril: {
    w: 18, h: 22,
    rects: [
      r(7, 12, '#5d4037', 4, 7), r(4, 18, '#3e2723', 10, 2),
      r(3, 9, '#e3940b', 12, 2), // reborde dorado
      r(3, 7, PAL.parchment, 6, 3), r(9, 7, PAL.parchment, 6, 3), // páginas
      r(8, 7, '#b71c1c', 2, 3), // cinta marcapáginas roja
      r(4, 8, PAL.purpleRoyal, 4, 1), r(10, 8, PAL.purpleRoyal, 4, 1),
      r(8, 3, PAL.goldLight, 2, 3), r(7, 4, '#ffffff', 4, 1),
    ],
  },

  npc_guia: {
    w: 16, h: 26,
    rects: [
      r(5, 0, PAL.gold, 6, 3), r(3, 3, PAL.gold, 10, 1),
      r(5, 4, PAL.skin, 6, 5), r(6, 6, PAL.eye, 1, 1), r(9, 6, PAL.eye, 1, 1),
      r(5, 8, PAL.grey, 6, 2),
      r(4, 10, PAL.purpleBellium, 8, 9), r(8, 10, PAL.gold, 1, 9),
      r(4, 14, PAL.belt, 8, 1),
      r(4, 19, PAL.purpleBellium, 8, 4), r(5, 23, PAL.boot, 2, 3), r(9, 23, PAL.boot, 2, 3),
      r(13, 4, PAL.gold, 1, 18),
    ],
  },

  leaf: {
    w: 8, h: 8,
    rects: [
      r(2, 0, PAL.gold, 4, 2), r(1, 2, PAL.goldLight, 6, 2),
      r(2, 4, PAL.gold, 4, 2), r(3, 1, '#ffffff', 2, 4),
    ],
  },
};
