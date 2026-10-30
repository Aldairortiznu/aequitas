// Estado de la historia: hitos (flags), expediente (pruebas/testimonios),
// cartas del Códice, confianza del puerto y el objetivo actual.

import { ITEMS, REQUIRED, TRUST } from '../data/ch1/items.js';
import { getCard } from '../data/codex.js';
import { writeSave } from './save.js';
import { orderValue, TEACHINGS } from './order.js';

export function hasFlag(save, f) { return !!(save.flags && save.flags[f]); }
export function hasItem(save, i) { return !!(save.items && save.items[i]); }
export function hasCard(save, c) { return !!(save.codex && save.codex[c]); }

export function trustCount(save) {
  return TRUST.filter((t) => hasFlag(save, t.flag)).length;
}

export function missingForHearing(save) {
  const out = [];
  TRUST.forEach((t) => { if (!hasFlag(save, t.flag)) out.push(t.label + ' (' + t.where + ')'); });
  REQUIRED.forEach((id) => { if (!hasItem(save, id)) out.push(ITEMS[id].name); });
  return out;
}

export function hearingReady(save) {
  return missingForHearing(save).length === 0;
}

// Evalúa una condición de los datos ('f:x', '!i:y', 'trust>=2', 'order>=60', 'ready'...).
export function check(save, cond) {
  if (!cond) return true;
  if (cond === 'ready') return hearingReady(save);
  if (cond === '!ready') return !hearingReady(save);
  const m = cond.match(/^trust(>=|<)(\d)$/);
  if (m) return m[1] === '>=' ? trustCount(save) >= +m[2] : trustCount(save) < +m[2];
  const o = cond.match(/^order(>=|<)(\d+)$/);
  if (o) return o[1] === '>=' ? orderValue(save) >= +o[2] : orderValue(save) < +o[2];
  const neg = cond.startsWith('!');
  const c = neg ? cond.slice(1) : cond;
  const [k, id] = [c.slice(0, 1), c.slice(2)];
  const v = k === 'f' ? hasFlag(save, id) : k === 'i' ? hasItem(save, id) : k === 'c' ? hasCard(save, id) : false;
  return neg ? !v : v;
}

export function checkAll(save, conds) {
  return (conds || []).every((c) => check(save, c));
}

// Aplica recompensas. Devuelve lo nuevo para mostrarlo (toasts / cartas).
export function give(save, list) {
  const got = { items: [], cards: [], flags: [] };
  if (!save.flags) save.flags = {};
  if (!save.items) save.items = {};
  if (!save.codex) save.codex = {};
  if (!save.newCards) save.newCards = [];
  (list || []).forEach((g) => {
    const k = g.slice(0, 1);
    const id = g.slice(2);
    if (k === 'f' && !save.flags[id]) { save.flags[id] = true; got.flags.push(id); }
    if (k === 'i' && !save.items[id] && ITEMS[id]) { save.items[id] = Date.now(); got.items.push(id); }
    if (k === 'c' && !save.codex[id] && getCard(id)) { save.codex[id] = true; save.newCards.push(id); got.cards.push(id); }
  });
  writeSave(save);
  return got;
}

// Objetivo actual: texto corto + a quién/dónde apunta la flecha.
export function objective(save) {
  const f = (x) => hasFlag(save, x);
  const i = (x) => hasItem(save, x);
  // Después del acta: recorrer el puerto, enseñar lo que falte y seguir el viaje.
  if (f('caso_cerrado')) {
    const done = TEACHINGS.filter((t) => f(t.flag)).length;
    const next = TEACHINGS.find((t) => !f(t.flag) && hasCard(save, t.card));
    if (next) return { text: `Enseña lo que aprendiste (${done}/4): ${next.label}`, target: next.npc };
    return { text: 'Puerto Garza está en equilibrio: ve al final del muelle', target: 'viaje' };
  }
  if (!f('met_fidelina')) return { text: 'Busca a Doña Fidelina en la plaza de la Junta', target: 'fidelina' };
  const trust = trustCount(save);
  if (!f('reten_open') && trust < 2) {
    const next = !f('gallina_done') ? 'lucho' : !f('peso_done') ? 'chepe' : 'panel';
    return { text: `Gánate la confianza del puerto (${trust}/2): resuelve sus líos`, target: next };
  }
  if (!f('reten_open')) return { text: 'Vuelve al retén del puente: el Mono te dejará pasar', target: 'mono' };
  if (!f('met_partes')) return { text: 'Cruza el puente y ve al astillero', target: 'carmen' };
  if (!i('carmen') || !i('julian') || !i('aurelio')) {
    const who = !i('carmen') ? 'carmen' : !i('julian') ? 'julian' : 'aurelio';
    return { text: 'Escucha a las tres partes en el astillero', target: who };
  }
  if (hearingReady(save)) return { text: '¡Caso listo! Pide la audiencia a Doña Fidelina', target: 'fidelina' };
  // Siguiente pista pendiente, en un orden que tiene sentido.
  const steps = [
    [!f('gallina_done'), 'Resuelve el lío de la gallina (Barrio Las Gallinas)', 'lucho'],
    [!f('peso_done'), 'Ayuda en el mercado con la balanza de Don Chepe', 'chepe'],
    [!f('alumbrado_done'), 'Devuelve la luz al muelle (panel solar)', 'panel'],
    [!i('nando'), 'Pregúntale a Nando, el pescador del muelle, por la lancha', 'nando'],
    [!i('nombre_original'), 'Examina el casco de la lancha', 'casco'],
    [!i('media_matricula') && !i('matricula'), 'Revisa la cabina de la lancha', 'cabina'],
    [!i('matricula'), 'Lleva la media matrícula a Don Anselmo', 'aurelio'],
    [!i('recibos'), 'Pídele a Don Chepe las cuentas de las reparaciones', 'chepe'],
    [!i('llave_bodega') && !i('placa_motor'), 'Pídele a Don Chepe la llave de la bodega', 'chepe'],
    [!i('placa_motor'), 'Busca en la bodega oscura', 'bodega'],
    [!i('libro_hallazgos'), 'Pregúntale a Doña Fidelina por el libro de hallazgos', 'fidelina'],
  ];
  const s = steps.find((x) => x[0]);
  if (s) return { text: s[1], target: s[2] };
  return { text: 'Pide la audiencia a Doña Fidelina', target: 'fidelina' };
}

export function evidenceCount(save) {
  return { got: REQUIRED.filter((id) => hasItem(save, id)).length, total: REQUIRED.length };
}
