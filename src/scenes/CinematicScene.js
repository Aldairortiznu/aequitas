// Escena CINEMÁTICA: los momentos clave se cuentan a pantalla completa, con los
// personajes grandes, barras de cine, un fondo pintado por momento y el que
// habla iluminado mientras los demás se atenúan.
//
// Uso: this.scene.start('Cinematic', { key, returnScene, next });
//   next: { scene, data } — escena que sigue al terminar (encadena la historia).
// Al cerrarse hace resume(returnScene) si estaba pausada, o start(returnScene).

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { SPEAKERS } from '../data/speakers.js';
import { CINEMATICS } from '../data/ch1/script.js';
import { fmt } from '../systems/text.js';
import { portraitURL } from './DialogueScene.js';
import { sfx } from '../systems/audio.js';
import { drawPlace } from './places.js';
import { getPostal } from '../data/postales.js';
import { postalBackdrop } from '../art/postales.js';
import { unlockPostal } from '../systems/postales.js';

// A qué miembro del reparto pertenece cada voz (el pensamiento es del protagonista).
const OWNER = { pensamiento: 'explorador' };
// Los compañeros pequeños: escala menor; Lumen flota.
const SMALL = { lumen: 3.0, tinto: 3.0 };
const FLOAT = { lumen: 46 };

export default class CinematicScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Cinematic', cameras: CAMERA });
  }

  init(data) {
    this.returnScene = data.returnScene || 'Menu';
    this.pausedReturn = !!data.pausedReturn; // si el llamador hizo pause() (no start)
    this.next = data.next || null;
    const def = data.key ? CINEMATICS[data.key] : null;
    this.def = def || {
      title: data.title || null,
      subtitle: data.subtitle || null,
      palette: data.palette || ['#16384a', '#13301f'],
      scene: data.scene || 'puerto',
      cast: data.cast || ['explorador'],
      lines: data.convo || [{ s: 'narrador', t: '...' }],
    };
    this.lines = this.def.lines;
    this.index = 0;
    this.typing = false;
    this.finishing = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    this.cam = this.cameras.main;

    this.drawBackdrop();
    this.spawnMotes();
    this.buildStage();
    this.buildLetterbox();
    this.buildPanel();
    if (this.def.title) this.showTitleCard();

    // Controles: avanzar.
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-X', () => this.advance()); // botón X del celular
    this.input.keyboard.on('keydown-E', () => this.advance()); // botón E (Hablar) del celular
    this.input.keyboard.on('keydown-ESC', () => this.finish());
    this.input.on('pointerdown', () => this.advance());

    // Pequeña espera si hay título; si no, empieza ya.
    this.ready = false;
    this.startTimer = this.time.delayedCall(this.def.title ? 1500 : 250, () => {
      this.ready = true;
      this.showLine();
    });

    this.cam.fadeIn(500, 0, 0, 0);
  }

  // ----------------------------------------------------------------- fondo
  drawBackdrop() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics().setDepth(0);
    const hx = (h) => Phaser.Display.Color.HexStringToColor(h).color;
    const [topC, botC] = this.def.palette;
    const top = hx(topC);
    const bot = hx(botC);
    g.fillGradientStyle(top, top, bot, bot, 1);
    g.fillRect(0, 0, WIDTH, HEIGHT);

    const variant = this.def.scene || 'jardin';
    if (['biblioteca', 'puerto', 'atardecer'].includes(variant)) { drawPlace(g, variant); return; }
    // La fogata es una noche con un fuego en el suelo.
    const night = variant === 'noche' || variant === 'fogata';
    // Astro / fuente de luz.
    const lightY = night || variant === 'abismo' ? 56 : 64;
    if (variant !== 'abismo') {
      const lc = variant === 'paraiso' ? 0xfff4d2 : night ? 0xdfe7ff : 0xffe6a8;
      const lx = variant === 'fogata' ? WIDTH * 0.78 : WIDTH / 2;
      for (let r = 80; r > 0; r -= 6) {
        g.fillStyle(lc, 0.04 + (80 - r) / 1100);
        g.fillCircle(lx, lightY, r);
      }
      g.fillStyle(lc, 0.95);
      g.fillCircle(lx, lightY, night ? 12 : 18);
    } else {
      // Abismo: un resplandor frío y bajo, inquietante.
      for (let r = 120; r > 0; r -= 8) {
        g.fillStyle(0x3a2a5a, 0.03 + (120 - r) / 2600);
        g.fillCircle(WIDTH / 2, HEIGHT / 2, r);
      }
    }

    // Estrellas en la noche / abismo (patrón estable, sin Math.random).
    if (night || variant === 'abismo') {
      for (let i = 0; i < 70; i++) {
        const x = (i * 73) % WIDTH;
        const y = (i * (31 + (i % 9) * 13)) % 150;
        g.fillStyle(0xffffff, 0.25 + ((i * 7) % 5) / 12);
        g.fillRect(x, y, 1, 1);
      }
    }

    // Colinas / siluetas lejanas.
    const hills = variant === 'abismo'
      ? [{ c: 0x14101f, y: 210, r: 220 }, { c: 0x0c0814, y: 232, r: 280 }]
      : variant === 'paraiso'
        ? [{ c: 0x2f8a4a, y: 198, r: 170 }, { c: 0x247a3c, y: 214, r: 230 }, { c: 0x1c6230, y: 230, r: 290 }]
        : [{ c: 0x1f4d33, y: 200, r: 160 }, { c: 0x163e28, y: 216, r: 220 }, { c: 0x0f3220, y: 232, r: 280 }];
    hills.forEach((h) => {
      g.fillStyle(h.c, 1);
      g.fillCircle(WIDTH * 0.26, h.y + 40, h.r);
      g.fillCircle(WIDTH * 0.76, h.y + 52, h.r);
    });

    // Suelo al frente.
    const groundC = variant === 'abismo' ? 0x0a0810 : variant === 'paraiso' ? 0x2f6b3f : variant === 'fogata' ? 0x142a1c : 0x1c3a26;
    g.fillStyle(groundC, 1);
    g.fillRect(0, 206, WIDTH, HEIGHT - 206);
    if (variant === 'fogata') this.drawFire(WIDTH * (this.def.fireX || 0.5), 206);
  }

  // Fogata: troncos cruzados, llamas que titilan, chispas y un halo cálido.
  drawFire(x, y) {
    const halo = this.add.graphics().setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
    for (let r = 110; r > 0; r -= 10) {
      halo.fillStyle(0xff9a3a, 0.012 + (110 - r) / 4200);
      halo.fillCircle(x, y - 10, r);
    }
    this.tweens.add({ targets: halo, alpha: 0.75, duration: 180, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const logs = this.add.graphics().setDepth(6);
    logs.fillStyle(0x4a2a14, 1);
    logs.fillRect(x - 16, y - 4, 32, 5);
    logs.fillStyle(0x5a3418, 1);
    logs.fillRect(x - 12, y - 7, 24, 4);
    // Llamas dibujadas desde su base (0,0) para que titilen creciendo hacia arriba.
    const flame = this.add.graphics().setDepth(7).setPosition(x, y - 5);
    flame.fillStyle(0xff6a1a, 1);
    flame.fillTriangle(-12, 0, 12, 0, 0, -29);
    flame.fillStyle(0xffb03a, 1);
    flame.fillTriangle(-8, 0, 8, 0, 1, -21);
    flame.fillStyle(0xfff0a0, 1);
    flame.fillTriangle(-4, 0, 4, 0, 0, -10);
    this.tweens.add({ targets: flame, scaleY: 0.84, scaleX: 1.06, duration: 140, yoyo: true, repeat: -1 });
    this.add.particles(x, y - 18, 'p_soft', {
      lifespan: 1400, speedY: { min: -40, max: -18 }, speedX: { min: -10, max: 10 },
      scale: { start: 0.45, end: 0 }, alpha: { start: 0.9, end: 0 }, tint: [0xffb03a, 0xff6a1a, 0xfff0a0],
      frequency: 110, blendMode: 'ADD',
    }).setDepth(7);
  }

  spawnMotes() {
    const variant = this.def.scene || 'jardin';
    const tint = variant === 'abismo' ? 0x9a7ad0 : variant === 'noche' || variant === 'fogata' ? 0xdfe7ff : variant === 'paraiso' ? 0xfff0b0 : 0xffe9a0;
    this.add.particles(0, 0, 'p_soft', {
      x: { min: 0, max: GAME.WIDTH },
      y: { min: 80, max: 210 },
      lifespan: 6000,
      speedY: { min: -12, max: -2 },
      speedX: { min: -6, max: 6 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint,
      frequency: 180,
      blendMode: 'ADD',
    }).setDepth(2);
  }

  // ------------------------------------------------------------- escenario
  buildStage() {
    const { WIDTH } = GAME;
    const cast = this.def.cast && this.def.cast.length ? this.def.cast : ['explorador'];
    const n = cast.length;
    const slots = this.def.slots || (n === 1 ? [0.5] : n === 2 ? [0.32, 0.68] : [0.2, 0.5, 0.8]);
    this.actors = {};
    cast.forEach((key, i) => {
      const sp = SPEAKERS[key];
      const sprKey = (sp && sp.portrait) || key;
      const x = WIDTH * slots[i];
      const scale = SMALL[key] || 3.6;
      const baseY = 214 - (FLOAT[key] || 0);
      // Sombra.
      const shadow = this.add.ellipse(x, 215, 26 * scale * 0.5, 7, 0x05100a, FLOAT[key] ? 0.25 : 0.45).setDepth(8);
      const spr = this.add.image(x, baseY, sprKey).setOrigin(0.5, 1).setScale(scale).setDepth(10 + i);
      if (key === 'tinto' && x > WIDTH / 2) spr.setFlipX(true);
      spr.baseX = x;
      spr.baseY = baseY;
      spr.baseScale = scale;
      spr.shadow = shadow;
      // Entrada: se desliza desde su lado y aparece.
      const from = i < n / 2 ? -60 : 60;
      spr.x = x + from;
      spr.alpha = 0;
      shadow.x = spr.x;
      this.tweens.add({ targets: [spr, shadow], x, duration: 600, ease: 'Cubic.out', delay: 200 + i * 120 });
      this.tweens.add({ targets: spr, alpha: 1, duration: 600, delay: 200 + i * 120 });
      // Respiración sutil.
      this.tweens.add({ targets: spr, y: baseY - (FLOAT[key] ? 7 : 3), duration: FLOAT[key] ? 1100 : 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 200 });
      this.actors[key] = spr;
    });
  }

  // Devuelve el actor (sprite) que "posee" una voz, si está en escena.
  actorFor(speakerKey) {
    const owner = OWNER[speakerKey] || speakerKey;
    if (this.actors[owner]) return this.actors[owner];
    if (this.actors[speakerKey]) return this.actors[speakerKey];
    return null;
  }

  // ------------------------------------------------------------- letterbox
  buildLetterbox() {
    const { WIDTH, HEIGHT } = GAME;
    const top = this.add.rectangle(0, 0, WIDTH, 18, 0x05080a, 1).setOrigin(0).setDepth(30);
    const bot = this.add.rectangle(0, HEIGHT - 14, WIDTH, 14, 0x05080a, 1).setOrigin(0).setDepth(30);
    // Entran deslizándose (efecto "cámara").
    top.y = -18; bot.y = HEIGHT;
    this.tweens.add({ targets: top, y: 0, duration: 500, ease: 'Cubic.out' });
    this.tweens.add({ targets: bot, y: HEIGHT - 14, duration: 500, ease: 'Cubic.out' });
  }

  // ----------------------------------------------------------- panel de texto
  buildPanel() {
    const { WIDTH, HEIGHT } = GAME;
    const px = 10;
    const pw = WIDTH - 20;
    const ph = 62;
    const py = HEIGHT - 10 - ph;
    this.panelBox = { px, py, pw, ph };
    const g = this.add.graphics().setDepth(20);
    this.panelG = g;
    g.fillStyle(0x06100b, 0.94);
    g.fillRoundedRect(px, py, pw, ph, 6);
    g.lineStyle(2, Phaser.Display.Color.HexStringToColor(COLORS.gold).color, 0.9);
    g.strokeRoundedRect(px, py, pw, ph, 6);

    this.nameText = this.add.text(px + 12, py + 6, '', { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS.gold })
      .setDepth(21).setShadow(1, 1, '#000', 3);
    // Deja libre la esquina del ▼ para que no se monte sobre la última palabra.
    this.bodyText = this.add.text(px + 12, py + 25, '', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.cream,
      wordWrap: { width: pw - 40 }, lineSpacing: 3,
    }).setDepth(21);
    this.cont = this.add.text(px + pw - 16, py + ph - 16, '▼', { fontFamily: 'monospace', fontSize: '11px', color: COLORS.gold })
      .setDepth(21).setVisible(false);
    this.tweens.add({ targets: this.cont, y: this.cont.y - 2, duration: 500, yoyo: true, repeat: -1 });
  }

  showTitleCard() {
    const { WIDTH } = GAME;
    const t = this.add.text(WIDTH / 2, 92, this.def.title, { fontFamily: 'Georgia, serif', fontSize: '34px', color: COLORS.gold })
      .setOrigin(0.5).setDepth(40).setAlpha(0);
    t.setShadow(0, 0, '#f5d48a', 14, true, true);
    let sub = null;
    if (this.def.subtitle) {
      sub = this.add.text(WIDTH / 2, 120, this.def.subtitle, { fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.cream, fontStyle: 'italic' })
        .setOrigin(0.5).setDepth(40).setAlpha(0).setShadow(1, 1, '#000', 3);
    }
    this.tweens.add({ targets: [t, sub].filter(Boolean), alpha: 1, duration: 700 });
    this.tweens.add({ targets: [t, sub].filter(Boolean), alpha: 0, y: '-=10', delay: 1700, duration: 600, onComplete: () => { t.destroy(); if (sub) sub.destroy(); } });
  }

  // --------------------------------------------------------------- líneas
  showLine() {
    const line = this.lines[this.index];
    const sp = SPEAKERS[line.s] || SPEAKERS.narrador;

    this.nameText.setText(fmt(sp.name)).setColor(sp.color);
    this.bodyText.setColor('#f5f1e4');
    this.bodyText.setFontStyle(sp.italic ? 'italic' : 'normal');

    // Resalta al que habla; atenúa al resto. El narrador no resalta a nadie.
    const active = this.actorFor(line.s);
    const narr = line.s === 'narrador' || !active;
    for (const key of Object.keys(this.actors)) {
      const a = this.actors[key];
      const on = narr || a === active;
      this.tweens.add({ targets: a, scale: !narr && on ? a.baseScale * 1.08 : narr ? a.baseScale : a.baseScale * 0.94, duration: 260, ease: 'Sine.out' });
      this.tweens.add({ targets: a, alpha: on ? 1 : 0.5, duration: 260 });
      if (!on) a.setTint(0x6b6f72);
      else a.clearTint();
    }
    if (line.s === 'tinto') sfx('note');
    // Celular en vertical: el texto va grande en el panel de la consola.
    const big = !!window.__portraitHud && !!window.__domPad;
    [this.panelG, this.nameText, this.bodyText, this.cont].forEach((o) => o.setAlpha(big ? 0 : 1));
    window.__dlg = { name: fmt(sp.name), color: sp.color, text: fmt(line.t), portrait: portraitURL(this, sp.portrait), n: (window.__dlg ? window.__dlg.n : 0) + 1 };

    if (line.fx) this.playFx(line.fx, active);
    if (line.postal) this.setBackdrop(line.postal);

    // Máquina de escribir. El texto se corta en líneas ANTES de escribirlo, así
    // ninguna palabra salta de renglón a mitad de camino. Sin nombre (narrador),
    // el texto queda centrado en la caja.
    const { py, ph } = this.panelBox;
    this.full = this.bodyText.getWrappedText(fmt(line.t)).join('\n');
    const named = !!fmt(sp.name).trim();
    const h = this.bodyText.setText(this.full).height;
    this.bodyText.setY(named ? py + 25 : Math.round(py + (ph - h) / 2));
    this.shown = 0;
    this.typing = true;
    this.cont.setVisible(false);
    this.bodyText.setText('');
    if (this.typer) this.typer.remove();
    this.typer = this.time.addEvent({
      delay: this.registry.get('textSpeed') || 24,
      loop: true,
      callback: () => {
        this.shown++;
        this.bodyText.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) {
          this.typing = false;
          this.typer.remove();
          this.cont.setVisible(true);
        }
      },
    });
    // En el panel del celular el texto sale completo: nada de toques «muertos».
    if (big) { this.typer.remove(); this.bodyText.setText(this.full); this.typing = false; this.cont.setVisible(true); }
  }

  // Escena cinematográfica (data/postales.js) por encima del escenario y debajo
  // del texto; { postal: 'off' } vuelve al escenario.
  setBackdrop(key) {
    if (key === this.backKey) return;
    this.backKey = key;
    const old = this.backdrop;
    if (old) this.tweens.add({ targets: old, alpha: 0, duration: 700, onComplete: () => old.destroy() });
    this.backdrop = null;
    const p = key !== 'off' && getPostal(key);
    if (!p) return;
    unlockPostal(key);
    this.backdrop = postalBackdrop(this, p, { depth: 16, offsetY: -36 });
  }

  playFx(fx, actor) {
    if (fx === 'flash') this.cam.flash(300, 240, 235, 200);
    else if (fx === 'shake') this.cam.shake(260, 0.006);
    else if (fx === 'heart' && actor) {
      for (let i = 0; i < 10; i++) {
        const h = this.add.text(actor.x, actor.baseY - 60, '♥', { fontSize: '12px', color: '#ff9ec4' }).setDepth(25).setOrigin(0.5);
        this.tweens.add({
          targets: h,
          x: actor.x + Phaser.Math.Between(-40, 40),
          y: actor.baseY - 60 - Phaser.Math.Between(30, 80),
          alpha: 0,
          duration: 1200,
          delay: i * 60,
          onComplete: () => h.destroy(),
        });
      }
      this.cam.flash(400, 255, 210, 230);
    }
  }

  advance() {
    // Si aún se muestra el título, el primer toque/X lo SALTA y arranca ya las
    // líneas (antes la X "no hacía nada" durante ~1.5s).
    if (!this.ready) {
      if (this.startTimer) this.startTimer.remove();
      this.ready = true;
      this.showLine();
      return;
    }
    if (this.typing) {
      this.typer.remove();
      this.bodyText.setText(this.full);
      this.typing = false;
      this.cont.setVisible(true);
      return;
    }
    this.index++;
    if (this.index >= this.lines.length) this.finish();
    else this.showLine();
  }

  finish() {
    // ESC + toque a la vez reanudaba/arrancaba la escena de regreso dos veces.
    if (this.finishing) return;
    this.finishing = true;
    window.__dlg = null;
    this.cam.fadeOut(450, 0, 0, 0);
    this.cam.once('camerafadeoutcomplete', () => {
      if (this.next) {
        this.scene.start(this.next.scene, this.next.data || {});
      } else if (this.pausedReturn) {
        if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
        this.scene.stop();
      } else {
        this.scene.start(this.returnScene);
      }
    });
  }
}
