/**
 * Pause Overlay — Clean glass overlay when game is paused
 *
 * Menampilkan monster tidur yang menggemaskan dengan instruksi lanjut main.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@utils/constants';
import { THEME, font } from './theme';
import { drawMonsterCharacter, drawPauseIcon } from './icons';
import { drawGlassPanel, drawButton, drawText, drawKeyHint } from './components';

export const PAUSE_BUTTONS = {
  resume: { x: CANVAS_WIDTH / 2 - 100, y: CANVAS_HEIGHT / 2 + 50, width: 200, height: 44 },
};

export interface PauseOverlayProps {
  animTime: number;
}

export function renderPauseOverlay(
  ctx: CanvasRenderingContext2D,
  props: PauseOverlayProps,
): void {
  const { animTime } = props;

  // 1. Semi-transparent dark overlay
  ctx.save();
  ctx.fillStyle = 'rgba(15, 25, 35, 0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();

  // 2. Center Glass Card
  const cardW = 340;
  const cardH = 250;
  const cardX = CANVAS_WIDTH / 2 - cardW / 2;
  const cardY = CANVAS_HEIGHT / 2 - cardH / 2 - 15;

  drawGlassPanel(ctx, {
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH,
    radius: 16,
    opacity: 0.15,
  });

  // 3. Sleeping Monster Mascot
  drawMonsterCharacter(
    ctx,
    CANVAS_WIDTH / 2,
    cardY + 55,
    60,
    'sleeping',
    animTime,
  );

  // 4. Pause Title
  drawPauseIcon(ctx, CANVAS_WIDTH / 2 - 40, cardY + 115, 14, THEME.textPrimary);
  drawText(ctx, 'JEDA', CANVAS_WIDTH / 2 - 20, cardY + 122, {
    font: font('title'),
    color: THEME.textPrimary,
    align: 'left',
    shadow: true,
  });

  // Subtitle
  drawText(ctx, 'Istirahat sejenak~', CANVAS_WIDTH / 2, cardY + 148, {
    font: font('body'),
    color: THEME.textSecondary,
    align: 'center',
    shadow: false,
  });

  // 5. Resume Button
  drawButton(ctx, {
    x: PAUSE_BUTTONS.resume.x,
    y: PAUSE_BUTTONS.resume.y,
    width: PAUSE_BUTTONS.resume.width,
    height: PAUSE_BUTTONS.resume.height,
    label: 'LANJUT MAIN',
    style: 'primary',
    icon: 'play',
  });

  // 6. Shortcut hint
  drawKeyHint(
    ctx,
    'Tekan ESC atau ENTER untuk lanjut',
    CANVAS_WIDTH / 2,
    PAUSE_BUTTONS.resume.y + 60,
  );
}
