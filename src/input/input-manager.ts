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

  constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
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

  destroy(): void {
    this.listeners.length = 0;
    this.keysDown.clear();
  }
}
