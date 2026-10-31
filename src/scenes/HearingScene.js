// LA AUDIENCIA: investigación dialéctica en la Casa de la Junta.
// Cada parte declara; quien juega recorre las frases (◀ ▶), pregunta (E) y
// presenta pruebas, testimonios o cartas del Códice (X) cuando una frase no
// cuadra. Aciertos: ¡OBJECIÓN!, el público celebra y la balanza se equilibra.
// Errores: la asamblea pierde confianza (♥). Lumen da pistas (B) y Tinto
// calma a la gente (C, una vez por declaración).

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { HEARING } from '../data/ch1/hearing.js';
import { ITEMS } from '../data/ch1/items.js';
import { CODEX, FAMILIES } from '../data/codex.js';
import { SPEAKERS } from '../data/speakers.js';
import { getSave, writeSave } from '../systems/save.js';
import { give } from '../systems/story.js';
import { difficultyMods } from '../systems/settings.js';
import { heroFor } from '../data/heroes.js';
import { startAudio, playTheme, sfx } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';
import { fmt } from '../systems/text.js';
import { drawJunta, buildCrowd, buildBalance, cheer, murmur } from './junta.js';

const PICK_TABS = ['Pruebas', 'Testimonios', 'Códice'];

export default class HearingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Hearing', cameras: CAMERA });
  }

  init() {
    this.save = getSave();
    this.steps = [];
    this.busy = false;
    this.round = 0;
    this.idx = 0;
    this.solved = new Set();
    this.cross = false;
    this.picker = null;
    this.calmUsed = 0;
    this.totalContra = HEARING.rounds.reduce((a, r) => a + r.statements.filter((s) => s.answer).length, 0);
    this.progress = 0;
  }

  create() {
    if (!this.save) { this.scene.start('Menu'); return; }
    this.save.stage = 'audiencia';
    writeSave(this.save);
    const mods = difficultyMods(this.game);
    // El don del personaje suma: Sora +1 ♥, Aurelio +1 pista, Kaelen 2 calmas.
    const perk = heroFor(this.save).perk || {};
    this.maxHearts = (mods.hearts || 5) + (perk.hearts || 0);
    this.hearts = this.maxHearts;
    this.hints = (mods.hints != null ? mods.hints : 3) + (perk.hints || 0);
    this.calmMax = perk.calm || 1;

    drawJunta(this);
    this.crowd = buildCrowd(this);
    this.fidelina = this.add.image(266, 112, 'npc_fidelina').setOrigin(0.5, 1).setScale(2).setDepth(5);
    // La balanza empieza inclinada: el conflicto pesa más de un lado.
    this.balance = buildBalance(this);
    this.balance.set(-18, false);
    // Estrados: el testigo a la izquierda, quien juega a la derecha.
    const pod = this.add.graphics().setDepth(9);
    pod.fillStyle(0x4a2e18, 1); pod.fillRect(36, 170, 76, 18); pod.fillRect(370, 170, 76, 18);
    pod.fillStyle(0x5a3a20, 1); pod.fillRect(36, 170, 76, 3); pod.fillRect(370, 170, 76, 3);
    this.witness = this.add.image(74, 186, 'npc_julian').setOrigin(0.5, 1).setScale(3).setDepth(8);
    this.me = this.add.image(408, 186, 'player').setOrigin(0.5, 1).setScale(3).setDepth(8).setFlipX(true);
    this.lumen = this.add.image(446, 118, 'lumen').setScale(2).setDepth(11);
    this.tweens.add({ targets: this.lumen, y: 112, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tinto = this.add.image(352, 186, 'tinto').setOrigin(0.5, 1).setScale(1.8).setDepth(11).setFlipX(true);
    this.buildHud();
    this.buildPanel();
    this.setupInput();

    const onResume = () => { this.busy = false; this.runNext(); };
    this.events.on('resume', onResume);
    this.events.once('shutdown', () => { this.events.off('resume', onResume); window.__stmt = null; window.__pick = null; });
    startAudio().then(() => playTheme('audiencia'));
    this.cameras.main.fadeIn(700, 0, 0, 0);

    this.push({ type: 'talk', lines: HEARING.intro });
    this.push({ type: 'give', list: ['c:art29'] });
    this.push({ type: 'fn', fn: () => this.startRound(0) });
    this.time.delayedCall(600, () => this.runNext());
  }

  // ----------------------------------------------------------- cola
  push(step) { this.steps.push(step); }

  runNext() {
    if (this.busy) return;
    const st = this.steps.shift();
    if (!st) return;
    if (st.type === 'talk') {
      this.busy = true;
      this.scene.launch('Dialogue', { convo: st.lines, returnScene: 'Hearing' });
      this.scene.pause();
    } else if (st.type === 'give') {
      give(this.save, st.list);
      while (this.save.newCards && this.save.newCards.length) this.steps.unshift({ type: 'card', id: this.save.newCards.pop() });
      writeSave(this.save);
      this.runNext();
    } else if (st.type === 'card') {
      this.busy = true;
      this.scene.launch('Card', { id: st.id, returnScene: 'Hearing' });
      this.scene.pause();
    } else if (st.type === 'lesson') {
      this.busy = true;
      this.scene.launch('Lesson', { lesson: st.lesson, returnScene: 'Hearing' });
      this.scene.pause();
    } else if (st.type === 'fn') {
      st.fn();
      this.runNext();
    }
  }

  // ----------------------------------------------------------- escena
  buildHud() {
    const { WIDTH } = GAME;
    const pill = this.add.graphics().setDepth(40);
    pill.fillStyle(0x081016, 0.92); pill.fillRoundedRect(4, 4, 112, 18, 8); pill.fillRoundedRect(WIDTH - 140, 4, 136, 18, 8);
    this.heartText = this.add.text(10, 7, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ff9e9e' }).setDepth(41);
    this.helpText = this.add.text(WIDTH - 134, 8, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffe9a0' }).setDepth(41);
    this.banner = this.add.text(WIDTH / 2, 56, '', { fontFamily: 'Georgia, serif', fontSize: '14px', color: COLORS.gold, backgroundColor: '#081016dd', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(45).setAlpha(0);
    this.refreshHud();
  }

  refreshHud() {
    this.heartText.setText('Confianza ' + '♥'.repeat(Math.max(0, this.hearts)) + '♡'.repeat(Math.max(0, this.maxHearts - this.hearts)));
    this.helpText.setText(`💡 Pistas: ${this.hints}   🐾 Calma: ${Math.max(0, this.calmMax - this.calmUsed)}`);
  }

  buildPanel() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics().setDepth(30);
    g.fillStyle(0x081016, 0.97); g.fillRoundedRect(6, 188, WIDTH - 12, HEIGHT - 192, 6);
    g.lineStyle(2, 0xe3b04b, 0.85); g.strokeRoundedRect(6, 188, WIDTH - 12, HEIGHT - 192, 6);
    this.panelBg = g;
    this.pName = this.add.text(16, 192, '', { fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.gold }).setDepth(31);
    this.pIdx = this.add.text(WIDTH - 16, 193, '', { fontFamily: 'monospace', fontSize: '8px', color: '#9fb8c0' }).setOrigin(1, 0).setDepth(31);
    this.pText = this.add.text(30, 208, '', { fontFamily: 'Georgia, serif', fontSize: '11px', color: COLORS.cream, wordWrap: { width: WIDTH - 60 }, lineSpacing: 2 }).setDepth(31);
    const arrow = (x, label, d) => {
      const t = this.add.text(x, 222, label, { fontFamily: 'monospace', fontSize: '14px', color: COLORS.gold }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => this.nav(d));
      return t;
    };
    this.prevArrow = arrow(16, '◀', -1);
    this.nextArrow = arrow(WIDTH - 16, '▶', 1);
    const btn = (x, label, cb, col) => {
      const bg = this.add.rectangle(x, 256, 104, 15, col, 0.95).setStrokeStyle(1, 0xe3b04b, 0.7).setDepth(32).setInteractive({ useHandCursor: true });
      const t = this.add.text(x, 256, label, { fontFamily: 'monospace', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5).setDepth(33);
      bg.on('pointerdown', cb);
      return { bg, t };
    };
    this.btns = [
      btn(70, 'E · Preguntar', () => this.press(), 0x2a5aa8),
      btn(180, 'X · Presentar', () => this.openPicker(), 0xb5562c),
      btn(290, 'B · Pista', () => this.hint(), 0x8a6a32),
      btn(400, 'C · Calma', () => this.calm(), 0x2f6b6c),
    ];
    this.setPanelVisible(false);
  }

  setPanelVisible(v) {
    [this.panelBg, this.pName, this.pIdx, this.pText, this.prevArrow, this.nextArrow].forEach((o) => o.setVisible(v));
    this.btns.forEach((b) => { b.bg.setVisible(v); b.t.setVisible(v); });
  }

  setupInput() {
    const kb = this.input.keyboard;
    const when = (fn) => () => { if (this.picker) return; fn(); };
    kb.on('keydown-LEFT', () => (this.picker ? this.pickerKey('left') : this.nav(-1)));
    kb.on('keydown-RIGHT', () => (this.picker ? this.pickerKey('right') : this.nav(1)));
    kb.on('keydown-UP', () => this.picker && this.pickerKey('up'));
    kb.on('keydown-DOWN', () => this.picker && this.pickerKey('down'));
    kb.on('keydown-E', when(() => this.press()));
    kb.on('keydown-X', () => (this.picker ? this.pickerKey('ok') : this.openPicker()));
    kb.on('keydown-ENTER', () => (this.picker ? this.pickerKey('ok') : this.openPicker()));
    kb.on('keydown-B', when(() => this.hint()));
    kb.on('keydown-C', when(() => this.calm()));
    // Esc: cierra el selector; si no hay selector, abre la pausa (como en el pueblo).
    kb.on('keydown-ESC', () => (this.picker ? this.closePicker() : this.openPause()));
  }

  // ----------------------------------------------------------- rondas
  get R() { return HEARING.rounds[this.round]; }
  get S() { return this.R.statements[this.idx]; }

  startRound(r) {
    this.round = r;
    this.idx = 0;
    this.solved = new Set();
    this.calmUsed = 0;
    this.cross = false;
    const sp = SPEAKERS[this.R.who];
    this.witness.setTexture(sp.portrait);
    this.witness.setAlpha(0).setX(40);
    this.tweens.add({ targets: this.witness, alpha: 1, x: 74, duration: 500, ease: 'Cubic.out' });
    this.showBanner(fmt(this.R.title));
    this.refreshHud();
    this.push({ type: 'talk', lines: this.R.intro });
    this.push({ type: 'fn', fn: () => { this.cross = true; this.setPanelVisible(true); this.showStatement(); } });
  }

  showBanner(text) {
    // La norma de la declaración anterior ya cumplió: no se monta con el título.
    if (this.lawChip) { this.lawChip.destroy(); this.lawChip = null; }
    this.banner.setText(text).setAlpha(0).setScale(0.7);
    this.tweens.add({ targets: this.banner, alpha: 1, scale: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 2200, duration: 500 });
    sfx('gate');
  }

  showStatement() {
    const st = this.S;
    const sp = SPEAKERS[this.R.who];
    const solved = this.solved.has(this.idx);
    this.pName.setText(fmt(sp.name)).setColor(sp.color);
    this.pIdx.setText(`Frase ${this.idx + 1} de ${this.R.statements.length}${solved ? ' · ✓ resuelta' : ''}`);
    this.pText.setText('«' + fmt(st.t) + '»').setColor(solved ? '#8fd694' : COLORS.cream);
    this.tweens.add({ targets: this.witness, y: 182, duration: 100, yoyo: true });
    // Para el panel del celular en vertical: la frase en letra grande.
    window.__stmt = { who: fmt(sp.name), color: sp.color, text: fmt(st.t), idx: this.idx + 1, total: this.R.statements.length, solved };
  }

  nav(d) {
    if (!this.cross || this.busy || this.picker) return;
    this.idx = Phaser.Math.Wrap(this.idx + d, 0, this.R.statements.length);
    sfx('select');
    this.showStatement();
  }

  press() {
    if (!this.cross || this.busy || this.picker) return;
    const st = this.S;
    this.push({ type: 'talk', lines: [{ s: 'explorador', t: '¡Un momento! Explíquese mejor, por favor.' }, ...st.press] });
    this.runNext();
  }

  hint() {
    if (!this.cross || this.busy) return;
    if (this.hints <= 0) { this.push({ type: 'talk', lines: [{ s: 'lumen', t: 'Ya no me quedan pistas... ¡pero confío en ti! Revisa con calma cada frase.' }] }); this.runNext(); return; }
    this.hints--;
    this.save.stats.hints = (this.save.stats.hints || 0) + 1;
    this.refreshHud();
    const st = this.S;
    const text = this.solved.has(this.idx) ? 'Esta ya la resolviste. Busca otra frase con ◀ ▶.' : !st.answer ? 'Esta frase parece cierta: aquí no hay nada que objetar. Prueba con otra (◀ ▶).' : st.hint;
    this.push({ type: 'talk', lines: [{ s: 'lumen', t: text }] });
    this.runNext();
  }

  calm() {
    if (!this.cross || this.busy) return;
    if (this.calmUsed >= this.calmMax) { murmur(this, 'Tinto ya hizo lo suyo en esta declaración', '#bfe0d8'); return; }
    this.calmUsed++;
    this.save.stats.calm = (this.save.stats.calm || 0) + 1;
    this.hearts = Math.min(this.maxHearts, this.hearts + 1);
    sfx('heal');
    this.tweens.add({ targets: this.tinto, x: 240, duration: 700, yoyo: true, hold: 900, ease: 'Sine.inOut' });
    this.time.delayedCall(700, () => { cheer(this, this.crowd, 'good'); murmur(this, '¡Aaaw, el chigüiro!', '#ffd0e0'); murmur(this, '¡Ñic!', '#c9a07a'); });
    this.refreshHud();
  }

  openPause() {
    if (this.busy) return;
    this.busy = true;
    this.scene.launch('Pause', { returnScene: 'Hearing' });
    this.scene.pause();
  }

  // ----------------------------------------------------------- presentar
  openPicker() {
    if (!this.cross || this.busy || this.picker) return;
    const s = this.save;
    const lists = [
      Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'prueba' && s.items && s.items[id]).map((id) => ({ id, icon: ITEMS[id].icon, name: ITEMS[id].name, desc: ITEMS[id].desc })),
      Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'testimonio' && s.items && s.items[id]).map((id) => ({ id, icon: 'ic_voice', name: ITEMS[id].name, desc: ITEMS[id].desc })),
      Object.keys(CODEX).filter((id) => s.codex && s.codex[id]).map((id) => ({ id, icon: 'ic_law', name: CODEX[id].titulo, desc: CODEX[id].ley + ' — ' + CODEX[id].texto, fam: CODEX[id].fam })),
    ];
    this.picker = { tab: 0, sel: 0, lists, objs: this.add.container(0, 0).setDepth(200) };
    sfx('page');
    this.renderPicker();
  }

  closePicker() {
    if (!this.picker) return;
    this.picker.objs.destroy();
    this.picker = null;
    window.__pick = null;
  }

  pickerKey(k) {
    const p = this.picker;
    if (!p) return;
    const list = p.lists[p.tab];
    if (k === 'left') { p.tab = Phaser.Math.Wrap(p.tab - 1, 0, 3); p.sel = 0; }
    if (k === 'right') { p.tab = Phaser.Math.Wrap(p.tab + 1, 0, 3); p.sel = 0; }
    if (k === 'up') p.sel = Math.max(0, p.sel - 1);
    if (k === 'down') p.sel = Math.min(list.length - 1, p.sel + 1);
    if (k === 'ok') { const it = list[p.sel]; if (it) { this.closePicker(); this.evaluate(it); } return; }
    sfx('select');
    this.renderPicker();
  }

  renderPicker() {
    const { WIDTH, HEIGHT } = GAME;
    const p = this.picker;
    const c = p.objs;
    c.removeAll(true);
    const add = (o) => { c.add(o); return o; };
    add(this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x05080a, 0.7).setOrigin(0).setInteractive());
    const g = add(this.add.graphics());
    g.fillStyle(0xefe3c2, 1); g.fillRoundedRect(16, 14, WIDTH - 32, HEIGHT - 28, 8);
    g.lineStyle(2, 0xb5562c, 1); g.strokeRoundedRect(16, 14, WIDTH - 32, HEIGHT - 28, 8);
    add(this.add.text(28, 20, '¿Qué presentas contra esta frase?', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#7a3a1a' }));
    add(this.add.text(28, 34, '«' + fmt(this.S.t) + '»', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#5a4a3a', fontStyle: 'italic', wordWrap: { width: WIDTH - 60 } }));
    PICK_TABS.forEach((t, i) => {
      const tx = add(this.add.text(36 + i * 92, 58, `${t} (${p.lists[i].length})`, { fontFamily: 'Georgia, serif', fontSize: '10px', color: i === p.tab ? '#efe3c2' : '#5a3a20', backgroundColor: i === p.tab ? '#8a6034' : '#00000000', padding: { x: 4, y: 2 } }).setInteractive({ useHandCursor: true }));
      tx.on('pointerdown', () => { p.tab = i; p.sel = 0; this.renderPicker(); });
    });
    const close = add(this.add.text(WIDTH - 26, 18, '✕', { fontFamily: 'monospace', fontSize: '13px', color: '#7a3a1a' }).setOrigin(1, 0).setInteractive({ useHandCursor: true }));
    close.on('pointerdown', () => this.closePicker());
    const list = p.lists[p.tab];
    if (!list.length) {
      window.__pick = { tab: PICK_TABS[p.tab], n: 0, i: 0, name: '', desc: '' };
      add(this.add.text(WIDTH / 2, 140, 'Nada aquí todavía.', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8a7a62' }).setOrigin(0.5));
      return;
    }
    p.sel = Phaser.Math.Clamp(p.sel, 0, list.length - 1);
    const per = 10;
    const start = Math.max(0, Math.min(p.sel - 4, list.length - per));
    list.slice(start, start + per).forEach((it, k) => {
      const i = start + k;
      const y = 80 + k * 17;
      const on = i === p.sel;
      const bg = add(this.add.rectangle(28, y - 1, 200, 15, on ? 0x8a6034 : 0xe2d3ae, on ? 1 : 0.7).setOrigin(0).setInteractive({ useHandCursor: true }));
      bg.on('pointerdown', () => { if (p.sel === i) { this.closePicker(); this.evaluate(it); } else { p.sel = i; this.renderPicker(); } });
      if (this.textures.exists(it.icon)) add(this.add.image(37, y + 6, it.icon).setScale(0.75));
      if (it.fam) add(this.add.rectangle(28, y - 1, 3, 15, Phaser.Display.Color.HexStringToColor(FAMILIES[it.fam].color).color).setOrigin(0));
      add(this.add.text(47, y + 6, it.name, { fontFamily: 'Georgia, serif', fontSize: '9px', color: on ? '#efe3c2' : '#2a2018' }).setOrigin(0, 0.5));
    });
    const it = list[p.sel];
    // Para el panel del celular en vertical: lo elegido, en letra grande.
    window.__pick = { tab: PICK_TABS[p.tab], n: list.length, i: p.sel + 1, name: it.name, desc: it.desc };
    add(this.add.text(242, 80, it.name, { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#5a3a20', wordWrap: { width: WIDTH - 272 } }));
    add(this.add.text(242, 100, it.desc, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', wordWrap: { width: WIDTH - 272 }, lineSpacing: 2 }));
    const go = add(this.add.rectangle(WIDTH - 90, HEIGHT - 36, 120, 22, 0xb5562c).setStrokeStyle(2, 0x7a3a1a).setInteractive({ useHandCursor: true }));
    add(this.add.text(WIDTH - 90, HEIGHT - 36, '¡Presentar!', { fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffffff' }).setOrigin(0.5));
    go.on('pointerdown', () => { this.closePicker(); this.evaluate(it); });
  }

  // Tras el golpe de efecto (¡OBJECIÓN! o ¡No es así!) sigue la cola. Mientras
  // tanto la escena queda ocupada para que nada se cuele en medio.
  afterBeat(ms) {
    this.busy = true;
    this.time.delayedCall(ms, () => { this.busy = false; this.runNext(); });
  }

  evaluate(it) {
    if (this.busy) return;
    const st = this.S;
    const ok = st.answer && st.answer.includes(it.id) && !this.solved.has(this.idx);
    if (ok) {
      this.solved.add(this.idx);
      this.progress++;
      this.objection('¡OBJECIÓN!', 0xe3b04b);
      cheer(this, this.crowd, 'good');
      murmur(this, '¡Uyyyy!', '#ffe9a0');
      this.balance.set(-18 + (18 * this.progress) / this.totalContra);
      if (st.law) this.showLaw(st.law);
      this.showStatement();
      this.push({ type: 'talk', lines: st.ok });
      if (st.lesson) this.push({ type: 'lesson', lesson: st.lesson });
      this.push({ type: 'fn', fn: () => this.afterSolve() });
      this.afterBeat(900);
      return;
    }
    // Una frase ya resuelta no castiga: solo se avisa.
    if (this.solved.has(this.idx)) {
      this.push({ type: 'talk', lines: [{ s: 'lumen', t: 'Esa frase ya quedó resuelta. Busca otra con ◀ ▶.' }] });
      this.runNext();
      return;
    }
    // Error: la asamblea pierde confianza.
    this.hearts--;
    this.save.stats.wrong = (this.save.stats.wrong || 0) + 1;
    writeSave(this.save);
    this.refreshHud();
    this.objection('¡No es así!', 0xe8817a, true);
    murmur(this, 'Mmm...', '#c9d2d8');
    cheer(this, this.crowd, 'bad');
    const wl = this.R.wrong[Math.floor(Math.random() * this.R.wrong.length)];
    const tip = !st.answer ? 'Esa frase es cierta: no había nada que objetar ahí.' : 'Eso no contradice esta frase. Fíjate bien en lo que dice... y en lo que tienes.';
    this.push({ type: 'talk', lines: [wl, { s: 'lumen', t: tip }] });
    if (this.hearts <= 0) {
      this.push({ type: 'talk', lines: HEARING.failLines });
      this.push({ type: 'fn', fn: () => { this.hearts = this.maxHearts; this.calmUsed = 0; this.refreshHud(); } });
    }
    this.afterBeat(700);
  }

  // Placa con la norma que resolvió la frase: queda a la vista mientras se
  // explican las partes (el reloj de la escena se detiene con el diálogo).
  showLaw(id) {
    const c = CODEX[id];
    if (!c) return;
    const { WIDTH } = GAME;
    if (this.lawChip) this.lawChip.destroy();
    const col = Phaser.Display.Color.HexStringToColor(FAMILIES[c.fam].color).color;
    // Justo encima del panel de la declaración, donde el jugador está leyendo
    // (arriba se montaba con el título y los letreros de la pared).
    const box = this.add.container(WIDTH / 2, 166).setDepth(160);
    const t = this.add.text(0, 0, `⚖ Norma aplicada · ${c.ley}\n${c.titulo}`, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018', align: 'center', lineSpacing: 1, wordWrap: { width: WIDTH - 60 } }).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, t.width + 16, t.height + 6, 0xefe3c2, 1).setStrokeStyle(2, col, 1);
    box.add([bg, t]);
    box.setAlpha(0).setScale(0.8);
    this.tweens.add({ targets: box, alpha: 1, scale: 1, duration: 260, delay: 500, ease: 'Back.out' });
    this.tweens.add({ targets: box, alpha: 0, delay: 4200, duration: 500, onComplete: () => box.destroy() });
    this.lawChip = box;
  }

  objection(text, color, small = false) {
    const { WIDTH } = GAME;
    const c = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(WIDTH / 2, 120, text, { fontFamily: 'Georgia, serif', fontSize: small ? '24px' : '40px', color: c, fontStyle: 'bold', stroke: '#2a1410', strokeThickness: 6 }).setOrigin(0.5).setDepth(150).setScale(2.5).setAngle(-8).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 200, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, scale: 1.2, delay: 700, duration: 300, onComplete: () => t.destroy() });
    if (!small) {
      this.cameras.main.shake(260, 0.012);
      this.cameras.main.flash(160, 255, 240, 200);
      sfx('thunder');
      vibrate([40, 30, 60]);
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const sp = this.add.image(WIDTH / 2, 120, 'p_spark').setTint(color).setDepth(149).setScale(1.5);
        this.tweens.add({ targets: sp, x: WIDTH / 2 + Math.cos(a) * 150, y: 120 + Math.sin(a) * 90, alpha: 0, duration: 600, onComplete: () => sp.destroy() });
      }
    } else {
      this.cameras.main.shake(140, 0.006);
      sfx('damage');
      vibrate(40);
    }
  }

  afterSolve() {
    const need = this.R.statements.filter((s) => s.answer).length;
    if (this.solved.size < need) { this.showStatement(); return; }
    // Declaración desmontada: cierre y siguiente parte (o el acuerdo).
    this.cross = false;
    this.setPanelVisible(false);
    this.push({ type: 'talk', lines: this.R.outro });
    if (this.round + 1 < HEARING.rounds.length) {
      this.push({ type: 'fn', fn: () => this.startRound(this.round + 1) });
    } else {
      this.push({ type: 'fn', fn: () => this.finishHearing() });
    }
  }

  finishHearing() {
    window.__stmt = null;
    window.__pick = null;
    this.balance.set(0);
    give(this.save, ['f:audiencia_ok']); // una audiencia en paz: el puerto recupera orden
    this.save.stage = 'acuerdo';
    this.save.hearingHearts = this.hearts;
    this.save.hearingMax = this.maxHearts;
    writeSave(this.save);
    this.showBanner('⚖ La balanza está en equilibrio');
    cheer(this, this.crowd, 'good');
    this.busy = true;
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Resolution'));
    });
  }
}
