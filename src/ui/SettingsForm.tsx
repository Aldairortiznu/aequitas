import { useState } from 'preact/hooks';
import type { Session, SessionSettings } from '../app/session';

/** Formulario de ajustes (E11): dificultad, texto, fuente, volumen, modo Aula. */
export function SettingsForm({ session }: { session: Session }) {
  const [s, setS] = useState<SessionSettings>({ ...session.settings });
  const update = (patch: Partial<SessionSettings>): void => {
    const next = { ...s, ...patch };
    setS(next);
    session.updateSettings(next);
  };
  return (
    <div class="settings">
      <fieldset class="settings__group">
        <legend>Modo de juego</legend>
        {(
          [
            [
              'estudio',
              'Estudio',
              'Sin tumulto ni sesión levantada; pistas siempre; cláusulas nulas marcadas; sin temporizadores.',
            ],
            ['normal', 'Normal', 'Pistas tras dos fallos; temporizador en las interpelaciones.'],
            ['jurista', 'Jurista', 'Sin pistas; menos credibilidad; tensión inicial más alta.'],
          ] as const
        ).map(([id, label, desc]) => (
          <label key={id} class={`settings__radio ${s.modo === id ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="modo"
              checked={s.modo === id}
              onChange={() => update({ modo: id })}
            />
            <span>
              <strong>{label}</strong>
              <small>{desc}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset class="settings__group">
        <legend>Texto</legend>
        <label class="settings__row">
          Tamaño
          <input
            type="range"
            min={1}
            max={1.6}
            step={0.1}
            value={s.textScale}
            onInput={(e) => update({ textScale: Number((e.target as HTMLInputElement).value) })}
          />
          <span class="meter__value">{Math.round(s.textScale * 100)} %</span>
        </label>
        <label class="settings__row">
          <input
            type="checkbox"
            checked={s.font === 'pixel'}
            onChange={(e) =>
              update({ font: (e.target as HTMLInputElement).checked ? 'pixel' : 'legible' })
            }
          />
          Fuente de píxel en la interfaz (menos legible)
        </label>
      </fieldset>
      <fieldset class="settings__group">
        <legend>Sonido</legend>
        <label class="settings__row">
          Volumen
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volumen}
            onInput={(e) => update({ volumen: Number((e.target as HTMLInputElement).value) })}
          />
          <span class="meter__value">{Math.round(s.volumen * 100)} %</span>
        </label>
      </fieldset>
      <fieldset class="settings__group">
        <legend>Aula</legend>
        <label class="settings__row">
          <input
            type="checkbox"
            checked={s.modoAula}
            onChange={(e) => update({ modoAula: (e.target as HTMLInputElement).checked })}
          />
          Modo Aula: las Audiencias y Pactos esperan confirmación del docente entre acciones
        </label>
      </fieldset>
    </div>
  );
}
