import { getBus } from '../../core/bus';
import type { MapState } from '../../core/content/schema';

/**
 * Audio procedural (E10), sin archivos: efectos y música por capas con Web Audio.
 * Heredado en espíritu del sintetizador del prototipo. Cuando existan pistas reales en
 * assets/audio/ se reproducirán en su lugar (misma interfaz).
 *
 * Música: cada región tiene un «carácter» (tónica, escala, tempo). Tres capas que entran
 * con los hitos de Legitimidad: base (acorde sostenido), ritmo (tambora y llamador
 * sintetizados en patrón de cumbia) y melodía (gaita: arpegio pentatónico).
 */

type SfxName =
  | 'tecla'
  | 'seleccion'
  | 'confirmar'
  | 'cancelar'
  | 'plena'
  | 'parcial'
  | 'fallida'
  | 'firma'
  | 'hito'
  | 'detencion'
  | 'evidencia'
  | 'codice';

interface Caracter {
  tonica: number; // Hz
  escala: number[]; // semitonos
  tempo: number; // BPM
  brillo: number; // 0..1
}

const CARACTERES: Record<string, Caracter> = {
  biblioteca: { tonica: 196.0, escala: [0, 2, 4, 7, 9], tempo: 78, brillo: 0.5 },
  gym: { tonica: 220.0, escala: [0, 3, 5, 7, 10], tempo: 92, brillo: 0.4 },
  cienaga: { tonica: 196.0, escala: [0, 2, 4, 7, 9], tempo: 80, brillo: 0.6 },
  altamar: { tonica: 174.6, escala: [0, 3, 5, 7, 10], tempo: 96, brillo: 0.3 },
  audiencia: { tonica: 164.8, escala: [0, 2, 3, 7, 8], tempo: 70, brillo: 0.2 },
  pacto: { tonica: 196.0, escala: [0, 4, 7, 11, 14], tempo: 60, brillo: 0.7 },
};

const LAYERS_BY_STATE: Record<MapState, number> = { ceniza: 1, brote: 2, verdor: 3, floracion: 3 };

class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private volumen = 0.8;
  private enabled = true;
  private pista: string | null = null;
  private capas = 1;
  private timer: number | null = null;
  private nextBeat = 0;
  private beatIndex = 0;

  init(): boolean {
    if (this.ctx) return true;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volumen;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.master);
      return true;
    } catch {
      return false;
    }
  }

  resume(): void {
    if (!this.init() || !this.ctx) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.pista && this.timer === null) this.startScheduler();
  }

  setVolume(v: number): void {
    this.volumen = Math.max(0, Math.min(1, v));
    if (this.master) this.master.gain.value = this.volumen;
    this.enabled = this.volumen > 0;
  }

  // --- Efectos ---------------------------------------------------------------

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'square',
    gain = 0.12,
    when = 0,
    slide?: number,
  ): void {
    if (!this.enabled || !this.init() || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, gain = 0.08, when = 0, filterHz = 4000): void {
    if (!this.enabled || !this.init() || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime + when;
    const buffer = this.ctx.createBuffer(
      1,
      Math.ceil(this.ctx.sampleRate * dur),
      this.ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterHz;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  sfx(name: SfxName): void {
    switch (name) {
      case 'tecla':
        this.noise(0.03, 0.05, 0, 3000);
        break;
      case 'seleccion':
        this.tone(660, 0.05, 'square', 0.06);
        break;
      case 'confirmar':
        this.tone(523, 0.07, 'square', 0.08);
        this.tone(784, 0.1, 'square', 0.08, 0.07);
        break;
      case 'cancelar':
        this.tone(330, 0.09, 'square', 0.07, 0, 220);
        break;
      case 'plena':
        this.tone(523, 0.08, 'triangle', 0.12);
        this.tone(659, 0.08, 'triangle', 0.12, 0.08);
        this.tone(784, 0.16, 'triangle', 0.12, 0.16);
        break;
      case 'parcial':
        this.tone(523, 0.1, 'triangle', 0.1);
        this.tone(587, 0.14, 'triangle', 0.1, 0.1);
        break;
      case 'fallida':
        this.tone(220, 0.18, 'sawtooth', 0.07, 0, 160);
        break;
      case 'firma':
        this.noise(0.12, 0.06, 0, 1800);
        this.tone(392, 0.25, 'triangle', 0.1, 0.1);
        this.tone(587, 0.3, 'triangle', 0.1, 0.22);
        break;
      case 'hito':
        [392, 494, 587, 784].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.09, i * 0.12));
        break;
      case 'detencion':
        this.tone(196, 0.4, 'sawtooth', 0.09, 0, 98);
        break;
      case 'evidencia':
        this.noise(0.08, 0.05, 0, 2500);
        this.tone(880, 0.06, 'square', 0.05, 0.05);
        break;
      case 'codice':
        this.tone(659, 0.06, 'triangle', 0.08);
        this.tone(988, 0.12, 'triangle', 0.08, 0.06);
        break;
      default:
        break;
    }
  }

  // --- Música por capas -------------------------------------------------------

  play(pista: string, capas = 1): void {
    if (this.pista === pista) {
      this.capas = capas;
      return;
    }
    this.pista = pista;
    this.capas = capas;
    if (!this.init() || !this.ctx) return;
    if (this.ctx.state === 'running') this.startScheduler();
  }

  setCapas(capas: number): void {
    this.capas = Math.max(1, Math.min(3, capas));
  }

  stop(): void {
    this.pista = null;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private startScheduler(): void {
    if (!this.ctx) return;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.nextBeat = this.ctx.currentTime + 0.1;
    this.beatIndex = 0;
    this.timer = window.setInterval(() => this.schedule(), 90);
  }

  private schedule(): void {
    if (!this.ctx || !this.pista || !this.musicGain || !this.enabled) return;
    const c = CARACTERES[this.pista] ?? CARACTERES.gym!;
    const beat = 60 / c.tempo / 2; // corcheas
    while (this.nextBeat < this.ctx.currentTime + 0.25) {
      this.note(c, this.beatIndex, this.nextBeat, beat);
      this.nextBeat += beat;
      this.beatIndex = (this.beatIndex + 1) % 32;
    }
  }

  private note(c: Caracter, i: number, t: number, beat: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const semis = (n: number): number => c.tonica * Math.pow(2, n / 12);
    // Capa 1: base (acorde sostenido cada compás)
    if (i % 16 === 0) {
      const grados = [c.escala[0]!, c.escala[2]!, c.escala[3]!];
      for (const g of grados) {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 600 + c.brillo * 600;
        o.type = 'triangle';
        o.frequency.value = semis(g) / 2;
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.linearRampToValueAtTime(0.09, t + 0.4);
        gn.gain.linearRampToValueAtTime(0.0001, t + beat * 16);
        o.connect(f).connect(gn).connect(this.musicGain);
        o.start(t);
        o.stop(t + beat * 16 + 0.05);
      }
    }
    // Capa 2: ritmo (tambora en 1 y 2.5; llamador en contratiempos)
    if (this.capas >= 2) {
      const patronTambora = [0, 3, 6, 8, 11, 14];
      if (patronTambora.includes(i % 16)) {
        const o = ctx.createOscillator();
        const gn = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        gn.gain.setValueAtTime(0.25, t);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(gn).connect(this.musicGain);
        o.start(t);
        o.stop(t + 0.2);
      }
      if (i % 2 === 1) {
        const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.03), ctx.sampleRate);
        const d = buffer.getChannelData(0);
        for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length);
        const s = ctx.createBufferSource();
        s.buffer = buffer;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 5000;
        const gn = ctx.createGain();
        gn.gain.value = 0.05;
        s.connect(f).connect(gn).connect(this.musicGain);
        s.start(t);
      }
    }
    // Capa 3: melodía (gaita: arpegio pentatónico en corcheas alternas)
    if (this.capas >= 3 && i % 2 === 0) {
      const seq = [0, 2, 4, 3, 2, 4, 1, 0, 2, 3, 4, 2, 1, 3, 0, 1];
      const grado = c.escala[seq[(i / 2) % seq.length]! % c.escala.length]!;
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = 'square';
      o.frequency.value = semis(grado + 12);
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(0.05 + c.brillo * 0.03, t + 0.01);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
      o.connect(gn).connect(this.musicGain);
      o.start(t);
      o.stop(t + beat);
    }
  }
}

export const synth = new Synth();

/** Conecta el sintetizador al bus y al primer gesto del usuario. */
export function installAudio(): void {
  const bus = getBus();
  const unlock = (): void => {
    synth.resume();
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  bus.on('audio:volume', (e) => synth.setVolume(e.volumen));
  bus.on('audio:sfx', (e) => synth.sfx(e.name as SfxName));
  bus.on('audio:music', (e) => (e.pista ? synth.play(e.pista, e.capas ?? 1) : synth.stop()));
  bus.on('legitimidad:hito', (e) => {
    synth.sfx('hito');
    synth.setCapas(LAYERS_BY_STATE[e.estado as MapState] ?? 1);
  });
  bus.on('ui:toast', (e) => {
    if (e.kind === 'ok') synth.sfx('evidencia');
  });
}

export function capasPara(estado: MapState): number {
  return LAYERS_BY_STATE[estado];
}
