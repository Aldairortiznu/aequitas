// Capturas de revisión de arte: galería, mundo (quieta, caminando, de espaldas) y diálogo con retrato.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const port = 4187;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const out = 'test-results/arte';

// 1) Galería
await page.goto(`http://localhost:${port}/?escena=galeria`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/galeria.png` });

// 2) Mundo: Episodio 1
await page.goto(`http://localhost:${port}/?ep=ep01`);
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 6 && (await page.locator('.cut').count()) > 0; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(250); }
// Diálogo de llegada: avanzar al nodo de Renata (retrato) sobre la lámina
await page.waitForTimeout(600);
await page.keyboard.press('Enter'); await page.waitForTimeout(300);
await page.keyboard.press('Enter'); await page.waitForTimeout(2600);
await page.screenshot({ path: `${out}/dialogo-retrato.png` });
for (let i = 0; i < 8 && (await page.locator('.dlg').count()) > 0; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(250); }
await page.waitForTimeout(500);
const canvas = page.locator('#game canvas');
const box = await canvas.boundingBox();
const zoom = async (name) => {
  // recorte 2× alrededor del centro del canvas (donde está Renata al aparecer, aprox.)
  await page.screenshot({ path: `${out}/${name}.png` });
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.79;
  await page.screenshot({ path: `${out}/${name}-zoom.png`, clip: { x: cx - 160, y: cy - 90, width: 320, height: 180 } });
};
await zoom('mundo-quieta');
await page.keyboard.down('ArrowRight'); await page.waitForTimeout(260);
await page.screenshot({ path: `${out}/mundo-caminando.png` });
await page.keyboard.up('ArrowRight'); await page.waitForTimeout(200);
await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/mundo-espaldas.png` });
console.log(JSON.stringify({ errors }));
await browser.close(); server.kill(); process.exit(0);
