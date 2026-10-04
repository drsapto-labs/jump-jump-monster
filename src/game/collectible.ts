/**
 * Collectible — Bintang & Bubble Shield yang bisa dikumpulkan pemain.
 *
 * Tipe:
 *  1. STAR: Bintang kuning untuk poin & multiplier.
 *  2. SHIELD: Gelembung pelindung 🫧 yang memberi kekebalan 1 kali dari tabrakan.
 */

import { COLORS, GROUND_Y } from '@utils/constants';
import { rectsOverlap, type Rect } from '@utils/helpers';
import type { CanvasRenderer } from '@core/canvas-renderer';
import type { Player } from '@game/player';

export type CollectibleType = 'STAR' | 'SHIELD';

const MAGNET_RADIUS = 80; // px — jarak auto-collect
const COLLECTIBLE_SIZE = 22;

export class Collectible {
  x: number;
  y: number;
  active = true;
  readonly type: CollectibleType;
  private rotation = 0;
  private pulseTimer = 0;

  constructor(x: number, type: CollectibleType = 'STAR') {
    this.x = x;
    this.type = type;

    if (type === 'SHIELD') {
      // Shield melayang di ketinggian lompat anak
      this.y = GROUND_Y - 90 - Math.random() * 35;
    } else {
      // Bintang: acak antara tanah atau melayang
      this.y = Math.random() > 0.5
        ? GROUND_Y - COLLECTIBLE_SIZE - 10
        : GROUND_Y - 80 - Math.random() * 60;
    }
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
    const dx = player.x + player.width / 2 - this.x;
    const dy = player.y + player.height / 2 - this.y;
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

    if (this.type === 'SHIELD') {
      // ── Render Bubble Shield Collectible ───────────────────────
      const r = size * 0.85;

      // Glow cyan
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 14;

      // Bubble radial gradient
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.45)');
      grad.addColorStop(1, 'rgba(0, 180, 216, 0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Specular shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.28, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Cute shield emoji / icon
      ctx.font = `${Math.round(r * 1.1)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', 0, 1);
    } else {
      // ── Render Bintang Emas ──────────────────────────────────
      ctx.rotate(this.rotation);
      ctx.shadowColor = COLORS.collectible;
      ctx.shadowBlur = 12;
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
    }

    ctx.restore();
  }
}

export class CollectibleSpawner {
  private collectibles: Collectible[] = [];
  private timer = 0;
  private interval = 1800; // ms
  private shieldTimer = 0;
  private readonly SHIELD_SPAWN_INTERVAL = 14000; // ms (setiap ~14 detik)

  get active(): readonly Collectible[] {
    return this.collectibles;
  }

  update(dt: number, worldSpeed: number, player: Player): Collectible[] {
    const collected: Collectible[] = [];

    // 1. Spawner Bintang Biasa
    this.timer += dt;
    if (this.timer >= this.interval) {
      this.timer = 0;
      this.interval = Math.max(1200, this.interval - 5);
      // Spawn 1-3 bintang bersamaan
      const count = Math.random() > 0.6 ? 3 : Math.random() > 0.3 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        this.collectibles.push(new Collectible(820 + i * 35, 'STAR'));
      }
    }

    // 2. Spawner Bubble Shield (Setiap ~14s jika belum ada shield di layar)
    this.shieldTimer += dt;
    const hasShieldOnScreen = this.collectibles.some((c) => c.type === 'SHIELD');
    if (this.shieldTimer >= this.SHIELD_SPAWN_INTERVAL && !hasShieldOnScreen) {
      this.shieldTimer = 0;
      this.collectibles.push(new Collectible(850, 'SHIELD'));
    }

    // Update semua collectible
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
    this.shieldTimer = 0;
  }
}
