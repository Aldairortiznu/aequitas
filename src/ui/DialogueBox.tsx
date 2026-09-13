import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Action, Dialogue } from '../core/content/schema';
import { getBus } from '../core/bus';
import type { DialogueEvent } from '../core/dialogue/runtime';
import { advance, availableChoices, currentNode, startDialogue } from '../core/dialogue/runtime';
import type { DialogueState } from '../core/dialogue/runtime';
import { ui } from './store';
import { portraitSrc } from './portraits';
import { hasLamina, url } from '../engine/art/registry';

const CHARS_PER_SECOND = 45;

interface Props {
  session: Session;
  dialogueId: string;
  onDone: (deferred: Action[]) => void;
}

/**
 * Caja de diálogo (E2). Texto por máquina, retrato, opciones, Consultas y testimonios.
 * Teclado: Enter/E/Espacio avanzan o completan el texto; flechas y 1-4 eligen; Esc no cierra
 * (los diálogos no se cancelan, solo se aceleran).
 */
export function DialogueBox({ session, dialogueId, onDone }: Props) {
  const def = session.episode?.dialogues[dialogueId] as Dialogue | undefined;
  const [ds, setDs] = useState<DialogueState | null>(null);
  /** Progreso de la máquina de escribir, atado al texto al que pertenece. */
  const [tw, setTw] = useState<{ text: string; shown: number }>({ text: '', shown: 0 });
  const [cursor, setCursor] = useState(0);
  const deferred = useRef<Action[]>([]);
  const finished = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const finish = (): void => {
    if (finished.current) return;
    finished.current = true;
    onDone(deferred.current);
  };

  const apply = (r: {
    state: DialogueState | null;
    effects: Action[];
    deferred: Action[];
    events?: DialogueEvent[];
  }): void => {
    deferred.current.push(...r.deferred);
    for (const ev of r.events ?? []) {
      if (ev.type === 'consulta' && ev.correcta) session.markConsultaResuelta(ev.id);
    }
    if (r.effects.length) void session.applyNow(r.effects);
    if (!r.state) {
      finish();
      return;
    }
    setDs(r.state);
    setCursor(0);
    // `shown` se reinicia solo cuando cambia el texto (efecto de máquina de escribir).
  };

  // Arranque
  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'dialogo' });
    if (!def) {
      finish();
      return;
    }
    apply(startDialogue(def, session.state));
    return () => getBus().emit('ui:closed', { panel: 'dialogo' });
  }, [dialogueId]);

  const node = def && ds ? currentNode(def, ds) : null;
  const text = useMemo(() => {
    if (!node || !ds) return '';
    if (ds.phase === 'consulta' || ds.phase === 'consulta-respuesta') {
      const c = session.episode?.consultas[node.consulta ?? ''];
      if (ds.phase === 'consulta') return c?.pregunta ?? '';
      const elegida = ds.consultaElegida ?? 0;
      return c?.opciones[elegida]?.respuesta ?? '';
    }
    return node.text;
  }, [node, ds, session.episode]);

  // Máquina de escribir
  const timer = useRef<number | null>(null);
  useEffect(() => {
    setTw({ text, shown: 0 });
    if (!text) return;
    const step = 1000 / CHARS_PER_SECOND;
    timer.current = window.setInterval(() => {
      setTw((prev) => {
        if (prev.text !== text) return { text, shown: 1 };
        const n = Math.min(text.length, prev.shown + 1);
        if (n % 3 === 0) getBus().emit('audio:sfx', { name: 'tecla' });
        if (n >= text.length && timer.current !== null) {
          window.clearInterval(timer.current);
          timer.current = null;
        }
        return { text, shown: n };
      });
    }, step);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [text]);

  const shown = tw.text === text ? tw.shown : 0;
  const typing = tw.text !== text || tw.shown < text.length;

  // Al terminar el texto de un nodo con opciones, consulta o testimonio, pasar solo a esa fase.
  useEffect(() => {
    if (!def || !ds || typing || ds.phase !== 'texto' || !node) return;
    const hasChoices = Boolean(node.choices && availableChoices(def, ds, session.state).length);
    if (hasChoices || node.consulta || node.testimonio) {
      apply(advance(def, ds, session.state, undefined, (id) => session.episode?.consultas[id]));
    }
  }, [typing, ds?.phase, ds?.nodeId]);

  const choices =
    def && ds && ds.phase === 'opciones' ? availableChoices(def, ds, session.state) : [];
  const consulta =
    ds?.phase === 'consulta' && node?.consulta
      ? session.episode?.consultas[node.consulta]
      : undefined;
  const options: string[] = consulta
    ? consulta.opciones.map((o) => o.texto)
    : choices.map((c) => c.text);
  const speaker = node ? session.content?.personajes.find((p) => p.id === node.speaker) : undefined;
  const speakerName = speaker?.nombre ?? node?.speaker ?? '';
  const isNarrator = node?.speaker === 'narrador';
  const portrait =
    node && !isNarrator ? portraitSrc(session.game, node.speaker, node.portrait ?? 'neutra') : null;

  const proceed = (input?: number | 'registrar' | 'omitir'): void => {
    if (!def || !ds) return;
    if (typing && input === undefined) {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
      setTw({ text, shown: text.length });
      return;
    }
    apply(advance(def, ds, session.state, input, (id) => session.episode?.consultas[id]));
  };

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const optionMode = options.length > 0 && !typing;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (ds?.phase === 'testimonio' && !typing) proceed(cursor === 0 ? 'registrar' : 'omitir');
        else if (optionMode) proceed(cursor);
        else proceed();
      } else if (optionMode || ds?.phase === 'testimonio') {
        const n = ds?.phase === 'testimonio' ? 2 : options.length;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setCursor((c) => (c + 1) % n);
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')
          setCursor((c) => (c - 1 + n) % n);
        const digit = Number(e.key);
        if (digit >= 1 && digit <= n) proceed(digit - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!def || !ds || !node) return null;

  // Lámina activa: la del último nodo visitado que la declare (cadena sin repetirla).
  let laminaId: string | undefined;
  for (const visited of ds.visited) {
    const l = def.nodes.find((n) => n.id === visited)?.lamina;
    if (l !== undefined) laminaId = l;
  }
  const laminaSrc = laminaId
    ? hasLamina(laminaId)
      ? url.lamina(laminaId)
      : session.provisionalLamina(laminaId)
    : null;

  return (
    <div
      class={`dlg ${laminaId ? 'dlg--lamina' : ''}`}
      ref={boxRef}
      role="dialog"
      aria-label={`Diálogo con ${speakerName || 'narrador'}`}
    >
      {laminaId && (
        <div class="dlg__lamina" aria-hidden="true">
          {laminaSrc ? (
            <img src={laminaSrc} alt="" />
          ) : (
            <div class="dlg__lamina-placeholder">{laminaId}</div>
          )}
        </div>
      )}
      <div
        class={`dlg__box ${isNarrator ? 'dlg__box--narrador' : ''}`}
        onClick={() => (options.length && !typing ? undefined : proceed())}
      >
        {portrait && (
          <div class="dlg__portrait">
            <img src={portrait} alt="" width={96} height={96} />
          </div>
        )}
        <div class="dlg__body">
          {!isNarrator && <div class="dlg__name">{speakerName}</div>}
          <p class="dlg__text" aria-live="polite">
            {text.slice(0, shown)}
            {typing && <span class="dlg__caret">▌</span>}
          </p>
          {!typing && ds.phase === 'testimonio' && node.testimonio && (
            <div class="dlg__options" role="listbox" aria-label="Testimonio">
              <button
                type="button"
                class={`dlg__opt ${cursor === 0 ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  proceed('registrar');
                }}
              >
                Registrar el testimonio de {node.testimonio.nombre}
              </button>
              <button
                type="button"
                class={`dlg__opt ${cursor === 1 ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  proceed('omitir');
                }}
              >
                Seguir sin registrar
              </button>
            </div>
          )}
          {!typing && options.length > 0 && (
            <div class="dlg__options" role="listbox" aria-label="Opciones">
              {options.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={cursor === i}
                  class={`dlg__opt ${cursor === i ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    proceed(i);
                  }}
                >
                  <span class="dlg__num">{i + 1}</span> {o}
                </button>
              ))}
            </div>
          )}
          {!typing && options.length === 0 && ds.phase !== 'testimonio' && (
            <div class="dlg__more" aria-hidden="true">
              ▼
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Contenedor que conecta la petición modal con la caja. */
export function DialogueHost({ session }: { session: Session }) {
  const req = ui.dialogue.value;
  if (!req) return null;
  return (
    <DialogueBox
      key={req.id + String(ui.tick.value === -1)}
      session={session}
      dialogueId={req.id}
      onDone={(deferred) => {
        ui.dialogue.value = null;
        req.resolve({ deferred });
      }}
    />
  );
}
