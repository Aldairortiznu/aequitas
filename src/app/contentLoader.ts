import { validateContent } from '../core/content/validate';
import type { RawContent, RawEpisode, ValidatedEpisode } from '../core/content/validate';
import type { CodiceEntry, ContentIndex, Personaje } from '../core/content/schema';

/**
 * Carga perezosa de contenido con Vite. Cada JSON de `content/` es un módulo que se importa
 * bajo demanda; el validador (lógica pura) lo tipa antes de entregarlo al juego.
 */
const modules = import.meta.glob('/content/**/*.json', { import: 'default' }) as Record<
  string,
  () => Promise<unknown>
>;

export interface LoadedContent {
  index: ContentIndex;
  personajes: Personaje[];
  codice: Record<string, CodiceEntry>;
}

export class ContentLoadError extends Error {
  constructor(
    message: string,
    public readonly issues: string[],
  ) {
    super(message);
    this.name = 'ContentLoadError';
  }
}

let globalCache: Promise<LoadedContent> | null = null;
const episodeCache = new Map<string, Promise<ValidatedEpisode>>();

function pathsUnder(prefix: string): string[] {
  return Object.keys(modules)
    .filter((p) => p.startsWith(prefix))
    .sort();
}

async function loadJson(path: string): Promise<unknown> {
  const loader = modules[path];
  if (!loader) throw new ContentLoadError(`No existe el archivo de contenido ${path}`, []);
  return loader();
}

async function loadDir(prefix: string): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const p of pathsUnder(prefix)) {
    out[p.slice(prefix.length)] = await loadJson(p);
  }
  return out;
}

async function loadRawEpisode(id: string): Promise<RawEpisode> {
  const base = `/content/${id}/`;
  const has = (p: string): boolean => Boolean(modules[p]);
  return {
    id,
    manifest: await loadJson(`${base}manifest.json`),
    dialogues: await loadDir(`${base}dialogues/`),
    evidence: has(`${base}evidence.json`) ? await loadJson(`${base}evidence.json`) : [],
    audiencias: await loadDir(`${base}audiencias/`),
    pactos: await loadDir(`${base}pactos/`),
    consultas: has(`${base}consultas.json`) ? await loadJson(`${base}consultas.json`) : [],
    cutscenes: await loadDir(`${base}cutscenes/`),
    maps: await loadDir(`${base}maps/`),
  };
}

async function loadRawGlobal(): Promise<Omit<RawContent, 'episodes'>> {
  return {
    index: await loadJson('/content/index.json'),
    personajes: await loadJson('/content/personajes.json'),
    codice: await loadDir('/content/codice/'),
  };
}

function throwIfErrors(result: ReturnType<typeof validateContent>, what: string): void {
  const errors = result.issues
    .filter((i) => i.severity === 'error')
    .map((i) => `${i.where}: ${i.message}`);
  if (errors.length) {
    console.error(`Contenido inválido (${what}):\n` + errors.join('\n'));
    throw new ContentLoadError(`Contenido inválido: ${what}`, errors);
  }
}

/** Índice, personajes y Códice completo. Se cachea. */
export function loadGlobalContent(): Promise<LoadedContent> {
  if (!globalCache) {
    globalCache = (async () => {
      const raw = await loadRawGlobal();
      // Validación del índice y del Códice sin episodios (los episodios se validan al cargarse).
      const result = validateContent({ ...raw, episodes: [] });
      // Con episodios vacíos el índice reporta «sin carpeta»; filtramos ese caso concreto.
      const relevant = result.issues.filter(
        (i) => i.severity === 'error' && !i.message.includes('sin carpeta content/'),
      );
      if (relevant.length) {
        console.error(
          'Contenido global inválido:\n' +
            relevant.map((i) => `${i.where}: ${i.message}`).join('\n'),
        );
        throw new ContentLoadError(
          'Contenido global inválido',
          relevant.map((i) => i.message),
        );
      }
      if (!result.index || !result.personajes || !result.codice)
        throw new ContentLoadError('Contenido global incompleto', []);
      return { index: result.index, personajes: result.personajes, codice: result.codice };
    })();
  }
  return globalCache;
}

/** Carga y valida un episodio completo (con el contexto global para referencias cruzadas). */
export function loadEpisode(id: string): Promise<ValidatedEpisode> {
  let p = episodeCache.get(id);
  if (!p) {
    p = (async () => {
      const [global, rawEp] = await Promise.all([loadRawGlobal(), loadRawEpisode(id)]);
      // Para validar referencias a evidencias de otros episodios (Ep. 7) cargamos también los anteriores ya listados.
      const index = global.index as { episodes?: { id: string }[] };
      const previos: RawEpisode[] = [];
      for (const e of index.episodes ?? []) {
        if (e.id === id) break;
        if (modules[`/content/${e.id}/manifest.json`]) previos.push(await loadRawEpisode(e.id));
      }
      const result = validateContent({ ...global, episodes: [...previos, rawEp] });
      const onlyThis = {
        ...result,
        issues: result.issues.filter((i) => !i.message.includes('sin carpeta content/')),
      };
      throwIfErrors(onlyThis, id);
      const ep = result.episodes[id];
      if (!ep) throw new ContentLoadError(`El episodio ${id} no se pudo validar`, []);
      return ep;
    })();
    episodeCache.set(id, p);
  }
  return p;
}

/** Solo para pruebas y herramientas. */
export function resetContentCache(): void {
  globalCache = null;
  episodeCache.clear();
}
