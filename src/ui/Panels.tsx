import { useEffect, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import { getBus } from '../core/bus';
import type { CodiceEntry } from '../core/content/schema';
import { ui } from './store';
import type { Panel } from './store';

/**
 * Paneles del jugador (E3): Zurrón, Códice, Registro de Voces, Cuaderno y Mapa.
 * Un solo contenedor modal con pestañas. Teclas: Z, C, V, N, M abren; Esc cierra.
 */

const TABS: { id: Panel; label: string; key: string }[] = [
  { id: 'zurron', label: 'Zurrón', key: 'Z' },
  { id: 'codice', label: 'Códice', key: 'C' },
  { id: 'voces', label: 'Voces', key: 'V' },
  { id: 'cuaderno', label: 'Cuaderno', key: 'N' },
  { id: 'mapa', label: 'Litoral', key: 'M' },
];

export function PanelHost({ session }: { session: Session }) {
  const panel = ui.panel.value;
  useEffect(() => {
    if (!panel) return;
    getBus().emit('ui:opened', { panel });
    return () => getBus().emit('ui:closed', { panel });
  }, [panel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        ui.panel.value = null;
        return;
      }
      const tab = TABS.find((t) => t.key.toLowerCase() === e.key.toLowerCase());
      if (tab) {
        e.preventDefault();
        ui.panel.value = tab.id === panel ? null : tab.id;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  if (!panel) return null;
  return (
    <div class="panel" role="dialog" aria-label={TABS.find((t) => t.id === panel)?.label}>
      <div class="panel__sheet">
        <header class="panel__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={panel === t.id}
              class={`panel__tab ${panel === t.id ? 'is-active' : ''}`}
              onClick={() => (ui.panel.value = t.id)}
            >
              {t.label} <kbd>{t.key}</kbd>
            </button>
          ))}
          <button
            type="button"
            class="panel__close"
            aria-label="Cerrar"
            onClick={() => (ui.panel.value = null)}
          >
            ✕
          </button>
        </header>
        <div class="panel__body">
          {panel === 'zurron' && <Zurron session={session} />}
          {panel === 'codice' && <Codice session={session} />}
          {panel === 'voces' && <Voces session={session} />}
          {panel === 'cuaderno' && <Cuaderno session={session} />}
          {panel === 'mapa' && <MapaLitoral session={session} />}
        </div>
      </div>
    </div>
  );
}

/** Barra de pestañas visible en el mundo (sobre todo para táctil). */
export function PanelBar() {
  return (
    <nav class="panelbar" aria-label="Paneles">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          class="panelbar__btn"
          onClick={() => (ui.panel.value = t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------

function Zurron({ session }: { session: Session }) {
  const [, force] = useState(0);
  const ep = session.episode;
  const items = session.state.evidence
    .map((id) => ep?.evidence[id] ?? session.evidenceFromAnyEpisode(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const [sel, setSel] = useState<string | null>(items[0]?.id ?? null);
  const current = items.find((i) => i.id === sel) ?? items[0];
  const puedeCotejar = session.state.party.includes('prudencio');

  if (!items.length)
    return (
      <p class="panel__empty">
        El zurrón está vacío. Los documentos, objetos y testimonios que recojas aparecerán aquí.
      </p>
    );
  return (
    <div class="two-col">
      <ul class="list" role="listbox" aria-label="Evidencias">
        {items.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              role="option"
              aria-selected={current?.id === e.id}
              class={`list__item ${current?.id === e.id ? 'is-active' : ''}`}
              onClick={() => setSel(e.id)}
            >
              <span class={`tag tag--${e.tipo}`}>{e.tipo}</span> {e.nombre}
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <article class="detail">
          <h3>{current.nombre}</h3>
          <p class="detail__meta">
            {current.tipo}
            {session.state.evidenceCotejada.includes(current.id) &&
              (current.autentico ? ' · cotejado: auténtico' : ' · cotejado: falso')}
          </p>
          <p>{current.descripcion}</p>
          {session.state.evidenceCotejada.includes(current.id) && current.cotejo && (
            <p class="detail__cotejo">
              <strong>Cotejo de Prudencio:</strong> {current.cotejo.revela}
            </p>
          )}
          {current.cotejo && !session.state.evidenceCotejada.includes(current.id) && (
            <button
              type="button"
              class="btn"
              disabled={!puedeCotejar}
              title={puedeCotejar ? '' : 'Prudencio no está en el grupo'}
              onClick={() => {
                session.cotejar(current.id);
                force((n) => n + 1);
              }}
            >
              Cotejar documento
            </button>
          )}
        </article>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

const LIBROS: Record<CodiceEntry['libro'], string> = {
  constitucion: 'Constitución',
  civil: 'Código Civil',
  comercio: 'Código de Comercio',
  laboral: 'Código del Trabajo',
  ph: 'Propiedad horizontal',
  especial: 'Leyes especiales',
  jurisprudencia: 'Jurisprudencia',
  principios: 'Principios',
};

function Codice({ session }: { session: Session }) {
  const all = session.content?.codice ?? {};
  const entries = session.state.codice
    .map((id) => all[id])
    .filter((e): e is CodiceEntry => Boolean(e));
  const [libro, setLibro] = useState<string>('todos');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(entries[0]?.id ?? null);
  const visible = entries.filter(
    (e) =>
      (libro === 'todos' || e.libro === libro) &&
      (!q ||
        `${e.referencia} ${e.titulo} ${e.etiquetas.join(' ')} ${e.enPalabrasSimples}`
          .toLowerCase()
          .includes(q.toLowerCase())),
  );
  const current = visible.find((e) => e.id === sel) ?? visible[0];
  const libros = ['todos', ...new Set(entries.map((e) => e.libro))];

  if (!entries.length)
    return (
      <p class="panel__empty">
        El Códice está en blanco. Los folios que encuentres y las Consultas que resuelvas irán
        llenándolo.
      </p>
    );
  return (
    <div class="codice">
      <div class="codice__tools">
        <input
          class="input"
          type="search"
          placeholder="Buscar artículo, palabra o tema"
          value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
          aria-label="Buscar en el Códice"
        />
        <div class="chips" role="tablist">
          {libros.map((l) => (
            <button
              key={l}
              type="button"
              class={`chip ${libro === l ? 'is-active' : ''}`}
              onClick={() => setLibro(l)}
            >
              {l === 'todos' ? 'Todos' : LIBROS[l as CodiceEntry['libro']]}
            </button>
          ))}
        </div>
      </div>
      <div class="two-col">
        <ul class="list" role="listbox" aria-label="Entradas">
          {visible.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                role="option"
                aria-selected={current?.id === e.id}
                class={`list__item ${current?.id === e.id ? 'is-active' : ''}`}
                onClick={() => setSel(e.id)}
              >
                <span class="list__ref">{e.referencia}</span> {e.titulo}
              </button>
            </li>
          ))}
        </ul>
        {current && (
          <article class="detail detail--codice">
            <div class="detail__ref">{current.referencia}</div>
            <h3>{current.titulo}</h3>
            <blockquote class="detail__literal">
              {current.textoLiteral}
              {current.esExtracto && <span class="detail__extracto"> (extracto)</span>}
            </blockquote>
            <h4>En palabras simples</h4>
            <p>{current.enPalabrasSimples}</p>
            <h4>Cómo se usa en Audiencia</h4>
            <p>{current.usoEnAudiencia}</p>
            {current.ejemplo && (
              <>
                <h4>Ejemplo</h4>
                <p>{current.ejemplo}</p>
              </>
            )}
            {(session.state.codiceUsedIn[current.id]?.length ?? 0) > 0 && (
              <p class="detail__meta">
                Usado en: {session.state.codiceUsedIn[current.id]?.join(', ')}
              </p>
            )}
            {!current.revisado && (
              <p class="detail__aviso">
                Texto consultado el {current.fechaConsulta}; pendiente de revisión jurídica de
                Bellium.
              </p>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Voces({ session }: { session: Session }) {
  const voces = session.state.voces;
  if (!voces.length)
    return (
      <p class="panel__empty">
        El Registro de Voces está vacío. Cuando alguien te cuente un hecho que importa, podrás
        registrarlo.
      </p>
    );
  return (
    <table class="tabla">
      <thead>
        <tr>
          <th>Quién</th>
          <th>Hecho</th>
          <th>Cuándo</th>
        </tr>
      </thead>
      <tbody>
        {voces.map((v) => (
          <tr key={v.id}>
            <td>{v.nombre}</td>
            <td>{v.hecho}</td>
            <td>{v.fecha}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------

function Cuaderno({ session }: { session: Session }) {
  const ep = session.episode;
  const epId = ep?.manifest.id ?? '';
  const notas = session.state.notas[epId] ?? [];
  const pactos = Object.entries(session.state.pactos);
  return (
    <div class="cuaderno">
      <section>
        <h3>{ep?.manifest.title ?? 'Cuaderno'}</h3>
        <p class="detail__meta">
          Jugadora: {session.state.playerName} · Día {session.state.diaDeJuego} · Consultas
          resueltas: {session.state.consultasResueltas.length}
        </p>
      </section>
      <section>
        <h4>Notas de audiencia</h4>
        {notas.length ? (
          <ul class="notas">
            {notas.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : (
          <p class="panel__empty">
            Cada contradicción plena en una Audiencia deja aquí una nota de dos líneas.
          </p>
        )}
      </section>
      <section>
        <h4>Actas firmadas</h4>
        {pactos.length ? (
          <ul class="notas">
            {pactos.map(([id, p]) => (
              <li key={id}>
                {id}: Equilibrio {p.equilibrio}
                {p.impugnado ? ' · impugnada' : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p class="panel__empty">Todavía no has firmado ningún acta.</p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function MapaLitoral({ session }: { session: Session }) {
  const regiones = session.content?.index.regiones ?? [];
  const episodios = session.content?.index.episodes ?? [];
  return (
    <div class="mapa">
      <p class="detail__meta">Estado de cada región del Litoral según la legitimidad alcanzada.</p>
      <ul class="mapa__lista">
        {regiones
          .filter((r) => r.id !== 'gimnasio' || session.episode?.manifest.region === 'gimnasio')
          .map((r) => {
            const valor = session.state.legitimidad[r.id] ?? 0;
            const ep = episodios.find((e) => e.id === r.episodio);
            const estado =
              valor >= 75 ? 'floración' : valor >= 50 ? 'verdor' : valor >= 25 ? 'brote' : 'ceniza';
            return (
              <li key={r.id} class={`mapa__region mapa__region--${estado}`}>
                <div class="mapa__nombre">{r.nombre}</div>
                <div class="mapa__estado">
                  {estado} · {valor}
                </div>
                <div class="mapa__ep">
                  {ep
                    ? ep.released
                      ? ep.title
                      : `${ep.title} · próximamente${ep.eta ? ` (${ep.eta})` : ''}`
                    : ''}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
