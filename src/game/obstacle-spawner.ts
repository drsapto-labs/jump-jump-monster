/**
 * Obstacle Spawner — Mengatur kemunculan obstacle secara dinamis.
 *
 * Defensive guards:
 * - Minimum gap antar obstacle (tidak ada impossible gaps)
 * - Tidak spawn OVERHEAD dan GROUND bersamaan
 * - Gap makin rapat seiring difficulty naik
 */

import { CANVAS_WIDTH, MIN_OBSTACLE_GAP } from '@utils/constants';
import { randomInt, randomFloat } from '@utils/helpers';
import { Obstacle, ObstacleType, createObstacle } from '@game/obstacle';

export class ObstacleSpawner {
  private obstacles: Obstacle[] = [];
  private timeSinceLastSpawn = 0;
  private spawnInterval: number; // ms

  // Gap minimum antar obstacle dalam piksel (di world space)
  private readonly MIN_GAP_PX = MIN_OBSTACLE_GAP;

  constructor() {
    this.spawnInterval = this.calcInterval(0);
  }

  get activeObstacles(): readonly Obstacle[] {
    return this.obstacles;
  }

  private calcInterval(elapsedSeconds: number): number {
    // Pada level awal (0-20s), jarak antar rintangan SANGAT longgar (4.5s)
    // agar anak punya cukup waktu bereaksi, mendarat, dan bersiap lompat lagi.
    // Interval bertahap turun seiring waktu, tapi tidak kurang dari 2000ms.
    const base = 4500;
    const reduction = Math.min(elapsedSeconds * 18, 2500);
    return Math.max(2000, base - reduction);
  }

  update(dt: number, worldSpeed: number, elapsedMs: number): void {
    this.timeSinceLastSpawn += dt;
    this.spawnInterval = this.calcInterval(elapsedMs / 1000);

    // Cek apakah waktunya spawn
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.trySpawn(worldSpeed, elapsedMs / 1000);
      this.timeSinceLastSpawn = 0;
    }

    // Update semua obstacle
    for (const obs of this.obstacles) {
      obs.update(dt, worldSpeed);
    }

    // Hapus yang tidak aktif
    this.obstacles = this.obstacles.filter((o) => o.active);
  }

  private trySpawn(worldSpeed: number, elapsedSeconds: number = 0): void {
    const spawnX = CANVAS_WIDTH + 20;

    // Cek gap dari obstacle terakhir
    const lastObs = this.obstacles.at(-1);
    if (lastObs) {
      const gap = spawnX - (lastObs.x + lastObs.width);
      const requiredGap = this.MIN_GAP_PX + worldSpeed * 15; // lebih cepat = butuh gap lebih besar
      if (gap < requiredGap) return; // Belum waktunya — gap terlalu kecil
    }

    // Hanya spawn GROUND obstacle
    const type: ObstacleType = ObstacleType.GROUND;

    // Jangan spawn double obstacle di awal game! Baru boleh setelah 50 detik bermain
    const spawnDouble = elapsedSeconds > 50 && randomFloat(0, 1) > 0.88;

    this.obstacles.push(createObstacle(type, spawnX));

    if (spawnDouble) {
      // Jarak obstacle kedua diberi jeda SANGAT lega agar anak sempat mendarat dan melompat lagi
      const secondX = spawnX + randomInt(320, 420);
      this.obstacles.push(createObstacle(ObstacleType.GROUND, secondX));
    }
  }

  render(renderer: import('@core/canvas-renderer').CanvasRenderer): void {
    for (const obs of this.obstacles) {
      obs.render(renderer);
    }
  }

  reset(): void {
    this.obstacles = [];
    this.timeSinceLastSpawn = 0;
    this.spawnInterval = this.calcInterval(0);
  }
}
