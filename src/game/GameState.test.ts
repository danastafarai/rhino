import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameState } from './GameState';

describe('GameState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with score 0', () => {
    const gameState = new GameState();
    expect(gameState.getScore()).toBe(0);
  });

  it('should increment score correctly', () => {
    const gameState = new GameState();
    gameState.incrementScore();
    gameState.incrementScore();
    expect(gameState.getScore()).toBe(20);
  });

  it('should track level progression', () => {
    const gameState = new GameState();
    expect(gameState.getLevel()).toBe(0);

    for (let i = 0; i < 10; i++) {
      gameState.incrementScore();
    }
    expect(gameState.getLevel()).toBe(1);
  });

  it('should save and load high score from localStorage', () => {
    const gameState1 = new GameState();
    for (let i = 0; i < 5; i++) {
      gameState1.incrementScore();
    }
    expect(gameState1.getHighScore()).toBe(50);

    const gameState2 = new GameState();
    expect(gameState2.getHighScore()).toBe(50);
  });

  it('should toggle pause state', () => {
    const gameState = new GameState();
    expect(gameState.isPlaying()).toBe(true);
    expect(gameState.isPaused()).toBe(false);

    gameState.setStatus('paused');
    expect(gameState.isPlaying()).toBe(false);
    expect(gameState.isPaused()).toBe(true);

    gameState.setStatus('playing');
    expect(gameState.isPlaying()).toBe(true);
  });

  it('should reset game state', () => {
    const gameState = new GameState();
    for (let i = 0; i < 10; i++) {
      gameState.incrementScore();
    }
    expect(gameState.getScore()).toBe(100);

    gameState.reset();
    expect(gameState.getScore()).toBe(0);
    expect(gameState.getLevel()).toBe(0);
    expect(gameState.isPlaying()).toBe(true);
  });

  it('should track elapsed time', () => {
    const gameState = new GameState();
    expect(gameState.getElapsedTime()).toBe(0);

    gameState.updateElapsedTime(1.5);
    expect(gameState.getElapsedTime()).toBe(1.5);

    gameState.updateElapsedTime(0.5);
    expect(gameState.getElapsedTime()).toBe(2);
  });
});
