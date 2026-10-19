/**
 * UI Components — Reusable Canvas 2D drawing primitives
 *
 * Tombol, panel, badge, dan background particles yang konsisten
 * di seluruh layar game (Menu, Kalibrasi, HUD, Game Over, Pause).
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@utils/constants';
import { THEME, RADIUS, font, createNightGradient } from './theme';
import { drawPlayIcon } from './icons';

// ─── Button ───────────────────────────────────────────────────

export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  style: 'primary' | 'secondary' | 'outline';
  icon?: 'play' | 'camera' | 'none';
}

/** Draw a styled button (primary=orange solid, secondary=glass, outline=border only) */
export function drawButton(
  ctx: CanvasRenderingContext2D,
  config: ButtonConfig,
): void {
  const { x, y, width, height, label, style } = config;
  const r = style === 'primary' ? RADIUS.lg : RADIUS.md;

  ctx.save();

  if (style === 'primary') {
    // Glow shadow
    ctx.shadowColor = THEME.primaryGlow;
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    // Gradient fill (top-light to bottom-dark)
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, '#FF7E4D');
    grad.addColorStop(1, THEME.primary);
    ctx.fillStyle = grad;
  } else if (style === 'secondary') {
    ctx.fillStyle = THEME.glass;
  } else {
    ctx.fillStyle = 'transparent';
  }

  // Draw body
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Border for secondary/outline
  if (style === 'secondary' || style === 'outline') {
    ctx.strokeStyle = THEME.glassBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Subtle top highlight for primary
  if (style === 'primary') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 1, width - 4, height * 0.45, [r, r, 0, 0]);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = style === 'primary' ? THEME.textPrimary : THEME.textSecondary;
  ctx.font = font('bodyBold');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textX = x + width / 2;
  const textY = y + height / 2 + 1;

  // Play icon if requested
  if (config.icon === 'play') {
    const iconSize = 14;
    const totalWidth = ctx.measureText(label).width + iconSize + 8;
    const iconX = textX - totalWidth / 2 + iconSize / 2;
    drawPlayIcon(ctx, iconX, textY - 1, iconSize, ctx.fillStyle as string);
    ctx.fillText(label, textX + iconSize / 2 + 4, textY);
  } else {
    ctx.fillText(label, textX, textY);
  }

  ctx.restore();
}

// ─── Glass Panel ──────────────────────────────────────────────

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  opacity?: number;
}

/** Semi-transparent glass panel with subtle border */
export function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  config: PanelConfig,
): void {
  const { x, y, width, height, radius = RADIUS.md, opacity = 0.07 } = config;

  ctx.save();

  // Fill
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity + 0.06})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ─── Pill Badge ───────────────────────────────────────────────

export interface BadgeConfig {
  cx: number;
  cy: number;
  text: string;
  color?: string;
  bgColor?: string;
}

/** Small pill-shaped badge (e.g. multiplier, shield active) */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  config: BadgeConfig,
): void {
  const { cx, cy, text, color = THEME.textPrimary, bgColor = THEME.glass } = config;

  ctx.save();
  ctx.font = font('captionBold');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const padX = 12;
  const padY = 6;
  const w = metrics.width + padX * 2;
  const h = 22 + padY;

  // Background pill
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, RADIUS.pill);
  ctx.fill();

  // Border
  ctx.strokeStyle = THEME.glassBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy + 1);

  ctx.restore();
}

// ─── Night Sky Background ─────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  phase: number;
}

// Persistent particles across frames
let bgParticles: Particle[] | null = null;

function ensureParticles(): Particle[] {
  if (!bgParticles) {
    bgParticles = [];
    for (let i = 0; i < 40; i++) {
      bgParticles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: 0.8 + Math.random() * 2,
        speed: 0.08 + Math.random() * 0.15,
        opacity: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  return bgParticles;
}

/**
 * Render the unified night-sky background with animated floating particles.
 * Used in Menu, Calibrating, Game Over screens.
 */
export function drawNightBackground(
  ctx: CanvasRenderingContext2D,
  animTime: number,
): void {
  // Gradient
  ctx.fillStyle = createNightGradient(ctx, CANVAS_HEIGHT);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Floating particles (stars/dust)
  const particles = ensureParticles();
  for (const p of particles) {
    const twinkle = 0.4 + Math.sin(animTime / 1000 + p.phase) * 0.4;
    ctx.fillStyle = `rgba(200, 220, 255, ${p.opacity * twinkle})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Gentle drift
    p.y -= p.speed;
    p.x += Math.sin(animTime / 2000 + p.phase) * 0.15;

    // Wrap
    if (p.y < -5) {
      p.y = CANVAS_HEIGHT + 5;
      p.x = Math.random() * CANVAS_WIDTH;
    }
    if (p.x < -5) p.x = CANVAS_WIDTH + 5;
    if (p.x > CANVAS_WIDTH + 5) p.x = -5;
  }
}

// ─── Shortcut Text Helpers ────────────────────────────────────

export interface TextConfig {
  font: string;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
}

/** Draw text with optional glow/shadow */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  config: TextConfig,
): void {
  ctx.save();
  ctx.font = config.font;
  ctx.fillStyle = config.color;
  ctx.textAlign = config.align ?? 'left';
  ctx.textBaseline = config.baseline ?? 'alphabetic';

  if (config.shadow !== false) {
    ctx.shadowColor = config.shadowColor ?? 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = config.shadowBlur ?? 4;
    ctx.shadowOffsetY = 2;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

// ─── Key Hint ─────────────────────────────────────────────────

/** Small keyboard shortcut hint text */
export function drawKeyHint(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
): void {
  drawText(ctx, text, cx, y, {
    font: font('caption'),
    color: THEME.textMuted,
    align: 'center',
    shadow: false,
  });
}
