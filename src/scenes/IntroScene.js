// Escena de Introducción Cinemática al estilo Zelda / Mega Man X4.
// AEQUITAS: El Retorno del Equilibrio — Bellium S.A.S. (Cartagena de Indias).
// 5 Actos Narrativos con arte botánico solarpunk y guión épico.

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { sound } from '../systems/audio.js';

const ACTS = [
  {
    image: 'intro_1_fractura',
    tag: 'ACTO I: LA GRAN FRACTURA Y EL SILENCIO DE LA LEY',
    sub: 'Donde impera la fuerza bruta, la sociedad olvida cómo convivir.',
    body: 'Hubo un tiempo en que la paz no dependía del calibre de un arma, sino de la fuerza invisible de una palabra compartida: la Ley.\n\nTras la Gran Fractura, las instituciones cayeron y se extinguió la certeza jurídica. Los acuerdos fueron rasgados, los acueductos comunales fueron secuestrados y los débiles fueron expulsados al desierto. En el yermo, la arbitrariedad se coronó como soberana.',
  },
  {
    image: 'intro_2_codice',
    tag: 'ACTO II: EL CÓDICE QUE NO ARDIÓ',
    sub: 'La justicia no es un papel que el fuego pueda borrar: es una semilla viva.',
    body: 'Sin embargo, la justicia aguardaba en silencio bajo las raíces.\n\nEn un atril de cedro vivo, los sabios preservaron intacto el Códice Supremo: la Constitución de 1991, los principios del Debido Proceso y las normas de convivencia civil. Allí estaba escrito que la dignidad humana es innegociable y que nadie puede ser despojado sin ser escuchado.',
  },
  {
    image: 'intro_3_biblioteca',
    tag: 'ACTO III: EL SANTUARIO DE BELLIUM',
    sub: 'En las profundidades del Caribe, la Gran Biblioteca Experimental resiste.',
    body: 'Oculta tras manantiales cristalinos y murallas de flora bioluminiscente, la Biblioteca formó a una estirpe única de juristas y botánicos.\n\nComprendieron que la tierra y la sociedad comparten una misma verdad: cuando la arbitrariedad envenena el cauce, todo muere; cuando la equidad devuelve el orden, la vida florece con esplendor.',
  },
  {
    image: 'intro_4_exploradores',
    tag: 'ACTO IV: LA COMITIVA DE LOS CUATRO RESTAURADORES',
    sub: 'Una expedición sin fusiles ni espadas: el poder de la razón jurídica.',
    body: 'Hoy, cuatro juristas han jurado marchar hacia las colonias para devolver el orden social:\n\n• Aurelio: Archivista del Debido Proceso (Art. 29 C.P.), implacable contra los despojos.\n• Valeria: Cartógrafa de Aguas y Servidumbres (Ley 675 / Art. 919 C.C.).\n• Kaelen: Custodio de la Balanza Comercial, azote de la usura y pagarés fraudulentos.\n• Sora: Centinela de la Dignidad Humana y la Supremacía Constitucional.',
  },
  {
    image: 'intro_5_concilio',
    tag: 'ACTO V: EL RETORNO DEL EQUILIBRIO',
    sub: 'Donde la ley restituye la armonía, florece la Margarita Dorada.',
    body: 'Su mandato no es castigar con violencia: es legitimar nuevos pactos comunales y reconciliar a los sobrevivientes.\n\nY la naturaleza sellará cada acuerdo: donde una controversia sea resuelta bajo la equidad, la legendaria Margarita Dorada de Bellium brotará del suelo como testimonio de paz.\n\nToma tu zurrón. Elige a tu explorador. El equilibrio está en tus manos.',
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

    // Fondo negro de cine
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Contenedor de la ilustración cinemática
    this.bg = this.add.image(WIDTH / 2, HEIGHT / 2 - 18, ACTS[0].image)
      .setOrigin(0.5)
      .setDisplaySize(WIDTH, HEIGHT);

    // Viñeta oscura degradada para dramatismo visual
    this.vignette = this.add.graphics();
    this.drawVignette(WIDTH, HEIGHT);

    // Partículas botánicas ambientales (esporas doradas de Bellium)
    this.createPollenParticles(WIDTH, HEIGHT);

    // Marco del texto inferior estilo RPG cinemático
    const panelY = HEIGHT - 96;
    const panelH = 90;
    const panelW = WIDTH - 16;
    const panelX = 8;

    this.panel = this.add.graphics();
    this.panel.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.93);
    this.panel.fillRoundedRect(panelX, panelY, panelW, panelH, 6);
    this.panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.85);
    this.panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

    // Decoración interior del panel
    this.panel.lineStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.purpleRoyal).color, 0.5);
    this.panel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 4);

    // Etiqueta del Acto
    this.actTitle = this.add.text(panelX + 12, panelY + 6, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: COLORS.goldLight,
    });

    // Subtítulo cursiva
    this.actSub = this.add.text(panelX + 12, panelY + 20, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '8.5px',
      fontStyle: 'italic',
      color: COLORS.greenLight,
    });

    // Texto narrativo (con máquina de escribir)
    this.bodyText = this.add.text(panelX + 12, panelY + 33, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '9.5px',
      color: COLORS.cream,
      wordWrap: { width: panelW - 24 },
      lineSpacing: 2.5,
    });

    // Indicador "Avanzar"
    this.contPrompt = this.add.text(panelX + panelW - 14, panelY + panelH - 10, '▼  Toca para continuar', {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      color: COLORS.gold,
    }).setOrigin(1, 1).setVisible(false);

    this.tweens.add({
      targets: this.contPrompt,
      alpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Botón de saltar en la esquina superior derecha
    this.skipBtn = this.add.text(WIDTH - 8, 8, '[ Saltar Intro ⏩ ]', {
      fontFamily: 'Georgia, serif',
      fontSize: '9.5px',
      color: COLORS.goldLight,
      backgroundColor: '#1b0526dd',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.skipBtn.on('pointerover', () => this.skipBtn.setColor('#ffffff'));
    this.skipBtn.on('pointerout', () => this.skipBtn.setColor(COLORS.goldLight));
    this.skipBtn.on('pointerdown', () => this.finishIntro());

    // Manejo táctil y de teclado
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < 35 && pointer.x > WIDTH - 120) return;
      this.handleAdvance();
    });

    this.input.keyboard.on('keydown-SPACE', () => this.handleAdvance());
    this.input.keyboard.on('keydown-ENTER', () => this.handleAdvance());
    this.input.keyboard.on('keydown-ESC', () => this.finishIntro());

    // Cargar Acto I
    this.loadAct(0);
  }

  drawVignette(w, h) {
    this.vignette.clear();
    this.vignette.fillGradientStyle(0x0e0414, 0x0e0414, 0x000000, 0x000000, 0.75, 0.75, 0, 0);
    this.vignette.fillRect(0, 0, w, 42);
    this.vignette.fillGradientStyle(0x000000, 0x000000, 0x0e0414, 0x0e0414, 0, 0, 0.9, 0.9);
    this.vignette.fillRect(0, h - 125, w, 125);
  }

  createPollenParticles(w, h) {
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(10, w - 10),
        Phaser.Math.Between(10, h - 30),
        Phaser.Math.Between(1, 2),
        Phaser.Math.RND.pick([0xe3940b, 0xffd875, 0x88c292, 0xffffff]),
        Phaser.Math.FloatBetween(0.3, 0.85)
      );
      this.particles.push({
        sprite: p,
        speedY: Phaser.Math.FloatBetween(0.2, 0.6),
        speedX: Phaser.Math.FloatBetween(-0.15, 0.15),
      });
    }
  }

  update() {
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

    // Reproducir arpegio armónico solarpunk
    sound.playIntroArpeggio(index);

    // Transición suave Ken Burns
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
          scale: 1.06,
          duration: 9500,
          ease: 'Sine.easeInOut',
        });
      },
    });

    this.actTitle.setText(act.tag);
    this.actSub.setText(act.sub);

    // Máquina de escribir
    this.fullText = act.body;
    this.shownChars = 0;
    this.bodyText.setText('');
    this.typing = true;
    this.contPrompt.setVisible(false);

    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: 18,
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
      this.typing = false;
      if (this.typer) this.typer.remove();
      this.bodyText.setText(this.fullText);
      this.contPrompt.setVisible(true);
    } else {
      sound.playMenuNav();
      this.loadAct(this.actIndex + 1);
    }
  }

  finishIntro() {
    sound.playMenuSelect();
    this.cameras.main.fade(600, 245, 166, 35);
    this.time.delayedCall(600, () => {
      this.scene.start('Menu');
    });
  }
}
