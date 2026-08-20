import { POINTS_PER_OBJECT, LEVEL_UP_SCORE } from '../constants';
import type { GameStatus } from '../types';

export class GameState {
  #score: number = 0;
  #highScore: number;
  #level: number = 0;
  #status: GameStatus = 'playing';
  #elapsedTime: number = 0;

  constructor() {
    this.#highScore = this.loadHighScore();
  }

  incrementScore(): void {
    this.#score += POINTS_PER_OBJECT;
    this.checkLevelUp();
    this.updateHighScore();
  }

  private checkLevelUp(): void {
    const newLevel = Math.floor(this.#score / LEVEL_UP_SCORE);
    if (newLevel > this.#level) {
      this.#level = newLevel;
    }
  }

  private updateHighScore(): void {
    if (this.#score > this.#highScore) {
      this.#highScore = this.#score;
      this.saveHighScore();
    }
  }

  private loadHighScore(): number {
    const saved = localStorage.getItem('rhino-high-score');
    return saved ? parseInt(saved, 10) : 0;
  }

  private saveHighScore(): void {
    localStorage.setItem('rhino-high-score', this.#highScore.toString());
  }

  getScore(): number {
    return this.#score;
  }

  getHighScore(): number {
    return this.#highScore;
  }

  getLevel(): number {
    return this.#level;
  }

  getStatus(): GameStatus {
    return this.#status;
  }

  setStatus(status: GameStatus): void {
    this.#status = status;
  }

  isPlaying(): boolean {
    return this.#status === 'playing';
  }

  isPaused(): boolean {
    return this.#status === 'paused';
  }

  updateElapsedTime(deltaTime: number): void {
    this.#elapsedTime += deltaTime;
  }

  getElapsedTime(): number {
    return this.#elapsedTime;
  }

  reset(): void {
    this.#score = 0;
    this.#level = 0;
    this.#status = 'playing';
    this.#elapsedTime = 0;
  }
}
