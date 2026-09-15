// Sonda del modo guiado: objetivo en HUD, marcador en el mundo, letreros y viaje rápido.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4193;
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
await page.goto(`http://localhost:${port}/?ep=ep01`);
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
await page.waitForTimeout(600);
const obj1 = await page
  .locator('.hud__objetivo-texto')
  .innerText()
  .catch(() => '(sin objetivo)');
await page.screenshot({ path: `${out}/guia-1-lobby.png` });
// Marcador visible sobre Pilar?
const marker = await page.evaluate(() => {
  const s = window.__aequitas.game.scene.getScene('World');
  const m = s.marker;
  return m ? { visible: m.visible, x: Math.round(m.x), y: Math.round(m.y) } : null;
});
// Hablar con Pilar por acción → objetivo cambia
await page.evaluate(() => {
  void window.__aequitas.session.runActions([{ type: 'dialogue', id: 'ep01-pilar' }]);
});
await page.waitForSelector('.dlg');
for (let i = 0; i < 20 && (await page.locator('.dlg').count()) > 0; i++) {
  if ((await page.locator('.dlg__opt').count()) > 0)
    await page.locator('.dlg__opt').first().click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(400);
const obj2 = await page
  .locator('.hud__objetivo-texto')
  .innerText()
  .catch(() => '(sin objetivo)');
const marker2 = await page.evaluate(() => {
  const s = window.__aequitas.game.scene.getScene('World');
  const m = s.marker;
  return m ? { visible: m.visible, x: Math.round(m.x), y: Math.round(m.y) } : null;
});
// Cuaderno con objetivos
await page.keyboard.press('n');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/guia-2-cuaderno.png` });
const objetivosCuaderno = await page.locator('.objetivos li').count();
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
// Mapa con viaje rápido → torre
await page.keyboard.press('m');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/guia-3-mapa.png` });
await page.locator('.mapa__ir li', { hasText: 'Torre, pisos' }).locator('button').click();
await page.waitForTimeout(900);
for (let i = 0; i < 10 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
const mapaTras = await page.evaluate(() => window.__aequitas.session.state.map);
const marker3 = await page.evaluate(() => {
  const s = window.__aequitas.game.scene.getScene('World');
  const m = s.marker;
  return m ? { visible: m.visible, x: Math.round(m.x), y: Math.round(m.y) } : null;
});
await page.screenshot({ path: `${out}/guia-4-torre.png` });
// Letrero: interactuar con letrero-torre en el lobby vía bus
await page.evaluate(() => {
  window.__aequitas.session.bus.emit('world:interact', {
    kind: 'letrero',
    id: 'letrero-torre',
    payload: { texto: 'Escaleras a la torre: pisos 3, 4 y 7.' },
  });
});
await page.waitForTimeout(300);
const toast = await page
  .locator('.ui-toast')
  .innerText()
  .catch(() => '(sin toast)');
console.log(
  JSON.stringify(
    { obj1, marker, obj2, marker2, objetivosCuaderno, mapaTras, marker3, toast, errors },
    null,
    1,
  ),
);
await browser.close();
server.kill();
process.exit(0);
