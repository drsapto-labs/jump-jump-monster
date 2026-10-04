/**
 * Collectible — Bintang yang bisa dikumpulkan untuk score + multiplier.
 *
 * Fitur:
 * - Animasi berputar (rotation)
 * - Magnet zone: auto-collect jika player dekat
 * - Spawn di ketinggian acak agar menarik
 */

import { COLORS, GROUND_Y } from '@utils/constants';
import { rectsOverlap, type Rect } from '@utils/helpers';
import type { CanvasRenderer } from '@core/canvas-renderer';
import type { Player } from '@game/player';

const MAGNET_RADIUS = 80; // px — jarak auto-collect
const COLLECTIBLE_SIZE = 20;

export class Collectible {
  x: number;
  y: number;
  active = true;
  private rotation = 0;
  private pulseTimer = 0;

  constructor(x: number) {
    this.x = x;
    // Spawn di ketinggian acak: ground level atau melayang di udara
    this.y = Math.random() > 0.5
      ? GROUND_Y - COLLECTIBLE_SIZE - 10  // di tanah
      : GROUND_Y - 80 - Math.random() * 60; // melayang
  }

  get bounds(): Rect {
    return {
      x: this.x - COLLECTIBLE_SIZE / 2,
      y: this.y - COLLECTIBLE_SIZE / 2,
      width: COLLECTIBLE_SIZE,
      height: COLLECTIBLE_SIZE,
    };
  }

  update(dt: number, worldSpeed: number, player: Player): boolean {
    const delta = (worldSpeed * dt) / 16;
    this.rotation += 0.05 * delta;
    this.pulseTimer += dt;

    // Magnet: jika dekat player, gerak mendekati player
    const dx = (player.x + player.width / 2) - this.x;
    const dy = (player.y + player.height / 2) - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MAGNET_RADIUS) {
      // Tarik ke player
      this.x += dx * 0.12 * delta;
      this.y += dy * 0.12 * delta;
    } else {
      // Gerak normal ke kiri
      this.x -= delta;
    }

    // Keluar layar kiri
    if (this.x + COLLECTIBLE_SIZE < 0) {
      this.active = false;
      return false;
    }

    // Collision dengan player
    const playerBounds: Rect = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
    };
    if (rectsOverlap(this.bounds, playerBounds)) {
      this.active = false;
      return true; // COLLECTED
    }

    return false;
  }

  render(renderer: CanvasRenderer): void {
    const ctx = renderer.ctx;
    const pulse = 1 + Math.sin(this.pulseTimer / 200) * 0.1;
    const size = COLLECTIBLE_SIZE * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Glow effect
    ctx.shadowColor = COLORS.collectible;
    ctx.shadowBlur = 12;

    // Bintang 5 sudut
    ctx.fillStyle = COLORS.collectible;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerX = Math.cos((i * 4 * Math.PI) / 5 - Math.PI / 2) * size;
      const outerY = Math.sin((i * 4 * Math.PI) / 5 - Math.PI / 2) * size;
      const innerX = Math.cos(((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2) * (size * 0.4);
      const innerY = Math.sin(((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2) * (size * 0.4);
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class CollectibleSpawner {
  private collectibles: Collectible[] = [];
  private timer = 0;
  private interval = 1800; // ms

  get active(): readonly Collectible[] { return this.collectibles; }

  update(dt: number, worldSpeed: number, player: Player): Collectible[] {
    const collected: Collectible[] = [];

    this.timer += dt;
    if (this.timer >= this.interval) {
      this.timer = 0;
      this.interval = Math.max(1200, this.interval - 5);
      // Spawn 1-3 bintang bersamaan
      const count = Math.random() > 0.6 ? 3 : Math.random() > 0.3 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        this.collectibles.push(new Collectible(820 + i * 35));
      }
    }

    for (const c of this.collectibles) {
      if (!c.active) continue;
      const wasCollected = c.update(dt, worldSpeed, player);
      if (wasCollected) collected.push(c);
    }

    this.collectibles = this.collectibles.filter((c) => c.active);
    return collected;
  }

  render(renderer: CanvasRenderer): void {
    for (const c of this.collectibles) {
      c.render(renderer);
    }
  }

  reset(): void {
    this.collectibles = [];
    this.timer = 0;
    this.interval = 1800;
  }
}
