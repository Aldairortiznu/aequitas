import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { RawContent, RawEpisode } from '../src/core/content/validate';

/** Lee todo el directorio `content/` en la estructura que espera el validador. */
export function readContentDir(root: string): RawContent {
  const readJson = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));
  const readDirJson = (dir: string): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    if (!existsSync(dir)) return out;
    for (const f of readdirSync(dir)
      .filter((x) => x.endsWith('.json'))
      .sort()) {
      out[f] = readJson(join(dir, f));
    }
    return out;
  };

  const episodes: RawEpisode[] = [];
  for (const entry of readdirSync(root).sort()) {
    const dir = join(root, entry);
    if (!statSync(dir).isDirectory() || entry === 'codice') continue;
    const manifestPath = join(dir, 'manifest.json');
    if (!existsSync(manifestPath)) continue;
    episodes.push({
      id: entry,
      manifest: readJson(manifestPath),
      dialogues: readDirJson(join(dir, 'dialogues')),
      evidence: existsSync(join(dir, 'evidence.json')) ? readJson(join(dir, 'evidence.json')) : [],
      audiencias: readDirJson(join(dir, 'audiencias')),
      pactos: readDirJson(join(dir, 'pactos')),
      consultas: existsSync(join(dir, 'consultas.json'))
        ? readJson(join(dir, 'consultas.json'))
        : [],
      cutscenes: readDirJson(join(dir, 'cutscenes')),
      maps: readDirJson(join(dir, 'maps')),
    });
  }

  return {
    index: readJson(join(root, 'index.json')),
    personajes: readJson(join(root, 'personajes.json')),
    codice: readDirJson(join(root, 'codice')),
    episodes,
  };
}
