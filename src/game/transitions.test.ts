import { describe, it, expect } from 'vitest';
import { transition, INITIAL_STATE } from './transitions';
import { PlayingState, PausedState, GameOverState } from './types';
import { INITIAL_GIRAFFE_POSITION } from './constants';

const playingState: PlayingState = {
  phase: 'playing',
  isPaused: false,
  score: 0,
  highScore: 0,
  tickCount: 10,
  lastTickTime: 1000,
  deltaTime: 0,
  giraffePosition: 1,
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
      giraffePosition: 2,
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
      giraffePosition: 2,
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
      giraffePosition: 2,
      finalScore: 50,
      reason: 'starved',
    };
    const next = transition(gameOver, { type: 'RESTART' });
    expect(next.phase).toBe('start');
    expect(next.highScore).toBe(50);
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });

  it('START_GAME resets the giraffe to the initial position', () => {
    const gameOver: GameOverState = {
      phase: 'game_over',
      score: 50,
      highScore: 50,
      tickCount: 100,
      lastTickTime: 5000,
      giraffePosition: 3,
      finalScore: 50,
      reason: 'starved',
    };
    const next = transition(gameOver, { type: 'START_GAME' });
    expect(next.giraffePosition).toBe(INITIAL_GIRAFFE_POSITION);
  });

  it('RESTART resets the giraffe to the initial position', () => {
    const next = transition(playingState, { type: 'RESTART' });
    expect(next.giraffePosition).toBe(INITIAL_GIRAFFE_POSITION);
  });

  it('MOVE_DOWN while playing moves the giraffe down one position', () => {
    const next = transition(playingState, { type: 'MOVE_DOWN' });
    expect(next.giraffePosition).toBe(2);
  });

  it('MOVE_UP while playing moves the giraffe up one position', () => {
    const next = transition(playingState, { type: 'MOVE_UP' });
    expect(next.giraffePosition).toBe(0);
  });

  it('MOVE_UP is clamped at the top boundary', () => {
    const atTop: PlayingState = { ...playingState, giraffePosition: 0 };
    const next = transition(atTop, { type: 'MOVE_UP' });
    expect(next.giraffePosition).toBe(0);
  });

  it('MOVE_DOWN is clamped at the bottom boundary', () => {
    const atBottom: PlayingState = { ...playingState, giraffePosition: 3 };
    const next = transition(atBottom, { type: 'MOVE_DOWN' });
    expect(next.giraffePosition).toBe(3);
  });

  it('PAUSE then RESUME preserves the giraffe position', () => {
    const moved: PlayingState = { ...playingState, giraffePosition: 2 };
    const paused = transition(moved, { type: 'PAUSE' }, 5000);
    expect(paused.giraffePosition).toBe(2);
    const resumed = transition(paused, { type: 'RESUME' }, 6000);
    expect(resumed.giraffePosition).toBe(2);
  });

  it('MOVE actions are ignored when not playing', () => {
    expect(transition(INITIAL_STATE, { type: 'MOVE_UP' })).toBe(INITIAL_STATE);
    expect(transition(INITIAL_STATE, { type: 'MOVE_DOWN' })).toBe(INITIAL_STATE);
  });
});
