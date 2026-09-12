import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { readContentDir } from '../../../scripts/content-fs';
import { validateContent } from '../../../src/core/content/validate';
import type { Pacto } from '../../../src/core/content/schema';
import { evaluate, renderActa, resultadoPara } from '../../../src/core/pacto/engine';

const content = validateContent(readContentDir(join(process.cwd(), 'content')));
const def = content.episodes.gym!.pactos['gym-pacto'] as Pacto;

describe('pacto · evaluación', () => {
  it('un pacto incompleto no tiene Equilibrio', () => {
    const e = evaluate(def, { 'p-herbario': 'c-turnos' }, []);
    expect(e.completo).toBe(false);
    expect(e.equilibrio).toBe(0);
    expect(e.resultado).toBe('sin-acuerdo');
  });

  it('las mejores cláusulas dan un pacto ejemplar', () => {
    const e = evaluate(def, { 'p-herbario': 'c-turnos', 'p-audiencias': 'c-rotacion' }, []);
    expect(e.desglose.legalidad).toBe(40);
    expect(e.desglose.justicia).toBe(30);
    expect(e.equilibrio).toBeGreaterThanOrEqual(85);
    expect(e.resultado).toBe('ejemplar');
    expect(e.nulasFirmadas).toEqual([]);
  });

  it('firmar una cláusula nula resta legalidad y la reporta con su norma', () => {
    const e = evaluate(def, { 'p-herbario': 'c-castigo', 'p-audiencias': 'c-rotacion' }, []);
    expect(e.desglose.legalidad).toBe(20);
    expect(e.nulasFirmadas).toHaveLength(1);
    expect(e.nulasFirmadas[0]?.norma).toBe('cp-1');
    expect(e.resultado).not.toBe('ejemplar');
  });

  it('detectar una nula da bono; marcar una válida como nula se registra como error', () => {
    const e = evaluate(def, { 'p-herbario': 'c-turnos', 'p-audiencias': 'c-rotacion' }, [
      'c-castigo',
      'c-turnos',
    ]);
    expect(e.nulasDetectadas).toEqual(['c-castigo']);
    expect(e.falsasNulas).toEqual(['c-turnos']);
    expect(e.desglose.bono).toBe(5);
  });

  it('un pacto legal pero que aplasta a una parte pierde puntos de intereses y justicia', () => {
    const e = evaluate(def, { 'p-herbario': 'c-casimiro-solo', 'p-audiencias': 'c-rotacion' }, []);
    expect(e.desglose.legalidad).toBe(40);
    expect(e.desglose.justicia).toBeLessThan(30);
    expect(e.interesesPorParte.estudiantes).toBe(0);
  });

  it('umbrales', () => {
    expect(resultadoPara(85)).toBe('ejemplar');
    expect(resultadoPara(84)).toBe('solido');
    expect(resultadoPara(60)).toBe('solido');
    expect(resultadoPara(59)).toBe('fragil');
    expect(resultadoPara(39)).toBe('sin-acuerdo');
  });
});

describe('pacto · acta', () => {
  it('redacta el acta con encabezado, puntos numerados y cierre', () => {
    const acta = renderActa(
      def,
      { 'p-herbario': 'c-turnos', 'p-audiencias': 'c-rotacion' },
      'Año 9, día 3',
      'Renata',
    );
    expect(acta).toContain('ACTA DE PRÁCTICA');
    expect(acta).toContain('1. ¿Quién riega el herbario');
    expect(acta).toContain('turnos semanales');
    expect(acta).toContain('Relatora: Renata.');
    expect(acta).toContain(def.acta.cierre);
  });
});
