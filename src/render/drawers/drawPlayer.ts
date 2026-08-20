import type { Player } from '../../game/Player';

const SHELL = '#2f9e44';
const SHELL_RIM = '#1a7431';
const SCUTE = '#69db7c';
const SKIN = '#8ce99a';

// Top-down turtle: the player sits at the bottom of the screen catching objects from above,
// so the shell faces the camera and the head points up toward the falling objects.
export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  const { x, y, width, height } = player.getBounds();
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;

  ctx.save();

  ctx.fillStyle = SKIN;

  ctx.beginPath();
  ctx.ellipse(cx, y + ry * 0.18, rx * 0.26, ry * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const [fx, fy] of [
    [-0.72, -0.5],
    [0.72, -0.5],
    [-0.72, 0.52],
    [0.72, 0.52],
  ]) {
    ctx.beginPath();
    ctx.ellipse(
      cx + rx * fx,
      cy + ry * fy,
      rx * 0.28,
      ry * 0.2,
      (fx * fy > 0 ? -1 : 1) * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.12, y + height);
  ctx.lineTo(cx + rx * 0.12, y + height);
  ctx.lineTo(cx, y + height * 1.12);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.82, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = SHELL;
  ctx.fill();
  ctx.lineWidth = Math.max(1, width * 0.05);
  ctx.strokeStyle = SHELL_RIM;
  ctx.stroke();

  ctx.fillStyle = SCUTE;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.34, ry * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = SHELL_RIM;
  ctx.lineWidth = Math.max(1, width * 0.035);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rx * 0.34, cy + Math.sin(angle) * ry * 0.38);
    ctx.lineTo(cx + Math.cos(angle) * rx * 0.8, cy + Math.sin(angle) * ry * 0.88);
    ctx.stroke();
  }

  ctx.restore();
}
