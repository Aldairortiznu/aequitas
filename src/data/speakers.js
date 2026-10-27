// Voces de AEQUITAS. Cada línea de diálogo es { s: clave, t: texto }.
// portrait: textura que se muestra en el diálogo y en las cinemáticas.
// Los textos admiten {Explorador}, {o}, {el}/{El} y {nombre} (ver systems/text.js).
//
// ESTILO: español de Colombia, trato de "tú" entre personajes cercanos y
// "usted" de la gente mayor del puerto; toques caribeños ("ajá", "ombe",
// "mija", "compadre") sin caricaturizar. Frases cortas: el juego es dinámico.

export const SPEAKERS = {
  explorador: { name: '{nombre}', color: '#e3b04b', portrait: 'player' },
  pensamiento: { name: '{nombre} · piensa', color: '#c3b2e8', portrait: 'player', italic: true },
  lumen: { name: 'Lumen', color: '#f6e7a8', portrait: 'lumen' },
  tinto: { name: 'Tinto', color: '#c9a07a', portrait: 'tinto' },
  ulpiana: { name: 'Maestra Ulpiana', color: '#d6c2f0', portrait: 'ulpiana' },
  fidelina: { name: 'Doña Fidelina', color: '#f2c230', portrait: 'npc_fidelina' },
  carmen: { name: 'Carmen Ortega', color: '#8fc6e8', portrait: 'npc_carmen' },
  julian: { name: 'Julián Ortega', color: '#9fd3cf', portrait: 'npc_julian' },
  aurelio: { name: 'Don Aurelio', color: '#efe3c2', portrait: 'npc_aurelio' },
  ramiro: { name: 'Ramiro "El Puño"', color: '#e8817a', portrait: 'npc_ramiro' },
  mono: { name: 'El Mono', color: '#f2b84b', portrait: 'npc_mono' },
  rosa: { name: 'Doña Rosa', color: '#e8a9c0', portrait: 'npc_rosa' },
  lucho: { name: 'Don Lucho', color: '#b8d98a', portrait: 'npc_lucho' },
  chepe: { name: 'Don Chepe', color: '#d9b06a', portrait: 'npc_chepe' },
  nubia: { name: 'Doña Nubia', color: '#6fd3c8', portrait: 'npc_nubia' },
  nando: { name: 'Nando', color: '#9bbfe8', portrait: 'npc_nando' },
  yuli: { name: 'Yuli', color: '#f6b07a', portrait: 'npc_yuli' },
  tule: { name: 'Mamá Tule', color: '#ecebe6', portrait: 'npc_tule' },
  vecino: { name: 'Un vecino', color: '#cfe3d4', portrait: 'npc_vecino' },
  vecina: { name: 'Una vecina', color: '#f3d0c0', portrait: 'npc_vecina' },
  pescador: { name: 'Un pescador', color: '#cfe3d4', portrait: 'npc_pescador' },
  pelao: { name: 'Un pelao', color: '#f6d07a', portrait: 'npc_pelao' },
  pelaa: { name: 'Una pelaíta', color: '#b8e08a', portrait: 'npc_pelaa' },
  puno: { name: 'Uno del Puño', color: '#e8817a', portrait: 'npc_puno' },
  asamblea: { name: 'La asamblea', color: '#c9d2d8', portrait: null, italic: true },
  nota: { name: 'Se lee', color: '#efe3c2', portrait: null, italic: true },
  narrador: { name: '', color: '#efe3c2', portrait: null, italic: true },
};

// Aspecto de cada persona del puerto (lo hornea BootScene con makePerson).
export const PEOPLE = {
  npc_fidelina: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'short', hat: 'turban', hatColor: '#f2c230', top: '#f2c230', sleeves: 'long', skirt: true, bottom: '#2a5aa8', glasses: true, item: 'ledger' },
  npc_carmen: { skin: 'moreno', hair: '#1d1a1c', hairStyle: 'ponytail', hat: 'cap', hatColor: '#2a5aa8', top: '#5aa8d8', bottom: '#3a3530', patches: true },
  npc_julian: { skin: 'moreno', hair: '#1d1a1c', hairStyle: 'short', hat: 'cap', hatColor: '#c8302a', top: '#f3ecd8', bottom: '#2f5f8a', patches: true, neckerchief: '#3fa3a0' },
  npc_aurelio: { skin: 'trigueno', hair: '#c9c4bc', hairStyle: 'short', hat: 'vueltiao', top: '#f3ecd8', sleeves: 'long', bottom: '#8a7a62', mustache: true, beardColor: '#c9c4bc', backpack: '#6e4527' },
  npc_ramiro: { skin: 'medio', hair: '#1d1a1c', hairStyle: 'short', hat: 'bandana', hatColor: '#c8302a', top: '#c8302a', bottom: '#2a2f33', beard: true, tirepads: true, patches: true, patchColor: '#5c6468' },
  npc_mono: { skin: 'claro', hair: '#c98a3a', hairStyle: 'short', top: '#9cc36b', bottom: '#3a3530', goggles: true, tirepads: true },
  npc_rosa: { skin: 'medio', hair: '#2a1d18', hairStyle: 'curly', top: '#e8846b', skirt: true, bottom: '#f2b84b', apron: '#f3ecd8' },
  npc_lucho: { skin: 'trigueno', hair: '#ecebe6', hairStyle: 'bald', hat: 'straw', top: '#9cc36b', bottom: '#6b5a42', mustache: true, beardColor: '#ecebe6', item: 'hen', patches: true },
  npc_lucho_sin: { skin: 'trigueno', hair: '#ecebe6', hairStyle: 'bald', hat: 'straw', top: '#9cc36b', bottom: '#6b5a42', mustache: true, beardColor: '#ecebe6', item: 'hoe', patches: true },
  npc_chepe: { skin: 'claro', hair: '#4a2f22', hairStyle: 'short', top: '#d9d2c3', bottom: '#3a3530', apron: '#6e4527', glasses: true, mustache: true },
  npc_nubia: { skin: 'moreno', hair: '#1d1a1c', hairStyle: 'bun', top: '#3fc3b8', skirt: true, bottom: '#e8846b', apron: '#f3ecd8' },
  npc_nando: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'short', hat: 'straw', hatColor: '#2a5aa8', top: '#f2b84b', bottom: '#2f5f8a', item: 'net', patches: true, neckerchief: '#c8302a' },
  npc_yuli: { skin: 'moreno', hair: '#1d1a1c', hairStyle: 'pigtails', top: '#f2b84b', skirt: true, bottom: '#e8846b', child: true, goggles: true },
  npc_tule: { skin: 'oscuro', hair: '#ecebe6', hairStyle: 'bun', top: '#9b6fc0', sleeves: 'long', skirt: true, bottom: '#5a3f6e', item: 'cane' },
  npc_vecino: { skin: 'medio', hair: '#1d1a1c', hairStyle: 'short', hat: 'straw', top: '#3fa3a0', bottom: '#3a3530', patches: true },
  npc_vecina: { skin: 'trigueno', hair: '#2a1d18', hairStyle: 'long', top: '#e8a9c0', skirt: true, bottom: '#3fa3a0', neckerchief: '#f2b84b', patches: true },
  npc_pescador: { skin: 'moreno', hair: '#1d1a1c', hairStyle: 'short', hat: 'straw', top: '#5aa8d8', bottom: '#2a2f33', item: 'net', patches: true },
  npc_pelao: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'curly', top: '#c8302a', bottom: '#2f5f8a', child: true, patches: true },
  npc_pelaa: { skin: 'trigueno', hair: '#2a1d18', hairStyle: 'braids', top: '#9cc36b', skirt: true, bottom: '#f2b84b', child: true },
  // Los del Puño: la gente de Ramiro que cobra peaje (se van cuando vuelve el orden).
  npc_puno: { skin: 'medio', hair: '#1d1a1c', hairStyle: 'short', hat: 'bandana', hatColor: '#2a2420', top: '#3a3532', bottom: '#2a2f33', tirepads: true, patches: true, patchColor: '#c8302a' },
  npc_puno2: { skin: 'oscuro', hair: '#1d1a1c', hairStyle: 'bald', top: '#5c3a2a', bottom: '#2a2f33', tirepads: true, goggles: true },
};
