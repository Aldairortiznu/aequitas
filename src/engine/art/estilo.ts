/**
 * Direcciones estéticas del arte construido por código (decisión pendiente de Dirección).
 * Un estilo fija cómo se dibujan personajes y tiles y qué luz tiene la escena. Se elige con
 * `?estilo=<id>` en la URL (pruebas y comparación) o con el ajuste `estilo`.
 *
 *   esmeralda  GBA clásico: contorno negro, cabezón, colores planos, tiles limpios.
 *   litoral    16-bit sobrio: proporción natural, contorno del propio material, tres tonos,
 *              tiles con textura, luz de tarde y partículas. (Recomendado.)
 *   grabado    Tinta y papel: monocromo sepia con acentos violeta y oro; como un códice.
 */
export type EstiloId = 'esmeralda' | 'litoral' | 'grabado';

export interface Estilo {
  id: EstiloId;
  nombre: string;
  /** Contorno de los personajes. */
  contorno: 'negro' | 'oscuro' | 'ninguno';
  /** Proporción: cabeza grande (2,5 cabezas) o natural (3,5 cabezas). */
  proporcion: 'cabezon' | 'natural';
  /** Tonos de sombreado en ropa y piel. */
  sombreado: 1 | 2 | 3;
  /** Tiles con textura y bordes, o planos. */
  texturaTiles: boolean;
  /** Tinte de luz sobre la escena (color y opacidad), por estado del mapa. */
  luz: Record<'ceniza' | 'brote' | 'verdor' | 'floracion', { color: string; alpha: number }>;
  /** Partículas ambientales. */
  particulas: boolean;
  /** Posprocesado de color de todo el arte del mundo. */
  posproceso: 'ninguno' | 'sepia';
}

export const ESTILOS: Record<EstiloId, Estilo> = {
  esmeralda: {
    id: 'esmeralda',
    nombre: 'Esmeralda',
    contorno: 'negro',
    proporcion: 'cabezon',
    sombreado: 2,
    texturaTiles: false,
    luz: {
      ceniza: { color: '#000000', alpha: 0 },
      brote: { color: '#000000', alpha: 0 },
      verdor: { color: '#000000', alpha: 0 },
      floracion: { color: '#000000', alpha: 0 },
    },
    particulas: false,
    posproceso: 'ninguno',
  },
  litoral: {
    id: 'litoral',
    nombre: 'Litoral',
    contorno: 'oscuro',
    proporcion: 'natural',
    sombreado: 3,
    texturaTiles: true,
    luz: {
      ceniza: { color: '#4a4850', alpha: 0.16 },
      brote: { color: '#6f6c76', alpha: 0.08 },
      verdor: { color: '#e2b94a', alpha: 0.05 },
      floracion: { color: '#f4dc8a', alpha: 0.07 },
    },
    particulas: true,
    posproceso: 'ninguno',
  },
  grabado: {
    id: 'grabado',
    nombre: 'Grabado',
    contorno: 'negro',
    proporcion: 'natural',
    sombreado: 2,
    texturaTiles: true,
    luz: {
      ceniza: { color: '#1b1b1f', alpha: 0.1 },
      brote: { color: '#1b1b1f', alpha: 0.06 },
      verdor: { color: '#1b1b1f', alpha: 0.03 },
      floracion: { color: '#1b1b1f', alpha: 0 },
    },
    particulas: false,
    posproceso: 'sepia',
  },
};

let activo: Estilo = ESTILOS.litoral;

/** Estilo activo (se fija al arrancar desde la URL o los ajustes). */
export function estiloActivo(): Estilo {
  return activo;
}

export function fijarEstilo(id: string | null | undefined): Estilo {
  if (id && id in ESTILOS) activo = ESTILOS[id as EstiloId];
  return activo;
}

/** Aclara u oscurece un color hex (factor > 1 aclara). */
export function ajustar(hex: string, factor: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Sepia con acentos: violetas y dorados se conservan; el resto va a una rampa de tinta. */
export function sepia(r: number, g: number, b: number): [number, number, number] {
  const esVioleta = b > r + 20 && b > g + 30;
  const esOro = r > 150 && g > 110 && b < 110 && r - b > 60;
  if (esVioleta || esOro) return [r, g, b];
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  // Rampa: tinta #1b1b1f → papel #f3ead8
  const t = l / 255;
  return [
    Math.round(27 + (243 - 27) * t),
    Math.round(27 + (234 - 27) * t),
    Math.round(31 + (216 - 31) * t),
  ];
}
