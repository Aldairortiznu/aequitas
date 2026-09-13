import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Pacto } from '../core/content/schema';
import { getBus } from '../core/bus';
import { evaluate, renderActa } from '../core/pacto/engine';
import { BALANCE } from '../core/balance';
import { ui } from './store';
import { expandirObjeto } from '../core/texto/plantilla';

/**
 * Conciliación (E6): el jugador redacta el acta eligiendo una cláusula por punto,
 * puede marcar cláusulas como nulas (control de legalidad) y firma. El Equilibrio decide
 * cuánto florece la región. Si firma con una cláusula nula, el pacto se impugna.
 */

interface Props {
  session: Session;
  pactoId: string;
  onDone: (r: { firmado: boolean; equilibrio: number }) => void;
  /** Elecciones previas (revisión de un acta impugnada desde el Atril). */
  previas?: Record<string, string>;
}

export function PactoView({ session, pactoId, onDone, previas }: Props) {
  const defRaw = session.episode?.pactos[pactoId] as Pacto | undefined;
  const def = useMemo(
    () => (defRaw ? expandirObjeto(defRaw, session.ctx) : undefined),
    [defRaw, session.jugador],
  );
  const modo = session.settings.modo;
  const [punto, setPunto] = useState(0);
  const [elegidas, setElegidas] = useState<Record<string, string>>(previas ?? {});
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [aviso, setAviso] = useState<{ text: string; kind: 'ok' | 'warn' } | null>(null);
  const [vista, setVista] = useState<'puntos' | 'acta' | 'resultado'>('puntos');

  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'pacto' });
    getBus().emit('audio:music', { pista: 'pacto', capas: 1 });
    return () => getBus().emit('ui:closed', { panel: 'pacto' });
  }, []);

  const ev = useMemo(
    () => (def ? evaluate(def, elegidas, marcadas) : null),
    [def, elegidas, marcadas],
  );
  if (!def || !ev) return null;

  const p = def.puntos[punto]!;
  const fecha = `Año 9 · día ${session.state.diaDeJuego}`;
  const acta = renderActa(def, elegidas, fecha, {
    nombre: `${session.jugador.nombre} Iriarte`,
    tratamiento: session.jugador.tratamiento,
  });

  const marcar = (clausulaId: string): void => {
    const c = p.clausulas.find((x) => x.id === clausulaId);
    if (!c || marcadas.includes(clausulaId)) return;
    setMarcadas([...marcadas, clausulaId]);
    if (!c.legal) {
      setAviso({
        text: `Bien visto. ${c.nula?.explicacion ?? ''} (${session.content?.codice[c.nula?.norma ?? '']?.referencia ?? c.nula?.norma})`,
        kind: 'ok',
      });
      if (elegidas[p.id] === clausulaId) {
        const rest = { ...elegidas };
        delete rest[p.id];
        setElegidas(rest);
      }
    } else {
      const parte = def.partes[1]?.nombre ?? 'La contraparte';
      setAviso({
        text: `${parte} se ofende: esa cláusula es válida. La mesa se tensa.`,
        kind: 'warn',
      });
    }
  };

  const firmar = (): void => {
    getBus().emit('audio:sfx', { name: 'firma' });
    setVista('resultado');
  };

  const cerrar = async (): Promise<void> => {
    const r = evaluate(def, elegidas, marcadas);
    if (r.resultado === 'sin-acuerdo') {
      setVista('puntos');
      setAviso({ text: 'La contraparte se levanta de la mesa. Vuelve a negociar.', kind: 'warn' });
      return;
    }
    await session.registrarPacto(def, elegidas, r, acta);
    onDone({ firmado: true, equilibrio: r.equilibrio });
  };

  const nulaVisible = (id: string): boolean => modo === 'estudio' || marcadas.includes(id);

  return (
    <div class="pac" role="dialog" aria-label={def.titulo}>
      <header class="pac__head">
        <div>
          <span class="aud__eyebrow">Conciliación</span>
          <h2>{def.titulo}</h2>
        </div>
        <div class="pac__partes">
          {def.partes.map((pt) => (
            <div key={pt.id} class="pac__parte">
              <div class="pac__parte-nombre">{pt.nombre}</div>
              <div class="pac__parte-fila">
                <span class="pac__k">Pide</span> {pt.pide}
              </div>
              <div class="pac__parte-fila">
                <span class="pac__k">Necesita</span> {pt.necesita}
              </div>
            </div>
          ))}
        </div>
      </header>

      {vista === 'puntos' && (
        <div class="pac__main">
          <ol class="pac__puntos">
            {def.puntos.map((pt, i) => (
              <li key={pt.id}>
                <button
                  type="button"
                  class={`pac__punto ${i === punto ? 'is-active' : ''} ${elegidas[pt.id] ? 'is-done' : ''}`}
                  onClick={() => setPunto(i)}
                >
                  <span class="pac__num">{i + 1}</span> {pt.pregunta}
                  {pt.bloque && <span class="pac__bloque">{pt.bloque}</span>}
                </button>
              </li>
            ))}
          </ol>
          <section class="pac__clausulas">
            <h3>{p.pregunta}</h3>
            <div class="pac__lista" role="radiogroup" aria-label="Cláusulas">
              {p.clausulas.map((c) => {
                const marcadaNula = marcadas.includes(c.id) && !c.legal;
                return (
                  <div
                    key={c.id}
                    class={`pac__clausula ${elegidas[p.id] === c.id ? 'is-active' : ''} ${marcadaNula ? 'is-nula' : ''}`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={elegidas[p.id] === c.id}
                      class="pac__elegir"
                      disabled={marcadaNula}
                      onClick={() => setElegidas({ ...elegidas, [p.id]: c.id })}
                    >
                      {c.texto}
                      {nulaVisible(c.id) && !c.legal && (
                        <span class="pac__asterisco" title="Cláusula nula">
                          *
                        </span>
                      )}
                    </button>
                    {!marcadas.includes(c.id) && (
                      <button
                        type="button"
                        class="pac__nula"
                        onClick={() => marcar(c.id)}
                        title="Control de legalidad"
                      >
                        ¿Nula?
                      </button>
                    )}
                    {marcadas.includes(c.id) && c.legal && <span class="pac__valida">válida</span>}
                    {modo === 'estudio' && !c.legal && !marcadas.includes(c.id) && (
                      <span class="pac__pistanula">{c.nula?.explicacion}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {aviso && <p class={`pac__aviso pac__aviso--${aviso.kind}`}>{aviso.text}</p>}
          </section>
        </div>
      )}

      {vista === 'acta' && (
        <div class="pac__main pac__main--acta">
          <pre class="acta">{acta}</pre>
        </div>
      )}

      {vista === 'resultado' && (
        <div class="pac__main pac__main--acta">
          <Resultado ev={ev} session={session} />
          <pre class="acta">{acta}</pre>
        </div>
      )}

      <footer class="pac__foot">
        {vista === 'puntos' && (
          <>
            <span class="aud__pendientes">
              {Object.keys(elegidas).length} de {def.puntos.length} puntos
            </span>
            <span class="aud__sep" />
            <button type="button" class="btn btn--secundario" onClick={() => setVista('acta')}>
              Leer el acta
            </button>
            <button type="button" class="btn btn--oro" disabled={!ev.completo} onClick={firmar}>
              Firmar
            </button>
          </>
        )}
        {vista === 'acta' && (
          <>
            <span class="aud__sep" />
            <button type="button" class="btn btn--secundario" onClick={() => setVista('puntos')}>
              Volver a los puntos
            </button>
            <button type="button" class="btn btn--oro" disabled={!ev.completo} onClick={firmar}>
              Firmar
            </button>
          </>
        )}
        {vista === 'resultado' && (
          <>
            <span class="aud__sep" />
            {ev.resultado === 'sin-acuerdo' ? (
              <button type="button" class="btn" onClick={() => void cerrar()}>
                Volver a negociar
              </button>
            ) : (
              <button type="button" class="btn btn--oro" onClick={() => void cerrar()}>
                Cerrar el acta
              </button>
            )}
          </>
        )}
      </footer>
    </div>
  );
}

function Resultado({ ev, session }: { ev: ReturnType<typeof evaluate>; session: Session }) {
  const label: Record<string, string> = {
    ejemplar: 'Pacto ejemplar',
    solido: 'Pacto sólido',
    fragil: 'Pacto frágil',
    'sin-acuerdo': 'Sin acuerdo',
  };
  const B = BALANCE.pacto;
  const impugnador = session.state.party.includes('gerineldo')
    ? 'Gerineldo'
    : 'La rectora Clemencia';
  return (
    <section class="pac__resultado">
      <div class="pac__equilibrio">
        <span class="pac__eq-num">{ev.equilibrio}</span>
        <span class="pac__eq-label">{label[ev.resultado]}</span>
      </div>
      <dl class="pac__desglose">
        <dt>Legalidad</dt>
        <dd>
          {ev.desglose.legalidad} / {B.pesoLegalidad}
        </dd>
        <dt>Intereses</dt>
        <dd>
          {ev.desglose.intereses} / {B.pesoIntereses}
        </dd>
        <dt>Justicia</dt>
        <dd>
          {ev.desglose.justicia} / {B.pesoJusticia}
        </dd>
        {ev.desglose.bono > 0 && (
          <>
            <dt>Control de legalidad</dt>
            <dd>+{ev.desglose.bono}</dd>
          </>
        )}
      </dl>
      {ev.nulasFirmadas.length > 0 && (
        <div class="pac__impugnacion">
          <strong>{impugnador} impugna el acta.</strong>
          {ev.nulasFirmadas.map((n) => (
            <p key={n.clausula}>
              «{session.episode?.pactos && n.explicacion}» (
              {session.content?.codice[n.norma]?.referencia ?? n.norma}). La región pierde
              legitimidad; puedes revisar el acta desde un Atril.
            </p>
          ))}
        </div>
      )}
      {ev.resultado === 'sin-acuerdo' && (
        <p class="pac__aviso pac__aviso--warn">
          La contraparte no firma: el acta no equilibra a nadie.
        </p>
      )}
    </section>
  );
}

export function PactoHost({ session }: { session: Session }) {
  const req = ui.pacto.value;
  if (!req) return null;
  const previas = session.state.pactos[req.id]?.clausulas;
  const prevMap = previas
    ? Object.fromEntries(previas.map((c) => c.split(':') as [string, string]))
    : undefined;
  return (
    <PactoView
      key={req.id}
      session={session}
      pactoId={req.id}
      previas={prevMap}
      onDone={(r) => {
        ui.pacto.value = null;
        req.resolve(r);
      }}
    />
  );
}
