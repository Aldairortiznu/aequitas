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
import { createKeyMap, readInput } from '../input';
import type { KeyMap } from '../input';
import { Companions } from './Companions';
import { capasPara } from '../audio/synth';
import { Patrol } from './Patrol';
import { findSpawn, parseObjects } from './objects';
import type { WorldObject } from './objects';

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
    this.player = this.physics.add.sprite(sx, sy, this.playerKey, 'down-0').setOrigin(0.5, 1);
    this.player.body?.setSize(10, 8).setOffset(3, 16);
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
          this.interactables.push({ obj, sprite: null });
          break;
        case 'door':
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

    this.focusIcon = this.add.image(0, 0, 'icon-hablar').setVisible(false).setDepth(20000);
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
    bus.on('world:patrolResolved', onPatrolResolved);
    this.unsubscribe = [
      () => bus.off('ui:opened', onUiOpen),
      () => bus.off('ui:closed', onUiClose),
      () => bus.off('world:freeze', onFreeze),
      () => bus.off('world:setMapState', onMapState),
      () => bus.off('world:hideObject', onHide),
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
          : facing === 'arriba'
            ? 'up'
            : 'down';
    const s = this.physics.add.staticSprite(obj.cx, obj.cy + 8, key, `${dir}-0`).setOrigin(0.5, 1);
    s.body?.setSize(12, 10).setOffset(2, 14);
    s.refreshBody();
    s.setDepth(s.y);
    this.physics.add.collider(this.player, s);
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

  private hideObject(name: string): void {
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
    this.cameras.main.flash(300, 0xf4, 0xdc, 0x8a, false);
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
    const moving = len > 0.01;
    if (moving) {
      vx /= len;
      vy /= len;
      const speed = input.run ? BALANCE.mundo.velocidadCorrer : BALANCE.mundo.velocidad;
      this.player.setVelocity(vx * speed, vy * speed);
      if (Math.abs(vx) > Math.abs(vy)) this.dir = vx > 0 ? 'right' : 'left';
      else this.dir = vy > 0 ? 'down' : 'up';
      this.player.play(`${this.playerKey}-walk-${this.dir}`, true);
    } else {
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
      if (best) {
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

  /** Posición del jugador (para guardar). */
  getPlayerTile(): { x: number; y: number } {
    return { x: Math.floor(this.player.x / TILE_SIZE), y: Math.floor(this.player.y / TILE_SIZE) };
  }
}
