import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SoundManager } from "../src/utils/sounds";

class AudioMock {
  preload = "";
  muted = false;
  currentTime = 0;
  volume = 1;
  load = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();

  constructor(public src: string) {}
}

class GainNodeMock {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

class OscillatorNodeMock {
  type: OscillatorType = "sine";
  frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class BufferSourceMock {
  buffer: AudioBuffer | null = null;
  loop = false;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
}

class AudioContextMock {
  state: AudioContextState = "running";
  currentTime = 0;
  destination = {};
  createGain = vi.fn(() => new GainNodeMock());
  createOscillator = vi.fn(() => new OscillatorNodeMock() as unknown as OscillatorNode);
  createBuffer = vi.fn((channels: number, length: number) => ({
    getChannelData: (_channel: number) => new Float32Array(length),
    length,
    numberOfChannels: channels,
    sampleRate: 44100,
  })) as unknown as AudioBuffer;
  createBufferSource = vi.fn(() => new BufferSourceMock() as unknown as AudioBufferSourceNode);
  resume = vi.fn().mockResolvedValue(undefined);
}

describe("SoundManager", () => {
  beforeEach(() => {
    vi.stubGlobal("Audio", AudioMock);
    vi.stubGlobal("AudioContext", AudioContextMock);
    vi.stubGlobal("webkitAudioContext", AudioContextMock);
  });

  it("starts looping background music after unlock", () => {
    const sounds = new SoundManager();

    sounds.unlock();
    sounds.playBackgroundMusic();

    const debugState = sounds.getDebugState();
    expect(debugState.isMusicPlaying).toBe(true);
    expect(debugState.hasMusicContext).toBe(true);
  });

  it("restores background music after unmuting gameplay audio", () => {
    const sounds = new SoundManager();

    sounds.unlock();
    sounds.playBackgroundMusic();
    sounds.toggleMute();

    expect(sounds.getDebugState()).toMatchObject({
      isMuted: true,
      isMusicPlaying: false,
    });

    sounds.toggleMute();

    expect(sounds.getDebugState()).toMatchObject({
      isMuted: false,
      isMusicPlaying: true,
    });
  });

  it("plays jump as a synthesized sound after unlock", () => {
    const sounds = new SoundManager();

    sounds.unlock();
    sounds.playJump();

    const context = (sounds as any).musicContext as AudioContextMock | null;
    expect(context?.createOscillator).toHaveBeenCalledTimes(1);
  });

  it("does not keep stale wav asset typing after moving to synthesized sfx", () => {
    const assetTypesPath = path.resolve(import.meta.dirname, "../src/assets.d.ts");
    const source = readFileSync(assetTypesPath, "utf8");

    expect(source).not.toContain('declare module "*.wav"');
  });
});
