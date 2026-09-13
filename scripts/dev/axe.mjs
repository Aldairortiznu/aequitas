// Pase de accesibilidad (L1.4): axe-core sobre las pantallas principales. Requiere build.
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
const port = 4189;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const informe = [];
const analizar = async (nombre) => {
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  informe.push({
    pantalla: nombre,
    violaciones: r.violations.map((v) => ({
      id: v.id,
      impacto: v.impact,
      ayuda: v.help,
      nodos: v.nodes.length,
      ejemplo: v.nodes[0]?.target?.join(' '),
    })),
  });
};
const run = (a) =>
  page.evaluate((x) => {
    void window.__aequitas.session.runActions(x);
  }, a);
await page.goto(`http://localhost:${port}/?ep=ep01`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await analizar('título');
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.waitForTimeout(300);
await analizar('selector de protagonista');
await page.locator('.prota__card', { hasText: 'Personalizado' }).click();
await page.waitForTimeout(300);
await analizar('creador de personaje');
await page.getByRole('button', { name: 'Seguir' }).click();
await page.waitForTimeout(200);
await analizar('nombre y tratamiento');
await page.fill('#nombre', 'Prueba');
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
await page.waitForTimeout(600);
await analizar('cinemática');
for (let i = 0; i < 8 && (await page.locator('.cut').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(500);
await analizar('diálogo sobre lámina');
for (let i = 0; i < 8 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(300);
await analizar('mundo y HUD');
for (const p of ['zurron', 'codice', 'voces', 'cuaderno', 'mapa']) {
  await page.evaluate((x) => {
    window.__aequitas.session.bus.emit('ui:opened', { panel: x });
  }, p);
  await page.keyboard.press({ zurron: 'z', codice: 'c', voces: 'v', cuaderno: 'n', mapa: 'm' }[p]);
  await page.waitForTimeout(400);
  await analizar('panel ' + p);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}
await run([{ type: 'setFlag', flag: 'ep01.convocada', value: true }]);
await run([{ type: 'startAudiencia', id: 'ep01-marrugo' }]);
await page.waitForSelector('.aud');
await page.waitForTimeout(500);
await analizar('audiencia');
await page.locator('.aud__actions .btn', { hasText: 'Presentar norma' }).click();
await page.waitForTimeout(300);
await analizar('audiencia · cajón de normas');
await page.goto(`http://localhost:${port}/?ep=ep01`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1200);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.locator('.prota__card', { hasText: 'Renata' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 12 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await run([{ type: 'startPacto', id: 'ep01-pacto' }]);
await page.waitForSelector('.pac');
await page.waitForTimeout(500);
await analizar('pacto');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.__aequitas.session.bus.emit('world:patrol', {
    name: 'vigilante-lobby',
    rank: 'alguacil',
    articulo: 'cp-84',
  });
});
await page.waitForTimeout(600);
await analizar('interpelación');
console.log(JSON.stringify(informe, null, 1));
await browser.close();
server.kill();
process.exit(0);
