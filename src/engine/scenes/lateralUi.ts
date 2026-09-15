/**
 * Interfaz DOM de la prueba lateral (?escena=lateral): barra superior con objetivo y
 * cifras, caja de mensajes, mando táctil y pantalla final. Va en DOM, como el resto de la
 * interfaz del juego, para que el texto sea legible en el teléfono.
 */
export type BotonLateral = 'left' | 'right' | 'jump' | 'a';

const CSS = `
.lat{position:fixed;inset:0;pointer-events:none;z-index:40;color:#f3ead8;
  font-family:"Atkinson Hyperlegible","Segoe UI",system-ui,sans-serif}
.lat__top{display:flex;flex-wrap:wrap;gap:4px 16px;align-items:baseline;padding:6px 12px;
  background:rgba(27,27,31,.78);border-bottom:1px solid rgba(226,185,74,.5);font-size:13px}
.lat__titulo{font-family:"Courier Prime","Courier New",monospace;letter-spacing:.08em;
  text-transform:uppercase;color:#e2b94a;font-size:11px}
.lat__obj{flex:1 1 240px}
.lat__stats{font-variant-numeric:tabular-nums;color:#a29ea8}
.lat__msg{position:absolute;left:50%;transform:translateX(-50%);bottom:112px;
  max-width:min(640px,92vw);background:rgba(27,27,31,.94);border:1px solid #e2b94a;
  padding:10px 14px;font-size:15px;line-height:1.35;border-radius:2px}
.lat__pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;
  padding:12px 14px;gap:10px}
.lat__grupo{display:flex;gap:10px}
.lat__pad button{pointer-events:auto;width:64px;height:64px;border-radius:14px;
  background:rgba(27,27,31,.6);border:1px solid rgba(243,234,216,.6);color:#f3ead8;
  font-size:22px;touch-action:none;user-select:none;-webkit-user-select:none}
.lat__pad button:active{background:rgba(90,63,134,.8)}
.lat__fin{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:rgba(27,27,31,.72);text-align:center;font-size:17px;line-height:1.5;padding:24px;
  pointer-events:auto}
.lat__fin b{color:#e2b94a}
`;

export class LateralUi {
  readonly presionado: Record<BotonLateral, boolean> = {
    left: false,
    right: false,
    jump: false,
    a: false,
  };
  private root: HTMLDivElement;
  private obj: HTMLSpanElement;
  private stats: HTMLSpanElement;
  private msg: HTMLDivElement;
  private fin: HTMLDivElement;
  private msgTimer: number | undefined;

  constructor(tactil: boolean) {
    if (!document.getElementById('lat-css')) {
      const st = document.createElement('style');
      st.id = 'lat-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    this.root = document.createElement('div');
    this.root.className = 'lat';
    this.root.innerHTML = `
      <div class="lat__top">
        <span class="lat__titulo">Prueba lateral · La torre de Altamar</span>
        <span class="lat__obj" data-obj></span>
        <span class="lat__stats" data-stats>0:00 · 0 saltos · 0 caídas</span>
      </div>
      <div class="lat__msg" data-msg hidden></div>
      <div class="lat__pad" data-pad hidden>
        <div class="lat__grupo">
          <button type="button" data-b="left" aria-label="Izquierda">◀</button>
          <button type="button" data-b="right" aria-label="Derecha">▶</button>
        </div>
        <div class="lat__grupo">
          <button type="button" data-b="a" aria-label="Hablar o recoger">E</button>
          <button type="button" data-b="jump" aria-label="Saltar">▲</button>
        </div>
      </div>
      <div class="lat__fin" data-fin hidden></div>`;
    document.body.appendChild(this.root);
    this.obj = this.root.querySelector('[data-obj]') as HTMLSpanElement;
    this.stats = this.root.querySelector('[data-stats]') as HTMLSpanElement;
    this.msg = this.root.querySelector('[data-msg]') as HTMLDivElement;
    this.fin = this.root.querySelector('[data-fin]') as HTMLDivElement;
    const pad = this.root.querySelector('[data-pad]') as HTMLDivElement;
    pad.hidden = !tactil;
    for (const b of Array.from(pad.querySelectorAll<HTMLButtonElement>('button[data-b]'))) {
      const id = b.dataset.b as BotonLateral;
      const on = (ev: PointerEvent): void => {
        ev.preventDefault();
        b.setPointerCapture(ev.pointerId);
        this.presionado[id] = true;
      };
      const off = (): void => {
        this.presionado[id] = false;
      };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('lostpointercapture', off);
      b.addEventListener('contextmenu', (ev) => ev.preventDefault());
    }
  }

  objetivo(texto: string): void {
    this.obj.textContent = texto;
  }

  cifras(texto: string): void {
    this.stats.textContent = texto;
  }

  mostrar(texto: string, ms: number): void {
    this.msg.textContent = texto;
    this.msg.hidden = false;
    if (this.msgTimer) window.clearTimeout(this.msgTimer);
    this.msgTimer = window.setTimeout(() => {
      this.msg.hidden = true;
    }, ms);
  }

  terminar(html: string): void {
    this.msg.hidden = true;
    this.fin.innerHTML = html;
    this.fin.hidden = false;
  }

  destruir(): void {
    if (this.msgTimer) window.clearTimeout(this.msgTimer);
    this.root.remove();
  }
}
