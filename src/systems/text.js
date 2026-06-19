// Utilidades de texto para comparar respuestas de acertijos.

// Normaliza: minúsculas, sin tildes/diacríticos, sin signos, espacios colapsados.
export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita diacríticos combinantes (tildes)
    .replace(/[^a-z0-9\s]/g, ' ')    // quita signos (la ñ ya pasó a n)
    .replace(/\s+/g, ' ')
    .trim();
}

// ¿La respuesta del jugador coincide con alguna de las aceptadas?
export function matchesAny(answer, accepted) {
  const a = normalize(answer);
  return accepted.some((opt) => normalize(opt) === a);
}
