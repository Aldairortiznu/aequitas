// Convierte un .md del paquete de diseño en una página con la identidad «papel y tinta».
// Uso: node scripts/dev/md-a-html.mjs docs/design/09-formas-de-aprender.md salida.html [--artefacto]
import { readFileSync, writeFileSync } from 'node:fs';
const [src, out, modo] = process.argv.slice(2);
const md = readFileSync(src, 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
    .replace(/(^|[^_])_([^_]+)_/g, '$1<i>$2</i>');
const lines = md.split('\n');
let html = '';
let i = 0;
let title = '';
while (i < lines.length) {
  const l = lines[i];
  if (/^# /.test(l)) {
    title = l.slice(2).replace(/^\d+ · /, '');
    html += `<h1>${inline(l.slice(2))}</h1>\n`;
    i++;
    continue;
  }
  if (/^## /.test(l)) {
    html += `<h2>${inline(l.slice(3))}</h2>\n`;
    i++;
    continue;
  }
  if (/^### /.test(l)) {
    html += `<h3>${inline(l.slice(4))}</h3>\n`;
    i++;
    continue;
  }
  if (/^\|/.test(l)) {
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) {
      rows.push(lines[i]);
      i++;
    }
    const cells = (r) =>
      r
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    html +=
      '<div class="tablewrap"><table><thead><tr>' +
      head.map((h) => `<th>${inline(h)}</th>`).join('') +
      '</tr></thead><tbody>' +
      body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody></table></div>\n';
    continue;
  }
  if (/^(\d+\.|-) /.test(l)) {
    const ordered = /^\d+\./.test(l);
    const items = [];
    while (i < lines.length && (/^(\d+\.|-) /.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
      if (/^(\d+\.|-) /.test(lines[i])) items.push(lines[i].replace(/^(\d+\.|-) /, ''));
      else items[items.length - 1] += ' ' + lines[i].trim();
      i++;
    }
    html +=
      `<${ordered ? 'ol' : 'ul'}>` +
      items.map((t) => `<li>${inline(t)}</li>`).join('') +
      `</${ordered ? 'ol' : 'ul'}>\n`;
    continue;
  }
  if (/^```/.test(l)) {
    const code = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) {
      code.push(lines[i]);
      i++;
    }
    i++;
    html += `<pre><code>${esc(code.join('\n'))}</code></pre>\n`;
    continue;
  }
  if (l.trim() === '') {
    i++;
    continue;
  }
  const para = [];
  while (i < lines.length && lines[i].trim() !== '' && !/^(#|\||- |\d+\. |```)/.test(lines[i])) {
    para.push(lines[i].trim());
    i++;
  }
  html += `<p>${inline(para.join(' '))}</p>\n`;
}
const head = `<title>${esc(title || 'AEQUITAS')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
  :root{color-scheme:light dark;--paper:#f3ead8;--paper-2:#eadfc6;--line:#cfc2a3;--ink:#1b1b1f;--muted:#5b5862;--accent:#5a3f86;--gold:#b8892e;
    --font-display:"Fraunces",Georgia,serif;--font-body:"Public Sans","Segoe UI",Roboto,system-ui,sans-serif;--font-mono:"IBM Plex Mono",Consolas,monospace}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--paper:#1b1b1f;--paper-2:#2e2d33;--line:#4a4850;--ink:#f3ead8;--muted:#a29ea8;--accent:#b39ddb;--gold:#e2b94a}}
  :root[data-theme="dark"]{--paper:#1b1b1f;--paper-2:#2e2d33;--line:#4a4850;--ink:#f3ead8;--muted:#a29ea8;--accent:#b39ddb;--gold:#e2b94a}
  *{box-sizing:border-box}html{background:var(--paper)}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body);font-size:16px;line-height:1.55}
  main{max-width:860px;margin:0 auto;padding:30px 20px 80px}
  .eyebrow{font-family:var(--font-mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  h1{font-family:var(--font-display);font-weight:700;font-size:clamp(30px,5vw,46px);line-height:1.05;margin:6px 0 18px;text-wrap:balance;padding-bottom:16px;border-bottom:2px solid var(--ink)}
  h2{font-family:var(--font-display);font-weight:600;font-size:26px;margin:38px 0 10px;text-wrap:balance}
  h3{font-family:var(--font-display);font-weight:600;font-size:19px;margin:26px 0 6px;color:var(--accent)}
  p{margin:0 0 12px;max-width:72ch}
  ul,ol{padding-left:22px;margin:0 0 12px;max-width:72ch} li{margin:4px 0} li::marker{color:var(--accent)}
  code{font-family:var(--font-mono);font-size:.88em;background:var(--paper-2);padding:1px 5px;border-radius:3px}
  pre{background:var(--paper-2);border:1px solid var(--line);padding:10px 12px;overflow-x:auto;font-size:13px}
  pre code{background:none;padding:0}
  .tablewrap{overflow-x:auto;margin:8px 0 14px}
  table{border-collapse:collapse;width:100%;font-size:14px}
  th,td{text-align:left;padding:7px 9px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
</style>`;
const body = `<main><div class="eyebrow">Bellium S.A.S. · AEQUITAS · Paquete de diseño</div>\n${html}</main>`;
writeFileSync(
  out,
  modo === '--artefacto'
    ? `${head}\n${body}\n`
    : `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`,
);
console.log('escrito', out, 'título:', title);
