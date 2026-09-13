/**
 * Métricas de playtest (L1.2). Lógica pura: un registro de eventos con marca de tiempo que
 * la sesión guarda en el navegador y que el Cuaderno exporta como JSON. Nunca sale del
 * dispositivo por sí solo (decisión pendiente «Analítica: ninguna»).
 */
export interface EventoMetrica {
  t: number; // ms desde el inicio de la sesión de juego
  tipo: string;
  datos?: Record<string, string | number | boolean>;
}

export interface Metricas {
  version: 1;
  inicio: string; // ISO
  episodio?: string;
  eventos: EventoMetrica[];
}

export function crearMetricas(now = new Date()): Metricas {
  return { version: 1, inicio: now.toISOString(), eventos: [] };
}

export function registrar(
  m: Metricas,
  tipo: string,
  datos?: EventoMetrica['datos'],
  ahora = Date.now(),
): Metricas {
  const t = Math.max(0, ahora - Date.parse(m.inicio));
  const ev: EventoMetrica = datos ? { t, tipo, datos } : { t, tipo };
  return { ...m, eventos: [...m.eventos.slice(-1999), ev] };
}

/** Resumen legible para el formulario de playtest. */
export function resumir(m: Metricas): Record<string, number> {
  const c = (tipo: string): number => m.eventos.filter((e) => e.tipo === tipo).length;
  const dur = m.eventos.length
    ? Math.round((m.eventos[m.eventos.length - 1]!.t / 60000) * 10) / 10
    : 0;
  return {
    minutos: dur,
    dialogos: c('dialogo'),
    consultasCorrectas: c('consulta:correcta'),
    consultasFallidas: c('consulta:fallida'),
    audienciasGanadas: c('audiencia:allanamiento'),
    audienciasTumulto: c('audiencia:tumulto'),
    audienciasSesionLevantada: c('audiencia:sesionLevantada'),
    contradiccionesPlenas: c('audiencia:plena'),
    contradiccionesFallidas: c('audiencia:fallida'),
    pistas: c('audiencia:pista'),
    pactosFirmados: c('pacto:firmado'),
    pactosImpugnados: c('pacto:impugnado'),
    detenciones: c('interpelacion:detenida'),
    guardados: c('guardado'),
  };
}
