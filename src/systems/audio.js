// Audio de AEQUITAS con Tone.js (motor heredado de "Reverdecer"): música
// generativa por lugar y efectos sintetizados. Sin archivos de audio.
//
// Todo está envuelto en try/catch: si el audio falla por cualquier motivo, el
// juego sigue funcionando sin sonido. El contexto de audio solo arranca tras un
// gesto del jugador (tecla/clic), por la política de autoplay de los navegadores.

import * as Tone from 'tone';

let started = false;
let ready = false;
let muted = false;
let currentTheme = null;
let loop = null;
let masterVolume = 0.6; // ganancia maestra (ajustable desde Ajustes)

let master;
let limiter; // evita picos/clics (pops) en la salida
let reverb;
let pad; // acordes sostenidos
let pluck; // melodía/arpegio
let bass; // bajo suave
let mem; // golpes (membrana)
let metal; // brillos metálicos
let noise; // silbidos/aire
let chime; // campanitas
let kalimba; // notas de kalimba (minijuego musical)

// Tema musical por bioma: acorde base, escala de la melodía y tempo. Da a cada
// mundo su carácter (cálido, umbrío, cristalino, nocturno...).
const THEMES = {
  menu: { bpm: 64, chord: ['C4', 'E4', 'G4', 'B4'], scale: ['C4', 'E4', 'G4', 'A4', 'B4', 'E5'], wave: 'sine' },
  jardin: { bpm: 74, chord: ['C4', 'E4', 'G4'], scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], wave: 'triangle' },
  bosque: { bpm: 66, chord: ['A3', 'C4', 'E4'], scale: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'], wave: 'triangle' },
  otono: { bpm: 70, chord: ['D4', 'F4', 'A4'], scale: ['D4', 'E4', 'F4', 'A4', 'C5', 'D5'], wave: 'triangle' },
  cielo: { bpm: 60, chord: ['E4', 'G#4', 'B4'], scale: ['E4', 'F#4', 'G#4', 'B4', 'C#5', 'E5'], wave: 'sine' },
  ocaso: { bpm: 62, chord: ['F3', 'A3', 'C4', 'E4'], scale: ['F3', 'A3', 'C4', 'E4', 'G4', 'A4'], wave: 'triangle' },
  ruinas: { bpm: 60, chord: ['D4', 'F4', 'A4'], scale: ['D4', 'F4', 'G4', 'A4', 'C5'], wave: 'sine' },
  pradera: { bpm: 80, chord: ['G3', 'B3', 'D4'], scale: ['G3', 'A3', 'B3', 'D4', 'E4', 'G4'], wave: 'triangle' },
  cripta: { bpm: 54, chord: ['C3', 'Eb3', 'G3'], scale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3'], wave: 'sine' },
  pantano: { bpm: 56, chord: ['D3', 'F3', 'A3'], scale: ['D3', 'F3', 'G3', 'A3', 'C4'], wave: 'sine' },
  niebla: { bpm: 58, chord: ['F3', 'A3', 'C4'], scale: ['F3', 'G3', 'A3', 'C4', 'D4'], wave: 'sine' },
  nieve: { bpm: 68, chord: ['E4', 'G4', 'B4'], scale: ['E4', 'G4', 'A4', 'B4', 'D5'], wave: 'triangle' },
  seto: { bpm: 76, chord: ['C4', 'E4', 'G4'], scale: ['C4', 'E4', 'G4', 'A4', 'B4'], wave: 'triangle' },
  cristal: { bpm: 70, chord: ['D4', 'F#4', 'A4'], scale: ['D4', 'F#4', 'A4', 'B4', 'D5', 'F#5'], wave: 'sine' },
  costa: { bpm: 72, chord: ['G3', 'B3', 'D4'], scale: ['G3', 'B3', 'D4', 'E4', 'G4', 'B4'], wave: 'triangle' },
  nocturno: { bpm: 52, chord: ['A3', 'C4', 'E4', 'G4'], scale: ['A3', 'C4', 'E4', 'G4', 'A4', 'C5'], wave: 'sine' },
  paraiso: { bpm: 78, chord: ['C4', 'E4', 'G4', 'C5'], scale: ['C4', 'E4', 'G4', 'A4', 'C5', 'E5'], wave: 'triangle' },
  // AEQUITAS: el puerto (alegre, caribeño), la audiencia (tensa pero digna) y
  // la Biblioteca (misterio cálido).
  // El puerto bajo el Puño: lento, en menor, con miedo.
  puerto_tenso: { bpm: 64, chord: ['E3', 'G3', 'B3'], scale: ['E3', 'G3', 'A3', 'B3', 'D4', 'E4'], wave: 'sine' },
  puerto: { bpm: 96, chord: ['G3', 'B3', 'D4'], scale: ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4'], wave: 'triangle' },
  audiencia: { bpm: 70, chord: ['D3', 'F3', 'A3'], scale: ['D4', 'E4', 'F4', 'A4', 'C5', 'D5'], wave: 'sine' },
  biblioteca: { bpm: 60, chord: ['F3', 'A3', 'C4', 'E4'], scale: ['F4', 'G4', 'A4', 'C5', 'E5'], wave: 'sine' },
  victoria: { bpm: 88, chord: ['C4', 'E4', 'G4', 'C5'], scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'E5'], wave: 'triangle' },
};

export async function startAudio() {
  if (started) return;
  started = true;
  try {
    await Tone.start();
    // Cadena de salida: ... → master(gain) → limiter → altavoces. El limitador
    // recorta los picos y elimina la mayoría de los "pops"/clics.
    limiter = new Tone.Limiter(-2).toDestination();
    master = new Tone.Gain(muted ? 0 : masterVolume).connect(limiter);
    reverb = new Tone.Reverb({ decay: 4, wet: 0.32 }).connect(master);

    pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 1.4, decay: 0.6, sustain: 0.6, release: 3.5 } }).connect(reverb);
    pad.volume.value = -20;
    pluck = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.08, release: 0.7 } }).connect(reverb);
    pluck.volume.value = -15;
    bass = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.06, decay: 0.3, sustain: 0.7, release: 1.3 } }).connect(master);
    bass.volume.value = -22;

    mem = new Tone.MembraneSynth().connect(master);
    mem.volume.value = -8;
    metal = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.2, release: 0.2 } }).connect(reverb);
    metal.volume.value = -24;
    noise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.09, sustain: 0, release: 0.06 } }).connect(master);
    noise.volume.value = -20;
    chime = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.3 } }).connect(reverb);
    chime.volume.value = -10;
    // Kalimba: timbre dulce y plumoso (triángulo con caída media) para el reto musical.
    kalimba = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.004, decay: 0.9, sustain: 0.02, release: 0.7 } }).connect(reverb);
    kalimba.volume.value = -7;

    Tone.Transport.bpm.value = 70;
    Tone.Transport.start();
    ready = true;
    if (currentTheme) playTheme(currentTheme);
  } catch (e) {
    // Sin audio: el juego sigue.
  }
}

export function playTheme(key) {
  currentTheme = key;
  if (!ready) return;
  try {
    if (loop) {
      loop.dispose();
      loop = null;
    }
    const th = THEMES[key] || THEMES.jardin;
    Tone.Transport.bpm.value = th.bpm;
    pluck.oscillator.type = th.wave;
    let i = 0;
    loop = new Tone.Loop((time) => {
      if (muted) return;
      // Todo el cuerpo va en try/catch: si Tone se queja del agendado (p. ej. al
      // reiniciar escenas muy rápido), el juego sigue sin música, nunca crashea.
      try {
        // Melodía: una nota suave de la escala (con algún silencio para respirar).
        if (Math.random() < 0.78) {
          const n = th.scale[Math.floor(Math.random() * th.scale.length)];
          pluck.triggerAttackRelease(n, '8n', time, 0.5 + Math.random() * 0.3);
        }
        // Acorde pad cada compás.
        if (i % 8 === 0) pad.triggerAttackRelease(th.chord, '1n', time, 0.5);
        // Bajo cada medio compás.
        if (i % 4 === 0) {
          const root = Tone.Frequency(th.chord[0]).transpose(-12);
          bass.triggerAttackRelease(root, '2n', time, 0.6);
        }
      } catch (e) {
        /* agendado inválido: ignorar este compás */
      }
      i++;
    }, '4n').start(0);
  } catch (e) {
    /* sin música */
  }
}

// Toca una nota suelta (kalimba) para el minijuego musical de recordación.
export function playNote(note, dur = '8n', vel = 0.8) {
  if (!ready || muted) return;
  try { kalimba.triggerAttackRelease(note, dur, Tone.now() + 0.02, vel); } catch (e) { /* nada */ }
}

export function sfx(name) {
  if (!ready || muted) return;
  try {
    const t = Tone.now() + 0.02; // pequeño adelanto: evita clics por agendado inmediato
    switch (name) {
      case 'attack':
        noise.triggerAttackRelease('16n', t);
        break;
      case 'hit':
        mem.triggerAttackRelease('C2', '8n', t);
        break;
      case 'minion':
        metal.triggerAttackRelease('16n', t, 0.4);
        break;
      case 'treasure':
        chime.triggerAttackRelease('C6', '16n', t);
        chime.triggerAttackRelease('E6', '16n', t + 0.08);
        chime.triggerAttackRelease('G6', '16n', t + 0.16);
        break;
      case 'heal':
        chime.triggerAttackRelease('G5', '8n', t);
        chime.triggerAttackRelease('C6', '8n', t + 0.12);
        break;
      case 'note':
        chime.triggerAttackRelease('A5', '16n', t);
        break;
      case 'gate':
        metal.triggerAttackRelease('8n', t, 0.6);
        chime.triggerAttackRelease('E6', '16n', t + 0.05);
        break;
      case 'portal':
        chime.triggerAttackRelease('C5', '8n', t);
        chime.triggerAttackRelease('G5', '8n', t + 0.12);
        chime.triggerAttackRelease('C6', '4n', t + 0.24);
        break;
      case 'respiro':
        pad.triggerAttackRelease(['C4', 'G4', 'C5'], '2n', t, 0.4);
        break;
      case 'death':
        mem.triggerAttackRelease('C1', '2n', t);
        break;
      case 'hug':
        pad.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '2n', t, 0.6);
        break;
      case 'valor':
        // Valor: arpegio brillante ascendente.
        chime.triggerAttackRelease('E5', '16n', t, 0.6);
        chime.triggerAttackRelease('G5', '16n', t + 0.06, 0.6);
        chime.triggerAttackRelease('C6', '8n', t + 0.12, 0.7);
        break;
      case 'sabiduria':
        // Jerónimo revela: campanita serena + halo.
        chime.triggerAttackRelease('B5', '8n', t, 0.5);
        pad.triggerAttackRelease(['E4', 'B4'], '2n', t, 0.3);
        break;
      case 'pet':
        chime.triggerAttackRelease('D6', '16n', t, 0.4);
        chime.triggerAttackRelease('F6', '16n', t + 0.09, 0.4);
        break;
      case 'achievement':
        // Pequeña fanfarria.
        chime.triggerAttackRelease('C5', '16n', t);
        chime.triggerAttackRelease('E5', '16n', t + 0.08);
        chime.triggerAttackRelease('G5', '16n', t + 0.16);
        chime.triggerAttackRelease('C6', '8n', t + 0.24);
        pad.triggerAttackRelease(['C4', 'E4', 'G4'], '2n', t, 0.3);
        break;
      case 'seal':
        // Sello que se estampa: golpe grave + destello.
        mem.triggerAttackRelease('G2', '8n', t);
        chime.triggerAttackRelease('C6', '8n', t + 0.1, 0.6);
        break;
      case 'page':
        noise.triggerAttackRelease('32n', t);
        break;
      case 'confirm':
        chime.triggerAttackRelease('G5', '16n', t, 0.5);
        chime.triggerAttackRelease('D6', '8n', t + 0.08, 0.5);
        break;
      case 'riddle':
        chime.triggerAttackRelease('E5', '16n', t);
        chime.triggerAttackRelease('A5', '16n', t + 0.1);
        chime.triggerAttackRelease('E6', '4n', t + 0.2);
        break;
      case 'shatter':
        noise.triggerAttackRelease('16n', t);
        mem.triggerAttackRelease('C2', '8n', t + 0.02);
        metal.triggerAttackRelease('16n', t + 0.04, 0.4);
        break;
      case 'crystallize':
        chime.triggerAttackRelease('C6', '16n', t);
        chime.triggerAttackRelease('E6', '16n', t + 0.07);
        chime.triggerAttackRelease('G6', '8n', t + 0.14);
        break;
      case 'thunder':
        mem.triggerAttackRelease('C1', '2n', t, 0.7);
        noise.triggerAttackRelease('4n', t + 0.04);
        break;
      case 'damage':
        mem.triggerAttackRelease('E2', '16n', t);
        noise.triggerAttackRelease('32n', t);
        break;
      case 'select':
        pluck.triggerAttackRelease('C5', '32n', t, 0.3);
        break;
      case 'confirm':
        chime.triggerAttackRelease('G5', '16n', t);
        chime.triggerAttackRelease('C6', '16n', t + 0.07);
        break;
      default:
        break;
    }
  } catch (e) {
    /* sin efecto */
  }
}

export function setMuted(m) {
  muted = m;
  try {
    if (master) master.gain.rampTo(m ? 0 : masterVolume, 0.12);
  } catch (e) {
    /* nada */
  }
}

// Ajusta el volumen maestro (0..1) desde la pantalla de Ajustes.
export function setVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
  try {
    if (master && !muted) master.gain.rampTo(masterVolume, 0.12);
  } catch (e) {
    /* nada */
  }
}

export function getVolume() {
  return masterVolume;
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}

export function isMuted() {
  return muted;
}
