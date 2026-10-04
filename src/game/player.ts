/**
 * Player — Karakter utama game.
 *
 * State: RUNNING → JUMPING → RUNNING
 *                → DUCKING → RUNNING
 *
 * Posisi X tetap (PLAYER_X), dunia yang bergerak.
 * Semua angka dari constants.ts — tidak ada magic number.
 */

import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_X,
  PLAYER_GROUND_Y,
  JUMP_VELOCITY,
  GRAVITY,
  DUCK_HEIGHT,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  PLAYER_LEAN_SPEED,
  PLAYER_LEAN_ANGLE,
  COLORS,
  FORGIVING_HITBOX_SHRINK,
} from '@utils/constants';
import { clamp, shrinkRect, type Rect } from '@utils/helpers';
import type { CanvasRenderer } from '@core/canvas-renderer';

export enum PlayerState {
  RUNNING = 'RUNNING',
  JUMPING = 'JUMPING',
  DUCKING = 'DUCKING',
  HURT = 'HURT',
}

export class Player {
  private _state: PlayerState = PlayerState.RUNNING;
  private _y: number = PLAYER_GROUND_Y - PLAYER_HEIGHT;
  private _vy: number = 0;
  // Horizontal lean & tilt
  private _x: number = PLAYER_X;
  private targetX: number = PLAYER_X;
  private leanDir: 'LEFT' | 'RIGHT' | 'CENTER' = 'CENTER';
  private tiltAngle: number = 0;

  // Visual feedback
  private hurtTimer = 0;
  private readonly HURT_DURATION = 500; // ms

  // Squash & stretch animation
  private scaleX = 1;
  private scaleY = 1;
  private animTimer = 0;

  // Particle callbacks
  onTakeoff?: () => void;
  onLand?: () => void;

  get state(): PlayerState {
    return this._state;
  }

  get leanDirection(): 'LEFT' | 'RIGHT' | 'CENTER' {
    return this.leanDir;
  }

  get y(): number {
    return this._y;
  }

  get x(): number {
    return this._x;
  }

  setLean(dir: 'LEFT' | 'RIGHT' | 'CENTER'): void {
    this.leanDir = dir;
    if (dir === 'LEFT') {
      this.targetX = PLAYER_MIN_X;
    } else if (dir === 'RIGHT') {
      this.targetX = PLAYER_MAX_X;
    } else {
      this.targetX = PLAYER_X;
    }
  }

  get width(): number {
    return PLAYER_WIDTH;
  }

  get height(): number {
    return this._state === PlayerState.DUCKING ? DUCK_HEIGHT : PLAYER_HEIGHT;
  }

  /** Hitbox untuk collision — forgiving (lebih kecil dari visual) */
  get hitbox(): Rect {
    const visual: Rect = {
      x: this.x,
      y: this._y,
      width: this.width,
      height: this.height,
    };
    return shrinkRect(visual, FORGIVING_HITBOX_SHRINK);
  }

  jump(): void {
    // Hanya bisa lompat dari tanah
    if (this._state === PlayerState.RUNNING) {
      this._state = PlayerState.JUMPING;
      this._vy = JUMP_VELOCITY;
      // Squash saat takeoff
      this.scaleX = 0.8;
      this.scaleY = 1.3;
      this.animTimer = 150;
      this.onTakeoff?.();
    }
  }

  startDuck(): void {
    if (
      this._state === PlayerState.RUNNING ||
      this._state === PlayerState.JUMPING
    ) {
      this._state = PlayerState.DUCKING;
      // Saat duck dari lompat — turun cepat
      if (this._vy < 0) this._vy = 2;
    }
  }

  endDuck(): void {
    if (this._state === PlayerState.DUCKING) {
      this._state = PlayerState.RUNNING;
    }
  }

  hurt(): void {
    this._state = PlayerState.HURT;
    this.hurtTimer = this.HURT_DURATION;
  }

  get isAlive(): boolean {
    return this._state !== PlayerState.HURT || this.hurtTimer > 0;
  }

  update(dt: number): void {
    // Hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
    }

    // Horizontal movement (lean)
    const moveDist = PLAYER_LEAN_SPEED * dt;
    if (Math.abs(this.targetX - this._x) <= moveDist) {
      this._x = this.targetX;
    } else {
      this._x += Math.sign(this.targetX - this._x) * moveDist;
    }

    // Tilt angle lerp
    const targetTilt =
      this.leanDir === 'LEFT'
        ? -PLAYER_LEAN_ANGLE
        : this.leanDir === 'RIGHT'
          ? PLAYER_LEAN_ANGLE
          : 0;
    this.tiltAngle += (targetTilt - this.tiltAngle) * Math.min(1, dt * 0.015);

    // Animasi squash & stretch
    if (this.animTimer > 0) {
      this.animTimer -= dt;
      const t = 1 - this.animTimer / 150;
      this.scaleX = 0.8 + t * 0.2; // lerp ke 1.0
      this.scaleY = 1.3 - t * 0.3;
    } else {
      this.scaleX = 1;
      this.scaleY = 1;
    }

    // Physics — hanya saat melompat
    if (
      this._state === PlayerState.JUMPING ||
      this._state === PlayerState.DUCKING
    ) {
      this._vy += GRAVITY;
      this._y += this._vy;

      const groundY = PLAYER_GROUND_Y - this.height;

      // Mendarat
      if (this._y >= groundY) {
        this._y = groundY;
        this._vy = 0;

        if (this._state === PlayerState.JUMPING) {
          this._state = PlayerState.RUNNING;
          // Squash saat mendarat
          this.scaleX = 1.3;
          this.scaleY = 0.8;
          this.animTimer = 120;
          this.onLand?.();
        } else if (this._state === PlayerState.DUCKING) {
          // Tetap ducking jika masih menahan tombol
        }
      }
    }

    // Clamp posisi agar tidak keluar layar
    this._y = clamp(this._y, 0, PLAYER_GROUND_Y - this.height);
  }

  render(renderer: CanvasRenderer): void {
    const ctx = renderer.ctx;
    const h = this.height;
    const w = this.width;
    const drawX = this.x + w / 2;
    const drawY = this._y + h / 2;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.scale(this.scaleX, this.scaleY);
    if (this.tiltAngle !== 0) {
      ctx.rotate(this.tiltAngle);
    }

    // Hurt: flash merah
    const isHurtFlash =
      this._state === PlayerState.HURT && Math.floor(this.hurtTimer / 80) % 2 === 0;

    // Body
    ctx.fillStyle = isHurtFlash ? '#FF0000' : COLORS.playerBody;
    ctx.beginPath();
    // Rounded rect untuk karakter monster
    const r = 8;
    ctx.roundRect(-w / 2, -h / 2, w, h, r);
    ctx.fill();

    // Eyes (hanya saat berdiri atau lompat, tidak saat duck)
    if (this._state !== PlayerState.DUCKING) {
      // Mata kiri
      ctx.fillStyle = COLORS.playerEyes;
      ctx.beginPath();
      ctx.arc(-w / 4, -h / 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Mata kanan
      ctx.beginPath();
      ctx.arc(w / 4, -h / 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pupil kiri
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(-w / 4 + 2, -h / 4 + 1, 3, 0, Math.PI * 2);
      ctx.fill();

      // Pupil kanan
      ctx.beginPath();
      ctx.arc(w / 4 + 2, -h / 4 + 1, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Saat duck: mata berubah jadi garis (merem)
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w / 4 - 5, -h / 4);
      ctx.lineTo(-w / 4 + 5, -h / 4);
      ctx.moveTo(w / 4 - 5, -h / 4);
      ctx.lineTo(w / 4 + 5, -h / 4);
      ctx.stroke();
    }

    // Running animation: kaki bergerak
    if (this._state === PlayerState.RUNNING) {
      const legAnim = Math.sin(Date.now() / 100) * 5;
      ctx.fillStyle = COLORS.playerBody;
      // Kaki kiri
      ctx.fillRect(-w / 2 + 4, h / 2 - 4, 12, 8 + legAnim);
      // Kaki kanan
      ctx.fillRect(w / 2 - 16, h / 2 - 4, 12, 8 - legAnim);
    }

    ctx.restore();
  }

  reset(): void {
    this._state = PlayerState.RUNNING;
    this._x = PLAYER_X;
    this.targetX = PLAYER_X;
    this.leanDir = 'CENTER';
    this.tiltAngle = 0;
    this._y = PLAYER_GROUND_Y - PLAYER_HEIGHT;
    this._vy = 0;
    this.hurtTimer = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.animTimer = 0;
  }
}
