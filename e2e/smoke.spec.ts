import { expect, test } from '@playwright/test';

test.describe('arranque', () => {
  test('carga sin errores de consola y muestra el canvas y la versión', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/AEQUITAS/);
    await expect(page.locator('#game canvas')).toBeVisible();
    await expect(page.locator('.ui-version')).toContainText(/v\d+\.\d+\.\d+/);

    // El menú de título aparece sobre la escena; Nueva partida arranca el episodio y muestra el HUD.
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('button', { name: 'Nueva partida' }).click();
    await page.locator('.prota__card', { hasText: 'Renata' }).click();
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.locator('.hud')).toBeVisible({ timeout: 15000 });

    expect(errors, `errores de consola: ${errors.join(' | ')}`).toEqual([]);
  });
});
