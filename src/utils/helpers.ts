/**
 * Math & general utility helpers.
 * Setiap fungsi HARUS pure (no side effects) dan di-test.
 */

/** Clamp value antara min dan max. Mencegah angka meledak. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation — untuk smoothing gerakan. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** AABB collision detection — hitbox kotak vs kotak. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Shrink rect untuk forgiving collision.
 * Hitbox visual lebih besar dari hitbox collision → anak tidak frustasi.
 */
export function shrinkRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x + amount,
    y: rect.y + amount,
    width: Math.max(0, rect.width - amount * 2),
    height: Math.max(0, rect.height - amount * 2),
  };
}

/** Random integer antara min (inclusive) dan max (inclusive). */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float antara min dan max. */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Debounce — untuk canvas resize handler. */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Safe localStorage access — try-catch wrapper.
 * localStorage bisa disabled (private browsing) atau penuh.
 */
export function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silent fail — localStorage mungkin disabled
  }
}

/** Format score untuk display (e.g. 1234 → "1,234") */
export function formatScore(score: number): string {
  return Math.floor(score).toLocaleString('en-US');
}
