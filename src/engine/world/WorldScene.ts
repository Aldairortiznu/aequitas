import Phaser from 'phaser';
import type { MapState, TiledMap } from '../../core/content/schema';
import { BALANCE } from '../../core/balance';
import { getBus } from '../../core/bus';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE, TILE_SIZE } from '../../config';
import {
  bakeAll,
  bakeCharacter,
  bakeCharacterLook,
  lookDesdePersonalizado,
} from '../art/provisional';
import type { Jugador } from '../../core/jugador';
import { claveSprite } from '../../core/jugador';
import { estiloActivo } from '../art/estilo';
import { createKeyMap, readInput } from '../input';
import type { KeyMap } from '../input';
import { Companions } from './Companions';
import { capasPara } from '../audio/synth';
import { Patrol } from './Patrol';
import { findSpawn, parseObjects } from './objects';
import type { WorldObject } from './objects';
import { GRAVEDAD, VELOCIDAD_TREPAR, esLateral, hayEscalera, instalarEscaleras } from './lateral';
import { crearFondoLateral } from '../art/fondoLateral';
import type { FondoLateral } from '../art/fondoLateral';

/** Datos con los que la app arranca o reinicia la escena del mundo. */
export interface WorldSceneData {
  episodeId: string;
  mapKey: string;
  map: TiledMap;
  spawn: string;
  mapState: MapState;
  party: string[];
  /** Nombres de objetos que no deben aparecer (evidencias recogidas, folios leídos, patrullas interpeladas). */
  hidden: string[];
  /** Personajes cuyo sprite hay que hornear (npcs del mapa + grupo). */
  characters: string[];
  /** Quien juega: decide la textura del jugador. */
  jugador: Jugador;
  debug?: boolean;
}

type Dir = 'down' | 'left' | 'right' | 'up';

interface Interactable {
  obj: WorldObject;
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null;
}

export class WorldScene extends Phaser.Scene {
  static readonly KEY = 'World';

  private cfg!: WorldSceneData;
  private keys: KeyMap | null = null;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerKey = 'char-renata';
  private dir: Dir = 'down';
  private companions!: Companions;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private tilesetName = 'provisional';
  private layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  private objects: WorldObject[] = [];
  private interactables: Interactable[] = [];
  private zones: { obj: WorldObject; rect: Phaser.Geom.Rectangle; inside: boolean }[] = [];
  private patrols: Patrol[] = [];
  private focus: Interactable | null = null;
  private focusIcon!: Phaser.GameObjects.Image;
  private marker!: Phaser.GameObjects.Image;
  private luz!: Phaser.GameObjects.Rectangle;
  private objetivo: { mapa: string; objeto: string } | null = null;
  /** Vista lateral (D15): gravedad, escaleras, puertas que se abren con la acción. */
  private lateral = false;
  private escaleras = new Set<string>();
  private trepando = false;
  private fondo: FondoLateral | null = null;
  private uiOpen = false;
  private frozen = false;
  /** Instante (performance.now) hasta el que se ignoran pulsaciones tras cerrar un panel. */
  private ignoreInputBefore = 0;
  private unsubscribe: (() => void)[] = [];

  constructor() {
    super({ key: WorldScene.KEY });
  }

  init(data: WorldSceneData): void {
    this.cfg = data;
    this.uiOpen = false;
    this.frozen = false;
    this.layers = {};
    this.interactables = [];
    this.zones = [];
    this.patrols = [];
    this.focus = null;
    this.lateral = false;
    this.escaleras = new Set();
    this.trepando = false;
    this.fondo = null;
  }

  create(): void {
    const d = this.cfg;
    bakeAll(
      this,
      [
        'renata',
        d.jugador.preset === 'custom' ? 'renata' : d.jugador.preset,
        'alguacil',
        ...d.characters,
        ...d.party,
      ],
      [d.map.tilesets[0]?.name ?? 'provisional'],
    );
    this.cameras.main.setBackgroundColor(PALETTE.ceniza[0]);
    this.cameras.main.roundPixels = true;

    // --- Mapa
    const cacheKey = `map-${d.episodeId}-${d.mapKey}`;
    if (!this.cache.tilemap.exists(cacheKey)) {
      this.cache.tilemap.add(cacheKey, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: d.map });
    }
    this.tilemap = this.make.tilemap({ key: cacheKey });
    const tsName = d.map.tilesets[0]?.name ?? 'provisional';
    this.tilesetName = tsName;
    const tileset = this.tilemap.addTilesetImage(
      tsName,
      this.tilesKey(tsName, d.mapState),
      TILE_SIZE,
      TILE_SIZE,
      0,
      0,
    );
    if (!tileset) throw new Error(`No se pudo crear el tileset ${tsName}`);
    this.tileset = tileset;
    const depthOf: Record<string, number> = {
      suelo: 0,
      'deco-baja': 1,
      colision: 2,
      'deco-alta': 10000,
    };
    for (const name of ['suelo', 'deco-baja', 'colision', 'deco-alta']) {
      if (!d.map.layers.some((l) => l.name === name && l.type === 'tilelayer')) continue;
      const layer = this.tilemap.createLayer(name, tileset, 0, 0);
      if (!layer) continue;
      layer.setDepth(depthOf[name] ?? 0);
      this.layers[name] = layer;
    }
    const colision = this.layers.colision;
    if (colision) {
      colision.setVisible(false);
      colision.setCollisionByExclusion([-1, 0]);
    }
    this.lateral = esLateral(d.map);
    this.physics.world.gravity.y = this.lateral ? GRAVEDAD : 0;
    if (this.lateral) this.escaleras = instalarEscaleras(this.layers, colision);
    // Capas de decorado por estado (`deco-ceniza`, `deco-verdor`, …), si el mapa las trae.
    for (const l of d.map.layers) {
      if (l.type === 'tilelayer' && l.name.startsWith('deco-') && !(l.name in depthOf)) {
        const layer = this.tilemap.createLayer(l.name, tileset, 0, 0);
        if (layer) {
          layer.setDepth(1.5);
          layer.setVisible(l.name === `deco-${d.mapState}`);
          this.layers[l.name] = layer;
        }
      }
    }

    // --- Objetos
    this.objects = parseObjects(d.map);
    const spawn =
      findSpawn(this.objects, d.spawn) ?? findSpawn(this.objects, 'inicio') ?? this.objects[0];
    const sx = spawn ? spawn.cx : 32;
    const sy = spawn ? spawn.cy + 8 : 32;

    // --- Jugador (D10: preset con textura `char-<preset>` o aspecto personalizado horneado)
    const j = d.jugador;
    this.playerKey =
      j.preset === 'custom' && j.custom
        ? bakeCharacterLook(this, claveSprite(j), lookDesdePersonalizado(j.custom))
        : bakeCharacter(this, j.preset === 'custom' ? 'renata' : j.preset);
    this.player = this.physics.add
      .sprite(sx, sy, this.playerKey, this.lateral ? 'right-0' : 'down-0')
      .setOrigin(0.5, 1);
    if (this.lateral) {
      this.dir = 'right';
      this.player.body?.setSize(10, 20).setOffset(3, 4);
    } else {
      this.player.body?.setSize(10, 8).setOffset(3, 16);
    }
    this.player.setCollideWorldBounds(true);
    if (colision) this.physics.add.collider(this.player, colision);

    // --- Compañeros
    this.companions = new Companions(this, d.party, sx, sy);

    // --- Interactuables, zonas y patrullas
    const hidden = new Set(d.hidden);
    for (const obj of this.objects) {
      if (hidden.has(obj.name)) continue;
      switch (obj.type) {
        case 'npc':
          this.addNpc(obj);
          break;
        case 'evidence':
          this.addPickup(obj, 'icon-documento');
          break;
        case 'folio':
          this.addPickup(obj, 'icon-folio');
          break;
        case 'atril':
        case 'mesa':
        case 'mecanismo':
        case 'letrero':
          this.interactables.push({ obj, sprite: null });
          break;
        case 'door':
          if (this.lateral) {
            this.interactables.push({ obj, sprite: null });
            break;
          }
          this.zones.push({
            obj,
            rect: new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width || 16, obj.height || 16),
            inside: false,
          });
          break;
        case 'trigger':
          this.zones.push({
            obj,
            rect: new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width || 16, obj.height || 16),
            inside: false,
          });
          break;
        case 'patrol':
          this.patrols.push(new Patrol(this, obj, (p) => this.onPatrolDetect(p), d.debug));
          break;
        default:
          break;
      }
    }

    // --- Cámara y límites
    const w = this.tilemap.widthInPixels;
    const h = this.tilemap.heightInPixels;
    this.physics.world.setBounds(0, 0, w, h);
    this.cameras.main.setBounds(0, 0, Math.max(w, GAME_WIDTH), Math.max(h, GAME_HEIGHT));
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    if (w < GAME_WIDTH || h < GAME_HEIGHT) {
      this.cameras.main.centerOn(w / 2, h / 2);
      this.cameras.main.stopFollow();
    }

    // --- Luz de la escena y partículas ambientales (según el estilo)
    const interior = d.map.properties?.some((p) => p.name === 'interior' && p.value === 'true');
    this.luz = this.add
      .rectangle(0, 0, GAME_WIDTH * 2, GAME_HEIGHT * 2, 0x000000, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(15000);
    this.aplicarLuz(d.mapState, Boolean(interior));
    if (this.lateral) {
      const region = d.map.properties?.find((p) => p.name === 'region')?.value;
      this.fondo = crearFondoLateral(this, {
        region: typeof region === 'string' ? region : 'provisional',
        estado: d.mapState,
        interior: Boolean(interior),
        ancho: this.tilemap.widthInPixels,
        alto: this.tilemap.heightInPixels,
      });
    }
    if (estiloActivo().texturaTiles) {
      // Viñeta: oscurece suavemente los bordes de la pantalla
      if (!this.textures.exists('vineta')) {
        const tex = this.textures.createCanvas('vineta', GAME_WIDTH, GAME_HEIGHT);
        if (tex) {
          const c = tex.getContext();
          const g = c.createRadialGradient(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_HEIGHT * 0.4,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH * 0.75,
          );
          g.addColorStop(0, 'rgba(27,27,31,0)');
          g.addColorStop(1, 'rgba(27,27,31,0.62)');
          c.fillStyle = g;
          c.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
          tex.refresh();
        }
      }
      this.add.image(0, 0, 'vineta').setOrigin(0, 0).setScrollFactor(0).setDepth(15001);
    }
    if (estiloActivo().particulas && !interior) {
      const w = this.tilemap.widthInPixels;
      const h = this.tilemap.heightInPixels;
      const region = d.map.properties?.find((p) => p.name === 'region')?.value;
      const luciernagas = region === 'cienaga' || region === 'gimnasio' || region === 'provisional';
      this.add
        .particles(0, 0, 'px', {
          x: { min: 0, max: w },
          y: { min: 0, max: h },
          lifespan: { min: 4000, max: 9000 },
          speedX: { min: -4, max: 4 },
          speedY: luciernagas ? { min: -6, max: 2 } : { min: 2, max: 8 },
          scale: { start: 1, end: luciernagas ? 1.5 : 0.5 },
          alpha: { start: 0, end: 0, ease: 'Sine.easeInOut' },
          tint: luciernagas ? 0xf4dc8a : 0xf3ead8,
          quantity: 1,
          frequency: luciernagas ? 900 : 500,
          maxParticles: luciernagas ? 18 : 40,
          blendMode: luciernagas ? 'ADD' : 'NORMAL',
        })
        .setDepth(14000);
    }
    this.focusIcon = this.add.image(0, 0, 'icon-hablar').setVisible(false).setDepth(20000);
    this.marker = this.add.image(0, 0, 'icon-objetivo').setVisible(false).setDepth(19999);
    this.tweens.add({
      targets: this.marker,
      y: '-=4',
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.keys = createKeyMap(this);

    // --- Bus
    const bus = getBus();
    const onUiOpen = (): void => {
      this.uiOpen = true;
      this.player.setVelocity(0, 0);
    };
    const onUiClose = (): void => {
      this.uiOpen = false;
      this.ignoreInputBefore = performance.now() + 150;
    };
    const onFreeze = (e: { frozen: boolean }): void => {
      this.frozen = e.frozen;
      if (e.frozen) this.player.setVelocity(0, 0);
    };
    const onMapState = (e: { map: string; state: MapState }): void => {
      if (e.map === d.mapKey) this.setMapState(e.state);
    };
    const onHide = (e: { name: string }): void => this.hideObject(e.name);
    const onObjetivo = (e: { mapa: string; objeto: string } | null): void => this.setObjetivo(e);
    const onPatrolResolved = (e: { name: string; outcome: 'interpelada' | 'detenida' }): void => {
      const p = this.patrols.find((x) => x.name === e.name);
      if (!p) return;
      if (e.outcome === 'interpelada') p.markInterpelada();
      else p.resume();
    };
    bus.on('ui:opened', onUiOpen);
    bus.on('ui:closed', onUiClose);
    bus.on('world:freeze', onFreeze);
    bus.on('world:setMapState', onMapState);
    bus.on('world:hideObject', onHide);
    bus.on('world:objetivo', onObjetivo);
    bus.on('world:patrolResolved', onPatrolResolved);
    this.unsubscribe = [
      () => bus.off('ui:opened', onUiOpen),
      () => bus.off('ui:closed', onUiClose),
      () => bus.off('world:freeze', onFreeze),
      () => bus.off('world:setMapState', onMapState),
      () => bus.off('world:hideObject', onHide),
      () => bus.off('world:objetivo', onObjetivo),
      () => bus.off('world:patrolResolved', onPatrolResolved),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const u of this.unsubscribe) u();
      this.unsubscribe = [];
    });

    bus.emit('world:ready', { episodeId: d.episodeId, map: d.mapKey });
    const musica = d.map.properties?.find((p) => p.name === 'musica')?.value;
    if (typeof musica === 'string')
      bus.emit('audio:music', { pista: musica, capas: capasPara(d.mapState) });
  }

  private addNpc(obj: WorldObject): void {
    const id = obj.props.personaje ?? 'vecino';
    const key = bakeCharacter(this, id);
    const facing = (obj.props.mirando ?? 'abajo') as string;
    const dir: Dir =
      facing === 'izquierda'
        ? 'left'
        : facing === 'derecha'
          ? 'right'
          : facing === 'arriba' && !this.lateral
            ? 'up'
            : 'down';
    const s = this.physics.add.staticSprite(obj.cx, obj.cy + 8, key, `${dir}-0`).setOrigin(0.5, 1);
    s.body?.setSize(12, 10).setOffset(2, 14);
    s.refreshBody();
    s.setDepth(s.y);
    // En vista lateral la gente no tapona el pasillo: se pasa por delante.
    if (!this.lateral) this.physics.add.collider(this.player, s);
    this.interactables.push({ obj, sprite: s });
  }

  private addPickup(obj: WorldObject, icon: string): void {
    const s = this.add.image(obj.cx, obj.cy, icon).setDepth(obj.cy);
    this.tweens.add({
      targets: s,
      y: obj.cy - 2,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.interactables.push({ obj, sprite: s });
  }

  /**
   * Marcador del objetivo guiado: sobre el objeto destino si está en este mapa; si no, sobre
   * la puerta que lleva a ese mapa (o a cualquier mapa, como pista de salida).
   */
  private setObjetivo(dest: { mapa: string; objeto: string } | null): void {
    this.objetivo = dest;
    if (!dest) {
      this.marker.setVisible(false);
      return;
    }
    let target: WorldObject | undefined;
    if (dest.mapa === this.cfg.mapKey) {
      target = this.objects.find((o) => o.name === dest.objeto);
      // Un objeto ya retirado (evidencia recogida) no se marca.
      if (target && (target.type === 'evidence' || target.type === 'folio'))
        if (!this.interactables.some((i) => i.obj.name === dest.objeto)) target = undefined;
    } else {
      const doors = this.objects.filter((o) => o.type === 'door');
      target =
        doors.find((o) => o.props.map === dest.mapa) ??
        doors.find((o) => o.props.map !== this.cfg.mapKey);
    }
    if (!target) {
      this.marker.setVisible(false);
      return;
    }
    const y = target.type === 'npc' ? target.cy - 34 : target.cy - 22;
    this.marker.setVisible(true).setPosition(target.cx, y);
    this.tweens.killTweensOf(this.marker);
    this.tweens.add({
      targets: this.marker,
      y: y - 4,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hideObject(name: string): void {
    if (this.objetivo?.objeto === name) this.marker.setVisible(false);
    const i = this.interactables.findIndex((x) => x.obj.name === name);
    if (i >= 0) {
      this.interactables[i]?.sprite?.destroy();
      this.interactables.splice(i, 1);
      if (this.focus?.obj.name === name) this.focus = null;
    }
  }

  /** Clave de textura del tileset: real si existe, provisional si no. */
  private tilesKey(name: string, state: MapState): string {
    const real = `tiles-${name}-${state}`;
    if (this.textures.exists(real)) return real; // real o provisional de la región
    const realCeniza = `tiles-${name}-ceniza`;
    if (this.textures.exists(realCeniza)) return realCeniza;
    return `tiles-provisional-${state}`;
  }

  /** Cambia el estado visual del mapa (Reverdecer) sin recargar. */
  setMapState(state: MapState): void {
    const tex = this.textures.get(this.tilesKey(this.tilesetName, state));
    this.tileset.setImage(tex);
    for (const [name, layer] of Object.entries(this.layers)) {
      if (name.startsWith('deco-') && !['deco-baja', 'deco-alta'].includes(name))
        layer.setVisible(name === `deco-${state}`);
    }
    this.cfg.mapState = state;
    const interior = this.cfg.map.properties?.some(
      (p) => p.name === 'interior' && p.value === 'true',
    );
    this.aplicarLuz(state, Boolean(interior));
    this.cameras.main.flash(300, 0xf4, 0xdc, 0x8a, false);
  }

  /** Tinte de luz del estilo activo para el estado del mapa (más suave en interiores). */
  private aplicarLuz(state: MapState, interior: boolean): void {
    const luz = estiloActivo().luz[state];
    const color = parseInt(luz.color.replace('#', ''), 16);
    this.luz.setFillStyle(color, interior ? luz.alpha * 0.5 : luz.alpha);
  }

  private onPatrolDetect(p: Patrol): void {
    this.player.setVelocity(0, 0);
    getBus().emit('world:patrol', {
      name: p.name,
      rank: p.rank,
      articulo: p.articulo,
      map: this.cfg.mapKey,
    });
  }

  override update(_time: number, delta: number): void {
    const busy = this.uiOpen || this.frozen;
    if (busy) this.keys?.pressed.clear();
    const input = busy
      ? { dx: 0, dy: 0, run: false, interact: false, cancel: false }
      : readInput(this.keys, this.ignoreInputBefore);

    // Movimiento
    let vx = input.dx;
    let vy = input.dy;
    const len = Math.hypot(vx, vy);
    let moving = len > 0.01;
    if (this.lateral) {
      moving = this.moverLateral(input.dx, input.dy, input.run);
    } else if (moving) {
      vx /= len;
      vy /= len;
      const speed = input.run ? BALANCE.mundo.velocidadCorrer : BALANCE.mundo.velocidad;
      this.player.setVelocity(vx * speed, vy * speed);
      if (Math.abs(vx) > Math.abs(vy)) this.dir = vx > 0 ? 'right' : 'left';
      else this.dir = vy > 0 ? 'down' : 'up';
      this.player.play(`${this.playerKey}-walk-${this.dir}`, true);
    } else if (!this.lateral) {
      this.player.setVelocity(0, 0);
      this.player.play(`${this.playerKey}-idle-${this.dir}`, true);
    }
    this.player.setDepth(this.player.y);
    this.companions.update(this.player.x, this.player.y, this.dir, moving);

    // Zonas (puertas y disparadores)
    const px = this.player.x;
    const py = this.player.y - 4;
    for (const z of this.zones) {
      const inside = z.rect.contains(px, py);
      if (inside && !z.inside && !busy) {
        z.inside = true;
        if (z.obj.type === 'door') {
          getBus().emit('world:door', {
            name: z.obj.name,
            map: z.obj.props.mapa ?? '',
            spawn: z.obj.props.spawn ?? 'inicio',
            props: z.obj.props,
          });
        } else {
          getBus().emit('world:trigger', {
            name: z.obj.name,
            beat: z.obj.props.beat ?? '',
            props: z.obj.props,
          });
        }
      } else if (!inside) {
        z.inside = false;
      }
    }

    // Foco de interacción: el objeto más cercano en rango
    let best: Interactable | null = null;
    let bestD: number = BALANCE.mundo.rangoInteraccion;
    for (const it of this.interactables) {
      const d = Phaser.Math.Distance.Between(px, py, it.obj.cx, it.obj.cy);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    const companionId = best
      ? null
      : this.companions.nearest(px, py, BALANCE.mundo.rangoInteraccion - 4);
    this.focus = best;
    if (best && !busy) {
      this.focusIcon.setVisible(true).setPosition(best.obj.cx, best.obj.cy - 20);
    } else if (companionId && !busy) {
      const s = this.companions.list.find((c) => c.getData('id') === companionId);
      if (s) this.focusIcon.setVisible(true).setPosition(s.x, s.y - 30);
    } else {
      this.focusIcon.setVisible(false);
    }

    if (input.interact) {
      if (best && best.obj.type === 'door') {
        getBus().emit('world:door', {
          name: best.obj.name,
          map: best.obj.props.mapa ?? '',
          spawn: best.obj.props.spawn ?? 'inicio',
          props: best.obj.props,
        });
      } else if (best) {
        getBus().emit('world:interact', {
          kind: best.obj.type,
          id: best.obj.name,
          payload: best.obj.props,
        });
      } else if (companionId) {
        getBus().emit('world:interact', { kind: 'companion', id: companionId });
      }
    }
    if (input.cancel) getBus().emit('world:cancel');

    // Patrullas
    for (const p of this.patrols) p.update(delta, this.player.x, this.player.y, busy);
  }

  /**
   * Movimiento en vista lateral: izquierda y derecha con gravedad, arriba y abajo en las
   * escaleras; sin salto (D15). Devuelve si se está moviendo.
   */
  private moverLateral(dx: number, dy: number, run: boolean): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const enSuelo = body.blocked.down || body.touching.down;
    const cx = body.center.x;
    const enEscalera = hayEscalera(this.escaleras, cx, [
      body.center.y,
      body.bottom - 2,
      body.bottom + 3,
    ]);
    const escaleraDebajo = hayEscalera(this.escaleras, cx, [body.bottom + 3]);
    if (enEscalera && (dy !== 0 || this.trepando)) {
      if (!(!this.trepando && dy > 0 && enSuelo && !escaleraDebajo)) {
        this.trepando = true;
        body.checkCollision.down = false;
        body.setAllowGravity(false);
        body.setVelocity(dx * VELOCIDAD_TREPAR * 0.8, dy * VELOCIDAD_TREPAR);
      }
    }
    if (!this.trepando || !enEscalera) {
      this.trepando = false;
      body.checkCollision.down = true;
      body.setAllowGravity(true);
      const speed = run ? BALANCE.mundo.velocidadCorrer : BALANCE.mundo.velocidad;
      body.setVelocityX(dx * speed);
    }
    if (dx < 0) this.dir = 'left';
    if (dx > 0) this.dir = 'right';
    const k = this.playerKey;
    if (this.trepando) {
      if (dx !== 0 || dy !== 0) this.player.play(`${k}-walk-up`, true);
      else this.player.play(`${k}-idle-up`, true);
      return dx !== 0 || dy !== 0;
    }
    if (dx !== 0) {
      this.player.play(`${k}-walk-${this.dir}`, true);
      return true;
    }
    this.player.play(`${k}-idle-${this.dir}`, true);
    return false;
  }

  /** Posición del jugador (para guardar). */
  getPlayerTile(): { x: number; y: number } {
    return { x: Math.floor(this.player.x / TILE_SIZE), y: Math.floor(this.player.y / TILE_SIZE) };
  }
}
