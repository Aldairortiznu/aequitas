// Captura la galería y escenas del juego con cada dirección estética.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4194;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const out = 'test-results/estilos';
import { mkdirSync } from 'node:fs';
mkdirSync(out, { recursive: true });
const estilos = (process.argv[2] ?? 'esmeralda,litoral,grabado').split(',');
const escenas = (process.argv[3] ?? 'galeria,lobby,estacion,torre').split(',');
for (const estilo of estilos) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  if (escenas.includes('galeria')) {
    await page.goto(`http://localhost:${port}/?escena=galeria&estilo=${estilo}`);
    await page.waitForSelector('#game canvas');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/${estilo}-galeria.png` });
  }
  const mundo = escenas.filter((e) => e !== 'galeria');
  if (mundo.length) {
    const ep = mundo.includes('estacion') && !mundo.includes('lobby') ? 'ep00' : 'ep01';
    await page.goto(`http://localhost:${port}/?ep=${ep}&estilo=${estilo}`);
    await page.waitForSelector('#game canvas');
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Nueva partida' }).click();
    await page.locator('.prota__card', { hasText: 'Renata' }).click();
    await page.getByRole('button', { name: 'Empezar' }).click();
    await page.waitForSelector('.hud', { timeout: 15000 });
    for (let i = 0; i < 14 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(500);
    const tp = async (m, s) => {
      await page.evaluate(
        ([mm, ss]) => {
          void window.__aequitas.session.runActions([{ type: 'teleport', map: mm, spawn: ss }]);
        },
        [m, s],
      );
      await page.waitForTimeout(800);
      for (let i = 0; i < 10 && (await page.locator('.dlg').count()) > 0; i++) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(250);
      }
      await page.waitForTimeout(300);
    };
    if (ep === 'ep01') {
      if (mundo.includes('lobby')) await page.screenshot({ path: `${out}/${estilo}-lobby.png` });
      if (mundo.includes('torre')) {
        await tp('torre', 'piso3-desde-lobby');
        await page.screenshot({ path: `${out}/${estilo}-torre.png` });
      }
      if (mundo.includes('piscina')) {
        await tp('piscina', 'entrada');
        await page.screenshot({ path: `${out}/${estilo}-piscina.png` });
      }
      if (mundo.includes('audiencia')) {
        await page.evaluate(() => {
          void window.__aequitas.session.runActions([
            { type: 'setFlag', flag: 'ep01.convocada', value: true },
            { type: 'startAudiencia', id: 'ep01-marrugo' },
          ]);
        });
        await page.waitForSelector('.aud');
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${out}/${estilo}-audiencia.png` });
      }
    } else {
      if (mundo.includes('estacion'))
        await page.screenshot({ path: `${out}/${estilo}-estacion.png` });
    }
  }
  await page.close();
}
await browser.close();
server.kill();
process.exit(0);
