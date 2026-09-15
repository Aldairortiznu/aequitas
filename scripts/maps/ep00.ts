import { T } from './lib';
import { FILA_SUELO, Franja } from './lateral';

/**
 * Prólogo · La estación de la Biblioteca en la ciénaga, en vista lateral (D15). Cuatro
 * franjas: la estación (exterior, entre mangles, con el laboratorio y el herbario como
 * fachadas y el muelle al final), el laboratorio (sala de audiencias y oficina de la
 * Rectora), la bóveda (bajo el laboratorio) y el herbario. Los nombres de objetos y puntos
 * de aparición son los que usa el contenido: no cambian.
 */
export function ep00Maps(): Record<string, Franja> {
  const F = FILA_SUELO;
  const P = F - 1;

  // ------------------------------------------------------------ Estación (96 × 17, exterior)
  const e = new Franja(96, 17, 'cienaga', {
    region: 'cienaga',
    nombre: 'Estación de la ciénaga',
    musica: 'cienaga',
  });
  e.terreno(F, T.suelo, T.muro);
  // Ciénaga a la izquierda y al final del muelle
  e.agua(0, 3, F);
  e.agua(90, 95, F);
  // El muelle: tablones sobre el agua
  for (let x = 84; x <= 89; x++) e.deco(x, F, T.muelle, true);
  e.planta(90, F, T.canoa).planta(93, F, T.canoa).planta(88, P, T.red);
  // Mangles en la orilla y por el camino
  for (const x of [4, 9, 27, 58, 75, 82]) {
    e.planta(x, P, T.tronco)
      .planta(x, P - 1, T.copaIzq)
      .planta(x + 1, P - 1, T.copaDer);
  }
  // Laboratorio: fachada con techo de zinc, paneles solares y puerta
  const fachada = (x0: number, x1: number, techo: number): void => {
    e.pared(x0 + 1, techo + 1, x1 - 1, P, T.muro);
    e.muro(x0, techo + 1, P).muro(x1, techo + 1, P);
    e.losa(x0, x1, techo, T.r63);
    for (let x = x0 + 2; x < x1 - 1; x += 4) e.planta(x, techo + 2, T.ventana);
  };
  fachada(10, 24, 6);
  for (const x of [12, 14, 16]) e.planta(x, 5, T.panelSolar);
  e.planta(20, 5, T.tanque);
  e.puerta('puerta-laboratorio', 17, P, 'laboratorio', 'entrada');
  e.cartel(
    'letrero-laboratorio',
    15,
    P - 1,
    'Laboratorio: sala de audiencias, oficina de la Rectora y, abajo, la bóveda.',
  );
  // Herbario: fachada de cristal
  fachada(60, 72, 7);
  for (let x = 62; x <= 70; x += 2) e.planta(x, 8, T.ventana);
  e.planta(66, 6, T.tanque);
  e.puerta('puerta-herbario', 66, P, 'herbario', 'entrada');
  e.cartel('letrero-herbario', 64, P - 1, 'Herbario de Nepomuceno. Se riega por turnos.');
  // El claro: atril, bancas, postes, barriles
  e.planta(30, P, T.poste)
    .planta(30, P - 1, T.poste)
    .planta(52, P, T.poste)
    .planta(52, P - 1, T.poste);
  e.planta(38, P, T.banca).planta(39, P, T.banca).planta(25, P, T.barril).planta(26, P, T.barril);
  e.planta(48, P, T.escombro);
  // Huertas con cerca (crecen con el estado)
  for (let x = 74; x <= 81; x++) e.planta(x, P, T.cerca);
  for (const x of [75, 77, 79]) e.decoEn('brote', x, P - 1, T.huerta);
  for (const x of [75, 76, 77, 78, 79, 80]) e.decoEn('verdor', x, P - 1, T.huerta);
  for (const x of [74, 76, 78, 80]) e.decoEn('floracion', x, P - 1, T.margarita);
  e.maleza(5, 9, P, 2, 3).maleza(26, 29, P, 2, 7).maleza(53, 59, P, 2, 11);
  for (const x of [8, 34, 44, 56, 83]) e.decoEn('floracion', x, P, T.margarita);
  e.cartel('letrero-muelle', 83, P - 1, 'Muelle. Eladio sale a Altamar antes del mediodía.');
  e.atril('atril-estacion', 33, P);
  e.spawn('inicio', 40, P)
    .spawn('desde-laboratorio', 18, P)
    .spawn('desde-herbario', 67, P)
    .spawn('atril', 34, P)
    .npc('npc-nepomuceno', 36, P, 'nepomuceno', 'ep00-nepomuceno', 'derecha')
    .npc('npc-estudiante-a', 28, P, 'estudiante', 'ep00-estudiante-a', 'derecha')
    .npc('npc-estudiante-b', 56, P, 'estudiante-2', 'ep00-estudiante-b', 'izquierda')
    .npc('npc-casimiro', 50, P, 'casimiro', 'ep00-casimiro', 'izquierda')
    .npc('npc-eladio', 86, P, 'eladio', 'ep00-eladio', 'izquierda')
    .folio('folio-cp1', 7, P, 'cp-1')
    .folio('folio-cp4', 78, P, 'cp-4')
    .folio('folio-cp14', 54, P, 'cp-14')
    .trigger('trigger-claro', 42, P, 6, 1, 'ep00-primer-paso')
    .trigger('trigger-muelle-final', 86, P, 4, 1, 'ep00-muelle-final');

  // ------------------------------------------------------------ Laboratorio (44 × 17)
  const l = new Franja(44, 17, 'cienaga', {
    region: 'cienaga',
    nombre: 'Laboratorio de la Biblioteca',
    musica: 'biblioteca',
    interior: 'true',
  });
  l.terreno(F, T.piso, T.muro);
  l.losa(0, 43, 4, T.muro);
  l.muro(0, 5, F - 1).muro(43, 5, F - 1);
  // Sala de audiencias: bancas, atril de la sala y estantes
  for (const x of [5, 6, 8, 9, 11, 12]) l.planta(x, P, T.banca);
  l.planta(14, P, T.atril);
  for (const x of [16, 17]) l.planta(x, P - 1, T.estante).planta(x, P, T.estante);
  l.planta(24, P, T.r49); // tanque de cría
  for (const x of [7, 19, 33]) l.planta(x, 8, T.ventana);
  // Oficina de la Rectora: tabique con paso a ras de suelo
  l.muro(28, 5, P - 2);
  l.planta(28, P - 1, T.puerta).planta(28, P, T.puerta);
  l.planta(36, P, T.mesa).planta(37, P, T.mesa);
  for (const x of [39, 40, 41]) l.planta(x, P - 1, T.estante).planta(x, P, T.estante);
  l.planta(31, P, T.silla).planta(35, P, T.silla);
  for (const x of [22, 30]) l.decoEn('verdor', x, P, T.arbusto);
  for (const x of [10, 25, 38]) l.decoEn('floracion', x, P, T.margarita);
  // La bóveda: escalera que baja, a la izquierda
  l.cartel('letrero-boveda', 4, P - 1, 'Bóveda. Los libros de la ley, desde el Año 0.');
  l.puerta('escalera-boveda', 2, P, 'boveda', 'entrada');
  l.puerta('salida', 20, P, 'estacion', 'desde-laboratorio');
  l.spawn('entrada', 21, P)
    .spawn('desde-boveda', 3, P)
    .npc('npc-clemencia', 34, P, 'clemencia', 'ep00-clemencia', 'izquierda')
    .folio('folio-cp29', 6, P, 'cp-29')
    .trigger('trigger-oficina', 29, P, 2, 1, 'ep00-entra-oficina');

  // ------------------------------------------------------------ Bóveda (40 × 17)
  const b = new Franja(40, 17, 'cienaga', {
    region: 'cienaga',
    nombre: 'La bóveda',
    musica: 'biblioteca',
    interior: 'true',
  });
  b.terreno(F, T.piso, T.muro);
  b.losa(0, 39, 4, T.muro);
  b.muro(0, 5, F - 1).muro(39, 5, F - 1);
  // Estanterías del Año 0 en tres alturas, con pasos
  for (let x = 4; x <= 17; x++) {
    if (x === 8 || x === 13) continue;
    b.planta(x, P - 2, T.estante)
      .planta(x, P - 1, T.estante)
      .planta(x, P, T.estante);
  }
  for (const x of [12, 20, 28]) b.planta(x, P - 3, T.poste);
  b.planta(22, P, T.mesa).planta(23, P, T.mesa).planta(21, P, T.silla).planta(24, P, T.silla);
  b.planta(30, P, T.barril).planta(31, P, T.tanque).planta(3, P, T.escombro);
  b.planta(19, 7, T.enredadera).planta(33, 8, T.enredadera);
  b.atril('atril-boveda', 26, P);
  b.puerta('escalera-laboratorio', 37, P, 'laboratorio', 'desde-boveda');
  b.spawn('entrada', 36, P)
    .spawn('atril', 27, P)
    .evidence('ev-juramento', 22, P - 1, 'ep00-juramento')
    .folio('folio-cp2', 8, P, 'cp-2')
    .trigger('trigger-boveda', 32, P, 4, 1, 'ep00-entra-boveda');

  // ------------------------------------------------------------ Herbario (36 × 17)
  const h = new Franja(36, 17, 'cienaga', {
    region: 'cienaga',
    nombre: 'Herbario',
    musica: 'biblioteca',
    interior: 'true',
  });
  h.terreno(F, T.piso, T.muro);
  h.losa(0, 35, 4, T.muro);
  h.muro(0, 5, F - 1).muro(35, 5, F - 1);
  for (let x = 2; x <= 33; x += 2) h.planta(x, 5, T.ventana); // claraboya
  for (const x of [4, 5, 10, 11, 22, 23, 28, 29]) h.planta(x, P, T.r48); // canteros
  for (const x of [4, 10, 22, 28]) h.decoEn('brote', x, P - 1, T.huerta);
  for (const x of [5, 11, 23, 29]) h.decoEn('verdor', x, P - 1, T.huerta);
  for (const x of [4, 11, 22, 29]) h.decoEn('floracion', x, P - 1, T.margarita);
  h.planta(32, 10, T.r56)
    .planta(32, 11, T.r56)
    .planta(3, P - 1, T.r50);
  h.planta(7, 8, T.enredadera).planta(26, 8, T.enredadera).planta(31, 9, T.enredadera);
  h.mesa('mesa-herbario', 16, P, 'ep00-pacto');
  h.puerta('salida', 18, P, 'estacion', 'desde-herbario');
  h.spawn('entrada', 19, P).npc(
    'npc-nepomuceno-herbario',
    14,
    P,
    'nepomuceno',
    'ep00-nepomuceno-herbario',
    'derecha',
  );

  return { estacion: e, laboratorio: l, boveda: b, herbario: h };
}
