import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputHandler } from './InputHandler';
import type { InputAction } from './InputHandler';

let target: EventTarget;
let handler: InputHandler;
let surface: HTMLElement;

function pointer(type: string, clientX: number): void {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent & {
    clientX: number;
    pointerId: number;
  };
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  surface.dispatchEvent(event);
}

function makeSurface(width = 400, left = 0): HTMLElement {
  const element = document.createElement('div');
  element.getBoundingClientRect = () =>
    ({ left, right: left + width, width, top: 0, bottom: 300, height: 300 }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

function press(key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
}

function release(key: string): void {
  target.dispatchEvent(new KeyboardEvent('keyup', { key, cancelable: true }));
}

beforeEach(() => {
  target = new EventTarget();
  surface = makeSurface();
  handler = new InputHandler(target, surface);
});

afterEach(() => {
  handler.destroy();
  surface.remove();
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

  it('should report no pointer before any touch', () => {
    expect(handler.getPointerFraction()).toBeNull();
  });

  it('should report where the pointer is across the surface', () => {
    pointer('pointerdown', 200);
    expect(handler.getPointerFraction()).toBeCloseTo(0.5, 6);

    pointer('pointermove', 400);
    expect(handler.getPointerFraction()).toBeCloseTo(1, 6);

    pointer('pointermove', 0);
    expect(handler.getPointerFraction()).toBeCloseTo(0, 6);
  });

  it('should clamp a pointer dragged outside the surface', () => {
    pointer('pointerdown', 200);
    pointer('pointermove', -500);
    expect(handler.getPointerFraction()).toBe(0);

    pointer('pointermove', 9999);
    expect(handler.getPointerFraction()).toBe(1);
  });

  it('should account for a surface that is not flush with the viewport', () => {
    handler.destroy();
    surface.remove();
    surface = makeSurface(400, 100);
    handler = new InputHandler(target, surface);

    pointer('pointerdown', 300);
    expect(handler.getPointerFraction()).toBeCloseTo(0.5, 6);
  });

  it('should ignore pointer movement that never started with a press', () => {
    pointer('pointermove', 350);
    expect(handler.getPointerFraction()).toBeNull();
  });

  it('should release the pointer on pointerup and cancel', () => {
    pointer('pointerdown', 200);
    pointer('pointerup', 200);
    expect(handler.getPointerFraction()).toBeNull();

    pointer('pointerdown', 200);
    pointer('pointercancel', 200);
    expect(handler.getPointerFraction()).toBeNull();
  });

  it('should preventDefault on pointer drags so the page does not scroll', () => {
    const down = new Event('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(down, 'clientX', { value: 200 });
    Object.defineProperty(down, 'pointerId', { value: 1 });
    surface.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
  });

  it('should clear the pointer along with held keys', () => {
    press('a');
    pointer('pointerdown', 200);
    handler.clear();
    expect(handler.isMovingLeft()).toBe(false);
    expect(handler.getPointerFraction()).toBeNull();
  });

  it('should stop tracking pointers after destroy', () => {
    handler.destroy();
    pointer('pointerdown', 200);
    expect(handler.getPointerFraction()).toBeNull();
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
