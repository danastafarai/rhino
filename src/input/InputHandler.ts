export type InputCallback = (action: InputAction) => void;

export type InputAction = 'togglePause' | 'restart';

const LEFT_KEYS = ['a', 'arrowleft'];
const RIGHT_KEYS = ['d', 'arrowright'];
const HANDLED_KEYS = [...LEFT_KEYS, ...RIGHT_KEYS, 'p', 'r'];

export class InputHandler {
  #pressedKeys: Set<string> = new Set();
  #callback: InputCallback | null = null;
  #target: EventTarget;

  constructor(target: EventTarget = window) {
    this.#target = target;
    this.#target.addEventListener('keydown', this.handleKeyDown);
    this.#target.addEventListener('keyup', this.handleKeyUp);
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

  isMovingLeft(): boolean {
    return LEFT_KEYS.some((key) => this.#pressedKeys.has(key));
  }

  isMovingRight(): boolean {
    return RIGHT_KEYS.some((key) => this.#pressedKeys.has(key));
  }

  setCallback(callback: InputCallback): void {
    this.#callback = callback;
  }

  clear(): void {
    this.#pressedKeys.clear();
  }

  destroy(): void {
    this.#target.removeEventListener('keydown', this.handleKeyDown);
    this.#target.removeEventListener('keyup', this.handleKeyUp);
    this.clear();
    this.#callback = null;
  }
}
