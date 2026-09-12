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
await page.evaluate(async () => {
  const s = window.__aequitas.session;
  await s.applyNow([
    { type: 'addEvidence', id: 'gym-acta-sin-firma' },
    { type: 'addEvidence', id: 'gym-certificado-falso' },
    { type: 'registrarVoz', id: 'gym-testimonio-eladio' },
    { type: 'unlockCodice', id: 'cp-4' },
    { type: 'unlockCodice', id: 'cp-14' },
    { type: 'unlockCodice', id: 'cp-29' },
  ]);
  void s.runActions([{ type: 'startAudiencia', id: 'gym-audiencia' }]);
});
await page.waitForSelector('.aud', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/aud-1.png' });
// Presentar hecho: acta
await page.click('button:has-text("2 Presentar hecho")');
await page.click('.pick__item:has-text("Acta de asamblea")');
await page.waitForTimeout(400);
// Presentar norma cp-4 en af-certificado
await page.click('button:has-text("3 Presentar norma")');
await page.click('.pick__item:has-text("Art. 4")');
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/aud-2-maniobra.png' });
await page.click('button:has-text("Objetar")');
await page.waitForTimeout(400);
// Fundamentar eladio + cp-14
await page.click('button:has-text("4 Fundamentar")');
await page.click('.pick__item:has-text("Testimonio de Eladio")');
await page.click('.pick__item:has-text("Art. 14")');
await page.click('.aud__drawer-foot button:has-text("Fundamentar")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/aud-3-fin.png' });
const meters = await page.$$eval('.meter__value', (els) => els.map((e) => e.textContent));
const fin = await page.locator('.aud__actions--fin button').textContent();
await page.click('.aud__actions--fin button');
await page.waitForSelector('.dlg', { timeout: 5000 });
for (let i = 0; i < 8 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}
await page.waitForTimeout(500);
const st = await page.evaluate(() => {
  const s = window.__aequitas.session.state;
  return { flags: s.flags, leg: s.legitimidad, notas: s.notas, used: s.codiceUsedIn };
});
console.log(
  JSON.stringify(
    {
      meters,
      fin,
      st,
      audOpen: await page.locator('.aud').count(),
      toast: await page
        .locator('.ui-toast')
        .textContent()
        .catch(() => null),
      errors,
    },
    null,
    1,
  ),
);
await browser.close();
server.kill();
process.exit(0);
