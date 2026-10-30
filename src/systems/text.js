// Utilidades de texto.

// En los textos, {nombre} es el nombre del personaje elegido (Aurelio, Valeria,
// Kaelen o Sora). El juego no usa trato de género: a quien juega se le llama por
// su nombre, y las frases se escriben en forma neutra.
let heroName = '';

export function setHeroName(name) {
  heroName = name || '';
}

export function fmt(text) {
  if (!text) return '';
  return String(text).replace(/\{nombre\}/g, heroName || 'Aurelio');
}

// Normaliza: minúsculas, sin tildes/diacríticos, sin signos, espacios colapsados.
export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
