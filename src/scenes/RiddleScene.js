// Sistema de acertijos de Reverdecer (Fase 6).
// Soporta tres tipos: 'completar' (escribir), 'ordenar' (ordenar palabras) y
// 'eleccion' (elegir). Muestra el libro, dónde leer y la pista, para que la
// jugadora REALMENTE busque la respuesta en la obra real.
//
// Uso: this.scene.launch('Riddle', { riddle, returnScene, onSolved });
//      this.scene.pause();

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { normalize, matchesAny } from '../systems/text.js';

const FUENTE_LABEL = { filosofia: 'Filosofía', literatura: 'Literatura', biblia: 'Biblia' };

export default class RiddleScene extends Phaser.Scene {
  constructor() {
    super('Riddle');
  }

  init(data) {
    this.riddle = data.riddle;
    this.returnScene = data.returnScene || 'World';
    this.onSolved = data.onSolved || null;
    this.solved = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const r = this.riddle;

    // Fondo.
    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.97);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.green).color, 1);
    g.strokeRect(8, 8, WIDTH - 16, HEIGHT - 16);

    // Encabezado: fuente · libro · autor.
    this.add.text(16, 14, `${FUENTE_LABEL[r.fuente] || ''} · ${r.libro}`, {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.gold,
    });
    this.add.text(16, 27, r.autor, {
      fontFamily: 'Georgia, serif', fontSize: '9px', color: '#9be8a6', fontStyle: 'italic',
    });

    // Dónde leer (el acertijo invita a leer la obra real).
    this.add.text(16, 42, `Para resolverlo, lee: ${r.donde}`, {
      fontFamily: 'monospace', fontSize: '8px', color: '#bfe0c8',
      wordWrap: { width: WIDTH - 32 },
    });

    // Pista (voz de Jerónimo/Amanda).
    this.add.text(16, 60, r.pista, {
      fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream,
      fontStyle: 'italic', wordWrap: { width: WIDTH - 32 }, lineSpacing: 2,
    });

    // Pregunta.
    this.add.text(16, 112, r.pregunta, {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.greenLight,
      wordWrap: { width: WIDTH - 32 }, lineSpacing: 2,
    });

    // Zona de respuesta según el tipo.
    this.feedback = this.add.text(WIDTH / 2, HEIGHT - 40, '', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#ff8a8a',
    }).setOrigin(0.5);

    if (r.tipo === 'completar') this.buildCompletar();
    else if (r.tipo === 'ordenar') this.buildOrdenar();
    else if (r.tipo === 'eleccion') this.buildEleccion();

    this.add.text(WIDTH / 2, HEIGHT - 16, 'Esc: salir (sin resolver)', {
      fontFamily: 'monospace', fontSize: '8px', color: '#7fae8c',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => this.close(false));
  }

  // ---------------------------------------------------------- COMPLETAR
  buildCompletar() {
    const { WIDTH } = GAME;
    this.answer = '';
    this.inputBox = this.add.text(WIDTH / 2, 165, '_', {
      fontFamily: 'monospace', fontSize: '14px', color: COLORS.cream,
      backgroundColor: '#0d2016', padding: { x: 8, y: 5 },
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 188, 'Escribe la respuesta y presiona Enter', {
      fontFamily: 'monospace', fontSize: '8px', color: '#7fae8c',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (e) => {
      if (this.solved) return;
      if (e.key === 'Enter') {
        this.check(matchesAny(this.answer, this.riddle.respuestas));
      } else if (e.key === 'Backspace') {
        this.answer = this.answer.slice(0, -1);
      } else if (e.key.length === 1 && this.answer.length < 28) {
        this.answer += e.key;
      }
      this.inputBox.setText(this.answer || '_');
    });
  }

  // ---------------------------------------------------------- ORDENAR
  buildOrdenar() {
    const { WIDTH } = GAME;
    this.chosen = []; // palabras elegidas en orden
    const words = Phaser.Utils.Array.Shuffle(this.riddle.fraseCorrecta.split(' ').slice());

    this.answerText = this.add.text(WIDTH / 2, 158, '— — —', {
      fontFamily: 'monospace', fontSize: '12px', color: COLORS.cream,
      backgroundColor: '#0d2016', padding: { x: 8, y: 5 }, align: 'center',
      wordWrap: { width: WIDTH - 40 },
    }).setOrigin(0.5);

    this.tiles = [];
    const startY = 188;
    let x = 24;
    let y = startY;
    words.forEach((w) => {
      const t = this.add.text(x, y, w, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.gold,
        backgroundColor: '#143524', padding: { x: 6, y: 4 },
      }).setInteractive({ useHandCursor: true });
      t.word = w;
      t.on('pointerdown', () => this.pickWord(t));
      this.tiles.push(t);
      x += t.width + 8;
      if (x > WIDTH - 60) { x = 24; y += 22; }
    });

    this.add.text(WIDTH / 2, startY - 14, 'Toca las palabras en orden (toca de nuevo para quitar)', {
      fontFamily: 'monospace', fontSize: '8px', color: '#7fae8c',
    }).setOrigin(0.5);
  }

  pickWord(tile) {
    if (this.solved) return;
    if (tile.picked) {
      tile.picked = false;
      tile.setColor(COLORS.gold).setAlpha(1);
      this.chosen = this.chosen.filter((w) => w !== tile);
    } else {
      tile.picked = true;
      tile.setColor('#6b8b76').setAlpha(0.5);
      this.chosen.push(tile);
    }
    const phrase = this.chosen.map((t) => t.word).join(' ');
    this.answerText.setText(phrase || '— — —');

    // Si ya eligió todas, evalúa automáticamente.
    if (this.chosen.length === this.tiles.length) {
      this.check(normalize(phrase) === normalize(this.riddle.fraseCorrecta));
    }
  }

  // ---------------------------------------------------------- ELECCION
  buildEleccion() {
    const { WIDTH } = GAME;
    let y = 158;
    this.riddle.opciones.forEach((opt, i) => {
      const t = this.add.text(WIDTH / 2, y, opt, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream,
        backgroundColor: '#143524', padding: { x: 8, y: 5 },
        wordWrap: { width: WIDTH - 80 }, align: 'center',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => t.setColor(COLORS.gold));
      t.on('pointerout', () => t.setColor(COLORS.cream));
      t.on('pointerdown', () => this.check(i === this.riddle.correcta));
      y += t.height + 10;
    });
  }

  // ---------------------------------------------------------- evaluación
  check(correct) {
    if (this.solved) return;
    if (correct) {
      this.solved = true;
      this.feedback.setColor('#9be8a6').setText('¡Correcto!');
      this.showVictory();
    } else {
      this.feedback.setText('Esa no es... vuelve a leer la obra y prueba otra vez.');
      this.cameras.main.shake(150, 0.005);
    }
  }

  showVictory() {
    const { WIDTH, HEIGHT } = GAME;
    const panel = this.add.graphics();
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.shadow).color, 0.85);
    panel.fillRoundedRect(30, 150, WIDTH - 60, 86, 6);
    panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 1);
    panel.strokeRoundedRect(30, 150, WIDTH - 60, 86, 6);

    this.add.text(WIDTH / 2, 164, 'Aprendizaje', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.gold,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 196, '"' + this.riddle.ensenanza + '"', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream,
      fontStyle: 'italic', align: 'center', wordWrap: { width: WIDTH - 80 }, lineSpacing: 3,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, HEIGHT - 16, 'Enter / clic: continuar', {
      fontFamily: 'monospace', fontSize: '8px', color: '#7fae8c',
    }).setOrigin(0.5).setName('contHint');

    this.cameras.main.flash(250, 180, 220, 150);
    this.input.keyboard.once('keydown-ENTER', () => this.close(true));
    this.input.once('pointerdown', () => this.close(true));
  }

  close(solved) {
    this.scene.resume(this.returnScene);
    this.scene.stop();
    if (solved && this.onSolved) this.onSolved(this.riddle);
  }
}
