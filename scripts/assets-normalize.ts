import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

/**
 * Normaliza una imagen generada (Nano Banana, Aseprite, etc.) al contrato del juego y la
 * deja en public/assets/. Reduce con vecino más cercano (píxel limpio), aplica la paleta
 * Bellium (salvo en láminas) y recorta el alfa. Después ejecuta assets:scan.
 *
 * Uso (archivo único):
 *   npx tsx scripts/assets-normalize.ts --tipo sprite   --id renata   --in art-src/sprites/renata.png
 *   npx tsx scripts/assets-normalize.ts --tipo retrato  --id renata --expresion neutra --in art-src/portraits/renata-neutra.png
 *   npx tsx scripts/assets-normalize.ts --tipo tileset  --id altamar --estado ceniza --filas 8 --in art-src/tilesets/altamar-ceniza.png
 *   npx tsx scripts/assets-normalize.ts --tipo lamina   --id ep00-lamina-1 --in art-src/illustrations/ep00-1.png
 *   npx tsx scripts/assets-normalize.ts --tipo icono    --id hablar --in art-src/icons/hablar.png
 * Uso (carpeta de piezas sueltas, lo más fiable con generadores de imagen):
 *   npx tsx scripts/assets-normalize.ts --tipo sprite  --id renata --carpeta art-src/sprites/renata/
 *       (16 archivos: down-0.png … up-3.png; cada uno cualquier tamaño con proporción 2:3)
 *   npx tsx scripts/assets-normalize.ts --tipo tileset --id altamar --estado ceniza --carpeta art-src/tilesets/altamar-ceniza/
 *       (hasta 64 archivos: 00.png … 63.png según docs/arte/03-FICHAS-REGIONES.md; cada uno cuadrado)
 * Opciones: --sin-paleta (no cuantizar) · --alfa 128 (umbral de transparencia)
 */

const PALETA = [
  '#1b1b1f',
  '#2e2d33',
  '#4a4850',
  '#6f6c76',
  '#a29ea8',
  '#3b2a5c',
  '#5a3f86',
  '#8f6fc0',
  '#b8892e',
  '#e2b94a',
  '#f4dc8a',
  '#2f5d3a',
  '#4a8a4f',
  '#7cc46b',
  '#b9e39a',
  '#1e6f7a',
  '#2bb5b8',
  '#8fe0de',
  '#7a4b2d',
  '#b5773f',
  '#d9a66b',
  '#f2c9d6',
  '#e69ab8',
  '#f1c9a5',
  '#c98e5e',
  '#8a5a3a',
  '#5a3a26',
  '#f3ead8',
  '#eadfc6',
  '#cfc2a3',
  '#ffffff',
  '#000000',
].map(
  (h) =>
    [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ] as const,
);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tipo = arg('tipo');
const id = arg('id');
const input = arg('in');
const carpeta = arg('carpeta');
if (!tipo || !id || (!input && !carpeta)) {
  console.error('Faltan argumentos. Ver el encabezado del script.');
  process.exit(2);
}
if (input && !existsSync(input)) {
  console.error(`No existe ${input}`);
  process.exit(2);
}
if (carpeta && !existsSync(carpeta)) {
  console.error(`No existe la carpeta ${carpeta}`);
  process.exit(2);
}

interface Target {
  out: string;
  width: number;
  height: number;
  paleta: boolean;
}

function target(): Target {
  const assets = join(root, 'public', 'assets');
  switch (tipo) {
    case 'sprite':
      return { out: join(assets, 'sprites', `${id}.png`), width: 64, height: 96, paleta: true };
    case 'retrato': {
      const e = arg('expresion') ?? 'neutra';
      return {
        out: join(assets, 'portraits', `${id}-${e}.png`),
        width: 96,
        height: 96,
        paleta: true,
      };
    }
    case 'tileset': {
      const estado = arg('estado') ?? 'ceniza';
      const filas = Number(arg('filas') ?? 4);
      return {
        out: join(assets, 'tilesets', `${id}-${estado}.png`),
        width: 64,
        height: 16 * filas,
        paleta: true,
      };
    }
    case 'lamina':
      return {
        out: join(assets, 'illustrations', `${id}.png`),
        width: 960,
        height: 540,
        paleta: false,
      };
    case 'icono':
      return {
        out: join(assets, 'icons', `${id}.png`),
        width: Number(arg('ancho') ?? 10),
        height: Number(arg('alto') ?? 12),
        paleta: true,
      };
    default:
      console.error(`Tipo desconocido: ${tipo}`);
      process.exit(2);
  }
}

function nearest(r: number, g: number, b: number): readonly [number, number, number] {
  let best = PALETA[0]!;
  let bd = Infinity;
  for (const c of PALETA) {
    const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2;
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}

function quantize(data: Buffer, alfa: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a < alfa) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    const [r, g, b] = nearest(data[i]!, data[i + 1]!, data[i + 2]!);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
}

/** Ensambla piezas sueltas de una carpeta en una hoja (sprite 4×4 de 16×24 o tileset 4×N de 16×16). */
async function assembleFromFolder(
  t: Target,
  dir: string,
  alfa: number,
  usePaleta: boolean,
): Promise<void> {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  const cellW = tipo === 'sprite' ? 16 : 16;
  const cellH = tipo === 'sprite' ? 24 : 16;
  const cols = 4;
  const rows = t.height / cellH;
  const sheet = Buffer.alloc(t.width * t.height * 4, 0);
  let placed = 0;
  for (const f of files) {
    const name = f.replace(/\.(png|jpe?g|webp)$/i, '');
    let index = -1;
    if (tipo === 'sprite') {
      const m = /^(down|left|right|up)-([0-3])$/.exec(name);
      if (!m) {
        console.warn(`  (ignorado) ${f}: el nombre debe ser <down|left|right|up>-<0..3>`);
        continue;
      }
      index = ['down', 'left', 'right', 'up'].indexOf(m[1]!) * 4 + Number(m[2]);
    } else {
      const m = /^(\d{1,2})/.exec(name);
      if (!m) {
        console.warn(`  (ignorado) ${f}: el nombre debe empezar por el índice del tile (00-63)`);
        continue;
      }
      index = Number(m[1]);
    }
    if (index < 0 || index >= cols * rows) {
      console.warn(`  (ignorado) ${f}: índice ${index} fuera de la hoja (${cols * rows} celdas)`);
      continue;
    }
    const { data } = await sharp(join(dir, f))
      .ensureAlpha()
      .resize(cellW, cellH, { kernel: sharp.kernel.nearest, fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ox = (index % cols) * cellW;
    const oy = Math.floor(index / cols) * cellH;
    for (let y = 0; y < cellH; y++) {
      const srcOff = y * cellW * 4;
      const dstOff = ((oy + y) * t.width + ox) * 4;
      data.copy(sheet, dstOff, srcOff, srcOff + cellW * 4);
    }
    placed++;
  }
  if (usePaleta) quantize(sheet, alfa);
  await sharp(sheet, { raw: { width: t.width, height: t.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(t.out);
  console.log(`Ensambladas ${placed} piezas de ${dir}`);
}

async function main(): Promise<void> {
  const t = target();
  const usePaleta = t.paleta && !flag('sin-paleta');
  const alfa = Number(arg('alfa') ?? 128);
  mkdirSync(dirname(t.out), { recursive: true });

  if (carpeta) {
    if (tipo !== 'sprite' && tipo !== 'tileset') {
      console.error('--carpeta solo aplica a sprite y tileset');
      process.exit(2);
    }
    await assembleFromFolder(t, carpeta, alfa, usePaleta);
    console.log(`Escrito: ${t.out}`);
    execSync('npx tsx scripts/assets-scan.ts', { cwd: root, stdio: 'inherit' });
    return;
  }

  const src = input as string;
  const meta = await sharp(src).metadata();
  console.log(
    `Entrada: ${basename(src)} ${meta.width}x${meta.height} → ${t.width}x${t.height}${usePaleta ? ' + paleta' : ''}`,
  );

  const base = sharp(src)
    .ensureAlpha()
    .resize(t.width, t.height, { kernel: sharp.kernel.nearest, fit: 'fill' });
  if (!usePaleta) {
    await base.png({ compressionLevel: 9 }).toFile(t.out);
  } else {
    const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
    quantize(data, alfa);
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(t.out);
  }
  console.log(`Escrito: ${t.out}`);
  execSync('npx tsx scripts/assets-scan.ts', { cwd: root, stdio: 'inherit' });
}

void main();
