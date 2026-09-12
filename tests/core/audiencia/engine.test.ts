import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { readContentDir } from '../../../scripts/content-fs';
import { validateContent } from '../../../src/core/content/validate';
import type { Audiencia } from '../../../src/core/content/schema';
import {
  actual,
  createAudiencia,
  pendientes,
  puedeInvocar,
  reduce,
  usosFacultad,
} from '../../../src/core/audiencia/engine';
import type {
  AudienciaContext,
  AudienciaEvent,
  AudienciaState,
} from '../../../src/core/audiencia/engine';
import { BALANCE } from '../../../src/core/balance';

const content = validateContent(readContentDir(join(process.cwd(), 'content')));
const gym = content.episodes.gym!;
const def = gym.audiencias['gym-audiencia'] as Audiencia;
const B = BALANCE.audiencia;

function ctx(over: Partial<AudienciaContext> = {}): AudienciaContext {
  return {
    evidence: ['gym-acta-sin-firma', 'gym-testimonio-eladio', 'gym-certificado-falso'],
    codice: ['cp-1', 'cp-4', 'cp-14', 'cp-28', 'cp-29', 'cp-34'],
    party: ['pilar', 'prudencio', 'gerineldo'],
    cotejadas: [],
    evidenceDefs: gym.evidence,
    codiceDefs: content.codice!,
    modo: 'normal',
    ...over,
  };
}

const kinds = (ev: AudienciaEvent[]): string[] =>
  ev.map((e) => (e.type === 'contradiccion' ? `${e.type}:${e.resultado}` : e.type));

describe('audiencia · creación y navegación', () => {
  it('arranca con los medidores del contenido y la primera afirmación', () => {
    const s = createAudiencia(def, ctx());
    expect(s.posicion).toBe(80);
    expect(s.tension).toBe(20);
    expect(s.credibilidad).toBe(3);
    expect(actual(def, s)?.id).toBe('af-acta');
    expect(pendientes(def, s)).toHaveLength(4);
  });

  it('modo jurista: menos credibilidad y más tensión inicial', () => {
    const s = createAudiencia(def, ctx({ modo: 'jurista' }));
    expect(s.credibilidad).toBe(B.credibilidadJurista);
    expect(s.tension).toBe(20 + B.tensionInicialJurista);
  });

  it('siguiente y anterior recorren las afirmaciones visibles en círculo', () => {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    expect(actual(def, s)?.id).toBe('af-certificado');
    s = reduce(def, s, { type: 'anterior' }, ctx()).state;
    s = reduce(def, s, { type: 'anterior' }, ctx()).state;
    expect(actual(def, s)?.id).toBe('af-cierta');
  });
});

describe('audiencia · contradicciones', () => {
  it('un hecho correcto produce contradicción plena, baja Posición y Tensión y deja nota', () => {
    const s0 = createAudiencia(def, ctx());
    const { state, events } = reduce(
      def,
      s0,
      { type: 'presentarHecho', evidencia: 'gym-acta-sin-firma' },
      ctx(),
    );
    expect(state.posicion).toBe(80 - B.danoPlena);
    expect(state.tension).toBe(20 + B.tensionPlena);
    expect(state.resueltas).toContain('af-acta');
    const c = events.find((e) => e.type === 'contradiccion');
    expect(c && c.type === 'contradiccion' && c.resultado).toBe('plena');
    expect(c && c.type === 'contradiccion' && c.nota).toContain('acta');
    expect(actual(def, state)?.id).toBe('af-certificado');
  });

  it('una evidencia incorrecta es fallida: sube Tensión y resta Credibilidad', () => {
    const s0 = createAudiencia(def, ctx());
    const { state, events } = reduce(
      def,
      s0,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx(),
    );
    expect(state.posicion).toBe(80);
    expect(state.tension).toBe(20 + B.tensionFallida);
    expect(state.credibilidad).toBe(2);
    expect(kinds(events)).toContain('contradiccion:fallida');
  });

  it('una norma sola sobre una afirmación de hecho es fallida; la norma correcta sobre la de norma es plena', () => {
    const s0 = createAudiencia(def, ctx());
    const r1 = reduce(def, s0, { type: 'presentarNorma', codice: 'cp-4' }, ctx());
    expect(kinds(r1.events)).toContain('contradiccion:fallida');
    const s1 = reduce(def, r1.state, { type: 'siguiente' }, ctx()).state;
    const r2 = reduce(def, s1, { type: 'presentarNorma', codice: 'cp-4' }, ctx());
    expect(kinds(r2.events)).toContain('contradiccion:plena');
    // Tras af-certificado se activa la maniobra «tras»
    expect(r2.state.fase).toBe('maniobra');
    expect(r2.state.maniobraActiva).toBe('man-certificado');
  });

  it('combinación: presentar solo el hecho es parcial; fundamentar con ambos es plena', () => {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    expect(actual(def, s)?.id).toBe('af-eladio');
    const p = reduce(def, s, { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' }, ctx());
    expect(kinds(p.events)).toContain('contradiccion:parcial');
    expect(p.state.posicion).toBe(80 - B.danoParcial);
    const f = reduce(
      def,
      p.state,
      { type: 'fundamentar', evidencia: 'gym-testimonio-eladio', codice: 'cp-14' },
      ctx(),
    );
    expect(kinds(f.events)).toContain('contradiccion:plena');
    expect(f.state.resueltas).toContain('af-eladio');
  });

  it('completar la combinación en dos pasos vale lo mismo que fundamentar', () => {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    const a = reduce(
      def,
      s,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx(),
    ).state;
    const b = reduce(def, a, { type: 'presentarNorma', codice: 'cp-14' }, ctx());
    expect(b.state.resueltas).toContain('af-eladio');
    expect(b.state.posicion).toBe(80 - B.danoPlena);
  });

  it('una afirmación cierta no se contradice: presionar dos veces la resuelve; presentar algo es fallida', () => {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'anterior' }, ctx()).state; // af-cierta
    expect(actual(def, s)?.id).toBe('af-cierta');
    const bad = reduce(def, s, { type: 'presentarNorma', codice: 'cp-4' }, ctx());
    expect(kinds(bad.events)).toContain('contradiccion:fallida');
    const p1 = reduce(def, s, { type: 'presionar' }, ctx());
    expect(p1.state.resueltas).not.toContain('af-cierta');
    const p2 = reduce(def, p1.state, { type: 'presionar' }, ctx());
    expect(p2.state.resueltas).toContain('af-cierta');
    expect(p2.state.posicion).toBe(80 - 15);
  });

  it('presionar de más sube la Tensión', () => {
    let s = createAudiencia(def, ctx());
    for (let i = 0; i < 3; i++) s = reduce(def, s, { type: 'presionar' }, ctx()).state;
    expect(s.tension).toBe(20 + B.tensionPresionExcesiva);
  });

  it('presentar un documento falso sin cotejar cuesta Tensión extra', () => {
    const s0 = createAudiencia(def, ctx());
    const r = reduce(
      def,
      s0,
      { type: 'presentarHecho', evidencia: 'gym-certificado-falso' },
      ctx(),
    );
    expect(r.state.tension).toBe(20 + B.tensionEvidenciaFalsa);
    const c = r.events.find((e) => e.type === 'contradiccion');
    expect(c && c.type === 'contradiccion' && c.texto).toContain('Verifica');
  });

  it('tras dos fallos aparece una pista de nivel 1 y luego de nivel 2; en Estudio siempre nivel 3', () => {
    let s = createAudiencia(def, ctx());
    let r = reduce(def, s, { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' }, ctx());
    expect(r.events.some((e) => e.type === 'pista')).toBe(false);
    r = reduce(def, r.state, { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' }, ctx());
    const p1 = r.events.find((e) => e.type === 'pista');
    expect(p1 && p1.type === 'pista' && p1.nivel).toBe(1);
    s = createAudiencia(def, ctx({ modo: 'estudio' }));
    r = reduce(
      def,
      s,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx({ modo: 'estudio' }),
    );
    const p3 = r.events.find((e) => e.type === 'pista');
    expect(p3 && p3.type === 'pista' && p3.nivel).toBe(3);
    expect(p3 && p3.type === 'pista' && p3.texto).toContain('Acta');
  });
});

describe('audiencia · maniobra, facultades e invocación', () => {
  function hastaManiobra(): AudienciaState {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    return reduce(def, s, { type: 'presentarNorma', codice: 'cp-4' }, ctx()).state;
  }

  it('la Objeción de Gerineldo anula la maniobra y baja Posición; sin norma correcta cuesta Tensión', () => {
    const s = hastaManiobra();
    const obj = reduce(def, s, { type: 'facultad', quien: 'gerineldo' }, ctx());
    expect(obj.state.fase).toBe('afirmacion');
    expect(obj.state.posicion).toBe(s.posicion - B.danoObjecion);
    expect(usosFacultad(def, obj.state, 'gerineldo', ctx())).toBe(0);
    const mal = reduce(def, s, { type: 'responderManiobra', codice: 'cp-29' }, ctx());
    expect(mal.state.tension).toBe(s.tension + 25);
    const bien = reduce(def, s, { type: 'responderManiobra', codice: 'cp-4' }, ctx());
    expect(bien.state.tension).toBe(s.tension);
  });

  it('durante una maniobra no se pueden presentar hechos', () => {
    const s = hastaManiobra();
    const r = reduce(def, s, { type: 'presentarHecho', evidencia: 'gym-acta-sin-firma' }, ctx());
    expect(r.state).toBe(s);
  });

  it('Pilar baja la Tensión y puede aportar un testimonio que no estaba en el zurrón', () => {
    const s = createAudiencia(def, ctx({ evidence: ['gym-acta-sin-firma'] }));
    const r = reduce(
      def,
      s,
      { type: 'facultad', quien: 'pilar', evidencia: 'gym-testimonio-eladio' },
      ctx({ evidence: ['gym-acta-sin-firma'] }),
    );
    expect(r.state.tension).toBe(20 + B.tensionConvocarTestigo);
    expect(r.state.evidenciasGanadas).toContain('gym-testimonio-eladio');
    expect(reduce(def, r.state, { type: 'facultad', quien: 'pilar' }, ctx()).state).toBe(r.state);
  });

  it('un compañero ausente no tiene usos', () => {
    const s = createAudiencia(def, ctx({ party: [] }));
    expect(usosFacultad(def, s, 'pilar', ctx({ party: [] }))).toBe(0);
  });

  it('la Invocación solo está disponible en la afirmación marcada; correcta −30 Posición, incorrecta +20 Tensión', () => {
    let s = createAudiencia(def, ctx());
    expect(puedeInvocar(def, s)).toBe(false);
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    s = reduce(def, s, { type: 'siguiente' }, ctx()).state;
    expect(puedeInvocar(def, s)).toBe(true);
    const mal = reduce(def, s, { type: 'invocar', codice: 'cp-29' }, ctx());
    expect(mal.state.tension).toBe(20 + B.tensionInvocacionFallida);
    expect(mal.state.invocacionUsada).toBe(true);
    const bien = reduce(def, s, { type: 'invocar', codice: 'cp-14' }, ctx());
    expect(bien.state.posicion).toBe(80 - B.danoInvocacion);
    expect(bien.state.resueltas).toContain('af-eladio');
  });
});

describe('audiencia · finales y reintento', () => {
  it('se allana cuando la Posición llega a cero o cuando se resuelven todas las afirmaciones', () => {
    let s = createAudiencia(def, ctx());
    s = reduce(def, s, { type: 'presentarHecho', evidencia: 'gym-acta-sin-firma' }, ctx()).state; // -25
    s = reduce(def, s, { type: 'presentarNorma', codice: 'cp-4' }, ctx()).state; // -25 → maniobra
    s = reduce(def, s, { type: 'facultad', quien: 'gerineldo' }, ctx()).state; // -10 = 20
    s = reduce(
      def,
      s,
      { type: 'fundamentar', evidencia: 'gym-testimonio-eladio', codice: 'cp-14' },
      ctx(),
    ).state; // -25 → 0
    expect(s.fase).toBe('allanamiento');
    expect(s.posicion).toBe(0);
  });

  it('el tumulto llega con Tensión 100 y se puede reintentar la ronda; en Estudio no hay tumulto', () => {
    let s = createAudiencia(def, ctx({ modo: 'normal' }));
    // 3 fallos (+45) + 3 más… la credibilidad se agota antes: forzamos tensión alta con presiones.
    let state = { ...s, tension: 90 };
    const r = reduce(
      def,
      state,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx(),
    );
    expect(r.state.fase).toBe('tumulto');
    expect(r.events.some((e) => e.type === 'fin' && e.fase === 'tumulto')).toBe(true);
    const again = reduce(def, r.state, { type: 'reintentarRonda' }, ctx());
    expect(again.state.fase).toBe('afirmacion');
    expect(again.state.tension).toBe(20);
    s = createAudiencia(def, ctx({ modo: 'estudio' }));
    state = { ...s, tension: 95 };
    const e = reduce(
      def,
      state,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx({ modo: 'estudio' }),
    );
    expect(e.state.fase).toBe('afirmacion');
  });

  it('tres fallos levantan la sesión', () => {
    let s = createAudiencia(def, ctx());
    for (let i = 0; i < 3; i++)
      s = reduce(
        def,
        s,
        { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
        ctx(),
      ).state;
    expect(s.credibilidad).toBe(0);
    expect(s.fase).toBe('sesionLevantada');
  });

  it('un fin alternativo reemplaza al tumulto cuando el contenido lo define', () => {
    const def2: Audiencia = {
      ...def,
      finAlternativo: { tipo: 'irreversible', texto: 'Se acabó.' },
    };
    const s = { ...createAudiencia(def2, ctx()), tension: 95 };
    const r = reduce(
      def2,
      s,
      { type: 'presentarHecho', evidencia: 'gym-testimonio-eladio' },
      ctx(),
    );
    expect(r.state.fase).toBe('finAlternativo');
  });
});
