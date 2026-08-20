import type { SteerDirection } from '../../input/steering';

// Tap zones are invisible by nature, so the only thing telling a player the halves exist is the
// feedback they get when pressing one. Drawn behind the entities so it never hides an object.
export function drawTouchZones(
  ctx: CanvasRenderingContext2D,
  direction: SteerDirection,
  width: number,
  height: number
): void {
  if (direction === 0) return;

  const half = width / 2;
  const x = direction === -1 ? 0 : half;

  ctx.save();

  const wash = ctx.createLinearGradient(
    direction === -1 ? 0 : width,
    0,
    direction === -1 ? half : half,
    0
  );
  wash.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
  wash.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(x, 0, half, height);

  const chevronX = direction === -1 ? width * 0.08 : width * 0.92;
  const chevronY = height / 2;
  const size = Math.min(width, height) * 0.05;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = Math.max(2, size * 0.22);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // The apex must sit on the side the turtle travels toward: pointing the wrong way tells the
  // player the opposite of what the control does.
  ctx.beginPath();
  ctx.moveTo(chevronX - direction * size * 0.5, chevronY - size);
  ctx.lineTo(chevronX + direction * size * 0.5, chevronY);
  ctx.lineTo(chevronX - direction * size * 0.5, chevronY + size);
  ctx.stroke();

  ctx.restore();
}
