/**
 * Jump Jump Monster — Constants & Configuration
 *
 * Semua magic numbers terpusat di sini.
 * TIDAK BOLEH ada angka hardcode di file lain.
 */

// ─── Canvas & Display ─────────────────────────────────────────
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const TARGET_FPS = 60;
export const MAX_DELTA_TIME = 100; // ms — clamp agar physics tidak meledak

// ─── Player ───────────────────────────────────────────────────
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 64;
export const PLAYER_X = 120; // posisi horizontal tetap (world bergerak)
export const PLAYER_GROUND_Y = CANVAS_HEIGHT - 80; // Y posisi kaki di tanah
export const JUMP_VELOCITY = -12; // negatif = ke atas
export const GRAVITY = 0.6;
export const DUCK_HEIGHT = 36; // tinggi saat jongkok (lebih pendek)
export const PLAYER_MIN_X = 60; // batas kiri pergerakan miring
export const PLAYER_MAX_X = 220; // batas kanan pergerakan miring
export const PLAYER_LEAN_SPEED = 0.25; // kecepatan geser horizontal (px per ms)
export const PLAYER_LEAN_ANGLE = 0.12; // sudut kemiringan visual badan (radian)

// ─── World & Obstacles ───────────────────────────────────────
export const INITIAL_WORLD_SPEED = 4;
export const MAX_WORLD_SPEED = 10; // cap — jangan terlalu cepat untuk anak
export const SPEED_INCREMENT = 0.001; // kecepatan naik per frame
export const MIN_OBSTACLE_GAP = PLAYER_WIDTH * 4; // minimal jarak antar obstacle
export const GROUND_Y = CANVAS_HEIGHT - 60; // garis tanah

// ─── Scoring ──────────────────────────────────────────────────
export const SCORE_PER_SECOND = 1;
export const SCORE_PER_COLLECTIBLE = 10;
export const MULTIPLIER_MAX = 5;
export const MULTIPLIER_DECAY_MS = 3000; // reset setelah 3 detik tanpa koin

// ─── Gesture Detection (tuned untuk sensitivitas tinggi anak & dewasa) ─
export const JUMP_THRESHOLD_RATIO = 0.08; // butuh lompatan nyata (0.045 terlalu mudah terpicu oleh jitter noise kamera)
export const DUCK_THRESHOLD_RATIO = 0.09;  // butuh runduk nyata (0.045 terlalu mudah terpicu saat duduk normal)
export const LEAN_THRESHOLD_RATIO = 0.04;  // miring badan lebih responsif
export const GESTURE_COOLDOWN_MS = 350;    // cooldown lebih singkat agar respon cepat
export const DUCK_MIN_HOLD_MS = 120;       // waktu tahan jongkok lebih singkat
export const SMOOTHING_FACTOR = 0.35;      // lerp smoothing responsif

// ─── Safety & UX ─────────────────────────────────────────────
export const BREAK_REMINDER_INTERVAL_MS = 10 * 60 * 1000; // 10 menit
export const FORGIVING_HITBOX_SHRINK = 6; // pixel shrink per sisi (forgiving collision)

// ─── Colors (kid-friendly palette) ───────────────────────────
export const COLORS = {
  sky: '#87CEEB',
  ground: '#8B6914',
  grassGreen: '#4CAF50',
  playerBody: '#FF6B35',
  playerEyes: '#FFFFFF',
  obstacle: '#E53935',
  collectible: '#FFD700',
  hud: '#FFFFFF',
  hudShadow: 'rgba(0,0,0,0.4)',
  menuBg: '#1A1A2E',
  menuAccent: '#E94560',
  menuText: '#FFFFFF',
} as const;
