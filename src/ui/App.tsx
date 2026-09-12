import { useEffect, useState } from 'preact/hooks';
import { APP_VERSION } from '../config';
import { getBus } from '../core/bus';

/**
 * Raíz de la interfaz DOM. En E0 solo muestra la versión y un aviso breve
 * cuando la escena de título emite `title:start`.
 */
export function App() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const bus = getBus();
    const onStart = (): void => setToast('En construcción: el mundo llega en la épica E1.');
    const onToast = (e: { text: string }): void => setToast(e.text);
    bus.on('title:start', onStart);
    bus.on('ui:toast', onToast);
    return () => {
      bus.off('title:start', onStart);
      bus.off('ui:toast', onToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <>
      {toast && (
        <div class="ui-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
      <div class="ui-version" aria-hidden="true">
        v{APP_VERSION} · en construcción
      </div>
    </>
  );
}
