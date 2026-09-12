import { useEffect, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import { listSaves } from '../core/save/save';
import type { SaveV1 } from '../core/save/save';
import { SettingsForm } from './SettingsForm';

/**
 * Menú de título (E8): Nueva partida, Continuar, Cargar, Ajustes, Galería.
 * Vive en la capa DOM sobre la escena de título de Phaser.
 */
type Vista = 'menu' | 'nueva' | 'cargar' | 'ajustes' | 'codigo';

export function TitleMenu({ session, visible }: { session: Session; visible: boolean }) {
  const [vista, setVista] = useState<Vista>('menu');
  const [nombre, setNombre] = useState('Renata');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saves, setSaves] = useState<(SaveV1 | null)[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setSaves(listSaves(session.storage));
  }, [visible, vista, session.storage]);

  // Al volver al título (fin de episodio), el menú arranca de nuevo en la lista.
  useEffect(() => {
    if (visible) {
      setVista('menu');
      setBusy(false);
      setError(null);
    }
  }, [visible]);

  if (!visible) return null;
  const ultimo = session.lastSave();
  const episodios = session.content?.index.episodes.filter((e) => !e.hidden) ?? [];
  const primerEpisodio = episodios.find((e) => e.released)?.id ?? episodios[0]?.id ?? 'gym';

  const start = async (fn: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setError('No se pudo iniciar. Revisa la consola.');
      setBusy(false);
    }
  };

  return (
    <div class="title" role="dialog" aria-label="Menú principal">
      <div class="title__menu">
        {vista === 'menu' && (
          <nav class="title__list">
            <button
              type="button"
              class="title__btn"
              disabled={busy}
              onClick={() => setVista('nueva')}
            >
              Nueva partida
            </button>
            <button
              type="button"
              class="title__btn"
              disabled={!ultimo || busy}
              onClick={() => ultimo && void start(() => session.load(ultimo.slot))}
            >
              Continuar{ultimo ? ` · ${ultimo.resumen.nombre}, día ${ultimo.resumen.dia}` : ''}
            </button>
            <button
              type="button"
              class="title__btn"
              disabled={busy}
              onClick={() => setVista('cargar')}
            >
              Cargar
            </button>
            <button
              type="button"
              class="title__btn"
              disabled={busy}
              onClick={() => setVista('ajustes')}
            >
              Ajustes
            </button>
            <button
              type="button"
              class="title__btn title__btn--sec"
              disabled={busy}
              onClick={() => (window.location.search = '?escena=galeria')}
            >
              Galería de arte
            </button>
          </nav>
        )}
        {vista === 'nueva' && (
          <form
            class="title__form"
            onSubmit={(e) => {
              e.preventDefault();
              const forzado = new URLSearchParams(window.location.search).get('ep');
              void start(() => session.newGame(forzado ?? primerEpisodio, nombre));
            }}
          >
            <label class="title__label" for="nombre">
              ¿Cómo se llama la jurista?
            </label>
            <input
              id="nombre"
              class="input"
              value={nombre}
              maxLength={18}
              onInput={(e) => setNombre((e.target as HTMLInputElement).value)}
              autoFocus
            />
            <p class="title__hint">
              La historia es la de Renata Iriarte; el nombre solo cambia cómo te llaman.
            </p>
            <div class="title__row">
              <button type="button" class="btn btn--secundario" onClick={() => setVista('menu')}>
                Volver
              </button>
              <button type="submit" class="btn btn--oro" disabled={busy || !nombre.trim()}>
                Empezar
              </button>
            </div>
          </form>
        )}
        {vista === 'cargar' && (
          <div class="title__form">
            <div class="title__label">Ranuras</div>
            {saves.map((s, i) => (
              <button
                key={i}
                type="button"
                class="title__slot"
                disabled={!s || busy}
                onClick={() => s && void start(() => session.load(s.slot))}
              >
                <span class="title__slot-n">{i + 1}</span>
                {s ? (
                  <span>
                    {s.resumen.nombre} · {s.resumen.episodio} · {s.resumen.mapa} · día{' '}
                    {s.resumen.dia}
                    <small>{new Date(s.savedAt).toLocaleString('es-CO')}</small>
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
              <button type="button" class="btn btn--secundario" onClick={() => setVista('codigo')}>
                Importar código
              </button>
            </div>
          </div>
        )}
        {vista === 'codigo' && (
          <form
            class="title__form"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                session.importFromCode(codigo);
                setVista('cargar');
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          >
            <label class="title__label" for="codigo">
              Pega el código de una partida exportada
            </label>
            <textarea
              id="codigo"
              class="input"
              rows={4}
              value={codigo}
              onInput={(e) => setCodigo((e.target as HTMLTextAreaElement).value)}
            />
            <div class="title__row">
              <button type="button" class="btn btn--secundario" onClick={() => setVista('cargar')}>
                Volver
              </button>
              <button type="submit" class="btn">
                Guardar en la ranura 3
              </button>
            </div>
          </form>
        )}
        {vista === 'ajustes' && (
          <div class="title__form">
            <SettingsForm session={session} />
            <div class="title__row">
              <button type="button" class="btn btn--secundario" onClick={() => setVista('menu')}>
                Volver
              </button>
            </div>
          </div>
        )}
        {error && <p class="pac__aviso pac__aviso--warn">{error}</p>}
      </div>
    </div>
  );
}
