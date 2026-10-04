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
    // Makin lama → interval lebih pendek (lebih sering muncul)
    // Tapi tidak kurang dari 1200ms (forgiving untuk anak)
    const base = 2800;
    const reduction = Math.min(elapsedSeconds * 15, 1600);
    return Math.max(1200, base - reduction);
  }

  update(dt: number, worldSpeed: number, elapsedMs: number): void {
    this.timeSinceLastSpawn += dt;
    this.spawnInterval = this.calcInterval(elapsedMs / 1000);

    // Cek apakah waktunya spawn
    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.trySpawn(worldSpeed);
      this.timeSinceLastSpawn = 0;
    }

    // Update semua obstacle
    for (const obs of this.obstacles) {
      obs.update(dt, worldSpeed);
    }

    // Hapus yang tidak aktif
    this.obstacles = this.obstacles.filter((o) => o.active);
  }

  private trySpawn(worldSpeed: number): void {
    const spawnX = CANVAS_WIDTH + 20;

    // Cek gap dari obstacle terakhir
    const lastObs = this.obstacles.at(-1);
    if (lastObs) {
      const gap = spawnX - (lastObs.x + lastObs.width);
      const requiredGap = this.MIN_GAP_PX + worldSpeed * 12; // lebih cepat = butuh gap lebih besar
      if (gap < requiredGap) return; // Belum waktunya — gap terlalu kecil
    }

    // Pilih tipe obstacle
    // Awal: hanya GROUND. Setelah 10 detik, mulai muncul OVERHEAD juga
    const type: ObstacleType =
      randomFloat(0, 1) > 0.65
        ? ObstacleType.OVERHEAD
        : ObstacleType.GROUND;

    // Terkadang spawn pair (double obstacle) — setelah 20 detik
    const spawnDouble = randomFloat(0, 1) > 0.75;

    this.obstacles.push(createObstacle(type, spawnX));

    if (spawnDouble) {
      const secondX = spawnX + randomInt(140, 200);
      // Second obstacle harus tipe berbeda (tidak double impossible)
      const secondType =
        type === ObstacleType.GROUND
          ? ObstacleType.OVERHEAD
          : ObstacleType.GROUND;
      this.obstacles.push(createObstacle(secondType, secondX));
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
