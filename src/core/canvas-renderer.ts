/**
 * Canvas Renderer — Abstraksi rendering 2D.
 *
 * Keputusan arsitektur LOCKED: Custom Canvas API (bukan Phaser.js).
 * Alasan: kontrol penuh bundle size, game ini cukup sederhana untuk custom canvas.
 *
 * Jika di kemudian hari perlu Phaser, bisa buat PhaserRenderer yang
 * implement interface yang sama.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '@utils/constants';
import { debounce } from '@utils/helpers';

export class CanvasRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private _scale = 1;

  // ─── Visual Effects (Screen Shake & Flash) ─────────────────
  private shakeTime = 0;
  private shakeDuration = 0;
  private shakeMagnitude = 0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;

  private flashColor = 'rgba(255, 60, 60, 0.35)';
  private flashTime = 0;
  private flashDuration = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    this.canvas.style.imageRendering = 'pixelated';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context — browser unsupported');
    }
    this.ctx = ctx;

    container.appendChild(this.canvas);
    this.fitToViewport();

    window.addEventListener(
      'resize',
      debounce(() => this.fitToViewport(), 200),
    );

    // Pause saat tab tidak aktif (hemat CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onVisibilityChange?.(false);
      } else {
        this.onVisibilityChange?.(true);
      }
    });
  }

  /** Callback saat tab visibility berubah */
  onVisibilityChange: ((visible: boolean) => void) | null = null;

  get scale(): number {
    return this._scale;
  }

  /** Scale canvas agar fit viewport tanpa distorsi */
  private fitToViewport(): void {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const scaleX = maxWidth / CANVAS_WIDTH;
    const scaleY = maxHeight / CANVAS_HEIGHT;
    this._scale = Math.min(scaleX, scaleY);

    this.canvas.style.width = `${CANVAS_WIDTH * this._scale}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT * this._scale}px`;
  }

  /** Clear entire canvas */
  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /** Fill background with solid color */
  fillBackground(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /** Draw filled rectangle */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /** Draw circle */
  drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /** Draw text with shadow (HUD-style) */
  drawText(
    text: string,
    x: number,
    y: number,
    options: {
      font?: string;
      color?: string;
      align?: CanvasTextAlign;
      shadow?: boolean;
    } = {},
  ): void {
    const {
      font = '20px sans-serif',
      color = COLORS.hud,
      align = 'left',
      shadow = true,
    } = options;

    this.ctx.font = font;
    this.ctx.textAlign = align;

    if (shadow) {
      this.ctx.fillStyle = COLORS.hudShadow;
      this.ctx.fillText(text, x + 2, y + 2);
    }

    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  /** Draw image/sprite */
  drawImage(
    img: HTMLImageElement | HTMLCanvasElement,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.ctx.drawImage(img, x, y, width, height);
  }

  /** Draw sprite from spritesheet */
  drawSprite(
    img: HTMLImageElement,
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    destX: number,
    destY: number,
    destW: number,
    destH: number,
  ): void {
    this.ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
  }

  // ─── Camera & Feedback Effects ─────────────────────────────

  /** Trigger camera shake */
  shake(intensity = 8, durationMs = 280): void {
    this.shakeMagnitude = intensity;
    this.shakeDuration = durationMs;
    this.shakeTime = durationMs;
  }

  /** Trigger screen flash overlay */
  flash(color = 'rgba(255, 60, 60, 0.35)', durationMs = 180): void {
    this.flashColor = color;
    this.flashDuration = durationMs;
    this.flashTime = durationMs;
  }

  /** Update visual effect timers */
  updateEffects(dt: number): void {
    // Update screen shake
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const progress = Math.max(0, this.shakeTime / this.shakeDuration);
      const intensity = this.shakeMagnitude * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * intensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * intensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Update screen flash
    if (this.flashTime > 0) {
      this.flashTime -= dt;
    }
  }

  /** Apply camera translation (e.g. screen shake) */
  applyCamera(): void {
    this.ctx.save();
    if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
      this.ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
    }
  }

  /** Restore camera transform */
  restoreCamera(): void {
    this.ctx.restore();
  }

  /** Render flash overlay if active */
  renderFlash(): void {
    if (this.flashTime > 0 && this.flashDuration > 0) {
      const alpha = this.flashTime / this.flashDuration;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      this.ctx.fillStyle = this.flashColor;
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.ctx.restore();
    }
  }

  /** Reset all ongoing visual effects */
  resetEffects(): void {
    this.shakeTime = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.flashTime = 0;
  }
}
