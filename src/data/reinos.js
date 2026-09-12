// Capítulos y Distritos del Yermo en AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).

export const REINOS = [
  {
    nivel: 0,
    nombre: 'La Legendaria Biblioteca Experimental',
    aprendizaje: 'El Principio de Legalidad y Dignidad Humana',
    guardian: 'El Eco del Caos Olvidado',
    color: '#1b0526',
    riddleId: 'prologo',
    ensenanza: 'No despertamos al mundo con la espada: lo refundamos con la memoria de la ley.'
  },
  {
    nivel: 1,
    nombre: 'Torre Ceniza & El Edicto de Expulsión',
    aprendizaje: 'El Debido Proceso y la Propiedad Comunal (Art. 29 C.P.)',
    guardian: 'El Prefecto Muro-Ciego',
    color: '#2a1238',
    riddleId: 'torre_ceniza',
    ensenanza: 'Ninguna autoridad puede arrebatar el hogar sin debido proceso ni asamblea legítima.'
  },
  {
    nivel: 2,
    nombre: 'El Embarcadero Fluvial & El Pagaré en Blanco',
    aprendizaje: 'La Buena Fe Comercial y la Tasa de Usura (C.Co)',
    guardian: 'Silas el Especulador',
    color: '#13281d',
    riddleId: 'embarcadero',
    ensenanza: 'El trueque y el comercio florecen cuando se desmantela la usura y el engaño.'
  },
  {
    nivel: 3,
    nombre: 'Las Terrazas Agrarias & El Agua Secuestrada',
    aprendizaje: 'La Servidumbre Legal de Acueducto (Art. 919 C.C.)',
    guardian: 'Don Robustiano el Acaparador',
    color: '#1c3422',
    riddleId: 'terrazas',
    ensenanza: 'La propiedad tiene una función ecológica: el cauce del agua pertenece a la vida comunitaria.'
  },
  {
    nivel: 4,
    nombre: 'El Santuario de la Margarita Dorada',
    aprendizaje: 'El Nuevo Orden Social y la Paz Estable',
    guardian: 'La Sombra de la Discordia',
    color: '#320b45',
    riddleId: 'concilio',
    ensenanza: 'Donde la ley restituye la equidad, la tierra entera vuelve a florecer.'
  }
];

export function getReino(nivel) {
  return REINOS.find((r) => r.nivel === nivel) || REINOS[0];
}
