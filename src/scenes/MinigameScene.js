// MINIJUEGOS: un marco común (instrucciones, temporizador, victoria/derrota,
// reintentar) y cada juego en su propio archivo (scenes/games/*.js).
//
// Uso: this.scene.launch('Minigame', { id, returnScene }) — sobre el pueblo, que
//   se pausa; al terminar deja { id, win, score, lesson } en registry('mgResult').
//   (lesson: qué enseñanza se jugó, para el minijuego 'ensenar').
//   O bien { id, next: { scene, data } } — en la historia (p. ej. remar al
//   llegar): al terminar arranca la escena siguiente.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { getSave, writeSave } from '../systems/save.js';
import { sfx } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';
import { fmt } from '../systems/text.js';
import remar from './games/remar.js';
import escucha from './games/escucha.js';
import peso from './games/peso.js';
import circuito from './games/circuito.js';
import linterna from './games/linterna.js';
import raspar from './games/raspar.js';
import matricula from './games/matricula.js';
import quiz from './games/quiz.js';
import ensenar from './games/ensenar.js';
import silogismo from './games/silogismo.js';
import norma from './games/norma.js';

export const GAMES = { remar, escucha, peso, circuito, linterna, raspar, matricula, quiz, ensenar, silogismo, norma };

export default class MinigameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Minigame', cameras: CAMERA });
  }

  init(data) {
    this.data0 = data || {};
    this.id = data.id;
    this.returnScene = data.returnScene || 'Town';
    // (no se llama «next»: los juegos guardan su estado en la escena y uno usó
    // s.next como contador, lo que borraba el resultado al terminar)
    this.afterScene = data.next || null;
    this.save = getSave() || {};
    this.ended = false;
    this.playing = false;
    this.started = false;
    this.finished = false;
    this.def = GAMES[this.id];
    this.updaters = [];
  }

  create() {
    if (!this.def) { this.finish(true, 0); return; }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.def.build(this);
    this.showIntro();
  }

  update(time, delta) {
    if (!this.playing || this.ended) return;
    this.updaters.forEach((fn) => fn(time, delta));
  }

  onUpdate(fn) { this.updaters.push(fn); }

  // ------------------------------------------------------------ utilidades
  // Dirección del jugador: teclas, WASD o la palanca táctil.
  dir() {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) y += 1;
    const pv = window.__padVec;
    if (!x && !y && pv && (pv.x || pv.y)) { x = pv.x; y = pv.y; }
    return { x, y };
  }

  key(names, fn) {
    [].concat(names).forEach((k) => this.input.keyboard.on('keydown-' + k, () => { if (this.playing && !this.ended) fn(); }));
  }

  button(x, y, w, h, label, cb, opts = {}) {
    const c = this.add.container(x, y).setDepth(opts.depth || 50);
    const bg = this.add.rectangle(0, 0, w, h, opts.fill || 0x16303a, 0.95).setStrokeStyle(2, opts.stroke || 0xe3b04b, 0.9);
    const t = this.add.text(0, 0, label, { fontFamily: 'Georgia, serif', fontSize: opts.size || '11px', color: opts.color || COLORS.cream, align: 'center', wordWrap: { width: w - 12 } }).setOrigin(0.5);
    c.add([bg, t]);
    bg.setInteractive({ useHandCursor: true });
    // Al salir, vuelve al color que tenía antes del resaltado... salvo que el
    // juego lo haya pintado mientras tanto (verde de acierto, rojo de error):
    // en el celular «salir» llega al levantar el dedo y borraba esa señal.
    const hover = opts.hover || 0x2a5a5e;
    let rest = [opts.fill || 0x16303a, 0.95];
    bg.on('pointerover', () => { if (bg.fillColor !== hover) rest = [bg.fillColor, bg.fillAlpha]; bg.setFillStyle(hover, 1); });
    bg.on('pointerout', () => { if (bg.fillColor === hover) bg.setFillStyle(rest[0], rest[1]); });
    bg.on('pointerdown', () => cb());
    c.bg = bg;
    c.label = t;
    return c;
  }

  panel(x, y, w, h, depth = 40) {
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(0x0d1820, 0.98); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0xe3b04b, 0.85); g.strokeRoundedRect(x, y, w, h, 8);
    return g;
  }

  // Aviso centrado (instrucciones, victoria, derrota): el panel se ajusta al
  // texto y los botones van justo debajo. buttons: [[dx, ancho, rótulo, cb, opts]].
  notice(head, color, body, buttons) {
    const { WIDTH, HEIGHT } = GAME;
    const w = WIDTH - 150;
    const objs = [this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x05080a, 0.6).setOrigin(0).setDepth(100)];
    const title = this.add.text(WIDTH / 2, 0, head, { fontFamily: 'Georgia, serif', fontSize: '16px', color }).setOrigin(0.5, 0).setDepth(102);
    const text = body ? this.add.text(WIDTH / 2, 0, body, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, align: 'center', wordWrap: { width: w - 34 }, lineSpacing: 3 }).setOrigin(0.5, 0).setDepth(102) : null;
    const h = 14 + title.height + (text ? 8 + text.height : 0) + 16 + 24 + 12;
    const y = Math.round((HEIGHT - h) / 2);
    title.setY(y + 14);
    if (text) text.setY(title.y + title.height + 8);
    objs.push(this.panel((WIDTH - w) / 2, y, w, h, 101), title);
    if (text) objs.push(text);
    const by = y + h - 12 - 12;
    buttons.forEach(([dx, bw, label, cb, opts]) => objs.push(this.button(WIDTH / 2 + dx, by, bw, 24, label, cb, { depth: 103, ...opts })));
    return objs;
  }

  title(text, sub) {
    const { WIDTH } = GAME;
    // Contorno oscuro: el título se lee igual sobre cielo claro, toldos o noche.
    this.add.text(WIDTH / 2, 8, text, { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS.gold, stroke: '#1a1410', strokeThickness: 2 }).setOrigin(0.5, 0).setDepth(30);
    if (sub) this.subText = this.add.text(WIDTH / 2, 25, sub, { fontFamily: 'monospace', fontSize: '8px', color: '#d8efe8', backgroundColor: '#0d1820b0', padding: { x: 4, y: 1 } }).setOrigin(0.5, 0).setDepth(30);
  }

  // Barra de tiempo arriba. Devuelve { left(), stop(), add(ms) }.
  timer(seconds, onEnd) {
    const { WIDTH } = GAME;
    const bar = this.add.rectangle(WIDTH / 2 - 100, 40, 200, 5, 0xe3b04b).setOrigin(0, 0.5).setDepth(31);
    this.add.rectangle(WIDTH / 2, 40, 204, 9, 0x081016, 0.7).setDepth(30).setStrokeStyle(1, 0xe3b04b, 0.4);
    const total = seconds * 1000;
    let left = total;
    let stopped = false;
    this.onUpdate((t, dt) => {
      if (stopped) return;
      left -= dt;
      bar.width = Math.max(0, (left / total) * 200);
      bar.setFillStyle(left < total * 0.25 ? 0xe8817a : 0xe3b04b);
      if (left <= 0) { stopped = true; onEnd(); }
    });
    return { left: () => left, stop: () => { stopped = true; }, add: (ms) => { left = Math.min(total, left + ms); } };
  }

  pop(text, color = COLORS.gold, y = GAME.HEIGHT / 2 - 20, size = '20px') {
    const t = this.add.text(GAME.WIDTH / 2, y, text, { fontFamily: 'Georgia, serif', fontSize: size, color, align: 'center' }).setOrigin(0.5).setDepth(80).setShadow(2, 2, '#000', 4).setScale(0.4);
    this.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, y: y - 16, delay: 900, duration: 400, onComplete: () => t.destroy() });
    return t;
  }

  good(x, y) { sfx('treasure'); this.burst(x, y, 0x8fd694); }
  bad() { sfx('damage'); vibrate(40); this.cameras.main.shake(160, 0.006); }

  burst(x, y, tint = 0xffe9a0, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const p = this.add.image(x, y, 'p_spark').setTint(tint).setDepth(90);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * 40, y: y + Math.sin(a) * 40, alpha: 0, duration: 520, onComplete: () => p.destroy() });
    }
  }

  // ------------------------------------------------------------ flujo
  showIntro() {
    const d = this.def;
    const go = () => {
      if (this.started) return;
      this.started = true;
      objs.forEach((o) => o.destroy());
      this.playing = true;
      sfx('confirm');
      if (d.start) d.start(this);
    };
    const objs = this.notice(d.name, COLORS.gold, fmt(d.how), [[0, 150, '▶ ¡Vamos!', go]]);
    ['X', 'E', 'ENTER', 'SPACE'].forEach((k) => this.input.keyboard.once('keydown-' + k, go));
  }

  win(score, lesson) {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    const { WIDTH, HEIGHT } = GAME;
    sfx('seal');
    vibrate([30, 40, 30]);
    this.burst(WIDTH / 2, HEIGHT / 2 - 20, 0xffe9a0, 20);
    const best = (this.save.scores || {})[this.id] || 0;
    if (!this.save.scores) this.save.scores = {};
    if (score != null && score > best) { this.save.scores[this.id] = score; writeSave(this.save); }
    this.time.delayedCall(450, () => {
      const done = () => this.finish(true, score);
      this.notice('¡Logrado!', '#8fd694', lesson ? fmt(lesson) : null, [[0, 140, 'Continuar', done]]);
      ['X', 'E', 'ENTER', 'SPACE'].forEach((k) => this.input.keyboard.once('keydown-' + k, done));
    });
  }

  lose(msg, allowSkip = false) {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    sfx('death');
    this.time.delayedCall(350, () => {
      const retry = () => { if (!this.finished) { this.finished = true; this.scene.restart(this.data0); } };
      const out = () => this.finish(allowSkip, 0);
      this.notice('¡Uy!', '#e8817a', fmt(msg), [
        [-62, 110, 'Reintentar', retry],
        [62, 110, allowSkip ? 'Seguir igual' : 'Salir', out, { fill: 0x2a1d2e }],
      ]);
      this.input.keyboard.once('keydown-X', retry);
      this.input.keyboard.once('keydown-ENTER', retry);
      this.input.keyboard.once('keydown-ESC', out);
    });
  }

  finish(win, score) {
    if (this.finished) return;
    this.finished = true;
    if (!this.afterScene) this.registry.set('mgResult', { id: this.id, win, score: score || 0, lesson: this.data0.lesson || null });
    if (this.afterScene) {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.afterScene.scene, this.afterScene.data || {}));
      return;
    }
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
