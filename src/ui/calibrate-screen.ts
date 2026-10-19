/**
 * Calibrating Screen — Clean visual calibration & control guide
 *
 * Memberikan instruksi posisi tubuh dan kontrol bermain secara terstruktur
 * tanpa mengacaukan tampilan menu utama.
 */

import { CANVAS_WIDTH } from '@utils/constants';
import { THEME, font } from './theme';
import { drawBackArrow } from './icons';
import { drawNightBackground, drawButton, drawGlassPanel, drawText, drawKeyHint } from './components';

export const CALIBRATE_BUTTONS = {
  back: { x: 14, y: 12, width: 120, height: 38 },
  skip: { x: CANVAS_WIDTH / 2 - 120, y: 355, width: 240, height: 46 },
};

export interface CalibrateScreenProps {
  animTime: number;
  webcamStatus: string;
  isTracking: boolean;
  calibrationProgress: number;
  drawPiP: (ctx: CanvasRenderingContext2D) => void;
}

export function renderCalibrateScreen(
  ctx: CanvasRenderingContext2D,
  props: CalibrateScreenProps,
): void {
  const {
    animTime,
    webcamStatus,
    isTracking,
    calibrationProgress,
    drawPiP,
  } = props;

  // 1. Background
  drawNightBackground(ctx, animTime);

  // 2. Back Button (top left)
  const back = CALIBRATE_BUTTONS.back;
  ctx.save();
  ctx.fillStyle = THEME.glass;
  ctx.beginPath();
  ctx.roundRect(back.x, back.y, back.width, back.height, 8);
  ctx.fill();
  ctx.strokeStyle = THEME.glassBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  drawBackArrow(ctx, back.x + 18, back.y + back.height / 2, 14, THEME.textSecondary);
  drawText(ctx, 'Kembali', back.x + 34, back.y + back.height / 2 + 5, {
    font: font('bodyBold'),
    color: THEME.textSecondary,
    shadow: false,
  });
  ctx.restore();

  // 3. Screen Title
  drawText(ctx, 'KALIBRASI TUBUH', CANVAS_WIDTH / 2, 60, {
    font: font('title'),
    color: THEME.textPrimary,
    align: 'center',
    shadow: true,
    shadowColor: THEME.primaryGlow,
    shadowBlur: 14,
  });

  // 4. Instructions
  drawText(ctx, 'Berdiri Tegak Menghadap Kamera', CANVAS_WIDTH / 2, 92, {
    font: font('bodyBold'),
    color: THEME.primary,
    align: 'center',
    shadow: false,
  });

  drawText(
    ctx,
    'Posisikan diri 1.5 - 2 meter dari kamera agar kepala & bahu terlihat jelas',
    CANVAS_WIDTH / 2,
    116,
    {
      font: font('body'),
      color: THEME.textSecondary,
      align: 'center',
      shadow: false,
    },
  );

  // 5. Status message
  let statusMsg = 'Menghubungkan kamera...';
  let statusColor: string = THEME.textSecondary;
  if (webcamStatus === 'LOADING') {
    statusMsg = 'Menyiapkan model deteksi pose on-device...';
  } else if (webcamStatus === 'DENIED') {
    statusMsg = 'Akses kamera tidak diizinkan. Silakan main dengan Keyboard.';
    statusColor = THEME.danger;
  } else if (webcamStatus === 'CALIBRATING') {
    statusMsg = 'Mengukur posisi berdiri normal tubuh kamu...';
    statusColor = THEME.gold;
  } else if (isTracking) {
    statusMsg = 'Kalibrasi selesai! Memulai permainan...';
    statusColor = '#00FF88';
  }

  drawText(ctx, statusMsg, CANVAS_WIDTH / 2, 150, {
    font: font('captionBold'),
    color: statusColor,
    align: 'center',
    shadow: false,
  });

  // 6. Progress Bar (Warm Orange/Gold Gradient)
  const barW = 340;
  const barH = 20;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = 170;

  // Background track
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 10);
  ctx.fill();

  // Progress fill
  const progress = Math.max(0, Math.min(1, calibrationProgress));
  if (progress > 0) {
    const fillW = Math.max(16, barW * progress);
    const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    grad.addColorStop(0, THEME.primary);
    grad.addColorStop(1, THEME.gold);
    ctx.fillStyle = grad;
    ctx.shadowColor = THEME.primaryGlow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 10);
    ctx.fill();
  }

  // Percentage
  ctx.shadowBlur = 0;
  drawText(ctx, `${Math.round(progress * 100)}%`, CANVAS_WIDTH / 2, barY + 14, {
    font: font('captionBold'),
    color: THEME.textPrimary,
    align: 'center',
    shadow: false,
  });
  ctx.restore();

  // 7. How To Play Guide Card
  const guideW = 420;
  const guideH = 80;
  const guideX = CANVAS_WIDTH / 2 - guideW / 2;
  const guideY = 215;

  drawGlassPanel(ctx, {
    x: guideX,
    y: guideY,
    width: guideW,
    height: guideH,
    radius: 12,
    opacity: 0.08,
  });

  drawText(ctx, 'CARA MELOMPAT:', guideX + 20, guideY + 24, {
    font: font('captionBold'),
    color: THEME.textPrimary,
    shadow: false,
  });

  drawText(
    ctx,
    '• Gerakan Kamera : Lompat di depan kamera',
    guideX + 20,
    guideY + 46,
    {
      font: font('body'),
      color: THEME.textSecondary,
      shadow: false,
    },
  );

  drawText(
    ctx,
    '• Alternatif      : Keyboard (SPACE / Panah Atas) atau Layar Sentuh',
    guideX + 20,
    guideY + 68,
    {
      font: font('body'),
      color: THEME.textMuted,
      shadow: false,
    },
  );

  // 9. Skip / Start Playing Button
  drawButton(ctx, {
    x: CALIBRATE_BUTTONS.skip.x,
    y: CALIBRATE_BUTTONS.skip.y,
    width: CALIBRATE_BUTTONS.skip.width,
    height: CALIBRATE_BUTTONS.skip.height,
    label: 'MULAI MAIN SEKARANG',
    style: 'primary',
    icon: 'play',
  });

  // Keyboard shortcut hint
  drawKeyHint(
    ctx,
    'Tekan SPACE atau ENTER untuk langsung main',
    CANVAS_WIDTH / 2,
    420,
  );

  // 10. Webcam PiP
  drawPiP(ctx);
}
