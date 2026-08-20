import type { Position, Velocity, Bounds } from '../types';
import { GAME_CONFIG } from '../constants';

export class FallingObject {
  #position: Position;
  #velocity: Velocity;
  #width: number;
  #height: number;
  #canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number, fallSpeed: number) {
    this.#canvasHeight = canvasHeight;

    const size =
      Math.random() * (GAME_CONFIG.objectMaxSize - GAME_CONFIG.objectMinSize) +
      GAME_CONFIG.objectMinSize;
    this.#width = size;
    this.#height = size;

    this.#position = {
      x: Math.random() * (canvasWidth - this.#width),
      y: -this.#height,
    };

    this.#velocity = {
      x: 0,
      y: fallSpeed,
    };
  }

  update(deltaTime: number): void {
    this.#position.x += this.#velocity.x * deltaTime;
    this.#position.y += this.#velocity.y * deltaTime;
  }

  isOffScreen(): boolean {
    return this.#position.y > this.#canvasHeight;
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
