// Mundo jugable de "Reverdecer" (Fase 2): jardín verde explorable.
// Abigail camina en 4 direcciones con colisiones y cámara; Jerónimo y Amanda
// la siguen en fila. Mapa generado por código con árboles y un estanque.

import Phaser from 'phaser';
import { COLORS } from '../config.js';

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

    this.buildGround();
    this.solids = this.physics.add.staticGroup();
    this.buildTreesAndPond();

    this.createPlayer();
    this.createDogs();

    // Físicas y cámara.
    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBackgroundColor(COLORS.bgDeep);

    this.setupInput();
    this.buildHud();
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
    const startX = (COLS / 2) * TILE;
    const startY = (ROWS / 2) * TILE;
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

  // ----------------------------------------------------------- input/hud
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'));
  }

  buildHud() {
    const t = this.add
      .text(8, 6, 'El Jardín del Despertar', {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: COLORS.cream,
      })
      .setScrollFactor(0)
      .setDepth(10000);
    t.setShadow(1, 1, '#06100b', 2);

    const hint = this.add
      .text(8, this.scale.height - 14, 'WASD / Flechas: moverte   ·   Esc: menú', {
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
    if (moving) {
      const len = Math.hypot(vx, vy) || 1;
      this.player.setVelocity((vx / len) * SPEED, (vy / len) * SPEED);
      this.updateFacing(vx, vy);
      // pasito (bob) vertical sutil
      this.bob += 0.25;
      this.player.setScale(1, 1 - Math.abs(Math.sin(this.bob)) * 0.05);
    } else {
      this.player.setVelocity(0, 0);
      this.player.setScale(1, 1);
    }

    this.player.setDepth(this.player.y);

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
