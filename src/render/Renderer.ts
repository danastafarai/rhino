import type { Player } from '../game/Player';
import type { FallingObject } from '../game/FallingObject';
import type { GameState } from '../game/GameState';
import { drawPlayer } from './drawers/drawPlayer';
import { drawObjects } from './drawers/drawObjects';
import { drawUI } from './drawers/drawUI';

export class Renderer {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;

  constructor(canvasElement: HTMLCanvasElement) {
    this.#canvas = canvasElement;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.#ctx = ctx;
  }

  render(
    player: Player,
    objects: FallingObject[],
    gameState: GameState
  ): void {
    this.clearCanvas();
    drawPlayer(this.#ctx, player);
    drawObjects(this.#ctx, objects);
    drawUI(this.#ctx, gameState, this.#canvas.width, this.#canvas.height);
  }

  private clearCanvas(): void {
    this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  resize(width: number, height: number): void {
    this.#canvas.width = width;
    this.#canvas.height = height;
  }

  getCanvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.#ctx;
  }
}
