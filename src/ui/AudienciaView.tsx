import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Audiencia, CodiceEntry, Evidence } from '../core/content/schema';
import { getBus } from '../core/bus';
import {
  actual,
  createAudiencia,
  pendientes,
  puedeInvocar,
  reduce,
  ronda,
  usosFacultad,
  visibles,
} from '../core/audiencia/engine';
import type {
  AudienciaAction,
  AudienciaContext,
  AudienciaEvent,
  AudienciaState,
} from '../core/audiencia/engine';
import { portraitSrc } from './portraits';
import { ui } from './store';

/**
 * Audiencia Dialéctica (E5.2-E5.5). Todo el estado de juego vive en el reductor puro;
 * esta vista solo traduce clics y teclas en acciones y pinta los eventos.
 */

interface LogEntry {
  kind: 'adversario' | 'renata' | 'sala' | 'nota' | 'pista' | 'companero';
  text: string;
}

type Drawer = null | 'hecho' | 'norma' | 'fundamentar' | 'invocar' | 'maniobra-norma' | 'pilar';

interface Props {
  session: Session;
  audienciaId: string;
  onDone: (r: { ganada: boolean }) => void;
}

export function AudienciaView({ session, audienciaId, onDone }: Props) {
  const def = session.episode?.audiencias[audienciaId] as Audiencia | undefined;
  const modo = session.settings.modo;
  const ctxBase = useMemo<AudienciaContext | null>(() => {
    if (!def || !session.episode) return null;
    return {
      evidence: session.state.evidence,
      codice: session.state.codice,
      party: session.state.party,
      cotejadas: session.state.evidenceCotejada,
      evidenceDefs: session.episode.evidence,
      codiceDefs: session.content?.codice ?? {},
      modo,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienciaId]);

  const [st, setSt] = useState<AudienciaState | null>(() =>
    def && ctxBase ? createAudiencia(def, ctxBase) : null,
  );
  const [log, setLog] = useState<LogEntry[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [selEv, setSelEv] = useState<string | null>(null);
  const [selNorma, setSelNorma] = useState<string | null>(null);
  const [flash, setFlash] = useState<'plena' | 'parcial' | 'fallida' | null>(null);
  const [ending, setEnding] = useState<
    null | 'allanamiento' | 'tumulto' | 'sesionLevantada' | 'finAlternativo'
  >(null);
  const logRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  // Contexto vivo: evidencias del zurrón + ganadas durante la audiencia.
  const ctx = useMemo<AudienciaContext | null>(() => {
    if (!ctxBase || !st) return ctxBase;
    return {
      ...ctxBase,
      evidence: [...new Set([...session.state.evidence, ...st.evidenciasGanadas])],
      cotejadas: session.state.evidenceCotejada,
    };
  }, [ctxBase, st, session.state.evidence, session.state.evidenceCotejada]);

  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'audiencia' });
    getBus().emit('audio:music', { pista: 'audiencia', capas: 2 });
    if (def && st) {
      const first = actual(def, st);
      const items: LogEntry[] = [
        { kind: 'sala', text: `${def.titulo}. ${def.adversario.nombre} toma la palabra.` },
      ];
      if (st.fase === 'maniobra')
        items.push({ kind: 'sala', text: ronda(def, st).maniobra?.texto ?? '' });
      else if (first) items.push({ kind: 'adversario', text: first.texto });
      setLog(items);
    }
    return () => getBus().emit('ui:closed', { panel: 'audiencia' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienciaId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  if (!def || !st || !ctx) return null;

  const cur = actual(def, st);
  const vis = visibles(def, st);
  const maniobra = st.fase === 'maniobra' ? ronda(def, st).maniobra : undefined;

  const push = (entries: LogEntry[]): void => setLog((l) => [...l, ...entries].slice(-60));

  const handleEvents = (events: AudienciaEvent[], next: AudienciaState): void => {
    const entries: LogEntry[] = [];
    for (const e of events) {
      switch (e.type) {
        case 'contradiccion':
          entries.push({ kind: 'adversario', text: e.texto });
          if (e.resultado === 'plena' && e.nota) {
            entries.push({ kind: 'nota', text: e.nota });
            session.addNota(e.nota);
          }
          setFlash(e.resultado);
          getBus().emit('audio:sfx', { name: e.resultado });
          window.setTimeout(() => setFlash(null), 600);
          break;
        case 'presion':
        case 'cierta':
          entries.push({ kind: 'adversario', text: e.texto });
          break;
        case 'afirmacionRevelada': {
          const a = def.rondas.flatMap((r) => r.afirmaciones).find((x) => x.id === e.afirmacion);
          if (a) entries.push({ kind: 'sala', text: `Nueva afirmación: «${a.texto}»` });
          break;
        }
        case 'evidenciaRevelada':
          void session.applyNow([{ type: 'addEvidence', id: e.evidencia }]);
          break;
        case 'maniobra':
          entries.push({ kind: 'sala', text: e.texto });
          break;
        case 'maniobraResuelta':
          entries.push({ kind: e.conObjecion ? 'companero' : 'sala', text: e.texto });
          break;
        case 'facultad':
          entries.push({ kind: 'companero', text: e.texto });
          break;
        case 'invocacion':
          entries.push({ kind: e.correcta ? 'renata' : 'sala', text: e.texto });
          break;
        case 'pista':
          entries.push({ kind: 'pista', text: e.texto });
          break;
        case 'ronda':
          entries.push({
            kind: 'sala',
            text: `Ronda ${e.ronda + 1}${def.rondas[e.ronda]?.titulo ? `: ${def.rondas[e.ronda]?.titulo}` : ''}. ${def.adversario.nombre} retoma.`,
          });
          break;
        case 'fin':
          setEnding(e.fase);
          break;
        default:
          break;
      }
    }
    // Al cambiar de afirmación actual, el adversario la enuncia.
    const before = cur?.id;
    const after = actual(def, next)?.id;
    if (after && after !== before && next.fase === 'afirmacion') {
      const a = actual(def, next);
      if (a) entries.push({ kind: 'adversario', text: a.texto });
    }
    push(entries);
  };

  const dispatch = (action: AudienciaAction): void => {
    const r = reduce(def, st, action, ctx);
    if (r.state === st && r.events.length === 0) return;
    // Marcar normas usadas
    if (action.type === 'presentarNorma' || action.type === 'fundamentar') {
      const plena = r.events.some((e) => e.type === 'contradiccion' && e.resultado !== 'fallida');
      if (plena) session.markCodiceUsed(action.codice, def.id);
    }
    if (action.type === 'invocar' && r.events.some((e) => e.type === 'invocacion' && e.correcta))
      session.markCodiceUsed(action.codice, def.id);
    setSt(r.state);
    handleEvents(r.events, r.state);
    setDrawer(null);
    setSelEv(null);
    setSelNorma(null);
  };

  const finish = async (ganada: boolean, dialogo: string): Promise<void> => {
    if (finished.current) return;
    finished.current = true;
    await session.showDialogue(dialogo);
    onDone({ ganada });
  };

  const retry = async (dialogo: string): Promise<void> => {
    await session.showDialogue(dialogo);
    setEnding(null);
    const r = reduce(def, st, { type: 'reintentarRonda' }, ctx);
    setSt(r.state);
    setLog([
      { kind: 'sala', text: 'Se reanuda la ronda.' },
      ...(actual(def, r.state)
        ? [{ kind: 'adversario' as const, text: actual(def, r.state)!.texto }]
        : []),
    ]);
  };

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (ending) return;
      if (e.key === 'Escape') {
        setDrawer(null);
        return;
      }
      if (drawer) return;
      if (st.fase === 'afirmacion') {
        if (e.key === 'ArrowRight') dispatch({ type: 'siguiente' });
        if (e.key === 'ArrowLeft') dispatch({ type: 'anterior' });
        if (e.key === '1') dispatch({ type: 'presionar' });
        if (e.key === '2') setDrawer('hecho');
        if (e.key === '3') setDrawer('norma');
        if (e.key === '4') setDrawer('fundamentar');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const evidencias: Evidence[] = ctx.evidence
    .map((id) => ctx.evidenceDefs[id])
    .filter((x): x is Evidence => Boolean(x));
  const normas: CodiceEntry[] = ctx.codice
    .map((id) => ctx.codiceDefs[id])
    .filter((x): x is CodiceEntry => Boolean(x));
  const testimoniosDisponibles = session.state.voces.filter((v) => !ctx.evidence.includes(v.id));
  const adversarioPortrait = portraitSrc(
    session.game,
    def.adversario.id,
    flash === 'plena' ? 'tensa' : 'neutra',
  );
  const resueltaActual = cur ? st.resueltas.includes(cur.id) : false;

  return (
    <div class={`aud ${flash ? `aud--${flash}` : ''}`} role="dialog" aria-label={def.titulo}>
      <header class="aud__head">
        <div class="aud__title">
          <span class="aud__eyebrow">
            Audiencia · ronda {st.ronda + 1} de {def.rondas.length}
          </span>
          <h2>{def.titulo}</h2>
        </div>
        <div class="aud__meters">
          <Meter
            label={def.adversario.medidor ?? 'Posición'}
            value={st.posicion}
            max={st.posicionMax}
            kind="posicion"
          />
          <Meter label="Tensión" value={st.tension} max={100} kind="tension" />
          <div class="meter">
            <span class="meter__label">Credibilidad</span>
            <span
              class="meter__marks"
              aria-label={`Credibilidad ${st.credibilidad} de ${st.credibilidadMax}`}
            >
              {Array.from({ length: st.credibilidadMax }).map((_, i) => (
                <span key={i} class={`meter__mark ${i < st.credibilidad ? 'is-on' : ''}`} />
              ))}
            </span>
          </div>
        </div>
      </header>

      <div class="aud__main">
        <aside class="aud__adversario">
          {adversarioPortrait && <img src={adversarioPortrait} alt="" width={96} height={96} />}
          <div class="aud__nombre">{def.adversario.nombre}</div>
        </aside>

        <section class="aud__center">
          {maniobra ? (
            <div class="aud__card aud__card--maniobra">
              <div class="aud__card-eyebrow">Maniobra</div>
              <p>{maniobra.texto}</p>
            </div>
          ) : (
            cur && (
              <div class={`aud__card ${resueltaActual ? 'is-resuelta' : ''}`}>
                <div class="aud__card-eyebrow">
                  Afirmación {st.afirmacion + 1} de {vis.length}
                  {resueltaActual && ' · contradicha'}
                  {!resueltaActual &&
                    (st.parcialHecho.includes(cur.id) || st.parcialNorma.includes(cur.id)) &&
                    ' · parcialmente contradicha'}
                  {cur.derechoFundamental && ' · derecho fundamental en juego'}
                </div>
                <p class="aud__afirmacion">«{cur.texto}»</p>
                <div class="aud__nav">
                  <button
                    type="button"
                    class="btn btn--secundario"
                    onClick={() => dispatch({ type: 'anterior' })}
                    aria-label="Afirmación anterior"
                  >
                    ‹
                  </button>
                  <span class="aud__pendientes">{pendientes(def, st).length} pendiente(s)</span>
                  <button
                    type="button"
                    class="btn btn--secundario"
                    onClick={() => dispatch({ type: 'siguiente' })}
                    aria-label="Siguiente afirmación"
                  >
                    ›
                  </button>
                </div>
              </div>
            )
          )}

          <div class="aud__log" ref={logRef} aria-live="polite">
            {log.map((l, i) => (
              <p key={i} class={`aud__line aud__line--${l.kind}`}>
                {l.kind === 'nota' && <strong>Nota. </strong>}
                {l.kind === 'pista' && <strong>Pista. </strong>}
                {l.text}
              </p>
            ))}
          </div>
        </section>
      </div>

      {!ending && (
        <footer class="aud__actions">
          {maniobra ? (
            <>
              <button
                type="button"
                class="btn"
                disabled={usosFacultad(def, st, 'gerineldo', ctx) <= 0}
                onClick={() => dispatch({ type: 'facultad', quien: 'gerineldo' })}
              >
                Objetar (Gerineldo · {usosFacultad(def, st, 'gerineldo', ctx)})
              </button>
              <button type="button" class="btn" onClick={() => setDrawer('maniobra-norma')}>
                Responder con una norma
              </button>
              <button
                type="button"
                class="btn btn--secundario"
                onClick={() => dispatch({ type: 'responderManiobra', codice: null })}
              >
                Dejar pasar (+{maniobra.costoTension} tensión)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                class="btn"
                onClick={() => dispatch({ type: 'presionar' })}
                disabled={resueltaActual}
              >
                1 Presionar
              </button>
              <button
                type="button"
                class="btn"
                onClick={() => setDrawer('hecho')}
                disabled={resueltaActual}
              >
                2 Presentar hecho
              </button>
              <button
                type="button"
                class="btn"
                onClick={() => setDrawer('norma')}
                disabled={resueltaActual}
              >
                3 Presentar norma
              </button>
              <button
                type="button"
                class="btn"
                onClick={() => setDrawer('fundamentar')}
                disabled={resueltaActual}
              >
                4 Fundamentar
              </button>
              {puedeInvocar(def, st) && (
                <button type="button" class="btn btn--oro" onClick={() => setDrawer('invocar')}>
                  Invocar la Constitución
                </button>
              )}
              <span class="aud__sep" />
              {ctx.party.includes('pilar') && (
                <button
                  type="button"
                  class="btn btn--secundario"
                  disabled={usosFacultad(def, st, 'pilar', ctx) <= 0}
                  onClick={() =>
                    testimoniosDisponibles.length
                      ? setDrawer('pilar')
                      : dispatch({ type: 'facultad', quien: 'pilar' })
                  }
                >
                  Pilar · {usosFacultad(def, st, 'pilar', ctx)}
                </button>
              )}
              {ctx.party.includes('prudencio') && (
                <button
                  type="button"
                  class="btn btn--secundario"
                  disabled={usosFacultad(def, st, 'prudencio', ctx) <= 0 || resueltaActual}
                  onClick={() => dispatch({ type: 'facultad', quien: 'prudencio' })}
                >
                  Prudencio · {usosFacultad(def, st, 'prudencio', ctx)}
                </button>
              )}
              {ctx.party.includes('gerineldo') && (
                <button
                  type="button"
                  class="btn btn--secundario"
                  disabled
                  title="Objeta durante una maniobra"
                >
                  Gerineldo · {usosFacultad(def, st, 'gerineldo', ctx)}
                </button>
              )}
            </>
          )}
        </footer>
      )}

      {ending && (
        <footer class="aud__actions aud__actions--fin">
          {ending === 'allanamiento' && (
            <button
              type="button"
              class="btn btn--oro"
              onClick={() => void finish(true, def.final.allanamiento)}
            >
              {def.adversario.nombre} se allana. Continuar
            </button>
          )}
          {ending === 'tumulto' && (
            <button type="button" class="btn" onClick={() => void retry(def.final.tumulto)}>
              La sala se rompe. Reintentar la ronda
            </button>
          )}
          {ending === 'sesionLevantada' && (
            <button type="button" class="btn" onClick={() => void retry(def.final.sesionLevantada)}>
              Se levanta la sesión. Reintentar la ronda
            </button>
          )}
          {ending === 'finAlternativo' && (
            <button type="button" class="btn" onClick={() => void finish(false, def.final.tumulto)}>
              {def.finAlternativo?.texto ?? 'Fin'}
            </button>
          )}
        </footer>
      )}

      {drawer && (
        <div class="aud__drawer" role="dialog" aria-label="Elegir">
          <div class="aud__drawer-head">
            <strong>
              {drawer === 'hecho' && 'Presentar un hecho del zurrón'}
              {drawer === 'norma' && 'Presentar una norma del Códice'}
              {drawer === 'fundamentar' && 'Fundamentar: elige un hecho y una norma'}
              {drawer === 'invocar' &&
                'Invocar la Constitución: ¿qué artículo responde a esta afirmación?'}
              {drawer === 'maniobra-norma' && 'Responder a la maniobra con una norma'}
              {drawer === 'pilar' && 'Pilar convoca un testimonio del Registro de Voces'}
            </strong>
            <button
              type="button"
              class="panel__close"
              aria-label="Cerrar"
              onClick={() => setDrawer(null)}
            >
              ✕
            </button>
          </div>
          <div class="aud__drawer-body">
            {(drawer === 'hecho' || drawer === 'fundamentar') && (
              <ul class="pick">
                {evidencias.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      class={`pick__item ${selEv === e.id ? 'is-active' : ''}`}
                      onClick={() =>
                        drawer === 'hecho'
                          ? dispatch({ type: 'presentarHecho', evidencia: e.id })
                          : setSelEv(e.id)
                      }
                    >
                      <span class="tag">{e.tipo}</span> {e.nombre}
                      {ctx.cotejadas.includes(e.id) && !e.autentico && (
                        <span class="tag tag--falso">falso</span>
                      )}
                    </button>
                  </li>
                ))}
                {!evidencias.length && <li class="panel__empty">No tienes evidencias.</li>}
              </ul>
            )}
            {(drawer === 'norma' || drawer === 'fundamentar' || drawer === 'maniobra-norma') && (
              <ul class="pick">
                {normas.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      class={`pick__item ${selNorma === n.id ? 'is-active' : ''}`}
                      onClick={() => {
                        if (drawer === 'norma') dispatch({ type: 'presentarNorma', codice: n.id });
                        else if (drawer === 'maniobra-norma')
                          dispatch({ type: 'responderManiobra', codice: n.id });
                        else setSelNorma(n.id);
                      }}
                    >
                      <span class="list__ref">{n.referencia}</span> {n.titulo}
                    </button>
                  </li>
                ))}
                {!normas.length && <li class="panel__empty">El Códice está vacío.</li>}
              </ul>
            )}
            {drawer === 'invocar' && def.invocacion && (
              <ul class="pick">
                {def.invocacion.opciones.map((id) => {
                  const n = ctx.codiceDefs[id];
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        class="pick__item"
                        onClick={() => dispatch({ type: 'invocar', codice: id })}
                      >
                        <span class="list__ref">{n?.referencia ?? id}</span> {n?.titulo ?? ''}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {drawer === 'pilar' && (
              <ul class="pick">
                {testimoniosDisponibles.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      class="pick__item"
                      onClick={() =>
                        dispatch({ type: 'facultad', quien: 'pilar', evidencia: v.id })
                      }
                    >
                      <span class="tag">testimonio</span> {v.nombre}: {v.hecho}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    class="pick__item"
                    onClick={() => dispatch({ type: 'facultad', quien: 'pilar' })}
                  >
                    Solo pedir la palabra (baja la Tensión)
                  </button>
                </li>
              </ul>
            )}
          </div>
          {drawer === 'fundamentar' && (
            <div class="aud__drawer-foot">
              <span>
                {selEv ? ctx.evidenceDefs[selEv]?.nombre : 'Elige un hecho'} +{' '}
                {selNorma ? ctx.codiceDefs[selNorma]?.referencia : 'elige una norma'}
              </span>
              <button
                type="button"
                class="btn"
                disabled={!selEv || !selNorma}
                onClick={() =>
                  selEv &&
                  selNorma &&
                  dispatch({ type: 'fundamentar', evidencia: selEv, codice: selNorma })
                }
              >
                Fundamentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  kind,
}: {
  label: string;
  value: number;
  max: number;
  kind: 'posicion' | 'tension';
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div class={`meter meter--${kind}`}>
      <span class="meter__label">{label}</span>
      <span
        class="meter__bar"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <span class="meter__fill" style={{ width: `${pct}%` }} />
      </span>
      <span class="meter__value">{value}</span>
    </div>
  );
}

export function AudienciaHost({ session }: { session: Session }) {
  const req = ui.audiencia.value;
  if (!req) return null;
  return (
    <AudienciaView
      key={req.id}
      session={session}
      audienciaId={req.id}
      onDone={(r) => {
        ui.audiencia.value = null;
        req.resolve(r);
      }}
    />
  );
}
