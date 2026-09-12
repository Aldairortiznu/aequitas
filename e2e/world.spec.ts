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

/** Camina hasta un punto del mundo, primero en X y luego en Y, releyendo la posición. */
async function walkTo(page: Page, tx: number, ty: number, tolerance = 4): Promise<void> {
  const axis = async (
    key: (d: number) => string,
    get: (p: { x: number; y: number }) => number,
    target: number,
  ): Promise<void> => {
    let last = Number.NaN;
    let stuck = 0;
    for (let i = 0; i < 80; i++) {
      const p = await playerPos(page);
      const d = target - get(p);
      if (Math.abs(d) <= tolerance) return;
      // Bloqueado por un cuerpo (un NPC) cerca del destino: se acepta.
      if (Math.abs(get(p) - last) < 0.5 && ++stuck > 3) {
        if (Math.abs(d) <= 16) return;
        throw new Error(`atascado en ${get(p)} yendo a ${target}`);
      }
      last = get(p);
      const ms =
        Math.abs(d) < 8 ? 25 : Math.min(300, Math.max(30, (Math.abs(d) / 80) * 1000 * 0.7));
      await hold(page, key(d), ms);
      await page.waitForTimeout(60);
    }
    throw new Error(`no se alcanzó ${target}`);
  };
  await axis(
    (d) => (d > 0 ? 'ArrowRight' : 'ArrowLeft'),
    (p) => p.x,
    tx,
  );
  await axis(
    (d) => (d > 0 ? 'ArrowDown' : 'ArrowUp'),
    (p) => p.y,
    ty,
  );
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

  test('el jugador se mueve con el teclado y choca con los muros', async ({ page }) => {
    const p0 = await playerPos(page);
    await hold(page, 'ArrowRight', 400);
    const p1 = await playerPos(page);
    expect(p1.x).toBeGreaterThan(p0.x + 10);
    await hold(page, 'ArrowUp', 400);
    const p2 = await playerPos(page);
    expect(p2.y).toBeLessThan(p1.y - 10);
  });

  test('habla con Nepomuceno y recoge el acta', async ({ page }) => {
    // Nepomuceno está en (23,10) tiles = centro (376,168); el jugador arranca en (19,14) = (312,240).
    // A la altura y≈178 su cuerpo bloquea el paso: se camina hasta chocar y queda en rango.
    await walkTo(page, 312, 178);
    await hold(page, 'ArrowRight', 800);
    await page.keyboard.press('e');
    await expect(page.locator('.dlg__text')).toContainText('Llegaste', { timeout: 5000 });
    await closeDialogue(page);

    // El acta está en (16,16) = centro (264,264).
    await walkTo(page, 264, 178);
    await walkTo(page, 264, 258);
    await page.keyboard.press('e');
    await waitForToast(page, /Evidencia: Acta/);
    const s = await state(page);
    expect(s.evidence).toContain('gym-acta-sin-firma');
  });

  test('un folio desbloquea el Códice y suma legitimidad', async ({ page }) => {
    // Folio cp-14 en (6,18) = centro (104,296). Jugador en (312,240). Se evita la zona del muelle (y ≥ 304).
    await walkTo(page, 312, 302, 2);
    await walkTo(page, 106, 302, 2);
    await page.keyboard.press('e');
    await waitForToast(page, /Códice: Art\. 14/);
    const s = await state(page);
    expect(s.codice).toContain('cp-14');
    expect(s.legitimidad.gimnasio).toBe(11);
  });

  test('la puerta lleva al sótano y la salida devuelve a la plaza', async ({ page }) => {
    // Puerta en (8,8) = (128..144, 128..144). Jugador en (312,240). Se entra desde abajo por la columna 8.
    await walkTo(page, 312, 162);
    await walkTo(page, 136, 162, 1.5);
    await hold(page, 'ArrowUp', 450);
    await expect.poll(async () => (await state(page)).map, { timeout: 8000 }).toBe('sotano');
    await expect(page.locator('.hud__map')).toHaveText('Sótano del gimnasio');
    await hold(page, 'ArrowDown', 700);
    await expect.poll(async () => (await state(page)).map, { timeout: 8000 }).toBe('plaza');
  });
});
