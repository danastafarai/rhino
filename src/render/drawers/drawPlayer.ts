import type { Player } from '../../game/Player';

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  const pos = player.getPosition();
  const width = player.getWidth();
  const height = player.getHeight();

  ctx.fillStyle = '#4ade80';
  ctx.shadowColor = 'rgba(74, 222, 128, 0.8)';
  ctx.shadowBlur = 15;

  ctx.fillRect(pos.x, pos.y, width, height);

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.strokeRect(pos.x, pos.y, width, height);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(pos.x + 10, pos.y + 10, 8, 15);
  ctx.fillRect(pos.x + width - 18, pos.y + 10, 8, 15);
}
