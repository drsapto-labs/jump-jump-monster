/**
 * Game HUD — Clean, structured in-game display
 *
 * Mengelompokkan Skor & Best dalam glass panel elegan,
 * menjamin tidak ada tabrakan dengan PiP webcam di layar manapun.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@utils/constants';
import { THEME, font } from './theme';
import { drawStarIcon, drawShieldIcon, drawSpeakerIcon, drawCupIcon } from './icons';
import { drawGlassPanel, drawBadge, drawText } from './components';

export const HUD_BUTTONS = {
  sound: { x: CANVAS_WIDTH - 58, y: 12, width: 46, height: 38 },
};

export interface HudProps {
  score: number;
  formattedScore: string;
  highScore: number;
  formattedHighScore: string;
  multiplier: number;
  hasShield: boolean;
  isMuted: boolean;
  speed: number;
  distance: number;
  isWebcamVisible: boolean;
  isTracking: boolean;
  webcamStatus: string;
  calibrationProgress: number;
  showBreakReminder: boolean;
  drawPiP: (ctx: CanvasRenderingContext2D) => void;
}

export function renderHud(
  ctx: CanvasRenderingContext2D,
  props: HudProps,
): void {
  const {
    formattedScore,
    highScore,
    formattedHighScore,
    multiplier,
    hasShield,
    isMuted,
    speed,
    distance,
    isWebcamVisible,
    isTracking,
    webcamStatus,
    calibrationProgress,
    showBreakReminder,
    drawPiP,
  } = props;

  // 1. Grouped Score & Best Panel (Glass Pill)
  // Berikan margin lega agar tidak pernah overlap dengan PiP (160px width + 14px margin)
  const scorePanelX = isWebcamVisible ? 188 : 16;
  const scorePanelY = 14;
  const scorePanelW = 148;
  const scorePanelH = highScore > 0 ? 52 : 38;

  drawGlassPanel(ctx, {
    x: scorePanelX,
    y: scorePanelY,
    width: scorePanelW,
    height: scorePanelH,
    radius: 12,
    opacity: 0.22,
  });

  // Star icon & current score
  drawStarIcon(ctx, scorePanelX + 18, scorePanelY + 19, 15, THEME.gold);
  drawText(ctx, formattedScore, scorePanelX + 34, scorePanelY + 25, {
    font: font('title'),
    color: THEME.gold,
    align: 'left',
    shadow: true,
    shadowColor: THEME.goldGlow,
    shadowBlur: 6,
  });

  // Best score line if exists
  if (highScore > 0) {
    drawText(ctx, `Best: ${formattedHighScore}`, scorePanelX + 34, scorePanelY + 44, {
      font: font('caption'),
      color: THEME.textSecondary,
      align: 'left',
      shadow: false,
    });
  }

  // 2. Shield Active Badge
  if (hasShield) {
    const shieldY = scorePanelY + scorePanelH + 8;
    const badgeW = 120;
    const badgeH = 26;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(scorePanelX, shieldY, badgeW, badgeH, 13);
    ctx.fill();
    ctx.strokeStyle = THEME.cyan;
    ctx.lineWidth = 1;
    ctx.stroke();

    drawShieldIcon(ctx, scorePanelX + 16, shieldY + 13, 14, THEME.cyan);
    drawText(ctx, 'SHIELD AKTIF', scorePanelX + 30, shieldY + 17, {
      font: font('captionBold'),
      color: THEME.cyan,
      align: 'left',
      shadow: true,
      shadowColor: THEME.cyanGlow,
      shadowBlur: 8,
    });
    ctx.restore();
  }

  // 3. Multiplier Pill Badge (centered top)
  if (multiplier > 1) {
    drawBadge(ctx, {
      cx: CANVAS_WIDTH / 2,
      cy: 24,
      text: `×${multiplier.toFixed(1)}`,
      color: '#FF9900',
      bgColor: 'rgba(255, 107, 53, 0.2)',
    });
  }

  // 4. Sound Mute Button (top right)
  const snd = HUD_BUTTONS.sound;
  ctx.save();
  ctx.fillStyle = THEME.glass;
  ctx.beginPath();
  ctx.roundRect(snd.x, snd.y, snd.width, snd.height, 10);
  ctx.fill();
  ctx.strokeStyle = THEME.glassBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  drawSpeakerIcon(ctx, snd.x + snd.width / 2, snd.y + snd.height / 2, 18, isMuted);
  ctx.restore();

  // 5. Speed Indicator (Subtle, top right below mute)
  drawText(
    ctx,
    `Speed: ${speed.toFixed(1)}`,
    CANVAS_WIDTH - 12,
    62,
    {
      font: font('tiny'),
      color: 'rgba(255, 255, 255, 0.4)',
      align: 'right',
      shadow: false,
    },
  );

  // 6. Initial Floating Tutorial Hint (fades out as player moves)
  if (distance < 60) {
    const hintW = 380;
    const hintH = 32;
    const hintX = CANVAS_WIDTH / 2 - hintW / 2;
    const hintY = CANVAS_HEIGHT - 38;

    // Fade out as distance increases
    const alpha = Math.max(0, 1 - distance / 60);

    ctx.save();
    ctx.globalAlpha = alpha;
    drawGlassPanel(ctx, {
      x: hintX,
      y: hintY,
      width: hintW,
      height: hintH,
      radius: 16,
      opacity: 0.15,
    });

    const hintMsg = isTracking
      ? 'Lompat di Depan Kamera'
      : 'Lompat di Depan Kamera atau Panah Atas';

    drawText(ctx, hintMsg, CANVAS_WIDTH / 2, hintY + 20, {
      font: font('captionBold'),
      color: THEME.textPrimary,
      align: 'center',
      shadow: false,
    });
    ctx.restore();
  }

  // 7. Safety UX: Break Reminder Banner
  if (showBreakReminder) {
    const bannerW = 480;
    const bannerH = 40;
    const bannerX = CANVAS_WIDTH / 2 - bannerW / 2;
    const bannerY = 48;

    ctx.save();
    ctx.fillStyle = 'rgba(27, 40, 56, 0.94)';
    ctx.strokeStyle = THEME.cyan;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = THEME.cyanGlow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 20);
    ctx.fill();
    ctx.stroke();

    drawCupIcon(ctx, bannerX + 26, bannerY + 20, 18, THEME.cyan);
    drawText(
      ctx,
      'Sudah 10 menit bergerak! Istirahat minum air dulu ya~',
      bannerX + 46,
      bannerY + 25,
      {
        font: font('bodyBold'),
        color: '#E0F7FA',
        shadow: false,
      },
    );
    drawCupIcon(ctx, bannerX + bannerW - 26, bannerY + 20, 18, THEME.cyan);
    ctx.restore();
  }

  // 8. Webcam Background Calibration Indicator
  if (webcamStatus === 'CALIBRATING') {
    drawText(
      ctx,
      `Kalibrasi Kamera: ${Math.round(calibrationProgress * 100)}%`,
      CANVAS_WIDTH - 14,
      CANVAS_HEIGHT - 12,
      {
        font: font('captionBold'),
        color: THEME.gold,
        align: 'right',
        shadow: false,
      },
    );
  }

  // 9. Webcam PiP (top-left)
  drawPiP(ctx);
}
