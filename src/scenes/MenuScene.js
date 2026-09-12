// Pantalla de título de AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Publicación Editorial Al Resuelve (Cartagena de Indias, Colombia).

import Phaser from 'phaser';
import { GAME, COLORS, EXPLORERS } from '../config.js';
import { hasSave, newSave, loadSave } from '../systems/save.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    // Fondo degradado crepuscular Bellium (púrpura a negro)
    this.drawBackground();

    // Hojas y margaritas doradas flotando
    this.spawnLeaves();

    // Título Principal
    this.add
      .text(WIDTH / 2, 38, 'AEQUITAS', {
        fontFamily: 'Georgia, serif',
        fontSize: '38px',
        color: COLORS.goldLight,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Subtítulo
    this.add
      .text(WIDTH / 2, 64, '· EL RETORNO DEL EQUILIBRIO ·', {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: COLORS.purpleLight,
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, 79, 'Bellium S.A.S. · Al Resuelve (Cartagena de Indias)', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ffd875',
      })
      .setOrigin(0.5);

    // Selector de los Cuatro Exploradores
    this.createExplorerSelector();

    // Menú de opciones principales
    this.buildMenu();

    // Pie de controles
    this.add
      .text(WIDTH / 2, HEIGHT - 10, '← →: Elegir Explorador  ·  ↑ ↓: Opciones  ·  Enter: Confirmar', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#a795b8',
      })
      .setOrigin(0.5);
  }

  drawBackground() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    const top = Phaser.Display.Color.HexStringToColor(COLORS.purpleBellium).color;
    const bottom = Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color;
    g.fillGradientStyle(top, top, bottom, bottom, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);
  }

  spawnLeaves() {
    const { WIDTH, HEIGHT } = GAME;
    this.leaves = [];
    for (let i = 0; i < 20; i++) {
      const leaf = this.add
        .image(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(0, HEIGHT), 'leaf')
        .setAlpha(Phaser.Math.FloatBetween(0.3, 0.8))
        .setScale(Phaser.Math.FloatBetween(0.6, 1.2));
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
      .text(WIDTH / 2, 98, 'ELIGE A TU EXPLORADOR DE LA BIBLIOTECA:', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLORS.gold,
      })
      .setOrigin(0.5);

    const startX = WIDTH / 2 - 120;
    const gap = 80;
    const yPos = 142;

    this.explorerSprites = [];
    this.explorerLabels = [];
    this.highlightBox = this.add.graphics();

    this.explorerKeys.forEach((key, idx) => {
      const exp = EXPLORERS[key];
      const x = startX + idx * gap;

      const spr = this.add
        .image(x, yPos, exp.sprite)
        .setScale(1.8)
        .setOrigin(0.5, 1)
        .setInteractive({ useHandCursor: true });

      spr.on('pointerdown', () => {
        this.selectedExplorerIdx = idx;
        this.updateExplorerHighlights();
      });

      // Animación suave de respiración
      this.tweens.add({
        targets: spr,
        y: yPos - 3,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: idx * 250,
      });

      const lbl = this.add
        .text(x, yPos + 6, exp.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '10px',
          color: COLORS.cream,
        })
        .setOrigin(0.5, 0);

      this.explorerSprites.push(spr);
      this.explorerLabels.push(lbl);
    });

    // Ficha descriptiva del explorador activo
    this.infoTitle = this.add
      .text(WIDTH / 2, 168, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: COLORS.goldLight,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.infoSpecialty = this.add
      .text(WIDTH / 2, 181, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#c9a7eb',
      })
      .setOrigin(0.5);

    this.updateExplorerHighlights();

    // Controles horizontales para explorador
    this.input.keyboard.on('keydown-LEFT', () => {
      this.selectedExplorerIdx = Phaser.Math.Wrap(this.selectedExplorerIdx - 1, 0, this.explorerKeys.length);
      this.updateExplorerHighlights();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
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
      spr.setScale(active ? 2.1 : 1.7);
      this.explorerLabels[i].setColor(active ? COLORS.goldLight : '#a795b8');
    });

    this.infoTitle.setText(`« ${exp.name} — ${exp.title} »`);
    this.infoSpecialty.setText(`Especialidad: ${exp.specialty}`);

    // Dibujar marco dorado
    this.highlightBox.clear();
    const activeSpr = this.explorerSprites[this.selectedExplorerIdx];
    this.highlightBox.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.8);
    this.highlightBox.strokeRoundedRect(activeSpr.x - 22, activeSpr.y - 40, 44, 46, 6);
  }

  buildMenu() {
    const { WIDTH } = GAME;
    const continueAvailable = hasSave();

    this.options = [];
    if (continueAvailable) {
      this.options.push({ label: 'Continuar Expedición', action: () => this.startGame(false) });
    }
    this.options.push({ label: 'Nueva Partida', action: () => this.startGame(true) });
    this.options.push({ label: 'Códice de la Ley', action: () => this.scene.launch('Diary', { returnScene: 'Menu' }) });

    this.selected = 0;
    this.optionTexts = this.options.map((opt, i) =>
      this.add
        .text(WIDTH / 2, 204 + i * 16, opt.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '12px',
          color: COLORS.cream,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
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
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.options.length);
    this.refreshMenu();
  }

  refreshMenu() {
    this.optionTexts.forEach((t, i) => {
      const active = i === this.selected;
      t.setColor(active ? COLORS.gold : COLORS.cream);
      t.setText((active ? '✿  ' : '   ') + this.options[i].label);
      t.setScale(active ? 1.08 : 1);
    });
  }

  confirm() {
    this.options[this.selected].action();
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
    this.scene.start('World', { save });
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
