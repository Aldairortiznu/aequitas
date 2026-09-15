import type { Estilo } from './estilo';
import { ajustar } from './estilo';

/**
 * Dibujo de personajes por código, versión 2 (arte construido). Celda de 16×24; la figura
 * ocupa como máximo 14×22 dejando 1 px de margen para el contorno. Cuatro direcciones y
 * ciclo de andar de cuatro cuadros (quieto, paso izquierdo, quieto, paso derecho) con
 * balanceo de brazos y cabeceo. Sombreado por tonos según el estilo activo.
 */
export type Dir = 'down' | 'left' | 'right' | 'up';

export interface Figura {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  accent: string;
  cuerpo?: 'delgado' | 'medio' | 'grueso' | 'nino';
  ropa?: 'camisa' | 'vestido' | 'chaleco' | 'saco' | 'delantal' | 'bata';
  pelo?: 'corto' | 'largo' | 'recogido' | 'calvo' | 'gris' | 'rizado' | 'rapado' | 'melena';
  accesorio?:
    | 'morral'
    | 'panuelo'
    | 'gafas'
    | 'sombrero'
    | 'barba'
    | 'tunica'
    | 'gorra'
    | 'baston'
    | 'canasto'
    | 'llaves'
    | 'libreta';
}

type Ctx = CanvasRenderingContext2D;

const INK = '#1b1b1f';

interface Pincel {
  p: (x: number, y: number, c: string, w?: number, h?: number) => void;
}

/** Dibuja una figura en (ox, oy) de un contexto. */
export function dibujarFigura(
  ctx: Ctx,
  ox: number,
  oy: number,
  f: Figura,
  dir: Dir,
  frame: number,
  estilo: Estilo,
): void {
  // Se dibuja en un lienzo propio para poder calcular el contorno.
  const cv = document.createElement('canvas');
  cv.width = 16;
  cv.height = 24;
  const c = cv.getContext('2d')!;
  const pincel: Pincel = {
    p: (x, y, col, w = 1, h = 1) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    },
  };
  pintar(pincel, f, dir, frame, estilo);
  const img = c.getImageData(0, 0, 16, 24);
  if (estilo.contorno !== 'ninguno') contornear(img, estilo.contorno);
  c.putImageData(img, 0, 0);
  ctx.drawImage(cv, ox, oy);
}

function tono(hex: string, nivel: number, estilo: Estilo): string {
  // nivel: -2 sombra fuerte, -1 sombra, 0 base, 1 luz
  if (estilo.sombreado === 1) return hex;
  if (estilo.sombreado === 2) return nivel < 0 ? ajustar(hex, 0.72) : hex;
  return nivel <= -2
    ? ajustar(hex, 0.55)
    : nivel === -1
      ? ajustar(hex, 0.74)
      : nivel === 1
        ? ajustar(hex, 1.22)
        : hex;
}

function pintar(b: Pincel, f: Figura, dir: Dir, frame: number, estilo: Estilo): void {
  const cuerpo = f.cuerpo ?? 'medio';
  const nino = cuerpo === 'nino';
  const cabezon = estilo.proporcion === 'cabezon';
  const flip = dir === 'left';
  // Espejo horizontal para la vista izquierda (dentro de 16 px).
  const X = (x: number, w = 1): number => (flip ? 16 - x - w : x);
  const P = (x: number, y: number, col: string, w = 1, h = 1): void => b.p(X(x, w), y, col, w, h);

  const paso = frame === 1 ? 1 : frame === 3 ? -1 : 0; // pierna izquierda adelante / derecha
  const bob = paso === 0 ? 0 : 1; // cabeceo al andar

  // --- Medidas por proporción y cuerpo
  const headH = nino ? 6 : cabezon ? 7 : 6;
  const headW = cabezon ? 8 : 6;
  const torsoW = cuerpo === 'delgado' ? 6 : cuerpo === 'grueso' ? 10 : nino ? 6 : 8;
  const torsoH = nino ? 5 : cabezon ? 6 : 7;
  const legH = nino ? 4 : cabezon ? 6 : 7;
  const total = 1 + headH + 1 + torsoH + legH + 1; // + sombra
  const top = 23 - total + 1 + (nino ? 0 : 0); // pies en la fila 22-23
  const headY = top + bob;
  const neckY = headY + headH;
  const torsoY = neckY + 1;
  const legY = torsoY + torsoH;
  const cx = 8; // centro
  const headX = cx - headW / 2;
  const torsoX = cx - torsoW / 2;

  const skin = f.skin;
  const skinS = tono(skin, -1, estilo);
  const hair = f.hair;
  const hairL = tono(hair, 1, estilo);
  const hairS = tono(hair, -1, estilo);
  const topC = f.top;
  const topS = tono(topC, -1, estilo);
  const topL = tono(topC, 1, estilo);
  const bot = f.bottom;
  const botS = tono(bot, -1, estilo);
  const shoe = tono(bot, -2, estilo);

  // --- Sombra en el suelo
  b.p(cx - 4, 22, 'rgba(0,0,0,0.28)', 8, 2);

  // --- Piernas
  const legW = cuerpo === 'grueso' ? 3 : 2;
  const gap = cuerpo === 'grueso' ? 1 : torsoW >= 8 ? 2 : 1;
  const lx1 = cx - gap / 2 - legW - (gap % 2 ? 0 : 0);
  const lx2 = cx + gap / 2;
  const leftLegX = Math.round(lx1);
  const rightLegX = Math.round(lx2);
  const ropa = f.ropa ?? (f.accesorio === 'tunica' ? 'bata' : 'camisa');
  const falda = ropa === 'vestido' || ropa === 'bata';
  if (dir === 'down' || dir === 'up') {
    // Vista frontal/trasera: las piernas se alternan en longitud (una adelante = más larga)
    const l1 = legH - (paso === -1 ? 1 : 0);
    const l2 = legH - (paso === 1 ? 1 : 0);
    P(leftLegX, legY, bot, legW, l1);
    P(rightLegX, legY, bot, legW, l2);
    P(rightLegX + legW - 1, legY, botS, 1, l2); // sombra lado derecho
    // zapatos
    P(leftLegX, legY + l1 - 1, shoe, legW, 1);
    P(rightLegX, legY + l2 - 1, shoe, legW, 1);
  } else {
    // Perfil: zancada horizontal
    const stride = paso * 2;
    const backX = cx - legW + (paso === 0 ? 0 : -stride);
    const frontX = cx - 1 + (paso === 0 ? 0 : stride);
    P(backX, legY, botS, legW, legH);
    P(frontX, legY, bot, legW, legH);
    P(backX, legY + legH - 1, shoe, legW + (paso ? 1 : 0), 1);
    P(frontX, legY + legH - 1, shoe, legW + (paso ? 1 : 0), 1);
  }

  // --- Torso
  if (dir === 'left' || dir === 'right') {
    const w = Math.max(4, torsoW - 2);
    const x = cx - w / 2;
    P(x, torsoY, topC, w, torsoH);
    P(x + w - 2, torsoY, topS, 2, torsoH);
    if (ropa === 'saco') P(x, torsoY + torsoH - 1, topS, w, 2);
    if (ropa === 'chaleco') P(x + 1, torsoY, f.accent, w - 2, torsoH - 1);
    if (ropa === 'delantal') P(x + 1, torsoY + 2, f.accent, w - 2, torsoH - 2);
    if (falda) P(x - 1, legY, topC, w + 2, Math.max(2, legH - 2));
    // brazo (uno visible), balancea al contrario de la pierna delantera
    const swing = paso;
    P(x + w - 2, torsoY + 1 + Math.abs(swing), skin, 1, torsoH - 2);
    P(x + w - 2 + (swing > 0 ? 1 : 0), torsoY + torsoH - 2 + Math.abs(swing), skinS, 1, 1);
  } else {
    P(torsoX, torsoY, topC, torsoW, torsoH);
    P(torsoX + torsoW - 2, torsoY, topS, 2, torsoH); // sombra derecha
    P(torsoX + 1, torsoY, topL, 1, torsoH); // luz izquierda
    if (dir === 'down') {
      // cuello de camisa
      P(cx - 2, torsoY, tono(topC, 1, estilo), 4, 1);
      P(cx, torsoY, topS, 1, 2);
      if (ropa === 'chaleco') {
        P(torsoX + 1, torsoY + 1, f.accent, 2, torsoH - 1);
        P(torsoX + torsoW - 3, torsoY + 1, f.accent, 2, torsoH - 1);
      }
      if (ropa === 'delantal') P(cx - 2, torsoY + 2, f.accent, 4, torsoH - 2);
      if (ropa === 'saco') P(cx - 3, torsoY, topS, 1, torsoH);
      if (ropa === 'saco') P(cx + 2, torsoY, topS, 1, torsoH);
    }
    if (falda) {
      P(torsoX - 1, legY, topC, torsoW + 2, Math.max(2, legH - 2));
      P(torsoX + torsoW - 1, legY, topS, 2, Math.max(2, legH - 2));
    }
    // brazos a los lados, balanceo opuesto a las piernas
    const armLen = torsoH - 2;
    const a1 = paso === 1 ? 1 : 0;
    const a2 = paso === -1 ? 1 : 0;
    P(torsoX - 1, torsoY + 1 + a2, skin, 1, armLen);
    P(torsoX + torsoW, torsoY + 1 + a1, skinS, 1, armLen);
    if (cuerpo === 'grueso') P(torsoX + 2, torsoY + torsoH - 2, topS, torsoW - 4, 1); // barriga
  }

  // --- Cabeza
  const hx = flip ? 16 - headX - headW : headX;
  if (dir === 'up') {
    b.p(hx, headY, skin, headW, headH);
    b.p(hx + headW - 1, headY, skinS, 1, headH);
  } else if (dir === 'down') {
    b.p(hx, headY, skin, headW, headH);
    b.p(hx + headW - 1, headY + 1, skinS, 1, headH - 1);
    b.p(hx, headY + headH - 1, skinS, headW, 1);
  } else {
    // perfil: cara ligeramente hacia delante con nariz
    const w = headW - 1;
    const px = flip ? 16 - headX - headW : headX + 1;
    b.p(px, headY, skin, w, headH);
    b.p(flip ? px : px + w - 1, headY + 1, skinS, 1, headH - 1);
    // nariz
    b.p(flip ? px - 1 : px + w, headY + 3, skin, 1, 1);
  }

  // --- Pelo
  const pelo = f.pelo ?? 'corto';
  const hw = headW;
  if (pelo !== 'calvo') {
    if (dir === 'up') {
      b.p(hx, headY, hair, hw, headH - 1);
      b.p(hx + 1, headY, hairL, hw - 2, 1);
      if (pelo === 'recogido') b.p(hx + hw / 2 - 1, headY + 2, hairS, 2, 2);
      if (pelo === 'largo' || pelo === 'melena') b.p(hx, headY + headH - 1, hair, hw, 3);
      if (pelo === 'rapado') {
        b.p(hx, headY + 1, skin, hw, headH - 2);
        b.p(hx + 1, headY, hair, hw - 2, 2);
      }
    } else if (dir === 'down') {
      b.p(hx, headY, hair, hw, 2);
      b.p(hx, headY + 1, hair, 1, 2);
      b.p(hx + hw - 1, headY + 1, hair, 1, 2);
      b.p(hx + 1, headY, hairL, hw - 3, 1);
      if (pelo === 'largo' || pelo === 'melena') {
        b.p(hx, headY + 1, hair, 1, headH);
        b.p(hx + hw - 1, headY + 1, hair, 1, headH);
        if (pelo === 'melena') {
          b.p(hx - 1, headY + 2, hair, 1, headH - 1);
          b.p(hx + hw, headY + 2, hairS, 1, headH - 1);
        }
      }
      if (pelo === 'rizado') {
        b.p(hx - 1, headY, hair, hw + 2, 3);
        b.p(hx, headY - 1, hair, hw, 1);
        b.p(hx + 1, headY, hairS, 1, 1);
        b.p(hx + hw - 2, headY + 1, hairS, 1, 1);
      }
      if (pelo === 'rapado') {
        b.p(hx, headY, skin, hw, 2);
        b.p(hx + 1, headY - 1, hair, hw - 2, 2);
      }
    } else {
      const px = flip ? 16 - headX - headW : headX + 1;
      const w = headW - 1;
      b.p(px, headY, hair, w, 2);
      b.p(flip ? px + w - 1 : px, headY, hair, 1, headH - 2); // nuca
      b.p(px + 1, headY, hairL, w - 2, 1);
      if (pelo === 'recogido') b.p(flip ? px + w : px - 1, headY + 2, hair, 1, 2);
      if (pelo === 'largo' || pelo === 'melena')
        b.p(flip ? px + w - 1 : px, headY + 2, hair, pelo === 'melena' ? 2 : 1, headH + 1);
      if (pelo === 'rizado') {
        b.p(px - 1, headY - 1, hair, w + 2, 3);
        b.p(flip ? px + w : px - 1, headY + 2, hair, 1, 3);
      }
      if (pelo === 'rapado') {
        b.p(px, headY, skin, w, 2);
        b.p(px + 1, headY - 1, hair, w - 2, 2);
      }
    }
  } else {
    // calvo: pelo a los lados
    if (dir !== 'up') {
      b.p(hx, headY + 2, hair, 1, 2);
      b.p(hx + hw - 1, headY + 2, hair, 1, 2);
    } else {
      b.p(hx, headY + 1, hair, hw, 2);
    }
  }

  // --- Cara
  const eyeY = headY + (cabezon ? 4 : 3);
  if (dir === 'down') {
    const e1 = hx + (cabezon ? 2 : 1);
    const e2 = hx + hw - (cabezon ? 3 : 2);
    b.p(e1, eyeY, INK);
    b.p(e2, eyeY, INK);
    b.p(cx - 1, headY + headH - 2, tono(skin, -2, estilo), 2, 1); // boca
    if (f.accesorio === 'gafas') {
      b.p(e1 - 1, eyeY, f.accent === skin ? INK : '#1b1b1f', 3, 1);
      b.p(e2 - 1, eyeY, '#1b1b1f', 3, 1);
      b.p(e1, eyeY, '#8fe0de');
      b.p(e2, eyeY, '#8fe0de');
    }
    if (f.accesorio === 'barba') b.p(hx + 1, headY + headH - 2, hair, hw - 2, 2);
  } else if (dir !== 'up') {
    const px = flip ? 16 - headX - headW : headX + 1;
    const w = headW - 1;
    const ex = flip ? px + 1 : px + w - 2;
    b.p(ex, eyeY, INK);
    if (f.accesorio === 'gafas') b.p(flip ? ex - 1 : ex, eyeY, '#1b1b1f', 2, 1);
    if (f.accesorio === 'barba') b.p(px, headY + headH - 2, hair, w, 2);
  }

  // --- Accesorios de cabeza
  if (f.accesorio === 'panuelo') {
    b.p(hx - 1, headY, f.accent, hw + 2, 2);
    if (dir !== 'down') b.p(flip ? hx - 1 : hx + hw, headY + 2, f.accent, 1, 3);
  }
  if (f.accesorio === 'sombrero') {
    b.p(hx - 2, headY, tono(f.accent, -1, estilo), hw + 4, 1);
    b.p(hx, headY - 2, f.accent, hw, 2);
  }
  if (f.accesorio === 'gorra') {
    b.p(hx, headY - 1, f.accent, hw, 2);
    if (dir === 'down') b.p(hx - 1, headY + 1, tono(f.accent, -1, estilo), hw + 2, 1);
    else if (dir !== 'up')
      b.p(flip ? hx - 2 : hx + hw, headY + 1, tono(f.accent, -1, estilo), 2, 1);
  }

  // --- Accesorios de cuerpo
  if (f.accesorio === 'morral') {
    if (dir === 'down') {
      // correa cruzada y bolso a la cadera
      for (let i = 0; i < torsoH; i++)
        b.p(torsoX + torsoW - 3 - Math.floor(i / 2), torsoY + i, f.accent);
      b.p(torsoX - 1, legY - 2, tono(f.accent, -1, estilo), 3, 3);
    } else if (dir === 'up') {
      for (let i = 0; i < torsoH; i++) b.p(torsoX + 2 + Math.floor(i / 2), torsoY + i, f.accent);
    } else {
      const w = Math.max(4, torsoW - 2);
      const x = cx - w / 2;
      P(x + 1, torsoY, f.accent, 1, torsoH);
      P(x - 1, legY - 3, tono(f.accent, -1, estilo), 3, 3);
    }
  }
  if (f.accesorio === 'canasto' && dir !== 'up') P(torsoX + torsoW, legY - 3, '#b5773f', 3, 3);
  if (f.accesorio === 'baston' && dir !== 'up')
    P(torsoX + torsoW + 1, torsoY + 1, '#7a4b2d', 1, legH + torsoH - 1);
  if (f.accesorio === 'llaves' && dir === 'down') {
    b.p(torsoX + torsoW - 2, legY - 1, '#e2b94a', 1, 1);
    b.p(torsoX + torsoW - 1, legY, '#e2b94a', 1, 1);
  }
  if (f.accesorio === 'libreta' && dir !== 'up') P(torsoX - 2, torsoY + 2, '#f3ead8', 2, 3);
}

/** Contorno de 1 px alrededor de la silueta: negro, o el color vecino oscurecido. */
function contornear(img: ImageData, modo: 'negro' | 'oscuro'): void {
  const { data, width, height } = img;
  const alpha = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= width || y >= height ? 0 : data[(y * width + x) * 4 + 3]!;
  const marcados: [number, number, number, number, number][] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3]! !== 0) continue;
      // ¿Toca un píxel opaco? (4 vecinos)
      const vecinos: [number, number][] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      const v = vecinos.find(([vx, vy]) => alpha(vx, vy) > 60);
      if (!v) continue;
      const j = (v[1] * width + v[0]) * 4;
      // La sombra del suelo (semitransparente) no se contornea.
      if (data[j + 3]! < 200) continue;
      if (modo === 'negro') marcados.push([x, y, 27, 27, 31]);
      else
        marcados.push([
          x,
          y,
          Math.round(data[j]! * 0.45),
          Math.round(data[j + 1]! * 0.45),
          Math.round(data[j + 2]! * 0.5),
        ]);
    }
  for (const [x, y, r, g, b] of marcados) {
    const i = (y * width + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
}
