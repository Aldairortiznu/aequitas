// Sistema de guardado simple sobre localStorage.
// Se ampliará en la Fase 4 (puntos de guardado, acertijos resueltos, etc.).

import { SAVE_KEY } from '../config.js';

const DEFAULT_SAVE = {
  version: 1,
  heroine: 'Abigail',
  level: 0, // 0 = prólogo
  maxLevelReached: 0,
  hp: 100,
  maxHp: 100,
  wisdomDiary: [], // enseñanzas conseguidas
  solvedRiddles: [],
  createdAt: null,
  updatedAt: null,
};

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('No se pudo leer el guardado:', e);
    return null;
  }
}

export function newSave(heroine = 'Abigail') {
  const now = Date.now();
  const data = { ...DEFAULT_SAVE, heroine, createdAt: now, updatedAt: now };
  writeSave(data);
  return data;
}

export function writeSave(data) {
  data.updatedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  return data;
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
