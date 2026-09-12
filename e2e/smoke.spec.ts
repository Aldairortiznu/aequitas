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

    // Confirmar en el título emite un evento que la UI convierte en aviso.
    await page.keyboard.press('Enter');
    await expect(page.locator('.ui-toast')).toBeVisible();

    expect(errors, `errores de consola: ${errors.join(' | ')}`).toEqual([]);
  });
});
