import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeMaps } from './maps/lib';
import { gymMaps } from './maps/gym';

/** Regenera los mapas del episodio de prueba con el tileset estándar de 64 celdas. */
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'gym', 'maps');
writeMaps(outDir, gymMaps());
console.log('mapas del gimnasio generados en', outDir);
