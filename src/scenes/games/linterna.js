// LA BODEGA A OSCURAS: con la luz de Lumen, busca entre los cachivaches la placa
// del motor. Mueve la luz (flechas, palanca o el dedo) y examina con X o tocando.

import Phaser from 'phaser';
import { GAME } from '../../config.js';
import { LINTERNA } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const JUNK = [
  { k: 'redes', x: 372, y: 196, r: 30, name: 'Redes viejas', line: 'Huele a pescado de hace siete años... Pero algo brilla debajo.' },
  { k: 'remo', x: 96, y: 118, r: 22, name: 'Un remo roto', line: 'Un remo partido en dos. Ya remó lo suyo.' },
  { k: 'latas', x: 170, y: 206, r: 22, name: 'Latas de pintura', line: 'Pintura turquesa, la misma de la lancha. Alguien la pintó hace poco.' },
  { k: 'motor', x: 286, y: 112, r: 24, name: 'Un motor sin piezas', line: 'Un motor viejo, desarmado. No es rojo: no es el de la lancha.' },
  { k: 'llanta', x: 66, y: 210, r: 20, name: 'Una llanta', line: 'Una llanta de carro. Tinto la mira con desconfianza.' },
  { k: 'anzuelos', x: 214, y: 120, r: 20, name: 'Cajas de anzuelos', line: 'Anzuelos oxidados. Mejor no meter la mano.' },
  { k: 'nevera', x: 430, y: 100, r: 24, name: 'Una nevera oxidada', line: 'Vacía. Menos mal.' },
];

export default {
  pad: true, // se juega con la palanca
  name: 'La bodega a oscuras',
  how: 'La bodega está a oscuras. Mueve la luz de Lumen (flechas, palanca o arrastrando el dedo) y examina lo que encuentres (X o toca). Encuentra la placa del motor antes de que se agote la batería.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillStyle(0x3a2a1a, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let x = 0; x < WIDTH; x += 20) { g.fillStyle(0x4a3422, 1); g.fillRect(x, 0, 18, 150); }
    g.fillStyle(0x2a1d14, 1); g.fillRect(0, 150, WIDTH, HEIGHT - 150);
    g.fillStyle(0x5a3a20, 1); for (const y of [60, 100]) g.fillRect(20, y, WIDTH - 40, 4);
    // Cachivaches.
    g.fillStyle(0x7a5a3a, 1); g.fillRect(60, 100, 72, 5); g.fillRect(118, 92, 10, 20);
    g.fillStyle(0xb5562c, 1); g.fillRect(158, 196, 10, 14); g.fillStyle(0x3fa3a0, 1); g.fillRect(172, 194, 10, 16); g.fillStyle(0x9fb8c0, 1); g.fillRect(185, 198, 9, 12);
    g.fillStyle(0x5c6468, 1); g.fillRect(266, 98, 42, 26); g.fillStyle(0x3a3f42, 1); g.fillRect(272, 92, 12, 8);
    g.fillStyle(0x1d1a18, 1); g.fillCircle(66, 210, 16); g.fillStyle(0x3a3532, 1); g.fillCircle(66, 210, 7);
    g.fillStyle(0x8a6034, 1); g.fillRect(200, 110, 30, 18); g.fillStyle(0x6e4527, 1); g.fillRect(200, 118, 30, 2);
    g.fillStyle(0xc9c2b0, 1); g.fillRect(414, 70, 34, 56); g.fillStyle(0x9a5a3a, 1); g.fillRect(420, 80, 8, 4); g.fillRect(436, 110, 6, 8);
    for (let i = 0; i < 26; i++) { g.fillStyle(i % 2 ? 0xc94c3c : 0xa83a2c, 1); g.fillRect(340 + (i * 7) % 64, 180 + Math.floor(i / 9) * 10 + (i % 3) * 2, 6, 3); }
    s.add.image(120, 160, 'pr_crate').setScale(1.6);
    s.add.image(320, 166, 'pr_barrel').setScale(1.4);
    s.add.image(30, 150, 'pr_crate').setScale(1.3);
    s.plate = s.add.image(372, 200, 'ic_plate').setScale(1.6).setAlpha(0).setDepth(5);
    // Oscuridad con un agujero de luz.
    if (!s.textures.exists('mg_light')) {
      const c = s.textures.createCanvas('mg_light', 140, 140);
      const ctx = c.context;
      const gr = ctx.createRadialGradient(70, 70, 10, 70, 70, 70);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 140, 140);
      c.refresh();
    }
    s.dark = s.add.renderTexture(0, 0, WIDTH, HEIGHT).setOrigin(0).setDepth(20);
    s.light = { x: WIDTH / 2, y: HEIGHT / 2 + 20 };
    s.dark.fill(0x000000, 0.96);
    s.dark.erase('mg_light', s.light.x - 70, s.light.y - 70);
    s.label = s.add.text(0, 0, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#ffe9a0', backgroundColor: '#081016cc', padding: { x: 4, y: 2 } }).setOrigin(0.5, 1).setDepth(60).setVisible(false);
    s.say = s.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 16, '', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#f6e7a8', backgroundColor: '#081016dd', padding: { x: 6, y: 3 }, align: 'center', wordWrap: { width: 380 } }).setOrigin(0.5, 1).setDepth(61);
    s.title('La bodega a oscuras', '');
  },

  start(s) {
    s.timer(LINTERNA.seconds, () => s.lose('Se agotó la batería de Lumen. Recárgala al sol y vuelve a intentarlo.'));
    const items = s.save.items || {};
    s.say.setText(items.yuli || items.lucho ? 'Lumen: Yuli dijo que la escondieron detrás de las redes viejas...' : 'Lumen: Busca algo metálico. Una placa de motor brilla con la luz.');
    s.input.on('pointerdown', (p) => { s.touch = { x: p.x, y: p.y }; this.tap(s, p.x, p.y); });
    s.input.on('pointermove', (p) => { if (p.isDown) s.touch = { x: p.x, y: p.y }; });
    s.input.on('pointerup', () => { s.touch = null; });
    s.key(['X', 'E', 'SPACE', 'ENTER'], () => this.examine(s));
    s.nextRat = 3000;
    s.onUpdate((t, dt) => this.tick(s, dt));
  },

  tick(s, dt) {
    const sec = dt / 1000;
    const d = s.dir();
    if (s.touch) { s.light.x = Phaser.Math.Linear(s.light.x, s.touch.x, 0.2); s.light.y = Phaser.Math.Linear(s.light.y, s.touch.y, 0.2); }
    else { s.light.x += d.x * 170 * sec; s.light.y += d.y * 170 * sec; }
    s.light.x = Phaser.Math.Clamp(s.light.x, 10, GAME.WIDTH - 10);
    s.light.y = Phaser.Math.Clamp(s.light.y, 50, GAME.HEIGHT - 10);
    const flick = 1 + Math.sin(s.time.now / 60) * 0.02;
    s.dark.clear();
    s.dark.fill(0x000000, 0.96);
    s.dark.erase('mg_light', s.light.x - 70 * flick, s.light.y - 70 * flick);
    const near = this.near(s);
    if (near) s.label.setVisible(true).setText(near.name + ' · X').setPosition(near.x, near.y - near.r); else s.label.setVisible(false);
    // Un ratón cruza de vez en cuando.
    s.nextRat -= dt;
    if (s.nextRat <= 0) {
      s.nextRat = Phaser.Math.Between(4000, 8000);
      const y = Phaser.Math.Between(170, 240);
      const rat = s.add.rectangle(-10, y, 10, 5, 0x5a4a42).setDepth(40);
      s.tweens.add({ targets: rat, x: GAME.WIDTH + 20, duration: 1400, onComplete: () => rat.destroy() });
      sfx('select');
    }
  },

  near(s) {
    return JUNK.find((j) => Phaser.Math.Distance.Between(s.light.x, s.light.y, j.x, j.y) < j.r + 8);
  },

  tap(s, x, y) {
    if (!s.playing || s.ended) return;
    const j = JUNK.find((o) => Phaser.Math.Distance.Between(x, y, o.x, o.y) < o.r + 6);
    if (j) { s.light.x = x; s.light.y = y; this.examine(s); }
  },

  examine(s) {
    if (s.found) return;
    const j = this.near(s);
    if (!j) return;
    if (j.k === 'redes') {
      s.found = true;
      s.say.setText('¡Detrás de las redes hay una placa metálica: MR-4471-R!');
      s.tweens.add({ targets: s.plate, alpha: 1, y: 186, scale: 2.2, duration: 600, ease: 'Back.out' });
      s.good(j.x, j.y - 20);
      s.cameras.main.flash(200, 255, 240, 180);
      s.time.delayedCall(1300, () => s.win(1, 'Encontraste la placa del motor: MR-4471-R. Alguien la escondió hace muy poco, porque no tiene ni polvo.'));
      return;
    }
    sfx('note');
    s.say.setText(j.name + ': ' + j.line);
  },
};
