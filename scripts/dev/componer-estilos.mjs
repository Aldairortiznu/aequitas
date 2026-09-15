// Compone, por escena, las capturas de las tres direcciones estéticas en una sola imagen
// (columna por estilo, con rótulo) para decidir en Dirección. Lee test-results/estilos.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

const src = 'test-results/estilos';
const out = process.argv[2] ?? 'art-src/capturas/estilos';
mkdirSync(out, { recursive: true });
const estilos = [
  ['esmeralda', 'A · Esmeralda'],
  ['litoral', 'B · Litoral'],
  ['grabado', 'C · Grabado'],
];
const escenas = (process.argv[3] ?? 'galeria,lobby,estacion,torre,piscina,audiencia').split(',');

const rotulo = (texto, w) =>
  Buffer.from(
    `<svg width="${w}" height="44" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1b1b1f"/>
      <text x="16" y="29" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#f3ead8">${texto}</text>
    </svg>`,
  );

for (const escena of escenas) {
  const cols = [];
  for (const [id, nombre] of estilos) {
    const f = `${src}/${id}-${escena}.png`;
    if (!existsSync(f)) continue;
    const img = sharp(f);
    const { width, height } = await img.metadata();
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);
    const cuerpo = await img.resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();
    const col = await sharp({
      create: { width: w, height: h + 44, channels: 4, background: '#1b1b1f' },
    })
      .composite([
        { input: rotulo(nombre, w), top: 0, left: 0 },
        { input: cuerpo, top: 44, left: 0 },
      ])
      .png()
      .toBuffer();
    cols.push({ buf: col, w, h: h + 44 });
  }
  if (!cols.length) continue;
  const gap = 8;
  const W = cols.reduce((a, c) => a + c.w, 0) + gap * (cols.length - 1);
  const H = cols[0].h;
  let left = 0;
  const comps = cols.map((c) => {
    const item = { input: c.buf, top: 0, left };
    left += c.w + gap;
    return item;
  });
  await sharp({ create: { width: W, height: H, channels: 4, background: '#0e0e11' } })
    .composite(comps)
    .png()
    .toFile(`${out}/comparacion-${escena}.png`);
  console.log(`comparacion-${escena}.png ${W}×${H}`);
}

// --- Detalles ampliados (vecino más cercano) para juzgar el píxel.
const detalles = [
  // [escena, x, y, w, h, escala, apilado]
  ['galeria', 250, 225, 650, 58, 2, 'vertical'],
  ['lobby', 400, 250, 480, 270, 1.5, 'horizontal'],
  ['estacion', 400, 250, 480, 270, 1.5, 'horizontal'],
  ['torre', 400, 250, 480, 270, 1.5, 'horizontal'],
];
for (const [escena, x, y, w, h, k, modo] of detalles) {
  const piezas = [];
  for (const [id, nombre] of estilos) {
    const f = `${src}/${id}-${escena}.png`;
    if (!existsSync(f)) continue;
    const W = Math.round(w * k);
    const H = Math.round(h * k);
    const cuerpo = await sharp(f)
      .extract({ left: x, top: y, width: w, height: h })
      .resize(W, H, { kernel: 'nearest' })
      .png()
      .toBuffer();
    const pieza = await sharp({
      create: { width: W, height: H + 44, channels: 4, background: '#1b1b1f' },
    })
      .composite([
        { input: rotulo(nombre, W), top: 0, left: 0 },
        { input: cuerpo, top: 44, left: 0 },
      ])
      .png()
      .toBuffer();
    piezas.push({ buf: pieza, w: W, h: H + 44 });
  }
  if (!piezas.length) continue;
  const gap = 8;
  const horizontal = modo === 'horizontal';
  const W = horizontal
    ? piezas.reduce((a, p) => a + p.w, 0) + gap * (piezas.length - 1)
    : piezas[0].w;
  const H = horizontal
    ? piezas[0].h
    : piezas.reduce((a, p) => a + p.h, 0) + gap * (piezas.length - 1);
  let pos = 0;
  const comps = piezas.map((p) => {
    const item = horizontal
      ? { input: p.buf, top: 0, left: pos }
      : { input: p.buf, top: pos, left: 0 };
    pos += (horizontal ? p.w : p.h) + gap;
    return item;
  });
  await sharp({ create: { width: W, height: H, channels: 4, background: '#0e0e11' } })
    .composite(comps)
    .png()
    .toFile(`${out}/detalle-${escena}.png`);
  console.log(`detalle-${escena}.png ${W}×${H}`);
}
