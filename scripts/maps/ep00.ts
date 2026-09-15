import { MapBuilder, T } from './lib';

/**
 * Prólogo · Ciénaga de Bellium. Tres mapas: la estación (exterior con muelles y mangle),
 * el laboratorio (sala de audiencias y oficina de la rectora) y el herbario.
 */
export function ep00Maps(): Record<string, MapBuilder> {
  // ------------------------------------------------------------ Estación (exterior)
  const e = new MapBuilder(44, 30, T.suelo, 'cienaga');
  e.props = { region: 'cienaga', nombre: 'Estación de la ciénaga', musica: 'cienaga' };
  // Agua alrededor: ciénaga al sur y al este, mangles al borde
  e.water(0, 22, 43, 29);
  e.water(36, 0, 43, 21);
  e.border(T.muro, false);
  // Mangles (copas + troncos) en la orilla
  for (const [x, y] of [
    [2, 20],
    [6, 21],
    [11, 20],
    [16, 21],
    [22, 21],
    [28, 20],
    [33, 21],
    [35, 12],
    [35, 6],
    [35, 2],
  ] as const) {
    e.deco(x, y - 1, T.copaIzq)
      .deco(x + 1, y - 1, T.copaDer)
      .deco(x, y, T.tronco)
      .deco(x + 1, y, T.tronco);
  }
  // Camino principal de tablones: de la puerta del laboratorio al muelle
  e.path(20, 4, 21, 21);
  e.path(6, 12, 34, 13);
  // Laboratorio (edificio grande, arriba a la izquierda) y herbario (arriba a la derecha)
  e.building(4, 2, 18, 9, T.piso, 11);
  e.building(24, 3, 33, 9, T.piso, 28);
  e.deco(6, 1, T.panelSolar)
    .deco(8, 1, T.panelSolar)
    .deco(10, 1, T.panelSolar)
    .deco(12, 1, T.panelSolar);
  e.deco(26, 2, T.panelSolar).deco(28, 2, T.panelSolar);
  e.deco(20, 1, T.tanque).deco(22, 1, T.tanque);
  e.deco(14, 10, T.poste).deco(27, 10, T.poste);
  // Huertas y decorados del claro
  for (const [x, y] of [
    [8, 15],
    [9, 15],
    [10, 15],
    [8, 16],
    [9, 16],
    [10, 16],
  ] as const)
    e.deco(x, y, T.huerta, false);
  for (const [x, y] of [
    [26, 16],
    [27, 16],
    [28, 16],
    [26, 17],
    [27, 17],
    [28, 17],
  ] as const)
    e.deco(x, y, T.huerta, false);
  e.deco(31, 18, T.margarita, false)
    .deco(7, 18, T.margarita, false)
    .deco(24, 19, T.margarita, false);
  e.deco(4, 11, T.arbusto).deco(16, 17, T.arbusto).deco(30, 15, T.arbusto).deco(12, 19, T.arbusto);
  e.deco(2, 14, T.cartel);
  // Muelle largo hacia el sur
  e.groundRect(19, 22, 22, 27, T.muelle).solidRect(19, 22, 22, 27, false);
  e.ground(19, 28, T.muelleBorde)
    .ground(20, 28, T.muelleBorde)
    .ground(21, 28, T.muelleBorde)
    .ground(22, 28, T.muelleBorde);
  e.deco(24, 25, T.canoa).deco(16, 26, T.canoa);
  e.deco(17, 22, T.red, false);
  e.atril('atril-estacion', 23, 14);
  // Objetos
  e.spawn('inicio', 20, 11)
    .spawn('desde-laboratorio', 11, 10)
    .spawn('desde-herbario', 28, 10)
    .spawn('atril', 22, 15)
    .npc('npc-nepomuceno', 25, 15, 'nepomuceno', 'ep00-nepomuceno', 'izquierda')
    .npc('npc-estudiante-a', 8, 14, 'estudiante', 'ep00-estudiante-a', 'derecha')
    .npc('npc-estudiante-b', 30, 11, 'estudiante-2', 'ep00-estudiante-b', 'abajo')
    .npc('npc-casimiro', 16, 15, 'casimiro', 'ep00-casimiro', 'abajo')
    .npc('npc-eladio', 23, 26, 'eladio', 'ep00-eladio', 'izquierda')
    .folio('folio-cp1', 5, 17, 'cp-1')
    .folio('folio-cp4', 33, 16, 'cp-4')
    .folio('folio-cp14', 14, 22, 'cp-14')
    .letrero(
      'letrero-laboratorio',
      13,
      10,
      'Laboratorio: sala de audiencias, oficina de la Rectora y, abajo, la bóveda.',
    )
    .letrero('letrero-herbario', 30, 10, 'Herbario de Nepomuceno. Se riega por turnos.')
    .letrero('letrero-muelle', 18, 21, 'Muelle. Eladio sale a Altamar antes del mediodía.')
    .door('puerta-laboratorio', 11, 9, 'laboratorio', 'entrada')
    .door('puerta-herbario', 28, 9, 'herbario', 'entrada')
    .trigger('trigger-muelle-final', 19, 26, 4, 2, 'ep00-muelle-final')
    .trigger('trigger-claro', 18, 14, 6, 2, 'ep00-primer-paso');

  // ------------------------------------------------------------ Laboratorio (interior)
  const l = new MapBuilder(26, 18, T.piso, 'cienaga');
  l.props = {
    region: 'cienaga',
    nombre: 'Laboratorio de la Biblioteca',
    musica: 'biblioteca',
    interior: 'true',
  };
  l.border(T.muro);
  // Sala de audiencias (izquierda): bancas y atril
  for (const y of [5, 7, 9, 11])
    l.deco(3, y, T.banca).deco(4, y, T.banca).deco(6, y, T.banca).deco(7, y, T.banca);
  l.deco(5, 2, T.atril);
  l.deco(9, 3, T.estante).deco(9, 4, T.estante).deco(9, 5, T.estante);
  // Tabique central con puerta
  for (let y = 1; y < 17; y++) if (y !== 8 && y !== 9) l.alto(13, y, T.muro);
  // Oficina de la rectora (derecha): escritorio, estantes, ventana
  l.deco(18, 4, T.mesa).deco(19, 4, T.mesa);
  l.deco(16, 1, T.estante)
    .deco(17, 1, T.estante)
    .deco(20, 1, T.estante)
    .deco(21, 1, T.estante)
    .deco(23, 1, T.estante);
  l.deco(15, 8, T.silla, false).deco(22, 8, T.silla, false);
  l.deco(24, 12, T.r49, false); // tanque de cría (ciénaga r49)
  l.ground(11, 17, T.puerta).solid(11, 17, false);
  l.decoAlta[17 * 26 + 11] = 0;
  // Escalera a la bóveda (esquina inferior izquierda de la sala de audiencias)
  l.ground(2, 15, T.escalera).ground(2, 16, T.escalera);
  l.spawn('entrada', 11, 15)
    .spawn('desde-boveda', 3, 15)
    .npc('npc-clemencia', 18, 6, 'clemencia', 'ep00-clemencia', 'abajo')
    .folio('folio-cp29', 3, 12, 'cp-29')
    .door('salida', 11, 17, 'estacion', 'desde-laboratorio')
    .letrero('letrero-boveda', 4, 16, 'Bóveda. Los libros de la ley, desde el Año 0.')
    .door('escalera-boveda', 2, 16, 'boveda', 'entrada')
    .trigger('trigger-oficina', 14, 8, 1, 2, 'ep00-entra-oficina');

  // ------------------------------------------------------------ La bóveda (sótano de la estación)
  const b = new MapBuilder(24, 14, T.piso, 'cienaga');
  b.props = { region: 'cienaga', nombre: 'La bóveda', musica: 'biblioteca', interior: 'true' };
  b.border(T.muro);
  // Estantes en filas: la colección jurídica
  for (const y of [3, 6, 9]) for (let x = 3; x <= 12; x++) if (x !== 8) b.deco(x, y, T.estante);
  b.deco(15, 3, T.estante).deco(16, 3, T.estante).deco(15, 4, T.estante).deco(16, 4, T.estante);
  // Mesa de trabajo con la tarjeta del juramento; tanque de sal para secar páginas
  b.deco(18, 8, T.mesa).deco(19, 8, T.mesa);
  b.deco(17, 8, T.silla, false).deco(20, 8, T.silla, false);
  b.deco(20, 11, T.barril).deco(21, 11, T.barril).deco(15, 11, T.tanque);
  b.deco(3, 11, T.escombro);
  // Escalera de vuelta al laboratorio
  b.ground(21, 1, T.escalera).ground(22, 1, T.escalera);
  b.atril('atril-boveda', 12, 12);
  b.spawn('entrada', 21, 2)
    .spawn('atril', 12, 11)
    .evidence('ev-juramento', 19, 9, 'ep00-juramento')
    .folio('folio-cp2', 8, 6, 'cp-2')
    .door('escalera-laboratorio', 22, 1, 'laboratorio', 'desde-boveda')
    .trigger('trigger-boveda', 18, 2, 4, 2, 'ep00-entra-boveda');

  // ------------------------------------------------------------ Herbario (interior)
  const h = new MapBuilder(22, 14, T.piso, 'cienaga');
  h.props = { region: 'cienaga', nombre: 'Herbario', musica: 'biblioteca', interior: 'true' };
  h.border(T.muro);
  for (let x = 3; x <= 18; x += 5)
    h.deco(x, 3, T.r48)
      .deco(x + 1, 3, T.r48)
      .deco(x, 8, T.r48)
      .deco(x + 1, 8, T.r48);
  h.deco(20, 5, T.r56).deco(20, 6, T.r56);
  h.deco(2, 11, T.r50, false);
  h.ground(11, 13, T.puerta).solid(11, 13, false);
  h.decoAlta[13 * 22 + 11] = 0;
  h.mesa('mesa-herbario', 10, 6, 'ep00-pacto');
  h.spawn('entrada', 11, 11)
    .npc('npc-nepomuceno-herbario', 8, 6, 'nepomuceno', 'ep00-nepomuceno-herbario', 'derecha')
    .door('salida', 11, 13, 'estacion', 'desde-herbario');

  return { estacion: e, laboratorio: l, boveda: b, herbario: h };
}
