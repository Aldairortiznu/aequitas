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
      // rostro (más suave y redondeado)
      r(5, 5, PAL.skin, 8, 7), r(6, 12, PAL.skin, 6, 1), r(6, 11, PAL.skinSh, 6, 1),
      r(4, 6, PAL.skin, 1, 4), r(13, 6, PAL.skin, 1, 4), // mejillas redondeadas
      // flequillo con raya al medio
      r(5, 4, PAL.hair, 8, 1), r(5, 5, PAL.hair, 2, 2), r(11, 5, PAL.hair, 2, 2),
      r(8, 4, PAL.hair, 1, 1), r(9, 4, PAL.hair, 1, 1),
      // ojos grandes y expresivos (blanco + pupila + brillo)
      r(5, 8, PAL.white, 2, 2), r(11, 8, PAL.white, 2, 2),
      r(6, 8, PAL.eye, 1, 2), r(11, 8, PAL.eye, 1, 2),   // pupilas hacia el centro
      r(5, 8, PAL.white, 1, 1), r(12, 8, PAL.white, 1, 1), // chispa
      r(5, 7, PAL.hair, 2, 1), r(11, 7, PAL.hair, 2, 1),  // pestañas
      // nariz + sonrisa suave
      r(8, 10, PAL.skinSh, 1, 1),
      r(7, 11, PAL.mouth, 3, 1), r(7, 11, PAL.skin, 1, 1), r(9, 11, PAL.skin, 1, 1),
      // mejillas sonrojadas
      r(4, 9, PAL.blush, 1, 1), r(13, 9, PAL.blush, 1, 1),
      // gafas: monturas redondas finas, lentes transparentes
      r(4, 7, PAL.glass, 4, 1), r(4, 10, PAL.glass, 4, 1),   // aro izq arriba/abajo
      r(4, 8, PAL.glass, 1, 2), r(7, 8, PAL.glass, 1, 2),    // aro izq lados
      r(10, 7, PAL.glass, 4, 1), r(10, 10, PAL.glass, 4, 1), // aro der arriba/abajo
      r(10, 8, PAL.glass, 1, 2), r(13, 8, PAL.glass, 1, 2),  // aro der lados
      r(8, 7, PAL.glass, 2, 1),                              // puente alto entre lentes
      r(3, 8, PAL.glass, 1, 1), r(14, 8, PAL.glass, 1, 1),   // patillas hacia el pelo
      r(4, 7, PAL.glassHi, 1, 1), r(10, 7, PAL.glassHi, 1, 1), // brillo de cristal
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

  abigail_back: {
    w: 18, h: 28,
    rects: [
      // cabello cubriendo toda la cabeza (de espaldas)
      r(4, 1, PAL.hair, 10, 3), r(3, 3, PAL.hair, 12, 9),
      r(3, 9, PAL.hair, 3, 11), r(12, 9, PAL.hair, 3, 11),
      r(5, 5, PAL.hair, 8, 7), r(5, 1, PAL.hairHi, 3, 1),
      r(6, 12, PAL.skin, 6, 1), // nuca
      // túnica (igual que de frente)
      r(4, 14, PAL.dress, 10, 3), r(4, 17, PAL.dress, 10, 5),
      r(4, 16, PAL.trim, 10, 1), r(8, 17, PAL.dressSh, 2, 5),
      r(3, 15, PAL.dress, 2, 4), r(13, 15, PAL.dress, 2, 4),
      r(3, 19, PAL.skin, 2, 2), r(13, 19, PAL.skin, 2, 2),
      r(4, 21, PAL.belt, 10, 1),
      r(4, 22, PAL.dress, 10, 3), r(3, 24, PAL.dress, 12, 1),
      r(3, 24, PAL.dressSh, 1, 1), r(14, 24, PAL.dressSh, 1, 1),
      r(6, 25, PAL.boot, 2, 3), r(10, 25, PAL.boot, 2, 3),
    ],
  },

  npc_guia: {
    w: 16, h: 26,
    rects: [
      // sombrero de paja / jardinero
      r(5, 0, '#c9a24b', 6, 3), r(3, 3, '#c9a24b', 10, 1), r(4, 2, '#dcb968', 8, 1),
      // rostro
      r(5, 4, PAL.skin, 6, 5),
      r(6, 6, PAL.eye, 1, 1), r(9, 6, PAL.eye, 1, 1),
      // barba canosa (anciano)
      r(5, 8, PAL.grey, 6, 2), r(6, 9, '#e7e3d6', 4, 1),
      // túnica verde terroso
      r(4, 10, '#3f5c34', 8, 9), r(8, 10, '#34502c', 1, 9),
      r(3, 11, '#3f5c34', 1, 5), r(12, 11, '#3f5c34', 1, 5),
      r(4, 14, PAL.belt, 8, 1),
      // bajo de la túnica + pies
      r(4, 19, '#3f5c34', 8, 4), r(5, 23, PAL.boot, 2, 3), r(9, 23, PAL.boot, 2, 3),
      // bastón
      r(13, 4, '#6b4a2f', 1, 18), r(12, 3, '#3a9457', 3, 2),
    ],
  },

  sombra: {
    w: 18, h: 18,
    rects: [
      // cuerpo de sombra (morado muy oscuro)
      r(5, 3, '#2a2438', 8, 3), r(3, 5, '#2a2438', 12, 7), r(4, 12, '#2a2438', 10, 3),
      r(2, 8, '#2a2438', 1, 3), r(15, 8, '#2a2438', 1, 3),
      // tentáculos inferiores
      r(4, 15, '#2a2438', 2, 2), r(8, 15, '#2a2438', 2, 2), r(12, 15, '#2a2438', 2, 2),
      // bruma interior
      r(5, 6, '#3a3152', 8, 5),
      // ojos brillantes (lavanda)
      r(6, 7, '#c3a9ec', 2, 2), r(10, 7, '#c3a9ec', 2, 2),
      r(7, 8, '#ffffff', 1, 1), r(11, 8, '#ffffff', 1, 1),
    ],
  },

  // Núcleo / punto débil, visible cuando Jerónimo usa Sabiduría.
  sombra_core: {
    w: 6, h: 6,
    rects: [
      r(1, 0, '#e9c46a', 4, 1), r(0, 1, '#f6e6a8', 6, 4), r(1, 5, '#e9c46a', 4, 1),
      r(2, 2, '#ffffff', 2, 2),
    ],
  },

  // Destello del ataque de Abigail.
  slash: {
    w: 14, h: 14,
    rects: [
      r(8, 1, '#f3efe0', 2, 2), r(10, 3, '#ffffff', 2, 3), r(11, 6, '#f3efe0', 2, 3),
      r(10, 9, '#ffffff', 2, 2), r(8, 11, '#f3efe0', 2, 2),
    ],
  },

  // Fuente: punto de guardado.
  fuente: {
    w: 16, h: 20,
    rects: [
      // base de piedra
      r(3, 13, '#8a8f96', 10, 5), r(3, 17, '#6f747b', 10, 2), r(2, 11, '#b7bcc2', 12, 2),
      // agua del tazón
      r(4, 12, '#3f86cf', 8, 2), r(5, 12, '#bfe0f5', 2, 1),
      // pilar central
      r(7, 6, '#b7bcc2', 2, 6),
      // chorro / agua superior
      r(6, 4, '#3f86cf', 4, 2), r(7, 2, '#bfe0f5', 2, 2),
      r(5, 6, '#bfe0f5', 1, 3), r(10, 6, '#bfe0f5', 1, 3),
    ],
  },

  // Portal hacia el siguiente reino.
  portal: {
    w: 16, h: 24,
    rects: [
      r(2, 4, '#8a8f96', 12, 3),   // arco superior
      r(2, 6, '#6f747b', 2, 16), r(12, 6, '#6f747b', 2, 16), // pilares
      r(4, 7, '#2f7d45', 8, 15),   // brillo interior
      r(5, 8, '#5bbf6a', 6, 13),
      r(6, 9, '#9be8a6', 4, 11),   // núcleo luminoso
      r(7, 3, '#e9c46a', 2, 1), r(6, 6, '#bfe0f5', 1, 2), r(9, 6, '#bfe0f5', 1, 2),
    ],
  },

  // Atril con libro abierto: pedestal de acertijo.
  atril: {
    w: 16, h: 20,
    rects: [
      r(6, 11, '#8a8f96', 4, 7), r(4, 17, '#6f747b', 8, 2), // pilar + base
      r(3, 8, '#6b4a2f', 10, 2),                            // tapa del libro
      r(3, 6, '#f3efe0', 5, 2), r(8, 6, '#f3efe0', 5, 2),   // páginas
      r(7, 6, '#4a3322', 1, 2),                             // lomo
      r(4, 6, '#9bb0c0', 3, 1), r(9, 6, '#9bb0c0', 3, 1),   // renglones
      r(7, 2, '#e9c46a', 1, 2), r(6, 3, '#f6e6a8', 3, 1),   // chispa de saber
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
