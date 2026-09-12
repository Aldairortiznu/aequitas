// Sintetizador procedural de audio con Web Audio API para AEQUITAS.
// Bellium S.A.S. · Al Resuelve (Cartagena de Indias).
// Sonidos botánicos, campanas solares, arpegios cinemáticos tipo Zelda/Mega Man.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration = 0.4, type = 'sine', gainVal = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {}
  }

  playTypewriter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520 + Math.random() * 80, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  playMenuNav() {
    this.playTone(392.0, 0.1, 'sine', 0.08); // G4
  }

  playMenuSelect() {
    this.playTone(523.25, 0.18, 'triangle', 0.12); // C5
    setTimeout(() => this.playTone(659.25, 0.28, 'sine', 0.15), 60); // E5
    setTimeout(() => this.playTone(783.99, 0.4, 'sine', 0.18), 120); // G5
  }

  playAlegato() {
    this.playTone(587.33, 0.15, 'triangle', 0.12); // D5
    setTimeout(() => this.playTone(880.0, 0.25, 'sine', 0.16), 40); // A5
  }

  playBloom() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.6, 'sine', 0.18), idx * 80);
    });
  }

  playIntroArpeggio(actIndex = 0) {
    if (this.muted) return;
    const chords = [
      [220, 261.63, 329.63, 440], // La menor (Colapso)
      [261.63, 329.63, 392.00, 523.25], // Do mayor (Biblioteca)
      [293.66, 369.99, 440.00, 587.33], // Re mayor (Exploradores)
      [349.23, 440.00, 523.25, 698.46]  // Fa mayor (Paz de Bellium)
    ];

    const chord = chords[actIndex % chords.length];
    chord.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.9, 'sine', 0.12);
      }, i * 120);
    });
  }
}

export const sound = new SoundEngine();
