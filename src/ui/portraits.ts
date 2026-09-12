import type Phaser from 'phaser';
import { hasPortrait, url } from '../engine/art/registry';

/**
 * Retratos para la capa DOM: archivo real si existe (por URL); si no, un retrato
 * provisional generado a partir del sprite del personaje (cuadro frontal ampliado).
 */
const cache = new Map<string, string>();

export function portraitSrc(
  game: Phaser.Game | null,
  id: string,
  expresion = 'neutra',
): string | null {
  if (hasPortrait(id, expresion)) return url.portrait(id, expresion);
  if (hasPortrait(id, 'neutra')) return url.portrait(id, 'neutra');
  const key = `prov-${id}`;
  const cached = cache.get(key);
  if (cached) return cached;
  if (!game) return null;
  const texKey = `char-${id}`;
  if (!game.textures.exists(texKey)) return null;
  const tex = game.textures.get(texKey);
  const frame = tex.get('down-0');
  const source = tex.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#2e2d33';
  ctx.fillRect(0, 0, 96, 96);
  // Solo cabeza y torso (16×14 de la parte superior del cuadro), a 5×.
  const sx = frame.cutX;
  const sy = frame.cutY;
  ctx.drawImage(source, sx, sy, 16, 15, 8, 12, 80, 75);
  const data = canvas.toDataURL('image/png');
  cache.set(key, data);
  return data;
}
