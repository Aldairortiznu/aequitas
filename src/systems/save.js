// Guardado de AEQUITAS sobre localStorage (clave propia del juego).

import { SAVE_KEY } from '../config.js';

const DEFAULT_SAVE = {
  version: 1,
  hero: null, // tomas | valeria | rio | alex (ver data/heroes.js)
  chapter: 1,
  stage: 'prologo', // prologo → remar → pueblo → audiencia → acuerdo → cierre
  px: null,
  py: null,
  flags: {}, // hitos de la historia
  items: {}, // pruebas y testimonios del expediente
  codex: {}, // cartas del Códice ganadas
  seen: {}, // temas de conversación ya escuchados
  newCards: [], // cartas por revelar (animación "¡Nueva carta!")
  scores: {}, // mejor resultado de cada minijuego
  medals: {},
  stats: { wrong: 0, hints: 0, calm: 0 },
  createdAt: null,
  updatedAt: null,
};

// Una sola partida en memoria compartida por todas las escenas (si cada escena
// tuviera su copia, la última en guardar pisaría los avances de las otras).
let current = null;

export function getSave() {
  if (!current) current = loadSave();
  return current;
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    current = { ...clone(DEFAULT_SAVE), ...s };
    return current;
  } catch (e) {
    console.warn('No se pudo leer el guardado:', e);
    return null;
  }
}

export function newSave(hero = null) {
  const now = Date.now();
  const data = { ...clone(DEFAULT_SAVE), hero, createdAt: now, updatedAt: now };
  writeSave(data);
  current = data;
  return data;
}

export function writeSave(data) {
  current = data;
  data.updatedAt = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* sin espacio: seguir jugando */ }
  return data;
}

export function deleteSave() {
  current = null;
  localStorage.removeItem(SAVE_KEY);
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
