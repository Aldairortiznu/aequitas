import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { readContentDir } from '../../../scripts/content-fs';
import { validateContent } from '../../../src/core/content/validate';
import type { RawContent } from '../../../src/core/content/validate';

const root = join(process.cwd(), 'content');

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function gym(raw: RawContent) {
  const ep = raw.episodes.find((e) => e.id === 'gym');
  if (!ep) throw new Error('falta el episodio gym');
  return ep;
}

function errors(raw: RawContent): string[] {
  return validateContent(raw)
    .issues.filter((i) => i.severity === 'error')
    .map((i) => `${i.where} :: ${i.message}`);
}

describe('validateContent', () => {
  const base = readContentDir(root);

  it('acepta el contenido real del repositorio sin errores', () => {
    const r = validateContent(base);
    expect(r.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(r.ok).toBe(true);
    expect(Object.keys(r.episodes)).toContain('gym');
    expect(r.episodes.gym?.manifest.entry.map).toBe('plaza');
  });

  it('rechaza una acción que apunta a un diálogo inexistente', () => {
    const raw = clone(base);
    const m = gym(raw).manifest as { beats: { actions: { type: string; id?: string }[] }[] };
    m.beats[0]!.actions.push({ type: 'dialogue', id: 'no-existe' });
    expect(errors(raw).some((e) => e.includes('diálogo desconocido no-existe'))).toBe(true);
  });

  it('rechaza un flag leído que nunca se escribe', () => {
    const raw = clone(base);
    const m = gym(raw).manifest as {
      beats: { trigger: unknown; id: string; actions: unknown[] }[];
    };
    m.beats.push({
      id: 'gym-fantasma',
      trigger: { type: 'flag', flag: 'gym.nunca', equals: true },
      actions: [{ type: 'toast', text: 'x' }],
    });
    expect(errors(raw).some((e) => e.includes('flag leído pero nunca escrito: gym.nunca'))).toBe(
      true,
    );
  });

  it('rechaza un mapa de entrada o un spawn inexistentes', () => {
    const raw = clone(base);
    const m = gym(raw).manifest as { entry: { map: string; spawn: string } };
    m.entry.spawn = 'no-hay';
    expect(errors(raw).some((e) => e.includes('entry.spawn no-hay no existe'))).toBe(true);

    const raw2 = clone(base);
    (gym(raw2).manifest as { maps: string[] }).maps.push('fantasma');
    expect(errors(raw2).some((e) => e.includes('mapa fantasma no existe'))).toBe(true);
  });

  it('rechaza una audiencia que usa una evidencia o norma desconocida', () => {
    const raw = clone(base);
    const a = gym(raw).audiencias['gym-audiencia.json'] as {
      rondas: {
        afirmaciones: { solucion: { tipo: string; evidencia?: string[]; codice?: string[] } }[];
      }[];
    };
    a.rondas[0]!.afirmaciones[0]!.solucion.evidencia = ['gym-no-existe'];
    a.rondas[0]!.afirmaciones[1]!.solucion.codice = ['cp-999'];
    const errs = errors(raw);
    expect(errs.some((e) => e.includes('evidencia desconocida gym-no-existe'))).toBe(true);
    expect(errs.some((e) => e.includes('entrada del Códice desconocida cp-999'))).toBe(true);
  });

  it('rechaza una cláusula marcada nula sin `nula` y una válida con `nula`', () => {
    const raw = clone(base);
    const p = gym(raw).pactos['gym-pacto.json'] as {
      puntos: { clausulas: { legal: boolean; nula?: unknown }[] }[];
    };
    p.puntos[0]!.clausulas[0]!.legal = false;
    expect(errors(raw).some((e) => e.includes('cláusula nula debe llevar'))).toBe(true);
  });

  it('rechaza un objeto de mapa con tipo desconocido o con referencias rotas', () => {
    const raw = clone(base);
    const map = gym(raw).maps['plaza.json'] as {
      layers: {
        name: string;
        objects?: {
          id: number;
          name: string;
          type: string;
          x: number;
          y: number;
          properties?: { name: string; type: string; value: unknown }[];
        }[];
      }[];
    };
    const objetos = map.layers.find((l) => l.name === 'objetos')!;
    objetos.objects!.push({ id: 999, name: 'raro', type: 'cosa', x: 0, y: 0 });
    objetos.objects!.push({
      id: 1000,
      name: 'npc-roto',
      type: 'npc',
      x: 0,
      y: 0,
      properties: [
        { name: 'personaje', type: 'string', value: 'nadie' },
        { name: 'dialogo', type: 'string', value: 'ninguno' },
      ],
    });
    const errs = errors(raw);
    expect(errs.some((e) => e.includes('tipo de objeto desconocido «cosa»'))).toBe(true);
    expect(errs.some((e) => e.includes('personaje desconocido nadie'))).toBe(true);
    expect(errs.some((e) => e.includes('diálogo desconocido ninguno'))).toBe(true);
  });

  it('rechaza un episodio listado sin carpeta y una carpeta sin listar', () => {
    const raw = clone(base);
    (
      raw.index as { episodes: { id: string; title: string; region: string; released: boolean }[] }
    ).episodes.push({
      id: 'ep99',
      title: 'Fantasma',
      region: 'gimnasio',
      released: false,
    });
    expect(errors(raw).some((e) => e.includes('sin carpeta content/ep99'))).toBe(true);
  });

  it('avisa cuando un texto de diálogo supera el máximo recomendado', () => {
    const raw = clone(base);
    const d = gym(raw).dialogues['cierre.json'] as { nodes: { text: string }[] };
    d.nodes[0]!.text = 'a'.repeat(200);
    const r = validateContent(raw);
    expect(r.ok).toBe(true);
    expect(
      r.issues.some((i) => i.severity === 'warn' && i.message.includes('200 caracteres')),
    ).toBe(true);
  });
});
