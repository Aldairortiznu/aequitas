// RONDA RELÁMPAGO por la radio de la Biblioteca: la Maestra Ulpiana lanza
// frases y tú decides rápido si son legales o no. Rachas = más puntos.

import Phaser from 'phaser';
import { GAME, COLORS } from '../../config.js';
import { QUIZ, QUIZ_ROUNDS, QUIZ_SECONDS } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

export default {
  name: 'Ronda relámpago',
  how: '¿Es legal o no? Responde antes de que se acabe el tiempo: ← o el botón izquierdo para SÍ, → o el derecho para NO. Las rachas suman puntos extra.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillGradientStyle(0x2a1d2e, 0x2a1d2e, 0x14232e, 0x14232e, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let i = 0; i < 6; i++) { g.lineStyle(1, 0xe3b04b, 0.06 + i * 0.02); g.strokeCircle(56, 70, 16 + i * 10); }
    s.add.image(56, 96, 'ulpiana').setOrigin(0.5, 1).setScale(2.2);
    s.add.text(56, 100, 'RADIO · BIBLIOTECA', { fontFamily: 'monospace', fontSize: '6px', color: '#d6c2f0' }).setOrigin(0.5, 0);
    s.title('Ronda relámpago', '¿Es legal o no?');
    s.card = s.add.text(WIDTH / 2 + 30, 88, '', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#1a1410', backgroundColor: '#efe3c2', padding: { x: 10, y: 10 }, align: 'center', wordWrap: { width: 300 }, fixedWidth: 320 }).setOrigin(0.5).setDepth(10);
    s.why = s.add.text(WIDTH / 2, 150, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, align: 'center', wordWrap: { width: 380 } }).setOrigin(0.5, 0).setDepth(10);
    s.scoreText = s.add.text(WIDTH - 10, 8, '', { fontFamily: 'monospace', fontSize: '9px', color: '#ffe9a0', align: 'right' }).setOrigin(1, 0);
  },

  start(s) {
    const { WIDTH } = GAME;
    s.qs = Phaser.Utils.Array.Shuffle(QUIZ.slice()).slice(0, QUIZ_ROUNDS);
    s.i = 0;
    s.score = 0;
    s.points = 0;
    s.streak = 0;
    s.yes = s.button(WIDTH / 2 - 86, 222, 150, 34, '✓  SÍ ES LEGAL', () => this.answer(s, true), { fill: 0x2f6b3f, hover: 0x3f8a52, size: '12px' });
    s.no = s.button(WIDTH / 2 + 86, 222, 150, 34, '✗  NO ES LEGAL', () => this.answer(s, false), { fill: 0x7a2a2a, hover: 0x9a3a3a, size: '12px' });
    s.key(['LEFT', 'A', 'ONE'], () => this.answer(s, true));
    s.key(['RIGHT', 'D', 'TWO'], () => this.answer(s, false));
    s.clock = s.add.rectangle(WIDTH / 2 - 120, 40, 240, 5, 0xe3b04b).setOrigin(0, 0.5).setDepth(31);
    s.onUpdate((t, dt) => {
      if (s.waiting) return;
      s.left -= dt;
      s.clock.width = Math.max(0, (s.left / (QUIZ_SECONDS * 1000)) * 240);
      s.clock.setFillStyle(s.left < 1500 ? 0xe8817a : 0xe3b04b);
      if (s.left <= 0) this.answer(s, null);
    });
    this.show(s);
  },

  show(s) {
    const q = s.qs[s.i];
    s.waiting = false;
    s.left = QUIZ_SECONDS * 1000;
    s.why.setText('');
    s.card.setText(q.t).setScale(0.8).setAlpha(0);
    s.tweens.add({ targets: s.card, scale: 1, alpha: 1, duration: 180, ease: 'Back.out' });
    s.scoreText.setText(`Pregunta ${s.i + 1}/${s.qs.length}\nAciertos: ${s.score} · Puntos: ${s.points}${s.streak > 1 ? `\n🔥 Racha x${s.streak}` : ''}`);
  },

  answer(s, v) {
    if (s.waiting || s.ended) return;
    s.waiting = true;
    const q = s.qs[s.i];
    const ok = v === q.a;
    if (ok) {
      s.score++;
      s.streak++;
      const pts = 100 + Math.round(s.left / 50) + (s.streak - 1) * 25;
      s.points += pts;
      s.good(GAME.WIDTH / 2 + 30, 88);
      s.pop('+' + pts, '#8fd694', 120, '14px');
      s.why.setColor('#bfe8c4');
    } else {
      s.streak = 0;
      s.bad();
      s.why.setColor('#f3c0b8');
      if (v === null) s.pop('¡Tiempo!', '#e8817a', 120, '14px');
    }
    s.why.setText((q.a ? 'SÍ es legal. ' : 'NO es legal. ') + q.why);
    s.time.delayedCall(ok ? 1500 : 2300, () => {
      if (s.ended) return;
      s.i++;
      if (s.i >= s.qs.length) {
        const medal = s.score >= 8 ? '\n🏅 ¡Medalla de la Biblioteca!' : '';
        s.win(s.score, `${s.score} de ${s.qs.length} aciertos · ${s.points} puntos.${medal}\nCada respuesta es una herramienta más para tu viaje.`);
        return;
      }
      this.show(s);
    });
  },
};
