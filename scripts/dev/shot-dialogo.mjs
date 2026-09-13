// Captura un diálogo concreto (para revisar retratos): node scripts/dev/shot-dialogo.mjs ep01 ep01-pilar salida.png
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const [ep = 'ep01', dlg = 'ep01-pilar', out = 'test-results/arte/dialogo.png'] =
  process.argv.slice(2);
const port = 4191;
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
await page.evaluate((id) => {
  void window.__aequitas.session.runActions([{ type: 'dialogue', id }]);
}, dlg);
await page.waitForSelector('.dlg');
await page.waitForTimeout(3500);
await page.screenshot({ path: out });
await browser.close();
server.kill();
process.exit(0);
