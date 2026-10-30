// EXPEDIENTE (I): el caso de un vistazo. Pestañas: Caso (objetivo, confianza y
// lo que falta), Pruebas, Testimonios y Códice (las cartas de ley ganadas).

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { ITEMS, REQUIRED, TRUST } from '../data/ch1/items.js';
import { CODEX, FAMILIES } from '../data/codex.js';
import { getSave } from '../systems/save.js';
import { objective, hasFlag, hasItem, trustCount } from '../systems/story.js';
import { orderValue, orderLevel, TEACHINGS } from '../systems/order.js';
import { fmt } from '../systems/text.js';
import { sfx } from '../systems/audio.js';

const TABS = ['Caso', 'Pruebas', 'Testimonios', 'Códice'];

export default class CaseFileScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaseFile', cameras: CAMERA });
  }

  init(data) {
    this.returnScene = (data && data.returnScene) || 'Town';
    this.save = getSave() || {};
    this.tab = 0;
    this.sel = 0;
    this.closing = false;
  }

  create() {
    const { WIDTH, HEIGHT } = GAME;
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x081016, 0.7).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0xefe3c2, 1); g.fillRoundedRect(12, 12, WIDTH - 24, HEIGHT - 24, 8);
    g.fillStyle(0xd8c79e, 1); g.fillRect(12, 40, WIDTH - 24, 2);
    g.lineStyle(2, 0x8a6034, 1); g.strokeRoundedRect(12, 12, WIDTH - 24, HEIGHT - 24, 8);
    this.add.text(24, 18, 'EXPEDIENTE · Caso de la lancha', { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#5a3a20' });
    const close = this.add.text(WIDTH - 22, 16, '✕', { fontFamily: 'monospace', fontSize: '13px', color: '#7a3a1a' }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.close());
    this.tabTexts = TABS.map((t, i) => {
      const tx = this.add.text(214 + i * 62, 22, t, { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a3a20', padding: { x: 4, y: 2 } }).setInteractive({ useHandCursor: true });
      tx.on('pointerdown', () => { this.tab = i; this.sel = 0; this.render(); });
      return tx;
    });
    this.body = this.add.container(0, 0);
    this.render();
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => { this.tab = Phaser.Math.Wrap(this.tab - 1, 0, TABS.length); this.sel = 0; sfx('select'); this.render(); });
    kb.on('keydown-RIGHT', () => { this.tab = Phaser.Math.Wrap(this.tab + 1, 0, TABS.length); this.sel = 0; sfx('select'); this.render(); });
    kb.on('keydown-UP', () => { this.sel = Math.max(0, this.sel - 1); this.render(); });
    kb.on('keydown-DOWN', () => { this.sel = Math.min((this.list || []).length - 1, this.sel + 1); this.render(); });
    ['ESC', 'I', 'X'].forEach((k) => kb.on('keydown-' + k, () => this.close()));
  }

  entries() {
    const s = this.save;
    if (this.tab === 1) return Object.keys(ITEMS).filter((id) => ITEMS[id].kind !== 'testimonio' && hasItem(s, id)).map((id) => ({ icon: ITEMS[id].icon, name: ITEMS[id].name, desc: ITEMS[id].desc, req: REQUIRED.includes(id) }));
    if (this.tab === 2) return Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'testimonio' && hasItem(s, id)).map((id) => ({ icon: 'ic_voice', name: ITEMS[id].name, desc: ITEMS[id].desc, req: REQUIRED.includes(id) }));
    if (this.tab === 3) return Object.keys(CODEX).filter((id) => s.codex && s.codex[id]).map((id) => ({ icon: 'ic_law', name: CODEX[id].titulo, desc: CODEX[id].ley + '\n\n' + CODEX[id].texto + '\n\n▸ ' + CODEX[id].ejemplo, fam: CODEX[id].fam }));
    return [];
  }

  render() {
    const { WIDTH, HEIGHT } = GAME;
    this.body.removeAll(true);
    this.tabTexts.forEach((t, i) => t.setColor(i === this.tab ? '#efe3c2' : '#5a3a20').setBackgroundColor(i === this.tab ? '#8a6034' : '#00000000'));
    const add = (o) => { this.body.add(o); return o; };
    if (this.tab === 0) {
      const s = this.save;
      const obj = objective(s);
      add(this.add.text(26, 50, 'Ahora:', { fontFamily: 'monospace', fontSize: '8px', color: '#8a6034' }));
      add(this.add.text(26, 61, fmt(obj.text), { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2a2018', wordWrap: { width: WIDTH - 60 } }));
      add(this.add.text(26, 86, `Confianza del puerto (${trustCount(s)}/3):`, { fontFamily: 'monospace', fontSize: '8px', color: '#8a6034' }));
      TRUST.forEach((t, i) => add(this.add.text(30, 98 + i * 12, (hasFlag(s, t.flag) ? '☑ ' : '☐ ') + t.label + ' · ' + t.where, { fontFamily: 'Georgia, serif', fontSize: '10px', color: hasFlag(s, t.flag) ? '#2f6b3f' : '#5a4a3a' })));
      // Enseñanzas: lo que la gente adopta cuando se lo explicas.
      const taught = TEACHINGS.filter((t) => hasFlag(s, t.flag)).length;
      add(this.add.text(262, 86, `Enseñanzas (${taught}/4) · busca el 📖:`, { fontFamily: 'monospace', fontSize: '8px', color: '#8a6034' }));
      TEACHINGS.forEach((t, i) => add(this.add.text(266, 98 + i * 12, (hasFlag(s, t.flag) ? '☑ ' : '☐ ') + t.label, { fontFamily: 'Georgia, serif', fontSize: '10px', color: hasFlag(s, t.flag) ? '#2f6b3f' : '#5a4a3a' })));
      add(this.add.text(26, 148, 'Para la audiencia necesitas:', { fontFamily: 'monospace', fontSize: '8px', color: '#8a6034' }));
      REQUIRED.forEach((id, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        add(this.add.text(30 + col * 214, 160 + row * 13, (hasItem(s, id) ? '☑ ' : '☐ ') + ITEMS[id].name, { fontFamily: 'Georgia, serif', fontSize: '9px', color: hasItem(s, id) ? '#2f6b3f' : '#5a4a3a' }));
      });
      // Equilibrio del puerto.
      const ov = orderValue(s);
      const lv = orderLevel(ov);
      add(this.add.text(26, 216, `⚖ Equilibrio del puerto: ${ov}% · ${lv.name} — ${lv.desc}`, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018' }));
      add(this.add.rectangle(26, 231, 200, 6, 0x5a4a3a, 0.35).setOrigin(0, 0.5));
      add(this.add.rectangle(26, 231, 2 * ov, 6, ov >= 80 ? 0x2f6b3f : ov >= 60 ? 0xb0893f : 0xa8302a).setOrigin(0, 0.5));
      add(this.add.text(WIDTH / 2, HEIGHT - 26, '◀ ▶ cambiar de pestaña · Esc cerrar', { fontFamily: 'monospace', fontSize: '7px', color: '#8a7a62' }).setOrigin(0.5));
      return;
    }
    const list = this.entries();
    this.list = list;
    if (!list.length) {
      add(this.add.text(WIDTH / 2, HEIGHT / 2, this.tab === 3 ? 'Aún no tienes cartas del Códice.' : 'Todavía no hay nada aquí. ¡A investigar!', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8a7a62' }).setOrigin(0.5));
      return;
    }
    this.sel = Phaser.Math.Clamp(this.sel, 0, list.length - 1);
    const per = 12;
    const start = Math.max(0, Math.min(this.sel - 5, list.length - per));
    list.slice(start, start + per).forEach((e, k) => {
      const i = start + k;
      const y = 50 + k * 16;
      const on = i === this.sel;
      const bg = add(this.add.rectangle(22, y - 2, 196, 15, on ? 0x8a6034 : 0xe2d3ae, on ? 1 : 0.6).setOrigin(0).setInteractive({ useHandCursor: true }));
      bg.on('pointerdown', () => { this.sel = i; this.render(); });
      if (this.textures.exists(e.icon)) add(this.add.image(31, y + 5, e.icon).setScale(0.75));
      const fc = e.fam ? FAMILIES[e.fam].color : null;
      if (fc) add(this.add.rectangle(22, y - 2, 3, 15, Phaser.Display.Color.HexStringToColor(fc).color).setOrigin(0));
      add(this.add.text(41, y + 5, e.name, { fontFamily: 'Georgia, serif', fontSize: '9px', color: on ? '#efe3c2' : '#2a2018' }).setOrigin(0, 0.5));
    });
    // Si la lista no cabe, se dice qué parte se ve; las flechas (tocables) bajan o suben.
    if (list.length > per) {
      const y = 50 + per * 16 + 3;
      const style = { fontFamily: 'monospace', fontSize: '8px', color: '#8a6034' };
      add(this.add.text(120, y, `${start + 1}–${start + per} de ${list.length}`, style).setOrigin(0.5));
      const arrow = (x, label, to, on) => {
        const t = add(this.add.text(x, y, label, { ...style, fontSize: '10px', color: on ? '#8a6034' : '#d6c6a0' }).setOrigin(0.5));
        if (on) { t.setInteractive({ useHandCursor: true }); t.on('pointerdown', () => { this.sel = to; this.render(); }); }
      };
      arrow(44, '▲', Math.max(0, start - 1), start > 0);
      arrow(196, '▼', Math.min(list.length - 1, start + per), start + per < list.length);
    }
    const e = list[this.sel];
    add(this.add.text(232, 52, e.name, { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#5a3a20', wordWrap: { width: WIDTH - 262 } }));
    add(this.add.text(232, 74, e.desc, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', wordWrap: { width: WIDTH - 262 }, lineSpacing: 2 }));
    if (e.req) add(this.add.text(232, HEIGHT - 34, '★ Clave para la audiencia', { fontFamily: 'monospace', fontSize: '8px', color: '#b5562c' }));
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.scene.isPaused(this.returnScene)) this.scene.resume(this.returnScene);
    this.scene.stop();
  }
}
