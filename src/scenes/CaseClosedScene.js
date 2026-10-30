// CASO CERRADO: el resultado del capítulo. Tres sellos (Legalidad, Equidad y
// Paz), el rango, el puntaje del caso (con récord), las cifras de la partida y
// una página de "Lo que aprendiste". Continuar lleva al anuncio del capítulo 2.

import Phaser from 'phaser';
import { CAMERA } from '../systems/view.js';
import { GAME, COLORS } from '../config.js';
import { CODEX } from '../data/codex.js';
import { PAGES } from '../data/ch1/map.js';
import { GASTOS } from '../data/ch1/hearing.js';
import { getSave, writeSave } from '../systems/save.js';
import { orderValue, orderLevel, LEVELS } from '../systems/order.js';
import { startAudio, playTheme, sfx } from '../systems/audio.js';
import { vibrate } from '../systems/haptics.js';

const SEALS = [
  { k: 'legalidad', name: 'LEGALIDAD', icon: 'ic_law', yes: 'Tu propuesta se ajustó a la ley desde el primer intento.', no: 'Pista: decide con las pruebas y el Códice, a la primera.' },
  { k: 'equidad', name: 'EQUIDAD', icon: 'ic_pact', yes: 'Nadie ganó todo, nadie perdió todo: el puerto sigue pescando.', no: 'Pista: busca un acuerdo en el que todos puedan seguir.' },
  { k: 'paz', name: 'PAZ', icon: 'ic_dove', yes: 'Reparar en vez de castigar, con la asamblea en calma.', no: 'Pista: la reparación sana más que el olvido. Cuida la confianza (♥).' },
];

const LESSONS = [
  ['Lo perdido sigue teniendo dueño', 'Por ocupación solo se adquiere lo que no es de nadie. Quien encuentra algo debe buscar a su dueño.', 'C. C., arts. 685, 704 y 705'],
  ['Poseer no es ser dueño', 'Al poseedor se le tiene por dueño mientras otro no demuestre serlo. La matrícula y la placa lo demostraron.', 'C. C., arts. 669 y 762'],
  ['El tiempo cuenta, con reglas', 'Sin justo título, volverse dueño por prescripción exige 10 años de posesión. Siete no bastan.', 'C. C., arts. 2529 y 2532'],
  ['La buena fe protege', 'Quien posee de buena fe no devuelve los frutos, y se le reconocen los gastos necesarios y las mejoras útiles.', 'C. C., arts. 769 y 964 a 967'],
  ['Ni destierro ni confiscación', 'Ni la mayoría puede quitarle a alguien sus bienes ni echarlo del pueblo como castigo.', 'Constitución, art. 34'],
  ['Lo pactado obliga', 'El contrato es ley para quienes lo firman, y el acta de conciliación presta mérito ejecutivo y tiene carácter de cosa juzgada.', 'C. C., art. 1602 · Ley 2220 de 2022, art. 64'],
  ['Reparar, no castigar', 'Los daños se valoran con reparación integral y equidad: se paga lo que se debe, ni un peso más.', 'Ley 446 de 1998, art. 16'],
];

export default class CaseClosedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CaseClosed', cameras: CAMERA });
  }

  init() {
    this.save = getSave();
    this.page = 0;
    this.focus = 1; // por defecto: recorrer el puerto restaurado
    this.pending = [];
    this.revealed = false;
  }

  create() {
    if (!this.save) { this.scene.start('Menu'); return; }
    const { WIDTH, HEIGHT } = GAME;
    this.makeDove();
    this.drawBackdrop();
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH - 24, HEIGHT - 20, 0x081016, 0.93).setStrokeStyle(2, 0xe3b04b, 0.7).setDepth(5);
    this.computeResult();
    this.buildResultPage();
    this.buildLessonsPage();
    this.buildButtons();
    this.showPage(0);
    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.moveFocus(-1));
    kb.on('keydown-RIGHT', () => this.moveFocus(1));
    ['X', 'E', 'ENTER', 'SPACE'].forEach((k) => kb.on('keydown-' + k, () => this.press()));
    kb.on('keydown-ESC', () => { if (this.page === 1) this.showPage(0); });
    startAudio().then(() => playTheme('victoria'));
    this.cameras.main.fadeIn(700, 0, 0, 0);
    this.playReveal();
  }

  // Una palomita para el sello de la Paz.
  makeDove() {
    if (this.textures.exists('ic_dove')) return;
    const rows = [
      '..........##..',
      '.........####.',
      '..##....#####.',
      '.####..######.',
      '.###########..',
      '..#########...',
      '...########...',
      '....######....',
      '......###.....',
      '.......#......',
    ];
    const c = this.textures.createCanvas('ic_dove', 14, 14);
    const ctx = c.context;
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') { ctx.fillStyle = '#f6efe0'; ctx.fillRect(x, y + 2, 1, 1); } }));
    ctx.fillStyle = '#e3b04b'; ctx.fillRect(12, 3, 2, 1);
    c.refresh();
  }

  drawBackdrop() {
    const { WIDTH, HEIGHT } = GAME;
    const g = this.add.graphics();
    g.fillGradientStyle(0xe8846b, 0xe8846b, 0x2b4f6c, 0x2b4f6c, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    for (let r = 90; r > 0; r -= 6) { g.fillStyle(0xffb070, 0.035 + (90 - r) / 1500); g.fillCircle(240, 150, r); }
    g.fillStyle(0xffd38a, 1); g.fillCircle(240, 150, 26);
    g.fillStyle(0x5a3a4a, 1);
    for (let x = 0; x < WIDTH; x += 14) g.fillRect(x, 130 - ((x * 37) % 11), 14, 14 + ((x * 37) % 11));
    g.fillStyle(0xb05a4a, 1); g.fillRect(0, 144, WIDTH, HEIGHT - 144);
    g.fillStyle(0xffc08a, 0.5);
    for (let i = 0; i < 30; i++) g.fillRect(200 + ((i * 53) % 80), 150 + ((i * 29) % 110), 6 + (i % 4) * 4, 1);
    // La Niña Mercedes navega despacio al fondo.
    const boat = this.add.graphics();
    boat.fillStyle(0x3a2030, 1); boat.fillRect(0, 0, 60, 8); boat.fillTriangle(60, 0, 72, 0, 60, 8); boat.fillRect(16, -10, 22, 10);
    boat.setPosition(-80, 160);
    this.tweens.add({ targets: boat, x: WIDTH + 20, duration: 40000, repeat: -1 });
    this.tweens.add({ targets: boat, y: 162, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // ----------------------------------------------------------- resultado
  computeResult() {
    const s = this.save;
    const r = s.result || {};
    const codex = Object.keys(s.codex || {}).filter((id) => CODEX[id]).length;
    const pages = PAGES.filter((p) => s.codex && s.codex[p.id]).length;
    const quiz = (s.scores && s.scores.quiz) || 0;
    const seals = SEALS.filter((x) => r[x.k]).length;
    const st = s.stats || {};
    const order = orderValue(s);
    const raw = 500 + seals * 250 + codex * 10 + pages * 40 + quiz * 10 + order * 3
      - (st.wrong || 0) * 40 - (st.hints || 0) * 20 - (r.gastosErrors || 0) * 25 - (r.actaErrors || 0) * 15;
    const score = Math.max(100, raw);
    const best = (s.best && s.best.ch1) || 0;
    this.newRecord = score > best;
    if (this.newRecord) { s.best = { ...(s.best || {}), ch1: score }; writeSave(s); }
    this.R = { r, codex, pages, quiz, seals, st, score, best: Math.max(best, score), order, level: orderLevel(order) };
  }

  rankName(n) {
    return n >= 3 ? 'Conciliación de Oro' : n === 2 ? 'Conciliación de Plata' : n === 1 ? 'Conciliación de Bronce' : 'Primeros pasos en conciliación';
  }

  buildResultPage() {
    const { WIDTH } = GAME;
    const R = this.R;
    const objs = [];
    const add = (o) => { o.setDepth(10); objs.push(o); return o; };
    this.title = add(this.add.text(WIDTH / 2, 16, 'CASO CERRADO', { fontFamily: 'Georgia, serif', fontSize: '20px', color: COLORS.gold, padding: { x: 4, y: 4 } }).setOrigin(0.5, 0).setAlpha(0));
    this.sub = add(this.add.text(WIDTH / 2, 44, 'Capítulo 1 · Puerto Garza · La lancha de la discordia', { fontFamily: 'Georgia, serif', fontSize: '9px', color: COLORS.cream }).setOrigin(0.5, 0).setAlpha(0));
    this.sealObjs = SEALS.map((d, i) => {
      const x = 104 + i * 136;
      const y = 88;
      const got = !!R.r[d.k];
      const c = this.add.container(x, y).setDepth(10).setAlpha(0);
      const g = this.add.graphics();
      if (got) {
        g.fillStyle(0x8a2420, 1);
        for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.fillCircle(Math.cos(a) * 21, Math.sin(a) * 21, 7); }
        g.fillStyle(0xa8302a, 1); g.fillCircle(0, 0, 23);
        g.lineStyle(2, 0xd8584a, 1); g.strokeCircle(0, 0, 16);
        g.fillStyle(0xa8302a, 1); g.fillTriangle(-12, 20, -2, 20, -10, 36); g.fillTriangle(12, 20, 2, 20, 10, 36);
      } else {
        g.lineStyle(1, 0x7a8a90, 0.8);
        for (let k = 0; k < 16; k += 2) {
          g.beginPath();
          g.arc(0, 0, 22, (k / 16) * Math.PI * 2, ((k + 1) / 16) * Math.PI * 2);
          g.strokePath();
        }
      }
      c.add(g);
      c.add(this.add.image(0, 0, d.icon).setScale(2).setAlpha(got ? 1 : 0.3));
      c.add(this.add.text(0, 40, d.name, { fontFamily: 'monospace', fontSize: '9px', color: got ? COLORS.gold : '#7a8a90' }).setOrigin(0.5, 0));
      c.add(this.add.text(0, 54, got ? d.yes : d.no, { fontFamily: 'Georgia, serif', fontSize: '8px', color: got ? COLORS.cream : '#9fb0b8', align: 'center', wordWrap: { width: 124 }, lineSpacing: 1 }).setOrigin(0.5, 0));
      objs.push(c);
      return { c, got };
    });
    this.rank = add(this.add.text(WIDTH / 2, 164, '★'.repeat(R.seals) + '☆'.repeat(3 - R.seals) + '  ' + this.rankName(R.seals), { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#ffe9a0' }).setOrigin(0.5, 0).setAlpha(0));
    this.orderLine = add(this.add.text(WIDTH / 2, 181, `⚖ Equilibrio del puerto: ${R.order}% · de ${LEVELS[0].name} a ${R.level.name}`, { fontFamily: 'Georgia, serif', fontSize: '9px', color: R.order >= 100 ? '#8fd694' : '#9fd3cf' }).setOrigin(0.5, 0).setAlpha(0));
    this.scoreText = add(this.add.text(WIDTH / 2, 195, '', { fontFamily: 'monospace', fontSize: '10px', color: COLORS.cream }).setOrigin(0.5, 0).setAlpha(0));
    const st = R.st;
    const hearts = R.r.hearts != null ? `${R.r.hearts}/${R.r.maxHearts}` : '—';
    const receipts = GASTOS.items.length - (R.r.gastosErrors || 0);
    this.stats = add(this.add.text(WIDTH / 2, 211, [
      `Objeciones fallidas ${st.wrong || 0}  ·  Pistas ${st.hints || 0}  ·  Calma de Tinto ${st.calm || 0}  ·  Confianza final ${hearts}`,
      `Códice ${R.codex}/${Object.keys(CODEX).length}  ·  Páginas perdidas ${R.pages}/${PAGES.length}  ·  Recibos bien ${Math.max(0, receipts)}/${GASTOS.items.length}  ·  Radio ${R.quiz}/10`,
    ].join('\n'), { fontFamily: 'monospace', fontSize: '7px', color: '#9fd3cf', align: 'center', lineSpacing: 3 }).setOrigin(0.5, 0).setAlpha(0));
    this.resultObjs = objs;
  }

  buildLessonsPage() {
    const { WIDTH } = GAME;
    const objs = [];
    const add = (o) => { o.setDepth(10); objs.push(o); return o; };
    add(this.add.text(WIDTH / 2, 16, 'LO QUE APRENDISTE EN PUERTO GARZA', { fontFamily: 'Georgia, serif', fontSize: '13px', color: COLORS.gold, padding: { x: 2, y: 2 } }).setOrigin(0.5, 0));
    let y = 38;
    LESSONS.forEach(([t, d, ley]) => {
      add(this.add.image(30, y + 5, 'ic_law').setScale(0.8));
      const head = add(this.add.text(42, y, t, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#ffe9a0' }));
      add(this.add.text(42 + head.width + 6, y + 1, ley, { fontFamily: 'monospace', fontSize: '7px', color: '#9fd3cf' }));
      const body = add(this.add.text(42, y + 12, d, { fontFamily: 'Georgia, serif', fontSize: '8px', color: COLORS.cream, wordWrap: { width: WIDTH - 72 } }));
      y += 14 + body.height + 3;
    });
    add(this.add.text(WIDTH / 2, y + 2, 'Contenido pedagógico: no es asesoría jurídica.', { fontFamily: 'monospace', fontSize: '7px', color: '#7a8a90' }).setOrigin(0.5, 0));
    this.lessonObjs = objs;
  }

  buildButtons() {
    const { WIDTH } = GAME;
    const mk = (x, label, cb) => {
      const bg = this.add.rectangle(x, 248, 144, 20, 0x16303a, 0.96).setDepth(20).setInteractive({ useHandCursor: true });
      const t = this.add.text(x, 248, label, { fontFamily: 'Georgia, serif', fontSize: '10px', color: COLORS.cream }).setOrigin(0.5).setDepth(21);
      bg.on('pointerdown', () => { if (!this.revealed) { this.revealAll(); return; } cb(); });
      bg.on('pointerover', () => { this.focus = this.btns.indexOf(o); this.paintButtons(); });
      const o = { bg, t, cb };
      return o;
    };
    this.btns = [
      mk(WIDTH / 2 - 152, 'Lo que aprendiste', () => this.showPage(this.page === 0 ? 1 : 0)),
      mk(WIDTH / 2, 'Recorrer el puerto', () => this.walkTown()),
      mk(WIDTH / 2 + 152, 'Continuar ▸', () => this.continue()),
    ];
    this.btns.forEach((b) => { b.bg.setAlpha(0); b.t.setAlpha(0); });
    this.paintButtons();
  }

  paintButtons() {
    this.btns.forEach((b, i) => b.bg.setStrokeStyle(2, i === this.focus ? 0xffe070 : 0x3fa3a0, i === this.focus ? 1 : 0.6));
    this.btns[0].t.setText(this.page === 0 ? 'Lo que aprendiste' : '◂ Resultado');
  }

  moveFocus(d) {
    if (!this.revealed) return;
    this.focus = Phaser.Math.Wrap(this.focus + d, 0, this.btns.length);
    sfx('select');
    this.paintButtons();
  }

  press() {
    if (!this.revealed) { this.revealAll(); return; }
    this.btns[this.focus].cb();
  }

  showPage(n) {
    this.page = n;
    this.resultObjs.forEach((o) => o.setVisible(n === 0));
    this.lessonObjs.forEach((o) => o.setVisible(n === 1));
    if (n === 1) sfx('page');
    this.paintButtons();
  }

  // ----------------------------------------------------------- animación
  later(ms, fn) {
    const ev = this.time.delayedCall(ms, () => { this.pending = this.pending.filter((p) => p.ev !== ev); fn(true); });
    this.pending.push({ ev, fn });
  }

  playReveal() {
    const R = this.R;
    this.later(300, (anim) => { this.title.setAlpha(1); this.sub.setAlpha(1); if (anim) { this.title.setScale(1.6); this.tweens.add({ targets: this.title, scale: 1, duration: 400, ease: 'Back.out' }); sfx('gate'); } });
    this.sealObjs.forEach((s, i) => this.later(1000 + i * 650, (anim) => {
      s.c.setAlpha(1);
      if (!anim) return;
      s.c.setScale(2.2);
      this.tweens.add({ targets: s.c, scale: 1, duration: 260, ease: 'Back.in' });
      if (s.got) { this.time.delayedCall(240, () => { sfx('seal'); vibrate(30); this.cameras.main.shake(140, 0.008); }); } else sfx('select');
    }));
    this.later(3100, (anim) => {
      this.rank.setAlpha(1);
      this.orderLine.setAlpha(1);
      this.scoreText.setAlpha(1);
      const show = (v) => this.scoreText.setText(`Puntaje del caso: ${Math.round(v)}   ·   Récord: ${R.best}${this.newRecord ? '   ¡Nuevo récord!' : ''}`);
      if (!anim) { show(R.score); return; }
      sfx('treasure');
      const o = { v: 0 };
      this.tweens.add({ targets: o, v: R.score, duration: 900, ease: 'Cubic.out', onUpdate: () => show(o.v), onComplete: () => show(R.score) });
    });
    this.later(4100, () => this.finishReveal());
  }

  finishReveal() {
    this.revealed = true;
    this.stats.setAlpha(1);
    this.btns.forEach((b) => { b.bg.setAlpha(1); b.t.setAlpha(1); });
  }

  // Saltar la animación: todo aparece en su sitio.
  revealAll() {
    const left = this.pending;
    this.pending = [];
    left.forEach((p) => { p.ev.remove(false); p.fn(false); });
    if (!this.revealed) this.finishReveal();
  }

  // Volver a Puerto Garza, ahora en orden: color, banderines, gente en la plaza.
  walkTown() {
    if (this.leaving) return;
    this.leaving = true;
    sfx('confirm');
    this.save.stage = 'libre';
    writeSave(this.save);
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Town'));
  }

  continue() {
    if (this.leaving) return;
    this.leaving = true;
    sfx('confirm');
    this.save.flags.cap1_visto = true;
    writeSave(this.save);
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Cinematic', { key: 'siguiente', next: { scene: 'Postcard', data: { key: 'siete_puentes', next: { scene: 'Menu' } } } }));
  }
}
