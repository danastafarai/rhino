export type InputCallback = (action: InputAction) => void;

export type InputAction = 'togglePause' | 'restart';

const LEFT_KEYS = ['a', 'arrowleft'];
const RIGHT_KEYS = ['d', 'arrowright'];
const HANDLED_KEYS = [...LEFT_KEYS, ...RIGHT_KEYS, 'p', 'r'];

export class InputHandler {
  #pressedKeys: Set<string> = new Set();
  #callback: InputCallback | null = null;
  #keyTarget: EventTarget;
  #pointerSurface: HTMLElement | null;
  #pointerFraction: number | null = null;

  constructor(keyTarget: EventTarget = window, pointerSurface: HTMLElement | null = null) {
    this.#keyTarget = keyTarget;
    this.#pointerSurface = pointerSurface;

    this.#keyTarget.addEventListener('keydown', this.handleKeyDown);
    this.#keyTarget.addEventListener('keyup', this.handleKeyUp);

    if (this.#pointerSurface) {
      this.#pointerSurface.addEventListener('pointerdown', this.handlePointerDown);
      this.#pointerSurface.addEventListener('pointermove', this.handlePointerMove);
      this.#pointerSurface.addEventListener('pointerup', this.handlePointerEnd);
      this.#pointerSurface.addEventListener('pointercancel', this.handlePointerEnd);
      this.#pointerSurface.addEventListener('pointerleave', this.handlePointerEnd);
    }
  }

  // Bound as fields so removeEventListener in destroy() matches the registered reference.
  private handleKeyDown = (event: Event): void => {
    const key = (event as KeyboardEvent).key.toLowerCase();
    if (HANDLED_KEYS.includes(key)) {
      event.preventDefault();
    }
    this.#pressedKeys.add(key);
  };

  private handleKeyUp = (event: Event): void => {
    const key = (event as KeyboardEvent).key.toLowerCase();
    this.#pressedKeys.delete(key);

    if (key === 'p') {
      this.#callback?.('togglePause');
    } else if (key === 'r') {
      this.#callback?.('restart');
    }
  };

  private trackPointer(event: PointerEvent): void {
    const surface = this.#pointerSurface;
    if (!surface) return;

    const rect = surface.getBoundingClientRect();
    if (rect.width === 0) return;

    const fraction = (event.clientX - rect.left) / rect.width;
    this.#pointerFraction = Math.min(1, Math.max(0, fraction));
  }

  private handlePointerDown = (event: Event): void => {
    const pointerEvent = event as PointerEvent;
    // Stops the browser turning the drag into a scroll or text selection mid-game.
    event.preventDefault();
    this.#pointerSurface?.setPointerCapture?.(pointerEvent.pointerId);
    this.trackPointer(pointerEvent);
  };

  private handlePointerMove = (event: Event): void => {
    if (this.#pointerFraction === null) return;
    event.preventDefault();
    this.trackPointer(event as PointerEvent);
  };

  private handlePointerEnd = (): void => {
    this.#pointerFraction = null;
  };

  isMovingLeft(): boolean {
    return LEFT_KEYS.some((key) => this.#pressedKeys.has(key));
  }

  isMovingRight(): boolean {
    return RIGHT_KEYS.some((key) => this.#pressedKeys.has(key));
  }

  /** Where the finger or mouse is across the play surface, 0 (left) to 1 (right). */
  getPointerFraction(): number | null {
    return this.#pointerFraction;
  }

  setCallback(callback: InputCallback): void {
    this.#callback = callback;
  }

  clear(): void {
    this.#pressedKeys.clear();
    this.#pointerFraction = null;
  }

  destroy(): void {
    this.#keyTarget.removeEventListener('keydown', this.handleKeyDown);
    this.#keyTarget.removeEventListener('keyup', this.handleKeyUp);

    if (this.#pointerSurface) {
      this.#pointerSurface.removeEventListener('pointerdown', this.handlePointerDown);
      this.#pointerSurface.removeEventListener('pointermove', this.handlePointerMove);
      this.#pointerSurface.removeEventListener('pointerup', this.handlePointerEnd);
      this.#pointerSurface.removeEventListener('pointercancel', this.handlePointerEnd);
      this.#pointerSurface.removeEventListener('pointerleave', this.handlePointerEnd);
    }

    this.clear();
    this.#callback = null;
  }
}
