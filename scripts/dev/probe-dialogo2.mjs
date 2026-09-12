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
await page.evaluate(() =>
  window.__aequitas.session.bus.emit('world:interact', {
    kind: 'npc',
    id: 'npc-nepomuceno',
    payload: { personaje: 'nepomuceno', dialogo: 'gym-bienvenida' },
  }),
);
await page.waitForSelector('.dlg');
const sample = async (label) =>
  console.log(
    label,
    JSON.stringify(
      await page.evaluate(() => ({
        t: document.querySelector('.dlg__text')?.textContent,
        opts: document.querySelectorAll('.dlg__opt').length,
      })),
    ),
  );
await page.waitForTimeout(300);
await sample('t=300');
await page.keyboard.press('Enter');
await page.waitForTimeout(100);
await sample('tras Enter1');
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(100);
await sample('tras Enter2 +100');
await page.waitForTimeout(500);
await sample('+600');
await page.waitForTimeout(1500);
await sample('+2100');
await page.waitForTimeout(2000);
await sample('+4100');
await browser.close();
server.kill();
process.exit(0);
