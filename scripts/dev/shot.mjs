// Captura de pantalla de una URL del juego (uso interno): node scripts/dev/shot.mjs "?escena=galeria" salida.png
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const [, , query = '', out = 'test-results/shot.png', waitMs = '2500'] = process.argv;
const server = spawn('npx', ['vite', 'preview', '--port', '4180', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto('http://localhost:4180/' + query);
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out });
await browser.close();
server.kill();
console.log('captura en', out);
process.exit(0);
