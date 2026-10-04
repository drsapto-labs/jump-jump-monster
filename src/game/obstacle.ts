/**
 * Obstacle — Rintangan yang harus dihindari player.
 *
 * Tipe:
 * - GROUND: di tanah, harus LOMPAT
 * - OVERHEAD: di atas, harus JONGKOK
 * - GAP: lubang di tanah (coming soon di Langkah berikutnya)
 */

import { COLORS, GROUND_Y, FORGIVING_HITBOX_SHRINK } from '@utils/constants';
import { shrinkRect, type Rect } from '@utils/helpers';
import type { CanvasRenderer } from '@core/canvas-renderer';

export enum ObstacleType {
  GROUND = 'GROUND',   // Lompat!
  OVERHEAD = 'OVERHEAD', // Jongkok!
}

export interface ObstacleConfig {
  type: ObstacleType;
  x: number;
  width: number;
  height: number;
  y: number;
  color: string;
}

export class Obstacle {
  x: number;
  readonly type: ObstacleType;
  readonly width: number;
  readonly height: number;
  readonly y: number;
  private readonly color: string;
  active = true;

  constructor(config: ObstacleConfig) {
    this.x = config.x;
    this.type = config.type;
    this.width = config.width;
    this.height = config.height;
    this.y = config.y;
    this.color = config.color;
  }

  get bounds(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /** Hitbox sedikit lebih kecil — forgiving untuk anak-anak */
  get hitbox(): Rect {
    return shrinkRect(this.bounds, FORGIVING_HITBOX_SHRINK);
  }

  update(dt: number, worldSpeed: number): void {
    const delta = (worldSpeed * dt) / 16;
    this.x -= delta;
    // Deactivate saat keluar layar kiri
    if (this.x + this.width < -10) {
      this.active = false;
    }
  }

  render(renderer: CanvasRenderer): void {
    const ctx = renderer.ctx;
    ctx.save();

    if (this.type === ObstacleType.GROUND) {
      // Ground obstacle: kotak merah dengan "spike" di atas
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, [4, 4, 0, 0]);
      ctx.fill();

      // Spike dekorasi
      ctx.fillStyle = '#C62828';
      const spikeCount = Math.floor(this.width / 16);
      for (let i = 0; i < spikeCount; i++) {
        const sx = this.x + i * (this.width / spikeCount) + 4;
        ctx.beginPath();
        ctx.moveTo(sx, this.y);
        ctx.lineTo(sx + 8, this.y - 10);
        ctx.lineTo(sx + 16, this.y);
        ctx.fill();
      }

      // Mata jahat
      if (this.width >= 32) {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 8, this.y + this.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 8, this.y + this.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 7, this.y + this.height / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 9, this.y + this.height / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Overhead obstacle: batang dari atas
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, [0, 0, 8, 8]);
      ctx.fill();

      // Dekorasi: garis-garis
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      for (let yy = this.y + 10; yy < this.y + this.height; yy += 14) {
        ctx.beginPath();
        ctx.moveTo(this.x + 4, yy);
        ctx.lineTo(this.x + this.width - 4, yy);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

/** Factory — buat obstacle berdasarkan tipe */
export function createObstacle(type: ObstacleType, spawnX: number): Obstacle {
  if (type === ObstacleType.GROUND) {
    const height = 40 + Math.floor(Math.random() * 30); // 40-70px
    const width = 30 + Math.floor(Math.random() * 20);  // 30-50px
    return new Obstacle({
      type,
      x: spawnX,
      width,
      height,
      y: GROUND_Y - height,
      color: COLORS.obstacle,
    });
  } else {
    // OVERHEAD: menjuntai dari atas
    const height = 60 + Math.floor(Math.random() * 40); // 60-100px
    const width = 40 + Math.floor(Math.random() * 20);
    return new Obstacle({
      type,
      x: spawnX,
      width,
      height,
      y: 0, // dari paling atas
      color: '#5C3317',
    });
  }
}
