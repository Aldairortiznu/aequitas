import type { Tratamiento } from './texto/plantilla';
import { APELLIDO_PROTAGONISTA } from './texto/plantilla';
import type { ContextoTexto } from './texto/plantilla';

/**
 * Quien juega (decisión D10). La historia es siempre la de «Iriarte», hija o hijo de la
 * registradora; lo que se elige es el cuerpo, el nombre y el tratamiento gramatical.
 * En el contenido, el id de personaje `renata` designa a quien juega, sea cual sea su aspecto.
 */

export const PROTAGONISTA_ID = 'renata';

export type PresetId = 'renata' | 'ramiro' | 'ariel' | 'cruz';

export interface PresetProtagonista {
  id: PresetId;
  nombre: string;
  tratamiento: Tratamiento;
  /** Cómo se describe en el menú (una línea, sin adjetivos de género). */
  descripcion: string;
}

export const PRESETS: readonly PresetProtagonista[] = [
  {
    id: 'renata',
    nombre: 'Renata',
    tratamiento: 'f',
    descripcion: 'Moño apretado, morral cruzado, camisa violeta de la Biblioteca.',
  },
  {
    id: 'ramiro',
    nombre: 'Ramiro',
    tratamiento: 'm',
    descripcion: 'Pelo corto, barba de tres días, morral cruzado, camisa violeta.',
  },
  {
    id: 'ariel',
    nombre: 'Ariel',
    tratamiento: 'n',
    descripcion: 'Pelo rapado a los lados y largo arriba, gafas, camisa violeta.',
  },
  {
    id: 'cruz',
    nombre: 'Cruz',
    tratamiento: 'n',
    descripcion: 'Melena suelta, pañuelo al cuello, camisa violeta.',
  },
];

/** Parámetros del creador de personaje (piezas generadas por código; ver docs/arte). */
export interface LookPersonalizado {
  piel: 0 | 1 | 2 | 3;
  pelo: 'corto' | 'largo' | 'recogido' | 'calvo' | 'gris';
  colorPelo: string;
  camisa: string;
  pantalon: string;
  accesorio: 'morral' | 'panuelo' | 'gafas' | 'sombrero' | 'gorra' | 'ninguno';
}

export interface Jugador {
  preset: PresetId | 'custom';
  nombre: string;
  tratamiento: Tratamiento;
  custom?: LookPersonalizado;
}

export const JUGADOR_POR_DEFECTO: Jugador = {
  preset: 'renata',
  nombre: 'Renata',
  tratamiento: 'f',
};

export function jugadorDesdePreset(id: PresetId, nombre?: string): Jugador {
  const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0]!;
  return { preset: p.id, nombre: nombre?.trim() || p.nombre, tratamiento: p.tratamiento };
}

/** Contexto para expandir plantillas de texto. */
export function contextoDe(j: Jugador): ContextoTexto {
  return { nombre: j.nombre, apellido: APELLIDO_PROTAGONISTA, tratamiento: j.tratamiento };
}

/** Clave de textura del sprite de quien juega (contrato `char-<id>`). */
export function claveSprite(j: Jugador): string {
  return j.preset === 'custom' ? 'char-custom' : `char-${j.preset}`;
}

/** Id con el que se buscan retratos reales (`portraits/<id>-<expresion>.png`). */
export function idRetrato(j: Jugador): string {
  return j.preset === 'custom' ? 'custom' : j.preset;
}

export const ETIQUETA_TRATAMIENTO: Record<Tratamiento, string> = {
  f: 'Femenino (la jurista)',
  m: 'Masculino (el jurista)',
  n: 'Neutro (jurista, sin marcar género)',
};
