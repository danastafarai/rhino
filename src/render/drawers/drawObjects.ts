import type { FallingObject } from '../../game/FallingObject';

export function drawObjects(ctx: CanvasRenderingContext2D, objects: FallingObject[]): void {
  for (const obj of objects) {
    const pos = obj.getPosition();
    const width = obj.getWidth();
    const height = obj.getHeight();

    const gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + height);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');

    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(pos.x + width / 2, pos.y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
