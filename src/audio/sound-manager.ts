/**
 * Sound Manager — Procedural Web Audio API Sound Synthesizer.
 *
 * Menggunakan Web Audio API untuk menghasilkan SFX procedural:
 * - 0 byte download / tidak butuh file eksternal (MP3/WAV)
 * - Zero latency
 * - Volume control & mute support
 * - Safe fallback jika AudioContext belum di-unlock / tidak didukung di environment test
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _isMuted = false;
  private _volume = 0.4; // 0.0 - 1.0

  constructor() {
    // AudioContext diinisialisasi secara lazy saat interaksi pertama
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get volume(): number {
    return this._volume;
  }

  /** Inisialisasi & unlock AudioContext saat ada user interaction */
  unlock(): void {
    const globalObj =
      typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
          ? globalThis
          : null;
    if (!globalObj) return;

    if (!this.ctx) {
      const AudioCtx =
        (globalObj as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (globalObj as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(
            this._isMuted ? 0 : this._volume,
            this.ctx.currentTime,
          );
          this.masterGain.connect(this.ctx.destination);
        } catch {
          this.ctx = null;
          this.masterGain = null;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Set volume (0.0 - 1.0) */
  setVolume(vol: number): void {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this._isMuted) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
    }
  }

  /** Toggle mute */
  toggleMute(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  /** Set status mute */
  setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this._isMuted ? 0 : this._volume,
        this.ctx.currentTime,
      );
    }
  }

  /** Jump Sound — "Boing" frekuensi naik */
  playJump(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch sweep: 160Hz -> 440Hz
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore audio errors
    }
  }

  /** Duck Sound — Frekuensi turun cepat */
  playDuck(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch drop: 280Hz -> 140Hz
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore audio errors
    }
  }

  /** Collect Star/Item — Bell chime berkilau dengan skala nada dinamis */
  playCollect(comboMultiplier = 1): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Nada dasar naik seiring multiplier (587Hz / D5 -> 880Hz / A5)
      const baseFreq = Math.min(1200, 587 * Math.pow(1.08, comboMultiplier - 1));

      // Dual tone (fundamental + harmonic)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch {
      // Ignore audio errors
    }
  }

  /** Hit / Crash Sound — Low impact punch */
  playHit(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Low punch sweep: 150Hz -> 30Hz
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore audio errors
    }
  }

  /** Game Over Sound — Melodi minor sedih menurun */
  playGameOver(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const notes = [440, 415.3, 392, 349.2]; // A4 -> G#4 -> G4 -> F4
      const noteDuration = 0.14;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = this.ctx.currentTime + idx * noteDuration;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.4, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /** Game Start / Menu Click Sound */
  playStart(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.35, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.12);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /** New High Score Fanfare */
  playHighScore(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || this._isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.45, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.2);
      });
    } catch {
      // Ignore audio errors
    }
  }
}
