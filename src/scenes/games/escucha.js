// ESCUCHA ACTIVA: mediar entre Doña Rosa y Don Lucho. Cada uno dice algo
// cargado de rabia; elige la respuesta que baja la tensión antes de que se
// acabe el tiempo.

import Phaser from 'phaser';
import { GAME, COLORS } from '../../config.js';
import { ESCUCHA } from '../../data/ch1/games.js';
import { SPEAKERS } from '../../data/speakers.js';
import { sfx } from '../../systems/audio.js';

export default {
  name: 'Escucha activa',
  how: 'Rosa y Lucho están furiosos. Lee lo que dicen y elige la respuesta que reconoce lo que sienten y necesitan (1, 2, 3 o toca). Si la tensión llega al máximo, se rompe el diálogo.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillGradientStyle(0x7ab8d8, 0x7ab8d8, 0xe8d8b0, 0xe8d8b0, 1); g.fillRect(0, 0, WIDTH, 150);
    g.fillStyle(0x5aa648, 1); g.fillRect(0, 150, WIDTH, HEIGHT - 150);
    g.fillStyle(0x4f9a3c, 1); for (let x = 0; x < WIDTH; x += 9) g.fillRect(x, 150 + ((x * 7) % 12), 3, 2);
    g.fillStyle(0xe8846b, 1); g.fillRect(20, 92, 90, 58); g.fillStyle(0x8f9aa0, 1); g.fillTriangle(12, 94, 118, 94, 65, 66);
    g.fillStyle(0xd6c29a, 1); g.fillRect(370, 92, 90, 58); g.fillStyle(0xc9a45c, 1); g.fillTriangle(362, 94, 468, 94, 415, 64);
    s.lucho = s.add.image(58, 158, 'npc_lucho').setOrigin(0.5, 1).setScale(2.8).setDepth(5);
    s.rosa = s.add.image(422, 158, 'npc_rosa').setOrigin(0.5, 1).setScale(2.8).setDepth(5).setFlipX(true);
    s.title('Escucha activa', 'Baja la tensión: escucha antes de responder');
    // Medidor de tensión.
    s.add.text(WIDTH / 2, 50, 'TENSIÓN', { fontFamily: 'monospace', fontSize: '7px', color: '#2a2018' }).setOrigin(0.5).setDepth(30);
    s.add.rectangle(WIDTH / 2, 62, 164, 12, 0x081016, 0.8).setDepth(30).setStrokeStyle(1, 0x2a2018);
    s.tension = 50;
    s.tBar = s.add.rectangle(WIDTH / 2 - 80, 62, 80, 8, 0xe8a04b).setOrigin(0, 0.5).setDepth(31);
    // Crece hacia abajo desde debajo de la barra: con tres líneas no la tapa.
    s.bubble = s.add.text(WIDTH / 2, 73, '', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#1a1410', backgroundColor: '#f3ecd8', padding: { x: 8, y: 6 }, align: 'center', wordWrap: { width: 220 } }).setOrigin(0.5, 0).setDepth(32);
    s.tipText = s.add.text(WIDTH / 2, 139, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#1a3a2a', fontStyle: 'italic', align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5).setDepth(32);
  },

  setTension(s, v) {
    s.tension = Phaser.Math.Clamp(v, 0, 100);
    s.tweens.add({ targets: s.tBar, width: (s.tension / 100) * 160, duration: 300 });
    s.tBar.setFillStyle(s.tension > 70 ? 0xe8604b : s.tension > 40 ? 0xe8a04b : 0x8fd694);
  },

  start(s) {
    s.round = 0;
    s.okCount = 0;
    this.setTension(s, 50);
    s.key(['ONE'], () => this.answer(s, 0));
    s.key(['TWO'], () => this.answer(s, 1));
    s.key(['THREE'], () => this.answer(s, 2));
    s.key(['UP', 'W'], () => this.move(s, -1));
    s.key(['DOWN', 'S'], () => this.move(s, 1));
    s.key(['X', 'ENTER', 'SPACE'], () => this.answer(s, s.cursor));
    s.onUpdate((t, dt) => {
      if (s.waiting) return;
      s.left -= dt;
      if (s.clock) s.clock.width = Math.max(0, (s.left / (ESCUCHA.seconds * 1000)) * 200);
      if (s.left <= 0) this.answer(s, -1);
    });
    s.clock = s.add.rectangle(GAME.WIDTH / 2 - 100, 40, 200, 4, 0xe3b04b).setOrigin(0, 0.5).setDepth(31);
    this.showRound(s);
  },

  showRound(s) {
    const { WIDTH } = GAME;
    const r = ESCUCHA.rounds[s.round];
    s.waiting = false;
    s.left = ESCUCHA.seconds * 1000;
    s.cursor = 0;
    s.tipText.setText('');
    const who = r.who === 'lucho' ? s.lucho : s.rosa;
    s.tweens.add({ targets: who, y: 152, duration: 120, yoyo: true, repeat: 1 });
    s.bubble.setText((SPEAKERS[r.who].name) + ':\n«' + r.t + '»').setX(r.who === 'lucho' ? 200 : 280);
    if (s.opts) s.opts.forEach((o) => o.destroy());
    s.opts = r.options.map((t, i) => {
      const b = s.button(WIDTH / 2, 170 + i * 32, 330, 27, `${i + 1}. ${t}`, () => this.answer(s, i), { size: '10px' });
      b.label.setAlign('left');
      return b;
    });
    this.move(s, 0);
    sfx(r.who === 'lucho' ? 'hit' : 'select');
  },

  move(s, d) {
    if (!s.opts) return;
    s.cursor = Phaser.Math.Wrap((s.cursor || 0) + d, 0, s.opts.length);
    s.opts.forEach((o, i) => o.bg.setStrokeStyle(2, i === s.cursor ? 0xffe070 : 0xe3b04b, i === s.cursor ? 1 : 0.5));
  },

  answer(s, i) {
    if (s.waiting || s.ended) return;
    s.waiting = true;
    const r = ESCUCHA.rounds[s.round];
    const ok = i === r.ok;
    const who = r.who === 'lucho' ? s.lucho : s.rosa;
    if (ok) {
      s.okCount++;
      this.setTension(s, s.tension - 25);
      s.good(who.x, who.y - 70);
      s.pop('♥', '#ff9ec4', 120, '22px').setX(who.x);
      s.tipText.setColor('#1a5a2a');
    } else {
      this.setTension(s, s.tension + 25);
      s.bad();
      s.pop(i < 0 ? '¡Tiempo!' : '💢', '#e8604b', 120, '20px').setX(who.x);
      s.tipText.setColor('#7a2a1a');
    }
    s.opts.forEach((o, k) => o.bg.setFillStyle(k === r.ok ? 0x2f6b3f : 0x2a1d2e, 0.95));
    s.tipText.setText((ok ? '✓ ' : '✗ ') + r.tip);
    s.time.delayedCall(2200, () => {
      if (s.ended) return;
      if (s.tension >= 100) { s.lose('La tensión explotó y Lucho se encerró en su casa. Escucha primero: reconoce lo que sienten antes de proponer.'); return; }
      s.round++;
      if (s.round >= ESCUCHA.rounds.length) {
        if (s.okCount >= ESCUCHA.need) s.win(s.okCount, `${s.okCount} de ${ESCUCHA.rounds.length} respuestas que unen. Cuando alguien se siente escuchado, deja de gritar y empieza a negociar.`);
        else s.lose(`Solo ${s.okCount} de ${ESCUCHA.rounds.length} respuestas bajaron la tensión. Inténtalo otra vez: reconoce emociones, busca necesidades, mira hacia la reparación.`);
        return;
      }
      this.showRound(s);
    });
  },
};
