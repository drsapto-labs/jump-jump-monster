/**
 * Input Manager — Abstraksi input (keyboard / gesture).
 *
 * Prinsip: Game logic TIDAK tahu apakah input dari keyboard atau webcam.
 * InputManager menyediakan interface seragam.
 *
 * Fase A: Hanya keyboard
 * Fase B: Tambah gesture dari webcam
 */

export enum InputAction {
  JUMP = 'JUMP',
  DUCK_START = 'DUCK_START',
  DUCK_END = 'DUCK_END',
  LEAN_LEFT = 'LEAN_LEFT',
  LEAN_RIGHT = 'LEAN_RIGHT',
  LEAN_CENTER = 'LEAN_CENTER',
  PAUSE = 'PAUSE',
  CONFIRM = 'CONFIRM', // untuk menu / play again
  TOGGLE_MUTE = 'TOGGLE_MUTE',
}

export type InputListener = (action: InputAction) => void;

export class InputManager {
  private readonly listeners: InputListener[] = [];
  private readonly keysDown = new Set<string>();

  // Touch tracking
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private isTouching = false;
  private touchDucking = false;
  private touchLeaning: 'LEFT' | 'RIGHT' | null = null;

  private readonly boundKeyDown: (e: KeyboardEvent) => void;
  private readonly boundKeyUp: (e: KeyboardEvent) => void;
  private readonly boundTouchStart: (e: TouchEvent) => void;
  private readonly boundTouchMove: (e: TouchEvent) => void;
  private readonly boundTouchEnd: (e: TouchEvent) => void;

  constructor() {
    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundKeyUp = (e) => this.handleKeyUp(e);
    this.boundTouchStart = (e) => this.handleTouchStart(e);
    this.boundTouchMove = (e) => this.handleTouchMove(e);
    this.boundTouchEnd = (e) => this.handleTouchEnd(e);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKeyDown);
      window.addEventListener('keyup', this.boundKeyUp);
      window.addEventListener('touchstart', this.boundTouchStart, { passive: true });
      window.addEventListener('touchmove', this.boundTouchMove, { passive: true });
      window.addEventListener('touchend', this.boundTouchEnd, { passive: true });
      window.addEventListener('touchcancel', this.boundTouchEnd, { passive: true });
    }
  }

  /** Subscribe to input actions */
  onAction(listener: InputListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  /** Emit an action (bisa dipanggil dari gesture engine nanti) */
  emit(action: InputAction): void {
    for (const listener of this.listeners) {
      listener(action);
    }
  }

  /** Check if a key is currently held down */
  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.keysDown.has(e.code)) return; // prevent repeat
    this.keysDown.add(e.code);

    switch (e.code) {
      case 'ArrowUp':
      case 'Space':
      case 'KeyW':
        e.preventDefault();
        this.emit(InputAction.JUMP);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        this.emit(InputAction.DUCK_START);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        this.emit(InputAction.LEAN_LEFT);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        this.emit(InputAction.LEAN_RIGHT);
        break;
      case 'Escape':
      case 'KeyP':
        this.emit(InputAction.PAUSE);
        break;
      case 'Enter':
        this.emit(InputAction.CONFIRM);
        break;
      case 'KeyM':
        this.emit(InputAction.TOGGLE_MUTE);
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);

    switch (e.code) {
      case 'ArrowDown':
      case 'KeyS':
        this.emit(InputAction.DUCK_END);
        break;
      case 'ArrowLeft':
      case 'KeyA':
      case 'ArrowRight':
      case 'KeyD':
        this.emit(InputAction.LEAN_CENTER);
        break;
    }
  }

  // ─── Touch / Swipe Handlers (Temple Run Style) ──────────────

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    const t = e.touches[0]!;
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
    this.touchStartTime = performance.now();
    this.isTouching = true;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.isTouching || e.touches.length === 0) return;
    const t = e.touches[0]!;
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const SWIPE_THRESHOLD = 30;

    // Horizontal Swipe (Lean/Dodge)
    if (absX > SWIPE_THRESHOLD && absX > absY * 1.2) {
      if (dx < 0 && this.touchLeaning !== 'LEFT') {
        this.touchLeaning = 'LEFT';
        this.emit(InputAction.LEAN_LEFT);
      } else if (dx > 0 && this.touchLeaning !== 'RIGHT') {
        this.touchLeaning = 'RIGHT';
        this.emit(InputAction.LEAN_RIGHT);
      }
    }

    // Vertical Swipe (Jump / Duck)
    if (absY > SWIPE_THRESHOLD && absY > absX * 1.2) {
      if (dy < 0) {
        // Swipe Up -> Jump
        this.emit(InputAction.JUMP);
        // Reset anchor agar tidak berulang kali trigger
        this.touchStartY = t.clientY;
      } else if (dy > 0 && !this.touchDucking) {
        // Swipe Down -> Duck
        this.touchDucking = true;
        this.emit(InputAction.DUCK_START);
      }
    }
  }

  private handleTouchEnd(e?: TouchEvent): void {
    const elapsed = performance.now() - this.touchStartTime;

    // Quick tap detection (<250ms dan pergeseran kecil) -> Jump / Confirm
    if (this.isTouching && elapsed < 250) {
      const changed = e?.changedTouches?.[0];
      if (changed) {
        const dx = Math.abs(changed.clientX - this.touchStartX);
        const dy = Math.abs(changed.clientY - this.touchStartY);
        if (dx < 15 && dy < 15) {
          // Tap: lompat saat main, confirm saat menu
          this.emit(InputAction.JUMP);
          this.emit(InputAction.CONFIRM);
        }
      }
    }

    if (this.touchDucking) {
      this.touchDucking = false;
      this.emit(InputAction.DUCK_END);
    }

    if (this.touchLeaning !== null) {
      this.touchLeaning = null;
      this.emit(InputAction.LEAN_CENTER);
    }

    this.isTouching = false;
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyDown);
      window.removeEventListener('keyup', this.boundKeyUp);
      window.removeEventListener('touchstart', this.boundTouchStart);
      window.removeEventListener('touchmove', this.boundTouchMove);
      window.removeEventListener('touchend', this.boundTouchEnd);
      window.removeEventListener('touchcancel', this.boundTouchEnd);
    }
    this.listeners.length = 0;
    this.keysDown.clear();
  }
}
