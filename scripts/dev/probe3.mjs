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
const pos = () =>
  page.evaluate(() => {
    const sc = window.__aequitas.game.scene.getScene('World');
    return {
      x: Math.round(sc.player.x),
      y: Math.round(sc.player.y),
      ui: sc.uiOpen,
      fr: sc.frozen,
      dlg: !!document.querySelector('.dlg'),
    };
  });
const hold = async (k, ms) => {
  await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  await page.keyboard.up(k);
  await page.waitForTimeout(60);
};
console.log('inicio', await pos());
await hold('ArrowUp', 300);
console.log('up300', await pos());
await hold('ArrowUp', 300);
console.log('up300', await pos());
await hold('ArrowUp', 120);
console.log('up120', await pos());
for (let i = 0; i < 6; i++) {
  await hold('ArrowRight', 150);
  console.log('right150', await pos());
}
await page.keyboard.press('e');
await page.waitForTimeout(500);
console.log('e', await pos());
await page.screenshot({ path: 'test-results/probe3.png' });
await browser.close();
server.kill();
process.exit(0);
