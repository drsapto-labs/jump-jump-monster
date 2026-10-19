/**
 * Icons — Canvas 2D-drawn icon library for Jump Jump Monster
 *
 * Menggantikan semua emoji (🎮📹🙌⬆️📱⌨️🧍📸🏆💥⏸🔇🔊🛡️⭐🥤🎉)
 * dengan ikon vektor yang konsisten lintas platform/browser.
 *
 * Setiap fungsi menerima (ctx, cx, cy, size) di mana cx/cy = center.
 */

import { THEME } from './theme';

// ─── Star (Score / Best) ──────────────────────────────────────

/** Bintang 5-titik, fill gold */
export function drawStarIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.gold,
): void {
  const outerR = size / 2;
  const innerR = outerR * 0.4;
  const points = 5;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Speaker (Mute Toggle) ───────────────────────────────────

/** Speaker icon — garis silang merah jika muted */
export function drawSpeakerIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  muted: boolean,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  // Body speaker
  ctx.fillStyle = muted ? THEME.textMuted : THEME.textSecondary;
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.25);
  ctx.lineTo(-s * 0.15, -s * 0.25);
  ctx.lineTo(s * 0.35, -s * 0.65);
  ctx.lineTo(s * 0.35, s * 0.65);
  ctx.lineTo(-s * 0.15, s * 0.25);
  ctx.lineTo(-s * 0.5, s * 0.25);
  ctx.closePath();
  ctx.fill();

  if (!muted) {
    // Sound waves
    ctx.strokeStyle = THEME.textSecondary;
    ctx.lineWidth = Math.max(1.5, size * 0.08);
    ctx.lineCap = 'round';

    // Wave 1
    ctx.beginPath();
    ctx.arc(s * 0.4, 0, s * 0.3, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Wave 2
    ctx.beginPath();
    ctx.arc(s * 0.4, 0, s * 0.55, -Math.PI / 3.5, Math.PI / 3.5);
    ctx.stroke();
  } else {
    // X silang
    ctx.strokeStyle = THEME.danger;
    ctx.lineWidth = Math.max(2, size * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.35);
    ctx.lineTo(s * 0.7, s * 0.35);
    ctx.moveTo(s * 0.7, -s * 0.35);
    ctx.lineTo(s * 0.2, s * 0.35);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Shield ───────────────────────────────────────────────────

/** Shield icon — outline cyan */
export function drawShieldIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.cyan,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.85);
  ctx.quadraticCurveTo(s * 0.8, -s * 0.55, s * 0.7, 0);
  ctx.quadraticCurveTo(s * 0.5, s * 0.7, 0, s * 0.9);
  ctx.quadraticCurveTo(-s * 0.5, s * 0.7, -s * 0.7, 0);
  ctx.quadraticCurveTo(-s * 0.8, -s * 0.55, 0, -s * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.07);
  ctx.stroke();

  ctx.restore();
}

// ─── Play Triangle ────────────────────────────────────────────

/** Play button triangle */
export function drawPlayIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.textPrimary,
): void {
  const s = size / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.35, cy - s * 0.55);
  ctx.lineTo(cx + s * 0.55, cy);
  ctx.lineTo(cx - s * 0.35, cy + s * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Camera ───────────────────────────────────────────────────

/** Camera body + lens circle */
export function drawCameraIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.textSecondary,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = color;
  // Body
  ctx.beginPath();
  ctx.roundRect(-s * 0.7, -s * 0.35, s * 1.4, s * 0.85, s * 0.12);
  ctx.fill();

  // Flash hump
  ctx.beginPath();
  ctx.roundRect(-s * 0.15, -s * 0.55, s * 0.55, s * 0.25, [s * 0.08, s * 0.08, 0, 0]);
  ctx.fill();

  // Lens ring
  ctx.strokeStyle = THEME.nightBase;
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.beginPath();
  ctx.arc(0, s * 0.05, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  // Lens dot
  ctx.fillStyle = THEME.nightBase;
  ctx.beginPath();
  ctx.arc(0, s * 0.05, s * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Pause ────────────────────────────────────────────────────

/** Two vertical parallel bars */
export function drawPauseIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.textPrimary,
): void {
  const s = size / 2;
  const barW = s * 0.28;
  const barH = s * 1.2;
  const gap = s * 0.22;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(cx - gap - barW, cy - barH / 2, barW, barH, barW * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + gap, cy - barH / 2, barW, barH, barW * 0.3);
  ctx.fill();
  ctx.restore();
}

// ─── Back Arrow (Chevron Left) ────────────────────────────────

/** Chevron kiri untuk navigasi back */
export function drawBackArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.textSecondary,
): void {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.25, cy - s * 0.5);
  ctx.lineTo(cx - s * 0.25, cy);
  ctx.lineTo(cx + s * 0.25, cy + s * 0.5);
  ctx.stroke();
  ctx.restore();
}

// ─── Trophy ───────────────────────────────────────────────────

/** Trophy icon for high score / new record */
export function drawTrophyIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = THEME.gold,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = color;

  // Cup body
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.6);
  ctx.lineTo(s * 0.45, -s * 0.6);
  ctx.quadraticCurveTo(s * 0.45, s * 0.15, 0, s * 0.25);
  ctx.quadraticCurveTo(-s * 0.45, s * 0.15, -s * 0.45, -s * 0.6);
  ctx.closePath();
  ctx.fill();

  // Handles
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.07);
  ctx.lineCap = 'round';
  // Left
  ctx.beginPath();
  ctx.arc(-s * 0.52, -s * 0.25, s * 0.2, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  // Right
  ctx.beginPath();
  ctx.arc(s * 0.52, -s * 0.25, s * 0.2, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  // Stem
  ctx.fillRect(-s * 0.08, s * 0.2, s * 0.16, s * 0.25);

  // Base
  ctx.beginPath();
  ctx.roundRect(-s * 0.3, s * 0.4, s * 0.6, s * 0.15, s * 0.05);
  ctx.fill();

  ctx.restore();
}

// ─── Monster Character Drawing ───────────────────────────────

export type MonsterMood = 'idle' | 'happy' | 'sad' | 'sleeping';

/**
 * Draw the game's monster character at given position.
 * Used in menu (idle), game-over (sad), pause (sleeping).
 *
 * @param animTime — timestamp for idle bounce / expression animation
 */
export function drawMonster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  mood: MonsterMood,
  animTime: number,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  // Idle bounce
  const bounce = mood === 'idle'
    ? Math.sin(animTime / 400) * s * 0.06
    : mood === 'sleeping'
      ? Math.sin(animTime / 800) * s * 0.03
      : 0;
  ctx.translate(0, bounce);

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  const shadowScale = 1 - Math.abs(bounce) / (s * 0.12);
  ctx.beginPath();
  ctx.ellipse(0, s * 0.85, s * 0.55 * shadowScale, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = THEME.primary;
  ctx.beginPath();
  ctx.roundRect(-s * 0.55, -s * 0.7, s * 1.1, s * 1.45, s * 0.2);
  ctx.fill();

  // Body highlight (subtle gradient feel)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.roundRect(-s * 0.45, -s * 0.6, s * 0.55, s * 0.5, s * 0.12);
  ctx.fill();

  // Eyes
  if (mood === 'sad') {
    // X_X eyes
    const eyeSize = s * 0.14;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = Math.max(2, s * 0.06);
    ctx.lineCap = 'round';
    // Left X
    ctx.beginPath();
    ctx.moveTo(-s * 0.22 - eyeSize, -s * 0.28 - eyeSize);
    ctx.lineTo(-s * 0.22 + eyeSize, -s * 0.28 + eyeSize);
    ctx.moveTo(-s * 0.22 + eyeSize, -s * 0.28 - eyeSize);
    ctx.lineTo(-s * 0.22 - eyeSize, -s * 0.28 + eyeSize);
    ctx.stroke();
    // Right X
    ctx.beginPath();
    ctx.moveTo(s * 0.22 - eyeSize, -s * 0.28 - eyeSize);
    ctx.lineTo(s * 0.22 + eyeSize, -s * 0.28 + eyeSize);
    ctx.moveTo(s * 0.22 + eyeSize, -s * 0.28 - eyeSize);
    ctx.lineTo(s * 0.22 - eyeSize, -s * 0.28 + eyeSize);
    ctx.stroke();
  } else if (mood === 'sleeping') {
    // Closed eyes — (‿_‿)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-s * 0.22, -s * 0.25, s * 0.1, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.22, -s * 0.25, s * 0.1, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Z Z Z
    ctx.fillStyle = THEME.textSecondary;
    ctx.font = `bold ${Math.round(s * 0.22)}px ${THEME.primary}`;
    ctx.globalAlpha = 0.5 + Math.sin(animTime / 500) * 0.3;
    const zOffset = Math.sin(animTime / 600) * s * 0.05;
    ctx.fillText('z', s * 0.55, -s * 0.55 + zOffset);
    ctx.font = `bold ${Math.round(s * 0.28)}px system-ui`;
    ctx.fillText('Z', s * 0.72, -s * 0.75 + zOffset * 1.3);
    ctx.font = `bold ${Math.round(s * 0.35)}px system-ui`;
    ctx.fillText('Z', s * 0.9, -s * 1.0 + zOffset * 1.6);
    ctx.globalAlpha = 1;
  } else {
    // Normal / happy eyes
    const blinkCycle = animTime % 3000;
    const isBlinking = blinkCycle > 2850;

    if (isBlinking) {
      // Blink — garis horizontal
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = Math.max(2, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(-s * 0.32, -s * 0.28);
      ctx.lineTo(-s * 0.12, -s * 0.28);
      ctx.moveTo(s * 0.12, -s * 0.28);
      ctx.lineTo(s * 0.32, -s * 0.28);
      ctx.stroke();
    } else {
      // Open eyes — putih + pupil
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-s * 0.22, -s * 0.28, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.22, -s * 0.28, s * 0.13, 0, Math.PI * 2);
      ctx.fill();

      // Pupils — slight movement
      const pupilShift = Math.sin(animTime / 1200) * s * 0.03;
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(-s * 0.22 + pupilShift, -s * 0.27, s * 0.065, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.22 + pupilShift, -s * 0.27, s * 0.065, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(-s * 0.25, -s * 0.32, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.19, -s * 0.32, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Mouth
  if (mood === 'sad') {
    // Frown
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -s * 0.02, s * 0.15, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else if (mood === 'sleeping') {
    // Tiny peaceful mouth
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = Math.max(1.5, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.05);
    ctx.lineTo(s * 0.08, -s * 0.05);
    ctx.stroke();
  } else {
    // Happy smile
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -s * 0.12, s * 0.16, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }

  // Feet
  const legAnim = mood === 'idle' ? Math.sin(animTime / 200) * s * 0.04 : 0;
  ctx.fillStyle = THEME.primaryDark;
  ctx.beginPath();
  ctx.roundRect(-s * 0.45, s * 0.68, s * 0.3, s * 0.14 + legAnim, s * 0.04);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(s * 0.15, s * 0.68, s * 0.3, s * 0.14 - legAnim, s * 0.04);
  ctx.fill();

  ctx.restore();
}

/** Alias for drawMonster */
export const drawMonsterCharacter = drawMonster;

/** Water glass / drink cup icon for break reminder */
export function drawCupIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = THEME.cyan,
): void {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);

  // Cup body (tapered tumbler)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.7);
  ctx.lineTo(s * 0.45, -s * 0.7);
  ctx.lineTo(s * 0.32, s * 0.7);
  ctx.lineTo(-s * 0.32, s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.08);
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Water fill line
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 0.38, -s * 0.1);
  ctx.lineTo(s * 0.38, -s * 0.1);
  ctx.lineTo(s * 0.30, s * 0.65);
  ctx.lineTo(-s * 0.30, s * 0.65);
  ctx.closePath();
  ctx.fill();

  // Straw
  ctx.strokeStyle = THEME.gold;
  ctx.lineWidth = Math.max(1.5, size * 0.07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.3);
  ctx.lineTo(s * 0.2, -s * 0.85);
  ctx.lineTo(s * 0.45, -s * 0.95);
  ctx.stroke();

  ctx.restore();
}

