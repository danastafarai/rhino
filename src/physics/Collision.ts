import type { Bounds } from '../types';

export function detectCollision(bounds1: Bounds, bounds2: Bounds): boolean {
  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y
  );
}

export function findCollisions(player: Bounds, objects: Bounds[]): number[] {
  const collided: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    if (detectCollision(player, objects[i])) {
      collided.push(i);
    }
  }
  return collided;
}
