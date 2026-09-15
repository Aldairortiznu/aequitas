import mitt from 'mitt';
import type { Emitter } from 'mitt';
import type { MapState } from './content/schema';

/**
 * Bus de eventos tipado. Es el único canal entre `core`, `engine` (Phaser) y `ui` (Preact).
 * `core` emite y escucha; `engine` y `ui` reaccionan. Nadie llama a otra capa directamente.
 *
 * Los tipos de evento se amplían por épica. Cada evento documenta quién lo emite.
 */
export type BusEvents = {
  /** Emitido por la escena de arranque cuando Phaser está listo. */
  'boot:ready': undefined;
  /** Emitido por la escena de título cuando el jugador confirma. */
  'title:start': undefined;
  /** Emitido por engine cuando el jugador interactúa con un objeto del mundo o un compañero. */
  'world:interact': { kind: string; id: string; payload?: Record<string, string> };
  /** Emitido por engine al pulsar cancelar en el mundo. */
  'world:cancel': undefined;
  /** Emitido por engine cuando la escena del mundo terminó de crearse. */
  'world:ready': { episodeId: string; map: string };
  /** Emitido por engine al pisar una puerta. */
  'world:door': { name: string; map: string; spawn: string; props: Record<string, string> };
  /** Emitido por engine al entrar en una zona disparadora. */
  'world:trigger': { name: string; beat: string; props: Record<string, string> };
  /** Emitido por engine cuando una patrulla detecta al jugador. */
  'world:patrol': { name: string; rank: string; articulo?: string; map: string };
  /** Emitido por app para cambiar el estado visual de un mapa cargado. */
  'world:setMapState': { map: string; state: MapState };
  /** Emitido por app para retirar un objeto del mapa (evidencia recogida, folio leído). */
  'world:hideObject': { name: string };
  /** Emitido por app al resolver una interpelación. */
  'world:patrolResolved': { name: string; outcome: 'interpelada' | 'detenida' };
  /** Emitido por app para congelar el mundo (cinemática, transición). */
  'world:freeze': { frozen: boolean };
  /** Emitido por app con el destino del objetivo guiado (null = sin marcador). */
  'world:objetivo': { mapa: string; objeto: string } | null;
  /** Emitidos por ui al abrir o cerrar cualquier panel modal. */
  'ui:opened': { panel: string };
  'ui:closed': { panel: string };
  /** Emitido por core cuando cambia el estado de una región (Reverdecer). */
  'legitimidad:hito': { region: string; estado: string; valor: number };
  /** Emitido por la sesión al cambiar el volumen en ajustes. */
  'audio:volume': { volumen: number };
  /** Efecto de sonido por nombre (lo emiten las vistas). */
  'audio:sfx': { name: string };
  /** Cambio de pista musical (null detiene). */
  'audio:music': { pista: string | null; capas?: number };
  /** Emitido por la escena de título al quedar lista (la app muestra el menú DOM). */
  'title:ready': undefined;
  /** Emitido por core cuando debe mostrarse una notificación breve. */
  'ui:toast': { text: string; kind?: 'info' | 'ok' | 'warn' };
  /** Emitido por core cuando cambia el estado global observable por la UI. */
  'state:changed': { reason: string };
};

export type Bus = Emitter<BusEvents>;

let instance: Bus | null = null;

/** Devuelve el bus global (se crea en la primera llamada). */
export function getBus(): Bus {
  if (!instance) instance = mitt<BusEvents>();
  return instance;
}

/** Crea un bus aislado (para pruebas). */
export function createBus(): Bus {
  return mitt<BusEvents>();
}

/** Reinicia el bus global (solo pruebas). */
export function resetBus(): void {
  instance = null;
}
