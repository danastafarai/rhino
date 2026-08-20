import { describe, it, expect } from 'vitest';
import { FallingObject } from './FallingObject';
import { GAME_CONFIG } from '../constants';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FALL_SPEED = 240;

function createObject(): FallingObject {
  return new FallingObject(CANVAS_WIDTH, CANVAS_HEIGHT, FALL_SPEED);
}

describe('FallingObject', () => {
  it('should spawn fully above the top edge', () => {
    const obj = createObject();
    expect(obj.getPosition().y).toBeLessThanOrEqual(0);
    expect(obj.getPosition().y).toBe(-obj.getHeight());
  });

  it('should spawn within the horizontal bounds of the canvas', () => {
    for (let i = 0; i < 200; i++) {
      const obj = createObject();
      const x = obj.getPosition().x;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + obj.getWidth()).toBeLessThanOrEqual(CANVAS_WIDTH);
    }
  });

  it('should size itself within the configured range', () => {
    for (let i = 0; i < 200; i++) {
      const obj = createObject();
      expect(obj.getWidth()).toBeGreaterThanOrEqual(GAME_CONFIG.objectMinSize);
      expect(obj.getWidth()).toBeLessThanOrEqual(GAME_CONFIG.objectMaxSize);
      expect(obj.getHeight()).toBe(obj.getWidth());
    }
  });

  it('should fall at the configured pixels-per-second rate', () => {
    const obj = createObject();
    const startY = obj.getPosition().y;

    obj.update(1);
    expect(obj.getPosition().y).toBeCloseTo(startY + FALL_SPEED, 6);
  });

  it('should fall the same distance per second regardless of frame rate', () => {
    const coarse = createObject();
    coarse.update(1 / 30);
    coarse.update(1 / 30);

    const fine = createObject();
    for (let i = 0; i < 4; i++) {
      fine.update(1 / 60);
    }

    const coarseTravel = coarse.getPosition().y + coarse.getHeight();
    const fineTravel = fine.getPosition().y + fine.getHeight();
    expect(fineTravel).toBeCloseTo(coarseTravel, 6);
  });

  it('should not report off-screen until it clears the bottom edge', () => {
    const obj = createObject();
    expect(obj.isOffScreen()).toBe(false);

    obj.update((CANVAS_HEIGHT - obj.getPosition().y) / FALL_SPEED);
    expect(obj.isOffScreen()).toBe(false);

    obj.update(0.1);
    expect(obj.isOffScreen()).toBe(true);
  });

  it('should expose bounds matching its position and size', () => {
    const obj = createObject();
    obj.update(0.5);
    const pos = obj.getPosition();

    expect(obj.getBounds()).toEqual({
      x: pos.x,
      y: pos.y,
      width: obj.getWidth(),
      height: obj.getHeight(),
    });
  });

  it('should return a copy of its position so callers cannot mutate internals', () => {
    const obj = createObject();
    const pos = obj.getPosition();
    pos.y = 9999;

    expect(obj.getPosition().y).not.toBe(9999);
  });
});
