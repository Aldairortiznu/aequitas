// Utilidades de texto.

// Plantillas de trato para el protagonista: al empezar se elige cómo le nombra
// la gente (Explorador, Exploradora o Exploradore) y los textos se ajustan solos.
//   {Explorador} → Explorador / Exploradora / Exploradore   {explorador} → en minúscula
//   {o}          → o / a / e   (p. ej. "bienvenid{o}")
//   {El} / {el}  → El / La / Le, el / la / le
//   {nombre}     → el nombre del personaje elegido (Tomás, Valeria, Río, Alex)
const FORMS = {
  m: { Explorador: 'Explorador', explorador: 'explorador', o: 'o', El: 'El', el: 'el' },
  f: { Explorador: 'Exploradora', explorador: 'exploradora', o: 'a', El: 'La', el: 'la' },
  n: { Explorador: 'Exploradore', explorador: 'exploradore', o: 'e', El: 'Le', el: 'le' },
};

let gender = 'm';
let heroName = '';

export function setGender(g) {
  gender = FORMS[g] ? g : 'm';
}

export function getGender() {
  return gender;
}

export function setHeroName(name) {
  heroName = name || '';
}

// Elige la palabra según el trato: trato('Conciliador', 'Conciliadora', 'Conciliadore').
export function trato(m, f, n) {
  return gender === 'f' ? f : gender === 'n' ? n : m;
}

export function fmt(text) {
  if (!text) return '';
  const F = FORMS[gender];
  return String(text)
    .replace(/\{Explorador\}/g, F.Explorador)
    .replace(/\{explorador\}/g, F.explorador)
    .replace(/\{o\}/g, F.o)
    .replace(/\{El\}/g, F.El)
    .replace(/\{el\}/g, F.el)
    .replace(/\{nombre\}/g, heroName || F.Explorador);
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
