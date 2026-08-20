import type { GameConfig } from './types';

// All rates are per SECOND, not per frame. Every consumer multiplies by the frame's
// delta time so the game plays identically at 30, 60, or 144 Hz.
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  playerSpeed: 360,
  playerSize: 40,
  objectMinSize: 15,
  objectMaxSize: 30,
  initialSpawnRate: 0.7,
  gravity: 240,
};

// A miss costs a life, so the opening spawn rate has to leave one turtle able to reach every
// object. At 0.7/s with a 2.5s fall there are under two in flight, and the turtle crosses the
// full canvas in 2.1s. The ramp then tightens that margin as the run goes on.
export const SPAWN_RATE_INCREASE_PER_SECOND = 0.04;
export const SPAWN_RATE_MAX = 6;
export const GRAVITY_INCREASE_PER_LEVEL = 30;
export const POINTS_PER_OBJECT = 10;
export const LEVEL_UP_SCORE = 100;
export const INITIAL_LIVES = 3;

// A backgrounded tab can hand us a multi-second delta on the next frame. Without a ceiling
// objects would teleport past the player and drain every life at once.
export const MAX_FRAME_DELTA = 0.1;
