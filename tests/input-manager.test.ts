/**
 * Unit tests untuk InputManager — Keyboard, Touch, & Lifecycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager, InputAction } from '../src/input/input-manager';

describe('InputManager', () => {
  let input: InputManager;
  const eventListeners: Record<string, ((e: any) => void)[]> = {};

  beforeEach(() => {
    // Setup mock window event bus
    for (const k of Object.keys(eventListeners)) delete eventListeners[k];

    (globalThis as any).window = {
      addEventListener: vi.fn((type: string, handler: any) => {
        if (!eventListeners[type]) eventListeners[type] = [];
        eventListeners[type]!.push(handler);
      }),
      removeEventListener: vi.fn((type: string, handler: any) => {
        if (!eventListeners[type]) return;
        eventListeners[type] = eventListeners[type]!.filter((h) => h !== handler);
      }),
      dispatchEvent: (event: any) => {
        const handlers = eventListeners[event.type] || [];
        for (const h of handlers) h(event);
      },
    };

    input = new InputManager();
  });

  afterEach(() => {
    input.destroy();
  });

  it('emits JUMP on ArrowUp or Space', () => {
    const actions: InputAction[] = [];
    input.onAction((a) => actions.push(a));

    window.dispatchEvent({ type: 'keydown', code: 'ArrowUp', preventDefault: vi.fn() });
    window.dispatchEvent({ type: 'keydown', code: 'Space', preventDefault: vi.fn() });

    expect(actions).toEqual([InputAction.JUMP, InputAction.JUMP]);
  });

  it('emits DUCK_START on ArrowDown and DUCK_END on keyup', () => {
    const actions: InputAction[] = [];
    input.onAction((a) => actions.push(a));

    window.dispatchEvent({ type: 'keydown', code: 'ArrowDown', preventDefault: vi.fn() });
    expect(actions).toContain(InputAction.DUCK_START);

    window.dispatchEvent({ type: 'keyup', code: 'ArrowDown' });
    expect(actions).toContain(InputAction.DUCK_END);
  });

  it('emits LEAN_LEFT and LEAN_CENTER on keyup', () => {
    const actions: InputAction[] = [];
    input.onAction((a) => actions.push(a));

    window.dispatchEvent({ type: 'keydown', code: 'ArrowLeft', preventDefault: vi.fn() });
    expect(actions).toContain(InputAction.LEAN_LEFT);

    window.dispatchEvent({ type: 'keyup', code: 'ArrowLeft' });
    expect(actions).toContain(InputAction.LEAN_CENTER);
  });

  it('emits JUMP on swipe up touch event', () => {
    const actions: InputAction[] = [];
    input.onAction((a) => actions.push(a));

    // Touch start at Y=200
    window.dispatchEvent({
      type: 'touchstart',
      touches: [{ clientX: 100, clientY: 200 }],
    });

    // Touch move up to Y=120 (dy = -80)
    window.dispatchEvent({
      type: 'touchmove',
      touches: [{ clientX: 100, clientY: 120 }],
    });

    expect(actions).toContain(InputAction.JUMP);
  });

  it('emits LEAN_LEFT and LEAN_CENTER on swipe left and touchend', () => {
    const actions: InputAction[] = [];
    input.onAction((a) => actions.push(a));

    window.dispatchEvent({
      type: 'touchstart',
      touches: [{ clientX: 200, clientY: 200 }],
    });

    // Swipe left (dx = -60)
    window.dispatchEvent({
      type: 'touchmove',
      touches: [{ clientX: 140, clientY: 200 }],
    });

    expect(actions).toContain(InputAction.LEAN_LEFT);

    window.dispatchEvent({ type: 'touchend' });
    expect(actions).toContain(InputAction.LEAN_CENTER);
  });

  it('allows unsubscribing listeners', () => {
    const listener = vi.fn();
    const unsub = input.onAction(listener);

    input.emit(InputAction.JUMP);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    input.emit(InputAction.JUMP);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
