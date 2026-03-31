export class SoundManager {
  private unlocked = false;
  private muted = false;
  private musicContext: AudioContext | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private backgroundMusicEnabled = false;

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ensureMusicContext();
    this.resumeMusicContext();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(value: boolean) {
    this.muted = value;
    if (value) {
      this.teardownBackgroundMusic();
      return;
    }

    if (this.unlocked) {
      this.resumeMusicContext();
      if (this.backgroundMusicEnabled) {
        this.playBackgroundMusic();
      }
    }
  }

  isMuted() {
    return this.muted;
  }

  playCollect() {
    this.playSynth(880, 0.12, 0.3, "sine", 1760);
    setTimeout(() => this.playSynth(1320, 0.08, 0.2, "sine"), 60);
  }

  playHit() {
    this.playSynth(200, 0.25, 0.4, "sawtooth", 80);
  }

  playLose() {
    this.playSynth(440, 0.15, 0.3, "sine", 220);
    setTimeout(() => this.playSynth(330, 0.15, 0.25, "sine", 165), 150);
    setTimeout(() => this.playSynth(220, 0.4, 0.2, "sine", 110), 300);
  }

  playWin() {
    this.playSynth(523, 0.12, 0.3, "sine");
    setTimeout(() => this.playSynth(659, 0.12, 0.3, "sine"), 100);
    setTimeout(() => this.playSynth(784, 0.12, 0.3, "sine"), 200);
    setTimeout(() => this.playSynth(1047, 0.3, 0.35, "sine"), 300);
  }

  playJump() {
    this.playSynth(400, 0.15, 0.2, "sine", 800);
  }

  playClick() {
    this.playSynth(660, 0.06, 0.15, "sine");
  }

  playBackgroundMusic() {
    this.backgroundMusicEnabled = true;
    if (!this.unlocked || this.muted || this.musicSource) return;

    const context = this.ensureMusicContext();
    if (!context) return;

    this.resumeMusicContext();

    const source = context.createBufferSource();
    source.buffer = this.createMusicLoop(context);
    source.loop = true;

    const gain = context.createGain();
    gain.gain.value = 0.14;

    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);

    this.musicSource = source;
    this.musicGain = gain;
  }

  stopBackgroundMusic() {
    this.backgroundMusicEnabled = false;
    this.teardownBackgroundMusic();
  }

  private teardownBackgroundMusic() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource.disconnect();
      this.musicSource = null;
    }

    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }

  getDebugState() {
    return {
      isMusicPlaying: this.musicSource !== null,
      hasMusicContext: this.musicContext !== null,
      isMuted: this.muted,
      isUnlocked: this.unlocked,
    };
  }

  private playSynth(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
    sweep?: number
  ) {
    if (!this.unlocked || this.muted) return;

    const context = this.ensureMusicContext();
    if (!context) return;

    this.resumeMusicContext();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime;
    const endTime = startTime + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (sweep) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(sweep, 1), endTime);
    }

    gain.gain.setValueAtTime(Math.max(volume, 0.001), startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
  }

  private ensureMusicContext() {
    if (this.musicContext) {
      return this.musicContext;
    }

    const globalScope = globalThis as typeof globalThis & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };

    const AudioContextCtor =
      globalScope.AudioContext ||
      globalScope.webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    this.musicContext = new AudioContextCtor();
    return this.musicContext;
  }

  private resumeMusicContext() {
    if (!this.musicContext || this.musicContext.state === "running") {
      return;
    }

    void this.musicContext.resume().catch(() => {
      // The browser can still refuse resume if the gesture was not trusted.
    });
  }

  private createMusicLoop(context: AudioContext) {
    const sampleRate = context.sampleRate;
    const durationSeconds = 6;
    const frameCount = sampleRate * durationSeconds;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);

    const notes = [261.63, 329.63, 392, 440, 392, 523.25, 440, 392];
    const noteDuration = sampleRate * 0.5;

    for (let i = 0; i < frameCount; i++) {
      const noteIndex = Math.floor(i / noteDuration) % notes.length;
      const noteTime = (i % noteDuration) / sampleRate;
      const envelope =
        Math.min(1, noteTime * 12) *
        Math.max(0, 1 - Math.max(0, noteTime - 0.28) * 4.2);
      const freq = notes[noteIndex];

      const base = Math.sin((2 * Math.PI * freq * i) / sampleRate);
      const harmony = Math.sin((2 * Math.PI * freq * 1.5 * i) / sampleRate) * 0.22;
      const sparkle = Math.sin((2 * Math.PI * freq * 2 * i) / sampleRate) * 0.16;
      const bounce = Math.sin((2 * Math.PI * freq * 0.5 * i) / sampleRate) * 0.12;
      channel[i] = (base * 0.66 + harmony + sparkle + bounce) * envelope * 0.1;
    }

    return buffer;
  }
}
