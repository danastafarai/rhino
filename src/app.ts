import { Game } from './game/Game';
import type { GameState } from './game/GameState';
import './styles/main.css';

function initGame(): void {
  const canvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  if (!canvasElement) {
    throw new Error('Canvas element #gameCanvas not found');
  }

  const game = new Game(canvasElement);
  game.onFrame(renderScoreboard());
  bindTouchControls(game);
  game.start();
}

function renderScoreboard(): (state: GameState) => void {
  const scoreElement = document.getElementById('score');
  const livesElement = document.getElementById('lives');
  const highScoreElement = document.getElementById('highScore');
  const pauseButton = document.getElementById('pauseButton');

  return (state: GameState): void => {
    if (scoreElement) scoreElement.textContent = state.getScore().toString();
    if (livesElement) livesElement.textContent = state.getLives().toString();
    if (highScoreElement) highScoreElement.textContent = state.getHighScore().toString();
    if (pauseButton) pauseButton.textContent = state.isPaused() ? 'Resume' : 'Pause';
  };
}

// Touch devices have no keyboard, so pause and restart need on-screen equivalents.
function bindTouchControls(game: Game): void {
  document.getElementById('pauseButton')?.addEventListener('click', () => game.togglePause());
  document.getElementById('restartButton')?.addEventListener('click', () => game.restart());
}

document.addEventListener('DOMContentLoaded', initGame);
