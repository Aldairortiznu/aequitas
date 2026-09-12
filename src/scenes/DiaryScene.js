// Códice de la Ley & Memoria de Bellium en AEQUITAS.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Registra las normas rescatadas de la Biblioteca y los pactos sociales firmados.

import Phaser from 'phaser';
import { GAME, COLORS, CAPITULOS } from '../config.js';

export default class DiaryScene extends Phaser.Scene {
  constructor() {
    super('Diary');
  }

  init(data) {
    this.entries = (data && data.entries) || [];
    this.returnScene = (data && data.returnScene) || 'World';
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;

    // Fondo papiro oscuro de Bellium
    const g = this.add.graphics();
    g.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgDeep).color, 0.98);
    g.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Marco exterior de oro ámbar
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 1);
    g.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    // Marco interior púrpura
    g.lineStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.purpleRoyal).color, 0.6);
    g.strokeRect(14, 14, WIDTH - 28, HEIGHT - 28);

    // Encabezado
    this.add
      .text(WIDTH / 2, 24, 'CÓDICE DE LA LEY & MEMORIA DE BELLIUM', {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: COLORS.goldLight,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, 38, '· Registro de Precedentes y Restauración del Orden Social ·', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#c9a7eb',
      })
      .setOrigin(0.5);

    // Lista de Capítulos y Artículos rescatados
    let y = 56;
    CAPITULOS.forEach((cap, idx) => {
      const isPrologo = cap.nivel === 0;
      
      const box = this.add.graphics();
      box.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.bgPurple).color, 0.8);
      box.fillRoundedRect(22, y, WIDTH - 44, 32, 4);
      box.lineStyle(1, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.4);
      box.strokeRoundedRect(22, y, WIDTH - 44, 32, 4);

      // Icono y Título
      this.add.text(28, y + 4, `Cap. ${cap.nivel}: ${cap.nombre}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '9.5px',
        color: COLORS.goldLight,
        fontStyle: 'bold',
      });

      // Norma aplicada
      this.add.text(28, y + 17, `⚖️ ${cap.norma} · ${cap.lugar}`, {
        fontFamily: 'monospace',
        fontSize: '7.5px',
        color: '#e5daf0',
      });

      // Estado de florecimiento
      this.add.text(WIDTH - 76, y + 10, '✿ PACTO VIVO', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ffd875',
      });

      y += 36;
    });

    // Filosofía restaurativa al pie
    this.add
      .text(WIDTH / 2, HEIGHT - 28, '«La ley no es castigo: es el pacto que permite a una sociedad florecer.»', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#ffd875',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    this.add
      .text(WIDTH / 2, HEIGHT - 14, 'I / Esc: Volver a la aventura', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#a795b8',
      })
      .setOrigin(0.5);

    const close = () => {
      this.scene.resume(this.returnScene);
      this.scene.stop();
    };
    this.input.keyboard.on('keydown-I', close);
    this.input.keyboard.on('keydown-ESC', close);
  }
}
