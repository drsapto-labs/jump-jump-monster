import { describe, it, expect } from 'vitest';
import {
  clamp,
  lerp,
  rectsOverlap,
  shrinkRect,
  randomInt,
  formatScore,
} from '../src/utils/helpers';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('clamps t to [0, 1]', () => {
    expect(lerp(10, 20, -1)).toBe(10);
    expect(lerp(10, 20, 2)).toBe(20);
  });
});

describe('rectsOverlap', () => {
  it('detects overlap', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it('detects no overlap (right)', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 20, y: 0, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('detects no overlap (below)', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 0, y: 20, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('detects touching edges as non-overlapping', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(false);
  });
});

describe('shrinkRect', () => {
  it('shrinks rect by given amount', () => {
    const rect = { x: 0, y: 0, width: 20, height: 20 };
    const shrunk = shrinkRect(rect, 3);
    expect(shrunk).toEqual({ x: 3, y: 3, width: 14, height: 14 });
  });

  it('does not produce negative dimensions', () => {
    const rect = { x: 0, y: 0, width: 4, height: 4 };
    const shrunk = shrinkRect(rect, 10);
    expect(shrunk.width).toBe(0);
    expect(shrunk.height).toBe(0);
  });
});

describe('randomInt', () => {
  it('returns values within range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

describe('formatScore', () => {
  it('formats zero', () => {
    expect(formatScore(0)).toBe('0');
  });

  it('formats large number with commas', () => {
    expect(formatScore(12345)).toBe('12,345');
  });

  it('floors decimals', () => {
    expect(formatScore(99.7)).toBe('99');
  });
});
