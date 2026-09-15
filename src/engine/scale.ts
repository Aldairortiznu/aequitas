import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

/**
 * Escalado del canvas: entero cuando cabe al menos 2x (2x, 3x, 4x) para píxel limpio;
 * fraccionario en pantallas pequeñas (teléfonos), donde entre 1x y 2x el píxel exacto
 * dejaría dos tercios de la pantalla en negro.
 */
export function computeZoom(viewportWidth: number, viewportHeight: number): number {
  const raw = Math.min(viewportWidth / GAME_WIDTH, viewportHeight / GAME_HEIGHT);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return raw >= 2 ? Math.floor(raw) : Math.max(0.25, Math.floor(raw * 100) / 100);
}

export function applyIntegerScaling(game: Phaser.Game): () => void {
  const parent = document.getElementById('game');
  const fit = (): void => {
    const w = parent?.clientWidth ?? window.innerWidth;
    const h = parent?.clientHeight ?? window.innerHeight;
    game.scale.setZoom(computeZoom(w, h));
  };
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  return () => {
    window.removeEventListener('resize', fit);
    window.removeEventListener('orientationchange', fit);
  };
}
