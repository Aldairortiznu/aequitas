// Recorre el mundo lateral (D15) con teclado: lobby, puerta a la torre con E, escalera de la
// torre, piscina y estación del prólogo. Capturas en test-results/mundo-lateral/.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const port = 4196;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const out = 'test-results/mundo-lateral';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errores = [];
page.on('pageerror', (e) => errores.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errores.push(m.text());
});
const estilo = process.argv[2] ?? 'litoral';

const cerrar = async () => {
  for (let i = 0; i < 40; i++) {
    if ((await page.locator('.dlg__opt').count()) > 0)
      await page.locator('.dlg__opt').first().click();
    else if ((await page.locator('.dlg, .cut').count()) > 0) await page.keyboard.press('Enter');
    else return;
    await page.waitForTimeout(220);
  }
};
const estado = () =>
  page.evaluate(() => {
    const s = window.__aequitas.session;
    const w = window.__aequitas.game.scene.getScene('World');
    return { map: s.state.map, x: Math.round(w.player.x), y: Math.round(w.player.y) };
  });
const tp = async (map, sp) => {
  await page.evaluate(
    ([m, s]) => {
      void window.__aequitas.session.runActions([{ type: 'teleport', map: m, spawn: s }]);
    },
    [map, sp],
  );
  await page.waitForTimeout(900);
  await cerrar();
  await page.waitForTimeout(300);
};
const hold = async (k, ms) => {
  await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  await page.keyboard.up(k);
};
const nuevaPartida = async (ep) => {
  await page.goto(`http://localhost:${port}/?ep=${ep}&estilo=${estilo}`);
  await page.waitForSelector('#game canvas');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('.prota__card', { hasText: 'Renata' }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.waitForSelector('.hud', { timeout: 15000 });
  await page.waitForTimeout(600);
  await cerrar();
  await page.waitForTimeout(400);
};

// --- Episodio 1
await nuevaPartida('ep01');
await page.screenshot({ path: `${out}/ep01-lobby-inicio.png` });
const a = await estado();
await hold('ArrowRight', 1500);
const b = await estado();
console.log('camina', a.x, '→', b.x, b.x > a.x + 60 ? 'ok' : 'FALLO');
await page.screenshot({ path: `${out}/ep01-lobby-muro.png` });
await cerrar();
// Puerta a la torre con E
await tp('lobby', 'desde-torre');
await hold('ArrowLeft', 250);
await page.waitForTimeout(200);
await page.keyboard.press('e');
await page.waitForTimeout(1200);
await cerrar();
let s = await estado();
console.log('puerta torre', s.map === 'torre' ? 'ok' : `FALLO map=${s.map}`);
await page.screenshot({ path: `${out}/ep01-torre-p3.png` });
// Escalera piso 3 → 4 (x = 36)
await hold('ArrowRight', 700);
s = await estado();
const y0 = s.y;
await hold('ArrowUp', 2200);
s = await estado();
console.log('escalera', y0, '→', s.y, s.y < y0 - 80 ? 'ok' : 'FALLO');
await hold('ArrowLeft', 1200);
await cerrar();
await page.screenshot({ path: `${out}/ep01-torre-p4.png` });
await tp('piscina', 'entrada');
await hold('ArrowRight', 2600);
await cerrar();
await page.screenshot({ path: `${out}/ep01-piscina.png` });
await tp('sotanos', 'entrada');
await hold('ArrowRight', 1200);
await cerrar();
await page.screenshot({ path: `${out}/ep01-sotanos.png` });

// --- Prólogo
await nuevaPartida('ep00');
await page.screenshot({ path: `${out}/ep00-estacion.png` });
await hold('ArrowLeft', 2200);
await cerrar();
await page.screenshot({ path: `${out}/ep00-estacion-lab.png` });
await tp('laboratorio', 'entrada');
await page.screenshot({ path: `${out}/ep00-laboratorio.png` });
await tp('boveda', 'entrada');
await hold('ArrowLeft', 1500);
await cerrar();
await page.screenshot({ path: `${out}/ep00-boveda.png` });
await tp('herbario', 'entrada');
await page.screenshot({ path: `${out}/ep00-herbario.png` });
await tp('estacion', 'desde-herbario');
await hold('ArrowRight', 2600);
await cerrar();
await page.screenshot({ path: `${out}/ep00-muelle.png` });
console.log('errores', errores.length ? errores.slice(0, 5) : 'ninguno');
await browser.close();
server.kill();
process.exit(0);
