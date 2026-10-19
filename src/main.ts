/**
 * Jump Jump Monster — Entry Point
 * Langkah 8: Web Audio System & Game Feel
 * Langkah 9: Webcam MediaPipe Pose Integration
 */

import { CanvasRenderer } from '@core/canvas-renderer';
import { GameLoop } from '@core/game-loop';
import { StateMachine, GameState } from '@core/state-machine';
import { InputManager, InputAction } from '@input/input-manager';
import { Player } from '@game/player';
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
  COLORS,
  GROUND_Y,
  BREAK_REMINDER_INTERVAL_MS,
} from '@utils/constants';
import {
  renderMenuScreen,
  MENU_BUTTONS,
  renderCalibrateScreen,
  CALIBRATE_BUTTONS,
  renderGameOverScreen,
  GAME_OVER_BUTTONS,
  renderPauseOverlay,
  PAUSE_BUTTONS,
  renderHud,
  HUD_BUTTONS,
} from '@ui/index';


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

// Wire player particles & audio
player.onTakeoff = () => {
  soundManager.playJump();
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
    // Kalibrasi ulang cepat saat mulai ronde agar responsif langsung dari detik pertama
    if (webcam.isTracking) {
      webcam.recalibrate();
    }
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
        player.jump();
        break;
      }
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

  // 1. MENU
  if (stateMachine.is(GameState.MENU)) {
    // Sound button (top right)
    const snd = MENU_BUTTONS.sound;
    if (clickX >= snd.x && clickX <= snd.x + snd.width && clickY >= snd.y && clickY <= snd.y + snd.height) {
      soundManager.toggleMute();
      return;
    }

    // Camera button
    const cam = MENU_BUTTONS.camera;
    if (clickX >= cam.x && clickX <= cam.x + cam.width && clickY >= cam.y && clickY <= cam.y + cam.height) {
      if (webcam.currentStatus === 'IDLE' || webcam.currentStatus === 'ERROR' || webcam.currentStatus === 'DENIED') {
        webcam.start().catch(console.error);
      } else {
        webcam.recalibrate();
      }
      stateMachine.transition(GameState.CALIBRATING);
      return;
    }

    // Play button or click anywhere on menu
    stateMachine.transition(GameState.PLAYING);
    return;
  }

  // 2. CALIBRATING
  if (stateMachine.is(GameState.CALIBRATING)) {
    // Tombol Kembali ke Menu (top left)
    const back = CALIBRATE_BUTTONS.back;
    if (clickX >= back.x && clickX <= back.x + back.width && clickY >= back.y && clickY <= back.y + back.height) {
      stateMachine.transition(GameState.MENU);
      return;
    }

    // Tombol Skip (Mulai Main Sekarang)
    const skip = CALIBRATE_BUTTONS.skip;
    if (clickX >= skip.x && clickX <= skip.x + skip.width && clickY >= skip.y && clickY <= skip.y + skip.height) {
      stateMachine.transition(GameState.PLAYING);
      return;
    }
    return;
  }

  // 3. PLAYING
  if (stateMachine.is(GameState.PLAYING)) {
    // Sound mute button in HUD
    const snd = HUD_BUTTONS.sound;
    if (clickX >= snd.x && clickX <= snd.x + snd.width && clickY >= snd.y && clickY <= snd.y + snd.height) {
      soundManager.toggleMute();
      return;
    }
  }

  // 4. PAUSED
  if (stateMachine.is(GameState.PAUSED)) {
    const res = PAUSE_BUTTONS.resume;
    if (clickX >= res.x && clickX <= res.x + res.width && clickY >= res.y && clickY <= res.y + res.height) {
      stateMachine.transition(GameState.PLAYING);
      return;
    }
  }

  // 5. GAME_OVER
  if (stateMachine.is(GameState.GAME_OVER)) {
    const btn = GAME_OVER_BUTTONS.playAgain;
    if (clickX >= btn.x && clickX <= btn.x + btn.width && clickY >= btn.y && clickY <= btn.y + btn.height) {
      stateMachine.transition(GameState.PLAYING);
      return;
    }
    // Also allow clicking anywhere on Game Over to restart
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

    const now = performance.now();

    // ── MENU ─────────────────────────────────────────────────
    if (stateMachine.is(GameState.MENU)) {
      renderMenuScreen(renderer.ctx, {
        animTime: now,
        highScore: scoreManager.highScore,
        formattedHighScore: scoreManager.formattedHighScore,
        isMuted: soundManager.isMuted,
        webcamStatus: webcam.currentStatus,
        isTracking: webcam.isTracking,
        calibrationProgress: webcam.calibrationProgress,
        drawPiP: (ctx) => webcam.drawPiP(ctx),
      });
    }
    // ── CALIBRATING ──────────────────────────────────────────
    else if (stateMachine.is(GameState.CALIBRATING)) {
      renderCalibrateScreen(renderer.ctx, {
        animTime: now,
        webcamStatus: webcam.currentStatus,
        isTracking: webcam.isTracking,
        calibrationProgress: webcam.calibrationProgress,
        drawPiP: (ctx) => webcam.drawPiP(ctx),
      });
    }
    // ── PLAYING ──────────────────────────────────────────────
    else if (
      stateMachine.is(GameState.PLAYING) ||
      stateMachine.is(GameState.PAUSED)
    ) {
      renderGameScreen();
      if (stateMachine.is(GameState.PAUSED)) {
        renderPauseOverlay(renderer.ctx, {
          animTime: now,
        });
      }
    }
    // ── GAME OVER ─────────────────────────────────────────────
    else if (stateMachine.is(GameState.GAME_OVER)) {
      renderGameOverScreen(renderer.ctx, {
        animTime: now,
        score: scoreManager.score,
        formattedScore: scoreManager.formattedScore,
        highScore: scoreManager.highScore,
        formattedHighScore: scoreManager.formattedHighScore,
        isNewHighScore: scoreManager.isNewHighScore,
        gamesPlayed: scoreManager.gamesPlayed,
        drawPiP: (ctx) => webcam.drawPiP(ctx),
      });
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

// ─── World Game Screen ────────────────────────────────────────

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

  // Unified Clean HUD
  renderHud(renderer.ctx, {
    score: scoreManager.score,
    formattedScore: scoreManager.formattedScore,
    highScore: scoreManager.highScore,
    formattedHighScore: scoreManager.formattedHighScore,
    multiplier: scoreManager.multiplier,
    hasShield: player.hasShield,
    isMuted: soundManager.isMuted,
    speed: worldSpeed.speed,
    distance: worldSpeed.distance,
    isWebcamVisible: webcam.isTracking || webcam.currentStatus === 'CALIBRATING',
    isTracking: webcam.isTracking,
    webcamStatus: webcam.currentStatus,
    calibrationProgress: webcam.calibrationProgress,
    showBreakReminder,
    drawPiP: (ctx) => webcam.drawPiP(ctx),
  });
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
