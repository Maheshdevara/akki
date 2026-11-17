// Web Audio API Synthesizer for Birthday Melodies & Chimes
class BirthdaySoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.noteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single pleasant bell / music-box note
  playBellTone(freq, time, duration = 0.5, volume = 0.15) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Warm music box tone
    osc.frequency.setValueAtTime(freq, time);

    // Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Play a cheerful chime chord (e.g. when bunny hops or user clicks)
  playChime(pitchModifier = 1) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50].map(n => n * pitchModifier);
    notes.forEach((freq, idx) => {
      this.playBellTone(freq, now + idx * 0.08, 0.4, 0.08);
    });
  }

  // Play cute rabbit hop squeak
  playHopSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Play Happy Birthday tune loop
  toggleMusic(onUpdate) {
    this.init();
    if (this.isPlaying) {
      this.stopMusic();
      if (onUpdate) onUpdate(false);
    } else {
      this.startMusic();
      if (onUpdate) onUpdate(true);
    }
  }

  startMusic() {
    if (!this.ctx) this.init();
    this.isPlaying = true;
    this.noteIndex = 0;
    this.playNextTuneLoop();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  playNextTuneLoop() {
    if (!this.isPlaying) return;

    // Happy Birthday melody in C Major (Notes + Durations in beats)
    // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25
    const melody = [
      { f: 261.63, d: 0.35, pause: 0.1 },  // Hap-
      { f: 261.63, d: 0.35, pause: 0.1 },  // py
      { f: 293.66, d: 0.65, pause: 0.15 }, // Birth-
      { f: 261.63, d: 0.65, pause: 0.15 }, // day
      { f: 349.23, d: 0.65, pause: 0.15 }, // to
      { f: 329.63, d: 1.1,  pause: 0.25 }, // you

      { f: 261.63, d: 0.35, pause: 0.1 },  // Hap-
      { f: 261.63, d: 0.35, pause: 0.1 },  // py
      { f: 293.66, d: 0.65, pause: 0.15 }, // Birth-
      { f: 261.63, d: 0.65, pause: 0.15 }, // day
      { f: 392.00, d: 0.65, pause: 0.15 }, // to
      { f: 349.23, d: 1.1,  pause: 0.25 }, // you

      { f: 261.63, d: 0.35, pause: 0.1 },  // Hap-
      { f: 261.63, d: 0.35, pause: 0.1 },  // py
      { f: 523.25, d: 0.65, pause: 0.15 }, // Birth-
      { f: 440.00, d: 0.65, pause: 0.15 }, // day
      { f: 349.23, d: 0.65, pause: 0.15 }, // dear
      { f: 329.63, d: 0.65, pause: 0.15 }, // Ak-
      { f: 293.66, d: 1.1,  pause: 0.25 }, // shaya!

      { f: 466.16, d: 0.35, pause: 0.1 },  // Hap-
      { f: 466.16, d: 0.35, pause: 0.1 },  // py
      { f: 440.00, d: 0.65, pause: 0.15 }, // Birth-
      { f: 349.23, d: 0.65, pause: 0.15 }, // day
      { f: 392.00, d: 0.65, pause: 0.15 }, // to
      { f: 349.23, d: 1.3,  pause: 0.5  }  // you!
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        if (this.isPlaying) {
          const now = this.ctx.currentTime;
          this.playBellTone(note.f, now, note.d, 0.12);
        }
      }, delay * 1000);
      delay += (note.d + note.pause);
    });

    // Schedule next loop after melody finishes + brief pause
    this.timer = setTimeout(() => {
      if (this.isPlaying) {
        this.playNextTuneLoop();
      }
    }, (delay + 1.2) * 1000);
  }
}

window.soundEngine = new BirthdaySoundEngine();
