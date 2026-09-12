// Sonda de humo del Episodio 1: mapas, diálogos clave, audiencia, pacto y fin de episodio.
// Uso: npm run build && node scripts/dev/probe-ep01.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('test-results', { recursive: true });
const server = spawn('npx', ['vite', 'preview', '--port', '4182', '--strictPort'], {
  shell: true,
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const closeDialogs = async (max = 40) => {
  for (let i = 0; i < max; i++) {
    if ((await page.locator('.dlg__opt').count()) > 0) {
      await page.locator('.dlg__opt').first().click();
      await page.waitForTimeout(250);
      continue;
    }
    if ((await page.locator('.dlg').count()) === 0) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
};
const skipCutscene = async () => {
  for (let i = 0; i < 8 && (await page.locator('.cut').count()) > 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
};

await page.goto('http://localhost:4182/?ep=ep01');
await page.waitForSelector('#game canvas');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Nueva partida' }).click();
await page.getByRole('button', { name: 'Empezar' }).click();
await page.waitForSelector('.hud', { timeout: 15000 });
await page.waitForTimeout(600);
await page.screenshot({ path: 'test-results/ep01-0-cutscene.png' });
await skipCutscene();
await page.waitForTimeout(300);
await closeDialogs();
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/ep01-1-lobby.png' });

const S = () => page.evaluate(() => window.__aequitas.session.state);
// No se espera la promesa: runActions solo resuelve cuando cierra el modal.
const run = (actions) =>
  page.evaluate((a) => {
    void window.__aequitas.session.runActions(a);
  }, actions);

// Mapas: teletransporte y captura de cada uno
for (const [map, spawn] of [
  ['torre', 'piso3-desde-lobby'],
  ['torre', 'piso4-desde-3'],
  ['torre', 'piso7-desde-4'],
  ['sotanos', 'entrada'],
  ['piscina', 'entrada'],
]) {
  await run([{ type: 'teleport', map, spawn }]);
  await page.waitForTimeout(700);
  await closeDialogs();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `test-results/ep01-map-${map}-${spawn}.png` });
}

// Diálogo de Pilar (primera vez) con elección
await run([{ type: 'dialogue', id: 'ep01-pilar' }]);
await page.waitForSelector('.dlg');
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/ep01-2-pilar.png' });
await closeDialogs();
let st = await S();
const pilarFlag = st.flags['ep01.pilar'];

// Recoger todas las pruebas y volver a hablar con Pilar → convocatoria
await run(
  [
    'ep01-acta-ano-1',
    'ep01-libro-actas',
    'ep01-carne-tomas',
    'ep01-valvula',
    'ep01-cuaderno-expensas',
    'ep01-reglamento',
  ].map((id) => ({ type: 'addEvidence', id })),
);
await page.waitForTimeout(300);
await run(
  ['l675-47', 'l675-50', 'l675-38', 'l675-59', 'l675-29', 'l675-3', 'cp-86'].map((id) => ({
    type: 'unlockCodice',
    id,
  })),
);
await page.waitForTimeout(300);
// Testimonio de Zoraida por diálogo (incluye consulta)
await run([{ type: 'dialogue', id: 'ep01-zoraida' }]);
await page.waitForSelector('.dlg');
for (let i = 0; i < 40; i++) {
  if ((await page.locator('.dlg__opt').count()) > 0) {
    // Consulta: elegir la opción correcta (contiene «tutela»)
    const good = page.locator('.dlg__opt', { hasText: 'tutela' });
    if ((await good.count()) > 0) await good.first().click();
    else await page.locator('.dlg__opt').first().click();
    await page.waitForTimeout(250);
    continue;
  }
  if ((await page.locator('.dlg').count()) === 0) break;
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
st = await S();
const zoraida = {
  testimonio: st.evidence.includes('ep01-testimonio-zoraida'),
  voces: st.voces.map((v) => v.id),
  consultas: st.consultasResueltas,
};

await run([{ type: 'dialogue', id: 'ep01-pilar' }]);
await page.waitForSelector('.dlg');
await page.waitForTimeout(300);
await page.screenshot({ path: 'test-results/ep01-3-pilar-convoca.png' });
await closeDialogs();
st = await S();
const convocada = st.flags['ep01.convocada'];

// Mesa bloqueada antes de la audiencia
await run([{ type: 'teleport', map: 'piscina', spawn: 'entrada' }]);
await page.waitForTimeout(600);
await closeDialogs();

// Audiencia: abrir por diálogo de Marrugo en la piscina
await run([{ type: 'dialogue', id: 'ep01-marrugo-piscina' }]);
await page.waitForSelector('.dlg');
await page.waitForTimeout(300);
await page.screenshot({ path: 'test-results/ep01-3b-marrugo.png' });
console.log('marrugo text:', await page.locator('.dlg__text').innerText().catch(() => '?'));
console.log('flags:', JSON.stringify((await S()).flags));
for (let i = 0; i < 6 && (await page.locator('.dlg__opt').count()) === 0 && (await page.locator('.dlg').count()) > 0; i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}
const empezar = page.locator('.dlg__opt', { hasText: 'Empecemos' });
if ((await empezar.count()) > 0) await empezar.click();
await page.waitForSelector('.aud', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/ep01-4-audiencia.png' });
const audTexto = await page.locator('.aud').innerText();

// Jugar la audiencia por la interfaz
const clickBtn = async (txt) => {
  await page.locator('.aud__actions .btn', { hasText: txt }).first().click();
  await page.waitForTimeout(250);
};
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pick = async (txt) => {
  // Normas: coincidencia exacta de la referencia («Art. 29 Ley 675/2001» ≠ «Art. 29 C.P.»)
  const byRef = page.locator('.aud__drawer .pick__item', {
    has: page.locator('.list__ref', { hasText: new RegExp(`^${esc(txt)}$`) }),
  });
  const target =
    (await byRef.count()) > 0 ? byRef : page.locator('.aud__drawer .pick__item', { hasText: txt });
  await target.first().click();
  await page.waitForTimeout(350);
};
const fundamentar = async (ev, norma) => {
  await clickBtn('Fundamentar');
  await pick(ev);
  await pick(norma);
  await page.locator('.aud__drawer-foot .btn', { hasText: 'Fundamentar' }).click();
  await page.waitForTimeout(400);
};
const afTexto = async () => (await page.locator('.aud__afirmacion').innerText().catch(() => '')).slice(0, 60);
const audLog = [];
const paso = async (label, fn) => {
  await fn();
  const t = await afTexto();
  const meters = await page.locator('.aud__meters').innerText().catch(() => '');
  audLog.push(`${label} → ${t} | ${meters.replace(/\s+/g, ' ')}`);
};
// Ronda 1
await paso('acta', () => fundamentar('Acta de Asamblea', 'Art. 47 Ley 675/2001'));
await paso('presionar dueño', () => clickBtn('Presionar'));
await paso('norma 50', async () => { await clickBtn('Presentar norma'); await pick('Art. 50 Ley 675/2001'); });
await paso('vitalicio', () => fundamentar('Libro de actas', 'Art. 38 Ley 675/2001'));
await page.screenshot({ path: 'test-results/ep01-4b-ronda2.png' });
// Ronda 2
await page.screenshot({ path: 'test-results/ep01-4b2-carne.png' });
await paso('invocar cp-14', async () => { await clickBtn('Invocar la Constitución'); await pick('Art. 14 C.P.'); });
await page.waitForTimeout(300);
if ((await page.locator('.aud__card--maniobra').count()) > 0) {
  await page.screenshot({ path: 'test-results/ep01-4c-maniobra.png' });
  await paso('maniobra cp-4', async () => { await clickBtn('Responder con una norma'); await pick('Art. 4 C.P.'); });
}
await paso('expensas', () => fundamentar('Cuaderno de expensas', 'Art. 29 Ley 675/2001'));
await paso('agua', () => fundamentar('Válvula', 'Art. 59 Ley 675/2001'));
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/ep01-4d-fin.png' });
const finBtn = page.locator('.aud__actions--fin .btn');
const finTxt = (await finBtn.count()) > 0 ? await finBtn.first().innerText() : '(sin final)';
if ((await finBtn.count()) > 0) await finBtn.first().click();
await page.waitForTimeout(600);
// Diálogo de allanamiento + beat tras audiencia
await closeDialogs();
await page.waitForTimeout(400);
await closeDialogs();
await page.screenshot({ path: 'test-results/ep01-5-tras-audiencia.png' });
st = await S();
const trasAud = {
  finTxt,
  ganada: st.flags['audiencia.ep01-marrugo.ganada'],
  licencia: st.evidence.includes('ep01-licencia'),
  asamblea: st.flags['ep01.asamblea'],
  leg: st.legitimidad,
};

// Pacto: abrir y firmar el acta óptima
await run([{ type: 'startPacto', id: 'ep01-pacto' }]);
await page.waitForSelector('.pac', { timeout: 5000 });
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/ep01-6-pacto.png' });
const elegir = async (punto, clausula) => {
  await page.click(`.pac__punto:has-text("${punto}")`);
  await page.waitForTimeout(150);
  await page.click(`.pac__clausula:has-text("${clausula}") .pac__elegir`);
  await page.waitForTimeout(150);
};
const nula = async (punto, clausula) => {
  await page.click(`.pac__punto:has-text("${punto}")`);
  await page.waitForTimeout(150);
  await page.click(`.pac__clausula:has-text("${clausula}") .pac__nula`);
  await page.waitForTimeout(150);
};
await nula('Quién administra', 'vitalicio');
await nula('Quién administra', 'Pilar Cantillo');
await elegir('Quién administra', 'convocada en regla');
await nula('expensas', 'el doble');
await elegir('expensas', 'reliquidan');
await nula('sin carné', 'cuando paguen');
await nula('sin carné', 'se van del conjunto');
await elegir('sin carné', 'Recuperan carné y nombre');
await nula('Marrugo?', 'Expulsado');
await nula('Marrugo?', 'Trabajo obligatorio');
await elegir('Marrugo?', 'Rinde cuentas');
await nula('el agua', 'al día en expensas');
await elegir('el agua', 'Bien común esencial');
await page.click('button:has-text("Firmar")');
await page.waitForTimeout(500);
await page.screenshot({ path: 'test-results/ep01-7-acta.png' });
const eq = await page.textContent('.pac__eq-num').catch(() => null);
await page.click('button:has-text("Cerrar el acta")');
await page.waitForTimeout(600);
// Cierre: diálogo, cinemática, diálogo del Registrador, guardado, fin
for (let i = 0; i < 40; i++) {
  if ((await page.locator('.dlg__opt').count()) > 0) {
    await page.locator('.dlg__opt').first().click();
  } else if ((await page.locator('.dlg').count()) > 0 || (await page.locator('.cut').count()) > 0) {
    if (i === 6) await page.screenshot({ path: 'test-results/ep01-8-cierre.png' });
    await page.keyboard.press('Enter');
  } else break;
  await page.waitForTimeout(250);
}
await page.waitForTimeout(1500);
await page.screenshot({ path: 'test-results/ep01-9-final.png' });
const enTitulo = (await page.getByRole('button', { name: 'Nueva partida' }).count()) > 0;
st = await S();
console.log(
  JSON.stringify(
    {
      pilarFlag,
      zoraida,
      convocada,
      audTexto: audTexto.slice(0, 200),
      trasAud,
      audLog,
      eq,
      pactos: st.pactos,
      cierre: st.flags['ep01.cierre'],
      party: st.party,
      valvula: st.flags['ep01.valvula'],
      mapStates: st.mapStates,
      enTitulo,
      errors,
    },
    null,
    1,
  ),
);
await browser.close();
server.kill();
process.exit(0);
