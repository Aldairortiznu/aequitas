import Phaser from 'phaser';
import { CSS, FONTS, GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../../config';
import { bakeAll } from '../art/provisional';
import {
  DIRECCIONES,
  ESTADOS,
  ICONOS,
  SPRITE_FRAME,
  markReal,
  setManifest,
  url,
} from '../art/registry';
import type { AssetManifest } from '../art/registry';

/** Lo que la app sabe del contenido y el motor necesita para precargar. */
export interface PreloadData {
  /** ids de sprite de todos los personajes (content/personajes.json). */
  sprites: string[];
  /** nombres de tileset esperados (regiones + «provisional»). */
  tilesets: string[];
  /** escena a la que saltar al terminar. */
  next: string;
  nextData?: object;
}

/**
 * Precarga (E1/F4): lee assets/manifest.json y carga solo los archivos reales que existen.
 * Todo lo que falte se hornea con el arte provisional. Nunca produce 404.
 */
export class PreloadScene extends Phaser.Scene {
  private cfg!: PreloadData;
  private manifest: AssetManifest | null = null;

  constructor() {
    super({ key: 'Preload' });
  }

  init(data: PreloadData): void {
    this.cfg = data;
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[0]);
    const txt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Cargando…', {
        fontFamily: FONTS.mono,
        fontSize: '10px',
        color: CSS.muted,
      })
      .setOrigin(0.5)
      .setResolution(2);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) =>
      txt.setText(`Cargando… ${Math.round(p * 100)} %`),
    );
    this.load.json('assets-manifest', url.manifest());
  }

  create(): void {
    const m = this.cache.json.get('assets-manifest') as AssetManifest | undefined;
    this.manifest = m ?? null;
    if (m) setManifest(m);
    // Segunda fase: con el manifiesto sabemos qué archivos existen.
    const load = this.load;
    const sprites = new Set(m?.sprites ?? []);
    for (const id of this.cfg.sprites) {
      if (sprites.has(id)) {
        load.spritesheet(`char-${id}`, url.sprite(id), {
          frameWidth: SPRITE_FRAME.width,
          frameHeight: SPRITE_FRAME.height,
        });
      }
    }
    for (const name of this.cfg.tilesets) {
      for (const estado of m?.tilesets[name] ?? []) {
        if ((ESTADOS as readonly string[]).includes(estado))
          load.image(`tiles-${name}-${estado}`, url.tileset(name, estado));
      }
    }
    for (const icon of m?.icons ?? []) {
      if ((ICONOS as readonly string[]).includes(icon)) load.image(`icon-${icon}`, url.icon(icon));
    }
    load.once(Phaser.Loader.Events.COMPLETE, () => this.finish());
    load.start();
  }

  private finish(): void {
    const m = this.manifest;
    // Registrar lo real y añadir nombres de cuadro a las hojas cargadas.
    for (const id of m?.sprites ?? []) {
      const key = `char-${id}`;
      if (!this.textures.exists(key)) continue;
      markReal(key);
      const tex = this.textures.get(key);
      DIRECCIONES.forEach((dir, row) => {
        for (let f = 0; f < SPRITE_FRAME.cols; f++) {
          const name = `${dir}-${f}`;
          if (!tex.has(name))
            tex.add(
              name,
              0,
              f * SPRITE_FRAME.width,
              row * SPRITE_FRAME.height,
              SPRITE_FRAME.width,
              SPRITE_FRAME.height,
            );
        }
      });
    }
    for (const [name, estados] of Object.entries(m?.tilesets ?? {})) {
      for (const estado of estados)
        if (this.textures.exists(`tiles-${name}-${estado}`)) markReal(`tiles-${name}-${estado}`);
    }
    for (const icon of m?.icons ?? [])
      if (this.textures.exists(`icon-${icon}`)) markReal(`icon-${icon}`);

    // Todo lo que falte se hornea (las claves ya existentes se respetan).
    bakeAll(this, this.cfg.sprites, this.cfg.tilesets);
    this.scene.start(this.cfg.next, this.cfg.nextData);
  }
}
