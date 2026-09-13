// Genera el dossier de revisión jurídica: cada norma del Códice con todas sus citas en el juego.
// Salidas: docs/informes/revision-juridica-<fecha>.html (autónomo) y
//          test-results/dossier/revision-juridica-artefacto.html (para publicar como artefacto).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const fecha = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const list = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : []);

// ---------------------------------------------------------------- datos
const codice = [];
for (const f of list('content/codice')) codice.push(...load(join('content/codice', f)));
const LIBROS = {
  constitucion: 'Constitución Política',
  civil: 'Código Civil',
  comercio: 'Código de Comercio',
  laboral: 'Código Sustantivo del Trabajo',
  ph: 'Ley 675 de 2001 (propiedad horizontal)',
  especial: 'Normas especiales',
  jurisprudencia: 'Jurisprudencia',
  principios: 'Principios',
};
const index = load('content/index.json');
const episodios = index.episodes.filter((e) => !e.hidden).map((e) => e.id);
const EP_TITULO = {
  ep00: 'Prólogo · El códice que no ardió',
  ep01: 'Episodio 1 · Sin folio',
  gym: 'Episodio de prueba',
};

const usos = {}; // id → [{tipo, episodio, titulo, texto, detalle}]
const usa = (id, u) => {
  if (!usos[id]) usos[id] = [];
  usos[id].push(u);
};
const evidencias = {};
for (const ep of episodios) {
  const dir = `content/${ep}`;
  if (existsSync(`${dir}/evidence.json`))
    for (const e of load(`${dir}/evidence.json`)) evidencias[e.id] = e;
  // Consultas
  if (existsSync(`${dir}/consultas.json`))
    for (const c of load(`${dir}/consultas.json`)) {
      if (!c.codice) continue;
      const ok = c.opciones.find((o) => o.correcta);
      const mal = c.opciones.filter((o) => !o.correcta);
      usa(c.codice, {
        tipo: 'Consulta',
        episodio: ep,
        titulo: c.pregunta,
        texto: `Respuesta correcta: «${ok?.texto}» → ${ok?.respuesta}`,
        detalle: mal.map((o) => `Incorrecta: «${o.texto}» → ${o.respuesta}`),
      });
    }
  // Audiencias
  for (const f of list(`${dir}/audiencias`)) {
    const a = load(`${dir}/audiencias/${f}`);
    for (const r of a.rondas) {
      for (const af of r.afirmaciones) {
        const s = af.solucion;
        const normas = s.codice ?? [];
        for (const n of normas)
          usa(n, {
            tipo: 'Audiencia',
            episodio: ep,
            titulo: `${a.titulo} · ${a.adversario.nombre} afirma: «${af.texto}»`,
            texto: `Se contradice con ${s.tipo === 'norma' ? 'la norma' : 'el hecho ' + (s.evidencia ?? []).map((e) => `«${evidencias[e]?.nombre ?? e}»`).join(', ') + ' más la norma'}. ${a.adversario.nombre} responde: «${af.respuestas.plena}»`,
            detalle: af.nota ? [`Nota jurídica del Cuaderno: ${af.nota}`] : [],
          });
      }
      if (r.maniobra?.respuestaNorma)
        usa(r.maniobra.respuestaNorma, {
          tipo: 'Audiencia · maniobra',
          episodio: ep,
          titulo: `${a.titulo} · maniobra «${r.maniobra.id}»`,
          texto: r.maniobra.texto,
          detalle: ['La norma correcta para responder a la maniobra es esta.'],
        });
    }
    if (a.invocacion) {
      const af = a.rondas
        .flatMap((r) => r.afirmaciones)
        .find((x) => x.id === a.invocacion.afirmacion);
      usa(a.invocacion.correcta, {
        tipo: 'Audiencia · invocación',
        episodio: ep,
        titulo: `${a.titulo} · Invocar la Constitución ante «${af?.texto ?? a.invocacion.afirmacion}»`,
        texto: `Artículo correcto entre ${a.invocacion.opciones.join(', ')}.`,
        detalle: [],
      });
      for (const o of a.invocacion.opciones)
        if (o !== a.invocacion.correcta)
          usa(o, {
            tipo: 'Audiencia · invocación (distractor)',
            episodio: ep,
            titulo: `${a.titulo} · se ofrece como opción incorrecta ante «${af?.texto ?? ''}»`,
            texto: 'Debe ser claramente inaplicable al caso.',
            detalle: [],
          });
    }
  }
  // Pactos
  for (const f of list(`${dir}/pactos`)) {
    const p = load(`${dir}/pactos/${f}`);
    for (const pt of p.puntos)
      for (const c of pt.clausulas)
        if (c.nula)
          usa(c.nula.norma, {
            tipo: 'Pacto · cláusula nula',
            episodio: ep,
            titulo: `${p.titulo} · ${pt.pregunta}`,
            texto: `Cláusula: «${c.textoActa}»`,
            detalle: [`Por qué es nula: ${c.nula.explicacion}`],
          });
  }
}
// Interpelaciones
const interpelaciones = load('content/interpelaciones.json');
for (const i of interpelaciones)
  usa(i.articulo, {
    tipo: 'Interpelación',
    episodio: 'global',
    titulo: `Un alguacil exige el artículo que responde a: «${i.afirmacion ?? i.pregunta ?? i.texto ?? ''}»`,
    texto: `Opciones ofrecidas: ${(i.opciones ?? []).join(', ')}.`,
    detalle: [],
  });

// Cláusulas legales de los pactos (para verificar que sí son lícitas)
const clausulasLegales = [];
for (const ep of episodios)
  for (const f of list(`content/${ep}/pactos`)) {
    const p = load(`content/${ep}/pactos/${f}`);
    for (const pt of p.puntos)
      for (const c of pt.clausulas)
        if (c.legal)
          clausulasLegales.push({
            episodio: ep,
            pacto: p.titulo,
            punto: pt.pregunta,
            texto: c.textoActa,
            justicia: c.justicia,
          });
  }

const data = {
  fecha,
  entradas: codice.map((e) => ({
    ...e,
    libroNombre: LIBROS[e.libro] ?? e.libro,
    usos: usos[e.id] ?? [],
  })),
  clausulasLegales,
  episodios: EP_TITULO,
};

// ---------------------------------------------------------------- html
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const head = `<title>AEQUITAS · Revisión jurídica</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
  :root { color-scheme: light dark;
    --paper:#f3ead8; --paper-2:#eadfc6; --line:#cfc2a3; --ink:#1b1b1f; --muted:#6f6c76; --accent:#5a3f86; --accent-soft:#e6dcf3;
    --gold:#b8892e; --gold-soft:#f4dc8a; --ok:#2f5d3a; --ok-soft:#d9ecd2; --bad:#8a2f2f; --bad-soft:#f1cfcf; --warn:#7a4b2d;
    --font-display:"Fraunces",Georgia,serif; --font-body:"Public Sans","Segoe UI",Roboto,system-ui,sans-serif; --font-mono:"IBM Plex Mono",Consolas,monospace; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
    --paper:#1b1b1f; --paper-2:#2e2d33; --line:#4a4850; --ink:#f3ead8; --muted:#a29ea8; --accent:#b39ddb; --accent-soft:#3b2a5c;
    --gold:#e2b94a; --gold-soft:#5a4a1e; --ok:#b9e39a; --ok-soft:#26402b; --bad:#f0a3a3; --bad-soft:#4a2323; --warn:#d9a66b; } }
  :root[data-theme="dark"] {
    --paper:#1b1b1f; --paper-2:#2e2d33; --line:#4a4850; --ink:#f3ead8; --muted:#a29ea8; --accent:#b39ddb; --accent-soft:#3b2a5c;
    --gold:#e2b94a; --gold-soft:#5a4a1e; --ok:#b9e39a; --ok-soft:#26402b; --bad:#f0a3a3; --bad-soft:#4a2323; --warn:#d9a66b; }
  *{box-sizing:border-box} html{background:var(--paper)}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-body);font-size:15.5px;line-height:1.5}
  main{max-width:960px;margin:0 auto;padding:28px 18px 90px}
  .eyebrow{font-family:var(--font-mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  h1{font-family:var(--font-display);font-weight:700;font-size:clamp(30px,5vw,44px);line-height:1.05;margin:4px 0 8px;text-wrap:balance}
  h2{font-family:var(--font-display);font-weight:600;font-size:24px;margin:34px 0 10px}
  p{margin:0 0 10px;max-width:72ch}
  code{font-family:var(--font-mono);font-size:.88em;background:var(--paper-2);padding:1px 5px;border-radius:3px}
  .intro{border-bottom:2px solid var(--ink);padding-bottom:16px;margin-bottom:12px}
  .revisor{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0 0}
  .revisor input{font:inherit;padding:6px 10px;border:1px solid var(--line);border-radius:4px;background:var(--paper-2);color:var(--ink);min-width:220px}
  .bar{position:sticky;top:0;z-index:5;background:var(--paper);border-bottom:1px solid var(--line);padding:10px 0;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:14px}
  .bar .cnt{font-family:var(--font-mono);font-size:13px;color:var(--muted)}
  .bar .cnt b{color:var(--ink)}
  .bar button{font:inherit;font-size:13px;padding:5px 10px;border:1px solid var(--line);background:var(--paper-2);color:var(--ink);border-radius:999px;cursor:pointer}
  .bar button[aria-pressed="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
  .bar .estado{margin-left:auto;font-family:var(--font-mono);font-size:12px;color:var(--muted)}
  .libro{margin-top:30px}
  .libro h2{margin-top:0}
  .norma{border:1px solid var(--line);border-left:4px solid var(--pending,var(--line));border-radius:6px;background:var(--paper-2);padding:14px 16px;margin:12px 0;scroll-margin-top:70px}
  .norma[data-estado="aprobada"]{border-left-color:var(--ok)}
  .norma[data-estado="corregir"]{border-left-color:var(--bad)}
  .norma.oculta{display:none}
  .norma header{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}
  .norma .ref{font-family:var(--font-mono);font-size:13px;color:var(--accent);font-weight:500}
  .norma h3{font-family:var(--font-display);font-weight:600;font-size:19px;margin:0}
  .norma .tag{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
  .literal{font-family:var(--font-display);font-size:15.5px;line-height:1.5;margin:10px 0;padding:10px 14px;background:var(--paper);border:1px solid var(--line);border-radius:4px;max-width:none}
  dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:8px 0;font-size:14px}
  dt{font-family:var(--font-mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-top:2px}
  dd{margin:0;max-width:78ch}
  details{margin:8px 0}
  summary{cursor:pointer;font-weight:600;font-size:14px}
  .uso{border-top:1px dashed var(--line);padding:8px 0;font-size:14px}
  .uso .t{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);margin-right:8px}
  .uso .ep{font-family:var(--font-mono);font-size:11px;color:var(--muted)}
  .uso .q{font-weight:600;margin:2px 0}
  .uso ul{margin:4px 0 0;padding-left:18px;color:var(--muted)}
  .rev{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
  .opciones{display:flex;flex-wrap:wrap;gap:6px}
  .opciones label{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:4px 10px;cursor:pointer;font-size:13.5px;background:var(--paper)}
  .opciones label:has(input:checked){border-color:var(--ink);background:var(--ink);color:var(--paper)}
  .opciones label.ok:has(input:checked){background:var(--ok);border-color:var(--ok);color:#fff}
  .opciones label.bad:has(input:checked){background:var(--bad);border-color:var(--bad);color:#fff}
  .opciones input{margin:0}
  textarea{font:inherit;font-size:14px;width:100%;min-height:54px;padding:8px 10px;border:1px solid var(--line);border-radius:4px;background:var(--paper);color:var(--ink);resize:vertical}
  .meta{font-family:var(--font-mono);font-size:11.5px;color:var(--muted)}
  table{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0}
  th,td{text-align:left;padding:7px 9px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
  .tablewrap{overflow-x:auto}
  .exportar{margin-top:20px;display:grid;gap:8px}
  .exportar textarea{min-height:120px;font-family:var(--font-mono);font-size:12px}
  footer{margin-top:50px;padding-top:14px;border-top:1px solid var(--line);font-family:var(--font-mono);font-size:12.5px;color:var(--muted)}
  button.primario{font:inherit;padding:8px 14px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;cursor:pointer;width:max-content}
  @media (prefers-reduced-motion: reduce){*{transition:none!important}}
</style>`;

const entradasHtml = Object.entries(LIBROS)
  .map(([libro, nombre]) => {
    const es = data.entradas.filter((e) => e.libro === libro);
    if (!es.length) return '';
    return `<section class="libro" data-libro="${libro}"><h2>${esc(nombre)} <span class="tag">${es.length}</span></h2>
${es
  .map(
    (e) => `<article class="norma" id="${esc(e.id)}" data-id="${esc(e.id)}" data-estado="pendiente">
  <header><span class="ref">${esc(e.referencia)}</span><h3>${esc(e.titulo)}</h3>${e.esExtracto ? '<span class="tag">extracto</span>' : '<span class="tag">texto completo</span>'}<span class="meta">consultado ${esc(e.fechaConsulta)}</span></header>
  <blockquote class="literal">${esc(e.textoLiteral)}</blockquote>
  <dl><dt>En palabras simples</dt><dd>${esc(e.enPalabrasSimples)}</dd><dt>Uso en audiencia</dt><dd>${esc(e.usoEnAudiencia)}</dd>${e.ejemplo ? `<dt>Ejemplo</dt><dd>${esc(e.ejemplo)}</dd>` : ''}<dt>Etiquetas</dt><dd class="meta">${esc((e.etiquetas ?? []).join(' · '))}</dd></dl>
  <details ${e.usos.length ? 'open' : ''}><summary>Cómo la usa el juego · ${e.usos.length} cita${e.usos.length === 1 ? '' : 's'}</summary>
  ${e.usos.length ? e.usos.map((u) => `<div class="uso"><span class="t">${esc(u.tipo)}</span> <span class="ep">${esc(data.episodios[u.episodio] ?? u.episodio)}</span><div class="q">${esc(u.titulo)}</div><div>${esc(u.texto)}</div>${u.detalle.length ? `<ul>${u.detalle.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}</div>`).join('') : '<div class="uso">Sin citas todavía (entrada de reserva para episodios posteriores).</div>'}
  </details>
  <div class="rev">
    <div class="opciones" role="radiogroup" aria-label="Decisión sobre ${esc(e.referencia)}">
      <label class="ok"><input type="radio" name="d-${esc(e.id)}" value="aprobada"> Aprobada tal como está</label>
      <label class="bad"><input type="radio" name="d-${esc(e.id)}" value="corregir"> Corregir (anota qué)</label>
      <label><input type="radio" name="d-${esc(e.id)}" value="pendiente" checked> Pendiente</label>
    </div>
    <textarea placeholder="Observaciones: texto literal, vigencia, lectura en palabras simples, cómo la aplica el juego…" aria-label="Observaciones sobre ${esc(e.referencia)}"></textarea>
    <div class="meta guardado"></div>
  </div>
</article>`,
  )
  .join('\n')}</section>`;
  })
  .join('\n');

const clausulasHtml = `<section><h2>Cláusulas que el juego trata como lícitas</h2>
<p>En cada Pacto, estas cláusulas se pueden firmar sin impugnación. Conviene confirmar que ninguna sea nula o inconveniente en la práctica.</p>
<div class="tablewrap"><table><thead><tr><th>Episodio</th><th>Pacto · punto</th><th>Cláusula (texto del acta)</th></tr></thead><tbody>
${data.clausulasLegales.map((c) => `<tr><td>${esc(data.episodios[c.episodio] ?? c.episodio)}</td><td>${esc(c.pacto)} · ${esc(c.punto)}</td><td>${esc(c.texto)}</td></tr>`).join('\n')}
</tbody></table></div></section>`;

const body = `<main>
  <div class="intro">
    <div class="eyebrow">Bellium S.A.S. · AEQUITAS · Revisión jurídica del contenido</div>
    <h1>Códice y citas del Prólogo y el Episodio 1</h1>
    <p>Cada norma que el juego cita, con su texto literal, la explicación en palabras simples y <b>todas las veces que el juego la usa</b>: consultas, afirmaciones de audiencia, maniobras, cláusulas nulas e interpelaciones. Para cada una, marca <b>Aprobada</b> o <b>Corregir</b> y anota lo que haga falta. Las decisiones se guardan solas y Claude las aplica al contenido (<code>revisado: true</code> o corrección).</p>
    <p>Qué vale la pena verificar: que el texto literal esté vigente y bien citado; que la lectura en palabras simples no distorsione; que el adversario esté realmente equivocado y la respuesta del juego sea la correcta; que las cláusulas «nulas» lo sean por la norma indicada.</p>
    <div class="revisor"><label for="revisor">Nombre de quien revisa</label><input id="revisor" placeholder="Nombre y apellido"></div>
  </div>
  <div class="bar" role="toolbar" aria-label="Filtro y progreso">
    <span class="cnt"><b id="n-total">0</b> normas · <b id="n-aprobadas">0</b> aprobadas · <b id="n-corregir">0</b> por corregir · <b id="n-pendientes">0</b> pendientes</span>
    <button type="button" data-filtro="todas" aria-pressed="true">Todas</button>
    <button type="button" data-filtro="pendiente" aria-pressed="false">Pendientes</button>
    <button type="button" data-filtro="corregir" aria-pressed="false">Por corregir</button>
    <button type="button" data-filtro="aprobada" aria-pressed="false">Aprobadas</button>
    <span class="estado" id="estado-sync">guardado local</span>
  </div>
  ${entradasHtml}
  ${clausulasHtml}
  <section class="exportar"><h2>Resumen de decisiones</h2>
    <p>Si esta página se abre como archivo (sin conexión), copia este resumen y envíalo; si está publicada, Claude lo lee directamente.</p>
    <button type="button" class="primario" id="btn-resumen">Generar resumen</button>
    <textarea id="resumen" aria-label="Resumen de decisiones" readonly></textarea>
  </section>
  <footer>Generado el ${esc(fecha)} desde <code>content/codice</code>, <code>content/ep00</code> y <code>content/ep01</code> · Las normas se consultaron el ${esc(fecha)} y no han sido revisadas por un abogado.</footer>
</main>
<script>
(() => {
  const ARTICULOS = ${JSON.stringify(data.entradas.map((e) => ({ id: e.id, referencia: e.referencia })))};
  const LS = 'aequitas.revision-juridica';
  let local = {};
  try { local = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { local = {}; }
  let db = null;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const revisorInput = $('#revisor');
  try { revisorInput.value = localStorage.getItem(LS + '.revisor') || ''; } catch (e) {}
  revisorInput.addEventListener('input', () => { try { localStorage.setItem(LS + '.revisor', revisorInput.value); } catch (e) {} });

  const setEstado = (id, doc) => {
    const art = document.getElementById(id);
    if (!art) return;
    const estado = doc?.estado || 'pendiente';
    art.dataset.estado = estado;
    const radio = art.querySelector('input[value="' + estado + '"]');
    if (radio && !radio.checked) radio.checked = true;
    const ta = art.querySelector('textarea');
    if (doc && typeof doc.comentario === 'string' && ta.value !== doc.comentario && document.activeElement !== ta) ta.value = doc.comentario;
    art.querySelector('.guardado').textContent = doc?.fecha ? 'Guardado ' + new Date(doc.fecha).toLocaleString('es-CO') + (doc.revisor ? ' · ' + doc.revisor : '') : '';
    contar();
  };
  const contar = () => {
    const arts = $$('.norma');
    const n = (e) => arts.filter((a) => a.dataset.estado === e).length;
    $('#n-total').textContent = arts.length;
    $('#n-aprobadas').textContent = n('aprobada');
    $('#n-corregir').textContent = n('corregir');
    $('#n-pendientes').textContent = n('pendiente');
  };
  const timers = {};
  const guardar = (id) => {
    const art = document.getElementById(id);
    const estado = art.querySelector('input:checked')?.value || 'pendiente';
    const comentario = art.querySelector('textarea').value;
    const doc = { estado, comentario, revisor: revisorInput.value.trim(), fecha: new Date().toISOString(), referencia: ARTICULOS.find((a) => a.id === id)?.referencia || id };
    local[id] = doc;
    try { localStorage.setItem(LS, JSON.stringify(local)); } catch (e) {}
    setEstado(id, doc);
    if (db) {
      clearTimeout(timers[id]);
      timers[id] = setTimeout(() => {
        db.doc('revisiones/' + id).set(doc).then(() => { $('#estado-sync').textContent = 'sincronizado'; })
          .catch((e) => { $('#estado-sync').textContent = 'sin sincronizar (' + (e && e.code || 'error') + ')'; });
      }, 400);
    }
  };
  for (const art of $$('.norma')) {
    const id = art.dataset.id;
    art.addEventListener('change', (ev) => { if (ev.target.matches('input[type="radio"]')) guardar(id); });
    art.querySelector('textarea').addEventListener('input', () => { clearTimeout(timers['t' + id]); timers['t' + id] = setTimeout(() => guardar(id), 600); });
    if (local[id]) setEstado(id, local[id]);
  }
  contar();
  // Filtro
  for (const b of $$('.bar button[data-filtro]')) b.addEventListener('click', () => {
    for (const o of $$('.bar button[data-filtro]')) o.setAttribute('aria-pressed', String(o === b));
    const f = b.dataset.filtro;
    for (const art of $$('.norma')) art.classList.toggle('oculta', f !== 'todas' && art.dataset.estado !== f);
    for (const sec of $$('.libro')) sec.style.display = $$('.norma:not(.oculta)', sec).length ? '' : 'none';
  });
  // Resumen
  $('#btn-resumen').addEventListener('click', () => {
    const lineas = [];
    for (const art of $$('.norma')) {
      const id = art.dataset.id; const d = local[id] || {};
      const estado = art.dataset.estado;
      if (estado === 'pendiente' && !d.comentario) continue;
      lineas.push((ARTICULOS.find((a) => a.id === id)?.referencia || id) + ' [' + id + ']: ' + estado.toUpperCase() + (d.comentario ? ' — ' + d.comentario.replace(/\\s+/g, ' ') : ''));
    }
    $('#resumen').value = (revisorInput.value ? 'Revisor: ' + revisorInput.value + '\\n' : '') + (lineas.join('\\n') || '(sin decisiones todavía)');
    $('#resumen').select();
  });
  // Base de datos compartida (cuando la página está publicada)
  const conectar = async () => {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    db = await window.claude.use('db');
    if (!db) return;
    $('#estado-sync').textContent = 'conectado';
    db.collection('revisiones').onSnapshot((snap) => {
      for (const d of snap.docs) { const doc = d.data(); if (!doc) continue; local[d.id] = doc; setEstado(d.id, doc); }
      try { localStorage.setItem(LS, JSON.stringify(local)); } catch (e) {}
    }, () => { $('#estado-sync').textContent = 'sin conexión con la base'; });
  };
  conectar();
})();
</script>`;

const standalone = `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
mkdirSync('docs/informes', { recursive: true });
mkdirSync('test-results/dossier', { recursive: true });
writeFileSync(`docs/informes/revision-juridica-${fecha}.html`, standalone);
writeFileSync('test-results/dossier/revision-juridica-artefacto.html', `${head}\n${body}\n`);
console.log(
  `normas: ${data.entradas.length} · citas: ${Object.values(usos).reduce((n, u) => n + u.length, 0)} · cláusulas lícitas: ${clausulasLegales.length}`,
);
console.log(`escrito docs/informes/revision-juridica-${fecha}.html`);
