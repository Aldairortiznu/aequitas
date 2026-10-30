// ¿POR QUÉ FUNCIONÓ? — después de cada decisión correcta importante (una
// objeción en la audiencia, un punto del acuerdo), una tarjeta explica en tres
// pasos: qué dice la norma, por qué aplica en este caso y qué conviene recordar.
//
// Uso (como la carta del Códice): this.scene.launch('Lesson', { lesson, returnScene });
//   lesson: { titulo, ley, regla, caso, recordar }

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { fmt } from '../systems/text.js';
import { sfx } from '../systems/audio.js';

export default class LessonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Lesson', cameras: CAMERA });
  }

  init(data) {
    this.lesson = data.lesson;
    this.returnScene = data.returnScene || 'Town';
    this.closing = false;
    this.ready = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    if (!this.lesson) { this.close(); return; }
    const L = this.lesson;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x05080a, 0.8).setOrigin(0);
    const W = 404;
    const x0 = (WIDTH - W) / 2;
    const c = this.add.container(0, 0);
    const pad = 16;
    const tw = W - pad * 2;
    let y = 0;
    const put = (o, gap) => { o.setY(y); c.add(o); y += o.height + gap; return o; };
    const label = (t, color) => this.add.text(x0 + pad, 0, t, { fontFamily: 'monospace', fontSize: '8px', color }).setLetterSpacing(1);
    const body = (t, style = {}) => this.add.text(x0 + pad, 0, fmt(t), { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#2a2018', wordWrap: { width: tw }, lineSpacing: 2, ...style });

    y = 12;
    put(this.add.text(WIDTH / 2, 0, '✔ ¿POR QUÉ FUNCIONÓ?', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#2f6b3f', fontStyle: 'bold' }).setOrigin(0.5, 0), 2);
    if (L.titulo) put(this.add.text(WIDTH / 2, 0, L.titulo, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#6e4527', fontStyle: 'italic' }).setOrigin(0.5, 0), 8);
    put(label('1 · LA NORMA' + (L.ley ? '  —  ' + L.ley : ''), '#8a6034'), 2);
    put(body(L.regla), 7);
    put(label('2 · EN ESTE CASO', '#8a6034'), 2);
    put(body(L.caso), 7);
    put(label('3 · PARA RECORDAR', '#2f6b3f'), 3);
    const rec = body('«' + L.recordar + '»', { fontStyle: 'italic', color: '#1f4a2a', align: 'center', wordWrap: { width: tw - 20 } }).setOrigin(0.5, 0).setX(WIDTH / 2);
    const recBg = this.add.rectangle(WIDTH / 2, 0, tw, 0, 0xd8e8c8, 1).setOrigin(0.5, 0).setStrokeStyle(1, 0x2f6b3f, 0.5);
    c.add(recBg);
    recBg.setY(y - 3);
    put(rec, 10);
    recBg.height = rec.height + 6;
    recBg.setSize(tw, rec.height + 6);
    const by = y + 11;
    y += 30;
    const H = y;
    const top = Math.max(6, Math.round((HEIGHT - H) / 2));
    // Pergamino (se dibuja debajo de todo).
    const g = this.add.graphics();
    g.fillStyle(0xf3ecd8, 1); g.fillRoundedRect(x0, 0, W, H, 6);
    g.lineStyle(2, 0xb0893f, 1); g.strokeRoundedRect(x0, 0, W, H, 6);
    g.lineStyle(1, 0xb0893f, 0.4); g.strokeRoundedRect(x0 + 4, 4, W - 8, H - 8, 4);
    c.addAt(g, 0);
    const btnBg = this.add.rectangle(WIDTH / 2, by, 150, 20, 0x2f6b3f, 1).setStrokeStyle(2, 0xe3b04b, 0.9).setInteractive({ useHandCursor: true });
    const btnT = this.add.text(WIDTH / 2, by, 'Entendido ▸', { fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.cream }).setOrigin(0.5);
    c.add([btnBg, btnT]);
    c.setY(top);
    btnBg.on('pointerdown', () => this.close());

    c.setAlpha(0);
    c.y = top + 10;
    this.tweens.add({ targets: c, alpha: 1, y: top, duration: 300, ease: 'Cubic.out' });
    sfx('page');
    // Un instante antes de aceptar teclas: que nadie la cierre sin verla.
    this.time.delayedCall(450, () => { this.ready = true; });
    const go = () => { if (this.ready) this.close(); };
    ['X', 'E', 'ENTER', 'SPACE', 'ESC'].forEach((k) => this.input.keyboard.on('keydown-' + k, go));
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    sfx('confirm');
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
