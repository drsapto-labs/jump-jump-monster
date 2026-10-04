/**
 * Webcam Tracker — MediaPipe Pose → InputAction Converter
 *
 * Arsitektur:
 *  1. Inisialisasi MediaPipe PoseLandmarker (WASM on-device, zero server upload)
 *  2. Kalibrasi baseline posisi bahu/pinggul saat "berdiri normal"
 *  3. EMA Filter per-landmark untuk mengurangi jitter
 *  4. State Machine Gesture untuk mencegah double-fire
 *  5. Emit InputAction via callback (terhubung ke InputManager.emit)
 *  6. Render PiP preview dengan overlay landmark di pojok canvas
 *
 * PRIVASI: Tidak ada frame video yang keluar dari browser.
 * Hanya koordinat normalized (0-1) yang diproses secara lokal.
 */

import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import {
  JUMP_THRESHOLD_RATIO,
  DUCK_THRESHOLD_RATIO,
  LEAN_THRESHOLD_RATIO,
  GESTURE_COOLDOWN_MS,
  DUCK_MIN_HOLD_MS,
  SMOOTHING_FACTOR,
} from '@utils/constants';
import type { InputAction } from './input-manager';
import { InputAction as IA } from './input-manager';

// ─── MediaPipe Landmark Indices (BlazePose 33) ────────────────
// Ref: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// ─── Types ────────────────────────────────────────────────────
export type WebcamStatus =
  | 'IDLE'
  | 'LOADING'
  | 'CALIBRATING'
  | 'TRACKING'
  | 'DENIED'
  | 'ERROR';

export interface WebcamTrackerConfig {
  onAction: (action: InputAction) => void;
  onStatusChange?: (status: WebcamStatus, message?: string) => void;
}

// ─── EMA Filter State ─────────────────────────────────────────
interface LandmarkSmoothed {
  x: number;
  y: number;
  z: number;
}

// ─── Calibration Baseline ─────────────────────────────────────
interface CalibrationBaseline {
  shoulderMidY: number;   // Y tengah bahu (normalized, 0-1)
  upperBodyY: number;     // Y gabungan bahu & hidung (sangat stabil untuk jump/duck)
  hipMidY: number;        // Y tengah pinggul (normalized)
  torsoHeight: number;    // skala tubuh/torso (unit relatif)
  shoulderMidX: number;   // X tengah bahu (untuk deteksi lean)
  samples: number;        // berapa frame sample yang sudah dikumpulkan
}

// ─── Gesture FSM State ────────────────────────────────────────
interface GestureState {
  isJumping: boolean;
  isHandsUp: boolean;     // deteksi angkat tangan ke atas (🙌)
  isDucking: boolean;
  leanDir: 'LEFT' | 'RIGHT' | 'CENTER';
  jumpCooldown: number;   // ms sisa cooldown
  duckHoldMs: number;     // ms duck sudah ditahan (untuk mencegah false duck)
  leanCooldown: number;
}

export class WebcamTracker {
  private poseLandmarker: PoseLandmarker | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;

  private status: WebcamStatus = 'IDLE';
  private readonly config: WebcamTrackerConfig;

  // EMA smoothed landmarks
  private smoothed: LandmarkSmoothed[] = [];

  // Kalibrasi
  private calibration: CalibrationBaseline | null = null;
  private readonly CALIBRATION_FRAMES = 30; // 30 frame ≈ 0.5 detik pada 60fps
  private prevUpperBodyY: number | null = null;

  // Gesture state machine
  private gesture: GestureState = {
    isJumping: false,
    isHandsUp: false,
    isDucking: false,
    leanDir: 'CENTER',
    jumpCooldown: 0,
    duckHoldMs: 0,
    leanCooldown: 0,
  };

  // PiP canvas untuk render preview
  private pipCanvas: HTMLCanvasElement | null = null;
  private lastFrameTime = 0;

  constructor(config: WebcamTrackerConfig) {
    this.config = config;
  }

  get currentStatus(): WebcamStatus {
    return this.status;
  }

  get isTracking(): boolean {
    return this.status === 'TRACKING';
  }

  get calibrationProgress(): number {
    if (!this.calibration) return 0;
    return Math.min(1, this.calibration.samples / this.CALIBRATION_FRAMES);
  }

  // ─── Inisialisasi ─────────────────────────────────────────

  /**
   * Minta izin kamera, load model MediaPipe, mulai tracking.
   * Async dan safe — jika gagal, emit status 'DENIED' atau 'ERROR',
   * dan keyboard fallback tetap berjalan.
   */
  async start(): Promise<void> {
    this.setStatus('LOADING');

    try {
      // 1. Minta izin kamera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });
    } catch {
      this.setStatus('DENIED', 'Kamera ditolak — gunakan keyboard: ↑↓');
      return;
    }

    try {
      // 2. Load MediaPipe PoseLandmarker (WASM, on-device)
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      });
    } catch {
      this.stopStream();
      this.setStatus('ERROR', 'Gagal load model pose — gunakan keyboard');
      return;
    }

    // 3. Setup elemen video (tersembunyi)
    this.videoEl = document.createElement('video');
    this.videoEl.style.display = 'none';
    this.videoEl.srcObject = this.stream;
    this.videoEl.autoplay = true;
    this.videoEl.playsInline = true;
    this.videoEl.muted = true;
    document.body.appendChild(this.videoEl);

    await this.videoEl.play();

    // 4. Setup PiP canvas untuk preview (akan dirender di sudut game canvas)
    this.pipCanvas = document.createElement('canvas');
    this.pipCanvas.width = 160;
    this.pipCanvas.height = 120;

    this.setStatus('CALIBRATING');
    this.calibration = {
      shoulderMidY: 0,
      upperBodyY: 0,
      hipMidY: 0,
      torsoHeight: 0.15, // default fallback
      shoulderMidX: 0.5,
      samples: 0,
    };
    this.prevUpperBodyY = null;

    this.scheduleFrame();
  }

  /** Hentikan kamera dan bersihkan semua resource */
  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopStream();
    if (this.videoEl) {
      document.body.removeChild(this.videoEl);
      this.videoEl = null;
    }
    this.poseLandmarker?.close();
    this.poseLandmarker = null;
    this.setStatus('IDLE');
  }

  // ─── Detection Loop ──────────────────────────────────────

  private scheduleFrame(): void {
    this.animFrameId = requestAnimationFrame((ts) => this.processFrame(ts));
  }

  private processFrame(timestamp: number): void {
    if (!this.videoEl || !this.poseLandmarker) return;
    if (this.videoEl.readyState < 2) {
      // Video belum siap
      this.scheduleFrame();
      return;
    }

    const dt = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Deteksi pose dari frame video saat ini
    const result = this.poseLandmarker.detectForVideo(this.videoEl, timestamp);

    this.processResult(result, dt);
    this.renderPiP(result);
    this.scheduleFrame();
  }

  private processResult(result: PoseLandmarkerResult, dt: number): void {
    if (!result.landmarks || result.landmarks.length === 0) {
      // Tidak ada pose terdeteksi — reset gesture cooldown
      this.updateGestureCooldowns(dt);
      return;
    }

    const raw = result.landmarks[0];
    if (!raw) return;

    // Ambil landmark utama yang dibutuhkan
    const lsRaw = raw[LM.LEFT_SHOULDER];
    const rsRaw = raw[LM.RIGHT_SHOULDER];
    const noseRaw = raw[LM.NOSE];
    const lwRaw = raw[LM.LEFT_WRIST];
    const rwRaw = raw[LM.RIGHT_WRIST];
    const leRaw = raw[LM.LEFT_ELBOW];
    const reRaw = raw[LM.RIGHT_ELBOW];
    const lhRaw = raw[LM.LEFT_HIP];
    const rhRaw = raw[LM.RIGHT_HIP];

    // Minimal bahu harus terdeteksi
    if (!lsRaw || !rsRaw) return;

    // Cek visibility bahu — tidak perlu menolak frame jika pinggul di luar layar
    const minShoulderVis = 0.3;
    if (
      (lsRaw.visibility ?? 1) < minShoulderVis ||
      (rsRaw.visibility ?? 1) < minShoulderVis
    ) {
      this.updateGestureCooldowns(dt);
      return;
    }

    // ── EMA Smoothing per landmark dengan Dynamic Responsiveness ─────────
    const smooth = (idx: number, raw: { x: number; y: number; z: number }) => {
      const prev = this.smoothed[idx];
      const effX = 1 - raw.x; // mirror flip agar gerakan intuitif
      if (!prev) {
        this.smoothed[idx] = { x: effX, y: raw.y, z: raw.z };
      } else {
        const diffY = Math.abs(raw.y - prev.y);
        // Jika ada gerakan cepat (mis. lompat / angkat tangan), naikkan alpha agar responsif tanpa lag
        const alpha = diffY > 0.015 ? 0.65 : SMOOTHING_FACTOR;
        this.smoothed[idx] = {
          x: alpha * effX + (1 - alpha) * prev.x,
          y: alpha * raw.y + (1 - alpha) * prev.y,
          z: alpha * raw.z + (1 - alpha) * prev.z,
        };
      }
      return this.smoothed[idx]!;
    };

    const ls = smooth(LM.LEFT_SHOULDER, lsRaw);
    const rs = smooth(LM.RIGHT_SHOULDER, rsRaw);
    const nose = noseRaw && (noseRaw.visibility ?? 1) >= 0.25 ? smooth(LM.NOSE, noseRaw) : null;

    // Smooth pergelangan tangan (wrists) & siku (elbows)
    const lw = lwRaw && (lwRaw.visibility ?? 1) >= 0.2 ? smooth(LM.LEFT_WRIST, lwRaw) : null;
    const rw = rwRaw && (rwRaw.visibility ?? 1) >= 0.2 ? smooth(LM.RIGHT_WRIST, rwRaw) : null;
    if (leRaw && (leRaw.visibility ?? 1) >= 0.2) smooth(LM.LEFT_ELBOW, leRaw);
    if (reRaw && (reRaw.visibility ?? 1) >= 0.2) smooth(LM.RIGHT_ELBOW, reRaw);

    const shoulderMidY = (ls.y + rs.y) / 2;
    const shoulderMidX = (ls.x + rs.x) / 2;
    const shoulderDist = Math.hypot(rs.x - ls.x, rs.y - ls.y);

    // Titik jangkar tubuh atas: gabungan bahu & hidung (sangat stabil & responsif saat melompat)
    const upperBodyY = nose ? shoulderMidY * 0.65 + nose.y * 0.35 : shoulderMidY;

    // Skala tubuh (torso): jika pinggul terlihat, pakai jarak bahu-pinggul.
    // Jika pinggul di luar frame (misal orang dewasa berdiri dekat laptop), estimasi dari lebar bahu!
    let currentTorso: number;
    let hipMidY: number;
    if (
      lhRaw && rhRaw &&
      (lhRaw.visibility ?? 1) >= 0.25 &&
      (rhRaw.visibility ?? 1) >= 0.25
    ) {
      const lh = smooth(LM.LEFT_HIP, lhRaw);
      const rh = smooth(LM.RIGHT_HIP, rhRaw);
      hipMidY = (lh.y + rh.y) / 2;
      currentTorso = Math.max(0.08, hipMidY - shoulderMidY);
    } else {
      // Rasio biacromial-torso manusia normal: ~1.15x lebar bahu
      currentTorso = Math.max(0.12, shoulderDist * 1.15);
      hipMidY = shoulderMidY + currentTorso;
    }

    // ── Kalibrasi ─────────────────────────────────────────
    if (this.status === 'CALIBRATING' && this.calibration) {
      const c = this.calibration;
      const weight = 1 / (c.samples + 1);

      // Running average untuk kalibrasi
      c.shoulderMidY = c.shoulderMidY * (1 - weight) + shoulderMidY * weight;
      c.upperBodyY = c.upperBodyY * (1 - weight) + upperBodyY * weight;
      c.hipMidY = c.hipMidY * (1 - weight) + hipMidY * weight;
      c.torsoHeight = c.torsoHeight * (1 - weight) + currentTorso * weight;
      c.shoulderMidX = c.shoulderMidX * (1 - weight) + shoulderMidX * weight;
      c.samples++;

      if (c.samples >= this.CALIBRATION_FRAMES) {
        c.torsoHeight = Math.max(0.08, c.torsoHeight);
        this.prevUpperBodyY = upperBodyY;
        this.setStatus('TRACKING');
      }
      return; // Saat kalibrasi, belum emit gesture
    }

    if (this.status !== 'TRACKING' || !this.calibration) return;

    // ── Gesture Detection ──────────────────────────────────
    const cal = this.calibration;
    const torso = cal.torsoHeight;

    // Deteksi Hands Up (🙌 Angkat Tangan):
    // Tangan terangkat jika pergelangan tangan (wrist) berada di atas bahu
    // (di koordinat kamera normal, y=0 adalah tepi atas layar).
    const leftHandUp = lw !== null && lw.y < ls.y - 0.01;
    const rightHandUp = rw !== null && rw.y < rs.y - 0.01;
    const isHandsUp = leftHandUp || rightHandUp;

    // Delta Y upper body relatif terhadap baseline
    // Saat lompat (tubuh naik): deltaY negatif
    // Saat jongkok (tubuh turun): deltaY positif
    const deltaY = upperBodyY - cal.upperBodyY;

    // Kecepatan sentakan impuls ke atas
    const upwardSpeed =
      this.prevUpperBodyY !== null
        ? (this.prevUpperBodyY - upperBodyY) / Math.max(1, dt)
        : 0;
    this.prevUpperBodyY = upperBodyY;

    // Lean: posisi X bahu bergeser dari baseline
    const deltaX = shoulderMidX - cal.shoulderMidX;

    this.updateGestureCooldowns(dt);
    this.detectJump(deltaY, torso, upwardSpeed, isHandsUp);
    this.detectDuck(deltaY, torso, dt);
    this.detectLean(deltaX, torso, dt);
  }

  // ─── Gesture State Machine ────────────────────────────────

  private detectJump(
    deltaY: number,
    torso: number,
    upwardSpeed: number,
    isHandsUp: boolean,
  ): void {
    // Naik dari baseline = deltaY negatif
    const threshold = -JUMP_THRESHOLD_RATIO * torso;
    // Boleh terpicu via displacement ketinggian (deltaY < threshold)
    // ATAU via kecepatan impuls sentakan ke atas saat baru lepas dari lantai
    const isImpulse = upwardSpeed > 0.00035 && deltaY < -0.015 * torso;
    const isBodyJump = deltaY < threshold || isImpulse;

    // Trigger jika angkat tangan 🙌 ATAU loncat badan penuh ⬆️
    const isTriggered = isHandsUp || isBodyJump;

    if (isTriggered && !this.gesture.isJumping && this.gesture.jumpCooldown <= 0) {
      this.gesture.isJumping = true;
      this.gesture.isHandsUp = isHandsUp;
      this.gesture.jumpCooldown = GESTURE_COOLDOWN_MS;
      this.config.onAction(IA.JUMP);
    } else if (!isTriggered && this.gesture.isJumping) {
      // Hysteresis: reset status jumping saat tangan diturunkan DAN tubuh kembali turun
      if (!isHandsUp && deltaY > threshold * 0.4) {
        this.gesture.isJumping = false;
        this.gesture.isHandsUp = false;
      }
    }
  }

  private detectDuck(deltaY: number, torso: number, dt: number): void {
    // Turun dari baseline = deltaY positif
    const threshold = DUCK_THRESHOLD_RATIO * torso;
    const isBelowThreshold = deltaY > threshold;

    if (isBelowThreshold) {
      this.gesture.duckHoldMs += dt;

      if (this.gesture.duckHoldMs >= DUCK_MIN_HOLD_MS && !this.gesture.isDucking) {
        this.gesture.isDucking = true;
        this.config.onAction(IA.DUCK_START);
      }
    } else {
      if (this.gesture.isDucking && deltaY < threshold * 0.7) {
        this.gesture.isDucking = false;
        this.config.onAction(IA.DUCK_END);
        this.gesture.duckHoldMs = 0;
      } else if (!this.gesture.isDucking) {
        this.gesture.duckHoldMs = 0;
      }
    }
  }

  private detectLean(deltaX: number, torso: number, _dt: number): void {
    if (this.gesture.leanCooldown > 0) return;

    const threshold = LEAN_THRESHOLD_RATIO * torso;

    // Note: X sudah di-flip di EMA — deltaX > 0 = lean kanan
    if (deltaX > threshold && this.gesture.leanDir !== 'RIGHT') {
      this.gesture.leanDir = 'RIGHT';
      this.gesture.leanCooldown = GESTURE_COOLDOWN_MS / 2;
      this.config.onAction(IA.LEAN_RIGHT);
    } else if (deltaX < -threshold && this.gesture.leanDir !== 'LEFT') {
      this.gesture.leanDir = 'LEFT';
      this.gesture.leanCooldown = GESTURE_COOLDOWN_MS / 2;
      this.config.onAction(IA.LEAN_LEFT);
    } else if (Math.abs(deltaX) < threshold * 0.5 && this.gesture.leanDir !== 'CENTER') {
      this.gesture.leanDir = 'CENTER';
      this.config.onAction(IA.LEAN_CENTER);
    }
  }

  private updateGestureCooldowns(dt: number): void {
    if (this.gesture.jumpCooldown > 0) this.gesture.jumpCooldown -= dt;
    if (this.gesture.leanCooldown > 0) this.gesture.leanCooldown -= dt;
  }

  // ─── PiP Preview Render ──────────────────────────────────

  /**
   * Render preview kamera + overlay landmark ke pipCanvas.
   * Canvas ini kemudian di-drawImage ke pojok kiri bawah game canvas.
   */
  private renderPiP(result: PoseLandmarkerResult): void {
    if (!this.pipCanvas || !this.videoEl) return;
    const ctx = this.pipCanvas.getContext('2d');
    if (!ctx) return;

    const pw = this.pipCanvas.width;
    const ph = this.pipCanvas.height;

    // Mirror video (selfie mode)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-pw, 0);
    ctx.drawImage(this.videoEl, 0, 0, pw, ph);
    ctx.restore();

    // Border berdasarkan status
    const borderColor =
      this.status === 'TRACKING'
        ? '#00FF88'
        : this.status === 'CALIBRATING'
          ? '#FFAA00'
          : '#FF4444';

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, pw - 3, ph - 3);

    // Render landmark dots & connections jika tracking aktif
    if (this.status === 'TRACKING' && result.landmarks.length > 0) {
      this.renderLandmarkOverlay(ctx, result.landmarks[0]!, pw, ph);
    }

    // Label status
    const label =
      this.status === 'TRACKING'
        ? '🟢 TRACKING'
        : this.status === 'CALIBRATING'
          ? `🟡 KALIBRASI ${Math.round(this.calibrationProgress * 100)}%`
          : '🔴 LOADING...';

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, ph - 18, pw, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, pw / 2, ph - 5);
  }

  /** Gambar titik-titik landmark tubuh + koneksi tulang */
  private renderLandmarkOverlay(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number; visibility?: number }[],
    pw: number,
    ph: number,
  ): void {
    // Koneksi tulang yang relevan (pose skeleton partial + arms)
    const connections: [number, number][] = [
      [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
      // Lengan Kiri
      [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
      [LM.LEFT_ELBOW, LM.LEFT_WRIST],
      // Lengan Kanan
      [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
      [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      // Torso & Kaki
      [LM.LEFT_SHOULDER, LM.LEFT_HIP],
      [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
      [LM.LEFT_HIP, LM.RIGHT_HIP],
      [LM.LEFT_HIP, LM.LEFT_KNEE],
      [LM.RIGHT_HIP, LM.RIGHT_KNEE],
      [LM.LEFT_KNEE, LM.LEFT_ANKLE],
      [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
    ];

    // Draw koneksi
    ctx.strokeStyle = this.gesture.isHandsUp ? 'rgba(255, 215, 0, 0.9)' : 'rgba(0, 255, 136, 0.8)';
    ctx.lineWidth = 1.6;
    for (const [a, b] of connections) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      if (!lmA || !lmB) continue;
      if ((lmA.visibility ?? 1) < 0.25 || (lmB.visibility ?? 1) < 0.25) continue;

      // Mirror X untuk preview (mirror video)
      const ax = (1 - lmA.x) * pw;
      const ay = lmA.y * ph;
      const bx = (1 - lmB.x) * pw;
      const by = lmB.y * ph;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Draw titik landmark kunci
    const keyLandmarks = [
      LM.NOSE,
      LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
      LM.LEFT_ELBOW, LM.RIGHT_ELBOW,
      LM.LEFT_HIP, LM.RIGHT_HIP,
      LM.LEFT_KNEE, LM.RIGHT_KNEE,
    ];

    for (const idx of keyLandmarks) {
      const lm = landmarks[idx];
      if (!lm || (lm.visibility ?? 1) < 0.25) continue;

      const x = (1 - lm.x) * pw;
      const y = lm.y * ph;

      ctx.fillStyle = '#00FF88';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pergelangan tangan (Wrists) — bercahaya emas jika hands up
    for (const wIdx of [LM.LEFT_WRIST, LM.RIGHT_WRIST]) {
      const lm = landmarks[wIdx];
      if (!lm || (lm.visibility ?? 1) < 0.2) continue;

      const wx = (1 - lm.x) * pw;
      const wy = lm.y * ph;

      if (this.gesture.isHandsUp) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(wx, wy, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(wx, wy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Gambar PiP preview ke game canvas.
   * Dipanggil dari main render loop setelah semua game world ter-render.
   */
  drawPiP(gameCtx: CanvasRenderingContext2D): void {
    if (!this.pipCanvas || this.status === 'IDLE') return;

    const margin = 14;
    const pw = this.pipCanvas.width;
    const ph = this.pipCanvas.height;
    const x = margin;
    const y = margin; // ATAS KIRI

    // Shadow / background hitam untuk kontur
    gameCtx.fillStyle = 'rgba(0,0,0,0.5)';
    gameCtx.beginPath();
    gameCtx.roundRect(x - 2, y - 2, pw + 4, ph + 4, 6);
    gameCtx.fill();

    gameCtx.drawImage(this.pipCanvas, x, y, pw, ph);

    // Indikator gesture aktif di bawah PiP
    if (this.status === 'TRACKING') {
      const icons: string[] = [];
      if (this.gesture.isJumping) {
        if (this.gesture.isHandsUp) {
          icons.push('🙌 ANGKAT TANGAN!');
        } else {
          icons.push('⬆️ LOMPAT!');
        }
      }
      if (this.gesture.isDucking) icons.push('⬇️ JONGKOK');
      if (this.gesture.leanDir === 'LEFT') icons.push('⬅️ KIRI');
      if (this.gesture.leanDir === 'RIGHT') icons.push('➡️ KANAN');

      if (icons.length > 0) {
        gameCtx.fillStyle = this.gesture.isHandsUp ? '#FFD700' : 'rgba(0, 255, 136, 0.95)';
        gameCtx.font = 'bold 12px system-ui, sans-serif';
        gameCtx.textAlign = 'center';
        gameCtx.fillText(icons.join('  '), x + pw / 2, y + ph + 16);
      }
    }
  }

  // ─── Helpers ─────────────────────────────────────────────

  private stopStream(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }
  }

  private setStatus(status: WebcamStatus, message?: string): void {
    this.status = status;
    this.config.onStatusChange?.(status, message);
    console.log(`[WebcamTracker] Status: ${status}${message ? ` — ${message}` : ''}`);
  }
}
