import { useEffect, useRef, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Cutscene } from '../core/content/schema';
import { getBus } from '../core/bus';
import { hasLamina, url } from '../engine/art/registry';
import { ui } from './store';

const CHARS_PER_SECOND = 32;

/**
 * Cinemática de láminas (E9): imagen con paneo lento, texto por máquina en el tercio
 * inferior, avance por toque o Enter, saltable. Sin voz.
 */
export function CutsceneView({
  session,
  cutsceneId,
  onDone,
}: {
  session: Session;
  cutsceneId: string;
  onDone: () => void;
}) {
  const def = session.episode?.cutscenes[cutsceneId] as Cutscene | undefined;
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'cinematica' });
    getBus().emit('world:freeze', { frozen: true });
    return () => {
      getBus().emit('ui:closed', { panel: 'cinematica' });
    };
  }, []);

  const lamina = def?.laminas[i];
  const text = session.t(lamina?.texto ?? '');

  useEffect(() => {
    setShown(0);
    if (!text) return;
    timer.current = window.setInterval(() => {
      setShown((s) => {
        const n = Math.min(text.length, s + 1);
        if (n >= text.length && timer.current !== null) {
          window.clearInterval(timer.current);
          timer.current = null;
        }
        return n;
      });
    }, 1000 / CHARS_PER_SECOND);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [text]);

  const finish = (): void => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  const next = (): void => {
    if (!def) return finish();
    if (shown < text.length) {
      if (timer.current !== null) window.clearInterval(timer.current);
      timer.current = null;
      setShown(text.length);
      return;
    }
    if (i + 1 >= def.laminas.length) finish();
    else setI(i + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e') {
        e.preventDefault();
        next();
      }
      if (e.key === 'Escape' && def?.saltable) finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!def || !lamina) {
    finish();
    return null;
  }
  const src = hasLamina(lamina.imagen) ? url.lamina(lamina.imagen) : null;
  const provisional = session.provisionalLamina(lamina.imagen);

  return (
    <div class="cut" role="dialog" aria-label="Cinemática" onClick={next}>
      <div class="cut__img" key={i}>
        {src || provisional ? (
          <img src={src ?? provisional ?? ''} alt="" />
        ) : (
          <div class="cut__placeholder">{lamina.imagen}</div>
        )}
      </div>
      <div class="cut__text">
        <p>
          {text.slice(0, shown)}
          {shown < text.length && <span class="dlg__caret">▌</span>}
        </p>
        <div class="cut__foot">
          <span class="cut__count">
            {i + 1} / {def.laminas.length}
          </span>
          {def.saltable && (
            <button
              type="button"
              class="cut__skip"
              onClick={(e) => {
                e.stopPropagation();
                finish();
              }}
            >
              Saltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CutsceneHost({ session }: { session: Session }) {
  const req = ui.cutscene.value;
  if (!req) return null;
  return (
    <CutsceneView
      key={req.id}
      session={session}
      cutsceneId={req.id}
      onDone={() => {
        ui.cutscene.value = null;
        req.resolve();
      }}
    />
  );
}
