import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Arranca una partida nueva desde el menú de título. */
export async function startNewGame(page: Page, ep = 'gym'): Promise<void> {
  await page.goto(`/?ep=${ep}`);
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.hud')).toBeVisible({ timeout: 15000 });
}
