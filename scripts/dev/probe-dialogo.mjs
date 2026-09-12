import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '4181', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto('http://localhost:4181/?ep=gym');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
await page.evaluate(() =>
  window.__aequitas.session.bus.emit('world:interact', {
    kind: 'npc',
    id: 'npc-nepomuceno',
    payload: { personaje: 'nepomuceno', dialogo: 'gym-bienvenida' },
  }),
);
await page.waitForSelector('.dlg', { timeout: 5000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'test-results/dialogo-1.png' });
const t1 = await page.textContent('.dlg__text');
await page.keyboard.press('Enter');
await page.waitForTimeout(3200);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.screenshot({ path: 'test-results/dialogo-2.png' });
const opts = await page.$$eval('.dlg__opt', (els) => els.map((e) => e.textContent));
await page.keyboard.press('1');
await page.waitForTimeout(2200);
await page.keyboard.press('Enter');
await page.waitForTimeout(2600);
await page.screenshot({ path: 'test-results/dialogo-3.png' });
const opts2 = await page.$$eval('.dlg__opt', (els) => els.map((e) => e.textContent));
await page.keyboard.press('1');
await page.waitForTimeout(2600);
await page.screenshot({ path: 'test-results/dialogo-4.png' });
const t4 = await page.textContent('.dlg__text');
await page.keyboard.press('Enter');
await page.waitForTimeout(2600);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
const st = await page.evaluate(() => {
  const s = window.__aequitas.session.state;
  return {
    flags: s.flags,
    codice: s.codice,
    leg: s.legitimidad,
    open: Boolean(document.querySelector('.dlg')),
  };
});
console.log(JSON.stringify({ t1, opts, opts2, t4, st, errors }, null, 1));
await browser.close();
server.kill();
process.exit(0);
