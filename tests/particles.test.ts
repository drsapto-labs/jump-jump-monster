/**
 * Unit tests untuk ParticleSystem (Langkah 10)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/game/particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('starts with 0 particles', () => {
    expect(ps.activeCount).toBe(0);
  });

  it('spawns star burst particles', () => {
    ps.spawnStarBurst(100, 200, 8);
    expect(ps.activeCount).toBe(8);
  });

  it('spawns dust puff particles', () => {
    ps.spawnDustPuff(120, 390, 5);
    expect(ps.activeCount).toBe(5);
  });

  it('spawns hit spark particles', () => {
    ps.spawnHitSparks(150, 300, 10);
    expect(ps.activeCount).toBe(10);
  });

  it('updates particle positions and decreases life', () => {
    ps.spawnDustPuff(100, 100, 1);
    const initialCount = ps.activeCount;
    expect(initialCount).toBe(1);

    // Update 50ms
    ps.update(50);
    expect(ps.activeCount).toBe(1);

    // Simulate 1000ms — all short-lived dust particles should expire
    ps.update(1000);
    expect(ps.activeCount).toBe(0);
  });

  it('resets all particles', () => {
    ps.spawnStarBurst(100, 100, 10);
    ps.spawnDustPuff(100, 100, 5);
    expect(ps.activeCount).toBe(15);
    ps.reset();
    expect(ps.activeCount).toBe(0);
  });
});
