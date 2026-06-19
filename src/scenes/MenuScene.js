// Pantalla de título de "El Jardín de los Miedos".
// Fondo verde con hojas flotando, título, y menú (Nueva partida / Continuar).

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { hasSave, newSave, loadSave } from '../systems/save.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    // Fondo en degradado verde.
    this.drawBackground();

    // Hojas flotando hacia arriba.
    this.spawnLeaves();

    // Título.
    this.add
      .text(WIDTH / 2, 86, 'Reverdecer', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: COLORS.greenLight,
      })
      .setOrigin(0.5);

    // Subtítulo / dedicatoria.
    this.add
      .text(WIDTH / 2, 122, 'La travesía de Abigail', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: COLORS.gold,
        fontStyle: 'italic',
      })
      .setOrigin(0.5);
    this.add
      .text(WIDTH / 2, 140, '· 32 aprendizajes para volver a florecer ·', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: COLORS.cream,
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // Trío protagonista con nombres.
    const trio = [
      { key: 'jeronimo', name: 'Jerónimo', x: WIDTH / 2 - 46, y: 172, s: 1.6 },
      { key: 'abigail', name: 'Abigail', x: WIDTH / 2, y: 168, s: 1.8 },
      { key: 'amanda', name: 'Amanda', x: WIDTH / 2 + 46, y: 173, s: 1.6 },
    ];
    trio.forEach((c) => {
      const spr = this.add.image(c.x, c.y, c.key).setScale(c.s).setOrigin(0.5, 1);
      // leve "respiración" para dar vida
      this.tweens.add({
        targets: spr,
        y: c.y - 2,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: Phaser.Math.Between(0, 600),
      });
      this.add
        .text(c.x, c.y + 6, c.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '8px',
          color: c.key === 'abigail' ? COLORS.gold : COLORS.cream,
        })
        .setOrigin(0.5, 0);
    });

    // Opciones de menú.
    this.buildMenu();

    // Pie.
    this.add
      .text(WIDTH / 2, HEIGHT - 12, 'Flechas: elegir  ·  Enter: confirmar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#7fae8c',
      })
      .setOrigin(0.5);
  }

  drawBackground() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    const top = Phaser.Display.Color.HexStringToColor(COLORS.bgGreen).color;
    const bottom = Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color;
    g.fillGradientStyle(top, top, bottom, bottom, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);
  }

  spawnLeaves() {
    const { WIDTH, HEIGHT } = GAME;
    this.leaves = [];
    for (let i = 0; i < 18; i++) {
      const leaf = this.add
        .image(
          Phaser.Math.Between(0, WIDTH),
          Phaser.Math.Between(0, HEIGHT),
          'leaf'
        )
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.8))
        .setScale(Phaser.Math.FloatBetween(0.5, 1.1));
      leaf.speedY = Phaser.Math.FloatBetween(0.2, 0.7);
      leaf.swing = Phaser.Math.FloatBetween(0.5, 1.5);
      leaf.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.leaves.push(leaf);
    }
  }

  buildMenu() {
    const { WIDTH } = GAME;
    const continueAvailable = hasSave();

    this.options = [];
    if (continueAvailable) {
      this.options.push({ label: 'Continuar', action: () => this.startGame(false) });
    }
    this.options.push({ label: 'Nueva partida', action: () => this.startGame(true) });

    this.selected = 0;
    this.optionTexts = this.options.map((opt, i) =>
      this.add
        .text(WIDTH / 2, 206 + i * 20, opt.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: COLORS.cream,
        })
        .setOrigin(0.5)
    );
    this.refreshMenu();

    // Controles.
    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());
  }

  move(dir) {
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.options.length);
    this.refreshMenu();
  }

  refreshMenu() {
    this.optionTexts.forEach((t, i) => {
      const active = i === this.selected;
      t.setColor(active ? COLORS.gold : COLORS.cream);
      t.setText((active ? '❯ ' : '  ') + this.options[i].label);
      t.setScale(active ? 1.1 : 1);
    });
  }

  confirm() {
    this.options[this.selected].action();
  }

  startGame(isNew) {
    const save = isNew ? newSave(GAME.HEROINE) : loadSave() || newSave(GAME.HEROINE);
    // La escena del mundo aún no existe (Fase 2). Por ahora mostramos un aviso.
    this.scene.start('Placeholder', { save });
  }

  update() {
    const { HEIGHT } = GAME;
    this.leaves.forEach((leaf) => {
      leaf.y -= leaf.speedY;
      leaf.phase += 0.02;
      leaf.x += Math.sin(leaf.phase) * leaf.swing * 0.3;
      leaf.angle += 0.5;
      if (leaf.y < -8) {
        leaf.y = HEIGHT + 8;
        leaf.x = Phaser.Math.Between(0, GAME.WIDTH);
      }
    });
  }
}
