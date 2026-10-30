// EQUILIBRIO DEL PUERTO: cuánto orden ha recuperado la comunidad.
//
// La lógica del juego: todo empieza en el caos y la tiranía (manda el Puño,
// cobran peaje, la Junta casi no se reúne). Cada vez que quien juega
// aprende una norma, la aplica para resolver un conflicto o se la enseña a la
// gente —y la gente la adopta—, el puerto recupera un poco de orden. Se nota en
// el mapa: vuelve el color, desaparecen los grafitis y la basura del Puño,
// aparecen la balanza pública, la cometa y los banderines de la Junta.

export const ORDER_BASE = 5;

export const ORDER_STEPS = [
  { flag: 'met_fidelina', v: 5, why: 'La Junta vuelve a tener quien la escuche' },
  { flag: 'gallina_done', v: 10, why: 'El barrio arregló una pelea hablando' },
  { flag: 'alumbrado_done', v: 10, why: 'El muelle volvió a tener luz' },
  { flag: 'peso_done', v: 10, why: 'El mercado pesa justo otra vez' },
  { flag: 'reten_open', v: 5, why: 'El puente ya no es del Puño' },
  { flag: 'met_partes', v: 5, why: 'Las partes aceptaron sentarse a hablar' },
  { flag: 'teach_perro', v: 5, why: 'El barrio aprendió quién responde por un animal' },
  { flag: 'teach_muelle', v: 5, why: 'Los pescadores cuidan el muelle entre todos' },
  { flag: 'teach_balanza', v: 5, why: 'El mercado tiene una balanza pública' },
  { flag: 'teach_cometa', v: 5, why: 'Los pelaos llevaron lo hallado a la Junta' },
  { flag: 'audiencia_ok', v: 15, why: 'La audiencia se hizo en paz' },
  { flag: 'caso_cerrado', v: 15, why: 'Hay acta: lo pactado obliga' },
];

// Las cuatro enseñanzas del capítulo: quién aprende y qué carta hace falta.
export const TEACHINGS = [
  { flag: 'teach_perro', npc: 'pescador', card: 'art2353', label: 'el perro y la red' },
  { flag: 'teach_muelle', npc: 'nando', card: 'art674', label: 'el muelle es de todos' },
  { flag: 'teach_balanza', npc: 'nubia', card: 'art1603', label: 'la balanza pública' },
  { flag: 'teach_cometa', npc: 'pelao', card: 'ocupacion', label: 'la cometa hallada' },
];

// Etapas de la sociedad del puerto (de la ley del más fuerte a la equidad).
export const LEVELS = [
  { min: 0, name: 'Caos', desc: 'Manda el más fuerte' },
  { min: 20, name: 'Tiranía del Puño', desc: 'La gente calla por miedo' },
  { min: 40, name: 'Desconfianza', desc: 'Se empieza a hablar en voz baja' },
  { min: 60, name: 'Convivencia', desc: 'Los vecinos arreglan sus líos' },
  { min: 80, name: 'Orden', desc: 'La Junta vuelve a funcionar' },
  { min: 100, name: 'Equilibrio', desc: 'La palabra pesa más que el puño' },
];

export function orderValue(save) {
  const f = (save && save.flags) || {};
  const v = ORDER_STEPS.reduce((a, s) => a + (f[s.flag] ? s.v : 0), ORDER_BASE);
  return Math.max(0, Math.min(100, v));
}

export function orderLevel(v) {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (v >= l.min) lv = l;
  return lv;
}

// Qué aporta un hito (para el aviso "el puerto se equilibra").
export function orderStep(flag) {
  return ORDER_STEPS.find((s) => s.flag === flag) || null;
}
