/**
 * Menu Screen — Clean, polished, kid-friendly main menu
 *
 * Menggantikan layout lama yang penuh emoji dan teks tumpang tindih.
 * Menampilkan maskot monster interaktif dengan animasi bouncing idle.
 */

import { CANVAS_WIDTH } from '@utils/constants';
import { THEME, font } from './theme';
import { drawMonsterCharacter, drawSpeakerIcon, drawStarIcon, drawCameraIcon } from './icons';
import { drawNightBackground, drawButton, drawText, drawKeyHint } from './components';

export const MENU_BUTTONS = {
  play: { x: CANVAS_WIDTH / 2 - 120, y: 220, width: 240, height: 48 },
  camera: { x: CANVAS_WIDTH / 2 - 110, y: 304, width: 220, height: 42 },
  sound: { x: CANVAS_WIDTH - 60, y: 12, width: 48, height: 40 },
};

export interface MenuScreenProps {
  animTime: number;
  highScore: number;
  formattedHighScore: string;
  isMuted: boolean;
  webcamStatus: string;
  isTracking: boolean;
  calibrationProgress: number;
  drawPiP: (ctx: CanvasRenderingContext2D) => void;
}

export function renderMenuScreen(
  ctx: CanvasRenderingContext2D,
  props: MenuScreenProps,
): void {
  const {
    animTime,
    highScore,
    formattedHighScore,
    isMuted,
    webcamStatus,
    isTracking,
    calibrationProgress,
    drawPiP,
  } = props;

  // 1. Unified animated night-sky background
  drawNightBackground(ctx, animTime);

  // 2. Sound Toggle Button (top right)
  const snd = MENU_BUTTONS.sound;
  ctx.save();
  ctx.fillStyle = THEME.glass;
  ctx.beginPath();
  ctx.roundRect(snd.x, snd.y, snd.width, snd.height, 10);
  ctx.fill();
  ctx.strokeStyle = THEME.glassBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  drawSpeakerIcon(ctx, snd.x + snd.width / 2, snd.y + snd.height / 2, 20, isMuted);
  ctx.restore();

  // 3. Hero Monster Mascot (centered, idle bouncing)
  drawMonsterCharacter(
    ctx,
    CANVAS_WIDTH / 2,
    95,
    70,
    'idle',
    animTime,
  );

  // 4. Game Title with Warm Glow
  drawText(ctx, 'JUMP JUMP MONSTER', CANVAS_WIDTH / 2, 160, {
    font: font('hero'),
    color: THEME.textPrimary,
    align: 'center',
    shadow: true,
    shadowColor: THEME.primaryGlow,
    shadowBlur: 18,
  });

  // Subtitle
  drawText(ctx, 'Game Gerak Aktif untuk Anak-Anak', CANVAS_WIDTH / 2, 188, {
    font: font('body'),
    color: THEME.textSecondary,
    align: 'center',
    shadow: false,
  });

  // 5. Main Play Button (Primary Orange)
  drawButton(ctx, {
    x: MENU_BUTTONS.play.x,
    y: MENU_BUTTONS.play.y,
    width: MENU_BUTTONS.play.width,
    height: MENU_BUTTONS.play.height,
    label: 'MULAI MAIN',
    style: 'primary',
    icon: 'play',
  });

  // Keyboard shortcut hint
  drawKeyHint(
    ctx,
    'Tekan SPACE atau ENTER untuk mulai',
    CANVAS_WIDTH / 2,
    286,
  );

  // 6. Camera Button (Secondary Glass/Outline)
  let camLabel = 'Aktifkan Kamera';
  let camStyle: 'secondary' | 'primary' = 'secondary';
  if (webcamStatus === 'DENIED') {
    camLabel = 'Kamera Ditolak (Gunakan Keyboard)';
  } else if (webcamStatus === 'LOADING') {
    camLabel = 'Menyiapkan Model AI...';
  } else if (webcamStatus === 'CALIBRATING') {
    camLabel = `Kalibrasi ${Math.round(calibrationProgress * 100)}%`;
  } else if (isTracking) {
    camLabel = 'Kamera Aktif & Siap';
  }

  drawButton(ctx, {
    x: MENU_BUTTONS.camera.x,
    y: MENU_BUTTONS.camera.y,
    width: MENU_BUTTONS.camera.width,
    height: MENU_BUTTONS.camera.height,
    label: camLabel,
    style: camStyle,
  });

  // Small camera icon inside button
  drawCameraIcon(
    ctx,
    MENU_BUTTONS.camera.x + 28,
    MENU_BUTTONS.camera.y + MENU_BUTTONS.camera.height / 2,
    16,
    isTracking ? '#00FF88' : THEME.textSecondary,
  );

  // 7. High Score (Clean pill presentation, no overlapping!)
  if (highScore > 0) {
    const starY = 372;
    const scoreText = `Rekor Terbaik: ${formattedHighScore}`;
    ctx.font = font('bodyBold');
    const textWidth = ctx.measureText(scoreText).width;
    const totalW = textWidth + 34;
    const pillX = CANVAS_WIDTH / 2 - totalW / 2;

    // Glass pill background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(pillX, starY - 14, totalW, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawStarIcon(ctx, pillX + 16, starY, 14, THEME.gold);
    drawText(ctx, scoreText, pillX + 28, starY + 5, {
      font: font('bodyBold'),
      color: THEME.gold,
      align: 'left',
      shadow: false,
    });
    ctx.restore();
  }

  // 8. Controls Footnote (Subtle)
  drawText(
    ctx,
    'Lompat di depan kamera untuk melompat',
    CANVAS_WIDTH / 2,
    424,
    {
      font: font('caption'),
      color: THEME.textMuted,
      align: 'center',
      shadow: false,
    },
  );

  // 9. Webcam PiP (top-left)
  drawPiP(ctx);
}
