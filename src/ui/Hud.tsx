import { useEffect, useState } from 'preact/hooks';
import { getBus } from '../core/bus';
import type { Session } from '../app/session';

/** HUD mínimo del mundo: región, legitimidad, evidencias y Códice. Se amplía en E3/E7. */
export function Hud({ session }: { session: Session }) {
  const [, force] = useState(0);
  useEffect(() => {
    const bus = getBus();
    const bump = (): void => force((n) => n + 1);
    bus.on('state:changed', bump);
    bus.on('legitimidad:hito', bump);
    return () => {
      bus.off('state:changed', bump);
      bus.off('legitimidad:hito', bump);
    };
  }, []);

  const ep = session.episode;
  if (!ep) return null;
  const region = ep.manifest.region;
  const regionName = session.content?.index.regiones.find((r) => r.id === region)?.nombre ?? region;
  const leg = session.legitimidad[region]?.valor ?? 0;
  const mapName =
    (ep.maps[session.state.map]?.properties?.find((p) => p.name === 'nombre')?.value as
      string | undefined) ?? session.state.map;

  return (
    <div class="hud" aria-label="Estado">
      <div class="hud__place">
        <span class="hud__region">{regionName}</span>
        <span class="hud__map">{mapName}</span>
      </div>
      <div class="hud__meter" title="Legitimidad de la región">
        <span class="hud__label">Legitimidad</span>
        <span
          class="hud__bar"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={leg}
        >
          <span class="hud__fill" style={{ width: `${leg}%` }} />
        </span>
        <span class="hud__value">{leg}</span>
      </div>
      <div class="hud__counts">
        <span title="Evidencias en el zurrón">Zurrón {session.state.evidence.length}</span>
        <span title="Entradas del Códice">Códice {session.state.codice.length}</span>
      </div>
    </div>
  );
}
