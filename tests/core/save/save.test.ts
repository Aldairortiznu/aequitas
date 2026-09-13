import { describe, expect, it } from 'vitest';
import {
  buildSave,
  exportCode,
  importCode,
  listSaves,
  migrate,
  readSave,
  writeSave,
} from '../../../src/core/save/save';
import type { Storage } from '../../../src/core/save/save';
import { createGameState, addEvidence, setFlag } from '../../../src/core/state/gameState';

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

describe('guardado', () => {
  const st = setFlag(
    addEvidence(createGameState({ episode: 'gym', map: 'plaza', spawn: 'inicio' }), 'ev-1'),
    'x',
    true,
  );

  it('escribe y lee una ranura con resumen', () => {
    const s = memStorage();
    writeSave(
      s,
      buildSave(
        2,
        { ...st, legitimidad: { gimnasio: 42 } },
        { gimnasio: { valor: 42, porFuente: {} } },
        {},
      ),
    );
    const r = readSave(s, 2);
    expect(r?.resumen).toMatchObject({ episodio: 'gym', mapa: 'plaza', legitimidad: 42 });
    expect(r?.state.evidence).toEqual(['ev-1']);
    expect(listSaves(s).map((x) => (x ? x.slot : null))).toEqual([null, 2, null]);
  });

  it('un dato corrupto no rompe la lectura', () => {
    const s = memStorage();
    s.setItem('aequitas.save.1', '{no json');
    expect(readSave(s, 1)).toBeNull();
    expect(() => migrate({ version: 99 })).toThrow();
  });

  it('exporta e importa por código con suma de control', () => {
    const save = buildSave(1, st, {}, {});
    const code = exportCode(save);
    expect(code.startsWith('AEQ1-')).toBe(true);
    const back = importCode(code);
    expect(back.state.flags).toEqual({ x: true });
    expect(back.state.playerName).toBe('Renata');
    expect(() => importCode(code.slice(0, -3) + 'abc')).toThrow(/dañado/);
    expect(() => importCode('hola')).toThrow(/formato/);
  });
});
