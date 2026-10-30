// REMAR A PUERTO GARZA: la canoa baja por el Caño Grande tras la Creciente.
// Esquiva troncos, piedras y remolinos; recoge las páginas que flotan.

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { REMAR } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const L = 92;
const R = 388;

export default {
  pad: true, // se juega con la palanca
  name: 'Remar a Puerto Garza',
  how: 'El río todavía arrastra lo que dejó la Creciente. Esquiva troncos, piedras y remolinos (← →, o toca a los lados) y recoge las páginas del Códice que flotan.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    s.water = s.add.tileSprite(L, 0, R - L, HEIGHT, 't_water0').setOrigin(0).setDepth(0);
    s.bankL = s.add.tileSprite(0, 0, L, HEIGHT, 't_grass0').setOrigin(0).setDepth(1);
    s.bankR = s.add.tileSprite(R, 0, WIDTH - R, HEIGHT, 't_grass0').setOrigin(0).setDepth(1);
    s.sandL = s.add.tileSprite(L - 14, 0, 14, HEIGHT, 't_sand0').setOrigin(0).setDepth(2);
    s.sandR = s.add.tileSprite(R, 0, 14, HEIGHT, 't_sand0').setOrigin(0).setDepth(2);
    s.add.rectangle(L, 0, 3, HEIGHT, 0xe8f4ee, 0.5).setOrigin(0).setDepth(3);
    s.add.rectangle(R - 3, 0, 3, HEIGHT, 0xe8f4ee, 0.5).setOrigin(0).setDepth(3);
    if (!s.textures.exists('mg_log')) {
      const g = s.add.graphics();
      g.fillStyle(0x6e4527, 1); g.fillRoundedRect(0, 0, 46, 11, 4);
      g.fillStyle(0x8a5a34, 1); g.fillRect(3, 2, 40, 3);
      g.fillStyle(0x4a2e18, 1); g.fillCircle(5, 5, 4); g.fillCircle(41, 5, 4);
      g.fillStyle(0x9a7448, 1); g.fillCircle(5, 5, 2); g.fillCircle(41, 5, 2);
      g.generateTexture('mg_log', 46, 11);
      g.destroy();
    }
    // La canoa con su tripulación.
    const c = s.add.container(240, 222).setDepth(20);
    const hull = s.add.graphics();
    hull.fillStyle(0x4a2e18, 1); hull.fillEllipse(0, 0, 18, 46);
    hull.fillStyle(0x8a5a34, 1); hull.fillEllipse(0, 0, 14, 40);
    hull.fillStyle(0x6e4527, 1); hull.fillRect(-5, -8, 10, 2); hull.fillRect(-5, 8, 10, 2);
    c.add(hull);
    c.add(s.add.image(0, 10, 'player_back').setOrigin(0.5, 1).setScale(0.9));
    c.add(s.add.image(0, -10, 'tinto').setOrigin(0.5, 1).setScale(0.7).setAngle(-90));
    s.lumenImg = s.add.image(10, -12, 'lumen').setOrigin(0.5, 1);
    c.add(s.lumenImg);
    s.canoe = c;
    s.vx = 0;
    s.lives = REMAR.lives;
    s.pages = 0;
    s.invuln = 0;
    s.things = [];
    s.title('Remar a Puerto Garza', '');
    s.livesText = s.add.text(10, 8, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ff9e9e' }).setDepth(30);
    s.pagesText = s.add.text(WIDTH - 10, 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffe9a0' }).setOrigin(1, 0).setDepth(30);
    this.hud(s);
    // Decorado de orilla que pasa.
    s.decor = [];
    for (let i = 0; i < 8; i++) {
      const left = i % 2 === 0;
      const im = s.add.image(left ? Phaser.Math.Between(10, L - 30) : Phaser.Math.Between(R + 22, WIDTH - 12), (i * HEIGHT) / 8, left || i % 3 ? 'pr_palm' : 'tx_tree').setOrigin(0.5, 1).setDepth(4);
      s.decor.push(im);
    }
  },

  hud(s) {
    s.livesText.setText('♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, REMAR.lives - s.lives)));
    s.pagesText.setText('📜 ' + s.pages);
  },

  start(s) {
    const { WIDTH, HEIGHT } = GAME;
    const total = REMAR.seconds;
    s.elapsed = 0;
    s.timer(total, () => this.arrive(s));
    s.add.text(WIDTH / 2, 46, 'Puerto Garza', { fontFamily: 'monospace', fontSize: '7px', color: '#bfe0d8' }).setOrigin(0.5, 0).setDepth(31);
    s.nextSpawn = 600;
    s.input.on('pointerdown', (p) => { s.touchX = p.worldX; });
    s.input.on('pointermove', (p) => { if (p.isDown) s.touchX = p.worldX; });
    s.input.on('pointerup', () => { s.touchX = null; });
    s.onUpdate((t, dt) => this.tick(s, dt));
  },

  spawn(s) {
    const r = Math.random();
    const x = Phaser.Math.Between(L + 22, R - 22);
    let o;
    if (r < 0.42) { o = s.add.image(x, -20, 'mg_log').setAngle(Phaser.Math.Between(-25, 25)); o.kind = 'hit'; o.rad = 16; }
    else if (r < 0.62) { o = s.add.image(x, -20, 'tx_rock').setScale(1.2); o.kind = 'hit'; o.rad = 10; }
    else if (r < 0.78) {
      o = s.add.graphics({ x, y: -20 });
      o.lineStyle(2, 0xbfeee4, 0.8); o.strokeCircle(0, 0, 12); o.lineStyle(2, 0x7cc3b6, 0.7); o.strokeCircle(0, 0, 7); o.lineStyle(1, 0xffffff, 0.6); o.strokeCircle(0, 0, 3);
      o.kind = 'hit'; o.rad = 12; o.spin = true;
    } else { o = s.add.image(x, -20, 'pg_codice').setScale(1.3); o.kind = 'page'; o.rad = 12; }
    o.setDepth(10);
    o.drift = Phaser.Math.FloatBetween(-12, 12);
    s.things.push(o);
  },

  tick(s, dt) {
    const sec = dt / 1000;
    s.elapsed += dt;
    const speed = 95 + Math.min(70, s.elapsed / 500);
    s.water.tilePositionY -= speed * sec;
    [s.bankL, s.bankR, s.sandL, s.sandR].forEach((b) => { b.tilePositionY -= speed * sec; });
    s.decor.forEach((d) => { d.y += speed * sec; if (d.y > GAME.HEIGHT + 30) d.y = -10; });
    // Mover la canoa.
    let ax = s.dir().x;
    if (s.touchX != null) ax = Phaser.Math.Clamp((s.touchX - s.canoe.x) / 30, -1, 1);
    s.vx = Phaser.Math.Linear(s.vx, ax * 170, 0.18);
    s.canoe.x = Phaser.Math.Clamp(s.canoe.x + s.vx * sec, L + 14, R - 14);
    s.canoe.setAngle(s.vx / 20);
    s.lumenImg.y = -12 + Math.sin(s.elapsed / 220) * 2;
    // Aparecen cosas en el río.
    s.nextSpawn -= dt;
    if (s.nextSpawn <= 0) { this.spawn(s); s.nextSpawn = Math.max(320, 820 - s.elapsed / 70); }
    s.invuln = Math.max(0, s.invuln - dt);
    s.canoe.setAlpha(s.invuln > 0 && Math.floor(s.invuln / 90) % 2 ? 0.4 : 1);
    s.things = s.things.filter((o) => {
      o.y += speed * sec;
      o.x += o.drift * sec;
      if (o.spin) o.rotation += 4 * sec;
      const d = Phaser.Math.Distance.Between(o.x, o.y, s.canoe.x, s.canoe.y);
      if (d < o.rad + 9) {
        if (o.kind === 'page') { s.pages++; s.good(o.x, o.y); sfx('page'); this.hud(s); o.destroy(); return false; }
        if (s.invuln <= 0) {
          s.lives--; s.invuln = 1200; s.bad(); this.hud(s);
          if (s.lives <= 0) { s.canoe.setAngle(90); s.lose('¡Al agua! Por suerte Tinto nada como un pez. Respira y vuelve a intentarlo.', true); }
        }
      }
      if (o.y > GAME.HEIGHT + 30) { o.destroy(); return false; }
      return true;
    });
  },

  arrive(s) {
    if (s.ended) return;
    const dock = s.add.tileSprite(GAME.WIDTH / 2, -40, 140, 40, 't_planks').setDepth(12);
    s.tweens.add({ targets: dock, y: 120, duration: 1200, ease: 'Cubic.out' });
    s.tweens.add({ targets: s.canoe, x: GAME.WIDTH / 2, y: 168, duration: 1300, ease: 'Sine.inOut' });
    s.time.delayedCall(1300, () => s.win(s.pages, `¡Llegaste a Puerto Garza con ${s.pages} página${s.pages === 1 ? '' : 's'} del Códice rescatada${s.pages === 1 ? '' : 's'} del río!`));
  },
};
