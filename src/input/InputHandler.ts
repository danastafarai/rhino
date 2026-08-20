export type InputCallback = (action: InputAction) => void;

export type InputAction = 'moveLeft' | 'moveRight' | 'pause' | 'resume';

export class InputHandler {
  #pressedKeys: Set<string> = new Set();
  #callback: InputCallback | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (['a', 'd', 'arrowleft', 'arrowright', 'p'].includes(key)) {
      event.preventDefault();
    }

    this.#pressedKeys.add(key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.#pressedKeys.delete(key);

    if (key === 'p') {
      this.#callback?.('pause');
    }
  }

  update(): void {
    if (this.#pressedKeys.has('a') || this.#pressedKeys.has('arrowleft')) {
      this.#callback?.('moveLeft');
    }
    if (this.#pressedKeys.has('d') || this.#pressedKeys.has('arrowright')) {
      this.#callback?.('moveRight');
    }
  }

  setCallback(callback: InputCallback): void {
    this.#callback = callback;
  }

  isKeyPressed(key: string): boolean {
    return this.#pressedKeys.has(key.toLowerCase());
  }

  clear(): void {
    this.#pressedKeys.clear();
  }

  destroy(): void {
    this.clear();
    this.#callback = null;
  }
}
