import { useEffect, useState } from 'preact/hooks';
import { APP_VERSION } from '../config';
import { getBus } from '../core/bus';
import type { Session } from '../app/session';
import { Hud } from './Hud';
import { Gamepad } from './Gamepad';

/**
 * Raíz de la interfaz DOM. Muestra el HUD del mundo, los avisos breves y el mando táctil.
 * Los paneles modales (diálogo, Zurrón, Códice, Audiencia, Pacto) se añaden por épica.
 */
export function App({ session }: { session: Session }) {
  const [toast, setToast] = useState<{ text: string; kind: string } | null>(null);
  const [inWorld, setInWorld] = useState(false);

  useEffect(() => {
    const bus = getBus();
    const onToast = (e: { text: string; kind?: string }): void =>
      setToast({ text: e.text, kind: e.kind ?? 'info' });
    const onReady = (): void => setInWorld(true);
    bus.on('ui:toast', onToast);
    bus.on('world:ready', onReady);
    return () => {
      bus.off('ui:toast', onToast);
      bus.off('world:ready', onReady);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <>
      {inWorld && <Hud session={session} />}
      {inWorld && <Gamepad />}
      {toast && (
        <div class={`ui-toast ui-toast--${toast.kind}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      )}
      <div class="ui-version" aria-hidden="true">
        v{APP_VERSION} · en construcción
      </div>
    </>
  );
}
