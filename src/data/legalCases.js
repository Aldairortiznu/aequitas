// Casos Jurídicos y Dilemas de Convivencia de AEQUITAS.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Basado en el Derecho Colombiano: Constitución Política, Código Civil, Código de Comercio y Ley 675 de 2001.

export const LEGAL_CASES = {
  // Prólogo: La Biblioteca Experimental
  prologo: {
    nivel: 0,
    titulo: 'El Principio de Legalidad',
    norma: 'Constitución Política de Colombia · Artículos 1, 4 y 6',
    pregunta: 'Para refundar una sociedad colapsada donde impera la ley del más fuerte, ¿cuál es la regla fundamental que debe guiar a los sobrevivientes?',
    opciones: [
      'Que el líder militar con más armas decida el destino de todos.',
      'La Constitución es norma de normas; en todo caso de incompatibilidad, se aplican las disposiciones constitucionales.',
      'Que las deudas se cobren mediante el destierro forzoso sin mediación.',
      'Suspender las garantías y derechos hasta que termine la crisis.'
    ],
    correcta: 1,
    fundamento: 'Art. 4 C.P.: La Constitución es norma de normas. En todo caso de incompatibilidad entre la Constitución y la ley u otra norma jurídica, se aplicarán las disposiciones constitucionales.',
    ensenanza: 'La certidumbre jurídica y la dignidad humana son el único cimiento sobre el cual puede reconstruirse una comunidad.',
  },

  // Capítulo 1: Torre Ceniza (Propiedad Horizontal y Debido Proceso)
  torre_ceniza: {
    nivel: 1,
    titulo: 'El Edicto de Destierro en Torre Ceniza',
    norma: 'Art. 29 C.P. (Debido Proceso) & Ley 675 de 2001 (Propiedad Horizontal)',
    pregunta: 'El Prefecto Muro-Ciego fijó un cartel desterrando a Doña Inés sin citarla a descargos ni convocar a la Asamblea. ¿Qué vicio de nulidad hace ilegal esta decisión?',
    opciones: [
      'Que el cartel no tenía suficientes sellos de cera roja.',
      'Vulneración al Debido Proceso (Art. 29 C.P.): nadie puede ser sancionado sin derecho a la defensa y contradicción previa.',
      'Que debió cobrarse una multa en sal marina antes de expulsarla.',
      'Que la expulsión debía hacerse en horas de la noche para no alarmar.'
    ],
    correcta: 1,
    fundamento: 'Art. 29 C.P. y Ley 675: Ningún órgano de administración en un régimen comunal puede imponer sanciones que priven de derechos sin escuchar previamente al afectado en descargos.',
    ensenanza: 'El debido proceso es el escudo que protege al ciudadano humilde frente a la arbitrariedad del poder.',
  },

  // Capítulo 2: El Embarcadero Fluvial (Títulos Valores y Usura)
  embarcadero: {
    nivel: 2,
    titulo: 'La Incautación de la Lancha Pesquera',
    norma: 'Código de Comercio de Colombia · Artículos 622, 871 y 884',
    pregunta: 'Silas incautó la barca de Mateo con un pagaré que este firmó en blanco, cobrándole un 40% mensual de interés. ¿Por qué es nula esa ejecución?',
    opciones: [
      'Porque las barcas solo pueden navegar de noche.',
      'Llenar un pagaré en blanco sin carta de instrucciones vulnera el Art. 622 C.Co, y el interés pactado excede el límite de usura (Art. 884 C.Co).',
      'Porque Mateo es pescador y los pescadores están exentos de pagar deudas.',
      'Porque Silas no tenía licencia de navegación fluvial otorgada por la capitanía.'
    ],
    correcta: 1,
    fundamento: 'Art. 622 y 884 C.Co: Para llenar un título en blanco se requiere carta de instrucciones conforme a lo pactado de buena fe. Los intereses que superen 1.5 veces el interés bancario corriente incurren en usura y conllevan la pérdida de intereses.',
    ensenanza: 'El comercio y el trueque solo generan prosperidad si están blindados contra la usura y la mala fe.',
  },

  // Capítulo 3: Las Terrazas Agrarias (Servidumbres de Agua)
  terrazas: {
    nivel: 3,
    titulo: 'El Agua Secuestrada en la Acequia Comunal',
    norma: 'Código Civil Colombiano · Artículos 919 y 931',
    pregunta: 'Don Robustiano represó la fuente que nace en su predio y cortó el paso del canal hacia las huertas comunitarias. ¿Qué derecho ampara a la comunidad?',
    opciones: [
      'Asaltar la hacienda de Robustiano y destruir sus bodegas de grano.',
      'La servidumbre legal de acueducto (Art. 919 C.C.), que faculta al predio que carece de agua para conducirla a través de predios intermedios.',
      'Esperar la temporada de lluvias torrenciales para recolectar agua en tinajas.',
      'Abandonar las terrazas agrícolas y emigrar hacia la costa desértica.'
    ],
    correcta: 1,
    fundamento: 'Art. 919 C.C.: Todo predio está sujeto a la servidumbre de acueducto en favor de otro predio que carezca de las aguas necesarias para el cultivo de cementeras o el abastecimiento de sus pobladores.',
    ensenanza: 'La propiedad privada tiene una función social y ecológica. El agua es un bien vital que no puede monopolizarse caprichosamente.',
  },

  // Capítulo 4: El Gran Concilio (Pacto de Convivencia)
  concilio: {
    nivel: 4,
    titulo: 'El Tratado de la Sabana y el Santuario de Bellium',
    norma: 'Principios Fundamentales del Estado Social de Derecho · Art. 1 C.P.',
    pregunta: 'Los delegados de los cuatro distritos se congregan para redactar la Carta de Convivencia. ¿Cuál es el núcleo del nuevo orden social?',
    opciones: [
      'Castigo de cárcel y reclusión permanente para todo el que discrepe.',
      'La primacía de la dignidad humana, la resolución pacífica de controversias y el florecimiento armónico de la comunidad.',
      'Crear un ejército de ocupación para someter las colonias rebeldes.',
      'Reinstaurar el cobro de tributos feudales sobre la pesca y la agricultura.'
    ],
    correcta: 1,
    fundamento: 'Art. 1 y 2 C.P.: Colombia es un Estado social de derecho fundado en el respeto de la dignidad humana, en el trabajo y la solidaridad de las personas que la integran y en la prevalencia del interés general.',
    ensenanza: 'Donde la ley restituye la dignidad y la equidad, la tierra estéril florece con la luz dorada de Bellium.',
  },
};

export function getLegalCase(nivel) {
  const keys = ['prologo', 'torre_ceniza', 'embarcadero', 'terrazas', 'concilio'];
  const key = keys[nivel] || 'prologo';
  return LEGAL_CASES[key];
}
