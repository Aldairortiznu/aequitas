// Los cuatro Emisarios del Equilibrio: salen de la Bóveda de la Biblioteca
// Experimental con el tubo de códices al hombro y el broche de la Margarita
// Dorada. Cada quien tiene su aspecto, su historia y un pequeño don. En el juego
// se les llama por su nombre.
//
// spec: apariencia para makePerson (ver drawPerson en art/aequitasArt.js).
// perk: hearts (+♥ en la audiencia), hints (+pistas), calm (calmas de Tinto por
//       declaración), speed (multiplica la velocidad al caminar).
// spec extra: tube (tubo de códices), brooch (broche de la Margarita), mask, hat 'hood'.

export const HEROES = [
  {
    id: 'aurelio',
    name: 'Aurelio',
    tag: 'El Archivista',
    bio: 'Reconstruye actas y libros que la guerra dejó en cenizas, y encuentra el decreto mal hecho a la primera lectura. Repite siempre: sin debido proceso no hay justicia.',
    perk: { name: 'Lectura fina', desc: '+1 pista de Lumen en la audiencia', hints: 1 },
    spec: { skin: 'medio', hair: '#2a2220', hairStyle: 'short', glasses: true, beard: true, top: '#efe3c2', coat: '#2f4f6e', trim: '#e3b04b', bottom: '#3a3530', shoes: '#3a2a20', item: 'book', tube: true, brooch: true, patches: true },
  },
  {
    id: 'valeria',
    name: 'Valeria',
    tag: 'La Cartógrafa',
    bio: 'Dibuja el mapa de los conflictos de cada pueblo: quién vive dónde, quién le debe a quién, qué camino es de todos. Sabe reunir a los vecinos en asamblea.',
    perk: { name: 'Atajos', desc: 'Caminas más rápido por el puerto', speed: 1.2 },
    spec: { skin: 'moreno', hair: '#2a1d1a', hairStyle: 'long', hat: 'bandana', hatColor: '#c8302a', earrings: true, top: '#efe3c2', coat: '#2f6f73', trim: '#e3b04b', bottom: '#3a3530', shoes: '#3a2a20', item: 'map', tube: true, brooch: true },
  },
  {
    id: 'kaelen',
    name: 'Kaelen',
    tag: 'Custodio de los números',
    bio: 'Sereno y observador. Revisa cuentas, recibos y pagarés hasta dar con el abuso escondido. Tinto le tiene confianza: donde Kaelen se sienta, la gente baja la voz.',
    perk: { name: 'Serenidad', desc: 'Tinto calma a la asamblea 2 veces por declaración', calm: 2 },
    spec: { skin: 'trigueno', hair: '#3a2a22', hairStyle: 'undercut', hairTip: '#3fa3a0', top: '#d6c29a', ruana: '#9a4a2a', ruanaStripe: '#e3b04b', bottom: '#4a4038', shoes: '#2a2420', item: 'ledger', tube: true, brooch: true, patches: true },
  },
  {
    id: 'sora',
    name: 'Sora',
    tag: 'Centinela de bronce',
    bio: 'Lleva la máscara de bronce de la Orden y habla poco. Cuando habla, recuerda a quien manda a la fuerza que los derechos fundamentales no se negocian.',
    perk: { name: 'Firmeza', desc: '+1 ♥ de confianza en la audiencia', hearts: 1 },
    spec: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'bob', hat: 'hood', hatColor: '#5a3a6e', mask: 'bronze', top: '#c9c2b0', coat: '#3f6a3a', trim: '#b0893f', bottom: '#3a3530', shoes: '#2a2420', tube: true, brooch: true },
  },
];

// Ids de versiones anteriores (Tomás, Río, Alex) → los emisarios de hoy.
const LEGACY = { tomas: 'aurelio', rio: 'kaelen', alex: 'sora' };

export function getHero(id) {
  return HEROES.find((h) => h.id === (LEGACY[id] || id)) || null;
}

// El héroe de una partida (las partidas antiguas solo guardaban el género).
export function heroFor(save) {
  return (save && getHero(save.hero)) || (save && save.gender === 'f' ? HEROES[1] : HEROES[0]); // partidas antiguas
}
