import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { startNewGame } from './helpers';

/**
 * Humo del mundo (E1): arranque del episodio de prueba, movimiento, interacción,
 * recogida de evidencia, puerta y patrulla. Usa el acceso de depuración `window.__aequitas`
 * solo para leer estado; las acciones se hacen con teclado como un jugador.
 */

interface DebugState {
  map: string;
  evidence: string[];
  codice: string[];
  flags: Record<string, unknown>;
  legitimidad: Record<string, number>;
}

async function state(page: Page): Promise<DebugState> {
  return page.evaluate(() => {
    const s = (window as unknown as { __aequitas: { session: { state: DebugState } } }).__aequitas
      .session.state;
    return {
      map: s.map,
      evidence: s.evidence,
      codice: s.codice,
      flags: s.flags,
      legitimidad: s.legitimidad,
    };
  });
}

async function playerPos(page: Page): Promise<{ x: number; y: number }> {
  return page.evaluate(() => {
    const g = (window as unknown as { __aequitas: { game: Phaser.Game } }).__aequitas.game;
    const scene = g.scene.getScene('World') as unknown as { player?: { x: number; y: number } };
    const p = scene.player;
    return p ? { x: p.x, y: p.y } : { x: -1, y: -1 };
  });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

/** Camina por el eje X hasta una coordenada del mundo (vista lateral), releyendo la posición. */
async function walkTo(page: Page, tx: number, tolerance = 4): Promise<void> {
  let last = Number.NaN;
  let stuck = 0;
  for (let i = 0; i < 80; i++) {
    const p = await playerPos(page);
    const d = tx - p.x;
    if (Math.abs(d) <= tolerance) return;
    if (Math.abs(p.x - last) < 0.5 && ++stuck > 3) {
      if (Math.abs(d) <= 16) return;
      throw new Error(`atascado en ${p.x} yendo a ${tx}`);
    }
    last = p.x;
    const ms = Math.abs(d) < 8 ? 25 : Math.min(300, Math.max(30, (Math.abs(d) / 80) * 1000 * 0.7));
    await hold(page, d > 0 ? 'ArrowRight' : 'ArrowLeft', ms);
    await page.waitForTimeout(60);
  }
  throw new Error(`no se alcanzó ${tx}`);
}

/** Cierra un diálogo abierto eligiendo siempre la última opción. */
async function closeDialogue(page: Page): Promise<void> {
  for (let i = 0; i < 14 && (await page.locator('.dlg').count()) > 0; i++) {
    const opts = page.locator('.dlg__opt');
    if ((await opts.count()) > 0) await opts.last().click();
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  await expect(page.locator('.dlg')).toHaveCount(0);
}

async function waitForToast(page: Page, text: RegExp): Promise<void> {
  await expect(page.locator('.ui-toast')).toContainText(text, { timeout: 5000 });
}

test.describe('mundo (episodio de prueba)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await startNewGame(page);
    expect(errors).toEqual([]);
  });

  test('arranca en la plaza y muestra el HUD con la región', async ({ page }) => {
    const s = await state(page);
    expect(s.map).toBe('plaza');
    await expect(page.locator('.hud__region')).toHaveText('Gimnasio de pruebas');
    await waitForToast(page, /Gimnasio de pruebas/);
  });

  test('el jugador se mueve con el teclado, no salta y choca con los muros', async ({ page }) => {
    const p0 = await playerPos(page);
    await hold(page, 'ArrowRight', 400);
    const p1 = await playerPos(page);
    expect(p1.x).toBeGreaterThan(p0.x + 10);
    // En vista lateral (D15) arriba no mueve: no hay salto; el suelo sostiene.
    await hold(page, 'ArrowUp', 400);
    const p2 = await playerPos(page);
    expect(Math.abs(p2.y - p1.y)).toBeLessThan(2);
    // La casa del sótano (muro en la columna 16 = 256 px) bloquea el paso hacia la izquierda.
    await walkTo(page, 300, 2);
    await hold(page, 'ArrowLeft', 900);
    const p3 = await playerPos(page);
    expect(p3.x).toBeGreaterThan(262);
  });

  test('habla con Nepomuceno y recoge el acta', async ({ page }) => {
    // Nepomuceno está en la columna 36 (centro 584); el jugador arranca en la 30 (488).
    await walkTo(page, 578);
    await page.keyboard.press('e');
    await expect(page.locator('.dlg__text')).toContainText('Llegaste', { timeout: 5000 });
    await closeDialogue(page);

    // El acta está en la columna 20 (centro 328).
    await walkTo(page, 328);
    await page.keyboard.press('e');
    await waitForToast(page, /Evidencia: Acta/);
    const s = await state(page);
    expect(s.evidence).toContain('gym-acta-sin-firma');
  });

  test('un folio desbloquea el Códice y suma legitimidad', async ({ page }) => {
    // Folio cp-14 en la columna 5 (centro 88).
    await walkTo(page, 90, 2);
    await page.keyboard.press('e');
    await waitForToast(page, /Códice: Art\. 14/);
    const s = await state(page);
    expect(s.codice).toContain('cp-14');
    expect(s.legitimidad.gimnasio).toBe(11);
  });

  test('la puerta lleva al sótano y la salida devuelve a la plaza', async ({ page }) => {
    // Puerta del sótano en la columna 12 (centro 200): en vista lateral se abre con E.
    await walkTo(page, 200, 3);
    await page.keyboard.press('e');
    await expect.poll(async () => (await state(page)).map, { timeout: 8000 }).toBe('sotano');
    await expect(page.locator('.hud__map')).toHaveText('Sótano del gimnasio');
    // El disparador de entrada puede abrir un diálogo al aparecer: se cierra antes de salir.
    for (let i = 0; i < 6 && (await page.locator('.dlg').count()) > 0; i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(250);
    // La puerta de vuelta está en la columna 4 (centro 72); el jugador aparece en la 5.
    await walkTo(page, 72, 3);
    await page.keyboard.press('e');
    await expect.poll(async () => (await state(page)).map, { timeout: 8000 }).toBe('plaza');
  });
});
