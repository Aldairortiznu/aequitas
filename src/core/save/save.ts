import type { GameState } from '../state/gameState';
import type { LegitimidadState } from '../legitimidad/legitimidad';

/**
 * Guardado (E8): serialización versionada con migraciones, tres ranuras y código
 * exportable para cambiar de dispositivo sin cuenta. Lógica pura; el almacenamiento
 * (localStorage) se inyecta.
 */

export const SAVE_VERSION = 1;

export interface SaveV1 {
  version: 1;
  slot: number;
  savedAt: string;
  resumen: { episodio: string; mapa: string; nombre: string; dia: number; legitimidad: number };
  state: GameState;
  legitimidad: LegitimidadState;
  actas: Record<string, string>;
}

export type SaveAny = SaveV1;

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const KEY_PREFIX = 'aequitas.save.';
export const KEY_LAST = 'aequitas.lastSlot';

export function buildSave(
  slot: number,
  state: GameState,
  legitimidad: LegitimidadState,
  actas: Record<string, string>,
  now = new Date(),
): SaveV1 {
  const region = Object.entries(state.legitimidad).sort((a, b) => b[1] - a[1])[0];
  return {
    version: 1,
    slot,
    savedAt: now.toISOString(),
    resumen: {
      episodio: state.episode,
      mapa: state.map,
      nombre: state.playerName,
      dia: state.diaDeJuego,
      legitimidad: region?.[1] ?? 0,
    },
    state,
    legitimidad,
    actas,
  };
}

/** Migra cualquier versión anterior a la actual. Lanza si el dato no es un guardado. */
export function migrate(raw: unknown): SaveV1 {
  if (!raw || typeof raw !== 'object') throw new Error('Guardado inválido');
  const r = raw as { version?: number };
  switch (r.version) {
    case 1:
      return raw as SaveV1;
    default:
      throw new Error(`Versión de guardado desconocida: ${String(r.version)}`);
  }
}

export function writeSave(storage: Storage, save: SaveV1): void {
  storage.setItem(KEY_PREFIX + save.slot, JSON.stringify(save));
  storage.setItem(KEY_LAST, String(save.slot));
}

export function readSave(storage: Storage, slot: number): SaveV1 | null {
  const raw = storage.getItem(KEY_PREFIX + slot);
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function listSaves(storage: Storage, slots = [1, 2, 3]): (SaveV1 | null)[] {
  return slots.map((s) => readSave(storage, s));
}

export function lastSlot(storage: Storage): number | null {
  const v = storage.getItem(KEY_LAST);
  return v ? Number(v) : null;
}

export function deleteSave(storage: Storage, slot: number): void {
  storage.removeItem(KEY_PREFIX + slot);
}

// --- Código de exportación ---------------------------------------------------

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function checksum(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Código de texto con prefijo, versión y suma de control. */
export function exportCode(save: SaveV1): string {
  const payload = JSON.stringify({ ...save, slot: 0 });
  const body = toBase64Url(payload);
  return `AEQ1-${checksum(body)}-${body}`;
}

export function importCode(code: string): SaveV1 {
  const m = /^AEQ(\d+)-([0-9a-f]{8})-([A-Za-z0-9_-]+)$/.exec(code.trim());
  if (!m) throw new Error('El código no tiene el formato esperado');
  if (m[2] !== checksum(m[3]!)) throw new Error('El código está dañado (suma de control)');
  return migrate(JSON.parse(fromBase64Url(m[3]!)));
}
