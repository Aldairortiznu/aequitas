// Atril de Jurisprudencia de AEQUITAS.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).

export const RIDDLES = {
  prologo: {
    nivel: 0,
    fuente: 'Constitución Política',
    libro: 'Constitución Política de Colombia de 1991',
    autor: 'Asamblea Nacional Constituyente',
    donde: 'Artículos 1, 4 y 6 (De los principios fundamentales)',
    tema: 'Supremacía Constitucional y Principio de Legalidad',
    pista: 'Aurelio: "Para refundar la sociedad, ninguna orden armada puede prevalecer sobre la norma suprema (Art. 4 C.P.)."',
    tipo: 'eleccion',
    pregunta: 'Para refundar una sociedad colapsada donde imperaba la fuerza, ¿cuál es el principio fundante?',
    opciones: [
      'Que el líder militar con más armas imponga su voluntad unilateral.',
      'La Constitución es norma de normas; en todo caso de incompatibilidad, se aplica la Constitución (Art. 4 C.P.).',
      'Que las deudas se castiguen con el destierro forzoso sin juicio.',
      'Abolir todas las garantías civiles hasta que termine la escasez.'
    ],
    correcta: 1,
    ensenanza: 'La Constitución es norma de normas (Art. 4 C.P.): la dignidad humana y la legalidad son el cimiento de la convivencia pacífica.',
  },

  torre_ceniza: {
    nivel: 1,
    fuente: 'Derecho Constitucional',
    libro: 'Constitución Política & Ley 675 de 2001',
    autor: 'Régimen de Propiedad Horizontal y Garantías Fundamentales',
    donde: 'Artículo 29 C.P. (Debido Proceso) y Ley 675 (Régimen de Copropiedad)',
    tema: 'Debido Proceso y Nulidad de Destierro Arbitrario',
    pista: 'Valeria: "Nadie puede ser expulsado de su hogar por un capricho administrativo. Sin descargos y asamblea, la sanción es nula."',
    tipo: 'eleccion',
    pregunta: 'El Prefecto desterró a Doña Inés sin notificarla ni convocar a la Asamblea. ¿Qué garantía anula su decisión?',
    opciones: [
      'Que el edicto no tenía suficientes sellos de cera roja.',
      'Vulneración al Debido Proceso (Art. 29 C.P.): nadie puede ser sancionado sin derecho a la defensa y contradicción previa.',
      'Que debió cobrarse una multa en sal marina antes de expulsarla.',
      'Que la expulsión debía realizarse en horas nocturnas.'
    ],
    correcta: 1,
    ensenanza: 'El Debido Proceso (Art. 29 C.P.) es inviolable. Ninguna asamblea ni autoridad comunal puede despojar a nadie sin juicio previo y defensa justa.',
  },

  embarcadero: {
    nivel: 2,
    fuente: 'Derecho Comercial',
    libro: 'Código de Comercio de Colombia',
    autor: 'Decreto 410 de 1971',
    donde: 'Artículos 622, 871 y 884 (Títulos en blanco, buena fe y usura)',
    tema: 'Títulos Valores y Límite Legal a los Intereses',
    pista: 'Kaelen: "Un pagaré firmado en blanco no otorga patente de corso. Sin carta de instrucciones y cobrando tasas desmedidas, incurre en usura."',
    tipo: 'eleccion',
    pregunta: 'Silas incautó la lancha pesquera llenando un pagaré en blanco al 40% mensual. ¿Por qué es nula esa ejecución?',
    opciones: [
      'Porque las barcas pesqueras solo pueden navegar los fines de semana.',
      'Llenar un título en blanco sin carta de instrucciones vulnera el Art. 622 C.Co, y el interés excede el tope de usura (Art. 884 C.Co).',
      'Porque los títulos comerciales no tienen validez fuera de las grandes capitales.',
      'Porque Silas debió solicitar un permiso a la capitanía fluvial antes.'
    ],
    correcta: 1,
    ensenanza: 'La buena fe mercantil (Art. 871 C.Co) y el límite a la usura (Art. 884 C.Co) protegen a los trabajadores del abuso de los monopolios.',
  },

  terrazas: {
    nivel: 3,
    fuente: 'Derecho Civil',
    libro: 'Código Civil Colombiano',
    autor: 'Régimen de Bienes y Servidumbres',
    donde: 'Artículos 919 y 931 (De las servidumbres legales de acueducto)',
    tema: 'Servidumbre Legal de Acueducto y Función Social',
    pista: 'Valeria: "El agua no puede ser secuestrada por el predio superior. La ley obliga a conceder paso por donde cause el menor daño."',
    tipo: 'eleccion',
    pregunta: 'Don Robustiano represó la fuente y cortó el canal comunal. ¿Qué figura jurídica restituye el flujo hídrico?',
    opciones: [
      'La fuerza de las armas y la destrucción de la presa.',
      'La servidumbre legal de acueducto (Art. 919 C.C.), que faculta al predio sin agua a conducirla a través de predios intermedios.',
      'La renuncia de la comunidad a sembrar alimentos en esa temporada.',
      'El abandono de la colonia y la migración hacia las ciénagas.'
    ],
    correcta: 1,
    ensenanza: 'La servidumbre legal de acueducto (Art. 919 C.C.) garantiza la función social de la propiedad: el agua es vital para el sustento colectivo.',
  },

  concilio: {
    nivel: 4,
    fuente: 'Estado Social de Derecho',
    libro: 'Principios Fundamentales de la Convivencia',
    autor: 'Pacto Constitucional de Bellium',
    donde: 'Artículos 1, 2 y 22 C.P. (La paz es un derecho y un deber)',
    tema: 'Resolución Pacífica de Controversias y Florecimiento Social',
    pista: 'Sora: "El florecimiento de Bellium no se logra venciendo a un enemigo, sino acordando un pacto legítimo donde todos se reconozcan como iguales."',
    tipo: 'eleccion',
    pregunta: 'Al culminar la refundación del yermo, ¿cuál es el principio rector del Tratado de la Sabana?',
    opciones: [
      'Instituir un tribunal punitivo de castigos perpetuos.',
      'La primacía de la dignidad humana, la resolución pacífica de controversias y la solidaridad como garantía de paz estable (Art. 1 y 22 C.P.).',
      'Crear murallas impenetrables entre los cuatro distritos.',
      'Imponer un monopolio comercial sobre las semillas nativas.'
    ],
    correcta: 1,
    ensenanza: 'La paz es un derecho y un deber de obligatorio cumplimiento (Art. 22 C.P.). El orden legal devuelve el florecimiento y la luz de Bellium al mundo.',
  },
};
