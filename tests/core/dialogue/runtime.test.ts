import { describe, expect, it } from 'vitest';
import { advance, availableChoices, startDialogue } from '../../../src/core/dialogue/runtime';
import type { Dialogue } from '../../../src/core/content/schema';
import { createGameState, setFlag } from '../../../src/core/state/gameState';

const dlg: Dialogue = {
  id: 'd',
  nodes: [
    {
      id: 'saludo',
      speaker: 'nepomuceno',
      text: 'Hola',
      requires: [{ flag: 'x.visto', op: 'eq', value: false }],
      effects: [{ type: 'setFlag', flag: 'x.visto', value: true }],
      choices: [
        { text: 'Pregunta', next: 'consulta' },
        { text: 'Audiencia', effects: [{ type: 'startAudiencia', id: 'a1' }] },
        { text: 'Secreta', next: 'fin', requires: [{ hasEvidence: 'ev1' }] },
      ],
    },
    { id: 'consulta', speaker: 'nepomuceno', text: '¿?', consulta: 'c1', next: 'testimonio' },
    {
      id: 'testimonio',
      speaker: 'narrador',
      text: 'Un pescador.',
      testimonio: { id: 'ev-t', nombre: 'Eladio', hecho: 'Nació aquí', fecha: 'Año 9' },
      next: 'fin',
    },
    {
      id: 'vuelve',
      speaker: 'nepomuceno',
      text: 'Otra vez',
      requires: [{ flag: 'x.visto', op: 'eq', value: true }],
    },
    { id: 'fin', speaker: 'nepomuceno', text: 'Adiós' },
  ],
};

const consultas = {
  c1: { opciones: [{ correcta: false }, { correcta: true }, { correcta: false }], codice: 'cp-14' },
};
const lookup = (id: string) => consultas[id as 'c1'];

describe('diálogo', () => {
  const gs = createGameState({
    episode: 'gym',
    map: 'plaza',
    spawn: 'inicio',
    flagsInit: { 'x.visto': false },
  });

  it('entra por el primer nodo cuyas condiciones se cumplen y aplica sus efectos', () => {
    const r = startDialogue(dlg, gs);
    expect(r.state?.nodeId).toBe('saludo');
    expect(r.effects).toEqual([{ type: 'setFlag', flag: 'x.visto', value: true }]);
    const r2 = startDialogue(dlg, setFlag(gs, 'x.visto', true));
    expect(r2.state?.nodeId).toBe('vuelve');
  });

  it('filtra opciones por condiciones y difiere los efectos modales', () => {
    const r = startDialogue(dlg, gs);
    const s1 = advance(dlg, r.state!, gs).state!;
    expect(s1.phase).toBe('opciones');
    expect(availableChoices(dlg, s1, gs).map((c) => c.text)).toEqual(['Pregunta', 'Audiencia']);
    const r2 = advance(dlg, s1, gs, 1);
    expect(r2.state).toBeNull();
    expect(r2.deferred).toEqual([{ type: 'startAudiencia', id: 'a1' }]);
  });

  it('una consulta incorrecta vuelve a preguntar; la correcta desbloquea y suma legitimidad', () => {
    const r = startDialogue(dlg, gs);
    const s1 = advance(dlg, r.state!, gs).state!;
    const s2 = advance(dlg, s1, gs, 0).state!; // -> consulta
    expect(s2.nodeId).toBe('consulta');
    const s3 = advance(dlg, s2, gs).state!; // texto -> consulta
    expect(s3.phase).toBe('consulta');
    const wrong = advance(dlg, s3, gs, 0, lookup);
    expect(wrong.effects).toEqual([]);
    expect(wrong.events).toEqual([{ type: 'consulta', id: 'c1', correcta: false }]);
    const back = advance(dlg, wrong.state!, gs, undefined, lookup);
    expect(back.state?.phase).toBe('consulta');
    const right = advance(dlg, back.state!, gs, 1, lookup);
    expect(right.effects).toEqual([
      { type: 'legitimidad', delta: 3, fuente: 'consulta' },
      { type: 'unlockCodice', id: 'cp-14' },
    ]);
    const next = advance(dlg, right.state!, gs, undefined, lookup);
    expect(next.state?.nodeId).toBe('testimonio');
  });

  it('registrar un testimonio produce registrarVoz y legitimidad; omitir no', () => {
    const ds = {
      dialogueId: 'd',
      nodeId: 'testimonio',
      visited: ['testimonio'],
      phase: 'testimonio' as const,
    };
    const reg = advance(dlg, ds, gs, 'registrar');
    expect(reg.effects[0]).toEqual({ type: 'registrarVoz', id: 'ev-t' });
    expect(reg.state?.nodeId).toBe('fin');
    const om = advance(dlg, ds, gs, 'omitir');
    expect(om.effects).toEqual([]);
    expect(om.state?.nodeId).toBe('fin');
  });

  it('termina cuando no hay next', () => {
    const ds = { dialogueId: 'd', nodeId: 'fin', visited: ['fin'], phase: 'texto' as const };
    const r = advance(dlg, ds, gs);
    expect(r.state).toBeNull();
    expect(r.events).toEqual([{ type: 'fin' }]);
  });
});
