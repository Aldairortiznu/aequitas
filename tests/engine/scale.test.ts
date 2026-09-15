import { describe, expect, it } from 'vitest';
import { computeZoom } from '../../src/engine/scale';

describe('computeZoom', () => {
  it('usa escala entera cuando la ventana es mayor que la resolución lógica', () => {
    expect(computeZoom(1920, 1080)).toBe(4);
    expect(computeZoom(1366, 768)).toBe(2);
    expect(computeZoom(1440, 900)).toBe(3);
  });

  it('usa escala fraccionaria cuando la ventana es menor (móviles)', () => {
    expect(computeZoom(360, 640)).toBe(0.75);
    expect(computeZoom(740, 360)).toBe(1.33);
    expect(computeZoom(800, 600)).toBe(1.66);
    expect(computeZoom(240, 800)).toBe(0.5);
  });

  it('nunca baja de 0.25 ni devuelve valores no finitos', () => {
    expect(computeZoom(10, 10)).toBe(0.25);
    expect(computeZoom(0, 0)).toBe(1);
    expect(computeZoom(Number.NaN, 100)).toBe(1);
  });
});
