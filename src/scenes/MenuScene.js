// MENÚ PRINCIPAL de AEQUITAS: el río al atardecer, la ciudad vieja hundida y la
// luz de la Biblioteca. Nueva partida (lleva a elegir personaje), Continuar,
// Códice, Ajustes y Acerca de.

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
    this.drawBackdrop();
    // Título.
    const title = this.add.text(WIDTH / 2, 58, 'AEQUITAS', { fontFamily: 'Georgia, serif', fontSize: '44px', color: COLORS.gold }).setOrigin(0.5).setLetterSpacing(8);
    title.setShadow(0, 0, '#f5d48a', 16, true, true);
    this.tweens.add({ targets: title, alpha: 0.86, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.text(WIDTH / 2, 92, 'El Retorno del Equilibrio', { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS.cream, fontStyle: 'italic' }).setOrigin(0.5).setShadow(1, 1, '#000', 3);
    this.add.text(WIDTH / 2, 110, 'La palabra · la prueba · la ley', { fontFamily: 'monospace', fontSize: '8px', color: '#9fd3cf' }).setOrigin(0.5).setLetterSpacing(1);
    this.add.text(WIDTH / 2, HEIGHT - 8, 'Una iniciativa transmedia de ' + GAME.STUDIO, { fontFamily: 'monospace', fontSize: '7px', color: '#9fb8c0' }).setOrigin(0.5, 1);
    this.add.text(5, HEIGHT - 4, VERSION, { fontFamily: 'monospace', fontSize: '7px', color: '#6f9a9f' }).setOrigin(0, 1);

    const sv = hasSave() ? loadSave() : null;
    this.options = [];
    if (sv) this.options.push({ label: 'Continuar', action: () => this.continueGame(sv) });
    this.options.push({ label: 'Nueva partida', action: () => (sv ? this.showConfirm() : this.goCharacter()) });
    if (sv) this.options.push({ label: 'Mi Códice', action: () => this.overlay('CaseFile', { returnScene: 'Menu' }) });
    this.options.push({ label: 'Ajustes', action: () => this.scene.start('Settings', { returnScene: 'Menu' }) });
    this.options.push({ label: 'Acerca de', action: () => this.showAbout() });
    this.optTexts = this.options.map((o, i) => {
      const t = this.add.text(WIDTH / 2, 142 + i * 18, o.label, { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS.cream }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setShadow(1, 1, '#000', 3);
      t.on('pointerover', () => { if (this.mode === 'menu') { this.sel = i; this.refresh(); } });
      t.on('pointerdown', () => { if (this.mode === 'menu') { this.sel = i; this.refresh(); this.confirm(); } });
      return t;
    });
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
    this.input.once('pointerdown', () => startAudio().then(() => playTheme('menu')));
    this.input.keyboard.once('keydown', () => startAudio().then(() => playTheme('menu')));
    startAudio().then(() => playTheme('menu')).catch(() => {});
    this.cameras.main.fadeIn(700, 0, 0, 0);
  }

  drawBackdrop() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0x2a1d3a, 0x2a1d3a, 0xe8846b, 0xe8846b, 1);
    g.fillRect(0, 0, WIDTH, 170);
    for (let r = 80; r > 0; r -= 6) { g.fillStyle(0xffc08a, 0.03 + (80 - r) / 1500); g.fillCircle(WIDTH / 2, 168, r); }
    g.fillStyle(0xffd38a, 1); g.fillCircle(WIDTH / 2, 168, 22);
    // La ciudad vieja hundida: torres sin techo y torres de energía torcidas.
    const rr = rng(41);
    for (const [x, w, h] of [[8, 20, 70], [30, 14, 48], [150, 18, 58], [172, 12, 36], [286, 22, 82], [312, 14, 52], [452, 22, 64]]) brokenTower(g, x, 160, w, h, 0x5a3a5a, rr, 0x8a5a6a);
    pylon(g, 120, 160, 52, 0x5a3a5a, 0.22);
    pylon(g, 262, 160, 44, 0x5a3a5a, -0.3);
    // Altamar, la ciudad amurallada, con la torre de la Biblioteca.
    g.fillStyle(0x2a1d2e, 1);
    g.fillRect(0, 150, WIDTH, 22);
    for (let x = 0; x < WIDTH; x += 10) g.fillRect(x, 145, 6, 6);
    const tw = [[40, 118, 18], [96, 130, 12], [330, 124, 16], [392, 112, 22], [440, 134, 10]];
    tw.forEach(([x, y, w]) => g.fillRect(x, y, w, 150 - y));
    g.fillRect(394, 96, 18, 20); g.fillTriangle(392, 96, 414, 96, 403, 80);
    g.fillStyle(0xffe9a0, 1); g.fillRect(401, 102, 4, 5);
    // Haz de luz de la Biblioteca.
    const beam = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    beam.fillStyle(0xfff0b0, 0.08);
    beam.fillTriangle(403, 104, -40, 40, -40, 120);
    this.tweens.add({ targets: beam, alpha: 0.4, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // El río.
    g.fillStyle(0x7a4a5a, 1); g.fillRect(0, 172, WIDTH, HEIGHT - 172);
    for (let i = 0; i < 60; i++) {
      g.fillStyle(i % 3 ? 0xffc08a : 0xe8a0a0, 0.35);
      g.fillRect((i * 97) % WIDTH, 176 + ((i * 37) % (HEIGHT - 180)), 8 + (i % 5) * 4, 1);
    }
    // El campanario de la iglesia vieja, con el agua hasta las campanas.
    belfry(g, 384, 196, 0x2a1d2e, 0x7a4a5a);
    // Canoa con el Explorador, Lumen y Tinto.
    const boat = this.add.container(120, 204);
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1d2e, 1); bg.fillRect(-26, 0, 52, 5); bg.fillTriangle(26, 0, 34, 0, 26, 5); bg.fillTriangle(-26, 0, -34, 0, -26, 5);
    boat.add(bg);
    boat.add(this.add.image(-6, 1, 'player').setOrigin(0.5, 1).setTint(0x2a1d2e));
    boat.add(this.add.image(12, 1, 'tinto').setOrigin(0.5, 1).setTint(0x2a1d2e).setScale(0.8));
    const lum = this.add.image(-20, -22, 'lumen').setOrigin(0.5, 1);
    boat.add(lum);
    this.tweens.add({ targets: lum, y: -26, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: boat, y: 206, angle: 1.5, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: boat, x: 170, duration: 14000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // Garzas en vuelo.
    for (let i = 0; i < 3; i++) {
      const b = this.add.text(-20 - i * 30, 40 + i * 12, 'ᵛ', { fontFamily: 'monospace', fontSize: '10px', color: '#2a1d2e' });
      this.tweens.add({ targets: b, x: WIDTH + 40, duration: 22000 + i * 3000, repeat: -1, delay: i * 1800 });
    }
    // Partículas cálidas.
    this.add.particles(0, 0, 'p_soft', { x: { min: 0, max: WIDTH }, y: { min: 120, max: HEIGHT }, lifespan: 6000, speedY: { min: -10, max: -3 }, scale: { start: 0.6, end: 0 }, alpha: { start: 0.5, end: 0 }, tint: 0xffe0a0, frequency: 260, blendMode: 'ADD' });
  }

  refresh() {
    this.optTexts.forEach((t, i) => {
      const on = i === this.sel;
      t.setColor(on ? COLORS.gold : COLORS.cream).setText((on ? '❯ ' : '') + this.options[i].label + (on ? ' ❮' : '')).setScale(on ? 1.08 : 1);
    });
  }

  nav(dx, dy) {
    if (this.mode === 'menu' && dy) { this.sel = Phaser.Math.Wrap(this.sel + dy, 0, this.options.length); this.refresh(); sfx('select'); }
    if (this.mode === 'confirm' && dx) { this.csel = this.csel ? 0 : 1; this.refreshConfirm(); sfx('select'); }
  }

  confirm() {
    if (this.leaving) return;
    sfx('confirm');
    if (this.mode === 'menu') this.options[this.sel].action();
    else if (this.mode === 'confirm') { if (this.csel === 0) this.goCharacter(); else this.back(); }
    else if (this.mode === 'about') this.back();
  }

  back() {
    if (this.mode === 'confirm') { this.mode = 'menu'; this.confirmPanel.setVisible(false); this.setMenuVisible(true); }
    if (this.mode === 'about') { this.mode = 'menu'; this.aboutPanel.setVisible(false); this.setMenuVisible(true); }
  }

  setMenuVisible(v) { this.optTexts.forEach((t) => t.setVisible(v)); }

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

