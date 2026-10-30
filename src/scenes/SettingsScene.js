// Ajustes de AEQUITAS: dificultad (ayuda en las audiencias), velocidad de
// texto, volumen, silencio y vibración. Navegable con teclado, toque y los
// botones X/E del celular. Se abre desde el Menú o desde la Pausa (superpuesta).

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { vibrate } from '../systems/haptics.js';
import { GAME, COLORS } from '../config.js';
import { getSetting, setSetting, DIFFICULTY } from '../systems/settings.js';
import { sfx, setVolume, setMuted } from '../systems/audio.js';

const SPEED_LABELS = { 38: 'Lenta', 22: 'Normal', 12: 'Rápida' };
const DIFF_LABELS = { suave: 'Guiado', normal: 'Normal', intenso: 'Riguroso' };

export default class SettingsScene extends Phaser.Scene {
  constructor() { super({ key: 'Settings', cameras: CAMERA }); }

  init(data) {
    this.returnScene = (data && data.returnScene) || 'Menu';
    this.pausedReturn = !!(data && data.pausedReturn);
    this.save = data && data.save;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    const hx = (h) => Phaser.Display.Color.HexStringToColor(h).color;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x06100b, this.pausedReturn ? 0.8 : 1).setOrigin(0).setDepth(0);
    if (!this.pausedReturn) {
      const bg = this.add.graphics().setDepth(0);
      bg.fillGradientStyle(hx('#2a1d3a'), hx('#2a1d3a'), hx('#16303a'), hx('#16303a'), 0.6); bg.fillRect(0, 0, WIDTH, HEIGHT);
    }

    const pw = 300, ph = 204, px = WIDTH / 2 - pw / 2, py = HEIGHT / 2 - ph / 2;
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d1820, 0.96); g.fillRoundedRect(px, py, pw, ph, 8);
    g.lineStyle(2, hx(COLORS.gold), 0.9); g.strokeRoundedRect(px, py, pw, ph, 8);
    this.add.text(WIDTH / 2, py + 16, 'Ajustes', { fontFamily: 'Georgia, serif', fontSize: '15px', color: COLORS.gold }).setOrigin(0.5).setDepth(2);

    this.rows = [
      { key: 'difficulty', label: 'Dificultad', kind: 'cycle', values: ['suave', 'normal', 'intenso'], show: (v) => DIFF_LABELS[v] },
      { key: 'textSpeed', label: 'Vel. de texto', kind: 'cycle', values: [38, 22, 12], show: (v) => SPEED_LABELS[v] },
      { key: 'volume', label: 'Volumen', kind: 'range', step: 0.1, show: (v) => Math.round(v * 100) + '%' },
      { key: 'muted', label: 'Silencio', kind: 'bool', show: (v) => (v ? 'Sí' : 'No') },
      { key: 'vibration', label: 'Vibración (celular)', kind: 'bool', show: (v) => (v !== false ? 'Sí' : 'No') },
      { key: '__back', label: 'Volver', kind: 'action', show: () => '' },
    ];
    this.selected = 0;
    this.texts = this.rows.map((r, i) => {
      const y = py + 40 + i * 23;
      const t = this.add.text(WIDTH / 2, y, '', { fontFamily: 'Georgia, serif', fontSize: '12px', color: COLORS.cream })
        .setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.selected = i; this.refresh(); });
      t.on('pointerdown', () => { this.selected = i; this.refresh(); r.key === '__back' ? this.back() : this.change(1); });
      return t;
    });
    // Glosa de la dificultad seleccionada.
    this.diffNote = this.add.text(WIDTH / 2, py + ph - 26, '', { fontFamily: 'monospace', fontSize: '7px', color: '#9bbfa6', align: 'center', wordWrap: { width: pw - 30 } }).setOrigin(0.5).setDepth(2);
    this.add.text(WIDTH / 2, py + ph - 12, '◀ ▶ cambiar   ·   X / E / Esc: volver', { fontFamily: 'monospace', fontSize: '8px', color: '#8fc79c' }).setOrigin(0.5).setDepth(2);
    this.refresh();

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-LEFT', () => this.change(-1));
    kb.on('keydown-RIGHT', () => this.change(1));
    kb.on('keydown-ENTER', () => this.activate());
    kb.on('keydown-SPACE', () => this.activate());
    kb.on('keydown-X', () => this.back());
    kb.on('keydown-E', () => this.back());
    kb.on('keydown-ESC', () => this.back());
  }

  move(d) { this.selected = Phaser.Math.Wrap(this.selected + d, 0, this.rows.length); this.refresh(); sfx('select'); }
  activate() { const r = this.rows[this.selected]; sfx('confirm'); r.key === '__back' ? this.back() : this.change(1); }

  change(dir) {
    const r = this.rows[this.selected];
    if (r.key === '__back') return this.back();
    if (r.kind === 'cycle') {
      const cur = getSetting(r.key);
      let i = r.values.indexOf(cur); i = Phaser.Math.Wrap(i + dir, 0, r.values.length);
      setSetting(r.key, r.values[i]);
      this.registry.set(r.key, r.values[i]);
    } else if (r.kind === 'range') {
      let v = Math.round((getSetting('volume') + dir * r.step) * 100) / 100;
      v = Math.min(1, Math.max(0, v));
      setSetting('volume', v); this.registry.set('volume', v); setVolume(v);
      if (getSetting('muted') && v > 0) { setSetting('muted', false); this.registry.set('muted', false); setMuted(false); }
    } else if (r.kind === 'bool' && r.key === 'muted') {
      const v = !getSetting('muted');
      setSetting('muted', v); this.registry.set('muted', v); setMuted(v);
    } else if (r.kind === 'bool') {
      const v = getSetting(r.key) === false; // alterna (por defecto activado)
      setSetting(r.key, v);
      if (r.key === 'vibration' && v) vibrate(40); // pequeña muestra al activarla
    }
    sfx('select');
    this.refresh();
  }

  refresh() {
    this.texts.forEach((t, i) => {
      const r = this.rows[i], on = i === this.selected;
      const val = r.key === '__back' ? '' : '   ‹ ' + r.show(getSetting(r.key)) + ' ›';
      t.setColor(on ? COLORS.gold : COLORS.cream).setText((on ? '❯ ' : '  ') + r.label + val).setScale(on ? 1.06 : 1);
    });
    const d = DIFFICULTY[getSetting('difficulty')] || DIFFICULTY.normal;
    this.diffNote.setText(d.label + ` — ${d.hearts} ♥ y ${d.hints} pistas en la audiencia`);
  }

  back() {
    sfx('confirm');
    if (this.pausedReturn) {
      this.scene.stop();
      this.scene.launch('Pause', { returnScene: this.returnScene });
    } else {
      this.scene.start(this.returnScene);
    }
  }
}
