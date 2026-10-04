/**
 * Jump Jump Monster — Entry Point
 * Langkah 8: Web Audio System & Game Feel
 * Langkah 9: Webcam MediaPipe Pose Integration
 */

import { CanvasRenderer } from '@core/canvas-renderer';
import { GameLoop } from '@core/game-loop';
import { StateMachine, GameState } from '@core/state-machine';
import { InputManager, InputAction } from '@input/input-manager';
import { Player, PlayerState } from '@game/player';
import { ParallaxBackground } from '@game/parallax-background';
import { WorldSpeed } from '@game/world-speed';
import { ObstacleSpawner } from '@game/obstacle-spawner';
import { CollectibleSpawner } from '@game/collectible';
import { ScoreManager } from '@game/score-manager';
import { SoundManager } from '@audio/index';
import { WebcamTracker } from '@input/webcam-tracker';
import { ParticleSystem } from '@game/particles';
import { checkPlayerObstacleCollision } from '@game/collision';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  GROUND_Y,
  BREAK_REMINDER_INTERVAL_MS,
} from '@utils/constants';


// ─── Bootstrap ────────────────────────────────────────────────
const app = document.getElementById('app');
if (!app) throw new Error('#app container not found');

const renderer = new CanvasRenderer(app);
const soundManager = new SoundManager();
const stateMachine = new StateMachine();
const input = new InputManager();
const player = new Player();
const background = new ParallaxBackground();
const worldSpeed = new WorldSpeed();
const spawner = new ObstacleSpawner();
const collectibles = new CollectibleSpawner();
const scoreManager = new ScoreManager();
const particleSystem = new ParticleSystem();

// Wire player particles
player.onTakeoff = () => {
  particleSystem.spawnDustPuff(player.x + player.width / 2, GROUND_Y - 8, 8);
};
player.onLand = () => {
  particleSystem.spawnDustPuff(player.x + player.width / 2, GROUND_Y - 8, 10);
};

const webcam = new WebcamTracker({
  onAction: (action) => input.emit(action),
  onStatusChange: (status, message) => {
    console.log(`[Main] Webcam: ${status}${message ? ' — ' + message : ''}`);
  },
});
let elapsedMs = 0;
let collisionCooldown = 0;
let totalPlayTimeMs = 0;
let showBreakReminder = false;
let breakReminderTimer = 0;

// ─── State transitions ────────────────────────────────────────
stateMachine.transition(GameState.MENU);

stateMachine.onChange((newState, _oldState) => {
  if (newState === GameState.PLAYING) {
    player.reset();
    background.reset();
    worldSpeed.reset();
    spawner.reset();
    collectibles.reset();
    scoreManager.reset();
    particleSystem.reset();
    renderer.resetEffects();
    elapsedMs = 0;
    collisionCooldown = 0;
    soundManager.playStart();
  }
  if (newState === GameState.GAME_OVER) {
    scoreManager.finalizeGame();
    if (scoreManager.isNewHighScore && scoreManager.score > 0) {
      soundManager.playHighScore();
    } else {
      soundManager.playGameOver();
    }
  }
});

// ─── Input handling ───────────────────────────────────────────
input.onAction((action) => {
  // Audio Mute toggle (Key M)
  if (action === InputAction.TOGGLE_MUTE) {
    soundManager.toggleMute();
    return;
  }

  // Calibrating state
  if (stateMachine.is(GameState.CALIBRATING)) {
    if (action === InputAction.CONFIRM || action === InputAction.JUMP) {
      stateMachine.transition(GameState.PLAYING);
      return;
    }
    if (action === InputAction.PAUSE) {
      stateMachine.transition(GameState.MENU);
      return;
    }
  }

  // Menu / Game Over → mulai main
  if (
    (action === InputAction.CONFIRM || action === InputAction.JUMP) &&
    (stateMachine.is(GameState.MENU) || stateMachine.is(GameState.GAME_OVER))
  ) {
    stateMachine.transition(GameState.PLAYING);
    return;
  }

  // In-game controls
  if (stateMachine.is(GameState.PLAYING)) {
    switch (action) {
      case InputAction.JUMP: {
        const canJump = player.state === PlayerState.RUNNING;
        player.jump();
        if (canJump) soundManager.playJump();
        break;
      }
      case InputAction.DUCK_START: {
        const canDuck =
          player.state === PlayerState.RUNNING ||
          player.state === PlayerState.JUMPING;
        player.startDuck();
        if (canDuck) soundManager.playDuck();
        break;
      }
      case InputAction.DUCK_END:
        player.endDuck();
        break;
      case InputAction.LEAN_LEFT:
        player.setLean('LEFT');
        break;
      case InputAction.LEAN_RIGHT:
        player.setLean('RIGHT');
        break;
      case InputAction.LEAN_CENTER:
        player.setLean('CENTER');
        break;
      case InputAction.PAUSE:
        stateMachine.transition(GameState.PAUSED);
        break;
    }
  } else if (stateMachine.is(GameState.PAUSED)) {
    if (action === InputAction.PAUSE || action === InputAction.CONFIRM) {
      stateMachine.transition(GameState.PLAYING);
    }
  }
});

// ─── Canvas Click / Touch handling ────────────────────────────
renderer.canvas.addEventListener('click', (e) => {
  soundManager.unlock();
  const rect = renderer.canvas.getBoundingClientRect();
  const scale = renderer.scale;
  const clickX = (e.clientX - rect.left) / scale;
  const clickY = (e.clientY - rect.top) / scale;

  // Cek klik tombol mute di pojok kanan atas
  if (clickX >= CANVAS_WIDTH - 120 && clickY <= 40) {
    soundManager.toggleMute();
    return;
  }

  // Cek klik di layar CALIBRATING
  if (stateMachine.is(GameState.CALIBRATING)) {
    // Tombol Skip (Mulai Main)
    const skipBtnX = CANVAS_WIDTH / 2 - 110;
    const skipBtnY = 350;
    const skipBtnW = 220;
    const skipBtnH = 46;
    if (
      clickX >= skipBtnX && clickX <= skipBtnX + skipBtnW &&
      clickY >= skipBtnY && clickY <= skipBtnY + skipBtnH
    ) {
      stateMachine.transition(GameState.PLAYING);
      return;
    }

    // Tombol Kembali ke Menu (pojok kiri atas)
    if (clickX <= 160 && clickY <= 45) {
      stateMachine.transition(GameState.MENU);
      return;
    }
    return;
  }

  // Cek klik tombol webcam di menu (area tombol biru)
  if (stateMachine.is(GameState.MENU)) {
    const camBtnX = CANVAS_WIDTH / 2 - 100;
    const camBtnY = 345;
    const camBtnW = 200;
    const camBtnH = 42;
    if (
      clickX >= camBtnX && clickX <= camBtnX + camBtnW &&
      clickY >= camBtnY && clickY <= camBtnY + camBtnH
    ) {
      if (webcam.currentStatus === 'IDLE' || webcam.currentStatus === 'ERROR' || webcam.currentStatus === 'DENIED') {
        webcam.start().catch(console.error);
        stateMachine.transition(GameState.CALIBRATING);
      } else {
        stateMachine.transition(GameState.CALIBRATING);
      }
      return;
    }
  }

  // Klik untuk mulai / main lagi
  if (stateMachine.is(GameState.MENU) || stateMachine.is(GameState.GAME_OVER)) {
    stateMachine.transition(GameState.PLAYING);
  }
});

// ─── Game Loop ────────────────────────────────────────────────
const gameLoop = new GameLoop(
  (dt: number) => {
    renderer.updateEffects(dt);
    particleSystem.update(dt);

    // Auto-advance dari CALIBRATING saat kalibrasi selesai (progress >= 1.0)
    if (stateMachine.is(GameState.CALIBRATING)) {
      if (webcam.isTracking) {
        stateMachine.transition(GameState.PLAYING);
        return;
      }
    }

    if (!stateMachine.is(GameState.PLAYING)) return;

    elapsedMs += dt;
    totalPlayTimeMs += dt;

    // Safety UX: 10-minute break reminder
    if (totalPlayTimeMs >= BREAK_REMINDER_INTERVAL_MS && !showBreakReminder) {
      showBreakReminder = true;
      breakReminderTimer = 8000; // tampil selama 8 detik
    }
    if (showBreakReminder) {
      breakReminderTimer -= dt;
      if (breakReminderTimer <= 0) {
        showBreakReminder = false;
        totalPlayTimeMs = 0; // reset untuk siklus 10 menit berikutnya
      }
    }

    background.update(dt, worldSpeed.speed);
    worldSpeed.update(dt);
    player.update(dt);
    spawner.update(dt, worldSpeed.speed, elapsedMs);
    scoreManager.update(dt);
    scoreManager.addTimeScore(dt);

    // Collectibles
    const collected = collectibles.update(dt, worldSpeed.speed, player);
    for (const c of collected) {
      if (c.type === 'SHIELD') {
        player.activateShield();
        soundManager.playShieldPickup();
        particleSystem.spawnBubblePop(c.x, c.y, 16);
        renderer.flash('rgba(0, 229, 255, 0.35)', 160);
      } else {
        scoreManager.collectItem(c.x, c.y);
        particleSystem.spawnStarBurst(c.x, c.y, 10);
        soundManager.playCollect(scoreManager.multiplier);
        renderer.flash('rgba(255, 230, 100, 0.25)', 120);
      }
    }

    // Collision detection
    if (collisionCooldown > 0) {
      collisionCooldown -= dt;
    } else {
      const hit = checkPlayerObstacleCollision(player, spawner.activeObstacles);
      if (hit) {
        if (player.hasShield) {
          // BUBBLE SHIELD PROTECTS THE PLAYER!
          player.breakShield();
          hit.active = false; // hancurkan rintangan
          collisionCooldown = 1000; // 1s invulnerability cooldown
          soundManager.playShieldBreak();
          particleSystem.spawnBubblePop(player.x + player.width / 2, player.y + player.height / 2, 20);
          particleSystem.spawnHitSparks(hit.x + hit.width / 2, hit.y + hit.height / 2, 14);
          renderer.shake(8, 200);
          renderer.flash('rgba(0, 229, 255, 0.45)', 220);
        } else {
          // NO SHIELD -> GAME OVER
          player.hurt();
          collisionCooldown = 1200;
          particleSystem.spawnHitSparks(player.x + player.width / 2, player.y + player.height / 2, 16);
          soundManager.playHit();
          renderer.shake(14, 320);
          renderer.flash('rgba(255, 50, 50, 0.4)', 220);
          stateMachine.transition(GameState.GAME_OVER);
        }
      }
    }
  },

  // RENDER
  (_interpolation: number) => {
    renderer.clear();

    // ── MENU ─────────────────────────────────────────────────
    if (stateMachine.is(GameState.MENU)) {
      renderMenuScreen();
    }
    // ── CALIBRATING ──────────────────────────────────────────
    else if (stateMachine.is(GameState.CALIBRATING)) {
      renderCalibratingScreen();
    }
    // ── PLAYING ──────────────────────────────────────────────
    else if (
      stateMachine.is(GameState.PLAYING) ||
      stateMachine.is(GameState.PAUSED)
    ) {
      renderGameScreen();
      if (stateMachine.is(GameState.PAUSED)) {
        renderPauseOverlay();
      }
    }
    // ── GAME OVER ─────────────────────────────────────────────
    else if (stateMachine.is(GameState.GAME_OVER)) {
      renderGameOverScreen();
    }

    // FPS counter — selalu tampil (debug)
    renderer.drawText(`FPS: ${gameLoop.fps}`, CANVAS_WIDTH - 8, 18, {
      font: '11px monospace',
      color: '#00FF00',
      align: 'right',
      shadow: false,
    });
  },
);

// ─── Render Functions ─────────────────────────────────────────

function renderMenuScreen(): void {
  // Dark gradient background
  const ctx = renderer.ctx;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#1A1A2E');
  grad.addColorStop(1, '#16213E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Bintang-bintang dekoratif
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const stars = [[80,40],[200,20],[350,60],[500,30],[650,50],[750,25],[100,80],[450,15]];
  for (const [sx, sy] of stars) {
    if (sx !== undefined && sy !== undefined) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Title dengan glow effect
  ctx.save();
  ctx.shadowColor = COLORS.menuAccent;
  ctx.shadowBlur = 20;
  renderer.drawText('🎮 Jump Jump Monster', CANVAS_WIDTH / 2, 140, {
    font: 'bold 38px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
  });
  ctx.restore();

  renderer.drawText('Game aktif untuk anak-anak!', CANVAS_WIDTH / 2, 185, {
    font: '16px system-ui, sans-serif',
    color: '#AAAACC',
    align: 'center',
    shadow: false,
  });

  // Play button visual
  const btnX = CANVAS_WIDTH / 2 - 100;
  const btnY = 220;
  const btnW = 200;
  const btnH = 50;
  ctx.fillStyle = COLORS.menuAccent;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 12);
  ctx.fill();

  renderer.drawText('▶ MULAI MAIN', CANVAS_WIDTH / 2, btnY + 32, {
    font: 'bold 18px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
    shadow: false,
  });

  renderer.drawText('ENTER atau SPACE', CANVAS_WIDTH / 2, 295, {
    font: '13px system-ui, sans-serif',
    color: '#666688',
    align: 'center',
    shadow: false,
  });

  // Controls hint
  renderer.drawText('↑ Lompat   ↓ Jongkok   ESC Pause   M Suara', CANVAS_WIDTH / 2, 320, {
    font: '13px system-ui, sans-serif',
    color: '#555577',
    align: 'center',
    shadow: false,
  });

  // Webcam button
  const camBtnX = CANVAS_WIDTH / 2 - 100;
  const camBtnY = 345;
  const camBtnW = 200;
  const camBtnH = 42;
  const camIsActive = webcam.isTracking || webcam.currentStatus === 'CALIBRATING' || webcam.currentStatus === 'LOADING';
  const camBtnColor = camIsActive ? '#00AA55' : webcam.currentStatus === 'DENIED' ? '#882222' : '#2255AA';

  renderer.ctx.fillStyle = camBtnColor;
  renderer.ctx.beginPath();
  renderer.ctx.roundRect(camBtnX, camBtnY, camBtnW, camBtnH, 10);
  renderer.ctx.fill();

  const camLabel =
    webcam.currentStatus === 'DENIED' ? '🛋️ Kamera Ditolak' :
    webcam.currentStatus === 'LOADING' ? '⏳ Memuat...' :
    webcam.currentStatus === 'CALIBRATING' ? `📹 Kalibrasi ${Math.round(webcam.calibrationProgress * 100)}%` :
    webcam.isTracking ? '🟢 Webcam Aktif' :
    '📸 Aktifkan Kamera';

  renderer.drawText(camLabel, CANVAS_WIDTH / 2, camBtnY + 28, {
    font: 'bold 14px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
    shadow: false,
  });

  // High score
  if (scoreManager.highScore > 0) {
    renderer.drawText(`🏆 Best: ${scoreManager.formattedHighScore}`, CANVAS_WIDTH / 2, 412, {
      font: '15px system-ui, sans-serif',
      color: COLORS.collectible,
      align: 'center',
    });
  }

  // Webcam PiP juga tampil di menu
  webcam.drawPiP(renderer.ctx);
}

function renderGameScreen(): void {
  // Apply camera shake to world objects
  renderer.applyCamera();

  // Background
  background.render(renderer);

  // Collectibles (di bawah obstacle agar terlihat jelas)
  collectibles.render(renderer);

  // Obstacles
  spawner.render(renderer);

  // Ground line
  renderer.ctx.fillStyle = COLORS.grassGreen;
  renderer.ctx.fillRect(0, GROUND_Y - 8, CANVAS_WIDTH, 4);

  // Player
  player.render(renderer);

  // Particles (juicy visual effects)
  particleSystem.render(renderer);

  // Score popups (floating +N)
  scoreManager.renderPopups(renderer.ctx);

  // Restore camera before rendering HUD
  renderer.restoreCamera();

  // Screen Flash effect
  renderer.renderFlash();

  // Break Reminder Banner (Kid UX Safety)
  if (showBreakReminder) {
    renderBreakReminder();
  }

  // HUD: Score (geser ke kanan jika webcam PiP aktif di kiri atas)
  const isWebcamVisible = webcam.isTracking || webcam.currentStatus === 'CALIBRATING';
  const hudX = isWebcamVisible ? 190 : 16;

  renderer.drawText(`⭐ ${scoreManager.formattedScore}`, hudX, 34, {
    font: 'bold 22px system-ui, sans-serif',
    color: COLORS.collectible,
  });

  // HUD: High score
  if (scoreManager.highScore > 0) {
    renderer.drawText(`Best: ${scoreManager.formattedHighScore}`, hudX, 58, {
      font: '14px system-ui, sans-serif',
      color: 'rgba(255,255,255,0.6)',
      shadow: false,
    });
  }

  // HUD: Shield Active Badge
  if (player.hasShield) {
    renderer.drawText('🛡️ SHIELD AKTIF', hudX, 82, {
      font: 'bold 13px system-ui, sans-serif',
      color: '#00E5FF',
    });
  }

  // HUD: Multiplier (hanya tampil jika > 1)
  if (scoreManager.multiplier > 1) {
    renderer.drawText(`×${scoreManager.multiplier.toFixed(1)}`, CANVAS_WIDTH / 2, 30, {
      font: 'bold 20px system-ui, sans-serif',
      color: '#FF9900',
      align: 'center',
    });
  }

  // HUD: Audio Mute indicator
  const soundIcon = soundManager.isMuted ? '🔇 MUTE' : '🔊 SFX';
  renderer.drawText(`[M] ${soundIcon}`, CANVAS_WIDTH - 80, 20, {
    font: '12px system-ui, sans-serif',
    color: soundManager.isMuted ? '#FF6666' : 'rgba(255,255,255,0.7)',
    align: 'right',
    shadow: false,
  });

  // HUD: Speed (debug)
  renderer.drawText(
    `Speed: ${worldSpeed.speed.toFixed(1)}`,
    CANVAS_WIDTH - 8, 36,
    { font: '11px monospace', color: 'rgba(255,255,255,0.3)', align: 'right', shadow: false }
  );

  // Controls hint (hanya di awal)
  if (worldSpeed.distance < 50) {
    const hintText = webcam.isTracking
      ? 'LOMPAT ↑   JONGKOK ↓   [Kamera Aktif 🟢]'
      : '↑ LOMPAT   ↓ JONGKOK   M SUARA';
    renderer.drawText(hintText, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15, {
      font: '12px system-ui, sans-serif',
      color: 'rgba(255,255,255,0.5)',
      align: 'center',
      shadow: false,
    });
  }

  // Webcam PiP overlay — kiri bawah
  webcam.drawPiP(renderer.ctx);

  // Webcam status HUD — pojok kanan bawah (jika aktif)
  if (webcam.currentStatus === 'CALIBRATING') {
    renderer.drawText(
      `📹 Kalibrasi... ${Math.round(webcam.calibrationProgress * 100)}%`,
      CANVAS_WIDTH - 10, CANVAS_HEIGHT - 10,
      { font: '12px system-ui, sans-serif', color: '#FFAA00', align: 'right', shadow: false }
    );
  }
}

function renderCalibratingScreen(): void {
  const ctx = renderer.ctx;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#121B28');
  grad.addColorStop(1, '#1A2F4C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Back button (top left)
  renderer.drawText('← Kembali ke Menu', 20, 32, {
    font: '14px system-ui, sans-serif',
    color: '#88AACC',
    shadow: false,
  });

  // Title
  renderer.drawText('🧍‍♂️ Kalibrasi Tubuh', CANVAS_WIDTH / 2, 75, {
    font: 'bold 30px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
  });

  // Instruction
  renderer.drawText('Berdiri Tegak Menghadap Kamera!', CANVAS_WIDTH / 2, 118, {
    font: 'bold 20px system-ui, sans-serif',
    color: COLORS.collectible,
    align: 'center',
  });

  renderer.drawText(
    'Posisikan diri 1.5 - 2m dari laptop agar kepala dan bahu terlihat',
    CANVAS_WIDTH / 2,
    148,
    {
      font: '14px system-ui, sans-serif',
      color: '#B0C4DE',
      align: 'center',
      shadow: false,
    }
  );

  // Status message
  const statusMsg =
    webcam.currentStatus === 'LOADING'
      ? '⏳ Menyiapkan model MediaPipe WASM on-device...'
      : webcam.currentStatus === 'DENIED'
        ? '⚠️ Kamera tidak diizinkan. Silakan main dengan Keyboard (↑ lompat, ↓ jongkok, ←→ miring)'
        : webcam.currentStatus === 'CALIBRATING'
          ? '🎯 Sedang mengukur posisi berdiri normal tubuh...'
          : webcam.isTracking
            ? '✅ Kalibrasi selesai! Memulai permainan...'
            : 'Menghubungkan kamera...';

  renderer.drawText(statusMsg, CANVAS_WIDTH / 2, 195, {
    font: '14px system-ui, sans-serif',
    color: webcam.currentStatus === 'DENIED' ? '#FF6666' : '#E0E0FF',
    align: 'center',
    shadow: false,
  });

  // Progress bar
  const barW = 320;
  const barH = 22;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = 220;

  // Background bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 11);
  ctx.fill();

  // Fill bar
  const progress = webcam.calibrationProgress;
  if (progress > 0) {
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#00C853');
    fillGrad.addColorStop(1, '#69F0AE');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(12, barW * progress), barH, 11);
    ctx.fill();
  }

  // Percentage text
  renderer.drawText(`${Math.round(progress * 100)}%`, CANVAS_WIDTH / 2, barY + 16, {
    font: 'bold 12px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
    shadow: false,
  });

  // Controls info
  renderer.drawText(
    '↑ Lompat  |  ↓ Jongkok  |  ← → Miring Kiri/Kanan (Menghindar)',
    CANVAS_WIDTH / 2,
    285,
    {
      font: '13px system-ui, sans-serif',
      color: '#8899AA',
      align: 'center',
      shadow: false,
    }
  );

  // Skip / Start Now button
  const skipBtnX = CANVAS_WIDTH / 2 - 110;
  const skipBtnY = 325;
  const skipBtnW = 220;
  const skipBtnH = 44;

  ctx.fillStyle = COLORS.menuAccent;
  ctx.beginPath();
  ctx.roundRect(skipBtnX, skipBtnY, skipBtnW, skipBtnH, 12);
  ctx.fill();

  renderer.drawText('▶ MULAI MAIN SEKARANG', CANVAS_WIDTH / 2, skipBtnY + 28, {
    font: 'bold 15px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
    shadow: false,
  });

  renderer.drawText('ENTER atau SPACE untuk langsung main', CANVAS_WIDTH / 2, 395, {
    font: '12px system-ui, sans-serif',
    color: '#667788',
    align: 'center',
    shadow: false,
  });

  // PiP Preview di pojok kiri bawah
  webcam.drawPiP(renderer.ctx);
}

function renderBreakReminder(): void {
  const ctx = renderer.ctx;
  const bannerW = 540;
  const bannerH = 38;
  const bannerX = CANVAS_WIDTH / 2 - bannerW / 2;
  const bannerY = 48;

  ctx.save();
  ctx.fillStyle = 'rgba(26, 35, 126, 0.92)';
  ctx.strokeStyle = '#64B5F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 19);
  ctx.fill();
  ctx.stroke();

  renderer.drawText(
    '🥤 Sudah 10 menit bergerak! Istirahat minum air dulu ya~ 🥤',
    CANVAS_WIDTH / 2,
    bannerY + 24,
    {
      font: 'bold 14px system-ui, sans-serif',
      color: '#E3F2FD',
      align: 'center',
      shadow: false,
    }
  );
  ctx.restore();
}

function renderPauseOverlay(): void {
  const ctx = renderer.ctx;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  renderer.drawText('⏸ PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, {
    font: 'bold 36px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
  });
  renderer.drawText('Tekan ESC atau ENTER untuk lanjut', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25, {
    font: '15px system-ui, sans-serif',
    color: '#888888',
    align: 'center',
    shadow: false,
  });
}

function renderGameOverScreen(): void {
  const ctx = renderer.ctx;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#2D1B1B');
  grad.addColorStop(1, '#1A1A2E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  renderer.drawText('💥 GAME OVER', CANVAS_WIDTH / 2, 120, {
    font: 'bold 38px system-ui, sans-serif',
    color: '#FF4444',
    align: 'center',
  });

  renderer.drawText(`Score: ${scoreManager.formattedScore}`, CANVAS_WIDTH / 2, 185, {
    font: 'bold 28px system-ui, sans-serif',
    color: COLORS.collectible,
    align: 'center',
  });

  if (scoreManager.isNewHighScore && scoreManager.score > 0) {
    renderer.drawText('🎉 REKOR BARU!', CANVAS_WIDTH / 2, 230, {
      font: 'bold 20px system-ui, sans-serif',
      color: '#FFD700',
      align: 'center',
    });
  } else if (scoreManager.highScore > 0) {
    renderer.drawText(`Best: ${scoreManager.formattedHighScore}`, CANVAS_WIDTH / 2, 230, {
      font: '18px system-ui, sans-serif',
      color: 'rgba(255,255,255,0.6)',
      align: 'center',
      shadow: false,
    });
  }

  // Games played
  renderer.drawText(`Games played: ${scoreManager.gamesPlayed}`, CANVAS_WIDTH / 2, 258, {
    font: '13px system-ui, sans-serif',
    color: 'rgba(255,255,255,0.4)',
    align: 'center',
    shadow: false,
  });

  // Play Again button
  const btnX = CANVAS_WIDTH / 2 - 110;
  const btnY = 278;
  ctx.fillStyle = COLORS.menuAccent;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, 220, 50, 12);
  ctx.fill();

  renderer.drawText('▶ MAIN LAGI', CANVAS_WIDTH / 2, btnY + 32, {
    font: 'bold 18px system-ui, sans-serif',
    color: '#FFFFFF',
    align: 'center',
    shadow: false,
  });

  renderer.drawText('ENTER atau SPACE', CANVAS_WIDTH / 2, 352, {
    font: '13px system-ui, sans-serif',
    color: '#555577',
    align: 'center',
    shadow: false,
  });

  // Webcam PiP juga tampil di game over
  webcam.drawPiP(renderer.ctx);
}

// ─── Pause saat tab switch ──────────────────────────────────────
renderer.onVisibilityChange = (visible: boolean) => {
  if (!visible && stateMachine.is(GameState.PLAYING)) {
    stateMachine.transition(GameState.PAUSED);
  }
};

// ─── Start ─────────────────────────────────────────────
gameLoop.start();
console.log('[JJM] 🎮 Jump Jump Monster — Langkah 10 (Juice & Lean) ready');
