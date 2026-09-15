import { MapBuilder, SOLIDOS, T } from './lib';

/**
 * Franjas: mapas en vista lateral (decisión D15). Misma salida Tiled y mismos objetos que
 * los mapas cenitales; cambia la geometría: el suelo es una fila, los pisos son losas, se
 * sube por escaleras y las puertas se abren con la acción. La fila de un objeto (`ty`) es
 * la celda que ocupa el personaje con los pies en el borde inferior, es decir, la fila
 * inmediatamente superior a la losa en la que está parado.
 *
 * Convención de altura: mapas de 17 filas (272 px) para una sola planta, con el suelo en la
 * fila 14; cada planta adicional añade 7 filas por arriba.
 */
export const FILA_SUELO = 14;

export class Franja extends MapBuilder {
  constructor(w: number, h: number, tileset: string, props: Record<string, string>) {
    super(w, h, -1, tileset);
    this.props = { ...props, lateral: 'true' };
  }

  /** Terreno de toda la franja: fila `y` con el tile de superficie y relleno debajo. */
  terreno(y = FILA_SUELO, superficie: number = T.suelo, relleno: number = T.muro): this {
    for (let x = 0; x < this.w; x++) {
      this.deco(x, y, superficie, true);
      for (let yy = y + 1; yy < this.h; yy++) this.deco(x, yy, relleno, true);
    }
    return this;
  }

  /** Losa horizontal sólida (piso de una planta, plataforma). */
  losa(x0: number, x1: number, y: number, t: number = T.muroRemate): this {
    for (let x = x0; x <= x1; x++) this.deco(x, y, t, true);
    return this;
  }

  /** Muro vertical sólido. */
  muro(x: number, y0: number, y1: number, t: number = T.muro): this {
    for (let y = y0; y <= y1; y++) this.deco(x, y, t, true);
    return this;
  }

  /** Bloque sólido relleno. */
  bloque(x0: number, y0: number, x1: number, y1: number, t: number = T.muro): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.deco(x, y, t, true);
    return this;
  }

  /** Escalera de mano entre `y0` (arriba) y `y1` (abajo), no sólida; el motor pone la
   *  plataforma de un solo sentido en el tramo superior. Abre el hueco en la losa de arriba. */
  escalera(x: number, y0: number, y1: number): this {
    for (let y = y0; y <= y1; y++) {
      this.decoBaja[y * this.w + x] = T.escalera + 1;
      this.colision[y * this.w + x] = 0;
    }
    return this;
  }

  /** Quita sólidos (hueco en una losa). */
  hueco(x0: number, x1: number, y: number): this {
    for (let x = x0; x <= x1; x++) {
      this.colision[y * this.w + x] = 0;
      this.decoBaja[y * this.w + x] = 0;
    }
    return this;
  }

  /** Decorado no sólido (plantas, ventanas, carteles, tuberías) sobre el plano de fondo. */
  planta(x: number, y: number, t: number): this {
    return this.deco(x, y, t, false);
  }

  /** Decorado sólido pequeño (barril, mesa, escombro): se pisa y bloquea. */
  bulto(x: number, y: number, t: number): this {
    return this.deco(x, y, t, true);
  }

  /** Tiles de pared de fondo (capa suelo), para interiores con textura propia. */
  pared(x0: number, y0: number, x1: number, y1: number, t: number): this {
    return this.groundRect(x0, y0, x1, y1, t);
  }

  /** Agua a ras de suelo: sólida (no se nada), con orilla. */
  agua(x0: number, x1: number, y: number): this {
    for (let x = x0; x <= x1; x++) {
      this.deco(x, y, T.agua, true);
      for (let yy = y + 1; yy < this.h; yy++) this.deco(x, yy, T.agua, true);
    }
    return this;
  }

  /** Puerta en la pared de fondo: dibuja el tile y crea el objeto puerta (se abre con E/A). */
  puerta(
    name: string,
    x: number,
    y: number,
    mapa: string,
    spawn: string,
    extra: Record<string, string> = {},
  ): this {
    this.planta(x, y - 1, T.puerta);
    this.planta(x, y, T.puerta);
    return this.door(name, x, y, mapa, spawn, extra);
  }

  /** Cartel de pared con texto (letrero) en la fila indicada. */
  cartel(name: string, x: number, y: number, texto: string): this {
    this.planta(x, y, T.cartel);
    return this.obj(name, 'letrero', x, y, { texto });
  }

  /** En una franja nada del mobiliario bloquea el paso: atril, mesa y letrero no son sólidos. */
  override atril(name: string, tx: number, ty: number): this {
    this.planta(tx, ty, T.atril);
    return this.obj(name, 'atril', tx, ty);
  }

  override mesa(
    name: string,
    tx: number,
    ty: number,
    pacto?: string,
    gate?: { requiereFlag: string; textoBloqueo?: string },
  ): this {
    this.planta(tx, ty, T.mesa);
    const props: Record<string, string> = {};
    if (pacto) props.pacto = pacto;
    if (gate) {
      props.requiereFlag = gate.requiereFlag;
      if (gate.textoBloqueo) props.textoBloqueo = gate.textoBloqueo;
    }
    return this.obj(name, 'mesa', tx, ty, props);
  }

  override letrero(name: string, tx: number, ty: number, texto: string): this {
    return this.cartel(name, tx, ty, texto);
  }

  /** Vegetación densa a lo largo del suelo, alternando arbustos, huertas y enredaderas. */
  maleza(x0: number, x1: number, y: number, cada = 3, semilla = 1): this {
    let k = semilla;
    for (let x = x0; x <= x1; x += cada) {
      k = (k * 9301 + 49297) % 233280;
      const r = k / 233280;
      const t = r < 0.5 ? T.arbusto : r < 0.8 ? T.enredadera : T.huerta;
      this.planta(x, y, t);
      if (r > 0.65) this.decoEn('floracion', x, y - 1, T.margarita);
      if (r > 0.35) this.decoEn('verdor', x, y - 1, T.enredadera);
    }
    return this;
  }
}

export { SOLIDOS };
