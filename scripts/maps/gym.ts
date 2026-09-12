import { MapBuilder, T } from './lib';

/** Episodio de prueba: una plaza y un sótano con todos los interactuables. */
export function gymMaps(): Record<string, MapBuilder> {
  const plaza = new MapBuilder(40, 24, T.suelo, 'provisional');
  plaza.props = { region: 'gimnasio', nombre: 'Plaza del gimnasio', musica: 'gym' };
  plaza.path(0, 11, 39, 12).path(19, 0, 20, 23);
  plaza.water(0, 20, 39, 23);
  plaza.groundRect(18, 20, 21, 22, T.muelle).solidRect(18, 20, 21, 22, false);
  for (let y = 0; y < 20; y++) plaza.ground(30, y, T.canal);
  plaza.ground(30, 11, T.camino).ground(30, 12, T.camino);
  plaza.border(T.muro);
  plaza.building(4, 3, 12, 8, T.piso, 8);
  plaza.deco(6, 4, T.estante).deco(10, 4, T.estante);
  for (const [x, y] of [
    [14, 2],
    [16, 5],
    [24, 3],
    [26, 7],
    [35, 4],
    [36, 15],
    [8, 15],
    [12, 17],
    [24, 16],
  ] as const)
    plaza.deco(x, y, T.arbusto);
  for (const [x, y] of [
    [15, 9],
    [33, 9],
    [28, 17],
    [6, 12],
  ] as const)
    plaza.deco(x, y, T.sueloDetalle, false);
  plaza.atril('atril-plaza', 22, 14);
  plaza.mesa('mesa-plaza', 26, 12, 'gym-pacto');
  plaza
    .spawn('inicio', 19, 14)
    .spawn('desde-sotano', 8, 9)
    .npc('npc-nepomuceno', 23, 10, 'nepomuceno', 'gym-bienvenida')
    .npc('npc-casimiro', 27, 13, 'casimiro', 'gym-casimiro', 'izquierda')
    .npc('npc-estudiante', 14, 12, 'estudiante', 'gym-estudiante', 'derecha')
    .evidence('ev-acta', 16, 16, 'gym-acta-sin-firma')
    .folio('folio-cp4', 33, 14, 'cp-4')
    .folio('folio-cp14', 6, 18, 'cp-14')
    .door('puerta-sotano', 8, 8, 'sotano', 'entrada')
    .trigger('trigger-muelle', 18, 20, 4, 1, 'gym-muelle')
    .patrol(
      'patrulla-este',
      [
        [33, 2],
        [33, 16],
        [37, 16],
        [37, 2],
      ],
      'alguacil',
      'cp-28',
    );

  const sotano = new MapBuilder(20, 14, T.piso, 'provisional');
  sotano.props = {
    region: 'gimnasio',
    nombre: 'Sótano del gimnasio',
    musica: 'gym',
    interior: 'true',
  };
  sotano.border(T.muro);
  for (let x = 3; x < 17; x += 3) sotano.deco(x, 2, T.estante);
  sotano.ground(10, 13, T.puerta).solid(10, 13, false);
  sotano.decoAlta[13 * 20 + 10] = 0;
  sotano
    .spawn('entrada', 10, 11)
    .evidence('ev-testimonio', 5, 6, 'gym-testimonio-eladio')
    .door('puerta-plaza', 10, 13, 'plaza', 'desde-sotano')
    .trigger('trigger-sotano', 8, 10, 4, 1, 'gym-entra-sotano');
  return { plaza, sotano };
}
