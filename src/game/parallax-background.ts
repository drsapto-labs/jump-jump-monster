/**
 * Parallax Background — 3 layer scrolling.
 *
 * Layer 0 (Far): langit + awan — bergerak paling lambat (0.1x speed)
 * Layer 1 (Mid): bukit/pohon — bergerak sedang (0.4x speed)
 * Layer 2 (Near): tanah + detail — bergerak penuh (1.0x speed)
 *
 * Setiap layer wraps (seamless tiling).
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GROUND_Y } from '@utils/constants';
import type { CanvasRenderer } from '@core/canvas-renderer';

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export class ParallaxBackground {
  // Offset untuk setiap layer
  private offsetFar = 0;
  private offsetMid = 0;
  private offsetNear = 0;

  // Awan dinamis di layer far
  private clouds: Cloud[] = [];

  constructor() {
    // Generate awan awal
    for (let i = 0; i < 5; i++) {
      this.clouds.push(this.createCloud((CANVAS_WIDTH / 5) * i));
    }
  }

  private createCloud(startX?: number): Cloud {
    return {
      x: startX ?? CANVAS_WIDTH + 50,
      y: 30 + Math.random() * 80,
      width: 60 + Math.random() * 80,
      height: 30 + Math.random() * 20,
      speed: 0.3 + Math.random() * 0.3,
    };
  }

  update(dt: number, worldSpeed: number): void {
    const delta = (worldSpeed * dt) / 16; // normalize ke ~60fps

    this.offsetFar = (this.offsetFar + delta * 0.15) % CANVAS_WIDTH;
    this.offsetMid = (this.offsetMid + delta * 0.4) % CANVAS_WIDTH;
    this.offsetNear = (this.offsetNear + delta) % CANVAS_WIDTH;

    // Update awan
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * delta;
    }
    // Remove dan respawn awan yang keluar layar
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const cloud = this.clouds[i];
      if (cloud && cloud.x + cloud.width < 0) {
        this.clouds.splice(i, 1);
        this.clouds.push(this.createCloud());
      }
    }
  }

  render(renderer: CanvasRenderer): void {
    const ctx = renderer.ctx;

    // ── Layer Far: Langit ─────────────────────────────────────
    // Gradient langit
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#C8E8F5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Awan
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const cloud of this.clouds) {
      this.drawCloud(ctx, cloud.x, cloud.y, cloud.width, cloud.height);
    }

    // ── Layer Mid: Bukit ──────────────────────────────────────
    ctx.fillStyle = '#5A8A3C';
    this.drawHills(ctx, this.offsetMid, 0.6);

    ctx.fillStyle = '#4A7A2C';
    this.drawHills(ctx, this.offsetMid * 0.7 + 200, 0.8);

    // ── Layer Near: Tanah ─────────────────────────────────────
    // Strip rumput
    ctx.fillStyle = COLORS.grassGreen;
    ctx.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 8);

    // Tanah
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Detail tanah: batu-batu kecil
    ctx.fillStyle = '#6B5020';
    const stoneCount = 8;
    for (let i = 0; i < stoneCount; i++) {
      const stoneX = ((i * (CANVAS_WIDTH / stoneCount)) - this.offsetNear * 0.5 + CANVAS_WIDTH) % CANVAS_WIDTH;
      const stoneY = GROUND_Y + 15;
      ctx.beginPath();
      ctx.ellipse(stoneX, stoneY, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w / 3, y + h / 2 + 5, w / 3, h / 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + (w * 2) / 3, y + h / 2 + 3, w / 3.5, h / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHills(
    ctx: CanvasRenderingContext2D,
    offset: number,
    heightRatio: number,
  ): void {
    const hillWidth = 200;
    const hillHeight = 80 * heightRatio;
    const hillY = GROUND_Y - 8;

    ctx.beginPath();
    ctx.moveTo(0, hillY);

    for (let x = -hillWidth; x < CANVAS_WIDTH + hillWidth; x += hillWidth) {
      const hx = (x - offset + CANVAS_WIDTH * 2) % (CANVAS_WIDTH + hillWidth * 2);
      ctx.quadraticCurveTo(
        hx - hillWidth / 2,
        hillY - hillHeight * 1.5,
        hx,
        hillY,
      );
    }

    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  reset(): void {
    this.offsetFar = 0;
    this.offsetMid = 0;
    this.offsetNear = 0;
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push(this.createCloud((CANVAS_WIDTH / 5) * i));
    }
  }
}
