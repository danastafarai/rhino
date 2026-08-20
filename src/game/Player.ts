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

  moveLeft(deltaTime: number): void {
    this.#position.x = Math.max(0, this.#position.x - this.#speed * deltaTime);
  }

  moveRight(deltaTime: number): void {
    const maxX = this.#canvasWidth - this.#width;
    this.#position.x = Math.min(maxX, this.#position.x + this.#speed * deltaTime);
  }

  /**
   * Steer toward a target centre, capped at the same speed as the keyboard. Touch dragging uses
   * this rather than snapping the turtle to the finger, so mobile is not strictly easier.
   */
  moveToward(targetCenterX: number, deltaTime: number): void {
    const currentCenter = this.#position.x + this.#width / 2;
    const delta = targetCenterX - currentCenter;
    const maxStep = this.#speed * deltaTime;

    if (Math.abs(delta) <= maxStep) {
      this.#position.x = targetCenterX - this.#width / 2;
    } else {
      this.#position.x += Math.sign(delta) * maxStep;
    }

    this.#position.x = Math.min(this.#canvasWidth - this.#width, Math.max(0, this.#position.x));
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
