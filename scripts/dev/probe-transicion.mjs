// Transición ep00 → ep01 conservando el estado.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '4185', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4185/?ep=ep00');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 30 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.evaluate(() => {
  const s = window.__aequitas.session;
  void s.runActions([
    { type: 'addEvidence', id: 'ep00-anillo' },
    { type: 'unlockCodice', id: 'cp-29' },
    { type: 'legitimidad', delta: 10, fuente: 'evento' },
  ]);
});
await page.waitForTimeout(600);
const antes = await page.evaluate(() => {
  const s = window.__aequitas.session.state;
  return { ep: s.episode, ev: s.evidence, codice: s.codice, leg: s.legitimidad, dia: s.diaDeJuego };
});
await page.evaluate(() => {
  void window.__aequitas.session.endEpisode();
});
await page.waitForTimeout(1500);
await page.screenshot({ path: 'test-results/transicion-1.png' });
for (let i = 0; i < 30 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/transicion-2.png' });
const despues = await page.evaluate(() => {
  const s = window.__aequitas.session.state;
  const save = window.__aequitas.session.lastSave();
  return {
    ep: s.episode,
    map: s.map,
    ev: s.evidence,
    codice: s.codice,
    leg: s.legitimidad,
    dia: s.diaDeJuego,
    flags: Object.keys(s.flags).filter((f) => f.startsWith('ep01')).length,
    saveEp: save?.state.episode,
    hud: document.querySelector('.hud')?.textContent?.slice(0, 60),
  };
});
console.log(JSON.stringify({ antes, despues, errors }, null, 1));
await browser.close();
server.kill();
process.exit(0);
