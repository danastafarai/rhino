import { Game } from './game/Game';

function initGame(): void {
  const canvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  if (!canvasElement) {
    console.error('Canvas element not found');
    return;
  }

  const game = new Game(canvasElement);
  game.start();

  updateUI(game);

  const handleRestart = (): void => {
    game.reset();
  };

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && game.getGameState().getStatus() === 'gameOver') {
      handleRestart();
    }
  });
}

function updateUI(game: Game): void {
  const scoreElement = document.getElementById('score');
  const highScoreElement = document.getElementById('highScore');

  if (!scoreElement || !highScoreElement) {
    return;
  }

  const updateDisplay = (): void => {
    scoreElement.textContent = game.getGameState().getScore().toString();
    highScoreElement.textContent = game.getGameState().getHighScore().toString();
    requestAnimationFrame(updateDisplay);
  };

  updateDisplay();
}

document.addEventListener('DOMContentLoaded', initGame);
