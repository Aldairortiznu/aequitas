import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE, TILE_SIZE } from '../../config';
import { bakeCharacter } from '../art/provisional';
import { estiloActivo } from '../art/estilo';
import { createKeyMap, readInput, type KeyMap } from '../input';
import { getBus } from '../../core/bus';
import { LateralUi } from './lateralUi';

/**
 * Prueba de formato (Dirección, 15 de septiembre de 2026): la torre de Altamar en vista
 * lateral con salto, escaleras y puertas que abre un documento, para ver cómo se sentiría
 * un metroidvania antes de decidir. Se abre con ?escena=lateral. No toca el contenido ni
 * la sesión: reutiliza el arte (sprites y tileset de Altamar) y el estilo activo.
 *
 * Controles: flechas/WASD para moverse y trepar, espacio o arriba para saltar, E/Enter
 * para hablar; en pantalla táctil, botones en el propio lienzo.
 */
export interface LateralData {
  sprites: string[];
  tilesets: string[];
}

const W = 60;
const H = 30;

// Índices del tileset (scripts/maps/lib.ts → T)
const IDX = {
  muro: 8,
  losa: 9,
  puerta: 11,
  escalera: 15,
  mesa: 20,
  estante: 23,
  barril: 25,
  poste: 27,
  valvula: 29,
  tuberia: 30,
  tanque: 31,
  ventana: 32,
  escombro: 35,
  panel: 36,
  cartel: 44,
} as const;

const LEYENDA: Record<string, { idx: number; solido?: boolean }> = {
  '#': { idx: IDX.muro, solido: true },
  '=': { idx: IDX.losa, solido: true },
  H: { idx: IDX.escalera },
  D: { idx: IDX.puerta, solido: true },
  b: { idx: IDX.barril, solido: true },
  m: { idx: IDX.mesa, solido: true },
  x: { idx: IDX.escombro, solido: true },
  t: { idx: IDX.tanque, solido: true },
  w: { idx: IDX.ventana },
  p: { idx: IDX.tuberia },
  c: { idx: IDX.cartel },
  s: { idx: IDX.panel },
  e: { idx: IDX.estante },
  o: { idx: IDX.poste },
  V: { idx: IDX.valvula },
};

/** El nivel se construye por código, como los mapas cenitales. */
function construirNivel(): string[][] {
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('.'));
  const put = (x: number, y: number, ch: string): void => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y]![x] = ch;
  };
  const fill = (x0: number, y0: number, x1: number, y1: number, ch: string): void => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, ch);
  };
  // Calle
  fill(0, 28, W - 1, 28, '=');
  fill(0, 29, W - 1, 29, '#');
  // Edificio de Altamar: muros exteriores y entrada
  fill(16, 2, 16, 27, '#');
  fill(56, 2, 56, 27, '#');
  put(16, 26, '.');
  put(16, 27, '.');
  // Losas: piso 2, piso 3 y azotea
  fill(17, 21, 55, 21, '=');
  fill(17, 14, 55, 14, '=');
  fill(16, 7, 56, 7, '=');
  // Escaleras (cada piso se cruza entero para llegar a la siguiente)
  fill(50, 21, 50, 27, 'H');
  fill(20, 14, 20, 20, 'H');
  fill(52, 7, 52, 13, 'H');
  // Lobby: mostrador, barriles y estante con el acta en alto
  fill(27, 27, 28, 27, 'm');
  fill(30, 26, 31, 27, 'b');
  fill(33, 24, 34, 24, 'm');
  fill(33, 25, 34, 27, 'e');
  put(38, 27, 'o');
  put(44, 27, 'x');
  put(22, 24, 'w');
  put(40, 24, 'w');
  // Piso 2: puerta cerrada con muro encima, escombros y ventanas
  fill(35, 15, 35, 18, '#');
  put(35, 19, 'D');
  put(35, 20, 'D');
  put(42, 20, 'x');
  put(43, 20, 'x');
  put(26, 17, 'w');
  put(46, 17, 'w');
  put(30, 20, 'o');
  // Piso 3: losa rota (hueco de dos), tubería y barril
  put(30, 14, '.');
  put(31, 14, '.');
  fill(22, 9, 51, 9, 'p');
  put(40, 13, 'b');
  put(28, 12, 'w');
  put(45, 12, 'w');
  // Azotea: tanque con válvula, panel solar y cartel
  fill(24, 4, 26, 6, 't');
  put(27, 6, 'V');
  fill(40, 6, 42, 6, 's');
  put(48, 6, 'c');
  return g;
}

const ACTA = { x: 33, y: 23 };
const PILAR = { x: 19, y: 28 };
const INICIO = { x: 4, y: 28 };

type Objetivo = 'acta' | 'puerta' | 'valvula' | 'fin';

export class LateralScene extends Phaser.Scene {
  private cfg!: LateralData;
  private keys: KeyMap | null = null;
  private jumpKeys: Phaser.Input.Keyboard.Key[] = [];
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerKey = '';
  private pilar!: Phaser.GameObjects.Sprite;
  private acta?: Phaser.GameObjects.Container;
  private facing: 'left' | 'right' = 'right';
  private climbing = false;
  private coyote = 0;
  private jumpBuffer = 0;
  private jumpHeld = false;
  private wasOnFloor = false;
  private fallStartY = 0;
  private tieneActa = false;
  private objetivo: Objetivo = 'acta';
  private saltos = 0;
  private caidas = 0;
  private t0 = 0;
  private terminado = false;
  private ui!: LateralUi;
  private fondoLejos!: Phaser.GameObjects.TileSprite;
  private fondoCerca!: Phaser.GameObjects.TileSprite;
  private touchPrev = { jump: false, a: false };
  private ultimoAvisoPuerta = 0;

  constructor() {
    super({ key: 'Lateral' });
  }

  init(data: LateralData): void {
    this.cfg = data;
  }

  create(): void {
    const estilo = estiloActivo();
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[1]);
    this.physics.world.gravity.y = 900;
    this.physics.world.setBounds(0, 0, W * TILE_SIZE, H * TILE_SIZE);

    this.crearFondo();

    // --- Mapa
    const nivel = construirNivel();
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: W,
      height: H,
    });
    const tilesKey = this.textures.exists('tiles-altamar-ceniza')
      ? 'tiles-altamar-ceniza'
      : 'tiles-provisional-ceniza';
    const tileset = map.addTilesetImage('t', tilesKey, TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) throw new Error('No se pudo crear el tileset de la prueba lateral');
    const layer = map.createBlankLayer('nivel', tileset, 0, 0);
    if (!layer) throw new Error('No se pudo crear la capa de la prueba lateral');
    this.layer = layer;
    // Interior del edificio: un plano oscuro detrás de los tiles, bajo la azotea.
    this.add
      .rectangle(17 * TILE_SIZE, 8 * TILE_SIZE, 39 * TILE_SIZE, 20 * TILE_SIZE, 0x2a2930)
      .setOrigin(0, 0)
      .setDepth(-1);
    const solidos: number[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const ch = nivel[y]![x]!;
        const def = LEYENDA[ch];
        if (!def) continue;
        layer.putTileAt(def.idx, x, y);
        if (def.solido && !solidos.includes(def.idx)) solidos.push(def.idx);
      }
    }
    layer.setCollision(solidos);
    // El tile superior de cada escalera es una plataforma de un solo sentido: se pisa desde
    // arriba y se atraviesa trepando (mientras se trepa no se comprueba el suelo).
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if (nivel[y]![x] === 'H' && nivel[y - 1]?.[x] !== 'H') {
          layer.getTileAt(x, y)?.setCollision(false, false, true, false, true);
        }
      }
    }
    layer.setDepth(1);

    // --- Jugador
    this.playerKey = bakeCharacter(this, 'renata');
    this.player = this.physics.add
      .sprite(INICIO.x * TILE_SIZE + 8, INICIO.y * TILE_SIZE, this.playerKey, 'right-0')
      .setOrigin(0.5, 1)
      .setDepth(5);
    this.player.body?.setSize(10, 20).setOffset(3, 4);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, layer);
    layer.setTileIndexCallback(IDX.puerta, () => this.tocarPuerta(), this);

    // --- Pilar y el acta
    const pilarKey = bakeCharacter(this, 'pilar');
    this.pilar = this.add
      .sprite(PILAR.x * TILE_SIZE + 8, PILAR.y * TILE_SIZE, pilarKey, 'right-0')
      .setOrigin(0.5, 1)
      .setDepth(4);
    this.acta = this.crearActa(ACTA.x * TILE_SIZE + 8, ACTA.y * TILE_SIZE + 12);

    // --- Cámara
    this.cameras.main.setBounds(0, 0, W * TILE_SIZE, H * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setDeadzone(60, 40);

    // --- Luz del estilo
    const luz = estilo.luz.ceniza;
    if (luz.alpha > 0) {
      this.add
        .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, parseInt(luz.color.slice(1), 16), luz.alpha)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(15000);
    }

    // --- Entrada
    this.keys = createKeyMap(this);
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.jumpKeys = [kb.addKey(K.SPACE, false), kb.addKey(K.K, false)];
    }
    this.input.addPointer(2);

    // --- Interfaz DOM (objetivo, cifras, mensajes, mando táctil)
    this.ui = new LateralUi(Boolean(this.sys.game.device.input.touch));
    this.events.once('shutdown', () => this.ui.destruir());
    this.actualizarObjetivo();
    this.t0 = this.time.now;
    this.mostrar(
      'Prueba lateral: llega a la válvula de la azotea. Flechas o A/D para moverte, espacio o ' +
        'arriba para saltar, arriba/abajo en las escaleras, E para hablar.',
      6000,
    );
  }

  // ------------------------------------------------------------------ construcción

  private crearFondo(): void {
    const mk = (key: string, lejos: boolean): void => {
      if (this.textures.exists(key)) return;
      const tex = this.textures.createCanvas(key, GAME_WIDTH, GAME_HEIGHT);
      if (!tex) return;
      const c = tex.getContext();
      if (lejos) {
        const g = c.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        g.addColorStop(0, '#2e2d33');
        g.addColorStop(0.7, '#4a4850');
        g.addColorStop(1, '#6f6c76');
        c.fillStyle = g;
        c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // Siluetas lejanas: torres del Litoral a contraluz
        c.fillStyle = '#2e2d33';
        let x = 0;
        let i = 0;
        while (x < GAME_WIDTH) {
          const w = 18 + ((i * 37) % 30);
          const h = 40 + ((i * 53) % 70);
          c.fillRect(x, GAME_HEIGHT - h, w, h);
          if (i % 3 === 0) c.fillRect(x + 4, GAME_HEIGHT - h - 6, 4, 6);
          x += w + 6 + ((i * 11) % 9);
          i++;
        }
      } else {
        c.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // Palmas y postes más cercanos
        c.fillStyle = '#1b1b1f';
        for (let i = 0; i < 9; i++) {
          const x = 20 + i * 54 + ((i * 17) % 13);
          const h = 60 + ((i * 29) % 40);
          c.fillRect(x, GAME_HEIGHT - h, 3, h);
          for (let k = 0; k < 5; k++) {
            const a = -0.9 + k * 0.45;
            c.beginPath();
            c.moveTo(x + 1, GAME_HEIGHT - h);
            c.lineTo(x + 1 + Math.cos(a) * 16, GAME_HEIGHT - h + Math.sin(a) * 10 + 2);
            c.lineTo(x + 1 + Math.cos(a) * 10, GAME_HEIGHT - h + Math.sin(a) * 6 + 5);
            c.closePath();
            c.fill();
          }
        }
      }
      tex.refresh();
    };
    mk('lateral-fondo-lejos', true);
    mk('lateral-fondo-cerca', false);
    this.fondoLejos = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'lateral-fondo-lejos')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-3);
    this.fondoCerca = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'lateral-fondo-cerca')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-2)
      .setAlpha(0.55);
  }

  private crearActa(x: number, y: number): Phaser.GameObjects.Container {
    const papel = this.add.rectangle(0, 0, 8, 10, 0xf3ead8).setStrokeStyle(1, 0x1b1b1f);
    const sello = this.add.rectangle(1, 2, 3, 3, 0xe2b94a);
    const linea = this.add.rectangle(-1, -2, 4, 1, 0x6f6c76);
    const c = this.add.container(x, y, [papel, linea, sello]).setDepth(4);
    this.tweens.add({ targets: c, y: y - 3, duration: 900, yoyo: true, repeat: -1 });
    return c;
  }

  // ------------------------------------------------------------------ bucle

  override update(time: number, delta: number): void {
    if (this.terminado) {
      const inp = readInput(this.keys);
      const t = this.ui.presionado;
      if (inp.interact || (t.jump && !this.touchPrev.jump) || (t.a && !this.touchPrev.a)) {
        this.scene.restart(this.cfg);
      }
      this.touchPrev = { jump: t.jump, a: t.a };
      return;
    }
    this.fondoLejos.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.fondoCerca.tilePositionX = this.cameras.main.scrollX * 0.5;
    this.fondoLejos.tilePositionY = this.cameras.main.scrollY * 0.1;

    const inp = readInput(this.keys);
    const t = this.ui.presionado;
    let dx = inp.dx;
    let dy = inp.dy;
    if (t.left) dx = -1;
    if (t.right) dx = 1;
    const saltoTecla = this.jumpKeys.some((k) => k.isDown) || dy < 0;
    const saltoAhora = saltoTecla || t.jump;
    const saltoFlanco = saltoAhora && !this.jumpHeld;
    this.jumpHeld = saltoAhora;
    if (t.jump && !this.touchPrev.jump) dy = Math.min(dy, -1);
    const interact = inp.interact || (t.a && !this.touchPrev.a);
    this.touchPrev = { jump: t.jump, a: t.a };

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const enSuelo = body.blocked.down || body.touching.down;
    const enEscalera = this.enEscalera();
    const dt = delta / 1000;

    // Coyote y búfer de salto: perdonan un poco el tiempo
    this.coyote = enSuelo ? 0.1 : Math.max(0, this.coyote - dt);
    this.jumpBuffer = saltoFlanco ? 0.12 : Math.max(0, this.jumpBuffer - dt);

    // Escaleras
    if (enEscalera && (dy !== 0 || this.climbing)) {
      if (!this.climbing && dy > 0 && enSuelo && !this.escaleraDebajo()) {
        // En el suelo, sin escalera debajo: abajo no hace nada.
      } else {
        this.climbing = true;
        body.checkCollision.down = false;
        body.setAllowGravity(false);
        body.setVelocity(dx * 60, dy * 70);
      }
    }
    if (!this.climbing || !enEscalera) {
      this.climbing = false;
      body.checkCollision.down = true;
      body.setAllowGravity(true);
      const vel = inp.run ? 130 : 90;
      body.setVelocityX(dx * vel);
    }
    if (this.climbing && saltoFlanco && dx !== 0) {
      this.climbing = false;
      body.checkCollision.down = true;
      body.setAllowGravity(true);
      body.setVelocityY(-200);
      this.saltos++;
    }
    if (!this.climbing && this.jumpBuffer > 0 && this.coyote > 0) {
      body.setVelocityY(-270);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.saltos++;
      getBus().emit('audio:sfx', { name: 'tecla' });
    }
    // Salto corto si se suelta antes (un toque sigue dando un tile largo)
    if (!saltoAhora && body.velocity.y < -170) body.setVelocityY(-170);

    // Caídas largas (contadas para el informe)
    if (this.wasOnFloor && !enSuelo) this.fallStartY = this.player.y;
    if (!this.wasOnFloor && enSuelo && this.player.y - this.fallStartY > 3.5 * TILE_SIZE) {
      this.caidas++;
    }
    this.wasOnFloor = enSuelo;

    // Animación
    if (dx < 0) this.facing = 'left';
    if (dx > 0) this.facing = 'right';
    const k = this.playerKey;
    if (this.climbing) {
      if (dy !== 0 || dx !== 0) this.player.play(`${k}-walk-up`, true);
      else {
        this.player.anims.stop();
        this.player.setFrame('up-0');
      }
    } else if (!enSuelo) {
      this.player.anims.stop();
      this.player.setFrame(`${this.facing}-1`);
    } else if (dx !== 0) {
      this.player.play(`${k}-walk-${this.facing}`, true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(`${this.facing}-0`);
    }

    // Interacciones
    if (interact) this.interactuar();
    this.recogerActa();
    this.tocarValvula();

    // Cifras
    const s = Math.floor((time - this.t0) / 1000);
    this.ui.cifras(
      `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} · ${this.saltos} saltos · ${this.caidas} caídas`,
    );
  }

  private enEscalera(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const cx = body.center.x;
    const puntos = [body.center.y, body.bottom - 2, body.bottom + 3];
    return puntos.some((py) => this.layer.getTileAtWorldXY(cx, py)?.index === IDX.escalera);
  }

  /** Escalera justo bajo los pies (para empezar a bajar desde una plataforma). */
  private escaleraDebajo(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    return this.layer.getTileAtWorldXY(body.center.x, body.bottom + 3)?.index === IDX.escalera;
  }

  // ------------------------------------------------------------------ mundo

  private interactuar(): void {
    const d = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.pilar.x,
      this.pilar.y,
    );
    if (d < 24) {
      this.pilar.setFrame(this.player.x < this.pilar.x ? 'left-0' : 'right-0');
      this.mostrar(
        this.tieneActa
          ? 'Pilar: Con el acta, la puerta del segundo piso cede. La válvula está en la azotea, junto al tanque.'
          : 'Pilar: La válvula está arriba, en la azotea. Marrugo cerró la puerta del segundo piso en el Año 3: solo la abre el acta de la asamblea. Estaba en el archivo del lobby, en el estante alto.',
        5500,
      );
      return;
    }
    // Cartel de la azotea
    const t = this.layer.getTileAtWorldXY(this.player.x, this.player.y - 8);
    if (t?.index === IDX.cartel) {
      this.mostrar(
        'Tanque de Altamar · 40 m³ · Válvula general. Manipular solo por acuerdo de la asamblea.',
        4500,
      );
    }
  }

  private recogerActa(): void {
    if (!this.acta) return;
    const d = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y - 10,
      this.acta.x,
      this.acta.y,
    );
    if (d > 14) return;
    this.acta.destroy();
    this.acta = undefined;
    this.tieneActa = true;
    this.objetivo = 'puerta';
    this.actualizarObjetivo();
    getBus().emit('audio:sfx', { name: 'evidencia' });
    this.mostrar(
      'Acta de la asamblea del Año 1 (copia). Con esto la puerta del segundo piso debería ceder.',
      4500,
    );
  }

  private tocarPuerta(): void {
    if (this.tieneActa) {
      this.layer.removeTileAt(35, 19);
      this.layer.removeTileAt(35, 20);
      this.objetivo = 'valvula';
      this.actualizarObjetivo();
      getBus().emit('audio:sfx', { name: 'confirmar' });
      this.mostrar('La puerta cede. Arriba, al final del pasillo, la escalera de la azotea.', 4000);
      return;
    }
    const now = this.time.now;
    if (now - this.ultimoAvisoPuerta < 2500) return;
    this.ultimoAvisoPuerta = now;
    getBus().emit('audio:sfx', { name: 'cancelar' });
    this.mostrar(
      'Cerrada. Un aviso de la administración: «Solo con acta de la asamblea». Pilar sabe dónde está.',
      3500,
    );
  }

  private tocarValvula(): void {
    const t = this.layer.getTileAtWorldXY(this.player.x, this.player.y - 8);
    if (t?.index !== IDX.valvula) return;
    this.terminado = true;
    this.objetivo = 'fin';
    this.actualizarObjetivo();
    this.player.setVelocity(0, 0);
    (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    getBus().emit('audio:sfx', { name: 'hito' });
    const s = Math.floor((this.time.now - this.t0) / 1000);
    const resumen = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} · ${this.saltos} saltos · ${this.caidas} caídas`;
    this.ui.terminar(
      `<div><b>Válvula abierta.</b><br>${resumen}<br><br>Enter, E o el botón para repetir.</div>`,
    );
  }

  private actualizarObjetivo(): void {
    const texto: Record<Objetivo, string> = {
      acta: 'Objetivo: el acta de la asamblea, en el archivo del lobby (estante alto).',
      puerta: 'Objetivo: la puerta cerrada del segundo piso.',
      valvula: 'Objetivo: la válvula del tanque, en la azotea.',
      fin: 'Prueba terminada.',
    };
    this.ui.objetivo(texto[this.objetivo]);
  }

  private mostrar(texto: string, ms: number): void {
    this.ui.mostrar(texto, ms);
  }
}
