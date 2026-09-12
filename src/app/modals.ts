import type { Session } from './session';
import { ui } from '../ui/store';

/**
 * Manejadores modales: la sesión pide un panel, la interfaz lo muestra y resuelve la
 * promesa al cerrarse. Todo lo que aún no existe resuelve de inmediato con un aviso.
 */
export function installModals(session: Session): void {
  session.setModals({
    dialogue: (id) =>
      new Promise((resolve) => {
        ui.dialogue.value = { id, resolve };
      }),
    cutscene: (id) =>
      new Promise((resolve) => {
        ui.cutscene.value = { id, resolve };
      }),
    audiencia: async (id) => {
      const r = await new Promise<{ ganada: boolean }>((resolve) => {
        ui.audiencia.value = { id, resolve };
      });
      if (r.ganada) {
        await session.applyNow([{ type: 'setFlag', flag: `audiencia.${id}.ganada`, value: true }]);
        await session.fire({ type: 'audienciaWon', id });
      }
    },
    pacto: async (id) => {
      const r = await new Promise<{ firmado: boolean; equilibrio: number }>((resolve) => {
        ui.pacto.value = { id, resolve };
      });
      if (r.firmado) {
        await session.applyNow([
          { type: 'setFlag', flag: `pacto.${id}.firmado`, value: true },
          { type: 'setFlag', flag: `pacto.${id}.equilibrio`, value: r.equilibrio },
        ]);
        await session.fire({ type: 'pactoSigned', id, equilibrio: r.equilibrio });
      }
    },
    interpelacion: (e) =>
      new Promise((resolve) => {
        ui.interpelacion.value = { ...e, resolve };
      }),
  });
}
