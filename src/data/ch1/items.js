// CAPÍTULO 1 — el expediente: pruebas, testimonios y objetos.
// kind: 'prueba' | 'testimonio' | 'objeto' (los objetos no se presentan).

export const ITEMS = {
  nombre_original: { kind: 'prueba', icon: 'ic_brush', name: 'Nombre bajo la pintura', desc: 'Bajo «La Esperanza» aparece el nombre viejo de la lancha: «Niña Mercedes».' },
  matricula: { kind: 'prueba', icon: 'ic_doc', name: 'Matrícula de la embarcación', desc: 'Reconstruida con las dos mitades: lancha «Niña Mercedes», motor serie MR-4471-R. Propietario: Aurelio Mendoza Pacheco, de Puerto Alcaraván.' },
  placa_motor: { kind: 'prueba', icon: 'ic_plate', name: 'Placa del motor', desc: 'Placa metálica del motor rojo: serie MR-4471-R. Estaba escondida en la bodega, detrás de unas redes viejas.' },
  recibos: { kind: 'prueba', icon: 'ic_receipts', name: 'Cuaderno de cuentas de Don Chepe', desc: 'Lo que los Ortega compraron para la lancha, con fecha: pistón y empaques, parche del casco, pintura, toldo, banderines y un parlante.' },
  libro_hallazgos: { kind: 'prueba', icon: 'ic_book', name: 'Libro de hallazgos de la Junta', desc: '«Año 1 después del Acuerdo. Carmen Ortega encontró una lancha encallada en la ciénaga, sin nadie a bordo. Motor rojo. Se guarda para su dueño.»' },
  acuerdo_gallina: { kind: 'prueba', icon: 'ic_pact', name: 'Acuerdo de la gallina', desc: 'Rosa y Lucho resolvieron su pelea hablando: ella repara la huerta y hace un corral; él le devuelve la Copetona.' },
  nando: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Nando', desc: '«La noche que la guerra llegó a Alcaraván vi bajar esa lancha sola, vacía, por el río. Nadie la venía manejando.»' },
  lucho: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Don Lucho', desc: '«Una noche vi a Julián cargar algo de metal hacia la bodega de Chepe. Brillaba con la luna.»' },
  yuli: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Yuli', desc: '«Julián escondió una placa brillante en la bodega, detrás de las redes viejas.»' },
  carmen: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Carmen Ortega', desc: '«La anoté en el libro de la Junta y esperé al dueño. En siete años nadie vino.»' },
  tule: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Mamá Tule', desc: '«Esa lancha la vi en Puerto Alcaraván antes de la guerra: motor rojo y nombre de niña.»' },
  aurelio: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Don Aurelio', desc: '«La perdí cuando la guerra llegó a Alcaraván y tuve que huir. Tengo media matrícula; la otra mitad se quemó con mi casa.»' },
  julian: { kind: 'testimonio', icon: 'ic_voice', name: 'Testimonio de Julián', desc: '«La lancha llegó sola por el río. Llevamos siete años con ella: es nuestra.»' },
  media_matricula: { kind: 'objeto', icon: 'ic_doc_torn', name: 'Media matrícula', desc: 'La mitad de un documento viejo, clavada bajo el banco de la cabina.' },
  llave_bodega: { kind: 'objeto', icon: 'ic_key', name: 'Llave de la bodega', desc: 'Don Chepe te la prestó. «Cuidado con los ratones.»' },
};

// Lo indispensable para pedir la audiencia.
export const REQUIRED = ['nombre_original', 'matricula', 'placa_motor', 'recibos', 'libro_hallazgos', 'acuerdo_gallina', 'nando'];

// Los tres conflictos del puerto que dan confianza (abren el retén con 2).
export const TRUST = [
  { flag: 'gallina_done', label: 'La gallina de Doña Rosa', where: 'Barrio Las Gallinas', icon: 'an_hen0' },
  { flag: 'alumbrado_done', label: 'El alumbrado del muelle', where: 'Muelle', icon: 'pr_lamp_on' },
  { flag: 'peso_done', label: 'El peso justo', where: 'Mercado', icon: 'pr_scale' },
];
