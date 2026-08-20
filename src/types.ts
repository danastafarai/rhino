export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSpeed: number;
  playerSize: number;
  objectMinSize: number;
  objectMaxSize: number;
  initialSpawnRate: number;
  gravity: number;
}

export type GameStatus = 'playing' | 'paused' | 'gameOver';
