/**
 * Game State Machine
 *
 * Semua game state dan transisi terdefinisi secara eksplisit.
 * Tidak ada state "abu-abu" — setiap transisi di-validate.
 *
 * LOADING → MENU → CALIBRATING → PLAYING → GAME_OVER → MENU
 *                                   ↕
 *                                 PAUSED
 */

export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  CALIBRATING = 'CALIBRATING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/** Valid transitions — semua lainnya ditolak */
const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.LOADING]: [GameState.MENU],
  [GameState.MENU]: [GameState.CALIBRATING, GameState.PLAYING], // PLAYING langsung jika keyboard mode
  [GameState.CALIBRATING]: [GameState.PLAYING, GameState.MENU],
  [GameState.PLAYING]: [GameState.PAUSED, GameState.GAME_OVER],
  [GameState.PAUSED]: [GameState.PLAYING, GameState.MENU],
  [GameState.GAME_OVER]: [GameState.CALIBRATING, GameState.PLAYING, GameState.MENU],
};

export type StateChangeListener = (newState: GameState, oldState: GameState) => void;

export class StateMachine {
  private _state: GameState = GameState.LOADING;
  private readonly listeners: StateChangeListener[] = [];

  get state(): GameState {
    return this._state;
  }

  /** Attempt state transition. Returns true if valid, false if rejected. */
  transition(newState: GameState): boolean {
    const allowed = VALID_TRANSITIONS[this._state];
    if (!allowed?.includes(newState)) {
      console.warn(
        `[StateMachine] Invalid transition: ${this._state} → ${newState}`,
      );
      return false;
    }

    const oldState = this._state;
    this._state = newState;

    for (const listener of this.listeners) {
      listener(newState, oldState);
    }

    return true;
  }

  /** Subscribe to state changes */
  onChange(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  /** Check if currently in a given state */
  is(state: GameState): boolean {
    return this._state === state;
  }
}
