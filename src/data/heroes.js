// Los cuatro enviados de la Biblioteca Experimental. Cada quien tiene su aspecto,
// su historia y un pequeño don. En el juego se les llama por su nombre.
//
// spec: apariencia para makePerson (ver drawPerson en art/aequitasArt.js).
// perk: hearts (+♥ en la audiencia), hints (+pistas), calm (calmas de Tinto por
//       declaración), speed (multiplica la velocidad al caminar).

export const HEROES = [
  {
    id: 'tomas',
    name: 'Tomás',
    tag: 'Pescador de la Ciénaga del Silencio',
    bio: 'Aprendió a leer en la Biblioteca y desde entonces no suelta un libro. Remienda redes, remienda canoas... y ahora, acuerdos. Paciente como el río.',
    perk: { name: 'Paciencia', desc: '+1 ♥ de confianza en la audiencia', hearts: 1 },
    spec: { skin: 'medio', hair: '#1d1a1c', hairStyle: 'short', mustache: true, hat: 'explorer', hatColor: '#6b4a2f', top: '#efe3c2', coat: '#2f6f73', trim: '#e3b04b', bottom: '#3a3530', shoes: '#3a2a20', backpack: '#7a5a3a', patches: true },
  },
  {
    id: 'valeria',
    name: 'Valeria',
    tag: 'Radioaficionada de Bahía Ceniza',
    bio: 'Arma radios con chatarra y capta voces de pueblos que nadie más oye. Escucha hasta lo que la gente no dice.',
    perk: { name: 'Buena señal', desc: '+1 pista de Lumen en la audiencia', hints: 1 },
    spec: { skin: 'moreno', hair: '#2a1d1a', hairStyle: 'long', hat: 'bandana', hatColor: '#c8302a', earrings: true, top: '#efe3c2', coat: '#2f6f73', trim: '#e3b04b', bottom: '#3a3530', shoes: '#3a2a20', backpack: '#5a6a3a', item: 'radio' },
  },
  {
    id: 'rio',
    name: 'Río',
    tag: 'Guía de balsas del delta',
    bio: 'Creció en una balsa, entre pueblos que la guerra dejó vacíos. Habla poco, lo observa todo, y Tinto no se le despega.',
    perk: { name: 'Amistad con Tinto', desc: 'Tinto calma a la asamblea 2 veces por declaración', calm: 2 },
    spec: { skin: 'trigueno', hair: '#3a2a22', hairStyle: 'undercut', hairTip: '#3fa3a0', goggles: true, top: '#d6c29a', ruana: '#9a4a2a', ruanaStripe: '#e3b04b', bottom: '#4a4038', shoes: '#2a2420', patches: true },
  },
  {
    id: 'alex',
    name: 'Alex',
    tag: 'Artista de mapas',
    bio: 'Dibuja los mapas del país nuevo: lo que la guerra borró y lo que la paz está levantando. Conoce todos los atajos.',
    perk: { name: 'Atajos', desc: 'Caminas más rápido por el puerto', speed: 1.2 },
    spec: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'bob', neckerchief: '#3fa3a0', top: '#c9c2b0', coat: '#5a6a3a', trim: '#b0893f', bottom: '#3a3530', shoes: '#2a2420', item: 'map', patches: true },
  },
];


export function getHero(id) {
  return HEROES.find((h) => h.id === id) || null;
}

// El héroe de una partida (las partidas antiguas solo guardaban el género).
export function heroFor(save) {
  return (save && getHero(save.hero)) || (save && save.gender === 'f' ? HEROES[1] : HEROES[0]); // partidas antiguas
}
