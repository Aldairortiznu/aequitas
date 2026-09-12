import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Interpelacion } from '../core/content/schema';
import { getBus } from '../core/bus';
import { BALANCE } from '../core/balance';
import { portraitSrc } from './portraits';
import { ui } from './store';

/**
 * Interpelación (E4): un alguacil detiene a Renata con una afirmación; el jugador elige
 * entre cuatro artículos de la Constitución. Rango: alguacil 1, alguacil mayor 2, capitán 3.
 * Temporizador en modo Normal y Jurista; ninguno en Estudio.
 */
interface Props {
  session: Session;
  name: string;
  rank: string;
  articulo?: string;
  onDone: (r: 'interpelada' | 'detenida') => void;
}

const RONDAS: Record<string, number> = { alguacil: 1, 'alguacil-mayor': 2, capitan: 3 };

export function InterpelacionView({ session, name, rank, articulo, onDone }: Props) {
  const banco = session.content?.interpelaciones ?? [];
  const total = RONDAS[rank] ?? 1;
  const secuencia = useMemo<Interpelacion[]>(() => {
    const preferidas = banco.filter((b) => !articulo || b.articulo === articulo);
    const resto = banco.filter((b) => !preferidas.includes(b));
    const pool = [...preferidas, ...resto];
    const out: Interpelacion[] = [];
    for (let i = 0; i < total && pool.length; i++) out.push(pool[i % pool.length]!);
    return out;
  }, [name]);
  const [paso, setPaso] = useState(0);
  const [resultado, setResultado] = useState<null | { ok: boolean; texto: string }>(null);
  const [restante, setRestante] = useState<number>(BALANCE.interpelacion.segundosNormal);
  const conTiempo = session.settings.modo !== 'estudio';
  const finished = useRef(false);
  const actual = secuencia[paso];

  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'interpelacion' });
    return () => getBus().emit('ui:closed', { panel: 'interpelacion' });
  }, []);

  // Temporizador
  useEffect(() => {
    if (!conTiempo || resultado || !actual) return;
    setRestante(BALANCE.interpelacion.segundosNormal);
    const t = window.setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          window.clearInterval(t);
          responder(null);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [paso, resultado]);

  const terminar = (r: 'interpelada' | 'detenida'): void => {
    if (finished.current) return;
    finished.current = true;
    onDone(r);
  };

  const responder = (codice: string | null): void => {
    if (!actual || resultado) return;
    const ok = codice === actual.articulo;
    setResultado({ ok, texto: ok ? actual.acierto : actual.fallo });
    if (ok) session.markCodiceUsed(actual.articulo, `interpelacion:${name}`);
  };

  const continuar = (): void => {
    if (!resultado) return;
    if (!resultado.ok) {
      terminar('detenida');
      return;
    }
    if (paso + 1 >= secuencia.length) {
      terminar('interpelada');
      return;
    }
    setResultado(null);
    setPaso(paso + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (resultado && (e.key === 'Enter' || e.key === ' ' || e.key === 'e')) {
        e.preventDefault();
        continuar();
        return;
      }
      const n = Number(e.key);
      if (!resultado && n >= 1 && n <= 4) responder(actual?.opciones[n - 1] ?? null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!actual) {
    terminar('interpelada');
    return null;
  }
  const rango =
    rank === 'capitan' ? 'Capitán' : rank === 'alguacil-mayor' ? 'Alguacil mayor' : 'Alguacil';
  const retrato = portraitSrc(session.game, 'alguacil', 'tensa');

  return (
    <div class="intp" role="dialog" aria-label="Interpelación">
      <div class="intp__box">
        <div class="intp__head">
          {retrato && <img src={retrato} alt="" width={64} height={64} />}
          <div>
            <div class="aud__eyebrow">
              {rango} · {paso + 1} de {secuencia.length}
            </div>
            <p class="intp__texto">«{actual.texto}»</p>
          </div>
          {conTiempo && !resultado && (
            <div
              class={`intp__timer ${restante <= 3 ? 'is-urgente' : ''}`}
              aria-label={`${restante} segundos`}
            >
              {restante}
            </div>
          )}
        </div>
        {!resultado ? (
          <div class="intp__opciones">
            {actual.opciones.map((id, i) => {
              const c = session.content?.codice[id];
              return (
                <button key={id} type="button" class="intp__opt" onClick={() => responder(id)}>
                  <span class="dlg__num">{i + 1}</span>
                  <span class="list__ref">{c?.referencia ?? id}</span> {c?.titulo ?? ''}
                </button>
              );
            })}
          </div>
        ) : (
          <div class={`intp__resultado ${resultado.ok ? 'is-ok' : 'is-mal'}`}>
            <p>{resultado.texto}</p>
            <button type="button" class="btn" onClick={continuar}>
              {resultado.ok ? (paso + 1 >= secuencia.length ? 'Seguir' : 'Siguiente') : 'Detención'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InterpelacionHost({ session }: { session: Session }) {
  const req = ui.interpelacion.value;
  if (!req) return null;
  return (
    <InterpelacionView
      key={req.name}
      session={session}
      name={req.name}
      rank={req.rank}
      articulo={req.articulo}
      onDone={(r) => {
        ui.interpelacion.value = null;
        req.resolve(r);
      }}
    />
  );
}
