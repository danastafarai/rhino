import { describe, it, expect } from 'vitest';
import { Player } from './Player';
import { GAME_CONFIG } from '../constants';

const FRAME = 1 / 60;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

function createPlayer(): Player {
  return new Player(CANVAS_WIDTH, CANVAS_HEIGHT);
}

describe('Player', () => {
  it('should spawn horizontally centered', () => {
    const player = createPlayer();
    const expectedX = CANVAS_WIDTH / 2 - GAME_CONFIG.playerSize / 2;
    expect(player.getPosition().x).toBe(expectedX);
  });

  it('should spawn near the bottom of the canvas', () => {
    const player = createPlayer();
    expect(player.getPosition().y).toBe(CANVAS_HEIGHT - GAME_CONFIG.playerSize - 10);
  });

  it('should move left by the configured speed', () => {
    const player = createPlayer();
    const startX = player.getPosition().x;

    player.moveLeft(FRAME);
    expect(player.getPosition().x).toBe(startX - GAME_CONFIG.playerSpeed * FRAME);
  });

  it('should move right by the configured speed', () => {
    const player = createPlayer();
    const startX = player.getPosition().x;

    player.moveRight(FRAME);
    expect(player.getPosition().x).toBe(startX + GAME_CONFIG.playerSpeed * FRAME);
  });

  it('should not move past the left edge', () => {
    const player = createPlayer();
    for (let i = 0; i < 500; i++) {
      player.moveLeft(FRAME);
    }
    expect(player.getPosition().x).toBe(0);
  });

  it('should not move past the right edge', () => {
    const player = createPlayer();
    for (let i = 0; i < 500; i++) {
      player.moveRight(FRAME);
    }
    expect(player.getPosition().x).toBe(CANVAS_WIDTH - GAME_CONFIG.playerSize);
  });

  it('should travel the same distance per second regardless of frame rate', () => {
    const at60fps = createPlayer();
    for (let i = 0; i < 60; i++) {
      at60fps.moveRight(1 / 60);
    }

    const at144fps = createPlayer();
    for (let i = 0; i < 144; i++) {
      at144fps.moveRight(1 / 144);
    }

    expect(at144fps.getPosition().x).toBeCloseTo(at60fps.getPosition().x, 6);
  });

  it('should move at the configured pixels-per-second rate', () => {
    const player = createPlayer();
    const startX = player.getPosition().x;

    player.moveRight(1);
    expect(player.getPosition().x).toBeCloseTo(startX + GAME_CONFIG.playerSpeed, 6);
  });

  it('should steer toward a target without exceeding its speed', () => {
    const player = createPlayer();
    const startX = player.getPosition().x;

    player.moveToward(CANVAS_WIDTH, 1 / 60);

    const travelled = player.getPosition().x - startX;
    expect(travelled).toBeCloseTo(GAME_CONFIG.playerSpeed / 60, 6);
  });

  it('should not overshoot a target within reach', () => {
    const player = createPlayer();
    const target = player.getPosition().x + GAME_CONFIG.playerSize / 2 + 2;

    player.moveToward(target, 1);

    const center = player.getPosition().x + GAME_CONFIG.playerSize / 2;
    expect(center).toBeCloseTo(target, 6);
  });

  it('should clamp steering to the canvas bounds', () => {
    const player = createPlayer();

    player.moveToward(-500, 5);
    expect(player.getPosition().x).toBe(0);

    player.moveToward(CANVAS_WIDTH + 500, 5);
    expect(player.getPosition().x).toBe(CANVAS_WIDTH - GAME_CONFIG.playerSize);
  });

  it('should steer the same distance per second regardless of frame rate', () => {
    const coarse = createPlayer();
    for (let i = 0; i < 30; i++) coarse.moveToward(CANVAS_WIDTH, 1 / 30);

    const fine = createPlayer();
    for (let i = 0; i < 120; i++) fine.moveToward(CANVAS_WIDTH, 1 / 120);

    expect(fine.getPosition().x).toBeCloseTo(coarse.getPosition().x, 6);
  });

  it('should expose bounds matching its position and size', () => {
    const player = createPlayer();
    const pos = player.getPosition();
    const bounds = player.getBounds();

    expect(bounds).toEqual({
      x: pos.x,
      y: pos.y,
      width: player.getWidth(),
      height: player.getHeight(),
    });
  });

  it('should return a copy of its position so callers cannot mutate internals', () => {
    const player = createPlayer();
    const pos = player.getPosition();
    pos.x = 9999;

    expect(player.getPosition().x).not.toBe(9999);
  });
});
