import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '4181', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:4181/');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.keyboard.press('Enter');
await page.waitForSelector('.hud', { timeout: 10000 });
await page.evaluate(async () => {
  const s = window.__aequitas.session;
  await s.applyNow([
    { type: 'addEvidence', id: 'gym-acta-sin-firma' },
    { type: 'addEvidence', id: 'gym-certificado-falso' },
    { type: 'unlockCodice', id: 'cp-4' },
    { type: 'unlockCodice', id: 'cp-29' },
    { type: 'registrarVoz', id: 'gym-testimonio-eladio' },
  ]);
});
await page.keyboard.press('z');
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/panel-zurron.png' });
await page.locator('.list__item').nth(1).click();
await page.waitForTimeout(200);
await page.locator('button.btn:has-text("Cotejar")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'test-results/panel-zurron-cotejo.png' });
await page.keyboard.press('c');
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/panel-codice.png' });
await page.keyboard.press('v');
await page.waitForTimeout(300);
const voces = await page.$$eval('.tabla td', (t) => t.map((x) => x.textContent));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
console.log(JSON.stringify({ voces, panelOpen: await page.locator('.panel').count() }));
await browser.close();
server.kill();
process.exit(0);
