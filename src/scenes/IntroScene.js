// Escena de Introducción Cinemática al estilo Zelda / Mega Man X4.
// AEQUITAS: El Retorno del Equilibrio — Bellium S.A.S. (Cartagena de Indias).

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { sound } from '../systems/audio.js';

const ACTS = [
  {
    image: 'intro_colapso',
    tag: 'ACTO I: EL COLAPSO DE LA CERTEZA',
    sub: 'Donde impera la fuerza bruta, la sociedad perece.',
    body: 'Tras la Gran Fractura, el Caribe y las tierras altas perdieron la memoria de sus pactos fundamentales.\n\nSin certidumbre ni debido proceso, caudillos de facto sometieron a las comunidades al despojo y al miedo. El orden social se creyó extinto para siempre.',
  },
  {
    image: 'intro_biblioteca',
    tag: 'ACTO II: EL SANTUARIO DE BELLIUM',
    sub: 'La Gran Biblioteca Experimental resiste entre enredaderas y luz solar.',
    body: 'Bajo bóvedas botánicas y fuentes solares, una comunidad de juristas y botánicos resistió en silencio.\n\nAllí custodiaron el mayor tesoro de la humanidad: la Constitución Política, el Códice Civil y las actas de convivencia comunal. La justicia aguardaba la hora de renacer.',
  },
  {
    image: 'intro_exploradores',
    tag: 'ACTO III: LOS CUATRO EXPLORADORES',
    sub: 'Una expedición sin fusiles ni espadas: el poder de la palabra y la ley.',
    body: 'Cuatro juristas han jurado devolver la equidad a los sobrevivientes:\n\n• Aurelio: Archivista del Debido Proceso (Art. 29 C.P.)\n• Valeria: Cartógrafa de Aguas y Servidumbres (Ley 675)\n• Kaelen: Custodio contra la Usura Comercial (C.Co)\n• Sora: Centinela de la Dignidad Humana (Art. 1 y 4 C.P.)',
  },
  {
    image: 'intro_concilio',
    tag: 'ACTO IV: EL RETORNO DEL EQUILIBRIO',
    sub: 'Donde la ley restituye la armonía, florece la Margarita Dorada.',
    body: 'Su mandato no es castigar con violencia, sino legitimar nuevos pactos comunales y restaurar el tejido social.\n\nPor cada controversia dirimida bajo la razón y la ley colombiana, brotará la legendaria flor dorada de Bellium. Tu viaje comienza ahora.',
  },
];

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    this.actIndex = 0;
    this.typing = false;
    this.fullText = '';
    this.shownChars = 0;

    // Fondo negro base
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Contenedor de la ilustración cinemática
    this.bg = this.add.image(WIDTH / 2, HEIGHT / 2 - 20, ACTS[0].image)
      .setOrigin(0.5)
      .setDisplaySize(WIDTH, HEIGHT);

    // Viñeta oscura degradada
    this.vignette = this.add.graphics();
    this.drawVignette(WIDTH, HEIGHT);

    // Partículas botánicas ambientales (polen dorado)
    this.createPollenParticles(WIDTH, HEIGHT);

    // Marco del texto inferior estilo RPG cinemático
    const panelY = HEIGHT - 92;
    const panelH = 86;
    const panelW = WIDTH - 16;
    const panelX = 8;

    this.panel = this.add.graphics();
    this.panel.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.92);
    this.panel.fillRoundedRect(panelX, panelY, panelW, panelH, 6);
    this.panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.85);
    this.panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

    // Decoración interior del panel
    this.panel.lineStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.purpleRoyal).color, 0.5);
    this.panel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 4);

    // Etiqueta del Acto
    this.actTitle = this.add.text(panelX + 12, panelY + 6, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: COLORS.goldLight,
    });

    // Subtítulo cursiva
    this.actSub = this.add.text(panelX + 12, panelY + 20, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      fontStyle: 'italic',
      color: COLORS.greenLight,
    });

    // Texto narrativo (con máquina de escribir)
    this.bodyText = this.add.text(panelX + 12, panelY + 33, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: COLORS.cream,
      wordWrap: { width: panelW - 24 },
      lineSpacing: 2,
    });

    // Indicador "Avanzar"
    this.contPrompt = this.add.text(panelX + panelW - 14, panelY + panelH - 12, '▼', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: COLORS.gold,
    }).setOrigin(1, 1).setVisible(false);

    this.tweens.add({
      targets: this.contPrompt,
      y: this.contPrompt.y - 3,
      duration: 450,
      yoyo: true,
      repeat: -1,
    });

    // Botón de saltar en la esquina superior
    this.skipBtn = this.add.text(WIDTH - 8, 8, '[ Saltar Intro ⏩ ]', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: COLORS.goldLight,
      backgroundColor: '#1b0526dd',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.skipBtn.on('pointerover', () => this.skipBtn.setColor('#ffffff'));
    this.skipBtn.on('pointerout', () => this.skipBtn.setColor(COLORS.goldLight));
    this.skipBtn.on('pointerdown', () => this.finishIntro());

    // Manejo de pulsación (Táctil o Teclado)
    this.input.on('pointerdown', (pointer) => {
      // Si tocó el botón de saltar, se gestiona en su evento
      if (pointer.y < 35 && pointer.x > WIDTH - 120) return;
      this.handleAdvance();
    });

    this.input.keyboard.on('keydown-SPACE', () => this.handleAdvance());
    this.input.keyboard.on('keydown-ENTER', () => this.handleAdvance());
    this.input.keyboard.on('keydown-ESC', () => this.finishIntro());

    // Cargar primer acto
    this.loadAct(0);
  }

  drawVignette(w, h) {
    this.vignette.clear();
    // Bordes oscuros arriba y abajo para encuadre cinematográfico
    this.vignette.fillGradientStyle(0x0e0414, 0x0e0414, 0x000000, 0x000000, 0.7, 0.7, 0, 0);
    this.vignette.fillRect(0, 0, w, 40);
    this.vignette.fillGradientStyle(0x000000, 0x000000, 0x0e0414, 0x0e0414, 0, 0, 0.85, 0.85);
    this.vignette.fillRect(0, h - 120, w, 120);
  }

  createPollenParticles(w, h) {
    this.particles = [];
    for (let i = 0; i < 22; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(10, w - 10),
        Phaser.Math.Between(10, h - 30),
        Phaser.Math.Between(1, 2),
        Phaser.Math.RND.pick([0xe3940b, 0xffd875, 0x88c292, 0xffffff]),
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
      this.particles.push({
        sprite: p,
        speedY: Phaser.Math.FloatBetween(0.2, 0.6),
        speedX: Phaser.Math.FloatBetween(-0.15, 0.15),
      });
    }
  }

  update() {
    // Animación suave de polen botánico flotante
    const { WIDTH, HEIGHT } = GAME;
    if (this.particles) {
      this.particles.forEach((p) => {
        p.sprite.y -= p.speedY;
        p.sprite.x += p.speedX;
        if (p.sprite.y < 0) {
          p.sprite.y = HEIGHT;
          p.sprite.x = Phaser.Math.Between(10, WIDTH - 10);
        }
      });
    }
  }

  loadAct(index) {
    if (index >= ACTS.length) {
      this.finishIntro();
      return;
    }

    this.actIndex = index;
    const act = ACTS[index];

    // Reproducir acorde solarpunk tipo Zelda
    sound.playIntroArpeggio(index);

    // Animación de cambio de imagen (Crossfade sutil)
    this.tweens.add({
      targets: this.bg,
      alpha: 0.15,
      duration: 350,
      onComplete: () => {
        this.bg.setTexture(act.image);
        this.bg.setScale(1.0);
        this.tweens.add({
          targets: this.bg,
          alpha: 1.0,
          scale: 1.05, // Ken Burns sutil
          duration: 9000,
          ease: 'Sine.easeInOut',
        });
      },
    });

    this.actTitle.setText(act.tag);
    this.actSub.setText(act.sub);

    // Máquina de escribir para el cuerpo
    this.fullText = act.body;
    this.shownChars = 0;
    this.bodyText.setText('');
    this.typing = true;
    this.contPrompt.setVisible(false);

    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: 20,
      loop: true,
      callback: () => {
        this.shownChars++;
        this.bodyText.setText(this.fullText.substring(0, this.shownChars));
        if (this.shownChars % 4 === 0) {
          sound.playTypewriter();
        }
        if (this.shownChars >= this.fullText.length) {
          this.typing = false;
          this.contPrompt.setVisible(true);
          this.typer.remove();
        }
      },
    });
  }

  handleAdvance() {
    if (this.typing) {
      // Completar texto de inmediato si aún escribe
      this.typing = false;
      if (this.typer) this.typer.remove();
      this.bodyText.setText(this.fullText);
      this.contPrompt.setVisible(true);
    } else {
      // Avanzar al siguiente acto
      sound.playMenuNav();
      this.loadAct(this.actIndex + 1);
    }
  }

  finishIntro() {
    sound.playMenuSelect();
    this.cameras.main.fade(600, 245, 166, 35); // destello dorado Bellium
    this.time.delayedCall(600, () => {
      this.scene.start('Menu');
    });
  }
}
