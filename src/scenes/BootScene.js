// Arranque: carga los pocos tiles reales (Tuxemon, CC BY-SA 3.0), hornea todo el
// arte por código y pasa al menú.

import Phaser from 'phaser';
import { buildAequitasTextures, makePerson } from '../art/aequitasArt.js';
import { PEOPLE } from '../data/speakers.js';
import { HEROES, heroFor } from '../data/heroes.js';
import { applyToRegistry, loadSettings } from '../systems/settings.js';
import { setVolume, setMuted } from '../systems/audio.js';
import { loadSave } from '../systems/save.js';
import { setGender, setHeroName } from '../systems/text.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('rev_terrain', 'assets/tilesets/reverdecer_terrain.png');
    this.load.image('tx_tree', 'assets/tilesets/tux_tree.png');
    this.load.image('tx_flower', 'assets/tilesets/tux_flower.png');
    this.load.image('tx_rock', 'assets/tilesets/tux_rock.png');
    this.load.image('tx_sand', 'assets/tilesets/tux_sand.png');
  }

  create() {
    buildAequitasTextures(this);
    for (const [key, spec] of Object.entries(PEOPLE)) makePerson(this, key, spec, { walk: true });
    // Los cuatro enviados de la Biblioteca (para la pantalla de selección).
    for (const h of HEROES) makePerson(this, 'hero_' + h.id, h.spec, { walk: true });
    buildPlayer(this, loadSave());
    applyToRegistry(this.game);
    const s = loadSettings();
    setVolume(s.volume);
    setMuted(s.muted);
    this.scene.start('Menu');
  }
}

// Hornea el sprite del protagonista elegido y ajusta el trato de los textos.
export function buildPlayer(scene, save) {
  const hero = heroFor(save);
  setGender(save && save.gender ? save.gender : hero.trato);
  setHeroName(hero.name);
  makePerson(scene, 'player', hero.spec, { walk: true, back: true });
  return hero;
}
