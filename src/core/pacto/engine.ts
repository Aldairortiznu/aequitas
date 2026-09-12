import { BALANCE } from '../balance';
import type { Clausula, Pacto, Punto } from '../content/schema';

/**
 * Motor de la Conciliación (Pacto): evaluación del Equilibrio y redacción del acta.
 * docs/design/03-mecanicas.md §5. Lógica pura.
 */

const B = BALANCE.pacto;

export type Resultado = 'ejemplar' | 'solido' | 'fragil' | 'sin-acuerdo';

export interface Evaluacion {
  completo: boolean;
  equilibrio: number;
  desglose: { legalidad: number; intereses: number; justicia: number; bono: number };
  nulasFirmadas: { punto: string; clausula: string; norma: string; explicacion: string }[];
  nulasDetectadas: string[];
  falsasNulas: string[];
  resultado: Resultado;
  interesesPorParte: Record<string, number>;
}

export function clausulaDe(def: Pacto, puntoId: string, clausulaId: string): Clausula | undefined {
  return def.puntos.find((p) => p.id === puntoId)?.clausulas.find((c) => c.id === clausulaId);
}

export function puntoDe(def: Pacto, puntoId: string): Punto | undefined {
  return def.puntos.find((p) => p.id === puntoId);
}

export function resultadoPara(equilibrio: number): Resultado {
  if (equilibrio >= B.umbralEjemplar) return 'ejemplar';
  if (equilibrio >= B.umbralSolido) return 'solido';
  if (equilibrio >= B.umbralFragil) return 'fragil';
  return 'sin-acuerdo';
}

/**
 * @param elegidas cláusula elegida por punto
 * @param marcadasNulas ids de cláusulas que el jugador marcó como nulas (control de legalidad)
 */
export function evaluate(
  def: Pacto,
  elegidas: Record<string, string>,
  marcadasNulas: string[],
): Evaluacion {
  const puntos = def.puntos;
  const chosen = puntos.map((p) => ({
    punto: p,
    clausula: elegidas[p.id] ? p.clausulas.find((c) => c.id === elegidas[p.id]) : undefined,
  }));
  const completo = chosen.every((c) => c.clausula !== undefined);
  const partes = def.partes.map((p) => p.id);

  const nulasFirmadas = chosen
    .filter((c) => c.clausula && !c.clausula.legal)
    .map((c) => ({
      punto: c.punto.id,
      clausula: c.clausula!.id,
      norma: c.clausula!.nula?.norma ?? '',
      explicacion: c.clausula!.nula?.explicacion ?? '',
    }));

  const todas = puntos.flatMap((p) => p.clausulas);
  const nulasDetectadas = marcadasNulas.filter(
    (id) => todas.find((c) => c.id === id)?.legal === false,
  );
  const falsasNulas = marcadasNulas.filter((id) => todas.find((c) => c.id === id)?.legal === true);

  const legalidad = Math.max(0, B.pesoLegalidad - nulasFirmadas.length * B.penalizacionNula);

  const interesesPorParte: Record<string, number> = Object.fromEntries(partes.map((p) => [p, 0]));
  let suma = 0;
  for (const c of chosen) {
    if (!c.clausula) continue;
    for (const p of partes) {
      const v = c.clausula.intereses[p] ?? 0;
      interesesPorParte[p] = (interesesPorParte[p] ?? 0) + v;
      suma += v;
    }
  }
  const n = chosen.filter((c) => c.clausula).length;
  const rango = 2 * n * Math.max(1, partes.length);
  const intereses = n === 0 ? 0 : Math.round(((suma + rango) / (2 * rango)) * B.pesoIntereses);

  const justiciaMedia =
    n === 0 ? 0 : chosen.reduce((acc, c) => acc + (c.clausula?.justicia ?? 0), 0) / n;
  const justicia = Math.round((justiciaMedia / 3) * B.pesoJusticia);

  const bono = Math.min(nulasDetectadas.length * B.bonoNulaDetectada, 15);
  const equilibrio = completo
    ? Math.max(0, Math.min(100, legalidad + intereses + justicia + bono))
    : 0;

  return {
    completo,
    equilibrio,
    desglose: { legalidad, intereses, justicia, bono },
    nulasFirmadas,
    nulasDetectadas,
    falsasNulas,
    resultado: completo ? resultadoPara(equilibrio) : 'sin-acuerdo',
    interesesPorParte,
  };
}

/** Redacta el acta en prosa a partir de las cláusulas elegidas. */
export function renderActa(
  def: Pacto,
  elegidas: Record<string, string>,
  fecha: string,
  relatora: string,
): string {
  const lineas: string[] = [];
  lineas.push(def.titulo.toUpperCase());
  lineas.push(fecha);
  lineas.push('');
  lineas.push(def.acta.encabezado);
  lineas.push('');
  def.puntos.forEach((p, i) => {
    const c = elegidas[p.id] ? p.clausulas.find((x) => x.id === elegidas[p.id]) : undefined;
    lineas.push(`${i + 1}. ${p.pregunta}`);
    lineas.push(c ? `   ${c.textoActa}` : '   (sin acuerdo)');
    lineas.push('');
  });
  lineas.push(def.acta.cierre);
  lineas.push('');
  lineas.push(`Partes: ${def.partes.map((p) => p.nombre).join(', ')}.`);
  lineas.push(`Relatora: ${relatora}.`);
  return lineas.join('\n');
}
