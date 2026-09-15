import { T } from './lib';
import { FILA_SUELO, Franja } from './lateral';

/**
 * Gimnasio (episodio de pruebas): la plaza y su sótano, en vista lateral (D15). Sirve a las
 * pruebas e2e del mundo (caminar, hablar, recoger, puertas, patrullas) y al playtest de
 * controles.
 */
export function gymMaps(): Record<string, Franja> {
  const F = FILA_SUELO;
  const P = F - 1;

  const plaza = new Franja(64, 17, 'provisional', {
    region: 'gimnasio',
    nombre: 'Plaza del gimnasio',
    musica: 'gym',
  });
  plaza.terreno(F, T.suelo, T.muro);
  // Canal que cruza la plaza y ciénaga con muelle al final
  for (const x of [40, 41]) plaza.deco(x, F, T.canal, true);
  plaza.agua(58, 63, F);
  for (let x = 52; x <= 57; x++) plaza.deco(x, F, T.muelle, true);
  // Casa del sótano: fachada con puerta
  plaza.pared(9, 7, 15, P, T.muro);
  plaza.muro(8, 7, P).muro(16, 7, P);
  plaza.losa(8, 16, 6, T.muroRemate);
  plaza.planta(10, 9, T.ventana).planta(14, 9, T.ventana);
  plaza.puerta('puerta-sotano', 12, P, 'sotano', 'entrada');
  // Vegetación y bancas
  for (const x of [2, 5, 19, 27, 45, 49]) plaza.planta(x, P, T.arbusto);
  for (const x of [22, 46])
    plaza
      .planta(x, P, T.tronco)
      .planta(x, P - 1, T.copaIzq)
      .planta(x + 1, P - 1, T.copaDer);
  plaza.planta(31, P, T.banca).planta(32, P, T.banca);
  plaza.maleza(50, 56, P, 2, 9);
  for (const x of [4, 25, 43]) plaza.decoEn('floracion', x, P, T.margarita);
  plaza.atril('atril-plaza', 34, P);
  plaza.mesa('mesa-plaza', 38, P, 'gym-pacto');
  plaza
    .spawn('inicio', 30, P)
    .spawn('desde-sotano', 13, P)
    .npc('npc-nepomuceno', 36, P, 'nepomuceno', 'gym-bienvenida')
    .npc('npc-casimiro', 44, P, 'casimiro', 'gym-casimiro', 'izquierda')
    .npc('npc-estudiante', 24, P, 'estudiante', 'gym-estudiante', 'derecha')
    .evidence('ev-acta', 20, P, 'gym-acta-sin-firma')
    .folio('folio-cp4', 48, P, 'cp-4')
    .folio('folio-cp14', 5, P, 'cp-14')
    .trigger('trigger-muelle', 53, P, 4, 1, 'gym-muelle')
    .patrol(
      'patrulla-este',
      [
        [40, P],
        [50, P],
      ],
      'alguacil',
      'cp-28',
    );

  const sotano = new Franja(32, 17, 'provisional', {
    region: 'gimnasio',
    nombre: 'Sótano del gimnasio',
    musica: 'gym',
    interior: 'true',
  });
  sotano.terreno(F, T.piso, T.muro);
  sotano.losa(0, 31, 6, T.muro);
  sotano.muro(0, 7, F - 1).muro(31, 7, F - 1);
  for (const x of [12, 15, 18, 21, 24]) sotano.planta(x, P - 1, T.estante).planta(x, P, T.estante);
  sotano.planta(27, P, T.barril).planta(28, P, T.barril).planta(9, 9, T.enredadera);
  sotano.puerta('puerta-plaza', 4, P, 'plaza', 'desde-sotano');
  sotano
    .spawn('entrada', 5, P)
    .evidence('ev-testimonio', 20, P - 1, 'gym-testimonio-eladio')
    .trigger('trigger-sotano', 7, P, 4, 1, 'gym-entra-sotano');
  return { plaza, sotano };
}
