import type { Player } from '../game/Player';
import type { FallingObject } from '../game/FallingObject';
import type { GameState } from '../game/GameState';
import { GAME_CONFIG } from '../constants';
import type { SteerDirection } from '../input/steering';
import { drawPlayer } from './drawers/drawPlayer';
import { drawTouchZones } from './drawers/drawTouchZones';
import { drawObjects } from './drawers/drawObjects';
import { drawUI } from './drawers/drawUI';

// The game always thinks in a fixed logical space (GAME_CONFIG.canvasWidth/Height) so every
// tuned constant stays valid on any screen. The renderer scales that space onto whatever the
// element actually occupies, multiplied by devicePixelRatio so it is sharp on phone displays.
export class Renderer {
  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;

  constructor(canvasElement: HTMLCanvasElement) {
    this.#canvas = canvasElement;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.#ctx = ctx;
    this.syncToDisplaySize();
  }

  syncToDisplaySize(): void {
    const rect = this.#canvas.getBoundingClientRect();
    const cssWidth = rect.width || GAME_CONFIG.canvasWidth;
    const cssHeight = rect.height || GAME_CONFIG.canvasHeight;
    const dpr = window.devicePixelRatio || 1;

    const targetWidth = Math.round(cssWidth * dpr);
    const targetHeight = Math.round(cssHeight * dpr);

    if (this.#canvas.width !== targetWidth || this.#canvas.height !== targetHeight) {
      this.#canvas.width = targetWidth;
      this.#canvas.height = targetHeight;
    }
  }

  render(
    player: Player,
    objects: FallingObject[],
    gameState: GameState,
    steerDirection: SteerDirection = 0
  ): void {
    this.syncToDisplaySize();

    const scaleX = this.#canvas.width / GAME_CONFIG.canvasWidth;
    const scaleY = this.#canvas.height / GAME_CONFIG.canvasHeight;

    this.#ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

    drawTouchZones(this.#ctx, steerDirection, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    drawPlayer(this.#ctx, player);
    drawObjects(this.#ctx, objects);
    drawUI(this.#ctx, gameState, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }

  getCanvas(): HTMLCanvasElement {
    return this.#canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.#ctx;
  }
}
