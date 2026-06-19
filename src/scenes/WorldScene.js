// Mundo jugable de "Reverdecer" (Fase 2): jardín verde explorable.
// Abigail camina en 4 direcciones con colisiones y cámara; Jerónimo y Amanda
// la siguen en fila. Mapa generado por código con árboles y un estanque.

import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { CONVERSATIONS } from '../data/dialogues.js';
import { RIDDLES } from '../data/bookRiddles.js';
import { WISDOM } from '../data/wisdom.js';
import { getReino } from '../data/reinos.js';
import { writeSave } from '../systems/save.js';

const TILE = 16;
const COLS = 50;
const ROWS = 34;
const SPEED = 80;

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

    // Reino actual según el progreso.
    const nivel = this.save ? this.save.level || 0 : 0;
    this.reino = getReino(nivel);

    this.buildGround();
    this.applyReinoTint();
    this.solids = this.physics.add.staticGroup();
    this.buildTreesAndPond();

    this.createPlayer();
    this.createDogs();
    this.createNpc();
    this.createCombat();
    this.createSavePoint();
    this.createRiddlePedestal();
    this.createPortal();

    // Físicas y cámara.
    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor(COLORS.bgDeep);

    this.setupInput();
    this.buildHud();

    // Al volver de un diálogo, reactivar el control.
    this.talking = false;
    this.events.on('resume', () => {
      this.talking = false;
    });

    // Diálogo de introducción la primera vez (prólogo).
    if (this.save && this.save.level === 0 && !this.save.introSeen) {
      this.save.introSeen = true;
      this.time.delayedCall(400, () => this.startDialogue(CONVERSATIONS.intro));
    }
  }

  // ----------------------------------------------------------- terreno
  buildGround() {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const key = Phaser.Math.Between(0, 9) === 0 ? 't_flower' : 't_grass';
        this.add.image(x * TILE, y * TILE, key).setOrigin(0).setDepth(0);
      }
    }
    // Sendero serpenteante horizontal a media altura.
    const py = Math.floor(ROWS / 2);
    for (let x = 2; x < COLS - 2; x++) {
      const wobble = Math.round(Math.sin(x * 0.4) * 1.5);
      this.add.image(x * TILE, (py + wobble) * TILE, 't_path').setOrigin(0).setDepth(0);
    }
    // Sendero vertical que cruza.
    for (let y = 2; y < ROWS - 2; y++) {
      this.add.image(Math.floor(COLS / 2) * TILE, y * TILE, 't_path').setOrigin(0).setDepth(0);
    }
  }

  // -------------------------------------------------- árboles y estanque
  buildTreesAndPond() {
    const addTree = (tx, ty) => {
      // Origen en los pies del árbol para ordenar profundidad por Y.
      const tree = this.solids.create(tx * TILE + TILE / 2, ty * TILE + TILE, 't_tree');
      tree.setOrigin(0.5, 1);
      tree.refreshBody(); // recoloca el cuerpo estático tras cambiar el origen
      tree.setDepth(tree.y);
      // Cuerpo de colisión solo en el tronco (deja pasar bajo la copa).
      tree.body.setSize(8, 8, false);
      tree.body.setOffset(4, 16);
      return tree;
    };

    // Borde de árboles alrededor del mapa.
    for (let x = 0; x < COLS; x += 1) {
      if (x % 2 === 0) {
        addTree(x, 1);
        addTree(x, ROWS - 1);
      }
    }
    for (let y = 1; y < ROWS; y += 2) {
      addTree(0, y);
      addTree(COLS - 1, y);
    }

    // Algunos bosquecillos interiores (evitando los senderos centrales).
    const clusters = [
      [8, 6], [10, 7], [9, 9],
      [38, 8], [40, 9], [41, 7],
      [12, 26], [14, 27], [13, 24],
      [36, 25], [38, 26], [40, 24],
    ];
    clusters.forEach(([x, y]) => addTree(x, y));

    // Arbustos decorativos (sin colisión).
    [[20, 10], [30, 22], [16, 18], [34, 14]].forEach(([x, y]) => {
      this.add.image(x * TILE + 8, y * TILE + 8, 't_bush').setDepth(y * TILE);
    });

    // Estanque (agua, con colisión) en una esquina tranquila.
    for (let y = 5; y <= 8; y++) {
      for (let x = 5; x <= 9; x++) {
        const w = this.solids.create(x * TILE, y * TILE, 't_water');
        w.setOrigin(0).setDepth(1);
        w.refreshBody();
      }
    }
  }

  // ----------------------------------------------------------- personajes
  createPlayer() {
    const startX = this.save && this.save.px != null ? this.save.px : (COLS / 2) * TILE;
    const startY = this.save && this.save.py != null ? this.save.py : (ROWS / 2) * TILE;
    this.player = this.physics.add.image(startX, startY, 'abigail');
    this.player.setOrigin(0.5, 1);
    this.player.body.setSize(10, 8);
    this.player.body.setOffset(4, 20);
    this.facing = 'down';
    this.bob = 0;
  }

  createDogs() {
    // Rastro de posiciones (puntos por los que pasó Abigail) para que los perros
    // la sigan manteniendo una separación FIJA en píxeles (no se amontonan).
    this.trail = [{ x: this.player.x, y: this.player.y }];
    const mk = (key, x) => this.add.image(x, this.player.y, key).setOrigin(0.5, 1);
    // Amanda más cerca (valiente, al frente); Jerónimo detrás.
    this.amanda = mk('amanda', this.player.x - 16);
    this.jeronimo = mk('jeronimo', this.player.x - 32);
    this.amandaGap = 16;   // px detrás de Abigail
    this.jeronimoGap = 30; // px detrás de Abigail
  }

  // Devuelve el punto del rastro a `gap` píxeles por detrás de Abigail.
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
    this.npc = this.add.image(nx, ny, 'npc_guia').setOrigin(0.5, 1);
    this.npc.setDepth(this.npc.y);
    this.npc.convo = CONVERSATIONS.jardinero;
    // Burbuja de aviso "hablar".
    this.npcHint = this.add
      .text(nx, ny - 30, '!', { fontFamily: 'monospace', fontSize: '12px', color: COLORS.gold })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  // ----------------------------------------------------------- combate
  createCombat() {
    this.hp = this.save ? this.save.hp : 100;
    this.maxHp = this.save ? this.save.maxHp : 100;

    this.nextAttack = 0;
    this.knockUntil = 0;
    this.invulnUntil = 0;

    // Estados de Valor (Amanda) y Sabiduría (Jerónimo).
    this.valorUntil = 0;
    this.valorReadyAt = 0;
    this.revealUntil = 0;
    this.revealReadyAt = 0;

    // Enemigo: una sombra errante (primer combate del prólogo).
    const ex = (COLS / 2 - 7) * TILE;
    const ey = (ROWS / 2 - 3) * TILE;
    this.enemy = this.physics.add.image(ex, ey, 'sombra');
    this.enemy.setDepth(ey);
    this.enemy.hp = 5;
    this.enemy.maxHp = 5;
    this.enemy.hitThisSwing = false;
    this.physics.add.collider(this.enemy, this.solids);

    // Núcleo (punto débil) oculto hasta usar Sabiduría.
    this.core = this.add.image(ex, ey, 'sombra_core').setVisible(false).setDepth(99998);

    // Barra de vida del enemigo (mundo).
    this.enemyBar = this.add.graphics().setDepth(99997);

    // HUD de vida de Abigail (fijo a cámara).
    this.hpBar = this.add.graphics().setScrollFactor(0).setDepth(10001);
    this.skillText = this.add
      .text(8, 22, '', { fontFamily: 'monospace', fontSize: '8px', color: '#bfe0c8' })
      .setScrollFactor(0)
      .setDepth(10001);

    this.sombraWarned = false;
    this.enemyDefeated = false;
  }

  attack() {
    if (this.talking) return;
    const now = this.time.now;
    if (now < this.nextAttack) return;
    this.nextAttack = now + 340;
    this.enemy.hitThisSwing = false;

    // Punto frente a Abigail según su orientación.
    const off = 14;
    let dx = 0;
    let dy = 0;
    if (this.facing === 'up') dy = -off;
    else if (this.facing === 'down') dy = off;
    else if (this.facing === 'left') dx = -off;
    else dx = off;
    this.attackX = this.player.x + dx;
    this.attackY = this.player.y - 14 + dy; // a la altura del torso

    const slash = this.add
      .image(this.attackX, this.attackY, 'slash')
      .setDepth(this.player.y + 1)
      .setFlipX(this.facing === 'left');
    this.tweens.add({ targets: slash, alpha: 0, scale: 1.4, duration: 180, onComplete: () => slash.destroy() });

    this.attackActiveUntil = now + 140;
  }

  useValor() {
    if (this.talking) return;
    const now = this.time.now;
    if (now < this.valorReadyAt) return;
    this.valorUntil = now + 5000;
    this.valorReadyAt = now + 11000;
    this.player.setTint(0x9be8a6);
    this.cameras.main.flash(150, 120, 220, 140);
  }

  useSabiduria() {
    if (this.talking || this.enemyDefeated) return;
    const now = this.time.now;
    if (now < this.revealReadyAt) return;
    this.revealUntil = now + 6000;
    this.revealReadyAt = now + 8500;
    if (this.enemy.active) this.enemy.setTint(0xe9c46a);
  }

  applyReinoTint() {
    // Tinte emocional del reino sobre la base verde (capa sutil).
    const c = Phaser.Display.Color.HexStringToColor(this.reino.color).color;
    const tint = this.add.rectangle(0, 0, this.mapW, this.mapH, c, 0.18).setOrigin(0).setDepth(1);
  }

  // -------------------------------------------------------- acertijo del reino
  createRiddlePedestal() {
    // Solo hay atril si el reino usa un acertijo de libro real.
    const riddle = this.reino.riddleId ? RIDDLES[this.reino.riddleId] : null;
    if (!riddle) {
      this.atril = null;
      this.atrilSolved = true; // sin acertijo, no bloquea el portal
      return;
    }
    const ax = (COLS / 2 - 2) * TILE;
    const ay = (ROWS / 2 + 4) * TILE;
    this.atril = this.add.image(ax, ay, 'atril').setOrigin(0.5, 1);
    this.atril.setDepth(ay);
    this.atril.riddle = riddle;
    this.atrilHint = this.add
      .text(ax, ay - 30, 'Leer (E)', { fontFamily: 'monospace', fontSize: '7px', color: '#e9c46a' })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
    this.atrilSolved = false;
  }

  createPortal() {
    const px = (COLS / 2 + 8) * TILE;
    const py = (ROWS / 2) * TILE;
    this.portal = this.add.image(px, py, 'portal').setOrigin(0.5, 1).setDepth(py);
    this.portal.setVisible(false);
    this.portalReady = false;
    this.portalHint = this.add
      .text(px, py - 34, 'Entrar al siguiente reino (E)', { fontFamily: 'monospace', fontSize: '7px', color: '#9be8a6' })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  // ¿Se cumplieron los retos del reino? (Guardián vencido y acertijo resuelto)
  checkPortal() {
    if (this.portalReady) return;
    const done = this.enemyDefeated && this.atrilSolved;
    if (done) {
      this.portalReady = true;
      this.portal.setVisible(true);
      this.tweens.add({ targets: this.portal, alpha: 0.6, duration: 700, yoyo: true, repeat: -1 });
      this.showFloat(this.portal.x, this.portal.y - 30, 'Un portal se abrió...', '#9be8a6');
    }
  }

  advanceReino() {
    // Recoge la enseñanza del reino y avanza al siguiente.
    this.gainWisdom({
      id: 'reino_' + this.reino.nivel,
      titulo: `Reino ${this.reino.nivel} — ${this.reino.nombre}`,
      frase: this.reino.ensenanza,
    });
    if (this.save) {
      this.save.level = Math.min((this.save.level || 0) + 1, 32);
      this.save.maxLevelReached = Math.max(this.save.maxLevelReached || 0, this.save.level);
      this.save.hp = this.maxHp;
      // Reinicia posición para el nuevo reino.
      this.save.px = (COLS / 2) * TILE;
      this.save.py = (ROWS / 2) * TILE;
      writeSave(this.save);
    }
    this.cameras.main.fade(450, 8, 14, 10);
    this.time.delayedCall(500, () => this.scene.restart({ save: this.save }));
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
        if (this.save) {
          if (!this.save.riddlesSolved) this.save.riddlesSolved = [];
          if (!this.save.riddlesSolved.includes(riddle.nivel)) this.save.riddlesSolved.push(riddle.nivel);
        }
        // La enseñanza del acertijo queda consultable en el Diario.
        this.gainWisdom({
          id: 'libro_' + riddle.nivel,
          titulo: `${riddle.libro} — ${riddle.autor}`,
          frase: riddle.ensenanza,
        });
      },
    });
    this.scene.pause();
  }

  // ----------------------------------------------------------- guardado
  createSavePoint() {
    const fx = (COLS / 2 + 1) * TILE;
    const fy = (ROWS / 2 + 3) * TILE;
    this.fuente = this.add.image(fx, fy, 'fuente').setOrigin(0.5, 1);
    this.fuente.setDepth(fy);
    this.fuenteHint = this.add
      .text(fx, fy - 30, 'Guardar (E)', { fontFamily: 'monospace', fontSize: '7px', color: '#bfe0f5' })
      .setOrigin(0.5)
      .setDepth(99999)
      .setVisible(false);
  }

  saveGame() {
    if (!this.save) return;
    this.save.hp = this.hp;
    this.save.maxHp = this.maxHp;
    this.save.px = Math.round(this.player.x);
    this.save.py = Math.round(this.player.y);
    writeSave(this.save);
    this.cameras.main.flash(180, 180, 220, 245);
    this.showFloat(this.player.x, this.player.y - 26, 'Progreso guardado', '#bfe0f5');
  }

  // Suma una enseñanza (objeto {id, titulo, frase}) al Diario de Sabiduría y guarda.
  gainWisdom(entry) {
    if (!this.save || !entry) return;
    if (!this.save.wisdomDiary) this.save.wisdomDiary = [];
    const exists = this.save.wisdomDiary.some((e) => e.id === entry.id);
    if (!exists) {
      this.save.wisdomDiary.push({ id: entry.id, titulo: entry.titulo, frase: entry.frase });
      this.showFloat(this.player.x, this.player.y - 26, '✦ Nueva enseñanza (I)', '#e9c46a');
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

  // ----------------------------------------------------------- input/hud
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown-E', () => this.tryInteract());
    this.input.keyboard.on('keydown-SPACE', () => this.attack());
    this.input.keyboard.on('keydown-V', () => this.useValor());
    this.input.keyboard.on('keydown-B', () => this.useSabiduria());
    this.input.keyboard.on('keydown-I', () => this.openDiary());
  }

  // Habla con quien esté más cerca (NPC, Amanda o Jerónimo).
  tryInteract() {
    if (this.talking) return;
    const near = (obj) => Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
    // La fuente tiene prioridad si estás muy cerca: guarda el progreso.
    if (near(this.fuente) < 28) {
      this.saveGame();
      return;
    }
    // El portal (si ya está abierto).
    if (this.portalReady && near(this.portal) < 30) {
      this.advanceReino();
      return;
    }
    // El atril del acertijo.
    if (this.atril && near(this.atril) < 28) {
      this.openRiddle(this.atril.riddle);
      return;
    }
    const options = [
      { obj: this.npc, convo: this.npc.convo },
      { obj: this.amanda, convo: CONVERSATIONS.amanda_valor },
      { obj: this.jeronimo, convo: CONVERSATIONS.jeronimo_consejo },
    ];
    let best = null;
    for (const o of options) {
      const d = near(o.obj);
      if (d < 30 && (!best || d < best.d)) best = { ...o, d };
    }
    if (best) this.startDialogue(best.convo);
  }

  startDialogue(convo) {
    if (this.talking) return;
    this.talking = true;
    this.player.setVelocity(0, 0);
    this.scene.launch('Dialogue', { convo, returnScene: 'World' });
    this.scene.pause();
  }

  buildHud() {
    const t = this.add
      .text(8, 6, `Reino ${this.reino.nivel} · ${this.reino.nombre}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: COLORS.cream,
      })
      .setScrollFactor(0)
      .setDepth(10000);
    t.setShadow(1, 1, '#06100b', 2);

    const hint = this.add
      .text(8, this.scale.height - 14, 'WASD  Atacar:Espacio  Valor:V  Sabiduría:B  Hablar:E  Diario:I', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#bfe0c8',
      })
      .setScrollFactor(0)
      .setDepth(10000);
    hint.setShadow(1, 1, '#06100b', 2);
  }

  // ----------------------------------------------------------- bucle
  update() {
    if (this.talking) {
      this.player.setVelocity(0, 0);
      return;
    }

    // Burbuja "!" cuando Abigail está cerca del NPC.
    const dNpc = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
    this.npcHint.setVisible(dNpc < 30);
    // Burbuja de guardado cuando está cerca de la fuente.
    const dF = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.fuente.x, this.fuente.y);
    this.fuenteHint.setVisible(dF < 28);
    // Burbuja del atril del acertijo (si este reino lo tiene).
    if (this.atril) {
      const dA = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.atril.x, this.atril.y);
      this.atrilHint.setVisible(dA < 28);
    }
    // Portal: comprobar apertura y burbuja.
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
      // Durante el retroceso no se controla la velocidad (ya está fijada).
    } else if (moving) {
      const valor = this.time.now < this.valorUntil;
      const spd = SPEED * (valor ? 1.3 : 1);
      const len = Math.hypot(vx, vy) || 1;
      this.player.setVelocity((vx / len) * spd, (vy / len) * spd);
      this.updateFacing(vx, vy);
      // pasito (bob) vertical sutil
      this.bob += 0.25;
      this.player.setScale(1, 1 - Math.abs(Math.sin(this.bob)) * 0.05);
    } else {
      this.player.setVelocity(0, 0);
      this.player.setScale(1, 1);
    }

    this.player.setDepth(this.player.y);
    this.updateCombat();

    // Añade un punto al rastro solo cuando Abigail se ha movido lo suficiente.
    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(this.player.x - last.x, this.player.y - last.y) > 2) {
      this.trail.push({ x: this.player.x, y: this.player.y });
      if (this.trail.length > 80) this.trail.shift();
    }

    this.followDog(this.amanda, this.amandaGap);
    this.followDog(this.jeronimo, this.jeronimoGap);
  }

  updateFacing(vx, vy) {
    if (vy < 0 && vx === 0) {
      this.player.setTexture('abigail_back');
      this.facing = 'up';
    } else if (vy > 0 && vx === 0) {
      this.player.setTexture('abigail');
      this.facing = 'down';
    } else if (vx !== 0) {
      this.player.setTexture('abigail');
      this.player.setFlipX(vx < 0);
      this.facing = vx < 0 ? 'left' : 'right';
    }
  }

  updateCombat() {
    const now = this.time.now;

    // Fin de Valor: quitar tinte.
    if (this.player.tintTopLeft !== 0xffffff && now >= this.valorUntil) {
      this.player.clearTint();
    }

    this.drawHpBar();

    if (this.enemyDefeated || !this.enemy.active) {
      this.enemyBar.clear();
      this.core.setVisible(false);
      return;
    }

    // Aviso/tutorial la primera vez que se acerca a la sombra.
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
    if (!this.sombraWarned && dist < 90) {
      this.sombraWarned = true;
      this.startDialogue(CONVERSATIONS.sombra_aviso);
      return;
    }

    // IA: la sombra persigue a Abigail.
    const ang = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
    this.enemy.setVelocity(Math.cos(ang) * 42, Math.sin(ang) * 42);
    this.enemy.setDepth(this.enemy.y);

    // Estado "revelado" (Sabiduría): núcleo visible y vulnerable.
    const revealed = now < this.revealUntil;
    this.core.setVisible(revealed);
    if (revealed) {
      this.core.setPosition(this.enemy.x, this.enemy.y - 9);
    } else if (now >= this.revealUntil && this.enemy.tintTopLeft !== 0xffffff) {
      this.enemy.clearTint();
    }

    // ¿El golpe de Abigail alcanza a la sombra?
    if (now < this.attackActiveUntil && !this.enemy.hitThisSwing) {
      const dHit = Phaser.Math.Distance.Between(this.attackX, this.attackY, this.enemy.x, this.enemy.y);
      if (dHit < 14) {
        this.enemy.hitThisSwing = true;
        this.hitEnemy(revealed);
      }
    }

    // Contacto: la sombra daña a Abigail.
    if (dist < 12 && now >= this.invulnUntil) {
      this.takeDamage(now);
    }

    this.drawEnemyBar();
  }

  hitEnemy(revealed) {
    if (!revealed) {
      // Sin Sabiduría, el golpe rebota: hay que ver su punto débil.
      this.enemy.setTint(0x6b6b8a);
      this.time.delayedCall(90, () => {
        if (this.enemy.active && this.time.now >= this.revealUntil) this.enemy.clearTint();
      });
      this.showFloat(this.enemy.x, this.enemy.y - 14, '¿?', '#9a9ab0');
      return;
    }
    const valor = this.time.now < this.valorUntil;
    const dmg = valor ? 2 : 1;
    this.enemy.hp -= dmg;
    this.showFloat(this.enemy.x, this.enemy.y - 14, `-${dmg}`, '#e9c46a');
    this.cameras.main.shake(80, 0.004);
    this.tweens.add({ targets: this.enemy, alpha: 0.4, duration: 60, yoyo: true });
    if (this.enemy.hp <= 0) this.defeatEnemy();
  }

  takeDamage(now) {
    this.hp = Math.max(0, this.hp - 12);
    this.invulnUntil = now + 950;
    // Retroceso.
    const ang = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);
    this.player.setVelocity(Math.cos(ang) * 160, Math.sin(ang) * 160);
    this.knockUntil = now + 160;
    this.player.setTint(0xff8a8a);
    this.time.delayedCall(220, () => {
      if (this.time.now >= this.valorUntil) this.player.clearTint();
    });
    this.cameras.main.shake(120, 0.006);
    if (this.hp <= 0) this.playerDown();
  }

  defeatEnemy() {
    this.enemyDefeated = true;
    this.enemy.setVelocity(0, 0);
    this.core.setVisible(false);
    this.enemyBar.clear();
    this.tweens.add({
      targets: this.enemy,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 500,
      onComplete: () => this.enemy.destroy(),
    });
    // Recompensa: cura, enseñanza al diario y guardado automático.
    this.hp = this.maxHp;
    if (this.save) {
      this.save.hp = this.hp;
      this.save.firstShadowBeaten = true;
    }
    this.gainWisdom(WISDOM.prologo_sombra);
    this.time.delayedCall(600, () => this.startDialogue(CONVERSATIONS.sombra_vencida));
  }

  playerDown() {
    // Reaparece en el inicio con la vida restaurada.
    this.cameras.main.fade(300, 10, 16, 12);
    this.time.delayedCall(350, () => {
      this.hp = this.maxHp;
      this.player.setPosition((COLS / 2) * TILE, (ROWS / 2) * TILE);
      this.player.clearTint();
      this.cameras.main.fadeIn(300, 10, 16, 12);
      this.showFloat(this.player.x, this.player.y - 24, 'Respira y vuelve a intentarlo', '#bfe0c8');
    });
  }

  showFloat(x, y, text, color) {
    const t = this.add
      .text(x, y, text, { fontFamily: 'monospace', fontSize: '9px', color })
      .setOrigin(0.5)
      .setDepth(99999);
    this.tweens.add({ targets: t, y: y - 12, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  drawHpBar() {
    const g = this.hpBar;
    g.clear();
    const x = 8;
    const y = 22;
    const w = 64;
    const h = 6;
    g.fillStyle(0x06100b, 0.8);
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x2a1414, 1);
    g.fillRect(x, y, w, h);
    const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    g.fillStyle(0x5bbf6a, 1);
    g.fillRect(x, y, Math.round(w * pct), h);

    // Estado de habilidades.
    const now = this.time.now;
    const valor = now < this.valorUntil ? 'ACTIVO' : now < this.valorReadyAt ? 'recargando' : 'listo (V)';
    const sab = now < this.revealUntil ? 'ACTIVA' : now < this.revealReadyAt ? 'recargando' : 'lista (B)';
    this.skillText.setText(`Valor: ${valor}    Sabiduría: ${sab}`).setY(32);
    this.skillText.setX(8);
  }

  drawEnemyBar() {
    const g = this.enemyBar;
    g.clear();
    if (!this.enemy.active) return;
    const w = 18;
    const h = 3;
    const x = this.enemy.x - w / 2;
    const y = this.enemy.y - 16;
    g.fillStyle(0x06100b, 0.8);
    g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x3a3152, 1);
    g.fillRect(x, y, w, h);
    const pct = Phaser.Math.Clamp(this.enemy.hp / this.enemy.maxHp, 0, 1);
    g.fillStyle(0xc3a9ec, 1);
    g.fillRect(x, y, Math.round(w * pct), h);
  }

  followDog(dog, gap) {
    const p = this.trailPointBehind(gap);
    const prevX = dog.x;
    // Suaviza el movimiento hacia el punto objetivo.
    dog.x = Phaser.Math.Linear(dog.x, p.x, 0.4);
    dog.y = Phaser.Math.Linear(dog.y, p.y, 0.4);
    if (Math.abs(dog.x - prevX) > 0.2) dog.setFlipX(dog.x < prevX);
    dog.setDepth(dog.y);
  }
}
