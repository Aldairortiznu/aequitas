import { MapBuilder, T } from './lib';

/**
 * Episodio 1 · Conjunto Altamar. Cuatro mapas: lobby de la torre (con la oficina de
 * administración y el muro de carnés), la torre (tres plantas apiladas unidas por
 * escaleras), los sótanos y la piscina seca (anfiteatro de la Audiencia).
 */
export function ep01Maps(): Record<string, MapBuilder> {
  // ------------------------------------------------------------ Lobby
  const l = new MapBuilder(40, 26, T.r48, 'altamar');
  l.props = { region: 'altamar', nombre: 'Lobby de la torre', musica: 'altamar', interior: 'true' };
  l.border(T.muro);
  // Baldosas rotas al azar
  for (const [x, y] of [
    [5, 12],
    [12, 18],
    [20, 9],
    [27, 16],
    [33, 20],
    [9, 22],
    [16, 5],
  ] as const)
    l.ground(x, y, T.r49);
  // Muro de carnés y fila
  for (let x = 6; x <= 14; x++) l.alto(x, 1, T.muroCarnes);
  for (let y = 3; y <= 7; y++) l.deco(10, y, T.fila, false);
  l.deco(15, 2, T.cartel);
  // Mostrador de «renovación de existencia»
  l.deco(8, 8, T.r50).deco(9, 8, T.r50).deco(11, 8, T.r50).deco(12, 8, T.r50);
  // Oficina de administración (cerrada con puerta)
  l.building(24, 2, 35, 9, T.piso, 29);
  l.deco(26, 4, T.mesa).deco(27, 4, T.mesa);
  l.deco(31, 3, T.estante).deco(32, 3, T.estante).deco(33, 3, T.estante);
  l.deco(25, 7, T.barril).deco(34, 7, T.escombro);
  // Escaleras a la torre (arriba a la derecha) y ascensor muerto
  l.deco(37, 4, T.r61).deco(37, 5, T.r61);
  l.ground(36, 3, T.escalera).ground(36, 4, T.escalera);
  // Sótanos (abajo a la izquierda) y salida a la piscina (abajo al centro)
  l.ground(3, 22, T.escalera).ground(3, 23, T.escalera);
  l.ground(20, 25, T.puerta).solid(20, 25, false);
  l.decoAlta[25 * 40 + 20] = 0;
  // Escombros, varillas y bancas
  l.deco(18, 14, T.escombro)
    .deco(19, 14, T.escombro)
    .deco(30, 13, T.r54)
    .deco(6, 16, T.banca)
    .deco(7, 16, T.banca);
  l.deco(22, 20, T.tanque);
  // Densidad (regla «algo cada ocho pasos»): columnas del lobby, plantas en cubetas, cajas,
  // ropa tendida entre columnas, bancas y escombros.
  for (const x of [8, 16, 24, 32]) l.deco(x, 12, T.poste).deco(x, 19, T.poste);
  l.deco(4, 4, T.arbusto).deco(21, 4, T.arbusto).deco(38, 14, T.arbusto).deco(38, 22, T.arbusto);
  l.deco(12, 21, T.barril).deco(13, 21, T.barril).deco(35, 12, T.barril);
  l.deco(2, 8, T.escombro).deco(36, 21, T.escombro).deco(27, 22, T.r54);
  l.deco(9, 12, T.r56, false).deco(17, 12, T.r56, false).deco(25, 12, T.r56, false);
  l.deco(4, 19, T.banca).deco(5, 19, T.banca).deco(33, 16, T.banca).deco(34, 16, T.banca);
  l.atril('atril-lobby', 24, 22);
  l.spawn('inicio', 20, 22)
    .spawn('atril', 25, 23)
    .spawn('desde-torre', 34, 5)
    .spawn('desde-sotanos', 5, 22)
    .spawn('desde-piscina', 20, 23)
    .npc('npc-marrugo', 10, 9, 'marrugo', 'ep01-marrugo-lobby', 'abajo')
    .npc('npc-pilar', 15, 14, 'pilar', 'ep01-pilar', 'izquierda')
    .npc('npc-vecina-fila', 10, 5, 'vecino-1', 'ep01-vecina-fila', 'arriba')
    .npc('npc-ligia', 8, 18, 'vecino-3', 'ep01-ligia', 'derecha')
    .npc('npc-joven', 30, 18, 'vecino-4', 'ep01-joven', 'izquierda')
    .evidence('ev-acta', 15, 3, 'ep01-acta-ano-1')
    .evidence('ev-reglamento', 27, 5, 'ep01-reglamento')
    .evidence('ev-libro-actas', 32, 4, 'ep01-libro-actas')
    .evidence('ev-cuaderno', 26, 6, 'ep01-cuaderno-expensas')
    .folio('folio-l675-50', 33, 8, 'l675-50')
    .folio('folio-l675-47', 25, 3, 'l675-47')
    .folio('folio-cp86', 4, 12, 'cp-86')
    .letrero(
      'letrero-torre',
      35,
      6,
      'Escaleras a la torre: pisos 3, 4 y 7. El ascensor no funciona desde la Fractura.',
    )
    .letrero(
      'letrero-sotanos',
      5,
      21,
      'Sótanos. «Solo personal con carné.» Alguien tachó la última palabra.',
    )
    .letrero(
      'letrero-piscina',
      22,
      24,
      'Salida a la piscina. Ahí se reúne la gente cuando hay algo que decidir.',
    )
    .letrero(
      'letrero-oficina',
      30,
      10,
      'Oficina de administración. Cerrada desde que Marrugo atiende en el lobby.',
    )
    .door('escalera-torre', 36, 3, 'torre', 'piso3-desde-lobby')
    .door('escalera-sotanos', 3, 23, 'sotanos', 'entrada')
    .door('salida-piscina', 20, 25, 'piscina', 'entrada')
    .trigger('trigger-muro-carnes', 6, 2, 9, 1, 'ep01-muro-carnes')
    .trigger('trigger-oficina', 28, 8, 3, 1, 'ep01-entra-oficina')
    .patrol(
      'vigilante-lobby',
      [
        [17, 10],
        [17, 20],
        [30, 20],
        [30, 11],
      ],
      'alguacil',
      'cp-84',
    );

  // ------------------------------------------------------------ Torre (tres plantas apiladas)
  const t = new MapBuilder(30, 46, T.piso, 'altamar');
  t.props = {
    region: 'altamar',
    nombre: 'Torre, pisos 3, 4 y 7',
    musica: 'altamar',
    interior: 'true',
  };
  t.border(T.muro);
  // Separadores entre plantas (muros horizontales) con huecos de escalera a la derecha
  const plantas = [
    { y0: 1, y1: 14, nombre: 'piso7' },
    { y0: 16, y1: 29, nombre: 'piso4' },
    { y0: 31, y1: 44, nombre: 'piso3' },
  ];
  for (const y of [15, 30]) for (let x = 0; x < 30; x++) t.alto(x, y, T.muro);
  for (const p of plantas) {
    // Pasillo central horizontal con puertas de apartamentos arriba y abajo
    t.groundRect(1, p.y0 + 5, 28, p.y0 + 7, T.alfombra);
    for (let x = 3; x <= 24; x += 7) {
      t.deco(x, p.y0 + 4, T.r51, true);
      t.deco(x, p.y0 + 8, T.r51, true);
    }
    // Barandilla y ventanas de fondo
    for (let x = 2; x < 28; x += 4) t.alto(x, p.y0, T.ventana, true);
    t.ground(27, p.y0 + 1, T.escalera)
      .ground(27, p.y0 + 2, T.escalera)
      .ground(27, p.y0 + 11, T.escalera)
      .ground(27, p.y0 + 12, T.escalera);
    t.deco(1, p.y0 + 10, T.r53, true);
  }
  // Piso 3: apartamento de Pilar (abierto): cocina, mesa, cama
  t.building(2, 32, 12, 38, T.piso, 7);
  t.deco(4, 34, T.mesa).deco(9, 34, T.banca).deco(10, 33, T.estante);
  // Piso 4: válvula con candado en el cuarto técnico
  t.building(16, 17, 24, 22, T.piso, 20);
  t.deco(18, 19, T.valvula)
    .deco(19, 19, T.tuberia, false)
    .deco(20, 19, T.tuberia, false)
    .deco(21, 19, T.tuberia, false);
  t.deco(22, 18, T.tanque);
  // Piso 7: apartamento de Zoraida
  t.building(15, 2, 27, 8, T.piso, 20);
  t.deco(17, 4, T.banca).deco(24, 4, T.estante).deco(25, 4, T.estante).deco(19, 5, T.mesa);
  // Objetos
  t.spawn('piso3-desde-lobby', 26, 43)
    .spawn('piso3-desde-4', 26, 33)
    .spawn('piso4-desde-3', 26, 28)
    .spawn('piso4-desde-7', 26, 18)
    .spawn('piso7-desde-4', 26, 13)
    .spawn('atril', 14, 42)
    .npc('npc-vecino-p3', 14, 40, 'vecino-2', 'ep01-vecino-p3', 'izquierda')
    .npc('npc-tomas-cuarto', 5, 36, 'tomas', 'ep01-tomas-casa', 'abajo')
    .npc('npc-zoraida', 20, 6, 'zoraida', 'ep01-zoraida', 'abajo')
    .evidence('ev-valvula', 18, 20, 'ep01-valvula')
    .folio('folio-l675-3', 10, 42, 'l675-3')
    .folio('folio-l675-59', 3, 26, 'l675-59')
    .folio('folio-cp14', 3, 11, 'cp-14')
    .door('sube-3-4', 27, 32, 'torre', 'piso4-desde-3')
    .door('baja-4-3', 27, 28, 'torre', 'piso3-desde-4')
    .door('sube-4-7', 27, 17, 'torre', 'piso7-desde-4')
    .door('baja-7-4', 27, 13, 'torre', 'piso4-desde-7')
    .door('baja-lobby', 27, 43, 'lobby', 'desde-torre')
    .trigger('trigger-piso4', 10, 21, 8, 1, 'ep01-piso4')
    .patrol(
      'vigilante-piso4',
      [
        [4, 22],
        [24, 22],
      ],
      'alguacil',
      'cp-28',
    )
    .atril('atril-torre', 13, 42);

  // ------------------------------------------------------------ Sótanos
  const s = new MapBuilder(26, 16, T.pisoVar, 'altamar');
  s.props = { region: 'altamar', nombre: 'Sótanos', musica: 'altamar', interior: 'true' };
  s.border(T.muro);
  for (let x = 3; x <= 21; x += 6) s.deco(x, 2, T.tanque).deco(x + 1, 2, T.tanque);
  for (let x = 2; x < 24; x++) s.deco(x, 4, T.tuberia, false);
  s.deco(20, 10, T.escombro).deco(21, 11, T.escombro).deco(5, 12, T.barril).deco(6, 12, T.barril);
  s.deco(12, 8, T.banca);
  s.ground(3, 15, T.escalera).solid(3, 15, false);
  s.decoAlta[15 * 26 + 3] = 0;
  s.spawn('entrada', 3, 13)
    .npc('npc-tomas', 12, 10, 'tomas', 'ep01-tomas', 'arriba')
    .npc('npc-vecino-sotano', 18, 7, 'vecino-2', 'ep01-vecino-sotano', 'izquierda')
    .evidence('ev-carne', 13, 7, 'ep01-carne-tomas')
    .door('escalera-lobby', 3, 15, 'lobby', 'desde-sotanos')
    .trigger('trigger-sotanos', 6, 12, 4, 1, 'ep01-sotanos');

  // ------------------------------------------------------------ Piscina (exterior)
  const p = new MapBuilder(36, 24, T.suelo, 'altamar');
  p.props = { region: 'altamar', nombre: 'La piscina', musica: 'altamar' };
  p.border(T.muro, false);
  // Fachada de la torre al norte (muro con ventanas y balcones) con la puerta al lobby
  for (let x = 0; x < 36; x++) {
    p.alto(x, 0, x % 5 === 2 ? T.ventana : x % 5 === 4 ? T.balcon : T.muro);
    p.alto(x, 1, T.muro);
  }
  p.ground(18, 1, T.puerta).solid(18, 1, false);
  p.decoAlta[1 * 36 + 18] = 0;
  // Piscina vacía
  p.groundRect(10, 8, 25, 16, T.piscina);
  for (let x = 10; x <= 25; x++) {
    p.ground(x, 7, T.r58);
    p.ground(x, 17, T.r58);
  }
  for (let y = 7; y <= 17; y++) {
    p.ground(9, y, T.r58);
    p.ground(26, y, T.r58);
  }
  p.ground(9, 12, T.r59);
  // Gradas (bancas) alrededor: el anfiteatro
  for (let x = 12; x <= 23; x += 2) p.deco(x, 5, T.banca);
  for (let x = 12; x <= 23; x += 2) p.deco(x, 19, T.banca);
  // Escombros, varillas y sal seca
  p.deco(4, 10, T.escombro).deco(31, 14, T.escombro).deco(5, 20, T.r54).deco(30, 4, T.r54);
  p.deco(2, 4, T.arbusto)
    .deco(33, 21, T.arbusto)
    .deco(3, 21, T.tronco)
    .deco(3, 20, T.copaIzq)
    .deco(4, 20, T.copaDer);
  // Verdor y floración: la piscina se siembra, aparece ropa tendida y toldos
  for (let y = 9; y <= 15; y += 2)
    for (let x = 12; x <= 23; x += 3)
      p.decoEn('verdor', x, y, T.huerta).decoEn('floracion', x, y, T.huerta);
  for (let x = 13; x <= 22; x += 4)
    p.decoEn('floracion', x, 10, T.margarita).decoEn('floracion', x + 1, 14, T.margarita);
  for (let x = 6; x <= 30; x += 8)
    p.decoEn('verdor', x, 2, T.r56)
      .decoEn('floracion', x, 2, T.r56)
      .decoEn('floracion', x + 2, 2, T.r55);
  p.mesa('mesa-conciliacion', 30, 8, 'ep01-pacto', {
    requiereFlag: 'ep01.asamblea',
    textoBloqueo: 'La mesa está vacía. Primero hay que oír a Marrugo delante de todos.',
  });
  p.deco(29, 8, T.silla, false).deco(31, 8, T.silla, false);
  p.atril('atril-piscina', 6, 6);
  p.spawn('entrada', 18, 3)
    .spawn('atril', 6, 7)
    .npc('npc-marrugo-piscina', 17, 6, 'marrugo', 'ep01-marrugo-piscina', 'abajo')
    .npc('npc-pilar-piscina', 20, 6, 'pilar', 'ep01-pilar-piscina', 'abajo')
    .npc('npc-vecinos-a', 12, 20, 'vecino-1', 'ep01-vecinos-piscina', 'arriba')
    .npc('npc-vecinos-b', 22, 20, 'vecino-2', 'ep01-vecinos-piscina', 'arriba')
    .npc('npc-tomas-piscina', 24, 21, 'tomas', 'ep01-tomas-piscina', 'arriba')
    .folio('folio-l675-38', 32, 18, 'l675-38')
    .door('entrada-lobby', 18, 1, 'lobby', 'desde-piscina')
    .trigger('trigger-piscina', 14, 8, 8, 2, 'ep01-piscina');

  return { lobby: l, torre: t, sotanos: s, piscina: p };
}
