import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4195;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`http://localhost:${port}/?ep=ep00&estilo=litoral`);
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
await page.waitForTimeout(3500);
const info = await page.evaluate(() => {
  const g = window.__aequitas.game;
  const s = g.scene.getScene('World');
  const imgs = s.children.list.filter((c) => c.texture && c.texture.key === 'vineta');
  const src = g.textures.get('vineta').getSourceImage();
  const px = src.getContext && src.getContext('2d').getImageData(0, 0, 1, 1).data;
  const c = src.getContext && src.getContext('2d').getImageData(240, 135, 1, 1).data;
  return {
    vineta: g.textures.exists('vineta'),
    imgs: imgs.length,
    depth: imgs[0]?.depth,
    alpha: imgs[0]?.alpha,
    luzAlpha: s.luz?.fillAlpha,
    w: imgs[0]?.displayWidth,
    esquina: px && Array.from(px),
    centro: c && Array.from(c),
    x: imgs[0]?.x,
    y: imgs[0]?.y,
    visible: imgs[0]?.visible,
    cam: [s.cameras.main.scrollX, s.cameras.main.scrollY, s.cameras.main.zoom],
  };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: 'test-results/estilos/litoral-estacion.png' });
await browser.close();
server.kill();
process.exit(0);
