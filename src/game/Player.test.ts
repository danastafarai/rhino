import { describe, it, expect } from 'vitest';
import { Player } from './Player';
import { GAME_CONFIG } from '../constants';

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

    player.moveLeft();
    expect(player.getPosition().x).toBe(startX - GAME_CONFIG.playerSpeed);
  });

  it('should move right by the configured speed', () => {
    const player = createPlayer();
    const startX = player.getPosition().x;

    player.moveRight();
    expect(player.getPosition().x).toBe(startX + GAME_CONFIG.playerSpeed);
  });

  it('should not move past the left edge', () => {
    const player = createPlayer();
    for (let i = 0; i < 500; i++) {
      player.moveLeft();
    }
    expect(player.getPosition().x).toBe(0);
  });

  it('should not move past the right edge', () => {
    const player = createPlayer();
    for (let i = 0; i < 500; i++) {
      player.moveRight();
    }
    expect(player.getPosition().x).toBe(CANVAS_WIDTH - GAME_CONFIG.playerSize);
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
