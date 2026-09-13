import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
const server = spawn('npx', ['vite', 'preview', '--port', '4186', '--strictPort'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:4186/?ep=ep01');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
for (let i = 0; i < 6 && (await page.locator('.cut').count()) > 0; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(250); }
await page.waitForTimeout(2500);
await page.screenshot({ path: 'test-results/lamina-dialogo.png' });
await browser.close(); server.kill(); process.exit(0);
