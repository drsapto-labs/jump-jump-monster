/**
 * Theme — Unified Design Tokens for Jump Jump Monster
 *
 * Semua warna, ukuran font, spacing, dan radius terpusat di sini.
 * Derivasi dari warna in-game (langit biru, monster oranye, rumput hijau)
 * sehingga menu/HUD/game-over terasa satu kesatuan dengan gameplay.
 */

// ─── Color Palette ────────────────────────────────────────────
export const THEME = {
  // Primary — Monster Orange
  primary: '#FF6B35',
  primaryDark: '#E55A28',
  primaryGlow: 'rgba(255, 107, 53, 0.4)',

  // Sky Blues (selaras dengan in-game sky gradient)
  skyLight: '#87CEEB',
  skyDeep: '#4A90D9',

  // Night (menu, overlay, game-over backgrounds)
  nightDeep: '#0F1923',
  nightBase: '#1B2838',
  nightMid: '#243B53',
  nightLight: '#2D4A6B',

  // Nature Greens (selaras dengan in-game grass/hills)
  green: '#4CAF50',
  greenDark: '#2E7D32',

  // Gold Accent (score, collectible)
  gold: '#FFD700',
  goldMuted: '#DAA520',
  goldGlow: 'rgba(255, 215, 0, 0.35)',

  // Danger (obstacle, game-over)
  danger: '#E53935',
  dangerDark: '#B71C1C',

  // Cyan (shield, special fx)
  cyan: '#00E5FF',
  cyanGlow: 'rgba(0, 229, 255, 0.35)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0C4DE',
  textMuted: '#6B7B8D',
  textDark: '#3A4A5C',

  // Surfaces (glassmorphism)
  glass: 'rgba(255, 255, 255, 0.07)',
  glassHover: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassSolid: 'rgba(27, 40, 56, 0.85)',

  // Overlay
  overlayDark: 'rgba(15, 25, 35, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
} as const;

// ─── Typography ───────────────────────────────────────────────
export const FONT = {
  // Families
  primary: "'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",

  // Sizes (menggunakan max 4 ukuran per layar)
  hero: 'bold 34px',      // judul utama layar
  title: 'bold 22px',     // sub-judul, score besar
  body: '15px',           // teks normal
  bodyBold: 'bold 15px',  // teks tebal (button)
  caption: '12px',        // hint, secondary info
  captionBold: 'bold 12px',
  tiny: '10px',           // debug info, FPS
} as const;

/** Compose font string with family */
export function font(size: keyof typeof FONT): string {
  return `${FONT[size]} ${FONT.primary}`;
}

export function fontMono(size: keyof typeof FONT): string {
  return `${FONT[size]} ${FONT.mono}`;
}

// ─── Spacing & Layout ─────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

// ─── Button Presets ───────────────────────────────────────────
export const BUTTON_PRESETS = {
  primary: {
    bg: THEME.primary,
    bgHover: THEME.primaryDark,
    text: THEME.textPrimary,
    glow: THEME.primaryGlow,
    radius: RADIUS.lg,
    height: 50,
    width: 240,
  },
  secondary: {
    bg: THEME.glass,
    bgHover: THEME.glassHover,
    text: THEME.textSecondary,
    glow: 'transparent',
    radius: RADIUS.md,
    height: 42,
    width: 220,
  },
  danger: {
    bg: THEME.danger,
    bgHover: THEME.dangerDark,
    text: THEME.textPrimary,
    glow: 'rgba(229, 57, 53, 0.3)',
    radius: RADIUS.lg,
    height: 50,
    width: 240,
  },
} as const;

// ─── Background Gradient Helpers ──────────────────────────────

/** Create the standard night sky gradient used across non-game screens */
export function createNightGradient(
  ctx: CanvasRenderingContext2D,
  height: number,
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, THEME.nightDeep);
  grad.addColorStop(0.5, THEME.nightBase);
  grad.addColorStop(1, THEME.nightMid);
  return grad;
}
