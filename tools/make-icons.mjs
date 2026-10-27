// Genera los íconos PWA de AEQUITAS: una balanza dorada sobre el río de noche,
// dibujada en un <canvas> y exportada a PNG. La figura ocupa el ~60 % central
// para que el ícono "maskable" no la recorte.
// Uso: node tools/make-icons.mjs   (usa el Chromium de Playwright; si hace falta,
// indica otro con CHROMIUM_PATH=/ruta/al/chromium)
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const draw = `(size) => {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const u = size / 100;
  x.fillStyle = '#0d1820'; x.fillRect(0, 0, size, size);
  const g = x.createRadialGradient(50 * u, 44 * u, 4 * u, 50 * u, 44 * u, 60 * u);
  g.addColorStop(0, 'rgba(227,176,75,0.42)'); g.addColorStop(1, 'rgba(13,24,32,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  // El río.
  x.strokeStyle = '#3fa3a0'; x.lineWidth = 2.6 * u; x.lineCap = 'round';
  for (const [y, a] of [[76, 1], [83, 0.6]]) {
    x.globalAlpha = a; x.beginPath();
    for (let i = 0; i <= 40; i++) { const px = 22 * u + i * 1.4 * u; const py = y * u + Math.sin(i / 3) * 1.6 * u; if (i) x.lineTo(px, py); else x.moveTo(px, py); }
    x.stroke();
  }
  x.globalAlpha = 1;
  // La balanza.
  const gold = '#e3b04b'; const dark = '#b0893f';
  x.fillStyle = gold;
  x.fillRect(48 * u, 24 * u, 4 * u, 42 * u);
  x.beginPath(); x.moveTo(38 * u, 70 * u); x.lineTo(62 * u, 70 * u); x.lineTo(56 * u, 64 * u); x.lineTo(44 * u, 64 * u); x.closePath(); x.fill();
  x.beginPath(); x.arc(50 * u, 22 * u, 3.6 * u, 0, Math.PI * 2); x.fill();
  x.fillRect(24 * u, 28 * u, 52 * u, 3.4 * u);
  x.strokeStyle = dark; x.lineWidth = 1.2 * u;
  for (const cx of [28, 72]) {
    x.beginPath(); x.moveTo(cx * u, 31 * u); x.lineTo((cx - 8) * u, 48 * u); x.moveTo(cx * u, 31 * u); x.lineTo((cx + 8) * u, 48 * u); x.stroke();
    x.fillStyle = gold; x.beginPath(); x.moveTo((cx - 11) * u, 48 * u); x.lineTo((cx + 11) * u, 48 * u); x.quadraticCurveTo(cx * u, 58 * u, (cx - 11) * u, 48 * u); x.fill();
  }
  return c.toDataURL('image/png');
}`;

const opts = {};
if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
else if (existsSync('/opt/pw-browsers/chromium')) opts.executablePath = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(opts);
const page = await browser.newPage();
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon-180.png', 180]]) {
  const url = await page.evaluate(`(${draw})(${size})`);
  writeFileSync(join(outDir, name), Buffer.from(url.split(',')[1], 'base64'));
  console.log('ícono:', name);
}
await browser.close();
