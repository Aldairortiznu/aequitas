import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '4181', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:4181/');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.keyboard.press('Enter');
await page.waitForSelector('.hud', { timeout: 10000 });
await page.evaluate(() => {
  const s = window.__aequitas.session;
  window.__log = [];
  s.bus.on('world:interact', (e) =>
    window.__log.push(['interact', e.kind, e.id, performance.now() | 0]),
  );
  s.bus.on('ui:opened', () => window.__log.push(['opened', performance.now() | 0]));
  s.bus.on('ui:closed', () => window.__log.push(['closed', performance.now() | 0]));
});
const hold = async (k, ms) => {
  await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  await page.keyboard.up(k);
  await page.waitForTimeout(60);
};
await hold('ArrowUp', 700);
await hold('ArrowRight', 800);
await page.keyboard.press('e');
await page.waitForTimeout(600);
const snap = async (l) =>
  console.log(
    l,
    JSON.stringify(
      await page.evaluate(() => ({
        t: document.querySelector('.dlg__text')?.textContent?.slice(0, 30),
        opts: [...document.querySelectorAll('.dlg__opt')].map((o) => o.textContent),
      })),
    ),
  );
await snap('abierto');
for (let i = 0; i < 8; i++) {
  const n = await page.locator('.dlg__opt').count();
  if (n > 0) await page.locator('.dlg__opt').last().click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await snap('paso ' + i);
  if ((await page.locator('.dlg').count()) === 0) {
    console.log('cerrado en paso', i);
    break;
  }
}
await page.waitForTimeout(1500);
console.log('final dlg:', await page.locator('.dlg').count());
console.log(JSON.stringify(await page.evaluate(() => window.__log)));
await browser.close();
server.kill();
process.exit(0);
