import type { GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  playerSpeed: 6,
  playerSize: 40,
  objectMinSize: 15,
  objectMaxSize: 30,
  initialSpawnRate: 0.02,
  gravity: 4,
};

export const SPAWN_RATE_INCREASE_PER_SECOND = 0.001;
export const SPAWN_RATE_MAX = 0.1;
export const GRAVITY_INCREASE_PER_LEVEL = 0.5;
export const POINTS_PER_OBJECT = 10;
export const LEVEL_UP_SCORE = 100;
export const INITIAL_LIVES = 3;
