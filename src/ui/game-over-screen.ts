/**
 * Game Over Screen — Polished Game Over screen with sad monster mascot and stats card
 *
 * Menggantikan layout lama yang monoton tanpa visual karakter.
 * Menggunakan glass card untuk merangkum hasil permainan secara rapi.
 */

import { CANVAS_WIDTH } from '@utils/constants';
import { THEME, font } from './theme';
import { drawMonsterCharacter, drawStarIcon, drawTrophyIcon } from './icons';
import { drawNightBackground, drawButton, drawGlassPanel, drawText, drawKeyHint } from './components';

export const GAME_OVER_BUTTONS = {
  playAgain: { x: CANVAS_WIDTH / 2 - 120, y: 315, width: 240, height: 48 },
};

export interface GameOverScreenProps {
  animTime: number;
  score: number;
  formattedScore: string;
  highScore: number;
  formattedHighScore: string;
  isNewHighScore: boolean;
  gamesPlayed: number;
  drawPiP: (ctx: CanvasRenderingContext2D) => void;
}

export function renderGameOverScreen(
  ctx: CanvasRenderingContext2D,
  props: GameOverScreenProps,
): void {
  const {
    animTime,
    score,
    formattedScore,
    formattedHighScore,
    isNewHighScore,
    gamesPlayed,
    drawPiP,
  } = props;

  // 1. Background
  drawNightBackground(ctx, animTime);

  // 2. Sad Monster Mascot
  drawMonsterCharacter(
    ctx,
    CANVAS_WIDTH / 2,
    75,
    65,
    'sad',
    animTime,
  );

  // 3. Title with Danger Glow
  drawText(ctx, 'GAME OVER', CANVAS_WIDTH / 2, 138, {
    font: font('hero'),
    color: THEME.danger,
    align: 'center',
    shadow: true,
    shadowColor: 'rgba(229, 57, 53, 0.5)',
    shadowBlur: 16,
  });

  // 4. Glass Stats Card
  const cardW = 320;
  const cardH = 120;
  const cardX = CANVAS_WIDTH / 2 - cardW / 2;
  const cardY = 160;

  drawGlassPanel(ctx, {
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH,
    radius: 14,
    opacity: 0.12,
  });

  // Highlight border if new high score
  if (isNewHighScore && score > 0) {
    ctx.save();
    ctx.strokeStyle = THEME.gold;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = THEME.goldGlow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.stroke();
    ctx.restore();
  }

  // Row 1: Score
  const row1Y = cardY + 32;
  drawStarIcon(ctx, cardX + 32, row1Y, 16, THEME.gold);
  drawText(ctx, 'Skor Kamu', cardX + 52, row1Y + 5, {
    font: font('body'),
    color: THEME.textSecondary,
    shadow: false,
  });
  drawText(ctx, formattedScore, cardX + cardW - 32, row1Y + 6, {
    font: font('title'),
    color: THEME.gold,
    align: 'right',
    shadow: false,
  });

  // Row 2: Best Score
  const row2Y = cardY + 68;
  drawTrophyIcon(ctx, cardX + 32, row2Y, 16, isNewHighScore ? THEME.gold : THEME.textSecondary);
  drawText(ctx, 'Rekor Terbaik', cardX + 52, row2Y + 5, {
    font: font('body'),
    color: THEME.textSecondary,
    shadow: false,
  });
  drawText(ctx, formattedHighScore, cardX + cardW - 32, row2Y + 5, {
    font: font('bodyBold'),
    color: isNewHighScore ? THEME.gold : THEME.textPrimary,
    align: 'right',
    shadow: false,
  });

  // Row 3: Games Played or New Record Badge
  const row3Y = cardY + 98;
  if (isNewHighScore && score > 0) {
    const pulse = Math.sin(animTime / 250) * 0.2 + 0.8;
    ctx.save();
    ctx.globalAlpha = pulse;
    drawText(ctx, '★ REKOR BARU TERCAPAI! ★', CANVAS_WIDTH / 2, row3Y, {
      font: font('captionBold'),
      color: THEME.gold,
      align: 'center',
      shadow: true,
      shadowColor: THEME.goldGlow,
    });
    ctx.restore();
  } else {
    drawText(ctx, `Total Permainan: ${gamesPlayed}`, CANVAS_WIDTH / 2, row3Y, {
      font: font('caption'),
      color: THEME.textMuted,
      align: 'center',
      shadow: false,
    });
  }

  // 5. Main Play Again Button
  drawButton(ctx, {
    x: GAME_OVER_BUTTONS.playAgain.x,
    y: GAME_OVER_BUTTONS.playAgain.y,
    width: GAME_OVER_BUTTONS.playAgain.width,
    height: GAME_OVER_BUTTONS.playAgain.height,
    label: 'MAIN LAGI',
    style: 'primary',
    icon: 'play',
  });

  // Keyboard shortcut hint
  drawKeyHint(
    ctx,
    'Tekan SPACE atau ENTER untuk main lagi',
    CANVAS_WIDTH / 2,
    384,
  );

  // 6. Webcam PiP
  drawPiP(ctx);
}
