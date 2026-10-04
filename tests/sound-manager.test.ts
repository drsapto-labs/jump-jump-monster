import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundManager } from '../src/audio/sound-manager';

describe('SoundManager', () => {
  let sound: SoundManager;

  beforeEach(() => {
    sound = new SoundManager();
  });

  it('starts with default volume and unmuted', () => {
    expect(sound.volume).toBe(0.4);
    expect(sound.isMuted).toBe(false);
  });

  it('toggles mute status correctly', () => {
    expect(sound.toggleMute()).toBe(true);
    expect(sound.isMuted).toBe(true);

    expect(sound.toggleMute()).toBe(false);
    expect(sound.isMuted).toBe(false);
  });

  it('sets explicit mute status', () => {
    sound.setMuted(true);
    expect(sound.isMuted).toBe(true);

    sound.setMuted(false);
    expect(sound.isMuted).toBe(false);
  });

  it('clamps volume between 0.0 and 1.0', () => {
    sound.setVolume(0.8);
    expect(sound.volume).toBe(0.8);

    sound.setVolume(-0.5);
    expect(sound.volume).toBe(0);

    sound.setVolume(1.5);
    expect(sound.volume).toBe(1);
  });

  it('safely handles play calls when AudioContext is unsupported or in test environment', () => {
    expect(() => sound.playJump()).not.toThrow();
    expect(() => sound.playDuck()).not.toThrow();
    expect(() => sound.playCollect(1)).not.toThrow();
    expect(() => sound.playCollect(3)).not.toThrow();
    expect(() => sound.playHit()).not.toThrow();
    expect(() => sound.playGameOver()).not.toThrow();
    expect(() => sound.playStart()).not.toThrow();
    expect(() => sound.playHighScore()).not.toThrow();
  });

  it('interacts with AudioContext mock when available', () => {
    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => mockGainNode),
      createOscillator: vi.fn(() => mockOscillator),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal('AudioContext', vi.fn(() => mockContext));

    const mockedSound = new SoundManager();
    mockedSound.unlock();

    mockedSound.playJump();
    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();

    mockedSound.playCollect(2);
    expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled();

    mockedSound.setVolume(0.7);
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.7, 10);

    vi.unstubAllGlobals();
  });
});
