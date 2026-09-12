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
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4181/?ep=gym');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
await page.evaluate(() => {
  const s = window.__aequitas.session;
  void s.runActions([{ type: 'startPacto', id: 'gym-pacto' }]);
});
await page.waitForSelector('.pac', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: 'test-results/pacto-1.png' });
// Marcar la nula del punto 1 y elegir turnos
await page.click('.pac__clausula:has-text("pierde el derecho a comer") .pac__nula');
await page.waitForTimeout(200);
await page.click('.pac__clausula:has-text("Turnos semanales") .pac__elegir');
// Punto 2: elegir rotación
await page.click('.pac__punto:has-text("contraparte")');
await page.click('.pac__clausula:has-text("Rotación") .pac__elegir');
await page.click('button:has-text("Firmar")');
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/pacto-2-resultado.png' });
const eq = await page.textContent('.pac__eq-num');
await page.click('button:has-text("Cerrar el acta")');
await page.waitForTimeout(800);
for (let i = 0; i < 6 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}
const st = await page.evaluate(() => {
  const s = window.__aequitas.session.state;
  return {
    pactos: s.pactos,
    leg: s.legitimidad,
    flags: s.flags,
    mapStates: s.mapStates,
    dia: s.diaDeJuego,
  };
});
await page.waitForTimeout(600);
await page.screenshot({ path: 'test-results/pacto-3-verdor.png' });
console.log(JSON.stringify({ eq, st, errors }, null, 1));
await browser.close();
server.kill();
process.exit(0);
