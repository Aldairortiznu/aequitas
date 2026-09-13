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
 *           --fondo auto|none|#rrggbb (sprites y retratos: `auto` quita el fondo falso, sea un
 *           tablero de ajedrez «transparente» pintado o un color plano, por inundación desde los
 *           bordes; `none` respeta el alfa del archivo; un color fija la clave)
 *
 * Cuadros de sprite: cada pieza se recorta a su silueta, se escala con un factor común a todas
 * las piezas (para que las proporciones no cambien entre cuadros) hasta caber en 14×22 y se
 * apoya en la fila 23 de la celda, centrada. Si la pieza ya viene a un múltiplo entero de 16×24
 * se reduce con vecino más cercano; si es una ilustración grande, con promedio de área.
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

interface RawImg {
  data: Buffer;
  width: number;
  height: number;
}

function hexToRgb(h: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(h);
  if (!m) return null;
  const v = parseInt(m[1]!, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/**
 * Quita el fondo falso de una pieza por inundación desde los bordes. Los colores de fondo se
 * toman de los bordes (los dos más frecuentes, con tolerancia), lo que cubre el tablero de
 * ajedrez «transparente» que pintan los generadores y los fondos planos. Solo se vacía lo que
 * está conectado con el borde, así que un cuello blanco o un papel dentro de la figura no se
 * pierde. Si el archivo ya trae alfa real en los bordes, no se toca.
 */
function keyBackground(img: RawImg, modo: string): RawImg {
  const { data, width, height } = img;
  if (modo === 'none') return img;
  const idx = (x: number, y: number): number => (y * width + x) * 4;
  // ¿Ya viene con transparencia real?
  let borde = 0;
  let transp = 0;
  const visitBorder = (x: number, y: number): void => {
    borde++;
    if (data[idx(x, y) + 3]! < 128) transp++;
  };
  for (let x = 0; x < width; x++) {
    visitBorder(x, 0);
    visitBorder(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    visitBorder(0, y);
    visitBorder(width - 1, y);
  }
  if (modo === 'auto' && transp / borde > 0.3) return img;

  // Colores clave
  let claves: [number, number, number][] = [];
  const fijo = modo !== 'auto' ? hexToRgb(modo) : null;
  if (fijo) claves = [fijo];
  else {
    const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
    const add = (x: number, y: number): void => {
      const i = idx(x, y);
      if (data[i + 3]! < 128) return;
      const key = `${data[i]! >> 4},${data[i + 1]! >> 4},${data[i + 2]! >> 4}`;
      const b = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      b.n++;
      b.r += data[i]!;
      b.g += data[i + 1]!;
      b.b += data[i + 2]!;
      buckets.set(key, b);
    };
    for (let x = 0; x < width; x++) {
      add(x, 0);
      add(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
      add(0, y);
      add(width - 1, y);
    }
    claves = [...buckets.values()]
      .sort((a, b) => b.n - a.n)
      .slice(0, 2)
      .filter((b) => b.n > borde * 0.05)
      .map((b) => [b.r / b.n, b.g / b.n, b.b / b.n] as [number, number, number]);
  }
  if (!claves.length) return img;
  const TOL = 42;
  const esFondo = (i: number): boolean => {
    if (data[i + 3]! < 128) return true;
    for (const [r, g, b] of claves) {
      const d = Math.hypot(data[i]! - r, data[i + 1]! - g, data[i + 2]! - b);
      if (d <= TOL) return true;
    }
    return false;
  };
  const marcado = new Uint8Array(width * height);
  const cola: number[] = [];
  const push = (x: number, y: number): void => {
    const p = y * width + x;
    if (marcado[p]) return;
    if (!esFondo(p * 4)) return;
    marcado[p] = 1;
    cola.push(p);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (cola.length) {
    const p = cola.pop()!;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }
  const out = Buffer.from(data);
  let quitados = 0;
  for (let p = 0; p < marcado.length; p++)
    if (marcado[p]) {
      out[p * 4 + 3] = 0;
      quitados++;
    }
  if (quitados) console.log(`  fondo quitado: ${Math.round((100 * quitados) / marcado.length)} %`);
  return { data: out, width, height };
}

/** Caja de la silueta (alfa ≥ 128). */
function bbox(img: RawImg): { x: number; y: number; w: number; h: number } | null {
  let x0 = img.width;
  let y0 = img.height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < img.width; x++)
      if (img.data[(y * img.width + x) * 4 + 3]! >= 128) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

async function loadRaw(path: string): Promise<RawImg> {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
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
  const piezas: { f: string; index: number }[] = [];
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
    piezas.push({ f, index });
  }
  const fondo = arg('fondo') ?? (tipo === 'sprite' ? 'auto' : 'none');
  if (tipo === 'sprite') {
    // Silueta de cada cuadro y factor de escala común (el cuadro más alto ocupa 22 px, o 14 de ancho).
    const recortes: { index: number; img: RawImg; box: { x: number; y: number; w: number; h: number } }[] =
      [];
    for (const { f, index } of piezas) {
      const img = keyBackground(await loadRaw(join(dir, f)), fondo);
      const box = bbox(img);
      if (!box) {
        console.warn(`  (vacío) ${f}`);
        continue;
      }
      recortes.push({ index, img, box });
    }
    const maxH = Math.max(...recortes.map((r) => r.box.h));
    const maxW = Math.max(...recortes.map((r) => r.box.w));
    const escala = Math.min(22 / maxH, 14 / maxW);
    const entero = Math.abs(1 / escala - Math.round(1 / escala)) < 0.02;
    console.log(
      `  escala común 1:${(1 / escala).toFixed(1)} (${entero ? 'vecino más cercano' : 'promedio de área'})`,
    );
    for (const { index, img, box } of recortes) {
      const w = Math.max(1, Math.round(box.w * escala));
      const h = Math.max(1, Math.round(box.h * escala));
      const { data } = await sharp(img.data, {
        raw: { width: img.width, height: img.height, channels: 4 },
      })
        .extract({ left: box.x, top: box.y, width: box.w, height: box.h })
        .resize(w, h, { kernel: entero ? sharp.kernel.nearest : sharp.kernel.lanczos3, fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      const ox = (index % cols) * cellW + Math.floor((cellW - w) / 2);
      const oy = Math.floor(index / cols) * cellH + (cellH - h);
      for (let y = 0; y < h; y++) {
        const srcOff = y * w * 4;
        const dstOff = ((oy + y) * t.width + ox) * 4;
        data.copy(sheet, dstOff, srcOff, srcOff + w * 4);
      }
      placed++;
    }
  } else {
    for (const { f, index } of piezas) {
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

  const fondo = arg('fondo') ?? (tipo === 'retrato' || tipo === 'icono' ? 'auto' : 'none');
  let entrada = sharp(src).ensureAlpha();
  if (fondo !== 'none') {
    const keyed = keyBackground(await loadRaw(src), fondo);
    entrada = sharp(keyed.data, { raw: { width: keyed.width, height: keyed.height, channels: 4 } });
  }
  const entero =
    meta.width && meta.height
      ? Math.abs(meta.width / t.width - Math.round(meta.width / t.width)) < 0.02 &&
        Math.abs(meta.height / t.height - Math.round(meta.height / t.height)) < 0.02
      : true;
  const base = entrada.resize(t.width, t.height, {
    kernel: entero || !t.paleta ? sharp.kernel.nearest : sharp.kernel.lanczos3,
    fit: 'fill',
  });
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
