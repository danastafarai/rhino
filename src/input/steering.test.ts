import { describe, it, expect } from 'vitest';
import { steerDirectionFromFraction } from './steering';

describe('steerDirectionFromFraction', () => {
  it('should stay still when nothing is pressed', () => {
    expect(steerDirectionFromFraction(null)).toBe(0);
  });

  it('should steer left anywhere in the left half', () => {
    expect(steerDirectionFromFraction(0)).toBe(-1);
    expect(steerDirectionFromFraction(0.25)).toBe(-1);
    expect(steerDirectionFromFraction(0.4999)).toBe(-1);
  });

  it('should steer right anywhere in the right half', () => {
    expect(steerDirectionFromFraction(0.5001)).toBe(1);
    expect(steerDirectionFromFraction(0.75)).toBe(1);
    expect(steerDirectionFromFraction(1)).toBe(1);
  });

  it('should resolve the exact centre deterministically rather than to a dead zone', () => {
    expect(steerDirectionFromFraction(0.5)).toBe(1);
  });

  it('should never return a neutral direction while a press is held', () => {
    for (let i = 0; i <= 100; i++) {
      expect(steerDirectionFromFraction(i / 100)).not.toBe(0);
    }
  });
});
