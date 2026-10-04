/**
 * World Speed — Difficulty scaling.
 *
 * Kecepatan naik gradual, capped di MAX_WORLD_SPEED.
 * Tidak ada angka hardcode — semua dari constants.ts.
 */

import {
  INITIAL_WORLD_SPEED,
  MAX_WORLD_SPEED,
  SPEED_INCREMENT,
} from '@utils/constants';
import { clamp } from '@utils/helpers';

export class WorldSpeed {
  private _speed: number = INITIAL_WORLD_SPEED;
  private _distanceTraveled: number = 0;

  get speed(): number {
    return this._speed;
  }

  get distance(): number {
    return this._distanceTraveled;
  }

  update(dt: number): void {
    const delta = (dt / 16); // normalize ~60fps
    this._speed = clamp(
      this._speed + SPEED_INCREMENT * delta,
      INITIAL_WORLD_SPEED,
      MAX_WORLD_SPEED,
    );
    this._distanceTraveled += this._speed * delta;
  }

  reset(): void {
    this._speed = INITIAL_WORLD_SPEED;
    this._distanceTraveled = 0;
  }
}
