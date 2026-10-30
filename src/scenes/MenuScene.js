// MENÚ PRINCIPAL de AEQUITAS: presentación animada (una vez por visita) y el río
// al atardecer: la ciudad vieja hundida en tres capas de bruma, el sol con su
// reflejo, la luz de la Biblioteca, garzas, la canoa y la balanza del título.
// Nueva partida (lleva a elegir personaje), Continuar, Códice, Ajustes y Acerca de.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS, VERSION } from '../config.js';
import { hasSave, loadSave } from '../systems/save.js';
import { startAudio, playTheme, toggleMute, sfx } from '../systems/audio.js';
import { buildPlayer } from './BootScene.js';
import { brokenTower, pylon, belfry } from './places.js';

// Generador estable para el horizonte (el mismo dibujo en cada carga).
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu', cameras: CAMERA });
  }

  init() {
    this.mode = 'menu';
    this.sel = 0;
    this.csel = 1;
    this.leaving = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    this.intro = [];
    this.drawSky();
    this.drawCity();
    this.drawRiver();
    this.drawShore();
    this.buildTitle();
    this.add.text(WIDTH / 2, HEIGHT - 6, 'Una iniciativa transmedia de ' + GAME.STUDIO, { fontFamily: 'monospace', fontSize: '7px', color: '#c8b0b8' }).setOrigin(0.5, 1).setDepth(20).setShadow(1, 1, '#1a1020', 2);
    this.add.text(5, HEIGHT - 6, VERSION, { fontFamily: 'monospace', fontSize: '7px', color: '#a08898' }).setOrigin(0, 1).setDepth(20);
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) {
      this.add.text(WIDTH - 5, HEIGHT - 6, '↑↓ elegir · X aceptar', { fontFamily: 'monospace', fontSize: '7px', color: '#a08898' }).setOrigin(1, 1).setDepth(20);
    }

    const sv = hasSave() ? loadSave() : null;
    this.options = [];
    if (sv) this.options.push({ label: 'Continuar', action: () => this.continueGame(sv) });
    this.options.push({ label: 'Nueva partida', action: () => (sv ? this.showConfirm() : this.goCharacter()) });
    if (sv) this.options.push({ label: 'Mi Códice', action: () => this.overlay('CaseFile', { returnScene: 'Menu' }) });
    this.options.push({ label: 'Ajustes', action: () => this.scene.start('Settings', { returnScene: 'Menu' }) });
    this.options.push({ label: 'Acerca de', action: () => this.showAbout() });
    this.buildButtons();
    this.refresh();
    this.buildConfirm();
    this.buildAbout();

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.nav(0, -1));
    kb.on('keydown-DOWN', () => this.nav(0, 1));
    kb.on('keydown-LEFT', () => this.nav(-1, 0));
    kb.on('keydown-RIGHT', () => this.nav(1, 0));
    ['ENTER', 'SPACE', 'X', 'E'].forEach((k) => kb.on('keydown-' + k, () => this.confirm()));
    kb.on('keydown-ESC', () => this.back());
    kb.on('keydown-M', () => toggleMute());
    this.input.on('pointerdown', () => { if (this.mode === 'intro') this.skipIntro(); });
    this.input.once('pointerdown', () => startAudio().then(() => playTheme('menu')));
    this.input.keyboard.once('keydown', () => startAudio().then(() => playTheme('menu')));
    startAudio().then(() => playTheme('menu')).catch(() => {});

    // La presentación completa sale una vez por visita; al volver al menú, directo.
    if (this.registry.get('introSeen')) { this.cameras.main.fadeIn(500, 0, 0, 0); this.showAll(); }
    else { this.registry.set('introSeen', true); this.playIntro(); }
  }

  // ------------------------------------------------------------ el paisaje
  drawSky() {
    const { WIDTH } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0x150f2a, 0x150f2a, 0x5a2a4e, 0x5a2a4e, 1); g.fillRect(0, 0, WIDTH, 90);
    g.fillGradientStyle(0x5a2a4e, 0x5a2a4e, 0xf09060, 0xf09060, 1); g.fillRect(0, 90, WIDTH, 86);
    // Estrellas que todavía no se van.
    const r = rng(7);
    for (let i = 0; i < 46; i++) {
      const st = this.add.rectangle(r() * WIDTH, r() * 70, 1, 1, 0xfff4dc, 0.3 + r() * 0.6);
      this.tweens.add({ targets: st, alpha: 0.1, duration: 900 + r() * 2200, yoyo: true, repeat: -1, delay: r() * 2000 });
    }
    // El sol: rayos que giran despacio, halo y disco.
    this.sun = this.add.container(WIDTH / 2, 166);
    const rays = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      rays.fillStyle(0xffd9a0, 0.07);
      rays.fillTriangle(0, 0, Math.cos(a - 0.06) * 190, Math.sin(a - 0.06) * 190, Math.cos(a + 0.06) * 190, Math.sin(a + 0.06) * 190);
    }
    this.tweens.add({ targets: rays, angle: 360, duration: 120000, repeat: -1 });
    const halo = this.add.graphics();
    for (let rr = 70; rr > 0; rr -= 5) { halo.fillStyle(0xffc890, 0.025 + (70 - rr) / 2000); halo.fillCircle(0, 0, rr); }
    const disc = this.add.graphics();
    disc.fillStyle(0xffe2a0, 1); disc.fillCircle(0, 0, 24);
    disc.fillStyle(0xfff1c8, 1); disc.fillCircle(-4, -5, 15);
    this.sun.add([rays, halo, disc]);
    // Nubes largas del atardecer.
    for (const [x, y, w, sp] of [[60, 104, 120, 90000], [330, 92, 150, 120000], [220, 130, 90, 70000], [430, 140, 80, 80000]]) {
      const c = this.add.graphics();
      c.fillStyle(0xf8b8a0, 0.45); c.fillEllipse(0, 0, w, 7); c.fillEllipse(-w * 0.18, -3, w * 0.5, 6);
      c.fillStyle(0xffe0c0, 0.35); c.fillEllipse(w * 0.1, -2, w * 0.4, 3);
      c.setPosition(x, y);
      this.tweens.add({ targets: c, x: x + 60, duration: sp, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  drawCity() {
    const { WIDTH } = GAME;
    // Tres capas de la ciudad vieja, más claras cuanto más lejos (bruma).
    const far = this.add.graphics();
    const r1 = rng(3);
    for (let x = -4; x < WIDTH; x += 18 + Math.floor(r1() * 14)) brokenTower(far, x, 168, 12 + Math.floor(r1() * 10), 22 + Math.floor(r1() * 30), 0xb06a78, r1, 0xd89090);
    const mid = this.add.graphics();
    const rr = rng(41);
    for (const [x, w, h] of [[8, 20, 70], [30, 14, 48], [150, 18, 58], [172, 12, 36], [286, 22, 82], [312, 14, 52], [452, 22, 64]]) brokenTower(mid, x, 168, w, h, 0x6a3a5e, rr, 0x9a5a72);
    pylon(mid, 120, 168, 52, 0x6a3a5e, 0.22);
    pylon(mid, 262, 168, 44, 0x6a3a5e, -0.3);
    // Altamar, la ciudad amurallada, con la torre de la Biblioteca.
    const g = this.add.graphics();
    g.fillStyle(0x2a1a30, 1);
    g.fillRect(0, 158, WIDTH, 16);
    for (let x = 0; x < WIDTH; x += 10) g.fillRect(x, 153, 6, 6);
    [[40, 128, 18], [96, 138, 12], [330, 132, 16], [392, 118, 22], [440, 142, 10]].forEach(([x, y, w]) => g.fillRect(x, y, w, 158 - y));
    g.fillRect(394, 102, 18, 20); g.fillTriangle(392, 102, 414, 102, 403, 84);
    const win = this.add.rectangle(403, 111, 4, 5, 0xffe9a0);
    this.tweens.add({ targets: win, alpha: 0.6, duration: 1400, yoyo: true, repeat: -1 });
    [[46, 136], [100, 145], [334, 140], [444, 148]].forEach(([x, y]) => this.add.rectangle(x, y, 2, 2, 0xffd890, 0.8));
    // Haz de la Biblioteca barriendo el cielo.
    const beam = this.add.graphics({ x: 403, y: 110 }).setBlendMode(Phaser.BlendModes.ADD);
    beam.fillStyle(0xfff0b0, 0.07); beam.fillTriangle(0, 0, -470, -70, -470, 20);
    this.tweens.add({ targets: beam, angle: 14, alpha: 0.5, duration: 5200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  drawRiver() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0x8a4a5e, 0x8a4a5e, 0x241428, 0x241428, 1); g.fillRect(0, 174, WIDTH, HEIGHT - 174);
    // Reflejo del sol: rayas que titilan bajo el disco.
    for (let i = 0; i < 16; i++) {
      const y = 178 + i * 5.5;
      const w = Math.max(6, 46 - i * 2.4) * (0.7 + (i % 3) * 0.2);
      const l = this.add.rectangle(WIDTH / 2 + ((i * 13) % 9) - 4, y, w, 1.5, 0xffd9a0, 0.55 - i * 0.025).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: l, scaleX: 0.55, alpha: 0.15, duration: 700 + (i % 5) * 240, yoyo: true, repeat: -1, delay: i * 90 });
    }
    // Ondas que corren con el río.
    const r = rng(19);
    for (let i = 0; i < 26; i++) {
      const y = 180 + r() * (HEIGHT - 186);
      const k = (y - 174) / (HEIGHT - 174);
      const w = this.add.rectangle(r() * WIDTH, y, 6 + k * 16, 1, i % 3 ? 0xffc08a : 0xe8a0b0, 0.25 + k * 0.2);
      this.tweens.add({ targets: w, x: w.x + 40 + k * 50, alpha: 0, duration: 4000 + r() * 3000, repeat: -1, delay: r() * 3000 });
    }
    // El campanario de la iglesia vieja, con el agua hasta las campanas.
    belfry(g, 400, 204, 0x2a1a30, 0x8a4a5e);
    // Canoa con quien viaja, Lumen y Tinto.
    const boat = this.add.container(70, 214).setDepth(6);
    const bg = this.add.graphics();
    bg.fillStyle(0x221424, 1); bg.fillRect(-26, 0, 52, 5); bg.fillTriangle(26, 0, 34, 0, 26, 5); bg.fillTriangle(-26, 0, -34, 0, -26, 5);
    bg.fillStyle(0xffc08a, 0.35); bg.fillRect(-30, 6, 60, 1);
    boat.add(bg);
    boat.add(this.add.image(-6, 1, 'player').setOrigin(0.5, 1).setTint(0x221424));
    boat.add(this.add.image(12, 1, 'tinto').setOrigin(0.5, 1).setTint(0x221424).setScale(0.8));
    const lum = this.add.image(-20, -22, 'lumen').setOrigin(0.5, 1);
    boat.add(lum);
    this.tweens.add({ targets: lum, y: -26, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: boat, y: 216, angle: 1.5, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: boat, x: 104, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // Garzas que cruzan aleteando.
    if (!this.textures.exists('menu_bird0')) {
      [[[0, 2], [1, 1], [2, 0], [3, 1], [4, 2], [5, 1], [6, 0], [7, 1], [8, 2]], [[0, 0], [1, 1], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 1], [8, 0]]].forEach((pts, f) => {
        const b = this.make.graphics({ x: 0, y: 0, add: false });
        b.fillStyle(0x221424, 1); pts.forEach(([x, y]) => b.fillRect(x, y, 1, 1)); b.fillRect(4, 2, 1, 2);
        b.generateTexture('menu_bird' + f, 9, 4); b.destroy();
      });
    }
    for (let i = 0; i < 4; i++) {
      const b = this.add.image(-20 - i * 26, 46 + i * 9 + (i % 2) * 6, 'menu_bird0').setScale(i === 1 ? 1.4 : 1);
      this.time.addEvent({ delay: 260 + i * 30, loop: true, callback: () => b.setTexture(b.texture.key === 'menu_bird0' ? 'menu_bird1' : 'menu_bird0') });
      this.tweens.add({ targets: b, x: WIDTH + 30, y: b.y - 14, duration: 26000 + i * 2600, repeat: -1, delay: 2500 + i * 900 });
    }
  }

  drawShore() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics().setDepth(8);
    // Juncos y palmas en la orilla, en silueta.
    g.fillStyle(0x120a16, 1);
    const palm = (x, base, h, lean) => {
      for (let i = 0; i < h; i += 2) g.fillRect(x + Math.round(lean * (i / h) * (i / h) * 10), base - i, 3, 2);
      const tx = x + Math.round(lean * 10) + 1;
      const ty = base - h;
      for (const [dx, dy] of [[-18, 6], [-12, 10], [16, 5], [11, 11], [-2, -9], [6, -8]]) g.fillTriangle(tx, ty, tx + dx, ty + dy, tx + dx * 0.6, ty + dy + 3);
    };
    palm(14, HEIGHT, 70, 1.2);
    palm(34, HEIGHT, 48, -0.8);
    palm(456, HEIGHT, 64, -1.3);
    for (let x = 0; x < 70; x += 4) g.fillRect(x, HEIGHT - 6 - ((x * 7) % 9), 1, 10);
    for (let x = 420; x < WIDTH; x += 4) g.fillRect(x, HEIGHT - 6 - ((x * 5) % 9), 1, 10);
    g.fillRect(0, HEIGHT - 4, 76, 4); g.fillRect(412, HEIGHT - 4, 68, 4);
    // Luciérnagas sobre el agua.
    this.add.particles(0, 0, 'p_soft', { x: { min: 0, max: WIDTH }, y: { min: 150, max: HEIGHT }, lifespan: 5000, speedY: { min: -8, max: -2 }, speedX: { min: -4, max: 4 }, scale: { start: 0.55, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: 0xffe6a0, frequency: 320, blendMode: 'ADD' }).setDepth(9);
  }

  // ------------------------------------------------------------ título
  buildTitle() {
    const { WIDTH } = GAME;
    // La balanza: emblema de AEQUITAS.
    const em = this.add.container(WIDTH / 2, 20).setDepth(10);
    const eg = this.add.graphics();
    eg.fillStyle(0xe3b04b, 1);
    eg.fillRect(-1, -6, 2, 14); eg.fillRect(-5, 8, 10, 2); eg.fillCircle(0, -7, 2);
    const arm = this.add.container(0, -4);
    const ag = this.add.graphics();
    ag.fillStyle(0xe3b04b, 1); ag.fillRect(-16, -1, 32, 2);
    ag.lineStyle(1, 0xe3b04b, 1); ag.lineBetween(-15, 0, -19, 8); ag.lineBetween(-15, 0, -11, 8); ag.lineBetween(15, 0, 19, 8); ag.lineBetween(15, 0, 11, 8);
    ag.fillRect(-20, 8, 10, 2); ag.fillRect(10, 8, 10, 2);
    arm.add(ag);
    em.add([eg, arm]);
    this.tweens.add({ targets: arm, angle: { from: -5, to: 5 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.emblem = em;
    // AEQUITAS, letra por letra, con dorado degradado.
    const word = 'AEQUITAS';
    const style = { fontFamily: 'Georgia, serif', fontSize: '42px', color: '#e3b04b' };
    const letters = [...word].map((ch) => this.add.text(0, 58, ch, style).setOrigin(0.5).setDepth(10));
    const gap = 7;
    const total = letters.reduce((a, t) => a + t.width, 0) + gap * (letters.length - 1);
    let x = WIDTH / 2 - total / 2;
    letters.forEach((t) => {
      t.setX(x + t.width / 2); x += t.width + gap;
      const grd = t.context.createLinearGradient(0, 0, 0, t.height);
      grd.addColorStop(0, '#fff2c4'); grd.addColorStop(0.45, '#f0c060'); grd.addColorStop(1, '#a8702a');
      t.setFill(grd);
      t.setStroke('#3a2010', 2);
      t.setShadow(0, 0, '#ffd890', 12, false, true);
    });
    this.letters = letters;
    // Brillo que recorre el título de vez en cuando.
    this.shine = this.add.rectangle(0, 58, 10, 50, 0xffffff, 0.22).setAngle(18).setDepth(11).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
    this.subtitle = this.add.text(WIDTH / 2, 90, 'El Retorno del Equilibrio', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#fbeedd', fontStyle: 'italic' }).setOrigin(0.5).setDepth(10).setShadow(1, 1, '#2a1020', 3);
    const orn = this.add.graphics().setDepth(10);
    orn.lineStyle(1, 0xe3b04b, 0.8); orn.lineBetween(WIDTH / 2 - 88, 104, WIDTH / 2 - 8, 104); orn.lineBetween(WIDTH / 2 + 8, 104, WIDTH / 2 + 88, 104);
    orn.fillStyle(0xe3b04b, 1); orn.fillTriangle(WIDTH / 2, 100, WIDTH / 2 + 4, 104, WIDTH / 2, 108); orn.fillTriangle(WIDTH / 2, 100, WIDTH / 2 - 4, 104, WIDTH / 2, 108);
    this.ornament = orn;
    this.tagline = this.add.text(WIDTH / 2, 115, 'LA PALABRA · LA PRUEBA · LA LEY', { fontFamily: 'monospace', fontSize: '7px', color: '#ffe0c0' }).setOrigin(0.5).setDepth(10).setLetterSpacing(2).setShadow(1, 1, '#2a1020', 2);
  }

  // ------------------------------------------------------------ botones
  buildButtons() {
    const { WIDTH } = GAME;
    const n = this.options.length;
    const y0 = 132 + (5 - n) * 9;
    this.buttons = this.options.map((o, i) => {
      const c = this.add.container(WIDTH / 2, y0 + i * 20).setDepth(12);
      const bg = this.add.graphics();
      const t = this.add.text(0, 0, o.label, { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.cream }).setOrigin(0.5).setShadow(1, 1, '#1a0a14', 2);
      const hit = this.add.rectangle(0, 0, 156, 17, 0x000000, 0.001).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { if (this.mode === 'menu' && this.sel !== i) { this.sel = i; this.refresh(); sfx('select'); } });
      hit.on('pointerdown', () => { if (this.mode === 'menu') { this.sel = i; this.refresh(); this.confirm(); } });
      c.add([bg, t, hit]);
      c.bg = bg; c.t = t; c.baseY = c.y;
      return c;
    });
  }

  refresh() {
    this.buttons.forEach((c, i) => {
      const on = i === this.sel;
      const g = c.bg;
      g.clear();
      g.fillStyle(on ? 0x3a2216 : 0x170e1c, on ? 0.95 : 0.72); g.fillRoundedRect(-78, -8.5, 156, 17, 4);
      g.lineStyle(1, 0xe3b04b, on ? 1 : 0.3); g.strokeRoundedRect(-78, -8.5, 156, 17, 4);
      if (on) {
        g.fillStyle(0xe3b04b, 1);
        for (const sx of [-1, 1]) { const x = sx * 70; g.fillTriangle(x, -3, x + 3, 0, x, 3); g.fillTriangle(x, -3, x - 3, 0, x, 3); }
      }
      c.t.setColor(on ? '#ffe2a0' : '#e8dccc');
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scale: on ? 1.06 : 1, duration: 140, ease: 'Sine.out' });
    });
  }

  // ------------------------------------------------------------ presentación
  // Negro → «Bellium S.A.S. presenta» → amanece sobre Altamar → la balanza →
  // AEQUITAS cae letra por letra → subtítulo → botones. Se salta tocando o con X.
  playIntro() {
    const { WIDTH, HEIGHT } = GAME;
    this.mode = 'intro';
    this.hideAll();
    const black = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 1).setOrigin(0).setDepth(100);
    const studio = this.add.text(WIDTH / 2, HEIGHT / 2 - 6, GAME.STUDIO.toUpperCase(), { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#e3b04b' }).setOrigin(0.5).setDepth(101).setLetterSpacing(5).setAlpha(0);
    const pres = this.add.text(WIDTH / 2, HEIGHT / 2 + 12, 'presenta', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c8b8a8', fontStyle: 'italic' }).setOrigin(0.5).setDepth(101).setAlpha(0);
    this.introObjs = [black, studio, pres];
    const T = (cfg) => { const tw = this.tweens.add(cfg); this.intro.push(tw); return tw; };
    T({ targets: [studio, pres], alpha: 1, duration: 700, delay: 300 });
    T({ targets: [studio, pres], alpha: 0, duration: 600, delay: 2000 });
    T({ targets: black, alpha: 0, duration: 1600, delay: 2500 });
    this.sun.y = 200;
    T({ targets: this.sun, y: 166, duration: 3200, delay: 2500, ease: 'Sine.out' });
    T({ targets: this.emblem, alpha: 1, scale: { from: 0.2, to: 1 }, duration: 700, delay: 3900, ease: 'Back.out' });
    this.letters.forEach((t, i) => {
      t.y = 40;
      T({ targets: t, alpha: 1, y: 58, duration: 420, delay: 4300 + i * 110, ease: 'Bounce.out', onStart: () => sfx('select') });
    });
    T({ targets: [this.subtitle, this.ornament, this.tagline], alpha: 1, duration: 800, delay: 5400 });
    this.buttons.forEach((c, i) => {
      c.y = c.baseY + 12;
      T({ targets: c, alpha: 1, y: c.baseY, duration: 400, delay: 5900 + i * 110, ease: 'Cubic.out' });
    });
    this.introEnd = this.time.delayedCall(6500, () => this.endIntro());
  }

  hideAll() {
    [this.emblem, ...this.letters, this.subtitle, this.ornament, this.tagline, ...this.buttons].forEach((o) => o.setAlpha(0));
  }

  showAll() {
    this.sun.y = 166;
    [this.emblem, ...this.letters, this.subtitle, this.ornament, this.tagline, ...this.buttons].forEach((o) => o.setAlpha(1).setScale(o === this.emblem ? 1 : o.scale));
    this.letters.forEach((t) => { t.y = 58; });
    this.buttons.forEach((c) => { c.y = c.baseY; });
    this.mode = 'menu';
    this.startShine();
  }

  skipIntro() {
    this.intro.forEach((tw) => tw.remove());
    this.intro = [];
    if (this.introEnd) this.introEnd.remove();
    this.endIntro();
  }

  endIntro() {
    if (this.mode !== 'intro') return;
    (this.introObjs || []).forEach((o) => o.destroy());
    this.introObjs = [];
    this.showAll();
    this.refresh();
  }

  startShine() {
    if (this.shineLoop) return;
    const first = this.letters[0];
    const last = this.letters[this.letters.length - 1];
    const sweep = () => {
      this.shine.setVisible(true).setX(first.x - 30);
      this.tweens.add({ targets: this.shine, x: last.x + 30, duration: 900, ease: 'Sine.inOut', onComplete: () => this.shine.setVisible(false) });
    };
    this.time.delayedCall(600, sweep);
    this.shineLoop = this.time.addEvent({ delay: 6000, loop: true, callback: sweep });
  }

  nav(dx, dy) {
    if (this.mode === 'menu' && dy) { this.sel = Phaser.Math.Wrap(this.sel + dy, 0, this.options.length); this.refresh(); sfx('select'); }
    if (this.mode === 'confirm' && dx) { this.csel = this.csel ? 0 : 1; this.refreshConfirm(); sfx('select'); }
  }

  confirm() {
    if (this.leaving) return;
    if (this.mode === 'intro') { this.skipIntro(); return; }
    sfx('confirm');
    if (this.mode === 'menu') this.options[this.sel].action();
    else if (this.mode === 'confirm') { if (this.csel === 0) this.goCharacter(); else this.back(); }
    else if (this.mode === 'about') this.back();
  }

  back() {
    if (this.mode === 'confirm') { this.mode = 'menu'; this.confirmPanel.setVisible(false); this.setMenuVisible(true); }
    if (this.mode === 'about') { this.mode = 'menu'; this.aboutPanel.setVisible(false); this.setMenuVisible(true); }
  }

  setMenuVisible(v) { this.buttons.forEach((c) => c.setVisible(v)); }

  overlay(key, data) {
    this.scene.launch(key, data);
    this.scene.pause();
  }

  // --------------------------------------------------- nueva partida
  // Elegir personaje es otra pantalla; si ya hay un viaje guardado, se pregunta antes.
  goCharacter() {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Character'));
  }

  buildConfirm() {
    const { WIDTH } = GAME;
    const c = this.add.container(0, 0).setVisible(false).setDepth(50);
    const g = this.add.graphics();
    g.fillStyle(0x0d1820, 0.94); g.fillRoundedRect(WIDTH / 2 - 150, 128, 300, 96, 10);
    g.lineStyle(2, 0xe3b04b, 0.8); g.strokeRoundedRect(WIDTH / 2 - 150, 128, 300, 96, 10);
    c.add(g);
    c.add(this.add.text(WIDTH / 2, 140, 'Ya tienes un viaje en curso.', { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.gold }).setOrigin(0.5, 0));
    c.add(this.add.text(WIDTH / 2, 158, 'Si empiezas de nuevo, se borrará al elegir personaje.', { fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream }).setOrigin(0.5, 0));
    this.cOpts = ['Empezar de nuevo', 'Mejor no'].map((label, i) => {
      const x = WIDTH / 2 + (i ? 70 : -70);
      const bg = this.add.rectangle(x, 196, 124, 22, i ? 0x2a1d2e : 0x8a3a2a, 0.96).setInteractive({ useHandCursor: true });
      const t = this.add.text(x, 196, label, { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#ffffff' }).setOrigin(0.5);
      bg.on('pointerover', () => { this.csel = i; this.refreshConfirm(); });
      bg.on('pointerdown', () => { this.csel = i; this.confirm(); });
      c.add([bg, t]);
      return bg;
    });
    this.confirmPanel = c;
  }

  refreshConfirm() {
    this.cOpts.forEach((bg, i) => bg.setStrokeStyle(2, i === this.csel ? 0xffe070 : 0x3fa3a0, i === this.csel ? 1 : 0.5));
  }

  showConfirm() {
    this.mode = 'confirm';
    this.csel = 1;
    this.setMenuVisible(false);
    this.confirmPanel.setVisible(true);
    this.refreshConfirm();
  }

  continueGame(sv) {
    buildPlayer(this, sv);
    const stage = sv.stage;
    let target = { scene: 'Town' };
    if (stage === 'prologo') target = { scene: 'Cinematic', data: { key: 'llegada', next: { scene: 'Town' } } };
    if (stage === 'audiencia') target = { scene: 'Hearing' };
    if (stage === 'acuerdo') target = { scene: 'Resolution' };
    if (stage === 'cierre') target = { scene: 'CaseClosed' };
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(target.scene, target.data || {}));
  }

  // --------------------------------------------------- acerca de
  buildAbout() {
    const { WIDTH, HEIGHT } = GAME;
    const c = this.add.container(0, 0).setVisible(false).setDepth(60);
    const g = this.add.graphics();
    // Opaco y sin tocar el pie de página (antes se veía el título por detrás).
    g.fillStyle(0x0d1820, 1); g.fillRoundedRect(20, 12, WIDTH - 40, HEIGHT - 36, 10);
    g.lineStyle(2, 0xe3b04b, 0.8); g.strokeRoundedRect(20, 12, WIDTH - 40, HEIGHT - 36, 10);
    c.add(g);
    const txt = [
      'AEQUITAS: El Retorno del Equilibrio es una aventura de rol e investigación dialéctica en un mundo postapocalíptico. Los lugares y las personas son ficticios; las leyes son reales.',
      '',
      'Recorres refugios y puertos fluviales resolviendo controversias comunitarias sin violencia: escuchas, investigas, presentas pruebas y ayudas a construir acuerdos con la ley colombiana como brújula: la Constitución Política de 1991, el Código Civil y las leyes de conciliación.',
      '',
      'Una iniciativa transmedia de Bellium S.A.S., firma jurídica y administrativa colombiana.',
      '',
      'Contenido pedagógico: cada carta del Códice cita su norma, pero el juego no constituye asesoría jurídica.',
      '',
      'Arte de terreno: Tuxemon (CC BY-SA 3.0). Todo lo demás, dibujado por código.',
    ].join('\n');
    c.add(this.add.text(36, 26, txt, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, wordWrap: { width: WIDTH - 72 }, lineSpacing: 2 }));
    c.add(this.add.text(WIDTH / 2, HEIGHT - 34, 'Toca la pantalla o pulsa X para volver', { fontFamily: 'monospace', fontSize: '8px', color: '#9fb8c0' }).setOrigin(0.5));
    const z = this.add.zone(0, 0, WIDTH, HEIGHT).setOrigin(0).setInteractive();
    z.on('pointerdown', () => this.back());
    c.add(z);
    this.aboutPanel = c;
  }

  showAbout() {
    this.mode = 'about';
    this.setMenuVisible(false);
    this.aboutPanel.setVisible(true);
  }
}

