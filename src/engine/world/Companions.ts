import Phaser from 'phaser';
import { BALANCE } from '../../core/balance';
import { bakeCharacter } from '../art/provisional';

/**
 * Compañeros en fila india: siguen el rastro del jugador (posiciones registradas cada
 * pocos píxeles). No usan física: el rastro ya es transitable.
 */
interface TrailPoint {
  x: number;
  y: number;
  dir: string;
}

export class Companions {
  private sprites: Phaser.GameObjects.Sprite[] = [];
  private trail: TrailPoint[] = [];
  private lastX = 0;
  private lastY = 0;
  private readonly spacing = BALANCE.mundo.distanciaCompanero;
  private readonly step = 3;

  constructor(
    private scene: Phaser.Scene,
    ids: string[],
    startX: number,
    startY: number,
  ) {
    this.lastX = startX;
    this.lastY = startY;
    for (let i = 0; i < 60; i++) this.trail.push({ x: startX, y: startY, dir: 'down' });
    ids.forEach((id) => {
      const key = bakeCharacter(scene, id);
      const s = scene.add.sprite(startX, startY, key, 'down-0').setOrigin(0.5, 1);
      s.setData('id', id);
      this.sprites.push(s);
    });
  }

  get list(): Phaser.GameObjects.Sprite[] {
    return this.sprites;
  }

  update(px: number, py: number, dir: string, moving: boolean): void {
    const d = Phaser.Math.Distance.Between(px, py, this.lastX, this.lastY);
    if (d >= this.step) {
      const steps = Math.floor(d / this.step);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        this.trail.unshift({
          x: Phaser.Math.Linear(this.lastX, px, t),
          y: Phaser.Math.Linear(this.lastY, py, t),
          dir,
        });
      }
      this.lastX = px;
      this.lastY = py;
      const maxLen = Math.ceil(((this.sprites.length + 1) * this.spacing) / this.step) + 4;
      if (this.trail.length > maxLen) this.trail.length = maxLen;
    }
    this.sprites.forEach((s, i) => {
      const idx = Math.min(this.trail.length - 1, Math.round(((i + 1) * this.spacing) / this.step));
      const p = this.trail[idx];
      if (!p) return;
      const wasMoving = Math.abs(s.x - p.x) + Math.abs(s.y - p.y) > 0.5;
      s.setPosition(p.x, p.y);
      s.setDepth(p.y);
      const key = s.texture.key;
      const anim = moving && wasMoving ? `${key}-walk-${p.dir}` : `${key}-idle-${p.dir}`;
      if (s.anims.currentAnim?.key !== anim) s.play(anim, true);
    });
  }

  /** Recoloca a todos junto al jugador (tras un teletransporte). */
  reset(px: number, py: number): void {
    this.lastX = px;
    this.lastY = py;
    this.trail = [];
    for (let i = 0; i < 60; i++) this.trail.push({ x: px, y: py, dir: 'down' });
    this.sprites.forEach((s) => s.setPosition(px, py));
  }

  /** Compañero más cercano al punto, dentro de un radio. */
  nearest(x: number, y: number, radius: number): string | null {
    let best: { id: string; d: number } | null = null;
    for (const s of this.sprites) {
      const d = Phaser.Math.Distance.Between(x, y, s.x, s.y - 8);
      if (d <= radius && (!best || d < best.d)) best = { id: s.getData('id') as string, d };
    }
    return best?.id ?? null;
  }
}
