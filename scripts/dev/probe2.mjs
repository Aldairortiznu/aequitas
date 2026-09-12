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
await page.goto('http://localhost:4181/');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.keyboard.press('Enter');
await page.waitForSelector('.hud', { timeout: 10000 });
const pos = () =>
  page.evaluate(() => {
    const sc = window.__aequitas.game.scene.getScene('World');
    return { x: sc.player.x, y: sc.player.y };
  });
const hold = async (k, ms) => {
  await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  await page.keyboard.up(k);
};
const walkTo = async (tx, ty) => {
  const axis = async (keyOf, get, target) => {
    for (let i = 0; i < 80; i++) {
      const p = await pos();
      const d = target - get(p);
      if (Math.abs(d) <= 3) return;
      const ms = Math.min(350, Math.max(40, (Math.abs(d) / 80) * 1000 * 0.8));
      await hold(keyOf(d), ms);
    }
  };
  await axis(
    (d) => (d > 0 ? 'ArrowRight' : 'ArrowLeft'),
    (p) => p.x,
    tx,
  );
  await axis(
    (d) => (d > 0 ? 'ArrowDown' : 'ArrowUp'),
    (p) => p.y,
    ty,
  );
};
await walkTo(312, 306);
await walkTo(106, 306);
console.log('pos', await pos());
const focus = await page.evaluate(() => {
  const sc = window.__aequitas.game.scene.getScene('World');
  return {
    focus: sc.focus?.obj?.name ?? null,
    uiOpen: sc.uiOpen,
    frozen: sc.frozen,
    icon: sc.focusIcon.visible,
  };
});
console.log('focus', focus);
await page.keyboard.press('e');
await page.waitForTimeout(400);
console.log(
  'toast',
  await page.evaluate(() => document.querySelector('.ui-toast')?.textContent ?? null),
);
console.log('codice', await page.evaluate(() => window.__aequitas.session.state.codice));
console.log('errores', errors);
await browser.close();
server.kill();
process.exit(0);
