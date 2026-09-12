import mitt from 'mitt';
import type { Emitter } from 'mitt';

/**
 * Bus de eventos tipado. Es el único canal entre `core`, `engine` (Phaser) y `ui` (Preact).
 * `core` emite y escucha; `engine` y `ui` reaccionan. Nadie llama a otra capa directamente.
 *
 * Los tipos de evento se amplían por épica. Cada evento documenta quién lo emite.
 */
export type BusEvents = {
  /** Emitido por la escena de título cuando el jugador confirma. */
  'title:start': undefined;
  /** Emitido por engine cuando el jugador interactúa con un objeto del mundo. */
  'world:interact': { kind: string; id: string; payload?: Record<string, unknown> };
  /** Emitido por core cuando cambia el estado de una región (Reverdecer). */
  'legitimidad:hito': { region: string; estado: string; valor: number };
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
