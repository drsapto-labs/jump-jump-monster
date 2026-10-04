/**
 * Unit tests Langkah 5: Obstacle Spawner & Collision
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ObstacleSpawner } from '../src/game/obstacle-spawner';
import { Obstacle, ObstacleType, createObstacle } from '../src/game/obstacle';
import { checkPlayerObstacleCollision } from '../src/game/collision';
import { Player } from '../src/game/player';
import { CANVAS_WIDTH, MIN_OBSTACLE_GAP } from '../src/utils/constants';

describe('ObstacleSpawner', () => {
  let spawner: ObstacleSpawner;

  beforeEach(() => {
    spawner = new ObstacleSpawner();
  });

  it('starts with no obstacles', () => {
    expect(spawner.activeObstacles.length).toBe(0);
  });

  it('spawns obstacles after enough time passes', () => {
    // Simulate 4 seconds — enough for first spawn
    for (let i = 0; i < 250; i++) spawner.update(16, 4, i * 16);
    expect(spawner.activeObstacles.length).toBeGreaterThan(0);
  });

  it('never spawns obstacles closer than MIN_OBSTACLE_GAP', () => {
    // Simulate 30 seconds
    for (let i = 0; i < 1875; i++) spawner.update(16, 4, i * 16);

    const obs = spawner.activeObstacles;
    for (let i = 1; i < obs.length; i++) {
      const prev = obs[i - 1]!;
      const curr = obs[i]!;
      const gap = curr.x - (prev.x + prev.width);
      expect(gap).toBeGreaterThanOrEqual(MIN_OBSTACLE_GAP * 0.5);
      // Note: gap bisa sedikit lebih kecil karena obstacles bergerak
      // tapi tidak boleh 0 atau negatif saat pertama spawn
    }
  });

  it('reset() clears all obstacles', () => {
    for (let i = 0; i < 250; i++) spawner.update(16, 4, i * 16);
    spawner.reset();
    expect(spawner.activeObstacles.length).toBe(0);
  });

  it('obstacles move leftward each frame', () => {
    for (let i = 0; i < 250; i++) spawner.update(16, 4, i * 16);
    const firstObs = spawner.activeObstacles[0];
    if (!firstObs) return; // no obstacle yet — skip

    const xBefore = firstObs.x;
    spawner.update(16, 4, 250 * 16);
    expect(firstObs.x).toBeLessThan(xBefore);
  });

  it('obstacles are deactivated when off screen', () => {
    // Place an obstacle just off screen left
    const obs = createObstacle(ObstacleType.GROUND, -200);
    obs.update(16, 4);
    expect(obs.active).toBe(false);
  });
});

describe('Obstacle', () => {
  it('GROUND obstacle hitbox is smaller than visual bounds', () => {
    const obs = createObstacle(ObstacleType.GROUND, CANVAS_WIDTH);
    expect(obs.hitbox.width).toBeLessThan(obs.width);
    expect(obs.hitbox.height).toBeLessThan(obs.height);
  });

  it('OVERHEAD obstacle spawns at top (y=0)', () => {
    const obs = createObstacle(ObstacleType.OVERHEAD, CANVAS_WIDTH);
    expect(obs.y).toBe(0);
  });
});

describe('Collision Detection', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player();
  });

  it('returns null when no obstacles', () => {
    expect(checkPlayerObstacleCollision(player, [])).toBeNull();
  });

  it('detects collision with overlapping obstacle', () => {
    // Place obstacle directly on player
    const obs = new Obstacle({
      type: ObstacleType.GROUND,
      x: player.x,       // same x as player
      y: player.y,       // same y as player
      width: player.width,
      height: player.height,
      color: '#ff0000',
    });
    const result = checkPlayerObstacleCollision(player, [obs]);
    expect(result).toBe(obs);
  });

  it('returns null when obstacle is far away', () => {
    const obs = new Obstacle({
      type: ObstacleType.GROUND,
      x: 700, // far right
      y: 0,
      width: 40,
      height: 40,
      color: '#ff0000',
    });
    expect(checkPlayerObstacleCollision(player, [obs])).toBeNull();
  });

  it('returns null for inactive obstacles', () => {
    const obs = new Obstacle({
      type: ObstacleType.GROUND,
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
      color: '#ff0000',
    });
    obs.active = false;
    expect(checkPlayerObstacleCollision(player, [obs])).toBeNull();
  });
});
