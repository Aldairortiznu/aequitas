// EL ACUERDO: después de la audiencia, {el} {explorador} propone la solución.
//   1. Cuatro decisiones (dueño, gastos, futuro de la lancha, Julián). Lo ilegal
//      no se puede mantener; lo "regular" sí, pero el acuerdo queda más débil.
//   2. Los recibos: cada gasto a su caja (necesario, útil o de lujo).
//   3. El acta: ordenar las cláusulas y completar los números.
//   4. Las firmas. Luego, el epílogo y el cierre del caso.

import Phaser from 'phaser';
import { GAME, COLORS } from '../config.js';
import { RESOLUTION, GASTOS, ACTA } from '../data/ch1/hearing.js';
import { getSave, writeSave } from '../systems/save.js';
import { give } from '../systems/story.js';
import { startAudio, playTheme, sfx } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';
import { fmt } from '../systems/text.js';
import { drawJunta, buildCrowd, buildBalance, cheer, murmur } from './junta.js';

const VERDICT = {
  ok: { t: '¡Bien pensado!', c: '#2f6b3f', tilt: 0 },
  meh: { t: 'Se puede, pero...', c: '#a8641a', tilt: 7 },
  bad: { t: 'Eso no puede ser', c: '#a8302a', tilt: 16 },
};
const KEYS = ['LEFT', 'RIGHT', 'UP', 'DOWN', 'X', 'ENTER', 'SPACE', 'E', 'ONE', 'TWO', 'THREE'];
const OK_KEYS = ['X', 'ENTER', 'SPACE', 'E'];

export default class ResolutionScene extends Phaser.Scene {
  constructor() {
    super('Resolution');
  }

  init() {
    this.save = getSave();
    this.steps = [];
    this.busy = false;
    this.ui = null;
    this.keyHandlers = {};
    this.res = { first: [], chosen: [], gastosErrors: 0, actaErrors: 0 };
    this.blank = {};
  }

  create() {
    if (!this.save) { this.scene.start('Menu'); return; }
    this.save.stage = 'acuerdo';
    writeSave(this.save);
    drawJunta(this);
    this.crowd = buildCrowd(this);
    this.add.image(266, 112, 'npc_fidelina').setOrigin(0.5, 1).setScale(2).setDepth(5);
    this.balance = buildBalance(this);
    this.balance.set(0, false);
    const pod = this.add.graphics().setDepth(9);
    pod.fillStyle(0x4a2e18, 1); pod.fillRect(370, 170, 76, 18);
    pod.fillStyle(0x5a3a20, 1); pod.fillRect(370, 170, 76, 3);
    this.add.image(408, 186, 'player').setOrigin(0.5, 1).setScale(3).setDepth(8).setFlipX(true);
    const lum = this.add.image(446, 118, 'lumen').setScale(2).setDepth(11);
    this.tweens.add({ targets: lum, y: 112, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // El acta se escribe "de cerca", sobre la mesa de la Junta.
    this.desk = this.add.graphics().setDepth(50).setVisible(false);
    this.desk.fillStyle(0x5a3a20, 1); this.desk.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    for (let y = 0; y < GAME.HEIGHT; y += 18) { this.desk.fillStyle(0x6e4527, 1); this.desk.fillRect(0, y, GAME.WIDTH, 16); this.desk.fillStyle(0x4a2e18, 1); this.desk.fillRect(0, y + 16, GAME.WIDTH, 2); }

    const onResume = () => { this.busy = false; this.runNext(); };
    this.events.on('resume', onResume);
    this.events.once('shutdown', () => this.events.off('resume', onResume));
    const kb = this.input.keyboard;
    KEYS.forEach((k) => kb.on('keydown-' + k, () => { if (!this.busy && this.keyHandlers[k]) this.keyHandlers[k](); }));
    startAudio().then(() => playTheme('audiencia'));
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.push({ type: 'talk', lines: RESOLUTION.intro });
    this.push({ type: 'fn', fn: () => this.askPoint(0) });
    this.time.delayedCall(500, () => this.runNext());
  }

  // ----------------------------------------------------------- cola
  push(s) { this.steps.push(s); }

  runNext() {
    if (this.busy) return;
    const st = this.steps.shift();
    if (!st) return;
    if (st.type === 'talk') { this.busy = true; this.scene.launch('Dialogue', { convo: st.lines, returnScene: 'Resolution' }); this.scene.pause(); }
    else if (st.type === 'give') { give(this.save, st.list); while (this.save.newCards && this.save.newCards.length) this.steps.unshift({ type: 'card', id: this.save.newCards.pop() }); writeSave(this.save); this.runNext(); }
    else if (st.type === 'card') { this.busy = true; this.scene.launch('Card', { id: st.id, returnScene: 'Resolution' }); this.scene.pause(); }
    else if (st.type === 'fn') { st.fn(); this.runNext(); }
  }

  // ----------------------------------------------------------- piezas de UI
  clearUi() {
    if (this.ui) this.ui.destroy();
    this.ui = this.add.container(0, 0).setDepth(60);
    this.keyHandlers = {};
    return this.ui;
  }

  parchment(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0xefe3c2, 0.98); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x8a6034, 1); g.strokeRoundedRect(x, y, w, h, 8);
    this.ui.add(g);
    return g;
  }

  text(x, y, t, style) {
    const o = this.add.text(x, y, t, { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#2a2018', ...style });
    this.ui.add(o);
    return o;
  }

  // Lista de opciones (toque, ↑ ↓ + X, o 1-2-3). Cada lista responde una sola vez.
  options(items, y0, onPick, opts = {}) {
    const { WIDTH } = GAME;
    const w = opts.w || WIDTH - 60;
    const h = opts.h || 30;
    let sel = 0;
    let done = false;
    const pick = (i) => { if (done) return; done = true; this.keyHandlers = {}; onPick(i); };
    const rows = items.map((label, i) => {
      const y = y0 + i * (h + 5);
      const bg = this.add.rectangle(WIDTH / 2, y, w, h, 0x16303a, 0.96).setInteractive({ useHandCursor: true });
      const t = this.add.text(WIDTH / 2, y, label, { fontFamily: 'Georgia, serif', fontSize: opts.size || '10px', color: COLORS.cream, align: 'center', wordWrap: { width: w - 20 } }).setOrigin(0.5);
      bg.on('pointerover', () => { sel = i; paint(); });
      bg.on('pointerdown', () => { if (this.busy) return; sel = i; paint(); pick(i); });
      this.ui.add([bg, t]);
      return bg;
    });
    const paint = () => rows.forEach((bg, i) => bg.setStrokeStyle(2, i === sel ? 0xffe070 : 0x3fa3a0, i === sel ? 1 : 0.6).setFillStyle(i === sel ? 0x2a5a5e : 0x16303a, 0.96));
    paint();
    const move = (d) => { sel = Phaser.Math.Wrap(sel + d, 0, items.length); paint(); sfx('select'); };
    this.keyHandlers.UP = () => move(-1);
    this.keyHandlers.DOWN = () => move(1);
    OK_KEYS.forEach((k) => { this.keyHandlers[k] = () => pick(sel); });
    ['ONE', 'TWO', 'THREE'].forEach((k, i) => { if (i < items.length) this.keyHandlers[k] = () => pick(i); });
  }

  // ----------------------------------------------------------- 1. decisiones
  askPoint(i, retry = false) {
    const p = RESOLUTION.points[i];
    const { WIDTH } = GAME;
    this.clearUi();
    this.balance.set(0);
    this.parchment(20, 20, WIDTH - 40, 38);
    this.text(WIDTH / 2, 27, `PROPUESTA DE ACUERDO · punto ${i + 1} de ${RESOLUTION.points.length}`, { fontFamily: 'monospace', fontSize: '7px', color: '#8a6034' }).setOrigin(0.5, 0);
    this.text(WIDTH / 2, 38, p.q, { fontSize: '12px' }).setOrigin(0.5, 0);
    this.options(p.options.map((o, k) => `${k + 1}. ${o.t}`), 168, (k) => this.choose(i, k, retry));
  }

  choose(i, k, retry) {
    const { WIDTH } = GAME;
    const o = RESOLUTION.points[i].options[k];
    if (!retry && this.res.first[i] == null) this.res.first[i] = o.v;
    const v = VERDICT[o.v];
    this.clearUi();
    // La tarjeta va debajo de la balanza, para que se vea cómo se inclina.
    this.parchment(30, 120, WIDTH - 60, 82);
    this.text(WIDTH / 2, 126, v.t, { fontSize: '14px', color: v.c }).setOrigin(0.5, 0);
    const quote = this.text(WIDTH / 2, 145, '«' + o.t + '»', { fontSize: '8px', color: '#5a4a3a', fontStyle: 'italic', align: 'center', wordWrap: { width: WIDTH - 90 } }).setOrigin(0.5, 0);
    this.text(WIDTH / 2, 149 + quote.height, 'Lumen: ' + o.fb, { align: 'center', wordWrap: { width: WIDTH - 90 } }).setOrigin(0.5, 0);
    this.balance.set(v.tilt * (k % 2 ? 1 : -1));
    if (o.v === 'ok') { sfx('seal'); cheer(this, this.crowd, 'good'); murmur(this, '¡Eso es!', '#bfe8c4'); }
    else if (o.v === 'meh') { sfx('select'); murmur(this, 'Mmm...', '#f2c48a'); }
    else { sfx('damage'); vibrate(40); this.cameras.main.shake(140, 0.006); cheer(this, this.crowd, 'bad'); murmur(this, '¡Nooo!', '#f3c0b8'); }
    // La carta (si la hay) se entrega al seguir, para no tapar la explicación.
    const go = (fn) => { if (o.card) this.push({ type: 'give', list: ['c:' + o.card] }); this.push({ type: 'fn', fn }); this.runNext(); };
    const nextPoint = () => {
      this.res.chosen[i] = o;
      if (i + 1 < RESOLUTION.points.length) this.askPoint(i + 1);
      else this.startGastos();
    };
    if (o.v === 'ok') this.options(['Continuar'], 222, () => go(nextPoint), { w: 160, h: 24 });
    else if (o.v === 'meh') this.options(['Mantener esta decisión', 'Pensarlo de nuevo'], 220, (n) => go(n === 0 ? nextPoint : () => this.askPoint(i, true)), { w: 240, h: 22 });
    else this.options(['Elegir otra opción'], 222, () => go(() => this.askPoint(i, true)), { w: 200, h: 24 });
  }

  // ----------------------------------------------------------- 2. recibos
  startGastos() {
    this.gi = 0;
    this.tally = { nec: 0, util: 0, lujo: 0 };
    this.balance.set(0);
    this.push({ type: 'talk', lines: [{ s: 'lumen', t: 'Ahora, las cuentas. Mete cada recibo del cuaderno de Don Chepe en su caja: ¿gasto necesario, mejora útil o mejora voluptuaria (de lujo)? Así las llama el Código Civil.' }] });
    this.push({ type: 'fn', fn: () => this.showReceipt() });
    this.runNext();
  }

  showReceipt() {
    const { WIDTH } = GAME;
    const it = GASTOS.items[this.gi];
    this.clearUi();
    this.parchment(20, 8, WIDTH - 40, 30);
    this.text(WIDTH / 2, 13, `LAS CUENTAS · recibo ${this.gi + 1} de ${GASTOS.items.length}`, { fontFamily: 'monospace', fontSize: '7px', color: '#8a6034' }).setOrigin(0.5, 0);
    this.text(WIDTH / 2, 22, '¿Gasto necesario, mejora útil o voluptuaria?', { fontSize: '10px' }).setOrigin(0.5, 0);
    // El recibo.
    const card = this.add.container(WIDTH / 2, 84);
    const g = this.add.graphics();
    g.fillStyle(0xf6efe0, 1); g.fillRect(-92, -34, 184, 66); g.lineStyle(1, 0xb5a68a, 1); g.strokeRect(-92, -34, 184, 66);
    g.fillStyle(0xf6efe0, 1); for (let x = -92; x < 92; x += 8) g.fillTriangle(x, 32, x + 8, 32, x + 4, 36);
    card.add(g);
    card.add(this.add.text(0, -28, 'VARIEDADES CHEPE · RECIBO', { fontFamily: 'monospace', fontSize: '7px', color: '#8a7a62' }).setOrigin(0.5, 0));
    card.add(this.add.text(0, -6, it.t, { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#2a2018', align: 'center', wordWrap: { width: 172 } }).setOrigin(0.5));
    card.add(this.add.text(0, 18, it.v + ' fichas', { fontFamily: 'monospace', fontSize: '11px', color: '#7a3a1a' }).setOrigin(0.5));
    card.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 220, ease: 'Back.out' });
    this.ui.add(card);
    // Las tres cajas.
    let sel = 1;
    let done = false;
    const boxes = GASTOS.bins.map((b, k) => {
      const x = 90 + k * 150;
      const y = 204;
      const col = Phaser.Display.Color.HexStringToColor(b.color).color;
      const bg = this.add.rectangle(x, y, 136, 58, 0x16303a, 0.96).setInteractive({ useHandCursor: true });
      const lid = this.add.rectangle(x, y - 26, 136, 6, col, 1);
      this.ui.add([bg, lid]);
      this.text(x, y - 16, `${k + 1} · ${b.label}`, { fontSize: '11px', color: b.color }).setOrigin(0.5, 0);
      this.text(x, y - 2, b.sub, { fontFamily: 'monospace', fontSize: '7px', color: '#c9d2d8', align: 'center', wordWrap: { width: 128 } }).setOrigin(0.5, 0);
      this.text(x, y + 16, `${this.tally[b.k]} fichas`, { fontFamily: 'monospace', fontSize: '9px', color: '#efe3c2' }).setOrigin(0.5, 0);
      bg.on('pointerover', () => { sel = k; paint(); });
      bg.on('pointerdown', () => { if (this.busy) return; sel = k; paint(); pick(k); });
      return { bg, x, y };
    });
    const paint = () => boxes.forEach((b, k) => b.bg.setStrokeStyle(2, k === sel ? 0xffe070 : 0x3fa3a0, k === sel ? 1 : 0.5));
    paint();
    const pick = (k) => { if (done) return; done = true; this.keyHandlers = {}; this.classify(k, card, boxes); };
    const move = (d) => { sel = Phaser.Math.Wrap(sel + d, 0, boxes.length); paint(); sfx('select'); };
    this.keyHandlers.LEFT = () => move(-1);
    this.keyHandlers.RIGHT = () => move(1);
    OK_KEYS.forEach((k) => { this.keyHandlers[k] = () => pick(sel); });
    ['ONE', 'TWO', 'THREE'].forEach((k, i) => { this.keyHandlers[k] = () => pick(i); });
  }

  classify(k, card, boxes) {
    const it = GASTOS.items[this.gi];
    const bin = GASTOS.bins[k];
    const ri = GASTOS.bins.findIndex((b) => b.k === it.k);
    const right = GASTOS.bins[ri];
    const ok = bin.k === it.k;
    this.tally[it.k] += it.v;
    const after = () => {
      this.gi++;
      if (this.gi < GASTOS.items.length) this.showReceipt();
      else this.endGastos();
    };
    const fly = (b, cb) => this.tweens.add({ targets: card, x: b.x, y: b.y, scale: 0.25, alpha: 0.2, duration: 360, ease: 'Cubic.in', onComplete: cb });
    if (ok) {
      sfx('treasure');
      murmur(this, '✓ ' + right.label, '#bfe8c4');
      fly(boxes[k], () => this.time.delayedCall(120, after));
      return;
    }
    // Error: el recibo rebota hacia la caja correcta y Lumen explica por qué.
    this.res.gastosErrors++;
    sfx('damage');
    this.cameras.main.shake(120, 0.005);
    this.tweens.add({
      targets: card, x: boxes[k].x, y: boxes[k].y - 40, scale: 0.6, duration: 260, ease: 'Cubic.out',
      onComplete: () => fly(boxes[ri], () => {
        this.push({ type: 'talk', lines: [{ s: 'lumen', t: `Casi: va en «${right.label}». ${it.why}` }] });
        this.push({ type: 'fn', fn: after });
        this.runNext();
      }),
    });
  }

  arriendo() {
    return this.res.chosen.some((o) => o && o.clause === 'ARRIENDO');
  }

  endGastos() {
    const t = this.tally;
    this.monto = t.nec + t.util;
    this.meses = Math.round(this.monto / GASTOS.rent);
    this.clearUi();
    const lines = [{ s: 'lumen', t: `Cuentas claras: ${t.nec} en gastos necesarios + ${t.util} en mejoras útiles = ${this.monto} fichas. Los ${t.lujo} de mejoras voluptuarias no se pagan, pero los Ortega se pueden llevar el parlante y los banderines.` }];
    if (this.arriendo()) lines.push({ s: 'lumen', t: `Y con un arriendo de ${GASTOS.rent} fichas al mes, lo que Aurelio debe cubre los primeros ${this.meses} meses. Las dos deudas se compensan hasta donde alcanzan (C. C., art. 1714): nadie tiene que sacar fichas hoy.` });
    else lines.push({ s: 'lumen', t: `Como Aurelio se lleva la lancha, paga hoy las ${this.monto} fichas. Con un arriendo de ${GASTOS.rent} al mes, esa deuda se habría compensado en ${this.meses} meses... y el puerto seguiría pescando.` });
    this.push({ type: 'talk', lines });
    this.push({ type: 'give', list: ['c:compensacion'] });
    this.push({ type: 'fn', fn: () => this.startActa() });
    this.runNext();
  }

  // ----------------------------------------------------------- 3. el acta
  clauseList() {
    const keys = ['PARTES', 'HECHOS', 'EFECTOS'];
    this.res.chosen.forEach((o) => { if (o && o.clause) keys.push(o.clause); });
    return ACTA.order.filter((k) => keys.includes(k)).map((k) => ACTA.clauses[k]);
  }

  startActa() {
    this.clauses = this.clauseList();
    this.placed = [];
    this.pool = Phaser.Utils.Array.Shuffle(this.clauses.map((c, i) => i));
    this.push({ type: 'talk', lines: [{ s: 'fidelina', t: '¡Escribamos el acta! Ponga las cláusulas en orden: primero quiénes, luego qué pasó, después lo acordado y al final qué efectos tiene.' }] });
    this.push({ type: 'fn', fn: () => { this.desk.setVisible(true); this.showActa(); } });
    this.runNext();
  }

  fill(t) {
    return t.replace('{MONTO}', this.blank.MONTO != null ? this.blank.MONTO : '___').replace('{MESES}', this.blank.MESES != null ? this.blank.MESES : '___');
  }

  // Escribe las cláusulas ya puestas, una debajo de otra según su alto real.
  writeClauses(y, size, gap) {
    const { WIDTH } = GAME;
    this.placed.forEach((ci, n) => {
      const c = this.clauses[ci];
      const t = this.text(24, y, `${n + 1}. ${c.k}: ${this.fill(c.t)}`, { fontSize: size, wordWrap: { width: WIDTH - 48 } });
      y += t.height + gap;
    });
    return y;
  }

  showActa() {
    const { WIDTH } = GAME;
    this.clearUi();
    const next = this.placed.length;
    if (next >= this.clauses.length) { this.startSign(); return; }
    this.parchment(14, 14, WIDTH - 28, 136);
    this.text(WIDTH / 2, 20, ACTA.title, { fontFamily: 'monospace', fontSize: '7px', color: '#5a3a20' }).setOrigin(0.5, 0);
    const y = this.writeClauses(32, '7px', 2);
    this.text(24, y, `${next + 1}. ...`, { fontSize: '8px', color: '#b5562c' });
    this.text(WIDTH / 2, 160, `¿Qué cláusula sigue? (${next + 1} de ${this.clauses.length})`, { color: COLORS.gold, backgroundColor: '#081016cc', padding: { x: 4, y: 2 } }).setOrigin(0.5);
    const remaining = this.pool.filter((ci) => !this.placed.includes(ci));
    const cols = Math.min(4, remaining.length);
    let sel = 0;
    const btns = remaining.map((ci, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, remaining.length - row * cols);
      const x = WIDTH / 2 + ((i % cols) - (inRow - 1) / 2) * 112;
      const yy = 186 + row * 28;
      const bg = this.add.rectangle(x, yy, 104, 22, 0x5a3a20, 0.96).setInteractive({ useHandCursor: true });
      const t = this.add.text(x, yy, this.clauses[ci].k, { fontFamily: 'monospace', fontSize: '8px', color: '#efe3c2' }).setOrigin(0.5);
      bg.on('pointerover', () => { sel = i; paint(); });
      bg.on('pointerdown', () => { if (this.busy) return; sel = i; paint(); this.placeClause(ci, bg); });
      this.ui.add([bg, t]);
      return bg;
    });
    const paint = () => btns.forEach((b, i) => b.setStrokeStyle(2, i === sel ? 0xffe070 : 0xe3b04b, i === sel ? 1 : 0.5));
    paint();
    const move = (d) => { sel = Phaser.Math.Wrap(sel + d, 0, btns.length); paint(); sfx('select'); };
    this.keyHandlers.LEFT = () => move(-1);
    this.keyHandlers.RIGHT = () => move(1);
    this.keyHandlers.UP = () => move(-cols);
    this.keyHandlers.DOWN = () => move(cols);
    OK_KEYS.forEach((k) => { this.keyHandlers[k] = () => this.placeClause(remaining[sel], btns[sel]); });
  }

  placeClause(ci, bg) {
    if (ci !== this.placed.length) {
      this.res.actaErrors++;
      sfx('damage');
      this.cameras.main.shake(100, 0.005);
      if (bg) this.tweens.add({ targets: bg, angle: 4, duration: 50, yoyo: true, repeat: 2 });
      murmur(this, 'Esa no va todavía', '#f3c0b8');
      if (this.res.actaErrors % 3 === 0) {
        const order = this.clauses.map((c) => c.k).join(' → ');
        this.push({ type: 'talk', lines: [{ s: 'lumen', t: 'Pista: un acta va de lo general a lo concreto. El orden es ' + order + '.' }] });
        this.runNext();
      }
      return;
    }
    const c = this.clauses[ci];
    sfx('page');
    if (c.blank) { this.askBlank(ci); return; }
    this.placed.push(ci);
    this.showActa();
  }

  askBlank(ci) {
    const { WIDTH } = GAME;
    const c = this.clauses[ci];
    const key = c.blank.key;
    const correct = key === 'MONTO' ? this.monto : this.meses;
    const opts = c.blank.options.includes(correct) ? c.blank.options : [...c.blank.options.slice(0, 2), correct];
    this.clearUi();
    this.parchment(30, 40, WIDTH - 60, 100);
    this.text(WIDTH / 2, 50, 'Cláusula ' + c.k, { fontFamily: 'monospace', fontSize: '9px', color: '#8a6034' }).setOrigin(0.5, 0);
    this.text(WIDTH / 2, 66, c.t.replace('{' + key + '}', '[ ? ]'), { align: 'center', wordWrap: { width: WIDTH - 90 } }).setOrigin(0.5, 0);
    this.text(WIDTH / 2, 114, key === 'MONTO' ? '¿Cuántas fichas se reconocen?' : '¿Cuántos meses de arriendo se compensan?', { color: '#7a3a1a' }).setOrigin(0.5, 0);
    this.options(opts.map((n, i) => `${i + 1}. ${n}`), 166, (k) => {
      if (opts[k] === correct) {
        this.blank[key] = correct;
        sfx('treasure');
        murmur(this, '✓ ' + correct, '#bfe8c4');
        this.placed.push(ci);
        this.showActa();
        return;
      }
      this.res.actaErrors++;
      sfx('damage');
      this.cameras.main.shake(100, 0.005);
      this.push({ type: 'talk', lines: [{ s: 'lumen', t: key === 'MONTO' ? `Revisa las cajas: necesarias (${this.tally.nec}) + útiles (${this.tally.util}). Las voluptuarias no se pagan.` : `Divide lo que Aurelio debe (${this.monto}) entre el arriendo de cada mes (${GASTOS.rent}).` }] });
      this.push({ type: 'fn', fn: () => this.askBlank(ci) });
      this.runNext();
    }, { w: 120, h: 22 });
  }

  // ----------------------------------------------------------- 4. firmas
  startSign() {
    const { WIDTH } = GAME;
    this.clearUi();
    this.parchment(14, 12, WIDTH - 28, 246);
    this.text(WIDTH / 2, 18, ACTA.title, { fontFamily: 'monospace', fontSize: '7px', color: '#5a3a20' }).setOrigin(0.5, 0);
    const y = this.writeClauses(32, '8px', 3);
    const sy = Math.max(y + 10, 128);
    this.text(WIDTH / 2, sy, 'FIRMAS · toca cada línea (o pulsa X) para firmar', { fontFamily: 'monospace', fontSize: '7px', color: '#8a6034' }).setOrigin(0.5, 0);
    let signed = 0;
    const n = ACTA.signers.length;
    const lines = ACTA.signers.map((name, i) => {
      const row = i < 3 ? 0 : 1;
      const inRow = row === 0 ? Math.min(3, n) : n - 3;
      const col = row === 0 ? i : i - 3;
      const x = WIDTH / 2 + (col - (inRow - 1) / 2) * 150;
      const ly = sy + 36 + row * 34;
      this.ui.add(this.add.rectangle(x, ly, 130, 1, 0x5a3a20));
      this.text(x, ly + 3, fmt(name), { fontFamily: 'monospace', fontSize: '7px', color: '#5a4a3a' }).setOrigin(0.5, 0);
      const hit = this.add.rectangle(x, ly - 9, 136, 26, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      this.ui.add(hit);
      const o = {
        done: false,
        sign: () => {
          if (o.done) return;
          o.done = true;
          signed++;
          const sc = this.add.graphics();
          sc.lineStyle(1.5, 0x1d2a6a, 1);
          sc.beginPath();
          sc.moveTo(x - 48, ly - 5);
          for (let k = 1; k <= 12; k++) sc.lineTo(x - 48 + k * 8, ly - 5 - Math.sin(k * 1.7 + i * 2) * 6);
          sc.strokePath();
          sc.setAlpha(0);
          this.ui.add(sc);
          this.tweens.add({ targets: sc, alpha: 1, duration: 250 });
          sfx('select');
          if (signed >= n) { this.keyHandlers = {}; this.time.delayedCall(500, () => this.stamp()); }
        },
      };
      hit.on('pointerdown', () => { if (!this.busy) o.sign(); });
      return o;
    });
    OK_KEYS.forEach((k) => { this.keyHandlers[k] = () => { const l = lines.find((q) => !q.done); if (l) l.sign(); }; });
  }

  stamp() {
    const { WIDTH } = GAME;
    const st = this.add.text(WIDTH - 110, 128, 'ACTA N.º 001\nPUERTO GARZA', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#a8302a', align: 'center', fontStyle: 'bold', padding: { x: 6, y: 4 } }).setOrigin(0.5).setAngle(-14).setAlpha(0).setScale(2.4).setDepth(80);
    this.tweens.add({ targets: st, alpha: 0.85, scale: 1, duration: 260, ease: 'Back.in' });
    this.time.delayedCall(260, () => {
      this.cameras.main.shake(200, 0.01);
      sfx('seal');
      vibrate([50, 30, 50]);
      cheer(this, this.crowd, 'good');
      murmur(this, '¡Viva Puerto Garza!', '#ffe9a0');
      this.time.delayedCall(300, () => murmur(this, '¡Bravo!', '#bfe8c4'));
    });
    const cards = ACTA.cards.filter((c) => c !== 'arrendamiento' || this.arriendo());
    this.push({ type: 'give', list: cards.map((c) => 'c:' + c) });
    this.push({ type: 'fn', fn: () => this.finish() });
    this.time.delayedCall(1600, () => this.runNext());
  }

  finish() {
    const s = this.save;
    const { first, chosen } = this.res;
    const hearts = s.hearingHearts != null ? s.hearingHearts : 3;
    const maxH = s.hearingMax || 5;
    const isOk = (o) => !!o && o.v === 'ok';
    s.result = {
      legalidad: first[0] === 'ok' && first[1] === 'ok' && (s.stats.wrong || 0) <= 4,
      equidad: isOk(chosen[1]) && isOk(chosen[2]) && this.res.gastosErrors <= 1,
      paz: isOk(chosen[3]) && hearts >= Math.ceil(maxH / 2),
      first,
      chosen: chosen.map((o) => o && o.v),
      gastosErrors: this.res.gastosErrors,
      actaErrors: this.res.actaErrors,
      hearts,
      maxHearts: maxH,
    };
    s.stage = 'cierre';
    s.flags.caso_cerrado = true;
    writeSave(s);
    this.busy = true;
    const key = this.arriendo() ? 'epilogo' : 'epilogo_entrega';
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Cinematic', { key, next: { scene: 'CaseClosed' } }));
  }
}
