// Diálogos oficiales de AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Enfoque exclusivo en los 4 Exploradores de la Biblioteca.

export const SPEAKERS = {
  aurelio:     { name: 'Aurelio · El Archivista',        color: '#c9a7eb', portrait: 'aurelio',   italic: false },
  valeria:     { name: 'Valeria · La Cartógrafa',       color: '#88c292', portrait: 'valeria',   italic: false },
  kaelen:      { name: 'Kaelen · El Custodio',          color: '#ffd875', portrait: 'kaelen',    italic: false },
  sora:        { name: 'Sora · La Centinela',            color: '#ffffff', portrait: 'sora',      italic: false },
  pensamiento: { name: 'Explorador · En su interior',   color: '#ffd875', portrait: null,        italic: true },
  guia:        { name: 'Canciller de Bellium',           color: '#e3940b', portrait: 'npc_guia',  italic: false },
  murociego:   { name: 'Prefecto Muro-Ciego',           color: '#cfd8dc', portrait: 'murociego', italic: false },
  silas:       { name: 'Silas el Especulador',           color: '#ffcc80', portrait: 'silas',     italic: false },
  dona_ines:   { name: 'Doña Inés',                     color: '#ce93d8', portrait: 'dona_ines', italic: false },
  mateo:       { name: 'Mateo el Pescador',              color: '#90caf9', portrait: 'mateo',     italic: false },
};

export const CONVERSATIONS = {
  intro: [
    { s: 'pensamiento', t: 'Bajo las bóvedas subterráneas de la Legendaria Biblioteca Experimental en el Caribe, entre servidores antiguos y enredaderas de flores doradas, preparamos la expedición.' },
    { s: 'guia', t: 'Saludos, exploradores de Bellium. El mundo exterior colapsó cuando se perdió la certidumbre, el respeto a los acuerdos y la justicia.' },
    { s: 'aurelio', t: 'En el yermo, los señores feudales imponen su capricho por la fuerza bruta. Creen que la arbitrariedad es ley porque nadie les recuerda los códices del Estado de Derecho.' },
    { s: 'valeria', t: 'No llevamos armas de fuego: llevamos los códices de la Constitución y el Derecho Civil. Demostraremos que la ley devuelve el orden donde todo era caos.' },
    { s: 'guia', t: 'Empaquen los pergaminos en el zurrón y marchen hacia Torre Ceniza. Donde restauren un pacto legítimo, la Margarita Dorada de Bellium florecerá.' },
    { s: 'pensamiento', t: 'Es momento de marchar. La ley colombiana será nuestro estandarte para reconstruir la sociedad.' },
  ],

  torre_ceniza_dona_ines: [
    { s: 'dona_ines', t: '¡Compañeros de la Biblioteca, auxilio! El Prefecto Muro-Ciego clavó este edicto de expulsión en mi campamento. Dice que nos desterrará al desierto hoy mismo.' },
    { s: 'pensamiento', t: 'Examino el edicto: no hubo notificación formal, no se escucharon descargos y no se convocó a la Asamblea Comunal.' },
    { s: 'valeria', t: 'Esto vulnera la Ley 675 de propiedad comunal. Ningún administrador puede imponer sanciones de despojo por su propia cuenta.' },
    { s: 'aurelio', t: 'Y viola el Artículo 29 de la Constitución: el Debido Proceso. Doña Inés, ese edicto carece de validez legal.' },
  ],

  murociego_confronta: [
    { s: 'murociego', t: '¡Deténganse! En Torre Ceniza mando yo. Doña Inés se marcha hoy mismo y nadie puede impedirlo.' },
    { s: 'pensamiento', t: 'Usa la Barra Espaciadora para proyectar Alegatos Jurídicos fundamentados en el Código Civil y la Constitución.' },
    { s: 'pensamiento', t: 'Presiona B para activar el Control de Legalidad y señalar la Cláusula Nula del edicto. Presiona V para ampararte en la Dignidad Constitucional.' },
  ],

  arbitrariedad_vencida: [
    { s: 'pensamiento', t: 'Frente al peso incontrovertible de los artículos legales y las actas comunales, la soberbia del Prefecto se derrumba.' },
    { s: 'murociego', t: 'Basta... reconozco que actué por la fuerza y sin citar a la Asamblea. La Constitución es norma de normas. El edicto queda formalmente revocado.' },
    { s: 'valeria', t: '¡Miren el suelo de concreto agrietado! ¡Las margaritas doradas de Bellium están brotando bajo nuestros pies!' },
    { s: 'pensamiento', t: 'La ley no necesitó violencia: el debido proceso legitimó un nuevo orden y devolvió la paz a los sobrevivientes.' },
  ],

  counsel_valeria: [
    { s: 'valeria', t: 'He cartografiado el territorio. Los manantiales y caminos comunes no pueden ser privatizados por la fuerza. La servidumbre legal ampara a la comunidad.' },
  ],

  counsel_kaelen: [
    { s: 'kaelen', t: 'Revisé los pagarés de los mercaderes fluviales. Llenar títulos en blanco cobrando intereses exorbitantes constituye usura prohibida por el Código de Comercio.' },
  ],

  counsel_aurelio: [
    { s: 'aurelio', t: 'Recuerda: en todo procedimiento sancionatorio, el derecho a la defensa es inviolable. Si una norma contradice la Constitución, debe ser inaplicada.' },
  ],

  counsel_sora: [
    { s: 'sora', t: 'La dignidad humana es el fin supremo del pacto social. Donde otros ven venganza punitiva, nosotros sembramos justicia restaurativa.' },
  ],
};
