import { expect, test } from '@playwright/test';

/** Diálogo (E2): opciones, Consulta correcta e incorrecta, efectos sobre el estado. */
test('la conversación con Nepomuceno ramifica, evalúa la consulta y aplica efectos', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.hud')).toBeVisible({ timeout: 10000 });

  await page.evaluate(() =>
    (
      window as unknown as {
        __aequitas: { session: { bus: { emit: (n: string, e: unknown) => void } } };
      }
    ).__aequitas.session.bus.emit('world:interact', {
      kind: 'npc',
      id: 'npc-nepomuceno',
      payload: { personaje: 'nepomuceno', dialogo: 'gym-bienvenida' },
    }),
  );
  const dlg = page.locator('.dlg');
  await expect(dlg).toBeVisible();
  await expect(page.locator('.dlg__name')).toHaveText('Nepomuceno');
  await expect(page.locator('.dlg__text')).toContainText('Llegaste');

  // Completar y avanzar al nodo con opciones (las opciones aparecen al terminar el texto).
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await expect(page.locator('.dlg__opt')).toHaveCount(2, { timeout: 8000 });
  await page.locator('.dlg__opt').first().click();

  // Nodo «consulta»: texto y luego la pregunta con tres opciones.
  await expect(page.locator('.dlg__text')).toContainText('Pregunta');
  await expect(page.locator('.dlg__opt')).toHaveCount(3, { timeout: 8000 });

  // Respuesta incorrecta: explica y vuelve a preguntar.
  await page.locator('.dlg__opt').nth(1).click();
  await expect(page.locator('.dlg__text')).toContainText('Nadie la siembra');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await expect(page.locator('.dlg__opt')).toHaveCount(3, { timeout: 8000 });

  // Respuesta correcta: desbloquea cp-1 y suma legitimidad.
  await page.locator('.dlg__opt').nth(0).click();
  await expect(page.locator('.dlg__text')).toContainText('Eso es');
  const st = await page.evaluate(() => {
    const s = (
      window as unknown as {
        __aequitas: {
          session: {
            state: {
              codice: string[];
              legitimidad: Record<string, number>;
              flags: Record<string, unknown>;
            };
          };
        };
      }
    ).__aequitas.session.state;
    return { codice: s.codice, leg: s.legitimidad, visto: s.flags['gym.bienvenida'] };
  });
  expect(st.codice).toContain('cp-1');
  expect(st.leg.gimnasio).toBe(13);
  expect(st.visto).toBe(true);

  // Cerrar.
  for (let i = 0; i < 6 && (await dlg.count()) > 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  }
  await expect(dlg).toHaveCount(0);
  expect(errors).toEqual([]);
});
