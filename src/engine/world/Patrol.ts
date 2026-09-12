import type Phaser from 'phaser';
import { BALANCE } from '../../core/balance';
import { bakeCharacter } from '../art/provisional';
import type { WorldObject } from './objects';

export type PatrolRank = 'alguacil' | 'alguacil-mayor' | 'capitan';

/**
 * Alguacil que recorre una polilínea y detecta al jugador dentro de un cono de visión.
 * Sin física: sigue su ruta. Emite `detectado` una vez y se detiene hasta `resume()`.
 */
export class Patrol {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly name: string;
  readonly rank: PatrolRank;
  readonly articulo: string | undefined;
  private points: { x: number; y: number }[];
  private index = 1;
  private forward = true;
  private paused = false;
  private interpelada = false;
  private facing = { x: 0, y: 1 };
  private cone: Phaser.GameObjects.Graphics | null = null;
  private eye: Phaser.GameObjects.Image;

  constructor(
    private scene: Phaser.Scene,
    obj: WorldObject,
    private onDetect: (p: Patrol) => void,
    debug = false,
  ) {
    this.name = obj.name;
    this.rank = (obj.props.rango as PatrolRank | undefined) ?? 'alguacil';
    this.articulo = obj.props.articulo;
    this.points =
      obj.polyline && obj.polyline.length >= 2
        ? obj.polyline
        : [
            { x: obj.cx, y: obj.cy },
            { x: obj.cx + 32, y: obj.cy },
          ];
    const key = bakeCharacter(scene, 'alguacil');
    const p0 = this.points[0]!;
    this.sprite = scene.add.sprite(p0.x, p0.y, key, 'down-0').setOrigin(0.5, 1);
    this.eye = scene.add
      .image(p0.x, p0.y - 30, 'icon-ojo')
      .setVisible(false)
      .setDepth(20000);
    if (debug) this.cone = scene.add.graphics().setDepth(19999);
  }

  get interpelado(): boolean {
    return this.interpelada;
  }

  /** La patrulla queda neutralizada hasta que el jugador cambie de mapa. */
  markInterpelada(): void {
    this.interpelada = true;
    this.paused = false;
    this.eye.setVisible(false);
    this.sprite.setAlpha(0.7);
  }

  resume(): void {
    this.paused = false;
    this.eye.setVisible(false);
  }

  update(delta: number, playerX: number, playerY: number, playerHidden: boolean): void {
    const s = this.sprite;
    const key = s.texture.key;
    if (this.paused) {
      s.play(`${key}-idle-${this.dirName()}`, true);
      return;
    }
    const target = this.points[this.index]!;
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const dist = Math.hypot(dx, dy);
    const speed = (BALANCE.mundo.velocidadPatrulla * delta) / 1000;
    if (dist <= speed) {
      s.setPosition(target.x, target.y);
      if (this.forward) {
        if (this.index >= this.points.length - 1) this.forward = false;
        else this.index++;
      } else {
        if (this.index <= 0) this.forward = true;
        else this.index--;
      }
      if (!this.forward && this.index > 0) this.index--;
      else if (
        this.forward &&
        this.index < this.points.length - 1 &&
        dist <= speed &&
        this.index === 0
      )
        this.index = 1;
    } else {
      this.facing = { x: dx / dist, y: dy / dist };
      s.setPosition(s.x + this.facing.x * speed, s.y + this.facing.y * speed);
    }
    s.setDepth(s.y);
    s.play(`${key}-walk-${this.dirName()}`, true);
    this.eye.setPosition(s.x, s.y - 30);

    if (this.cone) this.drawCone();

    if (this.interpelada || playerHidden) return;
    const vx = playerX - s.x;
    const vy = playerY - 8 - (s.y - 12);
    const d = Math.hypot(vx, vy);
    if (d > BALANCE.mundo.conoVisionDistancia) return;
    const cos = (vx * this.facing.x + vy * this.facing.y) / (d || 1);
    const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
    if (angle <= BALANCE.mundo.conoVisionGrados / 2 || d < 14) {
      this.paused = true;
      this.eye.setVisible(true);
      this.onDetect(this);
    }
  }

  private dirName(): string {
    const { x, y } = this.facing;
    if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
    return y > 0 ? 'down' : 'up';
  }

  private drawCone(): void {
    if (!this.cone) return;
    const g = this.cone;
    g.clear();
    g.fillStyle(0xe2b94a, 0.12);
    const s = this.sprite;
    const base = Math.atan2(this.facing.y, this.facing.x);
    const half = (BALANCE.mundo.conoVisionGrados / 2) * (Math.PI / 180);
    g.slice(s.x, s.y - 12, BALANCE.mundo.conoVisionDistancia, base - half, base + half, false);
    g.fillPath();
  }

  destroy(): void {
    this.sprite.destroy();
    this.eye.destroy();
    this.cone?.destroy();
  }
}
