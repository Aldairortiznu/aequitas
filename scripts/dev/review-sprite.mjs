// Hoja de revisión: sprite ampliado 8× por cuadro, retratos 3×, y materia prima reducida.
import sharp from 'sharp';
import { existsSync, readdirSync } from 'node:fs';

const id = process.argv[2] ?? 'renata';
const out = 'test-results/arte';
const sheet = process.argv[3] ?? `public/assets/sprites/${id}.png`;
const sufijo = process.argv[4] ?? '';
const meta = await sharp(sheet).metadata();
console.log('sheet', meta.width, meta.height, meta.channels, meta.hasAlpha);

// 1) Cada cuadro a 8× con rejilla, en 4 filas (down/left/right/up) × 4 columnas
const S = 8;
const cells = [];
for (let row = 0; row < 4; row++)
  for (let col = 0; col < 4; col++) {
    const buf = await sharp(sheet)
      .extract({ left: col * 16, top: row * 24, width: 16, height: 24 })
      .resize(16 * S, 24 * S, { kernel: 'nearest' })
      .png()
      .toBuffer();
    cells.push({ input: buf, left: col * (16 * S + 8) + 8, top: row * (24 * S + 8) + 8 });
  }
const W = 4 * (16 * S + 8) + 8;
const H = 4 * (24 * S + 8) + 8;
await sharp({ create: { width: W, height: H, channels: 4, background: '#2e2d33' } })
  .composite(cells)
  .png()
  .toFile(`${out}/${id}-sprite-8x${sufijo}.png`);

// 2) Retratos a 3×
const exprs = ['neutra', 'tensa', 'cordial'];
const ports = [];
for (const [i, e] of exprs.entries()) {
  const p = `public/assets/portraits/${id}-${e}.png`;
  if (!existsSync(p)) continue;
  const m = await sharp(p).metadata();
  console.log('portrait', e, m.width, m.height, m.hasAlpha);
  const buf = await sharp(p).resize(96 * 3, 96 * 3, { kernel: 'nearest' }).png().toBuffer();
  ports.push({ input: buf, left: 8 + i * (96 * 3 + 8), top: 8 });
}
await sharp({ create: { width: 8 + 3 * (96 * 3 + 8), height: 96 * 3 + 16, channels: 4, background: '#2e2d33' } })
  .composite(ports)
  .png()
  .toFile(`${out}/${id}-retratos-3x.png`);

// 3) Materia prima (lo que generó Nano Banana) en miniatura: down-0, left-0, up-0 y retrato neutra
const raw = [];
const rawFiles = ['down-0', 'down-1', 'left-0', 'right-0', 'up-0', 'up-1'];
for (const [i, f] of rawFiles.entries()) {
  const p = `art-src/sprites/${id}/${f}.png`;
  if (!existsSync(p)) continue;
  const m = await sharp(p).metadata();
  console.log('raw', f, m.width, m.height);
  const buf = await sharp(p).resize(200, 300, { fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
  const bm = await sharp(buf).metadata();
  raw.push({ input: buf, left: 8 + i * 208, top: 8 + Math.round((300 - bm.height) / 2) });
}
await sharp({ create: { width: 8 + rawFiles.length * 208, height: 316, channels: 4, background: '#2e2d33' } })
  .composite(raw)
  .png()
  .toFile(`${out}/${id}-materia-prima.png`);
const rawPort = `art-src/portraits/${id}-neutra.png`;
if (existsSync(rawPort)) {
  const m = await sharp(rawPort).metadata();
  console.log('raw portrait', m.width, m.height);
  await sharp(rawPort).resize(400, 400, { fit: 'inside' }).png().toFile(`${out}/${id}-retrato-materia-prima.png`);
}
console.log('listo', readdirSync(out));
