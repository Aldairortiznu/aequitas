// Ajustes de "AEQUITAS", persistidos en localStorage y cargados al registry
// de Phaser al arrancar (BootScene). Cualquier escena lee con
// this.registry.get('difficulty' | 'textSpeed' | 'volume' | 'muted').
//
//  - difficulty: 'suave' | 'normal' | 'intenso'  (Modo Historia = 'suave')
//  - textSpeed:  ms por carácter en los diálogos (lento 38 / normal 22 / rápido 12)
//  - volume:     0..1 (ganancia maestra del audio)
//  - muted:      bool

const KEY = 'aequitas_settings_v1';

export const TEXT_SPEEDS = { lento: 38, normal: 22, rapido: 12 };
export const DIFFICULTIES = ['suave', 'normal', 'intenso'];

const DEFAULTS = { difficulty: 'normal', textSpeed: 22, volume: 0.6, muted: false, vibration: true };

// Dificultad = cuánta ayuda hay en las audiencias: corazones de confianza de la
// asamblea y pistas de Lumen. 'suave' es el modo guiado.
export const DIFFICULTY = {
  suave: { hearts: 7, hints: 9, label: 'Guiado · más confianza y pistas' },
  normal: { hearts: 5, hints: 3, label: 'Normal · la experiencia pensada' },
  intenso: { hearts: 3, hints: 1, label: 'Riguroso · sin red' },
};

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch (e) {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function write(s) {
  cache = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* nada */ }
}

export function loadSettings() {
  return { ...read() };
}

export function getSetting(k) {
  return read()[k];
}

export function setSetting(k, v) {
  const s = { ...read(), [k]: v };
  write(s);
  return s;
}

// Vuelca los ajustes al registry para que todas las escenas los lean.
export function applyToRegistry(game) {
  const s = read();
  game.registry.set('difficulty', s.difficulty);
  game.registry.set('textSpeed', s.textSpeed);
  game.registry.set('volume', s.volume);
  game.registry.set('muted', s.muted);
}

// Devuelve los multiplicadores de combate de la dificultad actual.
export function difficultyMods(game) {
  const d = (game && game.registry.get('difficulty')) || read().difficulty;
  return DIFFICULTY[d] || DIFFICULTY.normal;
}
