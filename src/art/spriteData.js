// Datos puros de los sprites pixel art (sin dependencias de Phaser).
// Cada personaje = lista de rectángulos { x, y, w, h, c } sobre una rejilla.
// Lo usan tanto el motor (characters.js con Phaser) como la vista previa HTML.
//
// Abigail: pelo negro liso, piel clara (caucásica), túnica verde de viajera.
// Jerónimo: perro viejo, blanco con grises, orejas caídas, sentado y sereno.
// Amanda: perra joven, blanca, orejas en punta, alerta y valiente.

export const PAL = {
  skin: '#f2c9a0', skinSh: '#d7a87d', blush: '#e69a8d',
  hair: '#15151f', hairHi: '#2c2c3e',
  eye: '#23232c', mouth: '#b35c54', white: '#ffffff',
  dress: '#2f6b3f', dressSh: '#214d2e', trim: '#6cc77a',
  belt: '#6b4a2f', boot: '#4a3322',
  fur: '#f6f3ea', furSh: '#ded8c8', grey: '#c7c1b1', nose: '#2a2530',
  glass: '#3b82d6', glassHi: '#8fc1f0',
};

const r = (x, y, c, w = 1, h = 1) => ({ x, y, w, h, c });

export const SPRITES = {
  abigail: {
    w: 18, h: 28,
    rects: [
      // cabello (atrás, largo y liso)
      r(4, 1, PAL.hair, 10, 3), r(3, 3, PAL.hair, 12, 9),
      r(3, 9, PAL.hair, 3, 11), r(12, 9, PAL.hair, 3, 11),
      r(5, 1, PAL.hairHi, 3, 1),
      // rostro
      r(5, 5, PAL.skin, 8, 8), r(6, 12, PAL.skin, 6, 2), r(5, 11, PAL.skinSh, 8, 1),
      // flequillo
      r(5, 4, PAL.hair, 8, 2), r(5, 4, PAL.hair, 2, 4), r(11, 4, PAL.hair, 2, 4),
      // ojos
      r(7, 8, PAL.eye, 2, 2), r(10, 8, PAL.eye, 2, 2),
      r(7, 8, PAL.white, 1, 1), r(10, 8, PAL.white, 1, 1),
      // mejillas + boca
      r(6, 10, PAL.blush, 1, 1), r(11, 10, PAL.blush, 1, 1), r(8, 11, PAL.mouth, 2, 1),
      // gafas de marco azul, lentes transparentes (se ven los ojos)
      r(6, 7, PAL.glass, 4, 1), r(6, 10, PAL.glass, 4, 1),   // aro izq: arriba/abajo
      r(6, 8, PAL.glass, 1, 2), r(9, 8, PAL.glass, 1, 2),    // aro izq: lados (x9 = puente)
      r(9, 7, PAL.glass, 4, 1), r(9, 10, PAL.glass, 4, 1),   // aro der: arriba/abajo
      r(12, 8, PAL.glass, 1, 2),                              // aro der: lado externo
      r(5, 8, PAL.glass, 1, 1), r(13, 8, PAL.glass, 1, 1),   // patillas hacia el pelo
      // túnica
      r(4, 14, PAL.dress, 10, 3), r(4, 17, PAL.dress, 10, 5),
      r(4, 16, PAL.trim, 10, 1), r(8, 17, PAL.dressSh, 2, 5),
      // brazos + manos
      r(3, 15, PAL.dress, 2, 4), r(13, 15, PAL.dress, 2, 4),
      r(3, 19, PAL.skin, 2, 2), r(13, 19, PAL.skin, 2, 2),
      // cinturón
      r(4, 21, PAL.belt, 10, 1),
      // falda
      r(4, 22, PAL.dress, 10, 3), r(3, 24, PAL.dress, 12, 1),
      r(3, 24, PAL.dressSh, 1, 1), r(14, 24, PAL.dressSh, 1, 1),
      // botas
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  jeronimo: {
    w: 20, h: 18,
    rects: [
      // orejas caídas
      r(4, 3, PAL.fur, 3, 6), r(13, 3, PAL.fur, 3, 6),
      r(4, 6, PAL.furSh, 3, 3), r(13, 6, PAL.furSh, 3, 3),
      // cabeza
      r(6, 2, PAL.fur, 8, 7),
      // cejas grises
      r(7, 3, PAL.grey, 2, 1), r(11, 3, PAL.grey, 2, 1),
      // ojos
      r(7, 4, PAL.eye, 1, 1), r(12, 4, PAL.eye, 1, 1),
      // hocico + nariz
      r(8, 6, PAL.grey, 4, 3), r(9, 7, PAL.nose, 2, 2),
      // cuerpo sentado
      r(5, 9, PAL.fur, 10, 7), r(5, 13, PAL.furSh, 10, 1),
      // patas
      r(6, 13, PAL.fur, 2, 4), r(12, 13, PAL.fur, 2, 4),
      // cola
      r(3, 10, PAL.fur, 2, 4),
    ],
  },

  amanda: {
    w: 18, h: 16,
    rects: [
      // orejas en punta
      r(5, 0, PAL.fur, 2, 4), r(11, 0, PAL.fur, 2, 4),
      r(5, 2, PAL.furSh, 1, 2), r(12, 2, PAL.furSh, 1, 2),
      // cabeza
      r(6, 2, PAL.fur, 7, 6),
      // ojos
      r(7, 4, PAL.eye, 1, 1), r(10, 4, PAL.eye, 1, 1),
      // hocico + nariz
      r(8, 6, PAL.fur, 3, 2), r(9, 6, PAL.nose, 1, 1),
      // cuerpo de pie
      r(4, 8, PAL.fur, 11, 4), r(4, 11, PAL.furSh, 11, 1),
      // patas
      r(5, 11, PAL.fur, 1, 4), r(8, 11, PAL.fur, 1, 4),
      r(11, 11, PAL.fur, 1, 4), r(13, 11, PAL.fur, 1, 4),
      // cola levantada
      r(15, 5, PAL.fur, 2, 2), r(16, 4, PAL.fur, 1, 2),
    ],
  },

  leaf: {
    w: 8, h: 8,
    rects: [
      r(2, 0, PAL.trim, 4, 2), r(1, 2, PAL.trim, 6, 2),
      r(2, 4, PAL.trim, 4, 2), r(3, 1, '#9be8a6', 2, 4),
    ],
  },
};
