// EL TABLERO DE LA JUNTA: el silogismo jurídico. En cada caso hay unos hechos;
// quien juega elige la norma que aplica (premisa mayor) y luego la conclusión que
// se sigue de los hechos y la norma. Al final de cada caso se ve la cadena
// completa: HECHOS + NORMA = CONCLUSIÓN. Así razona el derecho.

import Phaser from 'phaser';
import { GAME, COLORS } from '../../config.js';
import { SILOGISMO } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const STEPS = ['HECHOS', 'NORMA', 'CONCLUSIÓN'];

export default {
  name: 'El tablero de la Junta',
  how: 'Así razona el derecho: primero los HECHOS, luego la NORMA que aplica y al final la CONCLUSIÓN que se sigue de los dos. Lee cada caso, elige la norma y después la conclusión (toca, o flechas y X).',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    // Un tablero de corcho con tachuelas, en la pared de la Junta.
    g.fillStyle(0x6e4527, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let x = 0; x < WIDTH; x += 12) { g.fillStyle(0x7a5228, 1); g.fillRect(x, 0, 10, HEIGHT); }
    g.fillStyle(0x4a2e18, 1); g.fillRoundedRect(10, 34, WIDTH - 20, HEIGHT - 40, 6);
    g.fillStyle(0xb08a5a, 1); g.fillRoundedRect(14, 38, WIDTH - 28, HEIGHT - 48, 4);
    const r = (n) => ((n * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 160; i++) { g.fillStyle(0x9a7448, 0.6); g.fillRect(16 + r(i) * (WIDTH - 34), 40 + r(i + 7) * (HEIGHT - 54), 2, 1); }
    s.title('El tablero de la Junta', 'Hechos + norma = conclusión');
    s.caseText = s.add.text(WIDTH - 22, 44, '', { fontFamily: 'monospace', fontSize: '8px', color: '#2a2018' }).setOrigin(1, 0).setDepth(20);
    // El papel del caso.
    s.paper = s.add.graphics().setDepth(18);
    s.paper.fillStyle(0xf3ecd8, 1); s.paper.fillRect(36, 54, WIDTH - 72, 44);
    s.paper.fillStyle(0xc8302a, 1); s.paper.fillCircle(WIDTH / 2, 56, 3);
    s.hechos = s.add.text(WIDTH / 2, 76, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#2a2018', align: 'center', wordWrap: { width: WIDTH - 96 }, lineSpacing: 2 }).setOrigin(0.5).setDepth(20);
    // La cadena: tres eslabones que se van llenando.
    s.chain = STEPS.map((label, i) => {
      const x = WIDTH / 2 + (i - 1) * 128;
      const bg = s.add.rectangle(x, 110, 108, 16, 0x2a1d1a, 0.92).setStrokeStyle(1, 0xe3b04b, 0.6).setDepth(20);
      const t = s.add.text(x, 110, label, { fontFamily: 'monospace', fontSize: '8px', color: '#efe3c2' }).setOrigin(0.5).setDepth(21);
      if (i < 2) s.add.text(x + 64, 110, '➜', { fontFamily: 'monospace', fontSize: '10px', color: '#2a2018' }).setOrigin(0.5).setDepth(21);
      return { bg, t };
    });
    s.ask = s.add.text(WIDTH / 2, 128, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#2a2018', fontStyle: 'italic' }).setOrigin(0.5).setDepth(20);
    s.fb = s.add.text(WIDTH / 2, HEIGHT - 14, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#f3ecd8', align: 'center', wordWrap: { width: WIDTH - 60 }, backgroundColor: '#2a1d1ae6', padding: { x: 6, y: 3 } }).setOrigin(0.5, 1).setDepth(60).setVisible(false);
  },

  start(s) {
    s.cases = Phaser.Utils.Array.Shuffle([...SILOGISMO.cases]).slice(0, SILOGISMO.rounds);
    s.k = 0;
    s.firstTry = 0;
    s.key(['UP', 'W', 'LEFT', 'A'], () => this.move(s, -1));
    s.key(['DOWN', 'S', 'RIGHT', 'D'], () => this.move(s, 1));
    s.key(['ONE'], () => this.pick(s, 0));
    s.key(['TWO'], () => this.pick(s, 1));
    s.key(['THREE'], () => this.pick(s, 2));
    s.key(['X', 'ENTER', 'SPACE', 'E'], () => (s.summary ? this.next(s) : this.pick(s, s.sel)));
    this.showCase(s);
  },

  showCase(s) {
    const c = s.cases[s.k];
    s.caseText.setText(`Caso ${s.k + 1} de ${s.cases.length}`);
    s.hechos.setText(c.hechos);
    s.chain.forEach((l, i) => { l.bg.setFillStyle(i === 0 ? 0x2f6b3f : 0x2a1d1a, 0.92); l.t.setText(STEPS[i]); });
    // Norma: la correcta y dos de otros casos.
    const others = Phaser.Utils.Array.Shuffle(SILOGISMO.cases.filter((o) => o !== c)).slice(0, 2);
    const opts = Phaser.Utils.Array.Shuffle([{ t: c.norm, ok: true }, ...others.map((o) => ({ t: o.norm, ok: false }))]);
    this.showOptions(s, 'NORMA', '¿Qué norma aplica a estos hechos?', opts.map((o) => ({ label: `${o.t[0]} · ${o.t[1]}`, ok: o.ok })));
  },

  showOptions(s, step, ask, opts) {
    (s.choices || []).forEach((c) => c.b.destroy());
    s.step = step;
    s.misses = 0;
    s.ask.setText(ask);
    s.fb.setVisible(false);
    s.choices = opts.map((o, i) => {
      const b = s.button(GAME.WIDTH / 2, 152 + i * 30, 400, 26, `${i + 1}. ${o.label}`, () => this.pick(s, i), { size: '9px', depth: 30 });
      return { b, ok: o.ok, used: false };
    });
    s.sel = 0;
    this.paint(s);
  },

  paint(s) {
    (s.choices || []).forEach((c, i) => {
      if (c.used) return;
      c.b.bg.setStrokeStyle(2, i === s.sel ? 0xffe070 : 0xe3b04b, i === s.sel ? 1 : 0.5);
    });
  },

  move(s, d) {
    if (!s.choices || s.summary) return;
    for (let k = 0; k < s.choices.length; k++) {
      s.sel = Phaser.Math.Wrap(s.sel + d, 0, s.choices.length);
      if (!s.choices[s.sel].used) break;
    }
    sfx('select');
    this.paint(s);
  },

  pick(s, i) {
    if (s.summary || s.locked || !s.choices || !s.choices[i] || s.choices[i].used) return;
    const c = s.choices[i];
    const caso = s.cases[s.k];
    if (!c.ok) {
      s.misses++;
      c.used = true;
      c.b.bg.setFillStyle(0x3a2a2a, 0.9).setStrokeStyle(2, 0x8a2a22, 0.8);
      c.b.label.setColor('#9a8a8a');
      c.b.bg.disableInteractive();
      s.bad();
      const tip = s.step === 'NORMA'
        ? 'Esa norma habla de otra cosa. Pregúntate: ¿qué tipo de problema muestran los hechos?'
        : 'Esa conclusión no se sigue de la norma. Si la norma es cierta y los hechos también, ¿qué tiene que pasar?';
      this.say(s, tip, false);
      this.move(s, 1);
      return;
    }
    if (s.misses === 0) s.firstTry++;
    s.good(c.b.x, c.b.y);
    s.locked = true;
    const link = s.chain[s.step === 'NORMA' ? 1 : 2];
    link.bg.setFillStyle(0x2f6b3f, 0.92);
    s.time.delayedCall(450, () => {
      s.locked = false;
      if (s.step === 'NORMA') {
        const opts = Phaser.Utils.Array.Shuffle([{ label: caso.ok, ok: true }, ...caso.bad.map((t) => ({ label: t, ok: false }))]);
        this.showOptions(s, 'CONCLUSIÓN', `${caso.norm[0]}: ¿qué se concluye?`, opts);
      } else {
        this.showSummary(s, caso);
      }
    });
  },

  say(s, text, good) {
    s.fb.setText(text).setColor(good ? '#c8f0c0' : '#f3d0c0').setVisible(true).setAlpha(0);
    s.tweens.add({ targets: s.fb, alpha: 1, duration: 200 });
  },

  // La cadena completa del caso, para leerla con calma.
  showSummary(s, caso) {
    const { WIDTH } = GAME;
    (s.choices || []).forEach((c) => c.b.destroy());
    s.choices = null;
    s.ask.setText('');
    s.fb.setVisible(false);
    const box = s.add.container(0, 0).setDepth(40);
    const g = s.add.graphics();
    g.fillStyle(0x0d1820, 0.97); g.fillRoundedRect(28, 138, WIDTH - 56, 114, 8);
    g.lineStyle(2, 0xe3b04b, 0.8); g.strokeRoundedRect(28, 138, WIDTH - 56, 114, 8);
    box.add(g);
    const row = (y, label, text, color) => {
      box.add(s.add.text(40, y, label, { fontFamily: 'monospace', fontSize: '8px', color }));
      box.add(s.add.text(118, y, text, { fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream, wordWrap: { width: WIDTH - 162 } }));
    };
    row(146, 'HECHOS', caso.hechos, '#9fd3cf');
    row(174, 'NORMA', `${caso.norm[0]} · ${caso.norm[1]}`, '#e3b04b');
    row(196, 'CONCLUSIÓN', caso.ok, '#8fd694');
    const last = s.k === s.cases.length - 1;
    const b = s.button(WIDTH / 2, 236, 150, 20, last ? 'Terminar' : 'Siguiente caso ▸', () => this.next(s), { size: '10px', depth: 45 });
    box.add(b);
    s.summary = box;
  },

  next(s) {
    if (!s.summary) return;
    s.summary.destroy();
    s.summary = null;
    s.k++;
    if (s.k >= s.cases.length) {
      const total = s.cases.length * 2;
      s.win(s.firstTry, `Acertaste ${s.firstTry} de ${total} pasos al primer intento. Hechos, norma y conclusión: así razona un juez, y así razona también quien concilia.`);
      return;
    }
    this.showCase(s);
  },
};
