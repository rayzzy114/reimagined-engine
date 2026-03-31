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
}
