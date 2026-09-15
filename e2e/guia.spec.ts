import { expect, test } from '@playwright/test';
import { startNewGame } from './helpers';

/** Modo guiado: objetivo en el HUD, marcador en el mundo, Cuaderno y viaje rápido. */
type Aeq = {
  __aequitas: {
    game: { scene: { getScene: (k: string) => { marker?: { visible: boolean } } } };
    session: { runActions: (a: unknown[]) => Promise<void>; state: { map: string } };
  };
};

test('el objetivo guía al jugador y el mapa permite viajar', async ({ page }) => {
  await startNewGame(page, 'ep01');
  for (let i = 0; i < 14 && (await page.locator('.cut, .dlg').count()) > 0; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await expect(page.locator('.hud__objetivo-texto')).toContainText('Habla con Pilar');
  const visible = await page.evaluate(
    () => (window as unknown as Aeq).__aequitas.game.scene.getScene('World').marker?.visible,
  );
  expect(visible).toBe(true);

  await page.evaluate(() => {
    void (window as unknown as Aeq).__aequitas.session.runActions([
      { type: 'dialogue', id: 'ep01-pilar' },
    ]);
  });
  await expect(page.locator('.dlg')).toBeVisible();
  for (let i = 0; i < 20 && (await page.locator('.dlg').count()) > 0; i++) {
    if ((await page.locator('.dlg__opt').count()) > 0)
      await page.locator('.dlg__opt').first().click();
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await expect(page.locator('.hud__objetivo-texto')).toContainText('acta del Año 1');

  await page.keyboard.press('n');
  await expect(page.locator('.objetivos li')).toHaveCount(9);
  await expect(page.locator('.objetivos li.is-hecho')).toHaveCount(1);
  await page.keyboard.press('Escape');

  await page.keyboard.press('m');
  await page.locator('.mapa__ir li', { hasText: 'Torre, pisos' }).locator('button').click();
  await expect
    .poll(
      async () =>
        await page.evaluate(() => (window as unknown as Aeq).__aequitas.session.state.map),
      { timeout: 8000 },
    )
    .toBe('torre');
});
