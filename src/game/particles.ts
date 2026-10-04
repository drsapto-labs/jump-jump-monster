/**
 * Particle System — Visual juice untuk Jump Jump Monster.
 *
 * Efek partikel:
 *  1. Star Burst: Bintang-bintang berkilau saat collectible diambil
 *  2. Dust Puff: Debu tanah saat monster lompat (takeoff) dan mendarat (landing)
 *  3. Hit Sparks: Percikan benturan saat karakter terkena rintangan
 */

import type { CanvasRenderer } from '@core/canvas-renderer';
import { COLORS } from '@utils/constants';

export type ParticleShape = 'star' | 'circle' | 'spark';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  color: string;
  shape: ParticleShape;
  life: number;     // sisa hidup dalam ms
  maxLife: number;  // total hidup dalam ms
  rotation?: number;
  rotationSpeed?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  get activeCount(): number {
    return this.particles.length;
  }

  /**
   * Star Burst: Memancarkan bintang berkilau kuning emas
   */
  spawnStarBurst(x: number, y: number, count = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 2 + Math.random() * 3.5;
      const life = 400 + Math.random() * 300;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // sedikit dorongan ke atas
        gravity: 0.15,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.3 ? COLORS.collectible : '#FFF59D',
        shape: 'star',
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  /**
   * Dust Puff: Memancarkan debu halus di tanah saat lompat/mendarat
   */
  spawnDustPuff(x: number, y: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 2.5;
      const vy = -(Math.random() * 1.5 + 0.5);
      const life = 250 + Math.random() * 200;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 4,
        vx,
        vy,
        gravity: 0.04,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#D7CCC8' : '#A1887F',
        shape: 'circle',
        life,
        maxLife: life,
      });
    }
  }

  /**
   * Hit Sparks: Percikan merah-oranye saat benturan obstacle
   */
  spawnHitSparks(x: number, y: number, count = 14): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      const life = 350 + Math.random() * 250;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.2,
        size: 2.5 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#FF5252' : '#FFD700',
        shape: 'spark',
        life,
        maxLife: life,
      });
    }
  }

  /**
   * Bubble Pop: Letusan butiran gelembung biru/cyan berkilau saat shield pecah/diambil
   */
  spawnBubblePop(x: number, y: number, count = 16): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 2.5 + Math.random() * 3.5;
      const life = 350 + Math.random() * 250;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        gravity: 0.08,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#00E5FF' : '#E0F7FA',
        shape: 'circle',
        life,
        maxLife: life,
      });
    }
  }

  update(dt: number): void {
    const frameFactor = dt / 16;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;

      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * frameFactor;
      p.y += p.vy * frameFactor;
      p.vy += p.gravity * frameFactor;

      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * frameFactor;
      }
    }
  }

  render(renderer: CanvasRenderer): void {
    const ctx = renderer.ctx;

    for (const p of this.particles) {
      const progress = p.life / p.maxLife; // 1 -> 0
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, progress));
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        const r = p.size * (0.6 + progress * 0.4);
        this.drawStar(ctx, 0, 0, 4, r, r * 0.4);
      } else if (p.shape === 'circle') {
        const r = p.size * (0.8 + (1 - progress) * 0.5); // debu membesar sedikit saat memudar
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  reset(): void {
    this.particles = [];
  }
}
