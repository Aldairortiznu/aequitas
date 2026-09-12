import type { MapBuilder } from './maps/lib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeMaps } from './maps/lib';
import { gymMaps } from './maps/gym';
import { ep00Maps } from './maps/ep00';
import { ep01Maps } from './maps/ep01';

/**
 * Regenera todos los mapas construidos por código.
 * Uso: npm run gen:maps [gym|ep00|ep01]
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const only = process.argv[2];
const all: Record<string, () => Record<string, MapBuilder>> = {
  gym: gymMaps,
  ep00: ep00Maps,
  ep01: ep01Maps,
};
for (const [ep, fn] of Object.entries(all)) {
  if (only && only !== ep) continue;
  writeMaps(join(root, ep, 'maps'), fn());
  console.log(`mapas de ${ep} generados`);
}
