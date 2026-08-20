/** -1 moves the turtle left, 1 moves it right, 0 leaves it still. */
export type SteerDirection = -1 | 0 | 1;

/**
 * Maps a press position on the play surface to a movement direction: the left half steers left,
 * the right half steers right, for as long as the press is held.
 *
 * Deliberately no neutral band at the centre. A dead zone would create an invisible region where
 * pressing does nothing, which reads as an unresponsive game rather than as a designed gap.
 */
export function steerDirectionFromFraction(fraction: number | null): SteerDirection {
  if (fraction === null) return 0;
  return fraction < 0.5 ? -1 : 1;
}
