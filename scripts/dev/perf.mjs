// Tiempos de carga (L1.4) en Chromium sin cabeza: título listo, mundo listo, memoria.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4190;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const out = [];
for (const [nombre, vp, mobile] of [
  ['escritorio', { width: 1280, height: 720 }, false],
  ['móvil 360×740', { width: 360, height: 740 }, true],
]) {
  const context = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const t0 = Date.now();
  await page.goto(`http://localhost:${port}/?ep=ep01`);
  await page.waitForSelector('#game canvas');
  const tCanvas = Date.now() - t0;
  await page.getByRole('button', { name: 'Nueva partida' }).waitFor();
  const tTitulo = Date.now() - t0;
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('.prota__card', { hasText: 'Renata' }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();
  const t1 = Date.now();
  await page.waitForSelector('.hud', { timeout: 20000 });
  const tMundo = Date.now() - t1;
  const transfer = await page.evaluate(() => {
    const res = performance.getEntriesByType('resource');
    const kb = Math.round(
      res.reduce((n, r) => n + (r.transferSize || r.encodedBodySize || 0), 0) / 1024,
    );
    const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    return { recursos: res.length, kbTransferidos: kb, heapMB: mem };
  });
  out.push({
    perfil: nombre,
    msCanvas: tCanvas,
    msTitulo: tTitulo,
    msMundoDesdeEmpezar: tMundo,
    ...transfer,
  });
  await context.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.kill();
process.exit(0);
