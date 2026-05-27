import { describe, it, expect } from 'vitest';
import { transition, INITIAL_STATE } from './transitions';
import { PlayingState, PausedState, GameOverState } from './types';

const playingState: PlayingState = {
  phase: 'playing',
  isPaused: false,
  score: 0,
  highScore: 0,
  tickCount: 10,
  lastTickTime: 1000,
  deltaTime: 0,
};

describe('transition', () => {
  it('START_GAME from start moves to playing', () => {
    const next = transition(INITIAL_STATE, { type: 'START_GAME' });
    expect(next.phase).toBe('playing');
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });

  it('START_GAME from paused is a no-op', () => {
    const paused: PausedState = {
      phase: 'paused',
      score: 5,
      highScore: 10,
      tickCount: 20,
      lastTickTime: 2000,
      pausedAt: 2500,
    };
    const next = transition(paused, { type: 'START_GAME' });
    expect(next).toBe(paused);
  });

  it('PAUSE from playing moves to paused with correct pausedAt', () => {
    const next = transition(playingState, { type: 'PAUSE' }, 5000);
    expect(next.phase).toBe('paused');
    if (next.phase === 'paused') {
      expect(next.pausedAt).toBe(5000);
      expect(next.score).toBe(playingState.score);
      expect(next.tickCount).toBe(playingState.tickCount);
    }
  });

  it('PAUSE from non-playing is a no-op', () => {
    const next = transition(INITIAL_STATE, { type: 'PAUSE' }, 5000);
    expect(next).toBe(INITIAL_STATE);
  });

  it('RESUME from paused returns to playing', () => {
    const paused: PausedState = {
      phase: 'paused',
      score: 5,
      highScore: 10,
      tickCount: 20,
      lastTickTime: 2000,
      pausedAt: 2500,
    };
    const next = transition(paused, { type: 'RESUME' }, 3000);
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.score).toBe(5);
      expect(next.tickCount).toBe(20);
      expect(next.lastTickTime).toBe(3000);
    }
  });

  it('GAME_OVER updates highScore when finalScore is greater', () => {
    const highScoreState: PlayingState = { ...playingState, score: 42, highScore: 10 };
    const next = transition(highScoreState, { type: 'GAME_OVER', reason: 'starved' });
    expect(next.phase).toBe('game_over');
    if (next.phase === 'game_over') {
      expect(next.finalScore).toBe(42);
      expect(next.highScore).toBe(42);
      expect(next.reason).toBe('starved');
    }
  });

  it('GAME_OVER preserves highScore when it is already higher', () => {
    const lowScoreState: PlayingState = { ...playingState, score: 5, highScore: 100 };
    const next = transition(lowScoreState, { type: 'GAME_OVER', reason: 'timeout' });
    if (next.phase === 'game_over') {
      expect(next.highScore).toBe(100);
    }
  });

  it('GAME_OVER from non-playing is a no-op', () => {
    const next = transition(INITIAL_STATE, { type: 'GAME_OVER', reason: 'starved' });
    expect(next).toBe(INITIAL_STATE);
  });

  it('RESTART from game_over returns to start with preserved highScore', () => {
    const gameOver: GameOverState = {
      phase: 'game_over',
      score: 50,
      highScore: 50,
      tickCount: 100,
      lastTickTime: 5000,
      finalScore: 50,
      reason: 'starved',
    };
    const next = transition(gameOver, { type: 'RESTART' });
    expect(next.phase).toBe('start');
    expect(next.highScore).toBe(50);
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });
});
