// Captura un mapa del episodio: node scripts/dev/shot-mapa.mjs ep00 boveda entrada salida.png
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const [ep = 'ep00', mapa = 'boveda', spawnName = 'entrada', out = 'test-results/arte/mapa.png'] =
  process.argv.slice(2);
const port = 4192;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`http://localhost:${port}/?ep=${ep}`);
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
await page.evaluate(
  ([m, s]) => {
    void window.__aequitas.session.runActions([{ type: 'teleport', map: m, spawn: s }]);
  },
  [mapa, spawnName],
);
await page.waitForTimeout(800);
for (let i = 0; i < 14 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();
server.kill();
process.exit(0);
