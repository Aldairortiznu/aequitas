import { expect, test } from '@playwright/test';

/** D10: protagonistas seleccionables y tratamiento en los textos. */
type Aeq = {
  __aequitas: {
    session: {
      runActions: (a: unknown[]) => Promise<void>;
      state: { jugador: { preset: string; nombre: string; tratamiento: string } };
    };
  };
};

test('elegir a Ramiro cambia el nombre, el retrato y el tratamiento de los diálogos', async ({
  page,
}) => {
  await page.goto('/?ep=ep01');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.locator('.prota__card')).toHaveCount(5);
  await page.locator('.prota__card', { hasText: 'Ramiro' }).click();
  await expect(page.locator('#nombre')).toHaveValue('Ramiro');
  await expect(page.locator('.trato__opt.is-active')).toContainText('Masculino');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.hud')).toBeVisible({ timeout: 15000 });
  const st = await page.evaluate(() => (window as unknown as Aeq).__aequitas.session.state);
  expect(st.jugador).toEqual({ preset: 'ramiro', nombre: 'Ramiro', tratamiento: 'm' });
  for (let i = 0; i < 12 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => {
    void (window as unknown as Aeq).__aequitas.session.runActions([
      { type: 'dialogue', id: 'ep01-marrugo-lobby' },
    ]);
  });
  await expect(page.locator('.dlg')).toBeVisible();
  for (let i = 0; i < 10 && (await page.locator('.dlg__opt').count()) === 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  }
  await expect(page.locator('.dlg__text')).toContainText('Bienvenido a Altamar');
  await expect(page.locator('.dlg__text')).not.toContainText('Bienvenida');
});

test('el creador de personaje produce un jugador personalizado con tratamiento neutro', async ({
  page,
}) => {
  await page.goto('/?ep=ep01');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.locator('.prota__card', { hasText: 'Personalizado' }).click();
  await page.selectOption('#pelo', 'largo');
  await page.selectOption('#accesorio', 'gafas');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await page.fill('#nombre', 'Sol');
  await page.locator('.trato__opt', { hasText: 'Neutro' }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.hud')).toBeVisible({ timeout: 15000 });
  const st = await page.evaluate(() => (window as unknown as Aeq).__aequitas.session.state);
  expect(st.jugador.preset).toBe('custom');
  expect(st.jugador.nombre).toBe('Sol');
  expect(st.jugador.tratamiento).toBe('n');
  for (let i = 0; i < 12 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => {
    void (window as unknown as Aeq).__aequitas.session.runActions([
      { type: 'dialogue', id: 'ep01-marrugo-lobby' },
    ]);
  });
  await expect(page.locator('.dlg')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.dlg__text')).toContainText('Le doy la bienvenida a Altamar');
});
