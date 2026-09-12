/**
 * Contrato de activos de arte. Todo archivo real que el juego puede cargar se nombra y
 * dimensiona según estas reglas (docs/arte/GUIA-NANO-BANANA.md). Si un archivo no existe,
 * el motor usa el arte provisional horneado por código sin cambiar ninguna clave.
 *
 * Claves de textura (contrato con el resto del motor):
 *   char-<id>                 hoja de personaje 64×96 (4 columnas × 4 filas de 16×24)
 *   tiles-<tileset>-<estado>  tileset 16 px, 4 columnas, N filas; un archivo por estado
 *   icon-<nombre>             icono pequeño
 *   portrait-<id>-<expresion> retrato 96×96 (lo usa la capa DOM por URL)
 *   lamina-<id>               ilustración 960×540 (cinemáticas)
 */

export const ASSET_BASE = 'assets';

export const SPRITE_FRAME = { width: 16, height: 24, cols: 4, rows: 4 } as const;
export const SPRITE_SHEET = { width: 64, height: 96 } as const;
export const PORTRAIT_SIZE = 96;
export const TILE_PX = 16;
export const TILESET_COLS = 4;
export const LAMINA = { width: 960, height: 540 } as const;

export const EXPRESIONES = ['neutra', 'tensa', 'cordial'] as const;
export const ESTADOS = ['ceniza', 'brote', 'verdor', 'floracion'] as const;
export const ICONOS = ['hablar', 'documento', 'folio', 'testimonio', 'alerta', 'ojo'] as const;
/** Orden de filas de la hoja de personaje. */
export const DIRECCIONES = ['down', 'left', 'right', 'up'] as const;
/** Orden de columnas de la hoja de personaje. */
export const CUADROS = ['quieto', 'paso1', 'quieto', 'paso2'] as const;

export const url = {
  manifest: (): string => `${ASSET_BASE}/manifest.json`,
  sprite: (id: string): string => `${ASSET_BASE}/sprites/${id}.png`,
  tileset: (name: string, estado: string): string => `${ASSET_BASE}/tilesets/${name}-${estado}.png`,
  portrait: (id: string, expresion: string): string =>
    `${ASSET_BASE}/portraits/${id}-${expresion}.png`,
  lamina: (id: string): string => `${ASSET_BASE}/illustrations/${id}.png`,
  icon: (name: string): string => `${ASSET_BASE}/icons/${name}.png`,
  audio: (name: string): string => `${ASSET_BASE}/audio/${name}.ogg`,
};

/** Manifiesto generado por `npm run assets:scan` (public/assets/manifest.json). */
export interface AssetManifest {
  generatedAt: string;
  sprites: string[];
  tilesets: Record<string, string[]>; // tileset -> estados disponibles
  portraits: Record<string, string[]>; // id -> expresiones disponibles
  illustrations: string[];
  icons: string[];
  audio: string[];
}

export const EMPTY_MANIFEST: AssetManifest = {
  generatedAt: '',
  sprites: [],
  tilesets: {},
  portraits: {},
  illustrations: [],
  icons: [],
  audio: [],
};

let manifest: AssetManifest = EMPTY_MANIFEST;
const realKeys = new Set<string>();

export function setManifest(m: AssetManifest): void {
  manifest = m;
}
export function getManifest(): AssetManifest {
  return manifest;
}
export function markReal(key: string): void {
  realKeys.add(key);
}
/** ¿La textura viene de un archivo real (no del arte provisional)? */
export function isReal(key: string): boolean {
  return realKeys.has(key);
}
export function hasPortrait(id: string, expresion: string): boolean {
  return manifest.portraits[id]?.includes(expresion) ?? false;
}
export function hasLamina(id: string): boolean {
  return manifest.illustrations.includes(id);
}
export function hasTileset(name: string, estado: string): boolean {
  return manifest.tilesets[name]?.includes(estado) ?? false;
}
