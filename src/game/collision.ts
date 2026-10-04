/**
 * Collision — AABB collision detection.
 *
 * Menggunakan hitbox (forgiving — lebih kecil dari visual).
 * Semua pemeriksaan bounds-safe.
 */

import { rectsOverlap, type Rect } from '@utils/helpers';
import type { Player } from '@game/player';
import type { Obstacle } from '@game/obstacle';

export function checkPlayerObstacleCollision(
  player: Player,
  obstacles: readonly Obstacle[],
): Obstacle | null {
  const playerHitbox: Rect = player.hitbox;

  // Bounds check: player tidak keluar layar
  if (
    playerHitbox.width <= 0 ||
    playerHitbox.height <= 0
  ) {
    return null;
  }

  for (const obs of obstacles) {
    if (!obs.active) continue;
    const obsHitbox: Rect = obs.hitbox;
    if (rectsOverlap(playerHitbox, obsHitbox)) {
      return obs;
    }
  }

  return null;
}
