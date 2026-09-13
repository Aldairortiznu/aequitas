import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readContentDir } from './content-fs';

/**
 * Escanea public/assets/, verifica dimensiones y escribe public/assets/manifest.json,
 * que el juego lee para saber qué arte real existe (todo lo demás se hornea).
 * También imprime qué activos espera el contenido y cuáles faltan.
 *
 * Uso: npm run assets:scan
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'public', 'assets');

const SPRITE = { w: 64, h: 96 };
const PORTRAIT = 96;
const LAMINA_RATIO = 16 / 9;
const ESTADOS = ['ceniza', 'brote', 'verdor', 'floracion'];
const EXPRESIONES = ['neutra', 'tensa', 'cordial'];
const ICONOS = ['hablar', 'documento', 'folio', 'testimonio', 'alerta', 'ojo'];

interface Dim {
  w: number;
  h: number;
}

function pngSize(file: string): Dim | null {
  const b = readFileSync(file);
  if (b.length < 24 || b.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function jpgSize(file: string): Dim | null {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const m = b[i + 1]!;
    if (m === 0xc0 || m === 0xc1 || m === 0xc2)
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function imageSize(file: string): Dim | null {
  return file.endsWith('.png') ? pngSize(file) : jpgSize(file);
}

function files(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => exts.some((e) => f.toLowerCase().endsWith(e)))
    .sort();
}

const problems: string[] = [];
const ok: string[] = [];

// --- Sprites: <id>.png 64x96
const sprites: string[] = [];
for (const f of files(join(assets, 'sprites'), ['.png'])) {
  const id = f.replace(/\.png$/, '');
  const d = pngSize(join(assets, 'sprites', f));
  if (!d) problems.push(`sprites/${f}: no es PNG`);
  else if (d.w !== SPRITE.w || d.h !== SPRITE.h)
    problems.push(`sprites/${f}: ${d.w}x${d.h}, se esperaba ${SPRITE.w}x${SPRITE.h}`);
  else {
    sprites.push(id);
    ok.push(`sprite ${id}`);
  }
}

// --- Tilesets: <nombre>-<estado>.png, 64 px de ancho (4 columnas), alto múltiplo de 16
const tilesets: Record<string, string[]> = {};
for (const f of files(join(assets, 'tilesets'), ['.png'])) {
  const m = /^(.+)-(ceniza|brote|verdor|floracion)\.png$/.exec(f);
  if (!m) {
    problems.push(
      `tilesets/${f}: el nombre debe ser <nombre>-<estado>.png (estados: ${ESTADOS.join(', ')})`,
    );
    continue;
  }
  const d = pngSize(join(assets, 'tilesets', f));
  if (!d) problems.push(`tilesets/${f}: no es PNG`);
  else if (d.w !== 64 || d.h % 16 !== 0)
    problems.push(
      `tilesets/${f}: ${d.w}x${d.h}; debe medir 64 de ancho y un múltiplo de 16 de alto`,
    );
  else {
    (tilesets[m[1]!] ??= []).push(m[2]!);
    ok.push(`tileset ${m[1]} · ${m[2]} (${d.h / 16} filas)`);
  }
}
for (const [name, estados] of Object.entries(tilesets)) {
  const sizes = new Set(
    estados.map((e) => pngSize(join(assets, 'tilesets', `${name}-${e}.png`))?.h),
  );
  if (sizes.size > 1)
    problems.push(`tilesets/${name}: los cuatro estados deben tener el mismo alto`);
}

// --- Retratos: <id>-<expresion>.png 96x96
const portraits: Record<string, string[]> = {};
for (const f of files(join(assets, 'portraits'), ['.png'])) {
  const m = /^(.+)-(neutra|tensa|cordial)\.png$/.exec(f);
  if (!m) {
    problems.push(
      `portraits/${f}: el nombre debe ser <id>-<expresion>.png (${EXPRESIONES.join(', ')})`,
    );
    continue;
  }
  const d = pngSize(join(assets, 'portraits', f));
  if (!d) problems.push(`portraits/${f}: no es PNG`);
  else if (d.w !== PORTRAIT || d.h !== PORTRAIT)
    problems.push(`portraits/${f}: ${d.w}x${d.h}, se esperaba ${PORTRAIT}x${PORTRAIT}`);
  else {
    (portraits[m[1]!] ??= []).push(m[2]!);
    ok.push(`retrato ${m[1]} · ${m[2]}`);
  }
}

// --- Láminas: <id>.png|jpg 16:9 (ideal 960x540)
const illustrations: string[] = [];
for (const f of files(join(assets, 'illustrations'), ['.png', '.jpg', '.jpeg', '.webp'])) {
  const id = f.replace(/\.(png|jpe?g|webp)$/i, '');
  const d = imageSize(join(assets, 'illustrations', f));
  if (d && Math.abs(d.w / d.h - LAMINA_RATIO) > 0.02)
    problems.push(`illustrations/${f}: ${d.w}x${d.h} no es 16:9`);
  else {
    illustrations.push(id);
    ok.push(`lámina ${id}${d ? ` (${d.w}x${d.h})` : ''}`);
  }
}

// --- Iconos
const icons: string[] = [];
for (const f of files(join(assets, 'icons'), ['.png'])) {
  const id = f.replace(/\.png$/, '');
  if (!ICONOS.includes(id))
    problems.push(`icons/${f}: icono desconocido (válidos: ${ICONOS.join(', ')})`);
  else {
    icons.push(id);
    ok.push(`icono ${id}`);
  }
}

// --- Audio
const audio = files(join(assets, 'audio'), ['.ogg', '.mp3']).map((f) =>
  f.replace(/\.(ogg|mp3)$/, ''),
);

// --- Qué espera el contenido
const content = readContentDir(join(root, 'content'));
const personajes = content.personajes as { id: string; sprite?: string; retratos?: string[] }[];
const index = content.index as { regiones: { id: string }[] };
const expected: string[] = [];
const missing: string[] = [];
for (const p of personajes) {
  if (p.sprite) {
    expected.push(`sprite ${p.sprite}`);
    if (!sprites.includes(p.sprite)) missing.push(`sprites/${p.sprite}.png (64x96)`);
  }
  for (const e of p.retratos ?? []) {
    expected.push(`retrato ${p.id}-${e}`);
    if (!portraits[p.id]?.includes(e)) missing.push(`portraits/${p.id}-${e}.png (96x96)`);
  }
}
for (const r of index.regiones) {
  if (r.id === 'gimnasio') continue;
  for (const e of ESTADOS) {
    expected.push(`tileset ${r.id}-${e}`);
    if (!tilesets[r.id]?.includes(e))
      missing.push(`tilesets/${r.id}-${e}.png (64 de ancho, filas de 16)`);
  }
}
const laminasEsperadas = new Set<string>(['menu-fondo']);
for (const ep of content.episodes) {
  for (const c of Object.values(ep.cutscenes) as { laminas?: { imagen: string }[] }[])
    for (const l of c.laminas ?? []) laminasEsperadas.add(l.imagen);
  // Escenas clave: nodos de diálogo con lámina cinematográfica
  for (const d of Object.values(ep.dialogues) as { nodes?: { lamina?: string }[] }[])
    for (const n of d.nodes ?? []) if (n.lamina) laminasEsperadas.add(n.lamina);
}
for (const id of laminasEsperadas) {
  expected.push(`lámina ${id}`);
  if (!illustrations.includes(id)) missing.push(`illustrations/${id}.png (960x540)`);
}
for (const i of ICONOS)
  if (!icons.includes(i)) missing.push(`icons/${i}.png (opcional; hay provisional)`);

const manifest = {
  generatedAt: new Date().toISOString(),
  sprites,
  tilesets,
  portraits,
  illustrations,
  icons,
  audio,
};
writeFileSync(join(assets, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Activos reales encontrados: ${ok.length}`);
for (const o of ok) console.log(`  ✓ ${o}`);
if (problems.length) {
  console.log(`\nProblemas (${problems.length}):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
}
console.log(`\nFaltan (el juego usa arte provisional mientras tanto): ${missing.length}`);
for (const m of missing) console.log(`  · ${m}`);
console.log(`\nManifiesto escrito en public/assets/manifest.json`);
process.exit(problems.length ? 1 : 0);
