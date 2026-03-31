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
  gain = { value: 1 };
  connect = vi.fn();
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
  destination = {};
  createGain = vi.fn(() => new GainNodeMock());
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
});
