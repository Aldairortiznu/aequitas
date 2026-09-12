import { useEffect, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import { getBus } from '../core/bus';
import { exportCode, listSaves } from '../core/save/save';
import { ui } from './store';

/**
 * Atril (E8): guardar en una ranura, revisar un acta impugnada, obtener el código de
 * exportación. Se abre al interactuar con un atril del mapa.
 */
export function AtrilView({ session, onClose }: { session: Session; onClose: () => void }) {
  const [vista, setVista] = useState<'menu' | 'guardar' | 'codigo'>('menu');
  const [codigo, setCodigo] = useState('');
  const saves = listSaves(session.storage);
  const impugnadas = Object.entries(session.state.pactos).filter(([, p]) => p.impugnado);

  useEffect(() => {
    getBus().emit('ui:opened', { panel: 'atril' });
    return () => getBus().emit('ui:closed', { panel: 'atril' });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div class="panel" role="dialog" aria-label="Atril">
      <div class="panel__sheet panel__sheet--chico">
        <header class="panel__tabs">
          <span class="panel__tab is-active">Atril</span>
          <button type="button" class="panel__close" aria-label="Cerrar" onClick={onClose}>
            ✕
          </button>
        </header>
        <div class="panel__body">
          {vista === 'menu' && (
            <div class="title__list">
              <button type="button" class="title__btn" onClick={() => setVista('guardar')}>
                Guardar la partida
              </button>
              {impugnadas.map(([id]) => (
                <button
                  key={id}
                  type="button"
                  class="title__btn"
                  onClick={() => {
                    onClose();
                    void session.runActions([{ type: 'startPacto', id }]);
                  }}
                >
                  Revisar el acta impugnada: {session.episode?.pactos[id]?.titulo ?? id}
                </button>
              ))}
              <button
                type="button"
                class="title__btn"
                onClick={() => {
                  setCodigo(exportCode(session.buildSave(0)));
                  setVista('codigo');
                }}
              >
                Código para llevar la partida a otro dispositivo
              </button>
              <button type="button" class="title__btn title__btn--sec" onClick={onClose}>
                Cerrar
              </button>
            </div>
          )}
          {vista === 'guardar' && (
            <div class="title__form">
              <div class="title__label">Elige una ranura</div>
              {saves.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  class="title__slot"
                  onClick={() => {
                    session.save(i + 1);
                    onClose();
                  }}
                >
                  <span class="title__slot-n">{i + 1}</span>
                  {s ? (
                    <span>
                      {s.resumen.nombre} · {s.resumen.episodio} · día {s.resumen.dia}{' '}
                      <small>(se sobrescribe)</small>
                    </span>
                  ) : (
                    <span class="title__vacio">vacía</span>
                  )}
                </button>
              ))}
              <div class="title__row">
                <button type="button" class="btn btn--secundario" onClick={() => setVista('menu')}>
                  Volver
                </button>
              </div>
            </div>
          )}
          {vista === 'codigo' && (
            <div class="title__form">
              <div class="title__label">
                Copia este código y pégalo en «Cargar → Importar código» en el otro dispositivo.
              </div>
              <textarea
                class="input"
                rows={5}
                readOnly
                value={codigo}
                onFocus={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div class="title__row">
                <button type="button" class="btn btn--secundario" onClick={() => setVista('menu')}>
                  Volver
                </button>
                <button
                  type="button"
                  class="btn"
                  onClick={() => {
                    void navigator.clipboard?.writeText(codigo);
                    getBus().emit('ui:toast', { text: 'Código copiado.', kind: 'ok' });
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AtrilHost({ session }: { session: Session }) {
  if (ui.panel.value !== 'atril') return null;
  return <AtrilView session={session} onClose={() => (ui.panel.value = null)} />;
}
