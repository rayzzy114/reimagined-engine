import clickUrl from "../../assets/sfx/click.wav";
import collectUrl from "../../assets/sfx/collect.wav";
import hitUrl from "../../assets/sfx/hit.wav";
import jumpUrl from "../../assets/sfx/jump.wav";
import loseUrl from "../../assets/sfx/lose.wav";
import winUrl from "../../assets/sfx/win.wav";

type SoundKey = "click" | "collect" | "hit" | "jump" | "lose" | "win";

export class SoundManager {
  private unlocked = false;
  private muted = false;
  private clips: Record<SoundKey, HTMLAudioElement>;
  private musicContext: AudioContext | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    this.clips = {
      click: this.createClip(clickUrl),
      collect: this.createClip(collectUrl),
      hit: this.createClip(hitUrl),
      jump: this.createClip(jumpUrl),
      lose: this.createClip(loseUrl),
      win: this.createClip(winUrl),
    };
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ensureMusicContext();
    const clip = this.clips.click;
    clip.muted = true;
    clip.currentTime = 0;
    void clip.play()
      .then(() => {
        clip.pause();
        clip.currentTime = 0;
        clip.muted = false;
      })
      .catch(() => {
        clip.muted = false;
      });
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(value: boolean) {
    this.muted = value;
    for (const clip of Object.values(this.clips)) {
      clip.muted = value;
      if (value) {
        clip.pause();
      }
    }

    if (value) {
      this.stopBackgroundMusic();
      return;
    }

    if (this.unlocked) {
      this.resumeMusicContext();
    }
  }

  isMuted() {
    return this.muted;
  }

  playCollect() {
    this.play("collect", 0.72);
  }

  playHit() {
    this.play("hit", 0.8);
  }

  playLose() {
    this.play("lose", 0.85);
  }

  playWin() {
    this.play("win", 0.8);
  }

  playJump() {
    this.play("jump", 0.68);
  }

  playClick() {
    this.play("click", 0.6);
  }

  playBackgroundMusic() {
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

  private createClip(src: string) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.load();
    return audio;
  }

  private play(key: SoundKey, volume: number) {
    if (!this.unlocked || this.muted) return;

    const clip = this.clips[key];
    clip.pause();
    clip.currentTime = 0;
    clip.volume = volume;
    void clip.play().catch(() => {
      // Browsers may still reject if the initial gesture was blocked.
    });
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
    const durationSeconds = 8;
    const frameCount = sampleRate * durationSeconds;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);

    const notes = [196, 246.94, 293.66, 329.63, 293.66, 246.94, 220, 261.63];
    const noteDuration = sampleRate * 0.75;

    for (let i = 0; i < frameCount; i++) {
      const noteIndex = Math.floor(i / noteDuration) % notes.length;
      const noteTime = (i % noteDuration) / sampleRate;
      const envelope =
        Math.min(1, noteTime * 7) *
        Math.max(0, 1 - Math.max(0, noteTime - 0.42) * 2.6);
      const freq = notes[noteIndex];

      const base = Math.sin((2 * Math.PI * freq * i) / sampleRate);
      const octave = Math.sin((2 * Math.PI * freq * 0.5 * i) / sampleRate) * 0.32;
      const shimmer = Math.sin((2 * Math.PI * freq * 2 * i) / sampleRate) * 0.14;
      channel[i] = (base * 0.62 + octave + shimmer) * envelope * 0.1;
    }

    return buffer;
  }
}
