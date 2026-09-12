// Mundo jugable de AEQUITAS: El Retorno del Equilibrio.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias, Colombia).
// Comitiva de exploradores de la Biblioteca Experimental.

import Phaser from 'phaser';
import { COLORS, EXPLORERS, CAPITULOS } from '../config.js';
import { CONVERSATIONS } from '../data/dialogues.js';
import { RIDDLES } from '../data/bookRiddles.js';
import { WISDOM } from '../data/wisdom.js';
import { getReino } from '../data/reinos.js';
import { getBiome } from '../data/biomes.js';
import { writeSave } from '../systems/save.js';

const TILE = 16;
const COLS = 50;
const ROWS = 34;
const SPEED = 84;

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.save = data && data.save ? data.save : null;
  }

  create() {
    this.mapW = COLS * TILE;
    this.mapH = ROWS * TILE;

    const nivel = this.save ? this.save.level || 0 : 0;
    this.reino = getReino(nivel);
    this.biome = getBiome(nivel);
    this.rng = new Phaser.Math.RandomDataGenerator(['aequitas-' + nivel]);

    this.solids = this.physics.add.staticGroup();
    this.buildGround();
    this.applyReinoTint();
    this.buildWater();
    this.buildBorder();
    this.buildScenery();
    this.buildAmbient();

    this.createPlayer();
    this.createFellowExplorers();
    this.createNpc();
    this.createCombat();
    this.createSavePoint();
    this.createRiddlePedestal();
    this.createPortal();
    this.createTreasures();

    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor(COLORS.bgDeep);

    this.setupInput();
    this.buildHud();

    this.talking = false;
    this.events.on('resume', () => {
      this.talking = false;
    });

    if (this.save && this.save.level === 0 && !this.save.introSeen) {
      this.save.introSeen = true;
      this.time.delayedCall(400, () => this.startDialogue(CONVERSATIONS.intro));
    }
  }

  isCenterClear(tx, ty) {
    const cx = COLS / 2;
    const cy = ROWS / 2;
    return Math.abs(tx - cx) <= 10 && Math.abs(ty - cy) <= 6;
  }

  buildGround() {
    const gk = 'g_' + this.biome.key;
    const ak = gk + '_a';
    const ac = this.biome.ground.accentChance;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const key = this.rng.frac() < ac ? ak : gk;
        this.add.image(x * TILE, y * TILE, key).setOrigin(0).setDepth(0);
      }
    }
    if (this.biome.ground.path) {
      const pk = 'p_' + this.biome.key;
      const py = Math.floor(ROWS / 2);
      for (let x = 2; x < COLS - 2; x++) {
        const wobble = Math.round(Math.sin(x * 0.4) * 1.5);
        this.add.image(x * TILE, (py + wobble) * TILE, pk).setOrigin(0).setDepth(0);
      }
      for (let y = 2; y < ROWS - 2; y++) {
        this.add.image(Math.floor(COLS / 2) * TILE, y * TILE, pk).setOrigin(0).setDepth(0);
      }
    }
  }

  addSolid(tex, px, py) {
    const s = this.solids.create(px, py, tex);
    s.setOrigin(0.5, 1);
    s.refreshBody();
    s.setDepth(py);
    const bw = Math.min(10, s.width - 2);
    s.body.setSize(bw, 6, false);
    s.body.setOffset((s.width - bw) / 2, s.height - 6);
    return s;
  }

  buildBorder() {
    const tex = this.biome.border;
    if (!tex) return;
    for (let x = 0; x < COLS; x += 2) {
      this.addSolid(tex, x * TILE + TILE / 2, 1 * TILE + TILE);
      this.addSolid(tex, x * TILE + TILE / 2, (ROWS - 1) * TILE + TILE);
    }
    for (let y = 1; y < ROWS; y += 2) {
      this.addSolid(tex, 0 * TILE + TILE / 2, y * TILE + TILE);
      this.addSolid(tex, (COLS - 1) * TILE + TILE / 2, y * TILE + TILE);
    }
  }

  buildWater() {
    const w = this.biome.water;
    if (!w) return;
    if (w.style === 'cienaga') {
      for (let i = 0; i < 6; i++) {
        const bx = this.rng.between(4, COLS - 8);
        const by = this.rng.between(4, ROWS - 6);
        if (this.isCenterClear(bx, by)) continue;
        for (let y = by; y < by + this.rng.between(2, 3); y++) {
          for (let x = bx; x < bx + this.rng.between(3, 5); x++) {
            const t = this.solids.create(x * TILE, y * TILE, w.tex);
            t.setOrigin(0).setDepth(1);
            t.refreshBody();
          }
        }
      }
    } else {
      for (let y = 5; y <= 8; y++) {
        for (let x = 5; x <= 9; x++) {
          const t = this.solids.create(x * TILE, y * TILE, w.tex);
          t.setOrigin(0).setDepth(1);
          t.refreshBody();
        }
      }
    }
  }

  buildScenery() {
    const place = (tex, collide) => {
      for (let intento = 0; intento < 12; intento++) {
        const tx = this.rng.between(2, COLS - 3);
        const ty = this.rng.between(3, ROWS - 3);
        if (this.isCenterClear(tx, ty)) continue;
        const px = tx * TILE + TILE / 2;
        const py = ty * TILE + TILE;
        if (collide) this.addSolid(tex, px, py);
        else this.add.image(px, py, tex).setOrigin(0.5, 1).setDepth(py);
        return;
      }
    };
    for (const d of this.biome.decor) {
      for (let i = 0; i < d.count; i++) place(d.tex, d.collide);
    }
  }

  buildAmbient() {
    const a = this.biome.ambient;
    if (!a) return;
    this.ambient = this.add.particles(0, 0, 'p_soft', {
      x: { min: 0, max: this.mapW },
      y: { min: 0, max: this.mapH },
      lifespan: 5000,
      speedX: { min: -a.drift, max: a.drift },
      speedY: { min: a.rise - 4, max: a.rise + 4 },
      scale: { start: a.size, end: 0 },
      alpha: { start: 0.85, end: 0 },
      tint: a.color,
      frequency: Math.max(40, 1600 / a.count),
      quantity: 1,
      blendMode: 'ADD',
    });
    this.ambient.setDepth(50000);
  }

  createTreasures() {
    this.treasures = [];
    if (!this.save) return;
    if (!this.save.treasuresByReino) this.save.treasuresByReino = {};
    const nivel = this.reino.nivel;
    const collected = this.save.treasuresByReino[nivel] || [];
    const total = 4;
    for (let i = 0; i < total; i++) {
      if (collected.includes(i)) continue;
      let tx, ty;
      for (let intento = 0; intento < 20; intento++) {
        tx = this.rng.between(3, COLS - 4);
        ty = this.rng.between(3, ROWS - 4);
        if (!this.isCenterClear(tx, ty)) break;
      }
      const orb = this.add.image(tx * TILE + 8, ty * TILE + 8, 'd_orb').setDepth(60000);
      orb.setTint(0xffd875);
      orb.idx = i;
      this.tweens.add({ targets: orb, scale: 1.3, alpha: 0.7, duration: 700, yoyo: true, repeat: -1 });
      this.treasures.push(orb);
    }
    this.treasureTotal = total;
  }

  collectTreasure(orb) {
    const nivel = this.reino.nivel;
    if (!this.save.treasuresByReino[nivel]) this.save.treasuresByReino[nivel] = [];
    if (!this.save.treasuresByReino[nivel].includes(orb.idx)) {
      this.save.treasuresByReino[nivel].push(orb.idx);
    }
    this.hp = Math.min(this.maxHp, this.hp + 15);
    this.showFloat(orb.x, orb.y - 8, '✦ Códice de Bellium +15', '#ffd875');
    this.cameras.main.flash(120, 227, 148, 11);
    orb.destroy();
    this.treasures = this.treasures.filter((o) => o !== orb);
    writeSave(this.save);
  }

  // ----------------------------------------------------------- PROTAGONISTA & CO-EXPLORADORES
  createPlayer() {
    const startX = this.save && this.save.px != null ? this.save.px : (COLS / 2) * TILE;
    const startY = this.save && this.save.py != null ? this.save.py : (ROWS / 2) * TILE;
    
    this.explorerKey = (this.save && this.save.explorer) ? this.save.explorer : 'aurelio';
    this.player = this.physics.add.image(startX, startY, this.explorerKey);
    this.player.setOrigin(0.5, 1);
    this.player.body.setSize(10, 8);
    this.player.body.setOffset(4, 20);
    this.facing = 'down';
    this.bob = 0;
  }

  // Co-exploradores de la Biblioteca que acompañan al protagonista
  createFellowExplorers() {
    this.trail = [{ x: this.player.x, y: this.player.y }];
    
    let comp1Key = 'valeria';
    let comp2Key = 'kaelen';
    let convo1 = CONVERSATIONS.counsel_valeria;
    let convo2 = CONVERSATIONS.counsel_kaelen;

    if (this.explorerKey === 'valeria') {
      comp1Key = 'aurelio';
      comp2Key = 'sora';
      convo1 = CONVERSATIONS.counsel_aurelio;
      convo2 = CONVERSATIONS.counsel_sora;
    } else if (this.explorerKey === 'kaelen') {
      comp1Key = 'aurelio';
      comp2Key = 'valeria';
      convo1 = CONVERSATIONS.counsel_aurelio;
      convo2 = CONVERSATIONS.counsel_valeria;
    } else if (this.explorerKey === 'sora') {
      comp1Key = 'valeria';
      comp2Key = 'kaelen';
      convo1 = CONVERSATIONS.counsel_valeria;
      convo2 = CONVERSATIONS.counsel_kaelen;
    }

    this.companion1 = this.add.image(this.player.x - 18, this.player.y, comp1Key).setOrigin(0.5, 1);
    this.companion1.convo = convo1;
    this.companion1Gap = 18;

    this.companion2 = this.add.image(this.player.x - 34, this.player.y, comp2Key).setOrigin(0.5, 1);
    this.companion2.convo = convo2;
    this.companion2Gap = 34;
  }

  trailPointBehind(gap) {
    let dist = 0;
    for (let i = this.trail.length - 1; i > 0; i--) {
      const a = this.trail[i];
      const b = this.trail[i - 1];
      const seg = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist + seg >= gap) {
        const t = (gap - dist) / seg;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      dist += seg;
    }
    return this.trail[0];
  }

  createNpc() {
    const nx = (COLS / 2 + 5) * TILE;
    const ny = (ROWS / 2) * TILE;
    
    let npcSprite = 'npc_guia';
    let npcConvo = CONVERSATIONS.intro;
    if (this.reino.nivel === 1) {
      npcSprite = 'dona_ines';
      npcConvo = CONVERSATIONS.torre_ceniza_dona_ines;
    } else if (this.reino.nivel === 2) {
      npcSprite = 'mateo';
      npcConvo = CONVERSATIONS.intro;
    }

    this.npc = this.add.image(nx, ny, npcSprite).setOrigin(0.5, 1);
    this.npc.setDepth(this.npc.y);
    this.npc.convo = npcConvo;
    
    this.npcHint = this.add
      .text(nx, ny - 30, '!', { fontFamily: 'monospace', fontSize: '12px', color: COLORS.gold })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  // ----------------------------------------------------------- DIALÉCTICA JURÍDICA
  createCombat() {
    this.hp = this.save && this.save.dignidad != null ? this.save.dignidad : 100;
    this.maxHp = 100;

    this.nextAttack = 0;
    this.knockUntil = 0;
    this.invulnUntil = 0;

    this.valorUntil = 0;
    this.valorReadyAt = 0;
    this.revealUntil = 0;
    this.revealReadyAt = 0;

    const ex = (COLS / 2 - 7) * TILE;
    const ey = (ROWS / 2 - 3) * TILE;
    
    let antagSprite = 'sombra';
    if (this.reino.nivel === 1) antagSprite = 'murociego';
    else if (this.reino.nivel === 2) antagSprite = 'silas';

    this.enemy = this.physics.add.image(ex, ey, antagSprite);
    this.enemy.setDepth(ey);
    this.enemy.setScale(1.2);
    this.enemySpeed = 38;
    this.enemy.hp = 8;
    this.enemy.maxHp = 8;
    this.enemy.hitThisSwing = false;
    this.physics.add.collider(this.enemy, this.solids);

    this.core = this.add.image(ex, ey, 'sombra_core').setVisible(false).setDepth(99998);
    this.enemyBar = this.add.graphics().setDepth(99997);
    this.hpBar = this.add.graphics().setScrollFactor(0).setDepth(10001);
    
    this.skillText = this.add
      .text(8, 22, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffd875' })
      .setScrollFactor(0)
      .setDepth(10001);

    this.sombraWarned = false;
    this.enemyDefeated = false;
  }

  attack() {
    if (this.talking) return;
    const now = this.time.now;
    if (now < this.nextAttack) return;
    this.nextAttack = now + 320;
    this.enemy.hitThisSwing = false;

    const off = 16;
    let dx = 0;
    let dy = 0;
    if (this.facing === 'up') dy = -off;
    else if (this.facing === 'down') dy = off;
    else if (this.facing === 'left') dx = -off;
    else dx = off;

    this.attackX = this.player.x + dx;
    this.attackY = this.player.y - 12 + dy;

    const alegato = this.add
      .image(this.attackX, this.attackY, 'alegato')
      .setDepth(this.player.y + 1)
      .setFlipX(this.facing === 'left');
    
    this.tweens.add({
      targets: alegato,
      x: this.attackX + dx * 1.5,
      y: this.attackY + dy * 1.5,
      alpha: 0,
      scale: 1.5,
      duration: 220,
      onComplete: () => alegato.destroy(),
    });

    this.attackActiveUntil = now + 160;
  }

  useDignidad() {
    if (this.talking) return;
    const now = this.time.now;
    if (now < this.valorReadyAt) return;
    this.valorUntil = now + 5000;
    this.valorReadyAt = now + 11000;
    this.player.setTint(0xffd875);
    this.cameras.main.flash(150, 227, 148, 11);
    this.showFloat(this.player.x, this.player.y - 20, '¡Dignidad Constitucional!', '#ffd875');
  }

  useControlLegalidad() {
    if (this.talking || this.enemyDefeated) return;
    const now = this.time.now;
    if (now < this.revealReadyAt) return;
    this.revealUntil = now + 6500;
    this.revealReadyAt = now + 9000;
    if (this.enemy.active) this.enemy.setTint(0x9945de);
    this.showFloat(this.player.x, this.player.y - 20, '¡Control de Legalidad!', '#c9a7eb');
  }

  applyReinoTint() {
    const c = Phaser.Display.Color.HexStringToColor(this.reino.color).color;
    this.add.rectangle(0, 0, this.mapW, this.mapH, c, 0.22).setOrigin(0).setDepth(1);
  }

  createRiddlePedestal() {
    const riddle = this.reino.riddleId ? RIDDLES[this.reino.riddleId] : null;
    if (!riddle) {
      this.atril = null;
      this.atrilSolved = true;
      return;
    }
    const ax = (COLS / 2 - 2) * TILE;
    const ay = (ROWS / 2 + 4) * TILE;
    this.atril = this.add.image(ax, ay, 'atril').setOrigin(0.5, 1);
    this.atril.setDepth(ay);
    this.atril.riddle = riddle;
    this.atrilHint = this.add
      .text(ax, ay - 30, 'Atril de Jurisprudencia (E)', { fontFamily: 'monospace', fontSize: '7px', color: COLORS.goldLight })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  createSavePoint() {
    const fx = (COLS / 2) * TILE;
    const fy = (ROWS / 2 + 5) * TILE;
    this.fuente = this.add.image(fx, fy, 'fuente').setOrigin(0.5, 1);
    this.fuente.setDepth(fy);
    this.fuenteHint = this.add
      .text(fx, fy - 32, 'Guardar Registro (E)', { fontFamily: 'monospace', fontSize: '7px', color: COLORS.gold })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  createPortal() {
    const px = (COLS / 2) * TILE;
    const py = 3 * TILE;
    this.portal = this.add.image(px, py, 'portal').setOrigin(0.5, 1);
    this.portal.setDepth(py);
    this.portal.setAlpha(0.35);
    this.portalReady = false;
    this.portalHint = this.add
      .text(px, py - 36, 'Avanzar Distrito (E)', { fontFamily: 'monospace', fontSize: '8px', color: '#ffd875' })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  checkPortal() {
    if (this.portalReady) return;
    if (this.enemyDefeated && this.atrilSolved) {
      this.portalReady = true;
      this.portal.setAlpha(1);
      this.tweens.add({ targets: this.portal, scale: 1.12, duration: 800, yoyo: true, repeat: -1 });
      this.showFloat(this.portal.x, this.portal.y - 20, '¡Pacto Restaurado! Portal Abierto', '#ffd875');
    }
  }

  saveGame() {
    if (!this.save) return;
    this.save.px = this.player.x;
    this.save.py = this.player.y;
    this.save.hp = this.hp;
    this.save.dignidad = this.hp;
    writeSave(this.save);
    this.showFloat(this.player.x, this.player.y - 24, 'Registro Guardado', '#ffd875');
    this.cameras.main.flash(100, 227, 148, 11);
  }

  advanceReino() {
    if (this.reino.nivel >= CAPITULOS.length - 1) {
      this.showFloat(this.player.x, this.player.y - 24, '¡Has restaurado la concordia en todo el yermo!', '#ffd875');
      this.time.delayedCall(1200, () => this.scene.start('Menu'));
      return;
    }
    if (!this.save) this.save = {};
    this.save.level = this.reino.nivel + 1;
    this.save.px = null;
    this.save.py = null;
    this.save.hp = this.maxHp;
    this.save.dignidad = this.maxHp;
    writeSave(this.save);
    this.cameras.main.fade(400, 14, 4, 20);
    this.time.delayedCall(450, () => this.scene.restart({ save: this.save }));
  }

  openRiddle(riddle) {
    if (this.talking) return;
    this.talking = true;
    this.player.setVelocity(0, 0);
    this.scene.launch('Riddle', {
      riddle,
      returnScene: 'World',
      onSolved: () => {
        this.atrilSolved = true;
        this.showFloat(this.atril.x, this.atril.y - 24, '¡Jurisprudencia Validada!', '#ffd875');
      },
    });
    this.scene.pause();
  }

  gainWisdom(entry) {
    if (!this.save || !entry) return;
    if (!this.save.wisdomDiary) this.save.wisdomDiary = [];
    const exists = this.save.wisdomDiary.some((e) => e.id === entry.id);
    if (!exists) {
      this.save.wisdomDiary.push({ id: entry.id, titulo: entry.titulo, frase: entry.frase });
      this.showFloat(this.player.x, this.player.y - 26, '✦ Precedente Jurídico (I)', '#ffd875');
    }
    writeSave(this.save);
  }

  openDiary() {
    if (this.talking) return;
    this.talking = true;
    this.player.setVelocity(0, 0);
    const entries = this.save && this.save.wisdomDiary ? this.save.wisdomDiary : [];
    this.scene.launch('Diary', { entries, returnScene: 'World' });
    this.scene.pause();
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown-E', () => this.tryInteract());
    this.input.keyboard.on('keydown-SPACE', () => this.attack());
    this.input.keyboard.on('keydown-V', () => this.useDignidad());
    this.input.keyboard.on('keydown-B', () => this.useControlLegalidad());
    this.input.keyboard.on('keydown-I', () => this.openDiary());
  }

  tryInteract() {
    if (this.talking) return;
    const near = (obj) => obj ? Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y) : 999;
    
    if (near(this.fuente) < 28) {
      this.saveGame();
      return;
    }
    if (this.portalReady && near(this.portal) < 30) {
      this.advanceReino();
      return;
    }
    if (this.atril && near(this.atril) < 28) {
      this.openRiddle(this.atril.riddle);
      return;
    }
    const options = [
      { obj: this.npc, convo: this.npc ? this.npc.convo : null },
      { obj: this.companion1, convo: this.companion1 ? this.companion1.convo : null },
      { obj: this.companion2, convo: this.companion2 ? this.companion2.convo : null },
    ];
    let best = null;
    for (const o of options) {
      if (!o.obj || !o.convo) continue;
      const d = near(o.obj);
      if (d < 30 && (!best || d < best.d)) best = { ...o, d };
    }
    if (best) this.startDialogue(best.convo);
  }

  startDialogue(convo) {
    if (this.talking || !convo) return;
    this.talking = true;
    this.player.setVelocity(0, 0);
    this.scene.launch('Dialogue', { convo, returnScene: 'World' });
    this.scene.pause();
  }

  buildHud() {
    const t = this.add
      .text(8, 6, `AEQUITAS · Cap. ${this.reino.nivel}: ${this.reino.nombre}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: COLORS.goldLight,
      })
      .setScrollFactor(0)
      .setDepth(10000);
    t.setShadow(1, 1, '#000000', 2);

    const sub = this.add
      .text(8, 18, `Norma: ${this.reino.aprendizaje}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#c9a7eb',
      })
      .setScrollFactor(0)
      .setDepth(10000);

    const hint = this.add
      .text(8, this.scale.height - 12, 'WASD: Moverse · Espacio: Alegato · V: Dignidad (Const.) · B: Legalidad · E: Hablar/Códice', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ffd875',
      })
      .setScrollFactor(0)
      .setDepth(10000);
    hint.setShadow(1, 1, '#000000', 2);
  }

  update() {
    if (this.talking) {
      this.player.setVelocity(0, 0);
      return;
    }

    if (this.npc) {
      const dNpc = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
      this.npcHint.setVisible(dNpc < 30);
    }
    const dF = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.fuente.x, this.fuente.y);
    this.fuenteHint.setVisible(dF < 28);
    
    if (this.atril) {
      const dA = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.atril.x, this.atril.y);
      this.atrilHint.setVisible(dA < 28);
    }
    if (this.treasures && this.treasures.length) {
      for (const orb of this.treasures) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y) < 14) {
          this.collectTreasure(orb);
        }
      }
    }

    this.checkPortal();
    if (this.portalReady) {
      const dP = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
      this.portalHint.setVisible(dP < 30);
    }

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const moving = vx !== 0 || vy !== 0;
    const knocked = this.time.now < this.knockUntil;
    if (knocked) {
    } else if (moving) {
      const valor = this.time.now < this.valorUntil;
      const spd = SPEED * (valor ? 1.3 : 1);
      const len = Math.hypot(vx, vy) || 1;
      this.player.setVelocity((vx / len) * spd, (vy / len) * spd);
      this.updateFacing(vx, vy);
      this.bob += 0.25;
      this.player.setScale(1, 1 - Math.abs(Math.sin(this.bob)) * 0.05);
    } else {
      this.player.setVelocity(0, 0);
      this.player.setScale(1, 1);
    }

    this.player.setDepth(this.player.y);
    this.updateCombat();

    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(this.player.x - last.x, this.player.y - last.y) > 2) {
      this.trail.push({ x: this.player.x, y: this.player.y });
      if (this.trail.length > 80) this.trail.shift();
    }

    this.followCompanion(this.companion1, this.companion1Gap);
    this.followCompanion(this.companion2, this.companion2Gap);
  }

  updateFacing(vx, vy) {
    if (vx !== 0) {
      this.player.setFlipX(vx < 0);
      this.facing = vx < 0 ? 'left' : 'right';
    } else if (vy < 0) {
      this.facing = 'up';
    } else if (vy > 0) {
      this.facing = 'down';
    }
  }

  updateCombat() {
    const now = this.time.now;

    if (this.player.tintTopLeft !== 0xffffff && now >= this.valorUntil) {
      this.player.clearTint();
    }

    this.drawHpBar();

    if (this.enemyDefeated || !this.enemy.active) {
      this.enemyBar.clear();
      this.core.setVisible(false);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
    if (!this.sombraWarned && dist < 95) {
      this.sombraWarned = true;
      const convo = this.reino.nivel === 1 ? CONVERSATIONS.murociego_confronta : CONVERSATIONS.intro;
      this.startDialogue(convo);
      return;
    }

    const ang = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
    const spd = this.enemySpeed || 36;
    this.enemy.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
    this.enemy.setDepth(this.enemy.y);

    const revealed = now < this.revealUntil;
    this.core.setVisible(revealed);
    if (revealed) {
      this.core.setPosition(this.enemy.x, this.enemy.y - 12);
    } else if (now >= this.revealUntil && this.enemy.tintTopLeft !== 0xffffff) {
      this.enemy.clearTint();
    }

    if (now < this.attackActiveUntil && !this.enemy.hitThisSwing) {
      const dHit = Phaser.Math.Distance.Between(this.attackX, this.attackY, this.enemy.x, this.enemy.y);
      if (dHit < 18) {
        this.enemy.hitThisSwing = true;
        this.hitEnemy(revealed);
      }
    }

    if (dist < 14 && now >= this.invulnUntil) {
      this.takeDamage(now);
    }

    this.drawEnemyBar();
  }

  hitEnemy(revealed) {
    if (!revealed) {
      this.enemy.setTint(0x9945de);
      this.time.delayedCall(90, () => {
        if (this.enemy.active && this.time.now >= this.revealUntil) this.enemy.clearTint();
      });
      this.showFloat(this.enemy.x, this.enemy.y - 14, '¡Sin motivación legal!', '#c9a7eb');
      return;
    }
    
    const valor = this.time.now < this.valorUntil;
    const conviccion = valor ? 3 : 2;
    this.enemy.hp -= conviccion;
    
    const frases = ['¡Art. 29 C.P.!', '¡Debido Proceso!', '¡Buena Fe!', '¡Nulidad!', '¡Dignidad Humana!'];
    const frase = frases[Phaser.Math.Between(0, frases.length - 1)];
    this.showFloat(this.enemy.x, this.enemy.y - 16, frase, '#ffd875');
    
    this.cameras.main.shake(80, 0.003);
    this.tweens.add({ targets: this.enemy, alpha: 0.5, duration: 60, yoyo: true });
    
    if (this.enemy.hp <= 0) this.defeatEnemy();
  }

  takeDamage(now) {
    this.hp = Math.max(0, this.hp - 10);
    this.invulnUntil = now + 900;
    const ang = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
    this.player.setVelocity(Math.cos(ang) * 140, Math.sin(ang) * 140);
    this.knockUntil = now + 150;
    this.player.setTint(0xff8a8a);
    this.time.delayedCall(200, () => {
      if (this.time.now >= this.valorUntil) this.player.clearTint();
    });
    this.cameras.main.shake(100, 0.005);
    if (this.hp <= 0) this.playerDown();
  }

  defeatEnemy() {
    this.enemyDefeated = true;
    this.enemy.setVelocity(0, 0);
    this.core.setVisible(false);
    this.enemyBar.clear();

    this.enemy.setTint(0xffd875);
    
    const flor = this.add.image(this.enemy.x, this.enemy.y + 4, 'bellium_flower').setScale(0.1).setDepth(this.enemy.y - 1);
    this.tweens.add({
      targets: flor,
      scale: 1.8,
      duration: 650,
      ease: 'Back.out',
    });

    this.cameras.main.flash(250, 227, 148, 11);
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(this.enemy.x, this.enemy.y, 'leaf').setScale(0.8).setDepth(99999);
      const ang = (Math.PI * 2 * i) / 10;
      this.tweens.add({
        targets: p,
        x: this.enemy.x + Math.cos(ang) * 26,
        y: this.enemy.y + Math.sin(ang) * 26,
        alpha: 0,
        scale: 1.4,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }

    this.showFloat(this.enemy.x, this.enemy.y - 28, '✿ ¡ORDEN SOCIAL RESTAURADO! ✿', '#ffd875');

    this.tweens.add({
      targets: this.enemy,
      alpha: 0.2,
      duration: 800,
      onComplete: () => this.enemy.destroy(),
    });

    this.hp = this.maxHp;
    if (this.save) {
      this.save.hp = this.hp;
      this.save.dignidad = this.hp;
      if (!this.save.solvedCases) this.save.solvedCases = [];
      this.save.solvedCases.push(this.reino.nombre);
    }
    
    this.gainWisdom(WISDOM.prologo_sombra);
    this.time.delayedCall(700, () => this.startDialogue(CONVERSATIONS.arbitrariedad_vencida));
  }

  playerDown() {
    this.cameras.main.fade(300, 14, 4, 20);
    this.time.delayedCall(350, () => {
      this.hp = this.maxHp;
      this.player.setPosition((COLS / 2) * TILE, (ROWS / 2) * TILE);
      this.player.clearTint();
      this.cameras.main.fadeIn(300, 14, 4, 20);
      this.showFloat(this.player.x, this.player.y - 24, 'Recobra la dignidad y vuelve a argumentar', '#ffd875');
    });
  }

  showFloat(x, y, text, color) {
    const t = this.add
      .text(x, y, text, { fontFamily: 'Georgia, serif', fontSize: '9px', color })
      .setOrigin(0.5)
      .setDepth(99999);
    this.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  drawHpBar() {
    const g = this.hpBar;
    g.clear();
    const x = 8;
    const y = 28;
    const w = 70;
    const h = 6;
    g.fillStyle(0x08020c, 0.9);
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x32104a, 1);
    g.fillRect(x, y, w, h);
    const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    g.fillStyle(0xe3940b, 1);
    g.fillRect(x, y, Math.round(w * pct), h);

    const now = this.time.now;
    const valor = now < this.valorUntil ? 'ACTIVA' : now < this.valorReadyAt ? 'recargando' : 'lista (V)';
    const sab = now < this.revealUntil ? 'ACTIVA' : now < this.revealReadyAt ? 'recargando' : 'lista (B)';
    this.skillText.setText(`Dignidad (V): ${valor}  ·  Legalidad (B): ${sab}`).setY(37);
  }

  drawEnemyBar() {
    const g = this.enemyBar;
    g.clear();
    if (!this.enemy.active) return;
    const w = 22;
    const h = 3;
    const x = this.enemy.x - w / 2;
    const y = this.enemy.y - 18;
    g.fillStyle(0x08020c, 0.9);
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x420060, 1);
    g.fillRect(x, y, w, h);
    const pct = Phaser.Math.Clamp(this.enemy.hp / this.enemy.maxHp, 0, 1);
    g.fillStyle(0x9945de, 1);
    g.fillRect(x, y, Math.round(w * pct), h);
  }

  followCompanion(comp, gap) {
    if (!comp) return;
    const p = this.trailPointBehind(gap);
    const prevX = comp.x;
    comp.x = Phaser.Math.Linear(comp.x, p.x, 0.4);
    comp.y = Phaser.Math.Linear(comp.y, p.y, 0.4);
    if (Math.abs(comp.x - prevX) > 0.2) comp.setFlipX(comp.x < prevX);
    comp.setDepth(comp.y);
  }
}
