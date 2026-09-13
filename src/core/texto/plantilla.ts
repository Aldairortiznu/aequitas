/**
 * Plantillas de texto (lógica pura). El contenido escribe con marcas y el juego las
 * resuelve según quien juega:
 *
 *   {nombre}            → nombre de pila elegido («Renata», «Ramiro», «Ariel»…)
 *   {apellido}          → siempre «Iriarte» (la trama lo exige)
 *   {nombreCompleto}    → «Renata Iriarte»
 *   {fem|masc|neutro}   → una de tres formas según el tratamiento: femenino, masculino o
 *                         neutro. La forma neutra se escribe con palabras realmente neutras
 *                         («joven», «jurista», «quien viene de la Biblioteca»), no con -e.
 *
 * Ejemplo: «Mire, {señorita|señor|joven}: la de la Biblioteca» →
 *          «Mire, {señorita|señor|joven}: {la|el|quien viene} de la Biblioteca».
 */

export type Tratamiento = 'f' | 'm' | 'n';

export interface ContextoTexto {
  nombre: string;
  apellido: string;
  tratamiento: Tratamiento;
}

export const APELLIDO_PROTAGONISTA = 'Iriarte';

const VARIABLES = new Set(['nombre', 'apellido', 'nombreCompleto']);
const MARCA = /\{([^{}]*)\}/g;

const indice: Record<Tratamiento, number> = { f: 0, m: 1, n: 2 };

/** Resuelve todas las marcas de un texto. Marcas desconocidas se dejan tal cual. */
export function expandir(texto: string, ctx: ContextoTexto): string {
  if (!texto.includes('{')) return texto;
  return texto.replace(MARCA, (todo, cuerpo: string) => {
    if (cuerpo.includes('|')) {
      const partes = cuerpo.split('|');
      if (partes.length !== 3) return todo;
      return partes[indice[ctx.tratamiento]] ?? '';
    }
    switch (cuerpo) {
      case 'nombre':
        return ctx.nombre;
      case 'apellido':
        return ctx.apellido;
      case 'nombreCompleto':
        return `${ctx.nombre} ${ctx.apellido}`.trim();
      default:
        return todo;
    }
  });
}

/** Expande recursivamente todas las cadenas de un objeto JSON (copia). */
export function expandirObjeto<T>(valor: T, ctx: ContextoTexto): T {
  if (typeof valor === 'string') return expandir(valor, ctx) as unknown as T;
  if (Array.isArray(valor)) return valor.map((v) => expandirObjeto(v, ctx)) as unknown as T;
  if (valor && typeof valor === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>))
      out[k] = expandirObjeto(v, ctx);
    return out as T;
  }
  return valor;
}

/**
 * Problemas de sintaxis en un texto: llaves sin cerrar, variables desconocidas, formas con
 * un número de partes distinto de tres. Lo usa el validador de contenido.
 */
export function problemasDePlantilla(texto: string): string[] {
  const problemas: string[] = [];
  const abre = (texto.match(/\{/g) ?? []).length;
  const cierra = (texto.match(/\}/g) ?? []).length;
  if (abre !== cierra) problemas.push('llaves desbalanceadas');
  for (const m of texto.matchAll(MARCA)) {
    const cuerpo = m[1] ?? '';
    if (cuerpo.includes('|')) {
      const n = cuerpo.split('|').length;
      if (n !== 3)
        problemas.push(`«{${cuerpo}}» debe tener tres formas (femenino|masculino|neutro)`);
    } else if (!VARIABLES.has(cuerpo)) {
      problemas.push(`variable desconocida «{${cuerpo}}»`);
    }
  }
  return problemas;
}

/** ¿El texto contiene alguna marca? */
export function tieneMarcas(texto: string): boolean {
  return MARCA.test(texto) && ((MARCA.lastIndex = 0), true);
}
