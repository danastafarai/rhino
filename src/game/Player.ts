import type { Position, Bounds } from '../types';
import { GAME_CONFIG } from '../constants';

export class Player {
  #position: Position;
  #width: number;
  #height: number;
  #speed: number;
  #canvasWidth: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.#canvasWidth = canvasWidth;
    this.#width = GAME_CONFIG.playerSize;
    this.#height = GAME_CONFIG.playerSize;
    this.#speed = GAME_CONFIG.playerSpeed;

    this.#position = {
      x: canvasWidth / 2 - this.#width / 2,
      y: canvasHeight - this.#height - 10,
    };
  }

  moveLeft(): void {
    const newX = Math.max(0, this.#position.x - this.#speed);
    this.#position.x = newX;
  }

  moveRight(): void {
    const maxX = this.#canvasWidth - this.#width;
    const newX = Math.min(maxX, this.#position.x + this.#speed);
    this.#position.x = newX;
  }

  getPosition(): Position {
    return { ...this.#position };
  }

  getBounds(): Bounds {
    return {
      x: this.#position.x,
      y: this.#position.y,
      width: this.#width,
      height: this.#height,
    };
  }

  getWidth(): number {
    return this.#width;
  }

  getHeight(): number {
    return this.#height;
  }
}
