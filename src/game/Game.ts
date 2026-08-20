import { Player } from './Player';
import { FallingObject } from './FallingObject';
import { GameState } from './GameState';
import type { InputAction } from '../input/InputHandler';
import { InputHandler } from '../input/InputHandler';
import { Renderer } from '../render/Renderer';
import { findCollisions } from '../physics/Collision';
import {
  GAME_CONFIG,
  SPAWN_RATE_INCREASE_PER_SECOND,
  SPAWN_RATE_MAX,
  GRAVITY_INCREASE_PER_LEVEL,
} from '../constants';

export class Game {
  #player: Player;
  #objects: FallingObject[] = [];
  #gameState: GameState;
  #inputHandler: InputHandler;
  #renderer: Renderer;
  #lastFrameTime: number = 0;
  #spawnRate: number = GAME_CONFIG.initialSpawnRate;
  #spawnCounter: number = 0;
  #currentGravity: number = GAME_CONFIG.gravity;
  #lastLevel: number = 0;
  #running: boolean = true;
  #frameListeners: Array<(state: GameState) => void> = [];

  constructor(canvasElement: HTMLCanvasElement) {
    this.#player = new Player(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    this.#gameState = new GameState();
    this.#inputHandler = new InputHandler();
    this.#renderer = new Renderer(canvasElement);

    this.setupCanvas(canvasElement);
    this.setupInput();
  }

  private setupCanvas(canvasElement: HTMLCanvasElement): void {
    canvasElement.width = GAME_CONFIG.canvasWidth;
    canvasElement.height = GAME_CONFIG.canvasHeight;
  }

  private setupInput(): void {
    this.#inputHandler.setCallback((action: InputAction) => this.handleInput(action));
  }

  private handleInput(action: InputAction): void {
    if (action === 'moveLeft') {
      this.#player.moveLeft();
    } else if (action === 'moveRight') {
      this.#player.moveRight();
    } else if (action === 'togglePause') {
      if (this.#gameState.isPlaying()) {
        this.#gameState.setStatus('paused');
      } else if (this.#gameState.isPaused()) {
        this.#gameState.setStatus('playing');
      }
    } else if (action === 'restart') {
      if (this.#gameState.isGameOver()) {
        this.reset();
      }
    }
  }

  onFrame(listener: (state: GameState) => void): void {
    this.#frameListeners.push(listener);
  }

  start(): void {
    this.#lastFrameTime = performance.now();
    this.gameLoop(this.#lastFrameTime);
  }

  private gameLoop = (currentTime: number): void => {
    if (!this.#running) return;

    const deltaTime = (currentTime - this.#lastFrameTime) / 1000;
    this.#lastFrameTime = currentTime;

    this.#inputHandler.update();
    this.update(deltaTime);
    this.#renderer.render(this.#player, this.#objects, this.#gameState);

    for (const listener of this.#frameListeners) {
      listener(this.#gameState);
    }

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (!this.#gameState.isPlaying()) return;

    this.#gameState.updateElapsedTime(deltaTime);
    this.spawnObjects();
    this.updateObjects();
    this.checkCollisions();
    this.removeOffScreenObjects();
    this.updateDifficulty();
  }

  private spawnObjects(): void {
    this.#spawnCounter += this.#spawnRate;

    if (this.#spawnCounter >= 1) {
      this.#objects.push(
        new FallingObject(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight, this.#currentGravity)
      );
      this.#spawnCounter -= 1;
    }
  }

  private updateObjects(): void {
    for (const obj of this.#objects) {
      obj.update();
    }
  }

  private checkCollisions(): void {
    const playerBounds = this.#player.getBounds();
    const objectBounds = this.#objects.map((obj) => obj.getBounds());
    const collidedIndices = findCollisions(playerBounds, objectBounds);

    for (let i = collidedIndices.length - 1; i >= 0; i--) {
      this.#objects.splice(collidedIndices[i], 1);
      this.#gameState.incrementScore();
    }
  }

  private removeOffScreenObjects(): void {
    const remaining: FallingObject[] = [];

    for (const obj of this.#objects) {
      if (obj.isOffScreen()) {
        this.#gameState.loseLife();
      } else {
        remaining.push(obj);
      }
    }

    this.#objects = remaining;
  }

  private updateDifficulty(): void {
    const currentLevel = this.#gameState.getLevel();

    if (currentLevel > this.#lastLevel) {
      this.#lastLevel = currentLevel;
      this.#currentGravity += GRAVITY_INCREASE_PER_LEVEL;
    }

    this.#spawnRate = Math.min(
      SPAWN_RATE_MAX,
      GAME_CONFIG.initialSpawnRate +
        this.#gameState.getElapsedTime() * SPAWN_RATE_INCREASE_PER_SECOND
    );
  }

  stop(): void {
    this.#running = false;
    this.#inputHandler.destroy();
  }

  reset(): void {
    this.#objects = [];
    this.#gameState.reset();
    this.#spawnRate = GAME_CONFIG.initialSpawnRate;
    this.#spawnCounter = 0;
    this.#currentGravity = GAME_CONFIG.gravity;
    this.#lastLevel = 0;
  }

  getGameState(): GameState {
    return this.#gameState;
  }
}
