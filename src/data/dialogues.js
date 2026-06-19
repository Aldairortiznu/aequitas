// Textos y voces de "Reverdecer".
// Cada conversación es una lista de líneas { s: speakerKey, t: texto }.
//
// ESTILO DE REDACCIÓN: español latino / neutro latinoamericano. Trato de "tú"
// (nunca "vosotros"/"os"), sin modismos de España. Tono cálido, sencillo y emotivo.

export const SPEAKERS = {
  abigail:     { name: 'Abigail',               color: '#e9c46a', portrait: 'abigail',   italic: false },
  pensamiento: { name: 'Abigail · en su interior', color: '#c3a9ec', portrait: null,     italic: true },
  jeronimo:    { name: 'Jerónimo',              color: '#f3efe0', portrait: 'jeronimo',  italic: false },
  amanda:      { name: 'Amanda',                color: '#bfe0ff', portrait: 'amanda',    italic: false },
  guia:        { name: 'El Jardinero',          color: '#6cc77a', portrait: 'npc_guia',  italic: false },
};

export const CONVERSATIONS = {
  intro: [
    { s: 'pensamiento', t: 'Desperté en un jardín que no recordaba... y que, sin embargo, parecía estar esperándome.' },
    { s: 'jeronimo', t: 'Buenos días, Abigail. Dormiste mucho tiempo. Mientras dormías el sueño del miedo, el mundo fue marchitándose.' },
    { s: 'amanda', t: '¡Pero ya despertaste! Y nosotros vamos contigo. ¡Hay treinta y dos reinos esperando reverdecer!' },
    { s: 'jeronimo', t: 'Cada reino guarda un aprendizaje. Y cada aprendizaje está custodiado por una sombra que vive dentro de ti.' },
    { s: 'pensamiento', t: 'Entonces, para salvar el mundo... primero tendré que atreverme a mirarme a mí misma.' },
    { s: 'abigail', t: 'Está bien. Empecemos. Paso a paso.' },
  ],

  jardinero: [
    { s: 'guia', t: 'Ah... una viajera de verdad. Pocos cruzan estas tierras con el corazón despierto.' },
    { s: 'guia', t: '¿Ves cómo reverdece el jardín por donde caminas? El mundo responde a quien se anima a mirarse por dentro.' },
    { s: 'guia', t: 'Sigue el sendero. Cada portal pondrá a prueba no tu fuerza, sino tu verdad. Y recuerda esto, niña:' },
    { s: 'guia', t: 'Lo que temes siempre señala lo que has venido a aprender.' },
    { s: 'pensamiento', t: '"Lo que temo señala lo que vine a aprender." Lo guardaré conmigo.' },
  ],

  jeronimo_consejo: [
    { s: 'jeronimo', t: 'Respira, Abigail. La prisa no es el camino; la constancia sí lo es.' },
    { s: 'jeronimo', t: 'Un árbol no crece tironeando de sus hojas. Crece echando raíces, en silencio. Hazlo tú también.' },
  ],

  amanda_valor: [
    { s: 'amanda', t: '¡Oye, oye! ¿Esa carita de duda? ¡Tú puedes con esto, y con lo que venga después!' },
    { s: 'amanda', t: 'Cuando llegue el miedo, respira y da UN paso. Solo uno. El siguiente lo damos juntas. ¡Vamos!' },
  ],

  sombra_aviso: [
    { s: 'jeronimo', t: 'Cuidado, Abigail. Eso de ahí es una sombra: un miedo tuyo que tomó forma.' },
    { s: 'amanda', t: '¡No te asustes! Con la barra espaciadora la golpeas. ¡Acércate y dale!' },
    { s: 'jeronimo', t: 'Pero escucha bien: las sombras se defienden de los golpes a ciegas.' },
    { s: 'jeronimo', t: 'Presiona B y usaré mi Sabiduría para mostrarte su punto débil. Solo entonces le harás daño de verdad.' },
    { s: 'amanda', t: 'Y si te sientes flaquear, presiona V. ¡Yo te doy mi Valor y pegas mucho más fuerte!' },
    { s: 'pensamiento', t: 'Muy bien... no estoy sola. Respiro. Doy un paso. Y enfrento lo que vine a enfrentar.' },
  ],

  sombra_vencida: [
    { s: 'pensamiento', t: 'La sombra se deshizo... y no quedó un monstruo, sino un pedacito de mí.' },
    { s: 'jeronimo', t: 'Así es. Nunca peleaste contra un enemigo: peleaste contra algo que no habías querido mirar.' },
    { s: 'amanda', t: '¡Y lo lograste! ¿Viste? ¡Mirarlo de frente ya fue media batalla!' },
    { s: 'jeronimo', t: 'Recuerda esto, Abigail: el miedo se hace gigante en la oscuridad y pequeño cuando lo enfrentas.' },
    { s: 'abigail', t: 'Lo recordaré. Sigamos: el jardín tiene mucho por reverdecer.' },
  ],
};
