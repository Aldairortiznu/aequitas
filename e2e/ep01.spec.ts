import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { startNewGame } from './helpers';

/**
 * Episodio 1 de punta a punta: llegada, convocatoria, Audiencia contra Marrugo (jugada por
 * la interfaz), Acta de Altamar y fin de episodio con vuelta al título.
 * Los recorridos por el mapa se atajan con acciones de sesión; lo que se prueba es el
 * contenido y las mecánicas encadenadas.
 */
type Aeq = {
  __aequitas: {
    session: {
      runActions: (a: unknown[]) => Promise<void>;
      state: {
        flags: Record<string, unknown>;
        evidence: string[];
        legitimidad: Record<string, number>;
        pactos: Record<string, { equilibrio: number }>;
        party: string[];
      };
    };
  };
};

const run = (page: Page, actions: unknown[]) =>
  page.evaluate((a) => {
    void (window as unknown as Aeq).__aequitas.session.runActions(a);
  }, actions);
const state = (page: Page) =>
  page.evaluate(() => (window as unknown as Aeq).__aequitas.session.state);

async function closeDialogs(page: Page, max = 40): Promise<void> {
  for (let i = 0; i < max; i++) {
    if ((await page.locator('.dlg__opt').count()) > 0) {
      await page.locator('.dlg__opt').first().click();
    } else if ((await page.locator('.dlg, .cut').count()) > 0) {
      await page.keyboard.press('Enter');
    } else return;
    await page.waitForTimeout(220);
  }
}

test('Altamar: convocatoria, audiencia, acta y fin de episodio', async ({ page }) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await startNewGame(page, 'ep01');
  await closeDialogs(page);

  // Pruebas, Códice y testimonio de Zoraida
  await run(
    page,
    [
      'ep01-acta-ano-1',
      'ep01-libro-actas',
      'ep01-carne-tomas',
      'ep01-valvula',
      'ep01-cuaderno-expensas',
    ].map((id) => ({ type: 'addEvidence', id })),
  );
  await run(
    page,
    ['l675-47', 'l675-50', 'l675-38', 'l675-59', 'l675-29', 'l675-3'].map((id) => ({
      type: 'unlockCodice',
      id,
    })),
  );
  await run(page, [{ type: 'dialogue', id: 'ep01-zoraida' }]);
  await expect(page.locator('.dlg')).toBeVisible();
  await closeDialogs(page);
  expect((await state(page)).evidence).toContain('ep01-testimonio-zoraida');

  // Pilar convoca
  await run(page, [{ type: 'dialogue', id: 'ep01-pilar' }]);
  await expect(page.locator('.dlg')).toBeVisible();
  await closeDialogs(page);
  await run(page, [{ type: 'dialogue', id: 'ep01-pilar' }]);
  await expect(page.locator('.dlg')).toBeVisible();
  await closeDialogs(page);
  expect((await state(page)).flags['ep01.convocada']).toBe(true);

  // Audiencia en la piscina
  await run(page, [{ type: 'teleport', map: 'piscina', spawn: 'entrada' }]);
  await page.waitForTimeout(600);
  await closeDialogs(page);
  await run(page, [{ type: 'dialogue', id: 'ep01-marrugo-piscina' }]);
  await expect(page.locator('.dlg')).toBeVisible();
  for (let i = 0; i < 8 && (await page.locator('.dlg__opt').count()) === 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await page.locator('.dlg__opt', { hasText: 'Empecemos' }).click();
  await expect(page.locator('.aud')).toBeVisible();

  const btn = async (txt: string) => {
    await page.locator('.aud__actions .btn', { hasText: txt }).first().click();
    await page.waitForTimeout(200);
  };
  const pick = async (ref: string) => {
    const exact = page.locator('.aud__drawer .pick__item', {
      has: page.locator('.list__ref', { hasText: new RegExp(`^${ref.replace(/[.]/g, '\\.')}$`) }),
    });
    const target =
      (await exact.count()) > 0
        ? exact
        : page.locator('.aud__drawer .pick__item', { hasText: ref });
    await target.first().click();
    await page.waitForTimeout(300);
  };
  const fundamentar = async (ev: string, norma: string) => {
    await btn('Fundamentar');
    await pick(ev);
    await pick(norma);
    await page.locator('.aud__drawer-foot .btn', { hasText: 'Fundamentar' }).click();
    await page.waitForTimeout(350);
  };
  await fundamentar('Acta de Asamblea', 'Art. 47 Ley 675/2001');
  await btn('Presionar');
  await btn('Presentar norma');
  await pick('Art. 50 Ley 675/2001');
  await fundamentar('Libro de actas', 'Art. 38 Ley 675/2001');
  await expect(page.locator('.aud__eyebrow')).toContainText('ronda 2');
  await btn('Invocar la Constitución');
  await pick('Art. 14 C.P.');
  await expect(page.locator('.aud__card--maniobra')).toBeVisible();
  await btn('Responder con una norma');
  await pick('Art. 4 C.P.');
  await fundamentar('Cuaderno de expensas', 'Art. 29 Ley 675/2001');
  await fundamentar('Válvula', 'Art. 59 Ley 675/2001');
  const fin = page.locator('.aud__actions--fin .btn');
  await expect(fin).toContainText('se allana');
  await fin.click();
  await closeDialogs(page);
  await page.waitForTimeout(300);
  await closeDialogs(page);
  const tras = await state(page);
  expect(tras.flags['audiencia.ep01-marrugo.ganada']).toBe(true);
  expect(tras.evidence).toContain('ep01-licencia');
  expect(tras.flags['ep01.asamblea']).toBe(true);

  // Acta de Altamar: se marcan las nulas y se eligen las cláusulas legales
  await run(page, [{ type: 'startPacto', id: 'ep01-pacto' }]);
  await expect(page.locator('.pac')).toBeVisible();
  const punto = (t: string) => page.locator('.pac__punto', { hasText: t });
  const nula = async (p: string, c: string) => {
    await punto(p).click();
    await page.locator('.pac__clausula', { hasText: c }).locator('.pac__nula').click();
  };
  const elegir = async (p: string, c: string) => {
    await punto(p).click();
    await page.locator('.pac__clausula', { hasText: c }).locator('.pac__elegir').click();
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
  await elegir('Marrugo?', 'Rinde cuentas ante la asamblea');
  await nula('el agua', 'al día en expensas');
  await elegir('el agua', 'Bien común esencial');
  await page.locator('button', { hasText: 'Firmar' }).click();
  await expect(page.locator('.pac__eq-num')).toHaveText('100');
  await page.locator('button', { hasText: 'Cerrar el acta' }).click();

  // Cierre: diálogos, lámina, escena del Registrador, guardado y vuelta al título
  await closeDialogs(page, 60);
  await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible({
    timeout: 10000,
  });
  const final = await state(page);
  expect(final.pactos['ep01-pacto']?.equilibrio).toBe(100);
  expect(final.party).toContain('pilar');
  expect(final.flags['ep01.cierre']).toBe(true);
  expect(errors).toEqual([]);
});
