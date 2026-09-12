import Phaser from 'phaser';
import { CSS, FONTS, GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../../config';
import { bakeCharacter } from '../art/provisional';
import { DIRECCIONES, ESTADOS, ICONOS, getManifest, isReal } from '../art/registry';

export interface GaleriaData {
  sprites: string[];
  tilesets: string[];
}

/**
 * Galería de arte (herramienta de producción): muestra cada personaje en cuatro
 * direcciones animadas, cada tileset por estado y los iconos, marcando qué es arte real
 * y qué es provisional. Se abre con ?escena=galeria. Flechas o rueda para desplazarse.
 */
export class GaleriaScene extends Phaser.Scene {
  private cfg!: GaleriaData;
  private contentHeight = 0;

  constructor() {
    super({ key: 'Galeria' });
  }

  init(data: GaleriaData): void {
    this.cfg = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[1]);
    const label = (
      x: number,
      y: number,
      text: string,
      color: string = CSS.paper,
      size = '8px',
    ): Phaser.GameObjects.Text =>
      this.add.text(x, y, text, { fontFamily: FONTS.mono, fontSize: size, color }).setResolution(2);

    let y = 8;
    label(8, y, 'GALERÍA DE ARTE · real = dorado · provisional = gris', CSS.gold, '9px');
    y += 16;

    // Personajes
    label(8, y, 'Personajes (64×96, 4 direcciones × 4 cuadros)', CSS.muted);
    y += 12;
    const perRow = 7;
    this.cfg.sprites.forEach((id, i) => {
      const key = bakeCharacter(this, id);
      const cx = 8 + (i % perRow) * 66;
      const cy = y + Math.floor(i / perRow) * 62;
      const real = isReal(key);
      label(cx, cy, id, real ? CSS.gold : CSS.muted, '7px');
      DIRECCIONES.forEach((dir, k) => {
        const s = this.add.sprite(cx + 8 + k * 16, cy + 34, key, `${dir}-0`).setOrigin(0.5, 1);
        s.play(`${key}-walk-${dir}`);
      });
      const sheet = this.add
        .image(cx + 4, cy + 38, key)
        .setOrigin(0, 0)
        .setScale(0.5);
      sheet.setAlpha(0.9);
    });
    y += Math.ceil(this.cfg.sprites.length / perRow) * 62 + 8;

    // Tilesets
    label(8, y, 'Tilesets (64 px de ancho, 4 columnas; un archivo por estado)', CSS.muted);
    y += 12;
    const m = getManifest();
    const names = ['provisional', ...this.cfg.tilesets.filter((t) => t !== 'provisional')];
    for (const name of names) {
      const anyReal =
        name !== 'provisional' && ESTADOS.some((e) => this.textures.exists(`tiles-${name}-${e}`));
      if (name !== 'provisional' && !anyReal) continue;
      label(8, y, name, anyReal ? CSS.gold : CSS.muted, '7px');
      let maxH = 0;
      ESTADOS.forEach((estado, k) => {
        const key = this.textures.exists(`tiles-${name}-${estado}`)
          ? `tiles-${name}-${estado}`
          : `tiles-provisional-${estado}`;
        const img = this.add.image(70 + k * 80, y, key).setOrigin(0, 0);
        maxH = Math.max(maxH, img.height);
        label(70 + k * 80, y + img.height + 1, estado, isReal(key) ? CSS.gold : CSS.muted, '6px');
      });
      y += maxH + 14;
    }
    y += 4;

    // Iconos
    label(8, y, 'Iconos', CSS.muted);
    y += 12;
    ICONOS.forEach((name, k) => {
      const key = `icon-${name}`;
      if (!this.textures.exists(key)) return;
      this.add
        .image(12 + k * 60, y + 6, key)
        .setOrigin(0, 0)
        .setScale(2);
      label(12 + k * 60, y + 32, name, isReal(key) ? CSS.gold : CSS.muted, '6px');
    });
    y += 48;

    // Retratos y láminas (por URL, se ven en la capa DOM de la galería)
    label(
      8,
      y,
      `Retratos reales: ${Object.keys(m.portraits).length} · Láminas: ${m.illustrations.length} (ver panel DOM)`,
      CSS.muted,
    );
    y += 16;

    this.contentHeight = y + 40;
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, Math.max(GAME_HEIGHT, this.contentHeight));

    const kb = this.input.keyboard;
    kb?.on(
      'keydown-DOWN',
      () =>
        (this.cameras.main.scrollY = Math.min(
          this.contentHeight - GAME_HEIGHT,
          this.cameras.main.scrollY + 40,
        )),
    );
    kb?.on(
      'keydown-UP',
      () => (this.cameras.main.scrollY = Math.max(0, this.cameras.main.scrollY - 40)),
    );
    this.input.on('wheel', (_p: unknown, _g: unknown, _dx: number, dy: number) => {
      this.cameras.main.scrollY = Phaser.Math.Clamp(
        this.cameras.main.scrollY + dy * 0.3,
        0,
        Math.max(0, this.contentHeight - GAME_HEIGHT),
      );
    });
  }
}
