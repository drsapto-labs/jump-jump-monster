/**
 * Score Manager — Skor, multiplier, high score.
 *
 * Defensive guards:
 * - Score selalu integer non-negatif
 * - localStorage wrapped try-catch
 * - Multiplier di-clamp ke MULTIPLIER_MAX
 */

import {
  SCORE_PER_SECOND,
  SCORE_PER_COLLECTIBLE,
  MULTIPLIER_MAX,
  MULTIPLIER_DECAY_MS,
} from '@utils/constants';
import { clamp, safeLocalGet, safeLocalSet, formatScore } from '@utils/helpers';

const LS_KEY_HIGHSCORE = 'jjm_highscore';
const LS_KEY_GAMES_PLAYED = 'jjm_games_played';

export class ScoreManager {
  private _score = 0;
  private _highScore = 0;
  private _gamesPlayed = 0;
  private _multiplier = 1;
  private _multiplierTimer = 0; // ms since last collectible
  private _isNewHighScore = false;

  // Score popups untuk visual feedback
  private popups: Array<{ value: number; x: number; y: number; life: number }> = [];

  constructor() {
    this.loadFromStorage();
  }

  // ─── Getters ─────────────────────────────────────────────────
  get score(): number { return this._score; }
  get highScore(): number { return this._highScore; }
  get multiplier(): number { return this._multiplier; }
  get isNewHighScore(): boolean { return this._isNewHighScore; }
  get gamesPlayed(): number { return this._gamesPlayed; }
  get formattedScore(): string { return formatScore(this._score); }
  get formattedHighScore(): string { return formatScore(this._highScore); }

  // ─── Core Methods ────────────────────────────────────────────

  /** Tambah score per frame berdasarkan waktu survived */
  addTimeScore(dt: number): void {
    const points = (SCORE_PER_SECOND * dt) / 1000 * this._multiplier;
    this._addSafe(points);
  }

  /** Kumpul collectible — tambah score + perpanjang multiplier */
  collectItem(x: number, y: number): void {
    const points = SCORE_PER_COLLECTIBLE * this._multiplier;
    this._addSafe(points);

    // Multiplier naik
    this._multiplier = clamp(this._multiplier + 0.5, 1, MULTIPLIER_MAX);
    this._multiplierTimer = 0;

    // Tambah popup
    this.popups.push({ value: points, x, y, life: 800 });
  }

  /** Update multiplier decay dan popups */
  update(dt: number): void {
    // Multiplier decay
    this._multiplierTimer += dt;
    if (this._multiplierTimer >= MULTIPLIER_DECAY_MS) {
      this._multiplier = Math.max(1, this._multiplier - 0.5);
      this._multiplierTimer = 0;
    }

    // Update popups
    for (const popup of this.popups) {
      popup.life -= dt;
      popup.y -= 0.5; // float up
    }
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  /** Dipanggil saat game over — simpan high score */
  finalizeGame(): void {
    this._isNewHighScore = this._score > this._highScore;
    if (this._isNewHighScore) {
      this._highScore = this._score;
    }
    this._gamesPlayed++;
    this.saveToStorage();
  }

  /** Reset untuk game baru */
  reset(): void {
    this._score = 0;
    this._multiplier = 1;
    this._multiplierTimer = 0;
    this._isNewHighScore = false;
    this.popups = [];
  }

  /** Render score popups di atas canvas */
  renderPopups(ctx: CanvasRenderingContext2D): void {
    for (const popup of this.popups) {
      const alpha = popup.life / 800;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(`+${popup.value}`, popup.x, popup.y);
      ctx.restore();
    }
  }

  // ─── Private ─────────────────────────────────────────────────
  private _addSafe(points: number): void {
    if (!Number.isFinite(points) || points < 0) return;
    this._score = Math.floor(this._score + points);
  }

  private loadFromStorage(): void {
    this._highScore = parseInt(safeLocalGet(LS_KEY_HIGHSCORE) ?? '0', 10) || 0;
    this._gamesPlayed = parseInt(safeLocalGet(LS_KEY_GAMES_PLAYED) ?? '0', 10) || 0;
  }

  private saveToStorage(): void {
    safeLocalSet(LS_KEY_HIGHSCORE, String(this._highScore));
    safeLocalSet(LS_KEY_GAMES_PLAYED, String(this._gamesPlayed));
  }
}
