// Prueba y captura de la escena lateral (?escena=lateral): movimiento, salto, acta, puerta,
// azotea. Deja las capturas en test-results/lateral/.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const port = 4195;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const out = 'test-results/lateral';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const estilo = process.argv[2] ?? 'litoral';
const movil = process.argv.includes('--movil');
const ctx = await browser.newContext(
  movil
    ? { viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true }
    : { viewport: { width: 960, height: 540 } },
);
const page = await ctx.newPage();
const errores = [];
page.on('pageerror', (e) => errores.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errores.push(m.text());
});
await page.goto(`http://localhost:${port}/?escena=lateral&estilo=${estilo}`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(3000);
const suf = movil ? '-movil' : '';
await page.screenshot({ path: `${out}/01-calle${suf}.png` });

const estado = () =>
  page.evaluate(() => {
    const s = window.__aequitas.game.scene.getScene('Lateral');
    const b = s.player.body;
    return {
      x: Math.round(s.player.x),
      y: Math.round(s.player.y),
      vy: Math.round(b.velocity.y),
      suelo: b.blocked.down,
      acta: s.tieneActa,
      objetivo: s.objetivo,
      saltos: s.saltos,
      caidas: s.caidas,
      fin: s.terminado,
    };
  });
const tp = (tx, ty) =>
  page.evaluate(
    ([x, y]) => {
      const s = window.__aequitas.game.scene.getScene('Lateral');
      s.player.setPosition(x * 16 + 8, y * 16);
      s.player.body.reset(x * 16 + 8, y * 16);
    },
    [tx, ty],
  );

const e0 = await estado();
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(1200);
await page.keyboard.up('ArrowRight');
const e1 = await estado();
console.log('camina', e0.x, '→', e1.x, e1.x > e0.x + 60 ? 'ok' : 'FALLO');

await page.keyboard.press('Space');
await page.waitForTimeout(160);
const e2 = await estado();
await page.waitForTimeout(700);
const e3 = await estado();
console.log(
  'salta',
  e2.y < e1.y - 10 && !e2.suelo ? 'sube ok' : `FALLO (y ${e1.y}→${e2.y})`,
  e3.suelo ? 'aterriza ok' : 'FALLO no aterriza',
  'saltos',
  e3.saltos,
);

// Habla con Pilar
await tp(20, 28);
await page.waitForTimeout(200);
await page.keyboard.press('KeyE');
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/02-pilar${suf}.png` });

// Acta: subir por los barriles y el estante (teletransporte a la repisa)
await tp(30, 25);
await page.waitForTimeout(300);
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(120);
await page.keyboard.down('Space');
await page.waitForTimeout(300);
await page.keyboard.up('Space');
await page.waitForTimeout(500);
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(400);
let e4 = await estado();
console.log('salto a la repisa', e4.acta ? 'acta recogida ok' : `sin acta (x ${e4.x} y ${e4.y})`);
if (!e4.acta) {
  await tp(33, 23);
  await page.waitForTimeout(400);
  e4 = await estado();
  console.log('acta por teletransporte', e4.acta ? 'ok' : 'FALLO');
}
await page.screenshot({ path: `${out}/03-lobby${suf}.png` });

// Puerta del piso 2
await tp(38, 21);
await page.waitForTimeout(200);
await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(900);
await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(200);
const e5 = await estado();
console.log('puerta', e5.objetivo === 'valvula' ? 'abierta ok' : `FALLO objetivo=${e5.objetivo}`);
await page.screenshot({ path: `${out}/04-puerta${suf}.png` });

// Piso 3 y hueco
await tp(24, 14);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/05-piso3${suf}.png` });

// Escalera: trepar
await tp(52, 13);
await page.waitForTimeout(200);
const e6 = await estado();
await page.keyboard.down('ArrowUp');
await page.waitForTimeout(1200);
await page.keyboard.up('ArrowUp');
const e7 = await estado();
console.log('trepa', e6.y, '→', e7.y, e7.y < e6.y - 30 ? 'ok' : 'FALLO');

// Azotea hasta la válvula
await tp(48, 7);
await page.waitForTimeout(200);
await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(4600);
await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(400);
const e8 = await estado();
console.log('válvula', e8.fin ? 'fin ok' : `FALLO x=${e8.x}`);
await page.screenshot({ path: `${out}/06-fin${suf}.png` });
console.log('errores', errores.length ? errores : 'ninguno');
await browser.close();
server.kill();
process.exit(0);
