import { T } from './lib';
import { FILA_SUELO, Franja } from './lateral';

/**
 * Episodio 1 · Conjunto Altamar, en vista lateral (D15). Cuatro franjas: el lobby de la
 * torre (con el muro de carnés y la oficina de administración), la torre como corte del
 * edificio (pisos 3, 4 y 7 unidos por escaleras), los sótanos y la piscina seca, que es el
 * anfiteatro de la Audiencia. Los nombres de objetos y puntos de aparición son los que usa
 * el contenido (manifiesto, diálogos, objetivos): no cambian.
 */
export function ep01Maps(): Record<string, Franja> {
  const F = FILA_SUELO; // 14: fila de la losa del suelo; los personajes van en F - 1
  const P = F - 1;

  // ------------------------------------------------------------ Lobby (64 × 17)
  const l = new Franja(64, 17, 'altamar', {
    region: 'altamar',
    nombre: 'Lobby de la torre',
    musica: 'altamar',
    interior: 'true',
  });
  l.terreno(F, T.piso, T.muro);
  l.losa(0, 63, 3, T.muro); // techo
  l.muro(0, 4, F - 1).muro(63, 4, F - 1);
  // Baldosas rotas
  for (const x of [7, 19, 33, 47, 58]) l.deco(x, F, T.r49, true);
  // Ventanas altas, ropa tendida y enredaderas en la pared del fondo
  for (const x of [12, 24, 36, 48]) l.planta(x, 9, T.ventana);
  l.planta(20, 10, T.r56).planta(21, 10, T.r56);
  l.planta(5, 11, T.enredadera).planta(62, 11, T.enredadera).planta(62, 12, T.enredadera);
  // Salida a la piscina (izquierda)
  l.puerta('salida-piscina', 2, P, 'piscina', 'entrada');
  l.cartel(
    'letrero-piscina',
    4,
    P - 1,
    'Salida a la piscina. Ahí se reúne la gente cuando hay algo que decidir.',
  );
  // Muro de carnés, fila y mostrador de «renovación de existencia»
  for (let x = 6; x <= 14; x++) l.planta(x, 11, T.muroCarnes).planta(x, 12, T.muroCarnes);
  for (const x of [8, 9, 10]) l.planta(x, P, T.fila);
  l.planta(14, P, T.r50).planta(15, P, T.r50).planta(16, P, T.r50);
  // Columnas, bancas, cajas, plantas en cubetas
  for (const x of [18, 29, 45, 54]) l.planta(x, P, T.poste).planta(x, P - 1, T.poste);
  l.planta(24, P, T.banca).planta(25, P, T.banca).planta(46, P, T.banca).planta(47, P, T.banca);
  l.planta(28, P, T.arbusto)
    .planta(58, P, T.arbusto)
    .planta(52, P, T.barril)
    .planta(53, P, T.tanque);
  l.planta(44, P, T.escombro).planta(23, P - 1, T.r54);
  // Oficina de administración: muros con la puerta abierta a ras de suelo
  l.muro(30, 4, P - 2).muro(43, 4, P - 2);
  l.planta(30, P - 1, T.puerta).planta(30, P, T.puerta);
  l.planta(34, P, T.mesa).planta(35, P, T.mesa);
  for (const x of [38, 39, 40]) l.planta(x, P - 1, T.estante).planta(x, P, T.estante);
  l.planta(41, P, T.escombro);
  // Vegetación por estado: el lobby se llena de macetas y enredaderas al reverdecer
  for (const x of [10, 27, 50, 60]) l.decoEn('verdor', x, P, T.arbusto);
  for (const x of [6, 26, 49, 61]) l.decoEn('floracion', x, P, T.margarita);
  for (const x of [13, 37]) l.decoEn('floracion', x, 11, T.enredadera);
  l.atril('atril-lobby', 50, P);
  l.spawn('inicio', 5, P)
    .spawn('atril', 51, P)
    .spawn('desde-torre', 61, P)
    .spawn('desde-sotanos', 57, P)
    .spawn('desde-piscina', 3, P)
    .npc('npc-vecina-fila', 9, P, 'vecino-1', 'ep01-vecina-fila', 'derecha')
    .npc('npc-marrugo', 15, P, 'marrugo', 'ep01-marrugo-lobby', 'abajo')
    .npc('npc-pilar', 20, P, 'pilar', 'ep01-pilar', 'izquierda')
    .npc('npc-ligia', 26, P, 'vecino-3', 'ep01-ligia', 'derecha')
    .npc('npc-joven', 48, P, 'vecino-4', 'ep01-joven', 'izquierda')
    .evidence('ev-acta', 12, P - 1, 'ep01-acta-ano-1')
    .evidence('ev-reglamento', 34, P - 1, 'ep01-reglamento')
    .evidence('ev-cuaderno', 35, P - 1, 'ep01-cuaderno-expensas')
    .evidence('ev-libro-actas', 39, P - 1, 'ep01-libro-actas')
    .folio('folio-l675-50', 40, P - 2, 'l675-50')
    .folio('folio-l675-47', 38, P - 2, 'l675-47')
    .folio('folio-cp86', 22, P, 'cp-86')
    .trigger('trigger-muro-carnes', 6, P, 9, 1, 'ep01-muro-carnes')
    .trigger('trigger-oficina', 31, P, 3, 1, 'ep01-entra-oficina')
    .patrol(
      'vigilante-lobby',
      [
        [17, P],
        [28, P],
      ],
      'alguacil',
      'cp-84',
    );
  l.cartel(
    'letrero-oficina',
    29,
    P - 1,
    'Oficina de administración. Cerrada desde que Marrugo atiende en el lobby.',
  );
  l.cartel(
    'letrero-sotanos',
    55,
    P - 1,
    'Sótanos. «Solo personal con carné.» Alguien tachó la última palabra.',
  );
  l.puerta('escalera-sotanos', 56, P, 'sotanos', 'entrada');
  l.cartel(
    'letrero-torre',
    59,
    P - 1,
    'Escaleras a la torre: pisos 3, 4 y 7. El ascensor no funciona desde la Fractura.',
  );
  l.puerta('escalera-torre', 60, P, 'torre', 'piso3-desde-lobby');

  // ------------------------------------------------------------ Torre (40 × 31): corte del edificio
  const t = new Franja(40, 31, 'altamar', {
    region: 'altamar',
    nombre: 'Torre, pisos 3, 4 y 7',
    musica: 'altamar',
    interior: 'true',
  });
  const p3 = 28; // losa del piso 3
  const p4 = 21; // losa del piso 4
  const p7 = 14; // losa del piso 7
  t.terreno(p3, T.piso, T.muro);
  t.losa(1, 38, p4, T.piso).losa(1, 38, p7, T.piso).losa(0, 39, 7, T.muro);
  t.muro(0, 7, p3 - 1).muro(39, 7, p3 - 1);
  // Escaleras: piso 3 → 4 a la derecha, piso 4 → 7 a la izquierda
  t.escalera(36, p4, p3 - 1);
  t.escalera(3, p7, p4 - 1);
  // Ventanas y pasamanos por planta
  for (const losa of [p3, p4, p7]) {
    for (let x = 6; x < 36; x += 8) t.planta(x, losa - 4, T.ventana);
    for (let x = 8; x < 34; x += 8) t.planta(x, losa - 1, T.r51);
  }
  // Piso 3: la casa de Tomás (muros con hueco de puerta), atril y vecino
  t.muro(4, p3 - 6, p3 - 3).muro(12, p3 - 6, p3 - 3);
  t.planta(6, p3 - 1, T.banca)
    .planta(9, p3 - 1, T.mesa)
    .planta(10, p3 - 2, T.estante)
    .planta(10, p3 - 1, T.estante);
  t.planta(20, p3 - 1, T.barril)
    .planta(28, p3 - 1, T.escombro)
    .planta(15, p3 - 1, T.arbusto);
  t.atril('atril-torre', 22, p3 - 1);
  t.cartel('letrero-torre-p3', 33, p3 - 2, 'Piso 3. La escalera sube al 4; la del fondo, al 7.');
  // Piso 4: tubería, válvula y tanque
  for (let x = 4; x <= 35; x++) t.planta(x, p4 - 4, T.tuberia);
  t.planta(20, p4 - 1, T.valvula)
    .planta(22, p4 - 1, T.tanque)
    .planta(23, p4 - 1, T.tanque);
  t.planta(30, p4 - 1, T.escombro).planta(12, p4 - 1, T.barril);
  t.cartel(
    'letrero-torre-p4',
    8,
    p4 - 2,
    'Piso 4. Cuarto de máquinas: la válvula general del agua.',
  );
  // Piso 7: la casa de Zoraida, con sus plantas
  t.planta(16, p7 - 1, T.mesa)
    .planta(17, p7 - 1, T.mesa)
    .planta(24, p7 - 1, T.estante)
    .planta(24, p7 - 2, T.estante);
  for (const x of [8, 12, 28, 32]) t.planta(x, p7 - 1, T.huerta);
  for (const x of [10, 30]) t.decoEn('verdor', x, p7 - 1, T.arbusto);
  for (const x of [9, 14, 29, 33]) t.decoEn('floracion', x, p7 - 1, T.margarita);
  t.spawn('piso3-desde-lobby', 34, p3 - 1)
    .spawn('piso3-desde-4', 35, p3 - 1)
    .spawn('piso4-desde-3', 34, p4 - 1)
    .spawn('piso4-desde-7', 5, p4 - 1)
    .spawn('piso7-desde-4', 5, p7 - 1)
    .spawn('atril', 23, p3 - 1)
    .npc('npc-tomas-cuarto', 7, p3 - 1, 'tomas', 'ep01-tomas-casa', 'derecha')
    .npc('npc-vecino-p3', 18, p3 - 1, 'vecino-2', 'ep01-vecino-p3', 'izquierda')
    .npc('npc-zoraida', 20, p7 - 1, 'zoraida', 'ep01-zoraida', 'abajo')
    .evidence('ev-valvula', 20, p4 - 2, 'ep01-valvula')
    .folio('folio-l675-3', 26, p3 - 1, 'l675-3')
    .folio('folio-l675-59', 8, p4 - 1, 'l675-59')
    .folio('folio-cp14', 34, p7 - 1, 'cp-14')
    .trigger('trigger-piso4', 24, p4 - 1, 8, 1, 'ep01-piso4')
    .patrol(
      'vigilante-piso4',
      [
        [6, p4 - 1],
        [30, p4 - 1],
      ],
      'alguacil',
      'cp-28',
    );
  t.puerta('baja-lobby', 37, p3 - 1, 'lobby', 'desde-torre');

  // ------------------------------------------------------------ Sótanos (40 × 17)
  const s = new Franja(40, 17, 'altamar', {
    region: 'altamar',
    nombre: 'Sótanos',
    musica: 'altamar',
    interior: 'true',
  });
  s.terreno(F, T.pisoVar, T.muro);
  s.losa(0, 39, 6, T.muro);
  s.muro(0, 7, F - 1).muro(39, 7, F - 1);
  for (let x = 2; x <= 37; x++) s.planta(x, 8, T.tuberia);
  for (const x of [10, 20, 30])
    s.planta(x, P - 1, T.tanque)
      .planta(x, P, T.tanque)
      .planta(x + 1, P, T.tanque);
  s.planta(22, P - 1, T.estante)
    .planta(22, P, T.estante)
    .planta(23, P, T.estante);
  s.planta(34, P, T.escombro)
    .planta(36, P, T.barril)
    .planta(37, P, T.barril)
    .planta(15, P, T.banca);
  s.planta(5, 11, T.enredadera).planta(26, 11, T.enredadera).planta(33, 10, T.enredadera);
  s.puerta('escalera-lobby', 2, P, 'lobby', 'desde-sotanos');
  s.spawn('entrada', 4, P)
    .npc('npc-tomas', 18, P, 'tomas', 'ep01-tomas', 'derecha')
    .npc('npc-vecino-sotano', 28, P, 'vecino-2', 'ep01-vecino-sotano', 'izquierda')
    .evidence('ev-carne', 22, P - 1, 'ep01-carne-tomas')
    .trigger('trigger-sotanos', 6, P, 4, 1, 'ep01-sotanos');

  // ------------------------------------------------------------ Piscina (64 × 17, exterior)
  const p = new Franja(64, 17, 'altamar', {
    region: 'altamar',
    nombre: 'La piscina',
    musica: 'altamar',
  });
  p.terreno(F, T.r58, T.muro);
  // El vaso de la piscina: dos filas más abajo, con escaleras en los extremos
  p.hueco(24, 40, F).hueco(24, 40, F + 1);
  for (let x = 24; x <= 40; x++) p.deco(x, F + 2, T.piscina, true);
  p.muro(23, F, F + 1, T.r58).muro(41, F, F + 1, T.r58);
  p.escalera(24, F, F + 1).escalera(40, F, F + 1);
  // Fachada de la torre a la izquierda y muro del conjunto a la derecha
  p.muro(0, 2, F - 1);
  for (const y of [5, 9]) p.planta(1, y, T.ventana);
  p.muro(63, 8, F - 1);
  // Gradas, escombros, sal seca y la vegetación que se abre paso
  for (const x of [16, 18, 20, 44, 46]) p.planta(x, P, T.banca);
  p.planta(10, P, T.escombro).planta(50, P, T.escombro).planta(12, P, T.r54).planta(54, P, T.r54);
  p.planta(57, P, T.tronco)
    .planta(56, P - 1, T.copaIzq)
    .planta(57, P - 1, T.copaDer);
  p.planta(60, P, T.arbusto).planta(8, P, T.arbusto);
  p.maleza(26, 38, F + 1, 3, 5);
  for (const x of [28, 32, 36]) p.decoEn('verdor', x, F + 1, T.huerta);
  for (const x of [26, 30, 34, 38]) p.decoEn('floracion', x, F + 1, T.margarita);
  for (const x of [14, 48]) p.decoEn('floracion', x, P, T.r56);
  p.puerta('entrada-lobby', 3, P, 'lobby', 'desde-piscina');
  p.cartel(
    'letrero-piscina-vaso',
    22,
    P - 1,
    'La piscina seca. Las gradas son de cuando había agua.',
  );
  p.mesa('mesa-conciliacion', 32, F + 1, 'ep01-pacto', {
    requiereFlag: 'ep01.asamblea',
    textoBloqueo: 'La mesa está vacía. Primero hay que oír a Marrugo delante de todos.',
  });
  p.planta(31, F + 1, T.silla).planta(33, F + 1, T.silla);
  p.atril('atril-piscina', 46, P);
  p.spawn('entrada', 5, P)
    .spawn('atril', 47, P)
    .npc('npc-marrugo-piscina', 30, F + 1, 'marrugo', 'ep01-marrugo-piscina', 'derecha')
    .npc('npc-pilar-piscina', 34, F + 1, 'pilar', 'ep01-pilar-piscina', 'izquierda')
    .npc('npc-vecinos-a', 27, F + 1, 'vecino-1', 'ep01-vecinos-piscina', 'derecha')
    .npc('npc-vecinos-b', 37, F + 1, 'vecino-2', 'ep01-vecinos-piscina', 'izquierda')
    .npc('npc-tomas-piscina', 39, F + 1, 'tomas', 'ep01-tomas-piscina', 'izquierda')
    .folio('folio-l675-38', 52, P, 'l675-38')
    .trigger('trigger-piscina', 9, P, 8, 1, 'ep01-piscina');

  return { lobby: l, torre: t, sotanos: s, piscina: p };
}
