// EL PUEBLO: Puerto Garza explorable. Caminar, hablar con la gente, examinar
// cosas, recoger páginas del Códice, perseguir gallinas y disparar minijuegos.
//
// Todo lo que pasa "en orden" (diálogos, cartas nuevas, minijuegos, escenas)
// va por una COLA de pasos: los bloqueantes lanzan una escena encima (el pueblo
// se pausa) y al volver (evento 'resume') sigue el siguiente paso.

import Phaser from 'phaser';
import { CAMERA, ZOOM } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { MAP, BUILDINGS, PROPS, WRECKS, ORDER_DECOR, BOATS, LAMPS, PAGES, HERONS, HEN_ZONE, START, ZONES } from '../data/ch1/map.js';
import { orderValue, orderLevel, orderStep, TEACHINGS } from '../systems/order.js';
import { NPCS, SPOTS, TALK } from '../data/ch1/talk.js';
import { SPEAKERS } from '../data/speakers.js';
import { EVENTS, WINS } from '../data/ch1/script.js';
import { ITEMS, TRUST } from '../data/ch1/items.js';
import { getCard } from '../data/codex.js';
import { makeBuilding } from '../art/aequitasArt.js';
import { heroFor } from '../data/heroes.js';
import { getSave, writeSave } from '../systems/save.js';
import { give, checkAll, check, objective, trustCount, hearingReady, missingForHearing, evidenceCount, hasFlag, hasItem, mysteries, openMystery } from '../systems/story.js';
import { startAudio, playTheme, sfx, toggleMute } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';
import { fmt } from '../systems/text.js';

const TILE = 16;
const COLS = 64;
const ROWS = 48;
const SPEED = 96;
const SOLID = new Set(['~', 'B', 'h', 'P', 'p', 'T', 'b', 'f', 'k', 'o', 'r', 'x']);
const GROUND = new Set(['.', ',', ':', '#', '=', 's', 'R', '~', 'h']);

// Cómo se llama cada lugar en el letrero de la flecha guía.
const SPOT_NAMES = {
  letrero_muelle: 'Letrero del muelle', panel: 'Panel solar', antena: 'La antena', casco: 'Casco de la lancha',
  cabina: 'Cabina de la lancha', bodega: 'La bodega', junta_puerta: 'Casa de la Junta', viaje: 'Final del muelle',
  valla: 'La valla', filtro: 'El filtro de agua', bus: 'El bus del río', campanario: 'El campanario',
};

export default class TownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Town', cameras: CAMERA });
  }

  init() {
    this.save = getSave();
  }

  create() {
    if (!this.save) { this.scene.start('Menu'); return; }
    this.steps = [];
    this.busy = false;
    this.chase = null;
    this.npcs = {};
    this.lastSaveAt = 0;
    if (this.save.stage !== 'libre') this.save.stage = 'pueblo';
    this.speed = SPEED * (heroFor(this.save).perk.speed || 1); // Valeria conoce los atajos

    this.buildSolidGrid();
    this.buildGround();
    this.buildShore();
    this.buildTileProps();
    this.buildBuildings();
    this.buildProps();
    this.buildWrecks();
    this.buildOrderDecor();
    this.buildWaterLife();
    this.buildLamps();
    this.buildPages();
    this.buildCritters();
    this.createPlayer();
    this.createCompanions();
    this.createNpcs();
    this.buildColliders();

    this.cameras.main.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor(COLORS.bgDeep);
    // Lo fijo a la pantalla (HUD, luz, viñeta: scrollFactor 0) va en una cámara
    // aparte que no se mueve; la principal sigue al personaje con el zoom.
    this.uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height).setOrigin(0).setZoom(ZOOM);
    this.events.on('prerender', this.splitCameras, this);
    this.events.once('shutdown', () => this.events.off('prerender', this.splitCameras, this));
    this.physics.world.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.player.setCollideWorldBounds(true);

    // Luz de la tarde, polvo en el aire y colores gastados por el sol + viñeta.
    this.add.rectangle(0, 0, GAME.WIDTH, GAME.HEIGHT, 0xffd9a0, 0.06).setOrigin(0).setScrollFactor(0).setDepth(9000).setBlendMode(Phaser.BlendModes.ADD);
    this.add.particles(0, 0, 'p_soft', {
      x: { min: 0, max: GAME.WIDTH }, y: { min: 0, max: GAME.HEIGHT }, lifespan: 6000,
      speedX: { min: 3, max: 10 }, speedY: { min: -4, max: 2 }, scale: { start: 0.45, end: 0.15 },
      alpha: { start: 0.3, end: 0 }, tint: 0xe8d8b0, frequency: 280,
    }).setScrollFactor(0).setDepth(8999);
    // Mientras más orden, más color: el puerto empieza gris y triste.
    this.gloom = this.add.rectangle(0, 0, GAME.WIDTH, GAME.HEIGHT, 0x1d2a38, 0).setOrigin(0).setScrollFactor(0).setDepth(8998);
    if (this.renderer.type === Phaser.WEBGL && this.cameras.main.postFX) this.colorFx = this.cameras.main.postFX.addColorMatrix();
    this.order = orderValue(this.save);
    this.applyOrderLook(this.order);
    if (this.textures.exists('vignette')) this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(9001);

    this.buildHud();
    this.buildMarker();
    this.setupInput();

    // Volver de una escena superpuesta (diálogo, minijuego, carta...).
    const onResume = () => this.onOverlayClosed();
    const onPause = () => { window.__padVec = { x: 0, y: 0 }; if (this.player && this.player.body) this.player.setVelocity(0, 0); };
    this.events.on('resume', onResume);
    this.events.on('pause', onPause);
    this.events.once('shutdown', () => {
      this.events.off('resume', onResume);
      this.events.off('pause', onPause);
    });

    this.theme = this.themeFor(this.order);
    startAudio().then(() => playTheme(this.theme));
    this.cameras.main.fadeIn(600, 13, 24, 32);
    this.uiCam.fadeIn(600, 13, 24, 32);
    writeSave(this.save);
    // Si quedaron cartas por mostrar (p. ej. ganadas en una cinemática), se ven ya.
    this.time.delayedCall(700, () => this.runNext());
  }

  // ----------------------------------------------------------------- mapa
  ch(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return 'b';
    return MAP[y][x];
  }

  buildSolidGrid() {
    this.solid = [];
    for (let y = 0; y < ROWS; y++) {
      this.solid.push([]);
      for (let x = 0; x < COLS; x++) this.solid[y].push(SOLID.has(this.ch(x, y)));
    }
    this.propSolids = {};
    PROPS.forEach((p) => {
      const cells = (p.foot || []).map(([dx, dy]) => [p.x + dx, p.y + dy]);
      if (p.id) this.propSolids[p.id] = cells;
      cells.forEach(([x, y]) => { if (this.solid[y]) this.solid[y][x] = true; });
    });
    if (hasFlag(this.save, 'reten_open')) (this.propSolids.reten || []).forEach(([x, y]) => { this.solid[y][x] = false; });
  }

  walkable(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS && !this.solid[ty][tx];
  }

  // Suelo de cada baldosa: los obstáculos toman el suelo de sus vecinos.
  baseGround(x, y) {
    const c = this.ch(x, y);
    if (GROUND.has(c)) return c;
    if (c === 'p') return 's';
    const count = {};
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = this.ch(x + dx, y + dy);
      if (GROUND.has(n) && n !== '~' && n !== 'h') count[n] = (count[n] || 0) + 1;
    }
    let best = '.';
    let bn = 0;
    for (const [k, v] of Object.entries(count)) if (v > bn) { best = k; bn = v; }
    return best;
  }

  buildGround() {
    const rt = this.add.renderTexture(0, 0, COLS * TILE, ROWS * TILE).setOrigin(0).setDepth(-10);
    rt.beginDraw();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const g = this.baseGround(x, y);
        const v = (x * 7 + y * 13) % 5;
        let key = 't_grass0';
        if (g === '.') key = v === 0 ? 't_grass2' : 't_grass0';
        else if (g === ',') key = 't_grass1';
        else if (g === ':') key = v < 2 ? 't_dirt1' : 't_dirt0';
        else if (g === '#') key = 't_stone';
        else if (g === '=') key = y >= 36 || this.ch(x, y - 1) === '~' || this.ch(x, y + 1) === '~' ? 't_planksV' : 't_planks';
        else if (g === 's') key = v === 0 ? 't_sand1' : 't_sand0';
        else if (g === 'R') key = 't_rails';
        else if (g === '~') key = 't_water0';
        else if (g === 'h') key = 't_crops';
        rt.batchDrawFrame(key, undefined, x * TILE, y * TILE);
      }
    }
    rt.endDraw();
    this.groundRT = rt;
  }

  // Orillas: espuma donde el agua toca tierra; bordes suaves entre caminos y césped.
  buildShore() {
    const g = this.add.graphics();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = this.ch(x, y);
        const px = x * TILE;
        const py = y * TILE;
        if (c === '~') {
          const land = (dx, dy) => { const n = this.ch(x + dx, y + dy); return n !== '~' && n !== '=' && !(x + dx < 0 || x + dx >= COLS || y + dy >= ROWS); };
          g.fillStyle(0x6fb8ad, 0.55);
          if (land(0, -1)) { g.fillRect(px, py, 16, 3); g.fillStyle(0xe8f4ee, 0.7); g.fillRect(px + ((x * 5) % 9), py + 1, 4, 1); g.fillStyle(0x6fb8ad, 0.55); }
          if (land(0, 1)) g.fillRect(px, py + 13, 16, 3);
          if (land(-1, 0)) g.fillRect(px, py, 3, 16);
          if (land(1, 0)) g.fillRect(px + 13, py, 3, 16);
        } else if (c === ':' || c === '#') {
          const grass = (dx, dy) => { const n = this.baseGround(x + dx, y + dy); return n === '.' || n === ','; };
          g.fillStyle(0x3f7f33, 0.5);
          if (grass(0, -1)) g.fillRect(px, py, 16, 1);
          if (grass(0, 1)) g.fillRect(px, py + 15, 16, 1);
          if (grass(-1, 0)) g.fillRect(px, py, 1, 16);
          if (grass(1, 0)) g.fillRect(px + 15, py, 1, 16);
        } else if (c === '=') {
          g.fillStyle(0x3a2a1a, 0.6);
          if (this.ch(x, y + 1) === '~') { g.fillRect(px + 2, py + 16, 2, 4); g.fillRect(px + 12, py + 16, 2, 4); }
        }
      }
    }
    this.groundRT.draw(g);
    g.destroy();
  }

  // Obstáculos dibujados desde el mapa (palmas, árboles, cercas, cajas...).
  buildTileProps() {
    let flip = false;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = this.ch(x, y);
        const bx = x * TILE + 8;
        const by = (y + 1) * TILE;
        let key = null;
        if (c === 'P' || c === 'p') key = 'pr_palm';
        else if (c === 'T') key = 'tx_tree';
        else if (c === 'b') key = 'pr_bush';
        else if (c === 'k') key = 'pr_crate';
        else if (c === 'o') key = 'pr_barrel';
        else if (c === 'r') key = 'pr_rubble';
        else if (c === 'f') key = this.ch(x - 1, y) === 'f' || this.ch(x + 1, y) === 'f' ? 'pr_fence_h' : 'pr_fence_v';
        if (!key || !this.textures.exists(key)) continue;
        const im = this.add.image(bx, by, key).setOrigin(0.5, 1).setDepth(by);
        if (key === 'pr_palm') { flip = !flip; im.setFlipX(flip); }
        if (key === 'tx_tree') im.setY(by + 2);
      }
    }
  }

  buildBuildings() {
    BUILDINGS.forEach((b, i) => {
      const key = 'bld_' + b.id;
      if (!this.textures.exists(key)) makeBuilding(this, key, b.w, b.h, { ...b, seed: 11 + i * 7 });
      const bottom = (b.y + b.h) * TILE;
      this.add.image(b.x * TILE, bottom, key).setOrigin(0, 1).setDepth(bottom);
      if (b.sign) {
        const cx = (b.x + b.w / 2) * TILE;
        const H = b.h * TILE + TILE;
        const facade = Math.min(30, Math.max(22, Math.round(H * 0.38)));
        const t = this.add.text(cx, bottom - facade + 1, b.sign, { fontFamily: 'monospace', fontSize: '7px', color: '#efe3c2', backgroundColor: '#5a3a20', padding: { x: 2, y: 1 } })
          .setOrigin(0.5, 0).setDepth(bottom + 1);
        if (t.width > b.w * TILE - 4) t.setScale((b.w * TILE - 4) / t.width);
      }
    });
  }

  buildProps() {
    this.propImgs = {};
    PROPS.forEach((p) => {
      const w = p.w || 1;
      const bx = p.x * TILE + (w * TILE) / 2;
      const footRows = p.foot && p.foot.length ? Math.max(...p.foot.map(([, dy]) => dy)) : 0;
      const by = (p.y + 1 + footRows) * TILE + (p.below || 0);
      let tex = p.tex;
      if (p.id === 'lancha' && hasItem(this.save, 'nombre_original')) tex = 'pr_lancha_raspada';
      const im = this.add.image(bx, by, tex).setOrigin(0.5, 1).setDepth(by);
      if (p.id) this.propImgs[p.id] = im;
      if (p.label) {
        this.add.text(bx, by + (p.labelY || -20), p.label, { fontFamily: 'monospace', fontSize: '6px', color: p.labelColor || '#efe3c2', align: 'center', backgroundColor: p.labelBg, padding: p.labelBg ? { x: 2, y: 1 } : undefined })
          .setOrigin(0.5).setDepth(by + 1);
      }
    });
    if (hasFlag(this.save, 'reten_open') && this.propImgs.reten) this.propImgs.reten.setPosition(this.propImgs.reten.x + 36, this.propImgs.reten.y - 20);
  }

  // Lo que la guerra dejó en el río: el bus del puente, el campanario, un techo y una torre.
  buildWrecks() {
    WRECKS.forEach((w) => {
      const im = this.add.image(w.x * TILE + 8, (w.y + 1) * TILE, w.tex).setOrigin(0.5, 1).setDepth((w.y + 1) * TILE - 8);
      if (w.heron) {
        const h = this.add.image(im.x + 9, im.y - im.height + 17, 'an_heron').setOrigin(0.5, 1).setDepth(im.depth + 1);
        this.tweens.add({ targets: h, scaleX: -1, duration: 200, delay: 2600, yoyo: true, repeat: -1, repeatDelay: 4200 });
      }
    });
  }

  // Barcas meciéndose, destellos del río y algún pez que salta.
  buildWaterLife() {
    BOATS.forEach((b, i) => {
      const im = this.add.image(b.x * TILE + 8, (b.y + 1) * TILE, b.tex).setOrigin(0.5, 1).setDepth((b.y + 1) * TILE).setFlipX(!!b.flip);
      this.tweens.add({ targets: im, y: im.y + 2, angle: b.flip ? -2 : 2, duration: 1600 + i * 230, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    const water = [];
    for (let y = 36; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (this.ch(x, y) === '~') water.push([x, y]);
    for (let i = 0; i < 46; i++) {
      const [x, y] = water[Math.floor(Math.random() * water.length)];
      const sp = this.add.image(x * TILE + Math.random() * 16, y * TILE + Math.random() * 16, 'p_soft').setTint(0xbfeee4).setAlpha(0).setDepth(-5).setScale(Math.random() < 0.5 ? 0.6 : 1);
      this.tweens.add({ targets: sp, alpha: 0.7, x: sp.x + 6, duration: 1200 + Math.random() * 1400, yoyo: true, repeat: -1, delay: Math.random() * 3000 });
    }
    this.time.addEvent({
      delay: 2600, loop: true, callback: () => {
        const [x, y] = water[Math.floor(Math.random() * water.length)];
        this.splash(x * TILE + 8, y * TILE + 8);
      },
    });
  }

  splash(x, y) {
    for (let i = 0; i < 6; i++) {
      const d = this.add.image(x, y, 'p_soft').setTint(0xe8f4ee).setDepth(-4);
      this.tweens.add({ targets: d, x: x + Phaser.Math.Between(-8, 8), y: y - Phaser.Math.Between(4, 10), alpha: 0, duration: 420, onComplete: () => d.destroy() });
    }
  }

  buildLamps() {
    this.lamps = LAMPS.map((l) => {
      const bx = l.x * TILE + 8;
      const by = (l.y + 1) * TILE;
      const im = this.add.image(bx, by, 'pr_lamp_off').setOrigin(0.5, 1).setDepth(by);
      if (this.solid[l.y]) this.solid[l.y][l.x] = true;
      return im;
    });
    if (hasFlag(this.save, 'alumbrado_done')) this.lightLamps(false);
  }

  lightLamps(animated) {
    this.lamps.forEach((im, i) => {
      const go = () => {
        im.setTexture('pr_lamp_on');
        const glow = this.add.image(im.x, im.y - 26, 'p_soft').setTint(0xffe070).setScale(9).setAlpha(0.22).setBlendMode(Phaser.BlendModes.ADD).setDepth(im.depth + 1);
        this.tweens.add({ targets: glow, alpha: 0.32, duration: 900 + i * 90, yoyo: true, repeat: -1 });
        if (animated) { sfx('select'); this.cameras.main.flash(80, 255, 240, 180); }
      };
      if (animated) this.time.delayedCall(300 + i * 260, go); else go();
    });
  }

  buildPages() {
    this.pages = [];
    PAGES.forEach((p) => {
      if (this.save.codex && this.save.codex[p.id]) return;
      const im = this.add.image(p.x * TILE + 8, (p.y + 1) * TILE - 2, 'pg_codice').setOrigin(0.5, 1).setDepth((p.y + 1) * TILE);
      im.pageId = p.id;
      this.tweens.add({ targets: im, y: im.y - 3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const glow = this.add.image(im.x, im.y - 6, 'p_soft').setTint(0xfff0b0).setScale(4).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD).setDepth(im.depth - 1);
      this.tweens.add({ targets: glow, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
      im.glow = glow;
      this.pages.push(im);
    });
  }

  // Gallinas del barrio y garzas de la orilla.
  buildCritters() {
    this.hens = [];
    const z = HEN_ZONE;
    for (let i = 0; i < 3; i++) {
      const key = i === 1 ? 'an_hen2' : 'an_hen';
      const h = this.add.image((z.x0 + 1 + i * 2) * TILE, (z.y0 + 3 + i * 2) * TILE, key + '0').setOrigin(0.5, 1);
      h.base = key;
      h.target = null;
      this.hens.push(h);
    }
    this.herons = HERONS.map((p) => {
      const im = this.add.image(p.x * TILE + 8, (p.y + 1) * TILE, 'an_heron').setOrigin(0.5, 1).setDepth((p.y + 1) * TILE);
      im.home = { x: im.x, y: im.y };
      im.away = false;
      return im;
    });
  }

  // ----------------------------------------------------------------- gente
  createPlayer() {
    let sx = START.x * TILE + 8;
    let sy = (START.y + 1) * TILE - 2;
    if (this.save.px != null && this.walkable(Math.floor(this.save.px / TILE), Math.floor((this.save.py - 2) / TILE))) { sx = this.save.px; sy = this.save.py; }
    this.playerShadow = this.add.ellipse(sx, sy, 14, 4, 0x05100a, 0.35);
    this.player = this.physics.add.image(sx, sy, 'player').setOrigin(0.5, 1);
    this.player.body.setSize(10, 6);
    this.player.body.setOffset(3, 20);
    this.facing = 'down';
    this.bob = 0;
    this.trail = [{ x: sx, y: sy }];
  }

  createCompanions() {
    const p = this.player;
    this.tintoShadow = this.add.ellipse(p.x, p.y, 14, 4, 0x05100a, 0.3);
    this.tinto = this.add.image(p.x, p.y + 14, 'tinto').setOrigin(0.5, 1);
    this.lumen = this.add.image(p.x - 12, p.y - 26, 'lumen').setOrigin(0.5, 1);
    this.lumenGlow = this.add.image(p.x, p.y, 'p_soft').setTint(0xfff3b0).setScale(5).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { this.lumen.setTexture('lumen_blink'); this.time.delayedCall(140, () => this.lumen.setTexture('lumen')); } });
    this.tintoIdleAt = 0;
  }

  createNpcs() {
    this.npcGroup = this.physics.add.staticGroup();
    NPCS.forEach((n) => {
      const x = n.x * TILE + 8;
      const y = (n.y + 1) * TILE - 2;
      const im = this.add.image(x, y, n.tex).setOrigin(0.5, 1).setDepth(y);
      const body = this.add.zone(x, y - 3, 10, 6);
      this.physics.add.existing(body, true);
      this.npcGroup.add(body);
      const sh = this.add.ellipse(x, y, 13, 4, 0x05100a, 0.3).setDepth(y - 1);
      const npc = { ...n, img: im, body, shadow: sh, home: { x, y }, nextMove: this.time.now + Phaser.Math.Between(1500, 4000) };
      this.npcs[n.id] = npc;
      this.refreshNpcVisibility(npc);
    });
    // Lucho sin gallina (ya la devolvió).
    if (hasFlag(this.save, 'gallina_done') && this.npcs.lucho) this.npcs.lucho.img.setTexture('npc_lucho_sin');
  }

  refreshNpcVisibility(npc, animated = false) {
    const vis = !npc.showIf || check(this.save, npc.showIf);
    if (animated && vis === !npc.hidden) return;
    npc.body.body.enable = vis;
    npc.hidden = !vis;
    if (!animated) { npc.img.setVisible(vis); npc.shadow.setVisible(vis); return; }
    [npc.img, npc.shadow].forEach((o) => {
      o.setVisible(true).setAlpha(vis ? 0 : 1);
      this.tweens.add({ targets: o, alpha: vis ? 1 : 0, duration: 800, onComplete: () => o.setVisible(vis) });
    });
  }

  buildColliders() {
    this.walls = this.physics.add.staticGroup();
    this.wallZones = [];
    for (let y = 0; y < ROWS; y++) {
      let x = 0;
      while (x < COLS) {
        if (!this.solid[y][x]) { x++; continue; }
        const x0 = x;
        while (x < COLS && this.solid[y][x]) x++;
        const z = this.add.zone(x0 * TILE + ((x - x0) * TILE) / 2, y * TILE + 8, (x - x0) * TILE, TILE);
        this.physics.add.existing(z, true);
        this.walls.add(z);
        z.cells = [x0, x - 1, y];
        this.wallZones.push(z);
      }
    }
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.npcGroup);
  }

  // Quita los bloques de colisión que cubren ciertas baldosas (retén abierto).
  clearSolid(cells) {
    cells.forEach(([x, y]) => { this.solid[y][x] = false; });
    this.wallZones.forEach((z) => {
      const [x0, x1, y] = z.cells;
      if (cells.some(([cx, cy]) => cy === y && cx >= x0 && cx <= x1)) { this.walls.remove(z, true, true); z.dead = true; }
    });
    this.wallZones = this.wallZones.filter((z) => !z.dead);
    // Vuelve a crear los tramos que quedaron sólidos en esas filas.
    const rows = [...new Set(cells.map(([, y]) => y))];
    rows.forEach((y) => {
      let x = 0;
      while (x < COLS) {
        if (!this.solid[y][x]) { x++; continue; }
        const x0 = x;
        while (x < COLS && this.solid[y][x]) x++;
        if (this.wallZones.some((z) => z.cells[2] === y && z.cells[0] === x0)) continue;
        const z = this.add.zone(x0 * TILE + ((x - x0) * TILE) / 2, y * TILE + 8, (x - x0) * TILE, TILE);
        this.physics.add.existing(z, true);
        this.walls.add(z);
        z.cells = [x0, x - 1, y];
        this.wallZones.push(z);
      }
    });
  }

  // ----------------------------------------------------------------- HUD
  buildHud() {
    const W = GAME.WIDTH;
    const D = 10000;
    const sf = (o) => o.setScrollFactor(0).setDepth(D);
    const g = sf(this.add.graphics());
    // Casi opacos: los letreros del mapa no deben verse a través del texto.
    g.fillStyle(0x081016, 0.9); g.fillRoundedRect(4, 4, 262, 46, 6);
    g.lineStyle(1, 0xe3b04b, 0.35); g.strokeRoundedRect(4, 4, 262, 46, 6);
    g.fillStyle(0x081016, 0.9); g.fillRoundedRect(W - 118, 4, 114, 34, 6);
    g.lineStyle(1, 0xe3b04b, 0.35); g.strokeRoundedRect(W - 118, 4, 114, 34, 6);
    // Arriba, la pregunta que la historia tiene abierta ahora mismo.
    this.mystText = sf(this.add.text(10, 6, '', { fontFamily: 'Georgia, serif', fontSize: '8px', fontStyle: 'italic', color: COLORS.gold }));
    this.objText = sf(this.add.text(10, 17, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream }));
    // Equilibrio del puerto: del caos al orden.
    sf(this.add.text(10, 40, 'EQUILIBRIO', { fontFamily: 'monospace', fontSize: '7px', color: '#9fb8c0' }).setOrigin(0, 0.5));
    sf(this.add.rectangle(56, 40, 98, 6, 0x05080a, 0.9).setOrigin(0, 0.5).setStrokeStyle(1, 0xe3b04b, 0.4));
    this.orderBar = sf(this.add.rectangle(57, 40, 0, 4, 0xe3b04b).setOrigin(0, 0.5));
    this.orderText = sf(this.add.text(160, 40, '', { fontFamily: 'monospace', fontSize: '7px', color: '#ffe9a0' }).setOrigin(0, 0.5));
    this.orderShown = this.order;
    // Confianza del puerto (3 íconos) y expediente.
    this.trustIcons = TRUST.map((t, i) => {
      const im = sf(this.add.image(W - 108 + i * 15, 15, t.icon).setOrigin(0.5));
      im.setScale(t.icon === 'pr_lamp_on' ? 0.42 : t.icon === 'pr_scale' ? 0.6 : 1.1);
      return im;
    });
    sf(this.add.text(W - 112, 23, 'confianza', { fontFamily: 'monospace', fontSize: '7px', color: '#9fb8c0' }));
    this.fileText = sf(this.add.text(W - 58, 8, '', { fontFamily: 'monospace', fontSize: '8px', color: COLORS.cream, lineSpacing: 3 }));
    // Ayuda de controles (escritorio).
    if (!window.__domPad) {
      sf(this.add.text(6, GAME.HEIGHT - 11, 'Flechas/WASD moverse · E hablar · I expediente · B pista · Esc menú', { fontFamily: 'monospace', fontSize: '7px', color: '#9fb8c0' }).setAlpha(0.75));
    }
    this.toastY = 58;
    // Temporizador de la persecución (oculto).
    this.chaseText = sf(this.add.text(W / 2, 46, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe9a0', backgroundColor: '#081016cc', padding: { x: 6, y: 2 } }).setOrigin(0.5, 0).setVisible(false));
    this.refreshHud();
  }

  refreshHud() {
    const obj = objective(this.save);
    this.obj = obj;
    const om = openMystery(this.save);
    this.mystText.setText(om ? '❓ ' + om.q : 'CAPÍTULO 1 · PUERTO GARZA').setScale(1);
    if (this.mystText.width > 252) this.mystText.setScale(252 / this.mystText.width);
    this.checkDiscoveries();
    this.objText.setText('▸ ' + fmt(obj.text)).setScale(1);
    if (this.objText.width > 252) this.objText.setScale(252 / this.objText.width); // una sola línea, que no tape la barra
    TRUST.forEach((t, i) => {
      const on = hasFlag(this.save, t.flag);
      this.trustIcons[i].setAlpha(on ? 1 : 0.28).setTint(on ? 0xffffff : 0x808890);
    });
    const ev = evidenceCount(this.save);
    const cards = Object.keys(this.save.codex || {}).length;
    this.fileText.setText(`📁 ${ev.got}/${ev.total}\n📜 ${cards}`);
    this.drawOrderBar(this.orderShown != null ? this.orderShown : orderValue(this.save));
    this.refreshTeachMarks();
  }

  drawOrderBar(v) {
    const lv = orderLevel(v);
    this.orderBar.width = Math.round(v * 0.96);
    this.orderBar.setFillStyle(v >= 80 ? 0x8fd694 : v >= 60 ? 0xe3b04b : v >= 40 ? 0xe8a04b : 0xe8604b);
    this.orderText.setText(`${Math.round(v)}% · ${lv.name}`);
  }

  // ----------------------------------------------------------------- el orden que vuelve
  // Color y luz según el orden: gris y apagado en el caos, vivo en el equilibrio.
  applyOrderLook(v) {
    const k = v / 100;
    this.gloom.setAlpha(0.2 * (1 - k));
    if (this.colorFx) this.colorFx.saturate(-0.55 + 0.55 * k);
  }

  // Lo que se ve en el puerto según el orden (grafitis, basura, balanza, cometa...).
  buildOrderDecor() {
    this.decor = ORDER_DECOR.map((d) => {
      const objs = [];
      if (d.text) {
        const [x, y] = d.px;
        objs.push(this.add.text(x, y, d.text, { fontFamily: 'monospace', fontSize: '7px', fontStyle: 'bold', color: d.color, align: 'center', stroke: '#00000055', strokeThickness: 1 }).setOrigin(0.5).setAngle(d.angle || 0).setDepth(y + 20));
      } else {
        const bx = d.x * TILE + 8;
        const by = (d.y + 1) * TILE;
        const im = this.add.image(bx, by, d.tex).setOrigin(0.5, 1).setDepth(by).setFlipX(!!d.flip);
        objs.push(im);
        if (d.label) objs.push(this.add.text(bx, by + d.labelY, d.label, { fontFamily: 'monospace', fontSize: '6px', color: d.labelColor || '#efe3c2', align: 'center', backgroundColor: d.labelBg, padding: d.labelBg ? { x: 2, y: 1 } : undefined }).setOrigin(0.5).setDepth(by + 1));
        if (d.fly) this.tweens.add({ targets: im, y: by - 8, x: bx + 6, angle: 8, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        if (d.cheer) this.tweens.add({ targets: im, y: by - 3, duration: 260 + (d.x % 5) * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        if (d.dog) { im.home = { x: bx, y: by }; im.vx = 0.5; this.dog = im; }
      }
      return { d, objs, on: null };
    });
    this.refreshOrderDecor(false);
  }

  refreshOrderDecor(animated) {
    this.decor.forEach((e) => {
      const on = (!e.d.when || check(this.save, e.d.when)) && (!e.d.until || !check(this.save, e.d.until));
      if (on === e.on) return;
      e.on = on;
      e.objs.forEach((o) => {
        if (!animated) { o.setVisible(on).setAlpha(on ? 1 : 0); return; }
        o.setVisible(true);
        this.tweens.add({ targets: o, alpha: on ? 1 : 0, duration: 900, onComplete: () => o.setVisible(on) });
      });
    });
  }

  // La música también cuenta la historia: tensa bajo el Puño, alegre cuando la
  // gente vuelve a hablar, de fiesta cuando hay acta.
  themeFor(v) {
    if (hasFlag(this.save, 'caso_cerrado')) return 'victoria';
    return v < 40 ? 'puerto_tenso' : 'puerto';
  }

  // Sube el orden: aviso, barra, color y lo que cambia en el puerto.
  onOrderUp(before, after, flags) {
    const th = this.themeFor(after);
    if (th !== this.theme) { this.theme = th; playTheme(th); }
    const lvBefore = orderLevel(before);
    const lvAfter = orderLevel(after);
    const why = flags.map((f) => orderStep(f)).filter(Boolean).map((s) => s.why)[0];
    this.toast(`⚖ Equilibrio +${after - before}%${why ? ' · ' + why : ''}`, '#9be8a6');
    const o = { v: before };
    this.tweens.add({ targets: o, v: after, duration: 1400, ease: 'Cubic.out', onUpdate: () => { this.orderShown = o.v; this.drawOrderBar(o.v); this.applyOrderLook(o.v); } });
    this.order = after;
    this.refreshOrderDecor(true);
    Object.values(this.npcs).forEach((n) => this.refreshNpcVisibility(n, true));
    if (lvAfter.name !== lvBefore.name) this.time.delayedCall(700, () => this.queueBanner(() => { this.stageBanner(lvAfter); return 3300; }));
  }

  // ¿Se respondió una pregunta del caso? «¡Descubriste!» con la respuesta y la
  // pregunta siguiente: la historia invita a seguir.
  checkDiscoveries() {
    const all = mysteries(this.save);
    if (!this.save.mystSeen) {
      // Partidas anteriores: lo ya resuelto no se anuncia de golpe.
      this.save.mystSeen = {};
      all.filter((m) => m.solved).forEach((m) => { this.save.mystSeen[m.id] = true; });
      writeSave(this.save);
      return;
    }
    const fresh = all.filter((m) => m.solved && !this.save.mystSeen[m.id]);
    if (!fresh.length) return;
    fresh.forEach((m) => { this.save.mystSeen[m.id] = true; });
    writeSave(this.save);
    const next = all.find((m) => !m.solved);
    fresh.forEach((m, i) => this.queueBanner(() => this.discoveryBanner(m, i === fresh.length - 1 ? next : null)));
  }

  // Los avisos grandes salen de a uno, sin montarse.
  queueBanner(fn) {
    if (!this.bannerQ) this.bannerQ = [];
    this.bannerQ.push(fn);
    if (!this.bannerBusy) this.nextBanner();
  }

  nextBanner() {
    const fn = this.bannerQ && this.bannerQ.shift();
    if (!fn) { this.bannerBusy = false; return; }
    this.bannerBusy = true;
    const ms = fn();
    this.time.delayedCall(ms, () => this.nextBanner());
  }

  discoveryBanner(m, next) {
    const W = GAME.WIDTH;
    sfx('riddle');
    vibrate([20, 30, 20]);
    const c = this.add.container(W / 2, GAME.HEIGHT / 2 + 34).setScrollFactor(0).setDepth(10006);
    const t1 = this.add.text(0, 0, '✦ ¡DESCUBRISTE!', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#ffe9a0', fontStyle: 'bold' }).setOrigin(0.5, 0);
    const t2 = this.add.text(0, 0, m.q, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#c9b98a', fontStyle: 'italic', align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0);
    const t3 = this.add.text(0, 0, m.a, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, align: 'center', wordWrap: { width: 330 }, lineSpacing: 2 }).setOrigin(0.5, 0);
    const parts = [t1, t2, t3];
    if (next) parts.push(this.add.text(0, 0, (next.next ? 'Y río arriba: ' : 'Nueva pregunta: ') + next.q, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#9be8a6', fontStyle: 'italic', align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0));
    let y = 8;
    parts.forEach((p, i) => { p.setY(y); y += p.height + (i === 0 ? 2 : 5); });
    const h = y + 4;
    const bg = this.add.rectangle(0, h / 2, 356, h, 0x081016, 0.94).setStrokeStyle(2, 0xe3b04b, 0.9);
    c.add([bg, ...parts]);
    c.setY(GAME.HEIGHT - 16 - h); // abajo: el personaje sigue a la vista
    c.setScale(0.7).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 320, ease: 'Back.out' });
    const life = 4200 + m.a.length * 25;
    this.tweens.add({ targets: c, alpha: 0, delay: life, duration: 500, onComplete: () => c.destroy() });
    return life + 600;
  }

  stageBanner(lv) {
    const W = GAME.WIDTH;
    sfx('achievement');
    const c = this.add.container(W / 2, GAME.HEIGHT / 2 - 20).setScrollFactor(0).setDepth(10005);
    const t1 = this.add.text(0, -9, 'EL PUERTO CAMBIA · ' + lv.name.toUpperCase(), { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe9a0' }).setOrigin(0.5);
    const t2 = this.add.text(0, 10, lv.desc, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream, fontStyle: 'italic' }).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, Math.max(t1.width, t2.width) + 30, 44, 0x081016, 0.9).setStrokeStyle(2, 0xe3b04b, 0.9);
    c.add([bg, t1, t2]);
    c.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 350, ease: 'Back.out' });
    this.tweens.add({ targets: c, alpha: 0, delay: 2600, duration: 500, onComplete: () => c.destroy() });
  }

  // 📖 sobre quien está listo para aprender algo que ya sabes.
  refreshTeachMarks() {
    if (!this.npcs) return;
    if (!this.teachMarks) this.teachMarks = {};
    Object.values(this.npcs).forEach((n) => {
      const can = !n.hidden && (TALK[n.id] || []).some((t) => t.teach && checkAll(this.save, t.req));
      const m = this.teachMarks[n.id];
      if (can && !m) {
        const t = this.add.text(n.img.x, n.img.y - 34, '📖', { fontFamily: 'sans-serif', fontSize: '10px' }).setOrigin(0.5, 1).setDepth(99980);
        this.tweens.add({ targets: t, scale: 1.15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.teachMarks[n.id] = t;
      } else if (!can && m) { m.destroy(); delete this.teachMarks[n.id]; }
    });
  }

  toast(text, color = '#ffe9a0', icon = null) {
    const W = GAME.WIDTH;
    const y = this.toastY;
    this.toastY += 16;
    const c = this.add.container(W / 2, y).setScrollFactor(0).setDepth(10002);
    const t = this.add.text(icon ? 6 : 0, 0, text, { fontFamily: 'Georgia, serif', fontSize: '10px', color }).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, t.width + (icon ? 30 : 16), 15, 0x081016, 0.85).setStrokeStyle(1, 0xe3b04b, 0.6);
    c.add(bg);
    if (icon && this.textures.exists(icon)) c.add(this.add.image(-t.width / 2 - 4, 0, icon).setScale(0.8));
    c.add(t);
    c.setAlpha(0).setY(y - 6);
    this.tweens.add({ targets: c, alpha: 1, y, duration: 220 });
    this.tweens.add({ targets: c, alpha: 0, y: y - 6, delay: 2600, duration: 400, onComplete: () => { c.destroy(); this.toastY = Math.max(58, this.toastY - 16); } });
  }

  // Marcador del objetivo: "▼" sobre el objetivo, o flecha al borde si no se ve.
  buildMarker() {
    this.marker = this.add.text(0, 0, '▼', { fontFamily: 'monospace', fontSize: '10px', color: '#ffe070' }).setOrigin(0.5, 1).setDepth(99990);
    this.tweens.add({ targets: this.marker, alpha: 0.4, duration: 500, yoyo: true, repeat: -1 });
    // Flecha del borde: grande, con contorno, y con un letrero que la sigue y dice
    // a dónde ir y qué tan lejos queda.
    this.edgeArrow = this.add.container(0, 0).setScrollFactor(0).setDepth(10003).setVisible(false);
    const ag = this.add.graphics();
    ag.fillStyle(0x1a1218, 1); ag.fillTriangle(-3, -11, 17, 0, -3, 11);
    ag.fillStyle(0xffe070, 1); ag.fillTriangle(-1, -8, 13, 0, -1, 8);
    ag.fillStyle(0xfff6c0, 1); ag.fillTriangle(1, -4, 8, 0, 1, 0);
    this.edgeArrow.add(ag);
    this.tweens.add({ targets: this.edgeArrow, scale: 1.18, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.guideLabel = this.add.text(0, 0, '', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#081016', backgroundColor: '#ffe070', padding: { x: 4, y: 2 } }).setOrigin(0.5).setScrollFactor(0).setDepth(10003).setVisible(false);
    // Junto al objetivo visible, su nombre.
    this.targetLabel = this.add.text(0, 0, '', { fontFamily: 'Georgia, serif', fontSize: '8px', color: '#ffe9a0', backgroundColor: '#081016d0', padding: { x: 3, y: 1 } }).setOrigin(0.5, 1).setDepth(99990).setVisible(false);
    // Pasos guía: tres chevrones que salen del personaje hacia el objetivo.
    this.guideDots = [0, 1, 2].map((i) => this.add.triangle(0, 0, 0, -3, 6, 0, 0, 3, 0xffe070, 1).setDepth(99989).setVisible(false));
    this.hint = this.add.text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '8px', color: '#081016', backgroundColor: '#ffe070', padding: { x: 3, y: 1 } }).setOrigin(0.5, 1).setDepth(99991).setVisible(false);
  }

  targetPos(id) {
    const n = this.npcs[id];
    if (n && !n.hidden) return { x: n.img.x, y: n.img.y - 30 };
    const s = SPOTS.find((p) => p.id === id);
    if (s) return { x: s.x * TILE + 8, y: s.y * TILE - 4 };
    return null;
  }

  // Nombre corto del destino, para el letrero de la flecha.
  targetName(id) {
    const sp = SPEAKERS[id];
    if (sp && sp.name) return fmt(sp.name);
    return SPOT_NAMES[id] || 'tu objetivo';
  }

  updateMarker() {
    const t = this.obj && this.targetPos(this.obj.target);
    const hideAll = () => { this.marker.setVisible(false); this.edgeArrow.setVisible(false); this.guideLabel.setVisible(false); this.targetLabel.setVisible(false); this.guideDots.forEach((d) => d.setVisible(false)); };
    if (!t || this.busy) { hideAll(); return; }
    const view = this.cameras.main.worldView;
    const vx = t.x - view.x;
    const vy = t.y - view.y;
    const inside = vx > 8 && vx < GAME.WIDTH - 8 && vy > 58 && vy < GAME.HEIGHT - 8;
    const name = this.targetName(this.obj.target);
    const px = this.player.x;
    const py = this.player.y - 8;
    const dist = Math.round(Math.hypot(t.x - px, t.y + 30 - py) / TILE);
    this.marker.setVisible(inside).setPosition(t.x, t.y + Math.sin(this.time.now / 180) * 2);
    this.targetLabel.setVisible(inside && dist > 2).setText(name).setPosition(t.x, t.y - 11);
    // Chevrones desde el personaje hacia el objetivo, encendiéndose en ola.
    const ga = Math.atan2(t.y + 20 - py, t.x - px);
    const showDots = dist > 3;
    this.guideDots.forEach((d, i) => {
      const r = 16 + i * 9;
      const ph = ((this.time.now / 160) - i) % 3;
      d.setVisible(showDots).setPosition(px + Math.cos(ga) * r, py + Math.sin(ga) * r).setRotation(ga).setAlpha(ph < 1 ? 1 : 0.35);
    });
    if (inside) { this.edgeArrow.setVisible(false); this.guideLabel.setVisible(false); return; }
    // La flecha del borde no se mete en el HUD de arriba (objetivo + equilibrio).
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2 + 16;
    const a = Math.atan2(vy - cy, vx - cx);
    const rx = GAME.WIDTH / 2 - 18;
    const ry = GAME.HEIGHT / 2 - 48;
    const k = Math.min(Math.abs(rx / Math.cos(a)), Math.abs(ry / Math.sin(a)));
    const ax = cx + Math.cos(a) * k;
    const ay = cy + Math.sin(a) * k;
    this.edgeArrow.setVisible(true).setPosition(ax, ay).setRotation(a);
    // El letrero va un poco hacia adentro de la flecha, y nunca se sale de la pantalla.
    this.guideLabel.setVisible(true).setText(`${name} · ${dist} pasos`);
    const hw = this.guideLabel.width / 2 + 2;
    const lx = Phaser.Math.Clamp(ax - Math.cos(a) * 30, hw + 2, GAME.WIDTH - hw - 2);
    const ly = Phaser.Math.Clamp(ay - Math.sin(a) * 22, 62, GAME.HEIGHT - 12);
    this.guideLabel.setPosition(lx, ly);
  }

  // ----------------------------------------------------------------- entrada
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    const kb = this.input.keyboard;
    kb.on('keydown-E', () => this.interact());
    kb.on('keydown-X', () => this.interact());
    kb.on('keydown-SPACE', () => this.interact());
    kb.on('keydown-ENTER', () => this.interact());
    kb.on('keydown-I', () => this.openOverlay('CaseFile', { returnScene: 'Town' }));
    kb.on('keydown-ESC', () => this.openOverlay('Pause', { returnScene: 'Town' }));
    kb.on('keydown-B', () => this.lumenHint());
    kb.on('keydown-C', () => this.petTinto());
    kb.on('keydown-M', () => { const m = toggleMute(); this.toast(m ? '🔇 Silencio' : '🔊 Sonido', '#bfe0c8'); });
  }

  openOverlay(key, data) {
    if (this.busy || this.chase) return;
    this.busy = true;
    this.scene.launch(key, data);
    this.scene.pause();
  }

  lumenHint() {
    if (this.busy || this.chase) return;
    this.save.stats.hints = (this.save.stats.hints || 0) + 1;
    const lines = [{ s: 'lumen', t: 'Siguiente paso: ' + fmt(this.obj.text) + '. Sigue la flecha dorada.' }];
    const teach = TEACHINGS.find((t) => !hasFlag(this.save, t.flag) && (TALK[t.npc] || []).some((x) => x.teach && checkAll(this.save, x.req)));
    if (teach && !hasFlag(this.save, 'caso_cerrado')) lines.push({ s: 'lumen', t: `Y si quieres que el puerto recupere más orden, enséñale a la gente lo que aprendiste: busca el 📖 (${teach.label}).` });
    this.push({ type: 'talk', lines });
    this.runNext();
  }

  petTinto() {
    if (this.busy) return;
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.tinto.x, this.tinto.y);
    if (d > 40) return;
    sfx('note');
    this.float(this.tinto.x, this.tinto.y - 16, '♥ ¡ñic!', '#ffb3d0');
    this.tweens.add({ targets: this.tinto, scaleY: 0.85, duration: 120, yoyo: true });
  }

  float(x, y, text, color) {
    const t = this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '9px', color }).setOrigin(0.5).setDepth(99999);
    this.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  // ¿Qué hay cerca para interactuar?
  nearest() {
    const p = this.player;
    let best = null;
    const consider = (kind, id, x, y, r) => {
      const d = Phaser.Math.Distance.Between(p.x, p.y - 6, x, y);
      if (d < r && (!best || d < best.d)) best = { kind, id, x, y, d };
    };
    for (const n of Object.values(this.npcs)) if (!n.hidden) consider('npc', n.id, n.img.x, n.img.y - 6, 26);
    SPOTS.forEach((s) => consider('spot', s.id, s.x * TILE + 8, s.y * TILE + 8, s.r || 22));
    return best;
  }

  interact() {
    if (this.busy || this.chase) return;
    const n = this.nearest();
    if (!n) return;
    if (n.kind === 'npc') this.faceNpc(this.npcs[n.id]);
    this.startTalk(n.id);
  }

  faceNpc(npc) {
    if (npc && npc.img) npc.img.setFlipX(this.player.x < npc.img.x);
  }

  // Temas disponibles con alguien. Uno solo → se juega directo; varios → menú.
  topicsFor(id) {
    const list = TALK[id] || [];
    return list.filter((t) => checkAll(this.save, t.req) && (t.repeat || !(this.save.seen || {})[id + ':' + t.id]));
  }

  startTalk(id) {
    const topics = this.topicsFor(id);
    if (!topics.length) return;
    if (topics.length === 1) { this.playTopic(id, topics[0]); return; }
    this.busy = true;
    this.registry.set('interviewPick', null);
    this.pendingInterview = id;
    this.scene.launch('Interview', {
      npc: id,
      topics: topics.map((t) => ({ id: t.id, label: t.label, isNew: !(this.save.seen || {})[id + ':' + t.id] })),
    });
    this.scene.pause();
  }

  playTopic(id, topic) {
    if (!this.save.seen) this.save.seen = {};
    this.save.seen[id + ':' + topic.id] = true;
    if (topic.lines && topic.lines.length) this.push({ type: 'talk', lines: topic.lines });
    if (topic.give) this.push({ type: 'give', list: topic.give });
    if (topic.act) this.push({ type: 'act', name: topic.act });
    this.runNext();
  }

  // ----------------------------------------------------------------- cola de pasos
  push(step) { this.steps.push(step); }

  runNext() {
    if (this.busy) return;
    const step = this.steps.shift();
    if (!step) {
      this.afterSteps();
      return;
    }
    if (step.type === 'talk') {
      this.busy = true;
      this.scene.launch('Dialogue', { convo: step.lines, returnScene: 'Town' });
      this.scene.pause();
    } else if (step.type === 'give') {
      const before = orderValue(this.save);
      const got = give(this.save, step.list);
      got.items.forEach((id) => { const it = ITEMS[id]; this.toast((it.kind === 'testimonio' ? 'Nuevo testimonio: ' : it.kind === 'objeto' ? 'Objeto: ' : 'Nueva prueba: ') + it.name, '#ffe9a0', it.icon); sfx('treasure'); });
      got.flags.forEach((f) => this.onFlag(f));
      const after = orderValue(this.save);
      if (after > before) this.onOrderUp(before, after, got.flags);
      this.refreshHud();
      this.runNext();
    } else if (step.type === 'card') {
      this.busy = true;
      this.scene.launch('Card', { id: step.id, returnScene: 'Town' });
      this.scene.pause();
    } else if (step.type === 'mg') {
      this.busy = true;
      this.registry.set('mgResult', null);
      this.scene.launch('Minigame', { id: step.id, returnScene: 'Town', lesson: step.lesson });
      this.scene.pause();
    } else if (step.type === 'act') {
      this.doAct(step.name);
    } else if (step.type === 'fn') {
      step.fn();
      this.runNext();
    }
  }

  // Al volver de cualquier escena superpuesta.
  onOverlayClosed() {
    this.busy = false;
    window.__padVec = { x: 0, y: 0 };
    // ¿Se eligió un tema en la entrevista?
    if (this.pendingInterview) {
      const id = this.pendingInterview;
      this.pendingInterview = null;
      const pick = this.registry.get('interviewPick');
      this.registry.set('interviewPick', null);
      const topic = pick && (TALK[id] || []).find((t) => t.id === pick);
      if (topic) { this.playTopic(id, topic); return; }
    }
    // ¿Terminó un minijuego?
    const res = this.registry.get('mgResult');
    if (res) {
      this.registry.set('mgResult', null);
      this.onMinigame(res);
    }
    this.refreshHud();
    this.runNext();
  }

  // Cuando la cola se vacía: cartas nuevas pendientes, avisos, guardado.
  afterSteps() {
    if (this.save.newCards && this.save.newCards.length) {
      const id = this.save.newCards.shift();
      writeSave(this.save);
      this.push({ type: 'card', id });
      this.runNext();
      return;
    }
    if (hearingReady(this.save) && !hasFlag(this.save, 'listo_avisado')) {
      this.push({ type: 'give', list: ['f:listo_avisado'] });
      this.push({ type: 'talk', lines: EVENTS.listo });
      this.runNext();
      return;
    }
    this.refreshHud();
    writeSave(this.save);
  }

  doAct(name) {
    if (name.startsWith('mg:')) { this.push({ type: 'mg', id: name.slice(3) }); this.runNext(); return; }
    if (name.startsWith('teach:')) { this.push({ type: 'mg', id: 'ensenar', lesson: name.slice(6) }); this.runNext(); return; }
    if (name === 'next_chapter') { this.goNextChapter(); return; }
    if (name === 'chase') { this.startChase(); return; }
    if (name === 'hearing') { this.goHearing(); return; }
    if (name === 'missing') {
      const miss = missingForHearing(this.save);
      const lines = [];
      for (let i = 0; i < miss.length; i += 3) lines.push({ s: 'lumen', t: (i === 0 ? 'Nos falta: ' : 'Y también: ') + miss.slice(i, i + 3).join(' · ') + '.' });
      lines.push({ s: 'lumen', t: 'Revisa el Expediente (I) para ver todo lo que llevamos.' });
      this.push({ type: 'talk', lines });
      this.runNext();
      return;
    }
    if (name === 'trust') {
      const n = trustCount(this.save);
      const lines = [{ s: 'lumen', t: `Confianza del puerto: ${n} de 3. El Mono quiere que al menos dos sectores respondan por ti.` }];
      TRUST.forEach((t) => lines.push({ s: 'lumen', t: (hasFlag(this.save, t.flag) ? '✓ ' : '○ ') + t.label + ' — ' + t.where }));
      this.push({ type: 'talk', lines });
      this.runNext();
      return;
    }
    if (name === 'open_reten') { this.openReten(); this.runNext(); return; }
    this.runNext();
  }

  // Efectos visibles de los hitos.
  onFlag(f) {
    if (f === 'alumbrado_done') {
      this.lightLamps(true);
      if (this.npcs.nando) this.time.delayedCall(1600, () => { this.refreshNpcVisibility(this.npcs.nando); this.npcs.nando.img.setAlpha(0); this.tweens.add({ targets: this.npcs.nando.img, alpha: 1, duration: 600 }); });
    }
    if (f === 'gallina_done' && this.npcs.lucho) this.npcs.lucho.img.setTexture('npc_lucho_sin');
    if (['gallina_done', 'alumbrado_done', 'peso_done'].includes(f)) {
      this.toast('★ Confianza del puerto: ' + trustCount(this.save) + '/3', '#9be8a6');
      sfx('seal');
    }
  }

  onMinigame(res) {
    if (res.win) {
      const w = WINS[res.id === 'ensenar' ? 'teach_' + res.lesson : res.id];
      if (res.id === 'raspar' && this.propImgs.lancha) this.propImgs.lancha.setTexture('pr_lancha_raspada');
      if (res.id === 'quiz' && hasFlag(this.save, 'quiz_done')) {
        this.push({ type: 'talk', lines: [{ s: 'ulpiana', t: `¡${res.score} de 10! Vuelve cuando quieras a mejorar tu marca.` }] });
        return;
      }
      if (w) {
        this.push({ type: 'talk', lines: w.lines });
        this.push({ type: 'give', list: w.give });
      }
      if (res.id === 'quiz') this.push({ type: 'give', list: ['f:quiz_done'] });
    } else if (res.id === 'escucha') {
      this.push({ type: 'talk', lines: [{ s: 'lumen', t: 'La tensión subió demasiado. Habla con Don Lucho para intentarlo otra vez: escucha antes de responder.' }] });
    }
  }

  openReten() {
    const im = this.propImgs.reten;
    if (im) this.tweens.add({ targets: im, x: im.x + 36, y: im.y - 20, duration: 900, ease: 'Cubic.out' });
    sfx('gate');
    this.clearSolid(this.propSolids.reten || []);
    this.push({ type: 'talk', lines: EVENTS.reten_abierto });
  }

  goNextChapter() {
    this.save.px = this.player.x;
    this.save.py = this.player.y;
    writeSave(this.save);
    this.busy = true;
    this.fadeOutAll();
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Cinematic', { key: 'siguiente', next: { scene: 'Menu' } }));
  }

  // Funde a negro el mundo y el HUD a la vez.
  fadeOutAll() {
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.uiCam.fadeOut(700, 0, 0, 0);
  }

  // Cada objeto se dibuja en una sola cámara: lo fijo a la pantalla, en la del
  // HUD; lo demás, en la que sigue al personaje.
  splitCameras() {
    const main = this.cameras.main.id;
    const ui = this.uiCam.id;
    this.children.list.forEach((o) => { o.cameraFilter = o.scrollFactorX === 0 ? main : ui; });
  }

  goHearing() {
    this.save.stage = 'audiencia';
    this.save.px = this.player.x;
    this.save.py = this.player.y;
    writeSave(this.save);
    this.busy = true;
    this.fadeOutAll();
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Hearing'));
  }

  // ----------------------------------------------------------------- la gallina fugitiva
  startChase() {
    const lucho = this.npcs.lucho;
    const hen = this.add.image(lucho.img.x + 14, lucho.img.y, 'an_hen0').setOrigin(0.5, 1).setScale(1.25);
    hen.vx = 1; hen.vy = 0;
    this.chase = { hen, until: this.time.now + 40000, turnAt: 0 };
    this.chaseText.setVisible(true);
    this.push({ type: 'talk', lines: EVENTS.chase_start });
    sfx('confirm');
    this.runNext();
  }

  updateChase() {
    const c = this.chase;
    const hen = c.hen;
    const now = this.time.now;
    const left = Math.max(0, Math.ceil((c.until - now) / 1000));
    this.chaseText.setText('🐔 ¡Atrapa a la Copetona! ' + left + ' s');
    if (this.busy) return;
    const dx = hen.x - this.player.x;
    const dy = hen.y - this.player.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 13) { this.endChase(true); return; }
    if (now > c.until) { this.endChase(false); return; }
    // Huye del jugador cuando lo tiene cerca; si no, picotea y da vueltas.
    let sp = 0.6;
    if (d < 90) { c.dir = { x: dx / d, y: dy / d }; sp = d < 45 ? 1.45 : 1.15; }
    else if (now > c.turnAt) { c.turnAt = now + 700; const a = Math.random() * Math.PI * 2; c.dir = { x: Math.cos(a), y: Math.sin(a) }; }
    const dir = c.dir || { x: 1, y: 0 };
    const zone = { x0: 2, x1: 20, y0: 19, y1: 31 };
    let nx = hen.x + dir.x * sp;
    let ny = hen.y + dir.y * sp;
    const ok = (x, y) => this.walkable(Math.floor(x / TILE), Math.floor((y - 2) / TILE)) && x > zone.x0 * TILE && x < zone.x1 * TILE && y > zone.y0 * TILE && y < (zone.y1 + 1) * TILE;
    if (!ok(nx, ny)) {
      // Rebota: prueba solo un eje, luego otra dirección.
      if (ok(nx, hen.y)) ny = hen.y; else if (ok(hen.x, ny)) nx = hen.x; else { nx = hen.x; ny = hen.y; const a = Math.random() * Math.PI * 2; c.dir = { x: Math.cos(a), y: Math.sin(a) }; }
    }
    hen.setPosition(nx, ny).setDepth(ny).setFlipX(dir.x < 0);
    hen.setTexture('an_hen' + (Math.floor(now / 140) % 2));
    if (Math.random() < 0.01) this.float(hen.x, hen.y - 12, '¡cocoró!', '#ffffff');
  }

  endChase(win) {
    const hen = this.chase.hen;
    this.chase = null;
    this.chaseText.setVisible(false);
    if (win) {
      sfx('treasure');
      vibrate(40);
      this.cameras.main.flash(120, 255, 240, 200);
      this.tweens.add({ targets: hen, x: this.npcs.rosa.img.x + 10, y: this.npcs.rosa.img.y, duration: 900, onComplete: () => hen.destroy() });
      this.push({ type: 'give', list: ['f:gallina_caught'] });
      this.push({ type: 'talk', lines: EVENTS.chase_win });
      this.push({ type: 'mg', id: 'escucha' });
    } else {
      sfx('damage');
      this.tweens.add({ targets: hen, alpha: 0, duration: 500, onComplete: () => hen.destroy() });
      this.push({ type: 'talk', lines: EVENTS.chase_fail });
    }
    this.runNext();
  }

  // ----------------------------------------------------------------- bucle
  update(time) {
    if (!this.player || !this.player.body) return;
    // El perro suelto del barrio va y viene; los 📖 siguen a quien los lleva.
    if (this.dog && this.dog.visible && !this.busy) {
      const d = this.dog;
      d.x += d.vx;
      if (Math.abs(d.x - d.home.x) > 40) d.vx = -d.vx;
      d.setFlipX(d.vx < 0).setTexture('an_dog' + (Math.floor(time / 180) % 2));
    }
    if (this.teachMarks) for (const [id, m] of Object.entries(this.teachMarks)) { const n = this.npcs[id]; if (n) m.setPosition(n.img.x, n.img.y - 34); }
    if (this.chase) this.updateChase();
    if (this.busy) {
      this.player.setVelocity(0, 0);
      this.updateMarker();
      return;
    }
    this.movePlayer();
    this.followers();
    this.updateNpcs(time);
    this.updateCritters(time);
    this.checkPickups();
    this.checkZones();
    this.updateHint();
    this.updateMarker();
    if (time - this.lastSaveAt > 4000) {
      this.lastSaveAt = time;
      this.save.px = Math.round(this.player.x);
      this.save.py = Math.round(this.player.y);
      writeSave(this.save);
    }
  }

  movePlayer() {
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1;
    const pv = window.__padVec;
    if (vx === 0 && vy === 0 && pv && (pv.x || pv.y)) { vx = pv.x; vy = pv.y; }
    const moving = vx !== 0 || vy !== 0;
    const p = this.player;
    if (moving) {
      const len = Math.hypot(vx, vy) || 1;
      p.setVelocity((vx / len) * this.speed, (vy / len) * this.speed);
      if (Math.abs(vy) >= Math.abs(vx)) { this.facing = vy < 0 ? 'up' : 'down'; p.setFlipX(false); } else { this.facing = vx < 0 ? 'left' : 'right'; p.setFlipX(vx < 0); }
      this.bob += 0.3;
      const base = this.facing === 'up' ? 'player_back' : 'player';
      const key = base + (Math.floor(this.bob / Math.PI) % 2 === 0 ? '_walkA' : '_walkB');
      if (p.texture.key !== key) p.setTexture(key);
      if (this.time.now > (this.dustAt || 0)) {
        this.dustAt = this.time.now + 260;
        const d = this.add.image(p.x + Phaser.Math.Between(-2, 2), p.y - 1, 'p_soft').setTint(0xcdbf94).setAlpha(0.45).setDepth(p.y - 1);
        this.tweens.add({ targets: d, y: d.y - 3, alpha: 0, scale: 1.6, duration: 360, onComplete: () => d.destroy() });
      }
    } else {
      p.setVelocity(0, 0);
      const base = this.facing === 'up' ? 'player_back' : 'player';
      if (p.texture.key !== base) p.setTexture(base);
    }
    p.setDepth(p.y);
    this.playerShadow.setPosition(p.x, p.y - 1).setDepth(p.y - 1);
    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 2) {
      this.trail.push({ x: p.x, y: p.y });
      if (this.trail.length > 60) this.trail.shift();
    }
  }

  trailPoint(gap) {
    let dist = 0;
    for (let i = this.trail.length - 1; i > 0; i--) {
      const a = this.trail[i];
      const b = this.trail[i - 1];
      const seg = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist + seg >= gap) { const t = (gap - dist) / seg; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
      dist += seg;
    }
    return this.trail[0];
  }

  // Tinto sigue el rastro; Lumen flota sobre el hombro.
  followers() {
    const p = this.player;
    const t = this.trailPoint(18);
    const px = this.tinto.x;
    this.tinto.x = Phaser.Math.Linear(this.tinto.x, t.x, 0.35);
    this.tinto.y = Phaser.Math.Linear(this.tinto.y, t.y, 0.35);
    const moved = Math.abs(this.tinto.x - px) > 0.15;
    if (moved) this.tinto.setFlipX(this.tinto.x < px);
    this.tinto.setTexture(moved && Math.floor(this.time.now / 160) % 2 ? 'tinto_walk' : 'tinto').setDepth(this.tinto.y);
    this.tintoShadow.setPosition(this.tinto.x, this.tinto.y - 1).setDepth(this.tinto.y - 1);
    const side = p.flipX ? 12 : -12;
    const lx = p.x + side;
    const ly = p.y - 30 + Math.sin(this.time.now / 300) * 2;
    this.lumen.x = Phaser.Math.Linear(this.lumen.x, lx, 0.12);
    this.lumen.y = Phaser.Math.Linear(this.lumen.y, ly, 0.12);
    this.lumen.setDepth(p.y + 2);
    this.lumenGlow.setPosition(this.lumen.x, this.lumen.y - 8).setDepth(p.y + 1);
  }

  updateNpcs(time) {
    for (const n of Object.values(this.npcs)) {
      if (n.hidden || !n.wander) continue;
      if (time > n.nextMove && !n.moving) {
        n.nextMove = time + Phaser.Math.Between(2500, 5000);
        const tx = n.home.x + Phaser.Math.Between(-n.wander, n.wander) * TILE;
        const ty = n.home.y + Phaser.Math.Between(-n.wander, n.wander) * 8;
        if (!this.walkable(Math.floor(tx / TILE), Math.floor((ty - 2) / TILE))) continue;
        if (Phaser.Math.Distance.Between(tx, ty, this.player.x, this.player.y) < 20) continue;
        // Sin atravesar puestos ni barriles en el camino, y sin pararse encima de otra persona.
        if (!this.clearPath(n.img.x, n.img.y, tx, ty)) continue;
        const crowded = Object.values(this.npcs).some((o) => o !== n && !o.hidden
          && Phaser.Math.Distance.Between(tx, ty, (o.goal || o.img).x, (o.goal || o.img).y) < 16);
        if (crowded) continue;
        n.goal = { x: tx, y: ty };
        n.moving = true;
        n.img.setFlipX(tx < n.img.x);
        const dur = Math.max(400, Phaser.Math.Distance.Between(n.img.x, n.img.y, tx, ty) * 30);
        this.tweens.add({
          targets: [n.img], x: tx, y: ty, duration: dur,
          onUpdate: () => {
            n.img.setTexture(n.tex + (Math.floor(this.time.now / 150) % 2 ? '_walkA' : '_walkB')).setDepth(n.img.y);
            n.shadow.setPosition(n.img.x, n.img.y).setDepth(n.img.y - 1);
            n.body.setPosition(n.img.x, n.img.y - 3);
            n.body.body.updateFromGameObject();
          },
          onComplete: () => { n.moving = false; n.goal = null; n.img.setTexture(n.tex); },
        });
      }
    }
  }

  // ¿Se puede ir en línea recta de (x0,y0) a (x1,y1) sin pisar baldosas sólidas?
  clearPath(x0, y0, x1, y1) {
    const steps = Math.max(1, Math.ceil(Phaser.Math.Distance.Between(x0, y0, x1, y1) / 4));
    for (let k = 1; k <= steps; k++) {
      const x = x0 + ((x1 - x0) * k) / steps;
      const y = y0 + ((y1 - y0) * k) / steps;
      if (!this.walkable(Math.floor(x / TILE), Math.floor((y - 2) / TILE))) return false;
    }
    return true;
  }

  updateCritters(time) {
    const z = HEN_ZONE;
    this.hens.forEach((h, i) => {
      if (!h.target || Math.random() < 0.004) {
        h.target = { x: Phaser.Math.Between(z.x0, z.x1) * TILE + 8, y: Phaser.Math.Between(z.y0, z.y1) * TILE + 12 };
      }
      const dx = h.target.x - h.x;
      const dy = h.target.y - h.y;
      const d = Math.hypot(dx, dy);
      const flee = Phaser.Math.Distance.Between(h.x, h.y, this.player.x, this.player.y) < 26;
      if (d > 2 || flee) {
        let sx = (dx / (d || 1)) * 0.35;
        let sy = (dy / (d || 1)) * 0.35;
        if (flee) { const fx = h.x - this.player.x; const fy = h.y - this.player.y; const fd = Math.hypot(fx, fy) || 1; sx = (fx / fd) * 1.2; sy = (fy / fd) * 1.2; }
        const nx = h.x + sx;
        const ny = h.y + sy;
        if (this.walkable(Math.floor(nx / TILE), Math.floor((ny - 2) / TILE))) { h.setPosition(nx, ny); h.setFlipX(sx < 0); } else h.target = null;
        h.setTexture(h.base + (Math.floor((time + i * 90) / 160) % 2));
      } else if (Math.random() < 0.02) h.setTexture(h.base + 1);
      h.setDepth(h.y);
    });
    this.herons.forEach((hr) => {
      const near = Phaser.Math.Distance.Between(hr.x, hr.y, this.player.x, this.player.y) < 40;
      if (near && !hr.away) {
        hr.away = true;
        this.tweens.add({ targets: hr, y: hr.y - 60, x: hr.x + 40, alpha: 0, duration: 1200, ease: 'Sine.in' });
        this.time.delayedCall(9000, () => { hr.setPosition(hr.home.x, hr.home.y).setAlpha(0); this.tweens.add({ targets: hr, alpha: 1, duration: 800, onComplete: () => { hr.away = false; } }); });
      }
    });
  }

  checkPickups() {
    const p = this.player;
    for (const pg of this.pages) {
      if (!pg.active) continue;
      if (Phaser.Math.Distance.Between(p.x, p.y, pg.x, pg.y) < 14) {
        pg.glow.destroy();
        this.tweens.add({ targets: pg, y: pg.y - 18, alpha: 0, scale: 1.6, duration: 400, onComplete: () => pg.destroy() });
        pg.active = false;
        sfx('page');
        this.toast('📜 ¡Página perdida del Códice!', '#ffe9a0');
        this.push({ type: 'give', list: ['c:' + pg.pageId] });
        this.runNext();
        return;
      }
    }
  }

  checkZones() {
    const tx = this.player.x / TILE;
    const ty = this.player.y / TILE;
    for (const z of ZONES) {
      if (hasFlag(this.save, z.flag) || !hasFlag(this.save, z.requires)) continue;
      if (tx >= z.x0 && tx <= z.x1 + 1 && ty >= z.y0 && ty <= z.y1 + 1) {
        this.push({ type: 'talk', lines: EVENTS[z.id] });
        this.push({ type: 'give', list: ['f:' + z.flag] });
        this.runNext();
        return;
      }
    }
  }

  updateHint() {
    const n = this.nearest();
    if (!n) { this.hint.setVisible(false); return; }
    const has = this.topicsFor(n.id).length > 0;
    if (!has) { this.hint.setVisible(false); return; }
    const isNew = this.topicsFor(n.id).some((t) => !t.repeat && !(this.save.seen || {})[n.id + ':' + t.id]);
    const y = n.kind === 'npc' ? this.npcs[n.id].img.y - 30 : n.y - 16;
    this.hint.setVisible(true).setText(window.__domPad ? (isNew ? '💬!' : '💬') : (isNew ? 'E !' : 'E')).setPosition(n.x, y);
  }
}
