import { describe, it, expect } from 'vitest';
import { detectCollision, findCollisions } from './Collision';
import type { Bounds } from '../types';

describe('Collision Detection', () => {
  describe('detectCollision', () => {
    it('should detect collision when rectangles overlap', () => {
      const player: Bounds = { x: 0, y: 0, width: 40, height: 40 };
      const object: Bounds = { x: 30, y: 30, width: 20, height: 20 };

      expect(detectCollision(player, object)).toBe(true);
    });

    it('should not detect collision when rectangles are adjacent', () => {
      const player: Bounds = { x: 0, y: 0, width: 40, height: 40 };
      const object: Bounds = { x: 40, y: 0, width: 20, height: 20 };

      expect(detectCollision(player, object)).toBe(false);
    });

    it('should not detect collision when rectangles do not touch', () => {
      const player: Bounds = { x: 0, y: 0, width: 40, height: 40 };
      const object: Bounds = { x: 100, y: 100, width: 20, height: 20 };

      expect(detectCollision(player, object)).toBe(false);
    });

    it('should detect collision when one rectangle is inside another', () => {
      const player: Bounds = { x: 0, y: 0, width: 100, height: 100 };
      const object: Bounds = { x: 20, y: 20, width: 20, height: 20 };

      expect(detectCollision(player, object)).toBe(true);
    });
  });

  describe('findCollisions', () => {
    it('should find all colliding objects', () => {
      const player: Bounds = { x: 0, y: 0, width: 40, height: 40 };
      const objects: Bounds[] = [
        { x: 30, y: 30, width: 20, height: 20 },
        { x: 100, y: 100, width: 20, height: 20 },
        { x: 10, y: 10, width: 20, height: 20 },
      ];

      const collided = findCollisions(player, objects);
      expect(collided).toEqual([0, 2]);
    });

    it('should return empty array when no collisions', () => {
      const player: Bounds = { x: 0, y: 0, width: 40, height: 40 };
      const objects: Bounds[] = [
        { x: 100, y: 100, width: 20, height: 20 },
        { x: 200, y: 200, width: 20, height: 20 },
      ];

      const collided = findCollisions(player, objects);
      expect(collided).toEqual([]);
    });
  });
});
