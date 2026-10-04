/**
 * Unit tests untuk Player entity (Langkah 4)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Player, PlayerState } from '../src/game/player';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player();
  });

  it('starts in RUNNING state on the ground', () => {
    expect(player.state).toBe(PlayerState.RUNNING);
    expect(player.x).toBeGreaterThan(0);
  });

  it('transitions to JUMPING on jump()', () => {
    player.jump();
    expect(player.state).toBe(PlayerState.JUMPING);
  });

  it('does NOT jump while already jumping', () => {
    player.jump();
    const yAfterFirstJump = player.y;
    player.jump(); // kedua — harus diabaikan
    expect(player.state).toBe(PlayerState.JUMPING);
    // Velocity tidak berubah dua kali
    expect(player.y).toBe(yAfterFirstJump);
  });

  it('transitions to DUCKING on startDuck()', () => {
    player.startDuck();
    expect(player.state).toBe(PlayerState.DUCKING);
  });

  it('returns to RUNNING on endDuck()', () => {
    player.startDuck();
    player.endDuck();
    expect(player.state).toBe(PlayerState.RUNNING);
  });

  it('duck height is smaller than standing height', () => {
    const standingHeight = player.height;
    player.startDuck();
    expect(player.height).toBeLessThan(standingHeight);
  });

  it('hitbox is smaller than visual bounds (forgiving collision)', () => {
    const hitbox = player.hitbox;
    expect(hitbox.width).toBeLessThan(player.width);
    expect(hitbox.height).toBeLessThan(player.height);
  });

  it('reset() restores to initial state', () => {
    player.jump();
    // Simulate a few frames of physics
    for (let i = 0; i < 10; i++) player.update(16);
    player.reset();
    expect(player.state).toBe(PlayerState.RUNNING);
  });

  it('y position does not go below ground after landing', () => {
    player.jump();
    // Simulate many frames until player lands
    for (let i = 0; i < 120; i++) player.update(16);
    expect(player.state).toBe(PlayerState.RUNNING);
  });

  it('shifts horizontal position with lean', () => {
    const initialX = player.x;
    player.setLean('LEFT');
    expect(player.leanDirection).toBe('LEFT');
    for (let i = 0; i < 20; i++) player.update(16);
    expect(player.x).toBeLessThan(initialX);

    player.setLean('RIGHT');
    expect(player.leanDirection).toBe('RIGHT');
    for (let i = 0; i < 40; i++) player.update(16);
    expect(player.x).toBeGreaterThan(initialX);

    player.setLean('CENTER');
    for (let i = 0; i < 40; i++) player.update(16);
    expect(player.x).toBe(initialX);
  });

  it('triggers onTakeoff and onLand callbacks', () => {
    let takeoffCalled = false;
    let landCalled = false;
    player.onTakeoff = () => {
      takeoffCalled = true;
    };
    player.onLand = () => {
      landCalled = true;
    };

    player.jump();
    expect(takeoffCalled).toBe(true);
    expect(landCalled).toBe(false);

    for (let i = 0; i < 120; i++) player.update(16);
    expect(landCalled).toBe(true);
  });
});

describe('WorldSpeed', () => {
  it('speed increases over time', async () => {
    const { WorldSpeed } = await import('../src/game/world-speed');
    const ws = new WorldSpeed();
    const initialSpeed = ws.speed;
    for (let i = 0; i < 100; i++) ws.update(16);
    expect(ws.speed).toBeGreaterThan(initialSpeed);
  });

  it('speed never exceeds MAX_WORLD_SPEED', async () => {
    const { WorldSpeed } = await import('../src/game/world-speed');
    const { MAX_WORLD_SPEED } = await import('../src/utils/constants');
    const ws = new WorldSpeed();
    // Simulate 10 minutes of gameplay
    for (let i = 0; i < 36000; i++) ws.update(16);
    expect(ws.speed).toBeLessThanOrEqual(MAX_WORLD_SPEED);
  });

  it('distance increases while updating', async () => {
    const { WorldSpeed } = await import('../src/game/world-speed');
    const ws = new WorldSpeed();
    ws.update(16);
    expect(ws.distance).toBeGreaterThan(0);
  });

  it('reset() restores initial speed and distance', async () => {
    const { WorldSpeed } = await import('../src/game/world-speed');
    const { INITIAL_WORLD_SPEED } = await import('../src/utils/constants');
    const ws = new WorldSpeed();
    for (let i = 0; i < 100; i++) ws.update(16);
    ws.reset();
    expect(ws.speed).toBe(INITIAL_WORLD_SPEED);
    expect(ws.distance).toBe(0);
  });
});
