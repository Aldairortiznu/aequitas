import { useEffect, useState } from 'preact/hooks';
import { APP_VERSION } from '../config';
import { getBus } from '../core/bus';
import type { Session } from '../app/session';
import { Hud } from './Hud';
import { Gamepad } from './Gamepad';
import { DialogueHost } from './DialogueBox';
import { PanelBar, PanelHost } from './Panels';
import { AudienciaHost } from './AudienciaView';
import { PactoHost } from './PactoView';
import { anyModalOpen, ui } from './store';

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

  // Atajos de paneles desde el mundo (cuando no hay nada modal abierto).
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!inWorld || anyModalOpen()) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const map: Record<string, 'zurron' | 'codice' | 'voces' | 'cuaderno' | 'mapa'> = {
        z: 'zurron',
        c: 'codice',
        v: 'voces',
        n: 'cuaderno',
        m: 'mapa',
      };
      const p = map[e.key.toLowerCase()];
      if (p) {
        e.preventDefault();
        ui.panel.value = p;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inWorld]);

  return (
    <>
      {inWorld && <Hud session={session} />}
      {inWorld && !anyModalOpen() && <PanelBar />}
      {inWorld && <Gamepad />}
      <DialogueHost session={session} />
      <PanelHost session={session} />
      <AudienciaHost session={session} />
      <PactoHost session={session} />
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
