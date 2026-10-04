import { describe, it, expect } from 'vitest';
import { StateMachine, GameState } from '../src/core/state-machine';

describe('StateMachine', () => {
  it('starts in LOADING state', () => {
    const sm = new StateMachine();
    expect(sm.state).toBe(GameState.LOADING);
  });

  it('allows valid transition LOADING → MENU', () => {
    const sm = new StateMachine();
    expect(sm.transition(GameState.MENU)).toBe(true);
    expect(sm.state).toBe(GameState.MENU);
  });

  it('rejects invalid transition LOADING → PLAYING', () => {
    const sm = new StateMachine();
    expect(sm.transition(GameState.PLAYING)).toBe(false);
    expect(sm.state).toBe(GameState.LOADING); // state unchanged
  });

  it('allows MENU → PLAYING (keyboard mode, skip calibration)', () => {
    const sm = new StateMachine();
    sm.transition(GameState.MENU);
    expect(sm.transition(GameState.PLAYING)).toBe(true);
  });

  it('allows full flow: MENU → CALIBRATING → PLAYING → GAME_OVER → MENU', () => {
    const sm = new StateMachine();
    sm.transition(GameState.MENU);
    expect(sm.transition(GameState.CALIBRATING)).toBe(true);
    expect(sm.transition(GameState.PLAYING)).toBe(true);
    expect(sm.transition(GameState.GAME_OVER)).toBe(true);
    expect(sm.transition(GameState.MENU)).toBe(true);
  });

  it('allows PLAYING → PAUSED → PLAYING', () => {
    const sm = new StateMachine();
    sm.transition(GameState.MENU);
    sm.transition(GameState.PLAYING);
    expect(sm.transition(GameState.PAUSED)).toBe(true);
    expect(sm.transition(GameState.PLAYING)).toBe(true);
  });

  it('allows PAUSED → MENU (quit)', () => {
    const sm = new StateMachine();
    sm.transition(GameState.MENU);
    sm.transition(GameState.PLAYING);
    sm.transition(GameState.PAUSED);
    expect(sm.transition(GameState.MENU)).toBe(true);
  });

  it('rejects PAUSED → GAME_OVER (invalid)', () => {
    const sm = new StateMachine();
    sm.transition(GameState.MENU);
    sm.transition(GameState.PLAYING);
    sm.transition(GameState.PAUSED);
    expect(sm.transition(GameState.GAME_OVER)).toBe(false);
  });

  it('notifies listeners on valid transition', () => {
    const sm = new StateMachine();
    let notified = false;
    sm.onChange((newState, oldState) => {
      expect(oldState).toBe(GameState.LOADING);
      expect(newState).toBe(GameState.MENU);
      notified = true;
    });
    sm.transition(GameState.MENU);
    expect(notified).toBe(true);
  });

  it('does NOT notify listeners on invalid transition', () => {
    const sm = new StateMachine();
    let notified = false;
    sm.onChange(() => { notified = true; });
    sm.transition(GameState.PLAYING); // invalid from LOADING
    expect(notified).toBe(false);
  });

  it('unsubscribe works', () => {
    const sm = new StateMachine();
    let count = 0;
    const unsub = sm.onChange(() => { count++; });
    sm.transition(GameState.MENU);
    expect(count).toBe(1);
    unsub();
    sm.transition(GameState.PLAYING);
    expect(count).toBe(1); // not called after unsub
  });
});
