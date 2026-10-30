// POSTALES CINEMATOGRÁFICAS — los momentos míticos de la historia, a pantalla
// completa, como en Reverdecer: una imagen quieta que se acerca despacio, un
// título y dos o tres líneas del narrador. Se coleccionan en el álbum del menú
// y se pueden guardar como imagen.
//
// Cada postal se pinta por código (art/postales.js). Si existe una ilustración
// hecha a mano en public/assets/postales/<archivo> y está listada en
// public/assets/postales/postales.json, el juego usa esa imagen en su lugar.
// (Ver docs/PROMPT_POSTALES.md para encargarlas.)

export const POSTALES = [
  {
    key: 'leviatan',
    title: 'El Colapso del Leviatán',
    sub: 'Antes del Acuerdo de Altamar',
    lines: [
      'Los viejos cuentan que el país tenía un gigante: el Leviatán, hecho de jueces, escuelas, puentes y oficinas. Mientras estuvo en pie, nadie tenía que defenderse solo.',
      'En nueve años de guerra el gigante cayó. Lo que vino después lo llaman el Reino del Arbitrio: manda el que grita más fuerte, y el débil duerme con miedo.',
    ],
    memory: 'Donde no hay ley, manda el que grita más fuerte.',
  },
  {
    key: 'boveda',
    title: 'La Bóveda de la Biblioteca',
    sub: 'Bajo el mar Caribe',
    lines: [
      'Mientras el país ardía, la Orden de Bellium bajó el Códice a la Bóveda, bajo el mar Caribe: la Constitución, los códigos y los tratados de derechos humanos.',
      'Cuando se abrieron sus compuertas, salieron los Emisarios del Equilibrio, con el tubo de códices al hombro y el broche de la Margarita Dorada en el pecho.',
      'No salieron a conquistar a nadie. Salieron a ayudar a cada pueblo a volver a pactar su ley.',
    ],
    memory: 'La ley no se impone: se vuelve a pactar, pueblo por pueblo.',
  },
  {
    key: 'travesia',
    title: 'La travesía',
    sub: 'Río abajo, hacia Puerto Garza',
    lines: [
      'El río lo ha visto todo: a los que huyeron, a los que regresan y a los que nunca se fueron.',
      'Los pescadores dicen que de noche el agua repite en voz baja los nombres de los pueblos, para que nadie los olvide.',
    ],
    memory: 'El río guarda los nombres de los pueblos.',
  },
  {
    key: 'asamblea',
    title: 'La víspera',
    sub: 'La Junta abre sus puertas',
    lines: [
      'La noche antes de la audiencia, Puerto Garza casi no durmió. Por primera vez en años, la gente iba a la Junta a hablar y no a callar.',
      'Sobre la puerta seguía el lema de siempre: AQUÍ SE HABLA, NO SE GRITA.',
    ],
    memory: 'Aquí se habla, no se grita.',
  },
  {
    key: 'margarita',
    title: 'La Margarita Dorada',
    sub: 'Donde un pueblo vuelve a confiar',
    lines: [
      'A la mañana siguiente, entre las grietas del asfalto de la plaza, brotó una margarita dorada.',
      'Así lo cuenta la Orden: la Margarita florece donde una comunidad entiende que la ley civil es el suelo donde siembra su futuro.',
    ],
    memory: 'La ley es el suelo donde un pueblo siembra su futuro.',
  },
  {
    key: 'siete_puentes',
    title: 'Siete Puentes',
    sub: 'Lo que espera río arriba',
    lines: [
      'Río arriba, el puente colgante de Siete Puentes cayó al agua, y cada familia dice que la culpa es de otra.',
      'Allá espera la próxima Margarita.',
    ],
    memory: 'Allá espera la próxima Margarita.',
  },
];

export function getPostal(key) {
  return POSTALES.find((p) => p.key === key) || null;
}
