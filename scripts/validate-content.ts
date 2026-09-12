import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readContentDir } from './content-fs';
import { validateContent } from '../src/core/content/validate';

/**
 * Valida todos los paquetes de contenido (esquemas y referencias cruzadas).
 * Uso: npm run validate:content  |  npx tsx scripts/validate-content.ts [--quiet]
 * Sale con código 1 si hay errores. Las advertencias no bloquean.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const quiet = process.argv.includes('--quiet');

const result = validateContent(readContentDir(root));
const errors = result.issues.filter((i) => i.severity === 'error');
const warns = result.issues.filter((i) => i.severity === 'warn');

for (const i of result.issues) {
  if (quiet && i.severity === 'warn') continue;
  const tag = i.severity === 'error' ? 'ERROR' : 'aviso';
  console.log(`${tag}  ${i.where}\n       ${i.message}`);
}

const episodios = Object.keys(result.episodes);
console.log(
  `\nContenido: ${episodios.length} episodio(s) [${episodios.join(', ')}] · ` +
    `${Object.keys(result.codice ?? {}).length} entradas del Códice · ` +
    `${errors.length} error(es) · ${warns.length} aviso(s)`,
);

process.exit(errors.length ? 1 : 0);
