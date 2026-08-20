import type { GameState } from '../../game/GameState';

export function drawUI(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${gameState.getScore()}`, 20, 40);
  ctx.fillText(`Level: ${gameState.getLevel() + 1}`, 20, 70);

  if (gameState.isPaused()) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2 - 30);

    ctx.font = '20px Arial';
    ctx.fillText('Press P to Resume', canvasWidth / 2, canvasHeight / 2 + 30);
  }

  if (gameState.getStatus() === 'gameOver') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 60);

    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.getScore()}`, canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText(
      `High Score: ${gameState.getHighScore()}`,
      canvasWidth / 2,
      canvasHeight / 2 + 60
    );

    ctx.font = '18px Arial';
    ctx.fillText('Press R to Restart', canvasWidth / 2, canvasHeight / 2 + 110);
  }
}
