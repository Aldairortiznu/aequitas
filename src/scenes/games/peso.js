// EL PESO JUSTO: en la balanza de la Junta, pon pesas hasta que el brazo quede
// en equilibrio. Así se sabe cuánto pesa de verdad cada carga... y si la balanza
// de Don Chepe marca bien.

import Phaser from 'phaser';
import { GAME, COLORS } from '../../config.js';
import { PESO } from '../../data/ch1/games.js';
import { sfx } from '../../systems/audio.js';

const CX = 240;
const CY = 108;

export default {
  name: 'El peso justo',
  how: 'Pon la carga en un platillo y las pesas de la Junta en el otro (toca las pesas o pulsa 1-4). Cuando el brazo quede derecho, sabrás cuánto pesa de verdad. Compáralo con lo que marca la balanza de Don Chepe.',

  build(s) {
    const { WIDTH, HEIGHT } = GAME;
    const g = s.add.graphics();
    g.fillGradientStyle(0xe8d8b0, 0xe8d8b0, 0xcdbf94, 0xcdbf94, 1); g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle(0xa89c86, 1); g.fillRect(0, 196, WIDTH, HEIGHT - 196);
    for (let x = 0; x < WIDTH; x += 24) { g.fillStyle(0xbdb29a, 1); g.fillRect(x + 1, 198, 22, 10); g.fillRect(x + 13, 210, 22, 10); }
    g.fillStyle(0x3fa3a0, 1); g.fillRect(0, 0, WIDTH, 22); g.fillStyle(0xf3ecd8, 1); for (let x = 0; x < WIDTH; x += 24) g.fillRect(x, 0, 12, 22);
    s.title('El peso justo', '');
    s.chepe = s.add.image(40, 200, 'npc_chepe').setOrigin(0.5, 1).setScale(2.4).setDepth(5);
    s.nubia = s.add.image(440, 200, 'npc_nubia').setOrigin(0.5, 1).setScale(2.4).setDepth(5).setFlipX(true);
    // La balanza: pedestal, brazo que gira y dos platillos colgantes.
    s.add.image(CX, CY + 76, 'ui_pillar').setOrigin(0.5, 1).setScale(2).setDepth(8);
    s.beam = s.add.image(CX, CY, 'ui_beam').setScale(2.6, 2).setDepth(9);
    s.panL = s.add.container(CX - 80, CY).setDepth(10);
    s.panR = s.add.container(CX + 80, CY).setDepth(10);
    [s.panL, s.panR].forEach((p) => p.add(s.add.image(0, 0, 'ui_pan').setOrigin(0.5, 0).setScale(2.2)));
    s.cargaBox = s.add.container(0, 0);
    s.panL.add(s.cargaBox);
    s.rightStack = s.add.container(0, 0);
    s.panR.add(s.rightStack);
    s.readout = s.add.text(CX, 36, '', { fontFamily: 'monospace', fontSize: '10px', color: '#2a2018', backgroundColor: '#efe3c2', padding: { x: 6, y: 3 }, align: 'center' }).setOrigin(0.5, 0).setDepth(30);
    s.angle = 0;
  },

  start(s) {
    s.round = 0;
    s.errors = 0;
    s.weights = PESO.weights.map((w, i) => ({ w, on: false, i }));
    s.wBtns = s.weights.map((it, i) => {
      const b = s.button(150 + i * 60, 232, 50, 30, `${it.w} kg`, () => this.toggle(s, i), { size: '11px', fill: 0x5a3a20, hover: 0x7a5228 });
      return b;
    });
    s.key(['ONE'], () => this.toggle(s, 0));
    s.key(['TWO'], () => this.toggle(s, 1));
    s.key(['THREE'], () => this.toggle(s, 2));
    s.key(['FOUR'], () => this.toggle(s, 3));
    s.onUpdate(() => this.animate(s));
    this.showRound(s);
  },

  showRound(s) {
    const r = PESO.rounds[s.round];
    s.locked = false;
    s.weights.forEach((w) => { w.on = false; });
    this.refreshButtons(s);
    s.cargaBox.removeAll(true);
    const basket = s.add.graphics();
    basket.fillStyle(0x8a6034, 1); basket.fillRoundedRect(-22, -2, 44, 18, 4); basket.fillStyle(0xa8783f, 1); basket.fillRect(-20, 0, 40, 3);
    const n = Math.min(8, r.real + 1);
    for (let i = 0; i < n; i++) {
      const fx = -16 + (i % 4) * 10;
      const fy = -6 - Math.floor(i / 4) * 6;
      basket.fillStyle(s.round === 0 ? 0xf2c230 : 0x9fb8c0, 1); basket.fillEllipse(fx, fy, 12, 6);
    }
    basket.y = 26;
    s.cargaBox.add(basket);
    s.cargaBox.add(s.add.text(0, 50, r.what, { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#2a2018' }).setOrigin(0.5, 0));
    s.readout.setText(`Ronda ${s.round + 1}/${PESO.rounds.length} · La balanza de Chepe marca: ${r.shown} kg\n¿Cuánto pesa de verdad?`);
    this.rebalance(s);
  },

  toggle(s, i) {
    if (s.locked) return;
    s.weights[i].on = !s.weights[i].on;
    sfx('select');
    this.refreshButtons(s);
    this.rebalance(s);
  },

  refreshButtons(s) {
    s.wBtns.forEach((b, i) => {
      const on = s.weights[i].on;
      b.setAlpha(on ? 0.45 : 1);
      b.bg.setStrokeStyle(2, on ? 0x8fd694 : 0xe3b04b, 0.9);
    });
    s.rightStack.removeAll(true);
    let y = 22;
    s.weights.filter((w) => w.on).forEach((w) => {
      const h = 5 + w.w * 2;
      const r = s.add.rectangle(0, y - h / 2, 14 + w.w * 3, h, 0x5c6468).setStrokeStyle(1, 0x2a2f33);
      s.rightStack.add(r);
      s.rightStack.add(s.add.text(0, y - h / 2, w.w + '', { fontFamily: 'monospace', fontSize: '7px', color: '#ffffff' }).setOrigin(0.5));
      y -= h;
    });
  },

  rebalance(s) {
    const r = PESO.rounds[s.round];
    const right = s.weights.filter((w) => w.on).reduce((a, w) => a + w.w, 0);
    const diff = r.real - right;
    // Carga más pesada → baja el platillo izquierdo (ángulo negativo).
    s.target = Phaser.Math.Clamp(-diff * 4, -22, 22);
    if (diff === 0 && !s.locked) {
      s.locked = true;
      s.time.delayedCall(500, () => this.balanced(s, r));
    }
  },

  animate(s) {
    s.angle = Phaser.Math.Linear(s.angle, s.target || 0, 0.12);
    s.beam.setAngle(s.angle);
    const rad = Phaser.Math.DegToRad(s.angle);
    const dx = Math.cos(rad) * 80;
    const dy = Math.sin(rad) * 80;
    s.panL.setPosition(CX - dx, CY - dy);
    s.panR.setPosition(CX + dx, CY + dy);
  },

  balanced(s, r) {
    const off = r.real - r.shown;
    s.good(CX, CY);
    if (off === 0) {
      s.pop('¡Equilibrio! ' + r.real + ' kg', '#2f6b3f', 150, '15px');
      s.readout.setText(`Pesa ${r.real} kg y la balanza de Chepe marca ${r.shown}: ¡coinciden!`);
    } else {
      s.pop(`¡${r.real} kg de verdad!`, '#b5562c', 150, '15px');
      s.readout.setText(`Pesa ${r.real} kg, pero la balanza de Chepe marca ${r.shown}.\n¡A Nubia le faltaron ${off} kg!`);
      s.tweens.add({ targets: s.nubia, y: 194, duration: 120, yoyo: true, repeat: 2 });
    }
    s.time.delayedCall(2300, () => {
      if (s.ended) return;
      s.round++;
      if (s.round >= PESO.rounds.length) {
        s.win(3, 'La balanza de Chepe se equivoca más cuanto más peso lleva: tiene el platillo doblado. Nadie quería engañar, pero el resultado era injusto. Cumplir de buena fe es también medir bien.');
        return;
      }
      this.showRound(s);
    });
  },
};
