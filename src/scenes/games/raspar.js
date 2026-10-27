// RASPAR EL CASCO: bajo la pintura nueva («LA ESPERANZA») hay letras viejas.
// Raspa con cuidado (arrastra el dedo o mueve la espátula) hasta leer el nombre.

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { sfx } from '../../systems/audio.js';

const BX = 70;
const BY = 92;
const BW = 340;
const BH = 70;

export default {
  name: 'Raspar el casco',
  how: 'Debajo de «LA ESPERANZA» se adivinan letras viejas. Raspa la pintura arrastrando el dedo o el ratón (o mueve la espátula con las flechas) hasta descubrir el nombre original.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillStyle(0x1f6a66, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let y = 0; y < HEIGHT; y += 14) { g.fillStyle(0x2f8f8a, 1); g.fillRect(0, y, WIDTH, 11); g.fillStyle(0x3fa3a0, 1); g.fillRect(0, y, WIDTH, 2); }
    // El nombre viejo, pintado a mano hace años.
    g.fillStyle(0xd8cbb0, 1); g.fillRect(BX, BY, BW, BH);
    g.fillStyle(0xb5a68a, 1); g.fillRect(BX, BY + BH - 4, BW, 4);
    s.add.text(BX + BW / 2, BY + BH / 2, 'NIÑA MERCEDES', { fontFamily: 'Georgia, serif', fontSize: '34px', color: '#7a1f1a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);
    // La pintura nueva encima.
    s.paint = s.add.renderTexture(BX, BY, BW, BH).setOrigin(0).setDepth(2);
    s.paint.fill(0x2f8f8a, 1);
    const stripe = s.add.rectangle(0, 0, BW, 10, 0xf3ecd8).setOrigin(0);
    s.paint.draw(stripe, 0, 30);
    stripe.destroy();
    // (se dibuja dentro de la pintura y se destruye antes de mostrarse)
    const word = s.add.text(0, 0, 'LA ESPERANZA', { fontFamily: 'monospace', fontSize: '26px', color: '#1a2a2a' });
    s.paint.draw(word, BW / 2 - word.width / 2, 4);
    word.destroy();
    if (!s.textures.exists('mg_brush')) {
      const b = s.add.graphics();
      b.fillStyle(0xffffff, 1); b.fillCircle(11, 11, 11);
      b.generateTexture('mg_brush', 22, 22);
      b.destroy();
    }
    s.tool = s.add.image(WIDTH / 2, BY + BH / 2, 'ic_brush').setScale(2.2).setDepth(5).setOrigin(0.2, 0.8);
    s.title('Raspar el casco', 'Descubre el nombre original');
    s.progress = s.add.text(WIDTH / 2, 190, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f3ecd8' }).setOrigin(0.5);
    // Rejilla de cobertura sobre las letras.
    s.cells = [];
    for (let y = BY + 14; y < BY + BH - 10; y += 10) for (let x = BX + 18; x < BX + BW - 18; x += 10) s.cells.push({ x, y, done: false });
    s.doneCount = 0;
  },

  start(s) {
    s.input.on('pointerdown', (p) => { s.scraping = true; this.scrape(s, p.x, p.y); });
    s.input.on('pointermove', (p) => { if (p.isDown) this.scrape(s, p.x, p.y); });
    s.input.on('pointerup', () => { s.scraping = false; });
    s.onUpdate((t, dt) => {
      const d = s.dir();
      if (d.x || d.y) {
        const nx = Phaser.Math.Clamp(s.tool.x + d.x * 160 * (dt / 1000), BX, BX + BW);
        const ny = Phaser.Math.Clamp(s.tool.y + d.y * 160 * (dt / 1000), BY, BY + BH);
        this.scrape(s, nx, ny);
      }
    });
    this.update(s);
  },

  scrape(s, x, y) {
    if (!s.playing || s.ended) return;
    s.tool.setPosition(x, y);
    if (x < BX - 10 || x > BX + BW + 10 || y < BY - 10 || y > BY + BH + 10) return;
    s.paint.erase('mg_brush', x - BX - 11, y - BY - 11);
    let changed = false;
    s.cells.forEach((c) => { if (!c.done && Phaser.Math.Distance.Between(c.x, c.y, x, y) < 12) { c.done = true; s.doneCount++; changed = true; } });
    if (changed) {
      if (Math.random() < 0.5) {
        const f = s.add.rectangle(x, y, 3, 2, Math.random() < 0.5 ? 0x2f8f8a : 0x3fa3a0).setDepth(6);
        s.tweens.add({ targets: f, y: y + Phaser.Math.Between(20, 50), x: x + Phaser.Math.Between(-10, 10), alpha: 0, angle: 180, duration: 600, onComplete: () => f.destroy() });
      }
      if (s.time.now > (s.sndAt || 0)) { s.sndAt = s.time.now + 90; sfx('attack'); }
      this.update(s);
    }
  },

  update(s) {
    const pct = Math.round((s.doneCount / s.cells.length) * 100);
    s.progress.setText(`Raspado: ${Math.min(100, Math.round(pct / 0.7))}%`);
    if (pct >= 70 && !s.revealed) {
      s.revealed = true;
      s.tweens.add({ targets: s.paint, alpha: 0, duration: 700 });
      s.good(GAME.WIDTH / 2, BY + BH / 2);
      s.pop('«NIÑA MERCEDES»', '#ffe9a0', 60, '18px');
      s.time.delayedCall(1200, () => s.win(1, 'Bajo la pintura nueva estaba el nombre original de la lancha: «Niña Mercedes». Tenía nombre... y tenía dueño.'));
    }
  },
};
