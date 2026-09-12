import { signal } from '@preact/signals';
import type { Action } from '../core/content/schema';

/**
 * Estado de la interfaz (señales). La sesión escribe aquí las peticiones modales y la
 * interfaz las cumple; al cerrarse, resuelve la promesa que la sesión está esperando.
 */

export interface DialogueRequest {
  id: string;
  resolve: (r: { deferred: Action[] }) => void;
}

export interface CutsceneRequest {
  id: string;
  resolve: () => void;
}

export interface AudienciaRequest {
  id: string;
  resolve: (r: { ganada: boolean }) => void;
}

export interface PactoRequest {
  id: string;
  resolve: (r: { firmado: boolean; equilibrio: number }) => void;
}

export interface InterpelacionRequest {
  name: string;
  rank: string;
  articulo?: string;
  resolve: (r: 'interpelada' | 'detenida') => void;
}

export type Panel =
  'zurron' | 'codice' | 'voces' | 'cuaderno' | 'mapa' | 'ajustes' | 'menu' | 'atril';

export const ui = {
  dialogue: signal<DialogueRequest | null>(null),
  cutscene: signal<CutsceneRequest | null>(null),
  audiencia: signal<AudienciaRequest | null>(null),
  pacto: signal<PactoRequest | null>(null),
  interpelacion: signal<InterpelacionRequest | null>(null),
  panel: signal<Panel | null>(null),
  /** Contador que la sesión incrementa cuando el estado cambia (para re-renderizar). */
  tick: signal(0),
  /** ¿Estamos en el menú de título? */
  enTitulo: signal(false),
};

export function bump(): void {
  ui.tick.value = ui.tick.value + 1;
}

/** ¿Hay algo modal abierto que deba bloquear el mundo? */
export function anyModalOpen(): boolean {
  return Boolean(
    ui.dialogue.value ||
    ui.cutscene.value ||
    ui.audiencia.value ||
    ui.pacto.value ||
    ui.interpelacion.value ||
    ui.panel.value,
  );
}
