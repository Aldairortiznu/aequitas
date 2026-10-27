// ENSEÑAR: {el} {explorador} ayuda a dos vecinos a resolver su lío con una norma
// que ya aprendió. Paso 1 (aplicar): ¿qué carta del Códice sirve aquí? Paso 2
// (enseñar): ¿cómo se lo explicas con palabras sencillas? Si lo entienden, lo
// adoptan, y el puerto recupera un poco de orden.

import Phaser from 'phaser';
import { GAME, COLORS } from '../../config.js';
import { TEACH } from '../../data/ch1/games.js';
import { CODEX, FAMILIES } from '../../data/codex.js';
import { sfx } from '../../systems/audio.js';
import { brokenTower } from '../places.js';

export default {
  name: 'Enseñar lo aprendido',
  how: 'Aplica lo que sabes: elige la norma del Códice que resuelve el lío y explícala con palabras sencillas. Si la gente la entiende, la adopta... y el puerto recupera un poco de orden.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    s.lesson = TEACH[s.data0.lesson] || TEACH.perro;
    const L = s.lesson;
    const g = s.add.graphics();
    g.fillGradientStyle(0x9fc3c8, 0x9fc3c8, 0xe8d8b0, 0xe8d8b0, 1); g.fillRect(0, 0, WIDTH, 170);
    let seed = 5;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (const [x, w, h] of [[20, 18, 50], [120, 14, 34], [330, 20, 60], [430, 14, 40]]) brokenTower(g, x, 170, w, h, 0xb8c4c0, rnd, 0xd8e0dc);
    g.fillStyle(0x8a7a62, 1); g.fillRect(0, 170, WIDTH, HEIGHT - 170);
    g.fillStyle(0x7a6a52, 1); for (let x = 0; x < WIDTH; x += 11) g.fillRect(x, 172 + ((x * 7) % 18), 4, 1);
    s.left = s.add.image(40, 232, L.left).setOrigin(0.5, 1).setScale(2.2).setDepth(5);
    s.right = s.add.image(440, 232, L.right).setOrigin(0.5, 1).setScale(2.2).setDepth(5).setFlipX(true);
    s.title('Enseñar · ' + L.title, '');
    const box = s.add.graphics().setDepth(20);
    box.fillStyle(0xefe3c2, 0.97); box.fillRoundedRect(70, 28, WIDTH - 140, 50, 8);
    box.lineStyle(2, 0x8a6034, 1); box.strokeRoundedRect(70, 28, WIDTH - 140, 50, 8);
    s.add.text(WIDTH / 2, 53, L.situation, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', align: 'center', wordWrap: { width: WIDTH - 160 }, lineSpacing: 1 }).setOrigin(0.5).setDepth(21);
    s.stepText = s.add.text(WIDTH / 2, 90, '', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2a2018' }).setOrigin(0.5).setDepth(21);
    s.fbText = s.add.text(WIDTH / 2, 254, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', align: 'center', wordWrap: { width: WIDTH - 110 }, backgroundColor: '#efe3c2ee', padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(60).setVisible(false);
  },

  start(s) {
    s.mistakes = 0;
    s.sel = 0;
    s.step = 1;
    s.key(['LEFT', 'UP', 'A', 'W'], () => this.move(s, -1));
    s.key(['RIGHT', 'DOWN', 'D', 'S'], () => this.move(s, 1));
    s.key(['ONE'], () => this.pick(s, 0));
    s.key(['TWO'], () => this.pick(s, 1));
    s.key(['THREE'], () => this.pick(s, 2));
    s.key(['X', 'ENTER', 'SPACE', 'E'], () => this.pick(s, s.sel));
    this.showCards(s);
  },

  // Paso 1: ¿qué norma aplica?
  showCards(s) {
    const L = s.lesson;
    s.stepText.setText('Paso 1 de 2 · ¿Qué norma del Códice aplica?');
    const ids = Phaser.Utils.Array.Shuffle([L.card, ...L.distractors]);
    s.choices = ids.map((id, i) => {
      const c = CODEX[id];
      const x = GAME.WIDTH / 2 + (i - 1) * 132;
      const col = Phaser.Display.Color.HexStringToColor(FAMILIES[c.fam].color).color;
      const b = s.button(x, 128, 124, 46, '', () => this.pick(s, i), { fill: 0x16303a, stroke: col });
      b.label.setText(c.ley + '\n' + c.titulo).setFontSize(8).setLineSpacing(2);
      return { b, ok: id === L.card, used: false, id };
    });
    s.sel = 0;
    this.paint(s);
  },

  // Paso 2: ¿cómo se lo explicas?
  showOptions(s) {
    const L = s.lesson;
    s.step = 2;
    s.stepText.setText('Paso 2 de 2 · ' + L.q);
    s.choices = L.options.map((o, i) => {
      const b = s.button(GAME.WIDTH / 2, 174 + i * 29, 340, 26, `${i + 1}. ${o.t}`, () => this.pick(s, i), { size: '9px' });
      return { b, ok: o.ok, used: false, fb: o.fb };
    });
    s.sel = 0;
    this.paint(s);
  },

  paint(s) {
    (s.choices || []).forEach((c, i) => {
      if (c.used) return;
      c.b.bg.setStrokeStyle(2, i === s.sel ? 0xffe070 : 0xe3b04b, i === s.sel ? 1 : 0.55);
      c.b.setScale(i === s.sel ? 1.03 : 1);
    });
  },

  move(s, d) {
    if (!s.choices || s.locked) return;
    for (let k = 0; k < s.choices.length; k++) {
      s.sel = Phaser.Math.Wrap(s.sel + d, 0, s.choices.length);
      if (!s.choices[s.sel].used) break;
    }
    sfx('select');
    this.paint(s);
  },

  react(s, good) {
    [s.left, s.right].forEach((im, i) => {
      if (good) s.tweens.add({ targets: im, y: im.y - 8, duration: 140, yoyo: true, repeat: 1, delay: i * 90 });
      else s.tweens.add({ targets: im, x: im.x + (i ? -3 : 3), duration: 60, yoyo: true, repeat: 3 });
      const t = s.add.text(im.x, im.y - 64, good ? '♥' : '¿?', { fontFamily: 'Georgia, serif', fontSize: good ? '16px' : '12px', color: good ? '#ff8fb8' : '#2a2018' }).setOrigin(0.5).setDepth(70);
      s.tweens.add({ targets: t, y: t.y - 14, alpha: 0, duration: 900, delay: i * 90, onComplete: () => t.destroy() });
    });
  },

  feedback(s, text, good) {
    s.fbText.setText(text).setColor(good ? '#1f5a2f' : '#8a2a22').setVisible(true).setAlpha(0);
    s.tweens.add({ targets: s.fbText, alpha: 1, duration: 200 });
  },

  pick(s, i) {
    if (s.locked || !s.choices || !s.choices[i] || s.choices[i].used) return;
    const c = s.choices[i];
    s.sel = i;
    if (!c.ok) {
      s.mistakes++;
      c.used = true;
      c.b.bg.setFillStyle(0x3a2a2a, 0.9).setStrokeStyle(2, 0x8a2a22, 0.8);
      c.b.label.setColor('#9a8a8a');
      c.b.bg.disableInteractive();
      s.bad();
      this.react(s, false);
      if (s.step === 1) this.feedback(s, `Esa carta no resuelve este lío. Piensa: ¿qué tipo de problema es?${s.mistakes >= 2 ? ' (Pista de Lumen: ' + CODEX[s.lesson.card].titulo.toLowerCase() + '.)' : ''}`, false);
      else this.feedback(s, s.lesson.options[i].fb, false);
      this.move(s, 1);
      return;
    }
    // Acierto.
    s.locked = true;
    s.good(c.b.x, c.b.y);
    this.react(s, true);
    if (s.step === 1) {
      c.b.bg.setFillStyle(0x2f6b3f, 0.95);
      this.feedback(s, '¡Esa es! Ahora explícala de forma que la entiendan.', true);
      s.time.delayedCall(700, () => {
        s.choices.forEach((o) => { if (o !== c) s.tweens.add({ targets: o.b, alpha: 0, duration: 250, onComplete: () => o.b.destroy() }); });
        s.tweens.add({ targets: c.b, x: GAME.WIDTH / 2, y: 122, scale: 1, duration: 300, ease: 'Cubic.out' });
        s.time.delayedCall(320, () => { s.locked = false; s.fbText.setVisible(false); this.showOptions(s); });
      });
      return;
    }
    c.b.bg.setFillStyle(0x2f6b3f, 0.95);
    s.choices.forEach((o) => { if (o !== c) o.b.setAlpha(0.35); });
    this.feedback(s, c.fb, true);
    s.pop('¡Lo entendieron!', '#8fd694', 150, '18px');
    s.time.delayedCall(1700, () => s.win(Math.max(1, 3 - s.mistakes), c.fb + '\n\nLa gente adoptó la norma: el puerto recupera un poco de orden.'));
  },
};
