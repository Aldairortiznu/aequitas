// CAPÍTULO 1 · PUERTO GARZA — el mapa.
//
// Rejilla de 64×48 baldosas (16 px). Cada carácter es el suelo o un obstáculo:
//   ~ río (no se pisa)   s arena   . , césped   : tierra   # empedrado
//   = tablones (muelle/puente)   R rieles del astillero   h huerta (no se pisa)
//   B casa (no se pisa; ver BUILDINGS)   P/p palma   T árbol   b arbusto
//   f cerca   k caja   o barril   r escombros   x carro oxidado
// Las coordenadas de todo lo demás van en baldosas: (x, y) = columna, fila.
//
// Zonas: muelle (sur), mercado (centro), Barrio Las Gallinas (oeste), plaza de
// la Junta (norte), y al otro lado del caño —solo por el puente del retén— el
// astillero, la bodega y las ruinas del banco.

export const MAP = [
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bT,.T..T..T..T..T..T..T..T..T..T,.T..T..T,,T..T..T..T..T..T..T.b',
    'bT.....,...................BBBBBBBBBB,....,~~....,.,..........Tb',
    'b.,,BBBBBB..,.BBBBBB....P..BBBBBBBBBB..P...~~..,.BBBBBBBBB.....b',
    'b...BBBBBB....BBBBBBP......BBBBBBBBBB......~~..r.BBBBBBBBB.....b',
    'bT..BBBBBB,...BBBBBB.......BBBBBBBBBB.,..b.~~....BBBBBBBBBr...Tb',
    'b.,.BBBBBB....BBBBBB.####################..~~....BBBBBBBBB..r..b',
    'b,...,::......BBBBBB.####################..~~....BBBBBBBBB.....b',
    'bT..,.::,...,....::..####################..~~...r...::.,.....,Tb',
    'b.....::....P....::..####################P.~~.......::,.r..r...b',
    'b..P..::..,...,..::.b####################..~~..r..,.::.........b',
    'bT....::.........::..####################..~~.,,....::..,.....Tb',
    'b...,.::.........::..####P############P##..~~.P.....::....P....b',
    'b.:::::::::::::::::::::::::::::::::::::::::==::::::::::::xx:::.b',
    'bT:::::::::::::::::::::::::::::::::::::::::==:::::::::::::::::Tb',
    'b.........::...........BBBBBBB::::BBBBBB...~~,.,...,.....,.....b',
    'b..BBBBBB.::.BBBBBB,...BBBBBBB::::BBBBBB...~~.BBBBBB.BBBBBBBB..b',
    'bT.BBBBBB.::.BBBBBB...#BBBBBBB####BBBBBB#..~~.BBBBBB.BBBBBBBB.Tb',
    'b..BBBBBB.::.BBBBBB,..#BBBBBBB####BBBBBB#..~~.BBBBBB.BBBBBBBB,,b',
    'b..BBBBBB.::.BBBBBB...###################.,~~.BBBBBB.BBBBBBBB..b',
    'bT..:::::.::..:::....:###################..~~........BBBBBBBB.Tb',
    'b.....,...::fffffffff:###################.,~~.:::::::::::::::..b',
    'b........b::fhhhhhhhf.###################..~~.::kk:::::::::k:..b',
    'bTP.......::fhhhhhhhf.###################..~~.:::::::::::::::.Tb',
    'b.........:::hhhhhhhf.###################..~~.:::::RRRRRR:::P.,b',
    'b.,.......:::hhhhhhhf.###################..~~.:::::RRRRRR::::..b',
    'bT....,...::fhhhhhhhf.###################..~~,:::::RRRRRR::::.Tb',
    'b.........::fhhhhhhhf.###################..~~b:::::RRRRRR::::b.b',
    'b........P::fffffffff.###################..~~.:::::RRRRRR::::..b',
    'bT...,....::..........###################..~~.:::::RRRRRR::::.Tb',
    'b....,....::.,........kko......::,......ko.~~.:::::RRRRRR::k:.,b',
    'b.........::........,P....b....::.,b..,P..P~~.:o:::RRRRRR:::o..b',
    'b,.ssssssssssssssssss..........::........,.~~.:::::RRRRRR::::.,b',
    'b.ssspssssssssssssspssss==============k=sss~~sspsssRRRRRRsspss.b',
    'b.sssssssssssspsssssssss================s~~~~~~ssssRRRRRRsssss.b',
    'b.ssssssssssssssssssssss================s~~~~~~ssssRRRRRRsssss.b',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~========~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~========~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~========~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~========~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~====~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
];

// Casas: rectángulo exacto de baldosas 'B' + estilo de dibujo.
export const BUILDINGS = [
  { id: 'junta', x: 27, y: 2, w: 10, h: 4, roof: 'teja', wall: '#efe3c2', trim: '#2a5aa8', shutter: '#2a5aa8', door: 'center', windows: 4, flag: true, patched: true, waterline: true, sign: 'JUNTA DE ACCIÓN COMUNAL' },
  { id: 'tule', x: 14, y: 3, w: 6, h: 5, roof: 'palma', wall: '#9cc36b', trim: '#e9d8a6', shutter: '#e8846b', door: 'center', windows: 2, vines: true, patched: true },
  { id: 'casa_no', x: 4, y: 3, w: 6, h: 4, roof: 'zincRojo', wall: '#f2b84b', trim: '#f3ecd8', shutter: '#3fa3a0', door: 'left', windows: 2, tank: true, tarp: '#2a5aa8', tarpX: 8, rust: true },
  { id: 'rosa', x: 3, y: 16, w: 6, h: 4, roof: 'zinc', wall: '#e8846b', trim: '#f3ecd8', shutter: '#f2b84b', door: 'center', windows: 2, patched: true, rust: true, waterline: true },
  { id: 'lucho', x: 13, y: 16, w: 6, h: 4, roof: 'palma', wall: '#d6c29a', trim: '#b5a68a', shutter: '#3f8a35', door: 'center', windows: 2, vines: true, patched: true },
  { id: 'chepe', x: 23, y: 15, w: 7, h: 4, roof: 'zinc', wall: '#3fa3a0', trim: '#f3ecd8', shutter: '#f2b84b', door: 'center', windows: 2, panel: true, tarp: '#3f8a35', tarpX: 70, rust: true, sign: 'VARIEDADES CHEPE · TRUEQUE' },
  { id: 'ferreteria', x: 34, y: 15, w: 6, h: 4, roof: 'zincRojo', wall: '#d9d2c3', trim: '#b5a68a', door: 'center', windows: 2, boarded: true, cracked: true, ruined: true, rust: true, waterline: true, sign: 'FERRETERÍA' },
  { id: 'taller', x: 46, y: 16, w: 6, h: 4, roof: 'zinc', wall: '#8e989c', trim: '#5c6468', door: 'left', windows: 1, cracked: true, rust: true, patched: true, sign: 'TALLER · SE ARREGLA TODO' },
  { id: 'bodega', x: 53, y: 16, w: 8, h: 5, roof: 'zinc', wall: '#b5a68a', trim: '#8a7a62', door: 'big', windows: 2, boarded: true, rust: true, tarp: '#2a5aa8', tarpX: 14, waterline: true, sign: 'BODEGA' },
  { id: 'banco', x: 49, y: 3, w: 9, h: 5, roof: 'plano', wall: '#c9c2b0', trim: '#9f9789', door: 'center', windows: 3, boarded: true, cracked: true, vines: true, ruined: true, waterline: true, sign: 'BANCO' },
];

// Objetos grandes colocados a mano. foot: baldosas que bloquean (relativas a x,y).
export const PROPS = [
  { tex: 'pr_ceiba', x: 25, y: 10, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_antenna', x: 10, y: 8, foot: [[0, 0]], id: 'antena' },
  { tex: 'pr_tank', x: 9, y: 18, foot: [[0, 0]] },
  { tex: 'pr_tank', x: 20, y: 17, foot: [[0, 0]] },
  { tex: 'pr_coop', x: 3, y: 24, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_laundry', x: 4, y: 28, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_scale', x: 28, y: 20, foot: [[0, 0]] },
  { tex: 'pr_stall_fish', x: 34, y: 22, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_stall_fruit', x: 27, y: 24, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_stall_rice', x: 36, y: 27, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_net', x: 14, y: 32, foot: [[0, 0]] },
  { tex: 'pr_canoe', x: 13, y: 34, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_canoe', x: 18, y: 33, foot: [[0, 0], [1, 0]] },
  { tex: 'pr_sign', x: 28, y: 33, foot: [[0, 0]], id: 'letrero_muelle' },
  { tex: 'pr_panel', x: 35, y: 34, foot: [[0, 0]], id: 'panel' },
  { tex: 'pr_car', x: 57, y: 13, foot: [] },
  { tex: 'pr_lancha', x: 52, y: 28, foot: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]], id: 'lancha', w: 4 },
  { tex: 'pr_reten', x: 44, y: 13, foot: [[0, 0], [0, 1]], id: 'reten', below: 1 },
  // Lo que quedó del mundo de antes.
  { tex: 'pr_ruin', x: 45, y: 11, foot: [[0, 0], [1, 0], [2, 0]], w: 3 },
  { tex: 'pr_billboard', x: 8, y: 12, foot: [[0, 0], [3, 0]], w: 4, id: 'valla', label: 'PUERTO GARZA\nCONSTRUIMOS\nFUTURO', labelY: -28, labelColor: '#6a5a4a' },
  { tex: 'pr_filter', x: 40, y: 20, foot: [[0, 0]], id: 'filtro', label: 'AGUA HERVIDA', labelY: -29, labelColor: '#efe3c2', labelBg: '#2f5f8a' },
  { tex: 'pr_tires', x: 52, y: 20, foot: [[0, 0]] },
  { tex: 'pr_dish', x: 61, y: 10, foot: [[0, 0]] },
];

// Ruinas en el agua (decorado: el río ya es infranqueable).
export const WRECKS = [
  { tex: 'pr_bus', x: 15, y: 39 },
  { tex: 'pr_belfry', x: 52, y: 43, heron: true },
  { tex: 'pr_sunken_roof', x: 5, y: 42 },
  { tex: 'pr_pylon_fallen', x: 57, y: 38 },
];

// CÓMO SE VE EL PUERTO SEGÚN EL ORDEN RECUPERADO (ver systems/order.js).
// until: se ve hasta que se cumple la condición; when: aparece cuando se cumple.
// text + px: letrero pintado en una pared (coordenadas en píxeles).
export const ORDER_DECOR = [
  // --- Caos y tiranía: el Puño manda, nadie limpia.
  { text: 'AQUÍ MANDA EL PUÑO', px: [468, 89], color: '#c8302a', angle: -3, until: 'order>=60' },
  { text: '¡CALLADITOS!', px: [566, 297], color: '#c8302a', angle: 5, until: 'order>=60' },
  { tex: 'pr_toll', x: 30, y: 32, label: 'PEAJE DEL PUÑO\n2 FICHAS', labelY: -28, labelColor: '#efe3c2', labelBg: '#7a1f1a', until: 'f:teach_muelle' },
  { tex: 'pr_trash', x: 27, y: 34, until: 'f:teach_muelle' },
  { tex: 'pr_trash', x: 37, y: 35, until: 'f:teach_muelle' },
  { tex: 'pr_trash', x: 23, y: 9, until: 'order>=60' },
  { tex: 'pr_trash', x: 39, y: 11, until: 'order>=60' },
  { tex: 'pr_trash', x: 24, y: 29, until: 'order>=60' },
  { tex: 'an_dog0', x: 13, y: 31, until: 'f:teach_perro', dog: true },
  // --- El orden que vuelve: lo que la gente construye cuando aprende.
  { text: 'AQUÍ SE HABLA', px: [468, 89], color: '#efe3c2', angle: -2, when: 'order>=60' },
  { tex: 'an_dog_sit', x: 8, y: 28, when: 'f:teach_perro' },
  { tex: 'pr_pubscale', x: 31, y: 21, when: 'f:teach_balanza', label: 'BALANZA DE LA JUNTA', labelY: -36, labelColor: '#efe3c2', labelBg: '#2a5aa8' },
  { tex: 'pr_kite', x: 33, y: 7, when: 'f:teach_cometa', fly: true },
  { tex: 'pr_stall_fish', x: 38, y: 30, when: 'order>=60' },
  { tex: 'pr_bunting', x: 31, y: 6, when: 'order>=80' },
  { tex: 'pr_bunting', x: 31, y: 19, when: 'order>=80' },
  // --- Fiesta en el puerto cuando hay acta.
  { tex: 'npc_vecino', x: 22, y: 9, when: 'f:caso_cerrado', cheer: true },
  { tex: 'npc_vecina', x: 36, y: 10, when: 'f:caso_cerrado', cheer: true, flip: true },
  { tex: 'npc_pescador', x: 27, y: 27, when: 'f:caso_cerrado', cheer: true },
  { tex: 'npc_puno', x: 33, y: 22, when: 'f:caso_cerrado', cheer: true, flip: true }, // el del peaje, ahora de fiesta
];

// Barcas que se mecen en el agua (decorado animado).
export const BOATS = [
  { tex: 'pr_boat', x: 26, y: 38 },
  { tex: 'pr_boat', x: 36, y: 43, flip: true },
  { tex: 'pr_canoe', x: 28, y: 45 },
  { tex: 'pr_canoe', x: 47, y: 41, flip: true },
];

// Faroles del muelle (se encienden al resolver el circuito).
export const LAMPS = [
  { x: 30, y: 37 }, { x: 33, y: 37 }, { x: 30, y: 43 }, { x: 33, y: 43 }, { x: 25, y: 33 }, { x: 38, y: 34 },
];

// Páginas perdidas del Códice (coleccionables).
export const PAGES = [
  { id: 'art1', x: 12, y: 11 },
  { id: 'art13', x: 59, y: 8 },
  { id: 'art11', x: 6, y: 34 },
  { id: 'art95', x: 37, y: 40 },
  { id: 'transaccion', x: 23, y: 23 },
];

// Garzas en la orilla y zona donde andan las gallinas del barrio.
export const HERONS = [{ x: 58, y: 34 }, { x: 16, y: 35 }, { x: 48, y: 34 }];
export const HEN_ZONE = { x0: 2, y0: 20, x1: 9, y1: 30 };

// Dónde aparece quien juega al llegar en canoa.
export const START = { x: 31, y: 42 };

// Zonas que disparan una escena al entrar (una sola vez).
export const ZONES = [
  { id: 'astillero', x0: 45, y0: 15, x1: 61, y1: 33, requires: 'reten_open', flag: 'met_partes' },
];
