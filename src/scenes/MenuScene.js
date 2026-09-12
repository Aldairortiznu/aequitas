// Pantalla de título de AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Ilustración botánica de fondo, selección de 4 exploradores y acceso al prólogo cinemático.

import Phaser from 'phaser';
import { GAME, COLORS, EXPLORERS } from '../config.js';
import { hasSave, loadSave, newSave } from '../systems/save.js';
import { sound } from '../systems/audio.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    // Fondo botánico de la Biblioteca con viñeta nocturna púrpura
    this.drawBackground();

    // Hojas y motas doradas de Bellium cayendo
    this.spawnLeaves();

    // Cabecera institucional
    const titleY = 32;
    this.add
      .text(WIDTH / 2, titleY, GAME.TITLE, {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: COLORS.goldLight,
        stroke: '#1a0529',
        strokeThickness: 5,
        shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 6, stroke: true, fill: true },
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, titleY + 22, `· ${GAME.SUBTITLE.toUpperCase()} ·`, {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#f6d892',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, titleY + 36, GAME.ORGANIZATION, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        color: '#c9a7eb',
      })
      .setOrigin(0.5);

    // Selector de los Cuatro Exploradores
    this.createExplorerSelector();

    // Menú de opciones principales
    this.buildMenu();

    // Pie de controles
    this.add
      .text(WIDTH / 2, HEIGHT - 8, '← →: Elegir Explorador  ·  ↑ ↓: Opciones  ·  Enter / Tocar: Confirmar', {
        fontFamily: 'monospace',
        fontSize: '7.5px',
        color: '#c9a7eb',
      })
      .setOrigin(0.5);
  }

  drawBackground() {
    const { WIDTH, HEIGHT } = GAME;
    if (this.textures.exists('menu_bg')) {
      this.add.image(WIDTH / 2, HEIGHT / 2, 'menu_bg')
        .setOrigin(0.5)
        .setDisplaySize(WIDTH, HEIGHT)
        .setAlpha(0.65);
    }

    const g = this.add.graphics();
    const top = Phaser.Display.Color.HexStringToColor(COLORS.purpleBellium).color;
    const bottom = Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color;
    g.fillGradientStyle(top, top, bottom, bottom, 0.72, 0.72, 0.94, 0.94);
    g.fillRect(0, 0, WIDTH, HEIGHT);
  }

  spawnLeaves() {
    const { WIDTH, HEIGHT } = GAME;
    this.leaves = [];
    for (let i = 0; i < 20; i++) {
      const leaf = this.add
        .image(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(0, HEIGHT), 'leaf')
        .setAlpha(Phaser.Math.FloatBetween(0.35, 0.85))
        .setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      leaf.speedY = Phaser.Math.FloatBetween(0.2, 0.6);
      leaf.swing = Phaser.Math.FloatBetween(0.5, 1.5);
      leaf.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.leaves.push(leaf);
    }
  }

  createExplorerSelector() {
    const { WIDTH } = GAME;
    this.explorerKeys = ['aurelio', 'valeria', 'kaelen', 'sora'];
    this.selectedExplorerIdx = 0;

    this.add
      .text(WIDTH / 2, 84, 'ELIGE A TU EXPLORADOR DE LA BIBLIOTECA:', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLORS.gold,
      })
      .setOrigin(0.5);

    const startX = WIDTH / 2 - 120;
    const gap = 80;
    const yPos = 126;

    this.explorerSprites = [];
    this.explorerLabels = [];
    this.highlightBox = this.add.graphics();

    this.explorerKeys.forEach((key, idx) => {
      const exp = EXPLORERS[key];
      const x = startX + idx * gap;

      const spr = this.add
        .image(x, yPos, exp.sprite)
        .setScale(1.7)
        .setOrigin(0.5, 1)
        .setInteractive({ useHandCursor: true });

      spr.on('pointerdown', () => {
        sound.playMenuNav();
        this.selectedExplorerIdx = idx;
        this.updateExplorerHighlights();
      });

      this.tweens.add({
        targets: spr,
        y: yPos - 3,
        duration: 1200 + idx * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const label = this.add
        .text(x, yPos + 3, exp.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '9px',
          color: idx === 0 ? COLORS.goldLight : '#a795b8',
        })
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true });

      label.on('pointerdown', () => {
        sound.playMenuNav();
        this.selectedExplorerIdx = idx;
        this.updateExplorerHighlights();
      });

      this.explorerSprites.push(spr);
      this.explorerLabels.push(label);
    });

    // Ficha informativa dinámica
    this.infoTitle = this.add
      .text(WIDTH / 2, 142, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: COLORS.goldLight,
      })
      .setOrigin(0.5);

    this.infoSpecialty = this.add
      .text(WIDTH / 2, 154, '', {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        color: COLORS.cream,
      })
      .setOrigin(0.5);

    this.updateExplorerHighlights();

    this.input.keyboard.on('keydown-LEFT', () => {
      sound.playMenuNav();
      this.selectedExplorerIdx = Phaser.Math.Wrap(this.selectedExplorerIdx - 1, 0, this.explorerKeys.length);
      this.updateExplorerHighlights();
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      sound.playMenuNav();
      this.selectedExplorerIdx = Phaser.Math.Wrap(this.selectedExplorerIdx + 1, 0, this.explorerKeys.length);
      this.updateExplorerHighlights();
    });
  }

  updateExplorerHighlights() {
    const key = this.explorerKeys[this.selectedExplorerIdx];
    const exp = EXPLORERS[key];

    this.explorerSprites.forEach((spr, i) => {
      const active = i === this.selectedExplorerIdx;
      spr.setAlpha(active ? 1 : 0.6);
      spr.setScale(active ? 2.0 : 1.6);
      this.explorerLabels[i].setColor(active ? COLORS.goldLight : '#a795b8');
    });

    this.infoTitle.setText(`« ${exp.name} — ${exp.title} »`);
    this.infoSpecialty.setText(`Especialidad: ${exp.specialty}`);

    this.highlightBox.clear();
    const activeSpr = this.explorerSprites[this.selectedExplorerIdx];
    this.highlightBox.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.85);
    this.highlightBox.strokeRoundedRect(activeSpr.x - 20, activeSpr.y - 38, 40, 42, 6);
  }

  buildMenu() {
    const { WIDTH } = GAME;
    const continueAvailable = hasSave();

    this.options = [];
    if (continueAvailable) {
      this.options.push({ label: 'Continuar Expedición', action: () => this.startGame(false) });
    }
    this.options.push({ label: 'Nueva Partida', action: () => this.startGame(true) });
    this.options.push({ label: 'Ver Prólogo Cinemático', action: () => this.playIntro() });
    this.options.push({ label: 'Códice de la Ley', action: () => this.scene.launch('Diary', { returnScene: 'Menu' }) });

    this.selected = 0;
    const menuStartY = 175;
    const itemGap = 15;

    this.optionTexts = this.options.map((opt, i) =>
      this.add
        .text(WIDTH / 2, menuStartY + i * itemGap, opt.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '11px',
          color: COLORS.cream,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          this.selected = i;
          this.refreshMenu();
        })
        .on('pointerdown', () => {
          this.selected = i;
          this.confirm();
        })
    );
    this.refreshMenu();

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());
  }

  move(dir) {
    sound.playMenuNav();
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.options.length);
    this.refreshMenu();
  }

  refreshMenu() {
    this.optionTexts.forEach((t, i) => {
      const active = i === this.selected;
      t.setColor(active ? COLORS.goldLight : COLORS.cream);
      t.setText((active ? '✿  ' : '   ') + this.options[i].label);
      t.setScale(active ? 1.05 : 1);
    });
  }

  confirm() {
    sound.playMenuSelect();
    this.options[this.selected].action();
  }

  playIntro() {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('Intro');
    });
  }

  startGame(isNew) {
    const explorerKey = this.explorerKeys[this.selectedExplorerIdx];
    let save;
    if (isNew) {
      save = newSave(explorerKey);
    } else {
      save = loadSave() || newSave(explorerKey);
      if (save) save.explorer = explorerKey;
    }
    this.cameras.main.fade(500, 14, 4, 20);
    this.time.delayedCall(500, () => {
      this.scene.start('World', { save });
    });
  }

  update() {
    const { HEIGHT } = GAME;
    this.leaves.forEach((leaf) => {
      leaf.y -= leaf.speedY;
      leaf.phase += 0.02;
      leaf.x += Math.sin(leaf.phase) * (leaf.swing * 0.4);
      if (leaf.y < -10) {
        leaf.y = HEIGHT + 10;
        leaf.x = Phaser.Math.Between(0, GAME.WIDTH);
      }
    });
  }
}
