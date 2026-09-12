// Sonda de depuración: ejecuta un escenario en Chromium sin cabeza y muestra estado y errores.
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
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text());
});
await page.goto('http://localhost:4181/?ep=gym');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
await page.waitForTimeout(500);
const r1 = await page.evaluate(async () => {
  const s = window.__aequitas.session;
  s.bus.emit('world:interact', { kind: 'folio', id: 'folio-cp14', payload: { codice: 'cp-14' } });
  await new Promise((r) => setTimeout(r, 400));
  return {
    codice: s.state.codice,
    leg: s.state.legitimidad,
    toast: document.querySelector('.ui-toast')?.textContent ?? null,
  };
});
console.log('via bus:', JSON.stringify(r1));
await page.keyboard.press('e');
await page.waitForTimeout(300);
const r2 = await page.evaluate(() => ({
  toast: document.querySelector('.ui-toast')?.textContent ?? null,
}));
console.log('tras e:', JSON.stringify(r2));
console.log('errores:', errors);
await browser.close();
server.kill();
process.exit(0);
