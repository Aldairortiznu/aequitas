// Biomas de "Reverdecer": le dan a cada reino su propia identidad visual y de juego.
// En vez de un único jardín re-tintado, cada nivel pertenece a un BIOMA que define
// su terreno, decorados, borde, agua, monstruo, dificultad y ambiente místico.
//
// Cada bioma:
//   ground   : { base, accent, fleck, accentChance, path } — colores del suelo
//   border   : textura del borde sólido del mapa (o null = sin muro de borde)
//   water    : { tex, style } o null — masa de agua característica
//   decor    : [ { tex, count, collide } ] — decorados esparcidos (procedurales)
//   monster  : clave del sprite del Guardián ('sombra'|'mon_beast'|'mon_specter'|'mon_vine'|'mon_mirror')
//   stats    : { hp, speed, scale } — fuerza/velocidad/tamaño del Guardián
//   ambient  : { color, count, rise, drift, size } — partículas flotantes del aire
//
// Todos los textos en español latino.

export const BIOMES = {
  // Jardín sereno y luminoso. Prólogo y reinos de inicio.
  jardin: {
    ground: { base: '#3a7d4a', accent: '#46925a', fleck: '#347044', accentChance: 0.12, path: '#b89b6a' },
    border: 'd_pine',
    water: { tex: 't_water', style: 'estanque' },
    decor: [
      { tex: 'd_flowerbush', count: 10, collide: false },
      { tex: 'd_mushroom', count: 5, collide: false },
      { tex: 'd_rock', count: 4, collide: true },
    ],
    monster: 'sombra',
    stats: { hp: 5, speed: 42, scale: 1 },
    ambient: { color: 0xf6e6a8, count: 26, rise: -8, drift: 6, size: 0.7 },
  },

  // Bosque denso y umbrío: árboles altos, esporas en el aire.
  bosque: {
    ground: { base: '#2c5d3a', accent: '#244d30', fleck: '#1f4429', accentChance: 0.2, path: '#7d6a45' },
    border: 'd_pine',
    water: null,
    decor: [
      { tex: 'd_pine', count: 16, collide: true },
      { tex: 'd_mushroom', count: 9, collide: false },
      { tex: 'd_rock', count: 5, collide: true },
    ],
    monster: 'mon_beast',
    stats: { hp: 7, speed: 60, scale: 1 },
    ambient: { color: 0x9be8a6, count: 30, rise: -4, drift: 10, size: 0.6 },
  },

  // Ruinas de piedra vestidas de hiedra: columnas rotas, polvo dorado.
  ruinas: {
    ground: { base: '#4a5340', accent: '#5a6149', fleck: '#3c4435', accentChance: 0.18, path: '#9b9384' },
    border: 'd_pillar',
    water: null,
    decor: [
      { tex: 'd_pillar', count: 10, collide: true },
      { tex: 'd_rock', count: 8, collide: true },
      { tex: 'd_flowerbush', count: 4, collide: false },
    ],
    monster: 'mon_specter',
    stats: { hp: 6, speed: 32, scale: 1.1 },
    ambient: { color: 0xe9c46a, count: 22, rise: -3, drift: 4, size: 0.6 },
  },

  // Pradera abierta, casas ajenas iluminadas a lo lejos, pétalos al viento.
  pradera: {
    ground: { base: '#5a924f', accent: '#67a35a', fleck: '#4d8045', accentChance: 0.22, path: '#c2a86a' },
    border: 'd_pine',
    water: { tex: 't_water', style: 'estanque' },
    decor: [
      { tex: 'd_flowerbush', count: 14, collide: false },
      { tex: 'd_lantern', count: 6, collide: false },
      { tex: 'd_rock', count: 3, collide: true },
    ],
    monster: 'sombra',
    stats: { hp: 5, speed: 46, scale: 1 },
    ambient: { color: 0xf3d2e0, count: 28, rise: -6, drift: 14, size: 0.7 },
  },

  // Cripta / sótano de raíces: piedra oscura, brasas tenues.
  cripta: {
    ground: { base: '#2b2a26', accent: '#34322c', fleck: '#211f1c', accentChance: 0.2, path: '#4a4438' },
    border: 'd_pillar',
    water: null,
    decor: [
      { tex: 'd_pillar', count: 8, collide: true },
      { tex: 'd_rock', count: 10, collide: true },
      { tex: 'd_lantern', count: 5, collide: false },
    ],
    monster: 'mon_specter',
    stats: { hp: 7, speed: 30, scale: 1.15 },
    ambient: { color: 0xe07a3a, count: 18, rise: -10, drift: 4, size: 0.6 },
  },

  // Pantano estancado: agua turbia por todos lados, juncos, esporas.
  pantano: {
    ground: { base: '#3a4a2e', accent: '#46532f', fleck: '#2e3a24', accentChance: 0.25, path: '#5e5a3a' },
    border: 'd_deadtree',
    water: { tex: 'w_murky', style: 'cienaga' },
    decor: [
      { tex: 'd_reed', count: 16, collide: false },
      { tex: 'd_deadtree', count: 8, collide: true },
      { tex: 'd_mushroom', count: 6, collide: false },
    ],
    monster: 'mon_vine',
    stats: { hp: 8, speed: 22, scale: 1.05 },
    ambient: { color: 0xbfe07a, count: 24, rise: -2, drift: 8, size: 0.6 },
  },

  // Niebla espesa: poca visibilidad, faroles, calma inquietante.
  niebla: {
    ground: { base: '#465049', accent: '#505a52', fleck: '#3a433d', accentChance: 0.16, path: '#8a8d86' },
    border: 'd_deadtree',
    water: null,
    decor: [
      { tex: 'd_deadtree', count: 10, collide: true },
      { tex: 'd_lantern', count: 8, collide: false },
      { tex: 'd_rock', count: 5, collide: true },
    ],
    monster: 'mon_specter',
    stats: { hp: 6, speed: 36, scale: 1.1 },
    ambient: { color: 0xd8e0e4, count: 40, rise: -1, drift: 12, size: 1.4 },
  },

  // Reino congelado a medio cambiar: escarcha, copos.
  nieve: {
    ground: { base: '#9fb6b0', accent: '#b7c9c4', fleck: '#869c97', accentChance: 0.18, path: '#cdd8d4' },
    border: 'd_pine',
    water: { tex: 't_water', style: 'estanque' },
    decor: [
      { tex: 'd_pine', count: 12, collide: true },
      { tex: 'd_rock', count: 6, collide: true },
    ],
    monster: 'sombra',
    stats: { hp: 6, speed: 40, scale: 1 },
    ambient: { color: 0xffffff, count: 34, rise: 10, drift: 10, size: 0.8 },
  },

  // Jardín geométrico / laberinto de setos.
  seto: {
    ground: { base: '#3f8a4e', accent: '#4a9a5a', fleck: '#357544', accentChance: 0.1, path: '#cdbc8a' },
    border: 'd_hedge',
    water: null,
    decor: [
      { tex: 'd_hedge', count: 26, collide: true },
      { tex: 'd_flowerbush', count: 5, collide: false },
    ],
    monster: 'mon_vine',
    stats: { hp: 7, speed: 26, scale: 1 },
    ambient: { color: 0xe9f0a8, count: 20, rise: -5, drift: 8, size: 0.6 },
  },

  // Caverna / casa de cristal: cristales luminosos, destellos.
  cristal: {
    ground: { base: '#2c3344', accent: '#384057', fleck: '#242a38', accentChance: 0.22, path: '#5a6488' },
    border: 'd_crystal',
    water: { tex: 't_water', style: 'estanque' },
    decor: [
      { tex: 'd_crystal', count: 18, collide: true },
      { tex: 'd_rock', count: 6, collide: true },
    ],
    monster: 'mon_mirror',
    stats: { hp: 6, speed: 48, scale: 1 },
    ambient: { color: 0xa9e0ec, count: 30, rise: -6, drift: 6, size: 0.7 },
  },

  // Costa / acantilado sobre el mar infinito.
  costa: {
    ground: { base: '#6a8f5a', accent: '#789a66', fleck: '#5a7d4d', accentChance: 0.16, path: '#c9b98a' },
    border: 'd_rock',
    water: { tex: 't_water', style: 'mar' },
    decor: [
      { tex: 'd_rock', count: 12, collide: true },
      { tex: 'd_flowerbush', count: 6, collide: false },
    ],
    monster: 'sombra',
    stats: { hp: 6, speed: 50, scale: 1 },
    ambient: { color: 0xbfe0f5, count: 26, rise: -4, drift: 18, size: 0.7 },
  },

  // Meseta nocturna bajo un cielo de estrellas (el reino del Sentido).
  nocturno: {
    ground: { base: '#1c2440', accent: '#26305a', fleck: '#161d33', accentChance: 0.2, path: '#3a4470' },
    border: 'd_crystal',
    water: null,
    decor: [
      { tex: 'd_crystal', count: 10, collide: true },
      { tex: 'd_lantern', count: 8, collide: false },
      { tex: 'd_rock', count: 5, collide: true },
    ],
    monster: 'mon_specter',
    stats: { hp: 8, speed: 38, scale: 1.2 },
    ambient: { color: 0xfff4c2, count: 44, rise: 0, drift: 3, size: 0.9 },
  },

  // Paraíso radiante: todos los reinos florecen (jefe final).
  paraiso: {
    ground: { base: '#4fae5e', accent: '#6cc77a', fleck: '#3f9a4e', accentChance: 0.28, path: '#e9d68a' },
    border: 'd_pine',
    water: { tex: 't_water', style: 'estanque' },
    decor: [
      { tex: 'd_flowerbush', count: 18, collide: false },
      { tex: 'd_lantern', count: 10, collide: false },
      { tex: 'd_crystal', count: 6, collide: true },
    ],
    monster: 'mon_mirror',
    stats: { hp: 12, speed: 44, scale: 1.3 },
    ambient: { color: 0xffe9a0, count: 50, rise: -6, drift: 10, size: 1 },
  },
};

// Mapa nivel → bioma (refleja el GDD: cada reino con su atmósfera).
const ASSIGN = {
  0: 'jardin', 1: 'jardin', 2: 'bosque', 3: 'ruinas', 4: 'pradera',
  5: 'ruinas', 6: 'seto', 7: 'pradera', 8: 'cripta', 9: 'pantano',
  10: 'niebla', 11: 'bosque', 12: 'ruinas', 13: 'ruinas', 14: 'nieve',
  15: 'cripta', 16: 'jardin', 17: 'ruinas', 18: 'ruinas', 19: 'niebla',
  20: 'seto', 21: 'jardin', 22: 'cripta', 23: 'jardin', 24: 'cristal',
  25: 'cristal', 26: 'ruinas', 27: 'costa', 28: 'bosque', 29: 'ruinas',
  30: 'jardin', 31: 'nocturno', 32: 'paraiso',
};

export function getBiome(nivel) {
  const key = ASSIGN[nivel] || 'jardin';
  return { key, ...BIOMES[key] };
}
