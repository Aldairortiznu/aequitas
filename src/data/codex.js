// EL CÓDICE: cartas de ley que el personaje gana jugando y USA en la audiencia.
// Los textos de las cartas no pasan por fmt ({nombre}): se escriben
// sin género para quien juega.
// Cada carta: fuente (ley), título corto, texto en palabras sencillas (fiel a la
// norma) y un ejemplo de cómo se aplica.
//
// Fuente oficial: Constitución Política de 1991 y Código Civil (Ley 84 de 1873),
// textos de la Secretaría del Senado. AVISO: contenido pedagógico; no es asesoría
// jurídica. Revisar vigencia antes de cada versión publicada.

export const FAMILIES = {
  const: { label: 'Constitución', color: '#e3b04b' },
  civil: { label: 'Código Civil', color: '#3fa3a0' },
  ley: { label: 'Ley', color: '#e8846b' },
};

const C = (id, fam, ley, titulo, texto, ejemplo) => ({ id, fam, ley, titulo, texto, ejemplo });

export const CODEX = {
  art116: C('art116', 'const', 'Constitución, art. 116', 'Ciudadanos que hacen justicia',
    'Personas particulares pueden ser investidas, de forma transitoria, de la función de administrar justicia como jurados, conciliadores o árbitros (los árbitros pueden fallar en derecho o en equidad).',
    'Por eso quien viaja por la Biblioteca puede ayudar a conciliar: no castiga a nadie, ayuda a que las partes lleguen a un acuerdo justo.'),
  art34: C('art34', 'const', 'Constitución, art. 34', 'Ni destierro ni confiscación',
    'Se prohíben las penas de destierro, prisión perpetua y confiscación: nadie puede ser expulsado de su país ni perder todos sus bienes como castigo.',
    'Y una asamblea no impone penas: echar a alguien del pueblo violaría también su derecho a vivir donde quiera (art. 24).'),
  art58: C('art58', 'const', 'Constitución, art. 58', 'Propiedad, pero con función social',
    'Se garantiza la propiedad privada adquirida conforme a la ley. No es un derecho sin límites: la propiedad tiene una función social y ecológica.',
    'Una lancha puede tener dueño y, al mismo tiempo, servir a todo el puerto mediante un buen acuerdo.'),
  dominio_posesion: C('dominio_posesion', 'civil', 'Código Civil, arts. 669 y 762', 'Dueño no es lo mismo que poseedor',
    'Dominio: el derecho real para gozar y disponer de una cosa, sin ir contra la ley ni el derecho ajeno. Posesión: tener una cosa con ánimo de señor o dueño. Al poseedor se le tiene por dueño mientras otra persona no demuestre serlo.',
    'Los Ortega poseen la lancha. Pero si Anselmo demuestra que es suya, el dueño es él.'),
  ocupacion: C('ocupacion', 'civil', 'Código Civil, arts. 685, 704 y 705', 'Lo perdido sigue teniendo dueño',
    'Por ocupación solo se adquieren las cosas que no pertenecen a nadie. Quien encuentra una cosa que parece perdida debe ponerla a disposición de su dueño; si no lo conoce, debe entregarla a la autoridad.',
    'Que el río te traiga algo no lo vuelve tuyo: hay que buscar a su dueño.'),
  hallazgo: C('hallazgo', 'civil', 'Código Civil, art. 708', 'Cuando aparece el dueño',
    'Si aparece el dueño de una cosa perdida antes de que el Estado la venda, se le devuelve, pagando los gastos de recogerla y conservarla y lo que la ley reconozca a quien la encontró.',
    'Anselmo puede recuperar su lancha, pero debe reconocer lo que costó salvarla y mantenerla.'),
  prescripcion: C('prescripcion', 'civil', 'Código Civil, arts. 2512, 2529 y 2532', 'El tiempo cuenta... con reglas',
    'Se puede llegar a ser dueño poseyendo una cosa durante el tiempo que fija la ley. La prescripción ordinaria exige posesión regular (con justo título y buena fe): 3 años para muebles. Sin título, la extraordinaria exige 10 años.',
    'Encontrar una lancha no es un título como una compraventa. Sin título hacen falta 10 años, y los Ortega llevan 7.'),
  buena_fe: C('buena_fe', 'civil', 'Código Civil, art. 769', 'La buena fe se presume',
    'La buena fe se presume, salvo los casos en que la ley establece lo contrario. En todos los demás, la mala fe tiene que probarse.',
    'Carmen anotó el hallazgo en el libro de la Junta y esperó al dueño: eso es buena fe.'),
  frutos: C('frutos', 'civil', 'Código Civil, art. 964', 'Lo producido de buena fe',
    'Quien posee de buena fe no está obligado a devolver los frutos que obtuvo antes de contestar la demanda con la que el dueño se la reclama.',
    'Lo que los Ortega pescaron durante siete años de buena fe no se convierte en una deuda.'),
  expensas: C('expensas', 'civil', 'Código Civil, arts. 965 a 967', 'Gastos necesarios y mejoras',
    'Los gastos necesarios para conservar la cosa se reconocen a todo poseedor que deba devolverla. Las mejoras útiles se le pagan al poseedor de buena fe. Las mejoras de lujo no se pagan: quien las hizo puede llevárselas si no daña la cosa y el dueño no quiere pagarlas.',
    'El parche del casco se reconoce. El parlante no se paga... y si Anselmo no lo quiere pagar, Julián se lo puede llevar.'),
  art2353: C('art2353', 'civil', 'Código Civil, art. 2353', 'Tu animal, tu responsabilidad',
    'El dueño de un animal responde por los daños que este cause, aun si se soltó o se extravió, salvo que la soltura o el daño no puedan atribuirse a culpa suya ni de quien lo cuidaba.',
    'Si la gallina se come la huerta del vecino, responde su dueña. Reparar, no pelear.'),
  art674: C('art674', 'civil', 'Código Civil, art. 674', 'Lo que es de todos',
    'Los bienes de uso público, como calles, plazas, puentes y caminos, son de la Nación y su uso pertenece a todos los habitantes. Nadie puede apropiárselos.',
    'El muelle y sus faroles sirven a todo el puerto: cuidarlos es tarea de todos.'),
  art1603: C('art1603', 'civil', 'Código Civil, art. 1603', 'Cumplir de buena fe',
    'Los contratos deben ejecutarse de buena fe. Obligan a lo que dicen y a todo lo que nace de la naturaleza de la obligación.',
    'Una balanza mal calibrada rompe la confianza, aunque nadie haya querido engañar.'),
  art29: C('art29', 'const', 'Constitución, art. 29', 'Todos merecen ser escuchados',
    'El debido proceso se aplica a toda actuación judicial y administrativa. Toda persona se presume inocente mientras no sea declarada culpable, y quien es acusado tiene derecho a defenderse, a presentar pruebas y a controvertir las que haya en su contra.',
    'En la audiencia hablan las dos partes, y cada prueba se puede discutir.'),
  contrato_ley: C('contrato_ley', 'civil', 'Código Civil, art. 1602', 'Lo pactado obliga',
    'Todo contrato celebrado conforme a la ley es una ley para quienes lo firman. Solo se deshace por mutuo acuerdo o por causas legales.',
    'El acta de Puerto Garza obliga a todos los que la firman.'),
  arrendamiento: C('arrendamiento', 'civil', 'Código Civil, art. 1973', 'Usar a cambio de un precio',
    'En el arrendamiento una parte concede a la otra el goce de una cosa, y la otra paga por ese goce un precio determinado.',
    'Anselmo sigue siendo dueño; los Ortega trabajan la lancha pagando un arriendo justo.'),
  compensacion: C('compensacion', 'civil', 'Código Civil, arts. 1714 y 1715', 'Deudas que se cruzan',
    'Cuando dos personas son deudoras una de la otra, se produce una compensación que extingue ambas deudas hasta donde alcancen (si son de dinero o cosas equivalentes, líquidas y exigibles).',
    'Lo que Anselmo debe por las reparaciones se descuenta de los arriendos, porque así lo pactan en el acta.'),
  conciliacion: C('conciliacion', 'ley', 'Ley 2220 de 2022, art. 64', 'Un acuerdo que se puede exigir',
    'El acta de conciliación que contiene el acuerdo presta mérito ejecutivo y tiene carácter de cosa juzgada: obliga a las partes y se puede exigir su cumplimiento.',
    'Por eso el acta se escribe con claridad: quién, qué, cuánto y cuándo.'),
  justicia_comunitaria: C('justicia_comunitaria', 'ley', 'Ley 2220 de 2022, arts. 5 y 84 · Ley 2166 de 2021, art. 50', 'Justicia comunitaria',
    'La conciliación en equidad se hace ante conciliadores en equidad, aplicando principios de justicia comunitaria. En las Juntas de Acción Comunal, la Comisión de Convivencia y Conciliación puede conciliar en equidad los conflictos de la comunidad, si su conciliador está formado y nombrado.',
    'La Junta de Puerto Garza no necesita puños: tiene una mesa, una comisión y la palabra.'),
  reparacion: C('reparacion', 'ley', 'Ley 446 de 1998, art. 16', 'Reparar, no castigar',
    'La valoración de los daños a las personas y a las cosas atiende los principios de reparación integral y equidad.',
    'Se paga lo que se debe, ni un peso más como castigo.'),
  // Páginas perdidas del Códice (coleccionables del puerto).
  art1: C('art1', 'const', 'Constitución, art. 1', 'Un Estado social de derecho',
    'Colombia es un Estado social de derecho, fundado en el respeto de la dignidad humana, en el trabajo y la solidaridad de las personas y en la prevalencia del interés general.',
    'Aun después de la guerra, esa es la brújula de la Biblioteca.'),
  art11: C('art11', 'const', 'Constitución, art. 11', 'La vida es inviolable',
    'El derecho a la vida es inviolable. No habrá pena de muerte.',
    'Ninguna asamblea, por enfurecida que esté, puede decidir sobre la vida de nadie.'),
  art13: C('art13', 'const', 'Constitución, art. 13', 'Iguales ante la ley',
    'Todas las personas nacen libres e iguales ante la ley, reciben la misma protección y trato de las autoridades, y gozan de los mismos derechos sin ninguna discriminación.',
    'El forastero y el vecino de toda la vida pesan igual en la balanza.'),
  art95: C('art95', 'const', 'Constitución, art. 95', 'Derechos con deberes',
    'Ejercer los derechos implica responsabilidades. Un deber de toda persona: respetar los derechos ajenos y no abusar de los propios.',
    'Tener la razón no autoriza a humillar al otro.'),
  transaccion: C('transaccion', 'civil', 'Código Civil, art. 2469', 'Transigir: ceder un poco para ganar todos',
    'La transacción es un contrato en que las partes terminan extrajudicialmente un litigio pendiente o precaven un litigio eventual.',
    'Un buen acuerdo a tiempo ahorra años de pleito.'),
  // Ronda relámpago (radio de la Biblioteca).
  art22: C('art22', 'const', 'Constitución, art. 22', 'La paz es un derecho y un deber',
    'La paz es un derecho y un deber de obligatorio cumplimiento: no basta con firmarla, hay que cumplirla cada día.',
    'Cuando un lío se arregla hablando y no a los golpes, se está cumpliendo la Constitución.'),
  art2341: C('art2341', 'civil', 'Código Civil, art. 2341', 'Quien causa un daño, lo repara',
    'Quien por su culpa le causa un daño a otra persona está obligado a indemnizarla, además de la pena que la ley imponga si hubo delito.',
    'Si al amarrar mal tu canoa hundes la de tu vecino, debes pagarle el arreglo.'),
  art229: C('art229', 'const', 'Constitución, art. 229', 'La justicia es para todos',
    'Se garantiza el derecho de toda persona a acceder a la administración de justicia.',
    'Nadie debería quedarse sin justicia por vivir lejos o tener poco.'),
  art247: C('art247', 'const', 'Constitución, art. 247', 'Jueces de paz',
    'La ley puede crear jueces de paz encargados de resolver en equidad conflictos individuales y comunitarios, y puede ordenar que se elijan por votación popular.',
    'La equidad —aequitas, en latín— es la justicia que mira el caso concreto.'),
};

export function getCard(id) {
  return CODEX[id] || null;
}
