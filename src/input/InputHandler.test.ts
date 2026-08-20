import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputHandler } from './InputHandler';
import type { InputAction } from './InputHandler';

let target: EventTarget;
let handler: InputHandler;

function press(key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
}

function release(key: string): void {
  target.dispatchEvent(new KeyboardEvent('keyup', { key, cancelable: true }));
}

beforeEach(() => {
  target = new EventTarget();
  handler = new InputHandler(target);
});

afterEach(() => {
  handler.destroy();
});

describe('InputHandler', () => {
  it('should report no movement before any key is pressed', () => {
    expect(handler.isMovingLeft()).toBe(false);
    expect(handler.isMovingRight()).toBe(false);
  });

  it('should track left movement for both A and ArrowLeft', () => {
    press('a');
    expect(handler.isMovingLeft()).toBe(true);
    release('a');
    expect(handler.isMovingLeft()).toBe(false);

    press('ArrowLeft');
    expect(handler.isMovingLeft()).toBe(true);
  });

  it('should track right movement for both D and ArrowRight', () => {
    press('d');
    expect(handler.isMovingRight()).toBe(true);
    release('d');
    expect(handler.isMovingRight()).toBe(false);

    press('ArrowRight');
    expect(handler.isMovingRight()).toBe(true);
  });

  it('should be case insensitive', () => {
    press('A');
    expect(handler.isMovingLeft()).toBe(true);
  });

  it('should hold movement while the key stays down', () => {
    press('d');
    expect(handler.isMovingRight()).toBe(true);
    expect(handler.isMovingRight()).toBe(true);
  });

  it('should allow both directions to be held at once', () => {
    press('a');
    press('d');
    expect(handler.isMovingLeft()).toBe(true);
    expect(handler.isMovingRight()).toBe(true);
  });

  it('should emit togglePause once on P release, not on press', () => {
    const actions: InputAction[] = [];
    handler.setCallback((action) => actions.push(action));

    press('p');
    expect(actions).toEqual([]);

    release('p');
    expect(actions).toEqual(['togglePause']);
  });

  it('should emit restart on R release', () => {
    const actions: InputAction[] = [];
    handler.setCallback((action) => actions.push(action));

    press('r');
    release('r');
    expect(actions).toEqual(['restart']);
  });

  it('should preventDefault only for keys it handles', () => {
    const handled = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    target.dispatchEvent(handled);
    expect(handled.defaultPrevented).toBe(true);

    const ignored = new KeyboardEvent('keydown', { key: 'x', cancelable: true });
    target.dispatchEvent(ignored);
    expect(ignored.defaultPrevented).toBe(false);
  });

  it('should clear held keys', () => {
    press('a');
    handler.clear();
    expect(handler.isMovingLeft()).toBe(false);
  });

  it('should stop listening after destroy', () => {
    const callback = vi.fn();
    handler.setCallback(callback);
    handler.destroy();

    press('a');
    release('p');

    expect(handler.isMovingLeft()).toBe(false);
    expect(callback).not.toHaveBeenCalled();
  });
});
