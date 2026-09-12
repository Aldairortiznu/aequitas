import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

/**
 * Copia autónoma local: genera `dist-standalone/` con el build y un lanzador de Windows
 * que levanta un servidor estático local y abre el navegador. No necesita internet salvo
 * para las fuentes de Google (con fallback declarado).
 *
 * Uso: npm run standalone [-- --dest "C:\ruta\AEQUITAS"]
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destArg = process.argv.indexOf('--dest');
const dest =
  destArg > -1 && process.argv[destArg + 1]
    ? process.argv[destArg + 1]!
    : join(root, 'dist-standalone');

console.log('Compilando…');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(join(root, 'dist'), join(dest, 'juego'), { recursive: true });

const bat = [
  '@echo off',
  'setlocal',
  'title AEQUITAS',
  'cd /d "%~dp0juego"',
  'where node >nul 2>nul',
  'if %errorlevel% neq 0 (',
  '  echo Se necesita Node.js para abrir el juego sin conexion. Instalalo desde https://nodejs.org',
  '  pause',
  '  exit /b 1',
  ')',
  'start "" http://localhost:8123/',
  'node "%~dp0servidor.cjs" 8123',
  'endlocal',
  '',
].join('\r\n');
writeFileSync(join(dest, 'JUGAR_AEQUITAS.bat'), bat);

const server = `// Servidor estático mínimo para la copia autónoma (sin dependencias).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.argv[2] || 8123);
const base = path.join(__dirname, 'juego');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.join(base, url === '/' ? 'index.html' : url);
  if (!file.startsWith(base)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(base, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('AEQUITAS en http://localhost:' + port + '  (cierra esta ventana para salir)'));
`;
writeFileSync(join(dest, 'servidor.cjs'), server);
writeFileSync(
  join(dest, 'LEEME.txt'),
  'AEQUITAS: El Retorno del Equilibrio\r\n\r\nHaz doble clic en JUGAR_AEQUITAS.bat. Se abre el navegador con el juego.\r\nNecesita Node.js instalado (https://nodejs.org). No necesita internet.\r\n',
);
console.log('Copia autónoma en', dest);
