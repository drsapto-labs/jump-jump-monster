/**
 * Game Loop — Fixed timestep with requestAnimationFrame.
 *
 * Memisahkan update (logic) dari render (draw).
 * Delta time di-clamp agar physics tidak meledak saat tab switch.
 */

import { MAX_DELTA_TIME } from '@utils/constants';
import { clamp } from '@utils/helpers';

export type UpdateFn = (dt: number) => void;
export type RenderFn = (interpolation: number) => void;

export class GameLoop {
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private _isRunning = false;
  private _fps = 0;
  private frameCount = 0;
  private fpsTimestamp = 0;

  constructor(
    private readonly onUpdate: UpdateFn,
    private readonly onRender: RenderFn,
  ) {}

  get isRunning(): boolean {
    return this._isRunning;
  }

  get fps(): number {
    return this._fps;
  }

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this.lastTimestamp = performance.now();
    this.fpsTimestamp = this.lastTimestamp;
    this.frameCount = 0;
    this.animFrameId = requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this._isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    if (!this._isRunning) return;

    // Delta time in milliseconds, clamped agar tidak meledak
    const rawDt = timestamp - this.lastTimestamp;
    const dt = clamp(rawDt, 0, MAX_DELTA_TIME);
    this.lastTimestamp = timestamp;

    // FPS counter
    this.frameCount++;
    if (timestamp - this.fpsTimestamp >= 1000) {
      this._fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimestamp = timestamp;
    }

    // Update game logic
    this.onUpdate(dt);

    // Render
    this.onRender(0);

    // Schedule next frame
    this.animFrameId = requestAnimationFrame((t) => this.tick(t));
  }
}
