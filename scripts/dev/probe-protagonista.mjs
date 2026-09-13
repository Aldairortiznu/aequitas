// Sonda D10: selector de protagonista, creador y tratamiento en los textos.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4188;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const out = 'test-results/arte';
const S = () => page.evaluate(() => window.__aequitas.session.state);

await page.goto(`http://localhost:${port}/?ep=ep01`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/d10-1-quien.png` });
// Ramiro
await page.locator('.prota__card', { hasText: 'Ramiro' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/d10-2-nombre.png` });
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 8 && (await page.locator('.cut').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(400);
// Diálogo de llegada: nodo 2 es del protagonista
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(2500);
const nombreDlg = await page
  .locator('.dlg__name')
  .innerText()
  .catch(() => '?');
await page.screenshot({ path: `${out}/d10-3-dialogo-ramiro.png` });
for (let i = 0; i < 8 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
// Marrugo en el lobby: «Bienvenido» y «señor»
await page.evaluate(() => {
  void window.__aequitas.session.runActions([{ type: 'dialogue', id: 'ep01-marrugo-lobby' }]);
});
await page.waitForSelector('.dlg');
const hastaOpciones = async () => {
  for (let i = 0; i < 10 && (await page.locator('.dlg__opt').count()) === 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  }
};
await hastaOpciones();
const marrugo1 = await page.locator('.dlg__text').innerText();
await page.locator('.dlg__opt').first().click();
await page.waitForTimeout(400);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const marrugo2 = await page.locator('.dlg__text').innerText();
await page.screenshot({ path: `${out}/d10-4-marrugo-senor.png` });
const st = await S();
console.log(JSON.stringify({ jugador: st.jugador, nombreDlg, marrugo1, marrugo2 }, null, 1));

// Personalizado
await page.goto(`http://localhost:${port}/?ep=ep01`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.locator('.prota__card', { hasText: 'Personalizado' }).click();
await page.waitForTimeout(300);
await page.locator('.creador__swatches').nth(0).locator('.swatch').nth(3).click();
await page.selectOption('#pelo', 'largo');
await page.locator('.creador__swatches').nth(2).locator('.swatch').nth(2).click();
await page.selectOption('#accesorio', 'gafas');
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}/d10-5-creador.png` });
await page.getByRole('button', { name: 'Seguir' }).click();
await page.fill('#nombre', 'Sol');
await page.locator('.trato__opt', { hasText: 'Neutro' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 8 && (await page.locator('.cut').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/d10-6-dialogo-custom.png` });
for (let i = 0; i < 8 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(400);
const canvas = await page.locator('#game canvas').boundingBox();
await page.screenshot({
  path: `${out}/d10-7-mundo-custom.png`,
  clip: {
    x: canvas.x + canvas.width / 2 - 160,
    y: canvas.y + canvas.height * 0.79 - 90,
    width: 320,
    height: 180,
  },
});
await page.evaluate(() => {
  void window.__aequitas.session.runActions([{ type: 'dialogue', id: 'ep01-marrugo-lobby' }]);
});
await page.waitForSelector('.dlg');
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
const marrugoN = await page.locator('.dlg__text').innerText();
const st2 = await S();
console.log(JSON.stringify({ jugador: st2.jugador, marrugoN, errors }, null, 1));
await browser.close();
server.kill();
process.exit(0);
