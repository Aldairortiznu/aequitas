import Phaser from 'phaser';
import { CSS, FONTS, GAME_HEIGHT, GAME_WIDTH, PALETTE, TITLE } from '../../config';
import { getBus } from '../../core/bus';

/**
 * Pantalla de título provisional (E0.1).
 * Sobria: fondo ceniza, una línea dorada, el nombre y el subtítulo.
 * Enter, espacio o un toque emiten `title:start`.
 */
export class TitleScene extends Phaser.Scene {
  private started = false;

  constructor() {
    super({ key: 'Title' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[0]);

    // Tres bandas horizontales muy tenues: ciénaga (agua), tierra, cielo. Sin dibujo figurativo.
    const g = this.add.graphics();
    g.fillStyle(PALETTE.ceniza[1], 1);
    g.fillRect(0, GAME_HEIGHT - 70, GAME_WIDTH, 70);
    g.fillStyle(PALETTE.aguas[0], 0.35);
    g.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    g.fillStyle(PALETTE.dorado[1], 1);
    g.fillRect(cx - 60, 118, 120, 1);

    this.add
      .text(cx, 92, TITLE.name, {
        fontFamily: FONTS.mono,
        fontSize: '34px',
        color: CSS.paper,
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.add
      .text(cx, 134, TITLE.subtitle, {
        fontFamily: FONTS.display,
        fontSize: '15px',
        fontStyle: 'italic',
        color: CSS.goldSoft,
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.add
      .text(cx, 156, TITLE.season, {
        fontFamily: FONTS.mono,
        fontSize: '9px',
        color: CSS.muted,
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setResolution(2);

    const prompt = this.add
      .text(cx, 214, '', {
        fontFamily: FONTS.mono,
        fontSize: '9px',
        color: CSS.paper2,
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.add
      .text(cx, GAME_HEIGHT - 14, TITLE.studio, {
        fontFamily: FONTS.mono,
        fontSize: '8px',
        color: CSS.muted,
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.35 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.started = false;
    getBus().emit('title:ready');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => prompt.destroy());
  }
}
