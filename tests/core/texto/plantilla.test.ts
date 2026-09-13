import { describe, expect, it } from 'vitest';
import { expandir, expandirObjeto, problemasDePlantilla } from '../../../src/core/texto/plantilla';
import { contextoDe, jugadorDesdePreset } from '../../../src/core/jugador';
import { migrate } from '../../../src/core/save/save';
import { createGameState } from '../../../src/core/state/gameState';

const f = contextoDe(jugadorDesdePreset('renata'));
const m = contextoDe(jugadorDesdePreset('ramiro'));
const n = contextoDe(jugadorDesdePreset('ariel'));

describe('plantillas de texto (D10)', () => {
  it('resuelve nombre y apellido', () => {
    expect(expandir('Soy {nombre} {apellido}.', f)).toBe('Soy Renata Iriarte.');
    expect(expandir('{nombreCompleto}', m)).toBe('Ramiro Iriarte');
  });
  it('elige la forma según el tratamiento', () => {
    const t = 'Mire, {señorita|señor|joven}: {la|el|quien viene} de la Biblioteca.';
    expect(expandir(t, f)).toBe('Mire, señorita: la de la Biblioteca.');
    expect(expandir(t, m)).toBe('Mire, señor: el de la Biblioteca.');
    expect(expandir(t, n)).toBe('Mire, joven: quien viene de la Biblioteca.');
  });
  it('deja intactas las marcas desconocidas y los textos sin llaves', () => {
    expect(expandir('sin marcas', f)).toBe('sin marcas');
    expect(expandir('{otra}', f)).toBe('{otra}');
    expect(expandir('{a|b}', f)).toBe('{a|b}');
  });
  it('expande objetos completos sin mutar el original', () => {
    const def = {
      titulo: 'Acta de {nombre}',
      partes: [{ nombre: '{la jurista|el jurista|jurista}' }],
    };
    const out = expandirObjeto(def, m);
    expect(out.titulo).toBe('Acta de Ramiro');
    expect(out.partes[0]?.nombre).toBe('el jurista');
    expect(def.titulo).toBe('Acta de {nombre}');
  });
  it('detecta errores de sintaxis para el validador', () => {
    expect(problemasDePlantilla('bien {nombre} {a|b|c}')).toEqual([]);
    expect(problemasDePlantilla('{a|b}')).toHaveLength(1);
    expect(problemasDePlantilla('{desconocida}')).toHaveLength(1);
    expect(problemasDePlantilla('llave {abierta')).toHaveLength(1);
  });
});

describe('jugador en el estado y el guardado', () => {
  it('createGameState deriva playerName del jugador y conserva el nombre libre', () => {
    const s = createGameState({
      episode: 'gym',
      map: 'plaza',
      spawn: 'inicio',
      playerName: 'Lucía',
    });
    expect(s.jugador.preset).toBe('renata');
    expect(s.playerName).toBe('Lucía');
    expect(s.jugador.nombre).toBe('Lucía');
  });
  it('migra guardados anteriores sin jugador', () => {
    const s = createGameState({ episode: 'gym', map: 'plaza', spawn: 'inicio', playerName: 'Ana' });
    const viejo = { ...s } as Partial<typeof s>;
    delete viejo.jugador;
    const save = migrate({
      version: 1,
      slot: 1,
      savedAt: '',
      resumen: {},
      state: viejo,
      legitimidad: {},
      actas: {},
    });
    expect(save.state.jugador).toEqual({ preset: 'renata', nombre: 'Ana', tratamiento: 'f' });
  });
});
