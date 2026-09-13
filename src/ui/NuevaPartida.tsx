import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Session } from '../app/session';
import type { Jugador, LookPersonalizado, PresetId } from '../core/jugador';
import { ETIQUETA_TRATAMIENTO, PRESETS, jugadorDesdePreset } from '../core/jugador';
import type { Tratamiento } from '../core/texto/plantilla';
import {
  COLORES_PELO,
  COLORES_ROPA,
  LOOKS,
  PIELES,
  lookDesdePersonalizado,
  renderLook,
} from '../engine/art/provisional';
import type { Dir } from '../engine/art/provisional';
import { portraitSrc } from './portraits';

/**
 * Nueva partida (D10): quién es Iriarte. Cuatro presets, un creador de personaje con piezas
 * generadas por código, nombre y tratamiento. Devuelve un `Jugador` listo para `newGame`.
 */
type Paso = 'quien' | 'creador' | 'nombre';

const CUSTOM_INICIAL: LookPersonalizado = {
  piel: 1,
  pelo: 'corto',
  colorPelo: COLORES_PELO.negro!,
  camisa: COLORES_ROPA.violeta!,
  pantalon: COLORES_ROPA.ceniza!,
  accesorio: 'morral',
};

const PELOS: { id: LookPersonalizado['pelo']; nombre: string }[] = [
  { id: 'corto', nombre: 'Corto' },
  { id: 'largo', nombre: 'Largo' },
  { id: 'recogido', nombre: 'Recogido' },
  { id: 'gris', nombre: 'Canoso' },
  { id: 'calvo', nombre: 'Rapado' },
];
const ACCESORIOS: { id: LookPersonalizado['accesorio']; nombre: string }[] = [
  { id: 'morral', nombre: 'Morral' },
  { id: 'panuelo', nombre: 'Pañuelo' },
  { id: 'gafas', nombre: 'Gafas' },
  { id: 'sombrero', nombre: 'Sombrero' },
  { id: 'gorra', nombre: 'Gorra' },
  { id: 'ninguno', nombre: 'Nada' },
];

function Vista({ custom }: { custom: LookPersonalizado }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren();
    const look = lookDesdePersonalizado(custom);
    for (const dir of ['down', 'left', 'up'] as Dir[]) el.appendChild(renderLook(look, dir, 0, 5));
  }, [custom]);
  return <div class="creador__vista" ref={ref} aria-hidden="true" />;
}

function Swatches({
  valores,
  actual,
  onPick,
  label,
}: {
  valores: string[];
  actual: string;
  onPick: (v: string) => void;
  label: string;
}) {
  return (
    <div class="creador__swatches" role="radiogroup" aria-label={label}>
      {valores.map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={v === actual}
          class={`swatch ${v === actual ? 'is-active' : ''}`}
          style={{ background: v }}
          onClick={() => onPick(v)}
          title={v}
        />
      ))}
    </div>
  );
}

export function NuevaPartida({
  session,
  busy,
  onVolver,
  onEmpezar,
}: {
  session: Session;
  busy: boolean;
  onVolver: () => void;
  onEmpezar: (j: Jugador) => void;
}) {
  const [paso, setPaso] = useState<Paso>('quien');
  const [preset, setPreset] = useState<PresetId | 'custom'>('renata');
  const [custom, setCustom] = useState<LookPersonalizado>(CUSTOM_INICIAL);
  const [nombre, setNombre] = useState('Renata');
  const [tratamiento, setTratamiento] = useState<Tratamiento>('f');

  const elegir = (id: PresetId | 'custom'): void => {
    setPreset(id);
    if (id === 'custom') {
      setNombre('');
      setTratamiento('n');
      setPaso('creador');
    } else {
      const j = jugadorDesdePreset(id);
      setNombre(j.nombre);
      setTratamiento(j.tratamiento);
      setPaso('nombre');
    }
  };

  const jugador = useMemo<Jugador>(
    () =>
      preset === 'custom'
        ? { preset: 'custom', nombre: nombre.trim() || 'Iriarte', tratamiento, custom }
        : { ...jugadorDesdePreset(preset, nombre), tratamiento },
    [preset, nombre, tratamiento, custom],
  );

  if (paso === 'quien')
    return (
      <div class="title__form title__form--ancho">
        <div class="title__label">¿Quién es Iriarte?</div>
        <p class="title__hint">
          La historia es la misma: quien juega lleva el apellido de la registradora que borró la
          memoria del Litoral. Cambia el cuerpo, el nombre y cómo te tratan.
        </p>
        <div class="prota" role="group" aria-label="Protagonistas">
          {PRESETS.map((p) => {
            const src = portraitSrc(session.game, p.id, 'neutra');
            return (
              <button
                key={p.id}
                type="button"
                class="prota__card"
                disabled={busy}
                onClick={() => elegir(p.id)}
              >
                {src ? (
                  <img src={src} alt="" width={64} height={64} />
                ) : (
                  <span class="prota__sin" style={{ background: LOOKS[p.id]?.top }} />
                )}
                <b>{p.nombre}</b>
                <small>{p.descripcion}</small>
              </button>
            );
          })}
          <button
            type="button"
            class="prota__card prota__card--custom"
            disabled={busy}
            onClick={() => elegir('custom')}
          >
            <span class="prota__mas" aria-hidden="true">
              +
            </span>
            <b>Personalizado</b>
            <small>Piel, pelo, ropa y accesorio a tu gusto.</small>
          </button>
        </div>
        <div class="title__row">
          <button type="button" class="btn btn--secundario" onClick={onVolver}>
            Volver
          </button>
        </div>
      </div>
    );

  if (paso === 'creador')
    return (
      <div class="title__form title__form--ancho creador">
        <div class="title__label">Personaje personalizado</div>
        <div class="creador__cuerpo">
          <Vista custom={custom} />
          <div class="creador__campos">
            <label class="title__label">Piel</label>
            <Swatches
              label="Tono de piel"
              valores={[...PIELES]}
              actual={PIELES[custom.piel] ?? PIELES[1]}
              onPick={(v) =>
                setCustom({ ...custom, piel: Math.max(0, PIELES.indexOf(v as never)) as 0 })
              }
            />
            <label class="title__label" for="pelo">
              Pelo
            </label>
            <select
              id="pelo"
              class="input"
              value={custom.pelo}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  pelo: (e.target as HTMLSelectElement).value as LookPersonalizado['pelo'],
                })
              }
            >
              {PELOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <label class="title__label">Color de pelo</label>
            <Swatches
              label="Color de pelo"
              valores={Object.values(COLORES_PELO)}
              actual={custom.colorPelo}
              onPick={(v) => setCustom({ ...custom, colorPelo: v })}
            />
            <label class="title__label">Camisa</label>
            <Swatches
              label="Color de camisa"
              valores={Object.values(COLORES_ROPA)}
              actual={custom.camisa}
              onPick={(v) => setCustom({ ...custom, camisa: v })}
            />
            <label class="title__label">Pantalón</label>
            <Swatches
              label="Color de pantalón"
              valores={Object.values(COLORES_ROPA)}
              actual={custom.pantalon}
              onPick={(v) => setCustom({ ...custom, pantalon: v })}
            />
            <label class="title__label" for="accesorio">
              Accesorio
            </label>
            <select
              id="accesorio"
              class="input"
              value={custom.accesorio}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  accesorio: (e.target as HTMLSelectElement)
                    .value as LookPersonalizado['accesorio'],
                })
              }
            >
              {ACCESORIOS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div class="title__row">
          <button type="button" class="btn btn--secundario" onClick={() => setPaso('quien')}>
            Volver
          </button>
          <button type="button" class="btn" onClick={() => setPaso('nombre')}>
            Seguir
          </button>
        </div>
      </div>
    );

  return (
    <form
      class="title__form"
      onSubmit={(e) => {
        e.preventDefault();
        if (nombre.trim()) onEmpezar(jugador);
      }}
    >
      <label class="title__label" for="nombre">
        Nombre de pila
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
        {nombre.trim() || '…'} Iriarte. El apellido no se elige: es la historia.
      </p>
      <div class="title__label">Tratamiento en los textos</div>
      <div class="trato" role="radiogroup" aria-label="Tratamiento">
        {(['f', 'm', 'n'] as Tratamiento[]).map((t) => (
          <label key={t} class={`trato__opt ${tratamiento === t ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="tratamiento"
              value={t}
              checked={tratamiento === t}
              onChange={() => setTratamiento(t)}
            />
            {ETIQUETA_TRATAMIENTO[t]}
          </label>
        ))}
      </div>
      <div class="title__row">
        <button
          type="button"
          class="btn btn--secundario"
          onClick={() => setPaso(preset === 'custom' ? 'creador' : 'quien')}
        >
          Volver
        </button>
        <button type="submit" class="btn btn--oro" disabled={busy || !nombre.trim()}>
          Empezar
        </button>
      </div>
    </form>
  );
}
