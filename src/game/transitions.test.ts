import { describe, it, expect } from 'vitest';
import { transition, INITIAL_STATE } from './transitions';
import { PlayingState, PausedState, GameOverState } from './types';
import { INITIAL_GIRAFFE_POSITION, INITIAL_LIVES, LEAF_COUNT, SCORE_PER_LEAF } from './constants';

const always = (value: number) => () => value;

function makePlayingState(overrides: Partial<PlayingState> = {}): PlayingState {
  return {
    phase: 'playing',
    isPaused: false,
    score: 0,
    highScore: 0,
    tickCount: 10,
    lastTickTime: 1000,
    deltaTime: 0,
    giraffePosition: 1,
    lives: INITIAL_LIVES,
    leafPositions: [0, 2],
    activeLeafPosition: 0,
    monkeyPosition: 3,
    monkeyAction: 'idle',
    neckExtended: false,
    ...overrides,
  };
}

function makePausedState(overrides: Partial<PausedState> = {}): PausedState {
  return {
    phase: 'paused',
    score: 5,
    highScore: 10,
    tickCount: 20,
    lastTickTime: 2000,
    giraffePosition: 2,
    lives: INITIAL_LIVES,
    leafPositions: [0, 2],
    activeLeafPosition: 0,
    monkeyPosition: 3,
    monkeyAction: 'idle',
    neckExtended: false,
    pausedAt: 2500,
    ...overrides,
  };
}

function makeGameOverState(overrides: Partial<GameOverState> = {}): GameOverState {
  return {
    phase: 'game_over',
    score: 50,
    highScore: 50,
    tickCount: 100,
    lastTickTime: 5000,
    giraffePosition: 2,
    lives: 0,
    leafPositions: [0, 2],
    activeLeafPosition: 0,
    monkeyPosition: 3,
    monkeyAction: 'idle',
    neckExtended: false,
    finalScore: 50,
    reason: 'starved',
    ...overrides,
  };
}

const playingState = makePlayingState();

describe('transition', () => {
  it('START_GAME from start moves to playing', () => {
    const next = transition(INITIAL_STATE, { type: 'START_GAME' });
    expect(next.phase).toBe('playing');
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });

  it('START_GAME from paused is a no-op', () => {
    const paused = makePausedState();
    const next = transition(paused, { type: 'START_GAME' });
    expect(next).toBe(paused);
  });

  it('START_GAME sets up lives, leaves, and monkey state', () => {
    const next = transition(INITIAL_STATE, { type: 'START_GAME' }, performance.now(), always(0));
    expect(next.lives).toBe(INITIAL_LIVES);
    if (next.phase === 'playing') {
      expect(next.leafPositions).toHaveLength(LEAF_COUNT);
      expect(next.leafPositions).toContain(next.activeLeafPosition);
      expect(next.monkeyAction).toBe('idle');
    }
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
    const paused = makePausedState();
    const next = transition(paused, { type: 'RESUME' }, 3000);
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.score).toBe(5);
      expect(next.tickCount).toBe(20);
      expect(next.lastTickTime).toBe(3000);
    }
  });

  it('PAUSE then RESUME preserves lives, leaves, and monkey fields', () => {
    const moved = makePlayingState({
      lives: 2,
      leafPositions: [1, 3],
      activeLeafPosition: 3,
      monkeyPosition: 1,
      monkeyAction: 'blocking',
      neckExtended: true,
    });
    const paused = transition(moved, { type: 'PAUSE' }, 5000);
    expect(paused.lives).toBe(2);
    expect(paused.leafPositions).toEqual([1, 3]);
    expect(paused.activeLeafPosition).toBe(3);
    expect(paused.monkeyPosition).toBe(1);
    expect(paused.monkeyAction).toBe('blocking');
    expect(paused.neckExtended).toBe(true);

    const resumed = transition(paused, { type: 'RESUME' }, 6000);
    expect(resumed.lives).toBe(2);
    expect(resumed.leafPositions).toEqual([1, 3]);
    expect(resumed.activeLeafPosition).toBe(3);
    expect(resumed.monkeyPosition).toBe(1);
    expect(resumed.monkeyAction).toBe('blocking');
    expect(resumed.neckExtended).toBe(true);
  });

  it('GAME_OVER updates highScore when finalScore is greater', () => {
    const highScoreState = makePlayingState({ score: 42, highScore: 10 });
    const next = transition(highScoreState, { type: 'GAME_OVER', reason: 'starved' });
    expect(next.phase).toBe('game_over');
    if (next.phase === 'game_over') {
      expect(next.finalScore).toBe(42);
      expect(next.highScore).toBe(42);
      expect(next.reason).toBe('starved');
    }
  });

  it('GAME_OVER preserves highScore when it is already higher', () => {
    const lowScoreState = makePlayingState({ score: 5, highScore: 100 });
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
    const gameOver = makeGameOverState();
    const next = transition(gameOver, { type: 'RESTART' });
    expect(next.phase).toBe('start');
    expect(next.highScore).toBe(50);
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });

  it('RESTART resets lives, leaves, and monkey state', () => {
    const gameOver = makeGameOverState({ lives: 0, leafPositions: [1, 3], monkeyAction: 'attacking' });
    const next = transition(gameOver, { type: 'RESTART' });
    expect(next.lives).toBe(INITIAL_LIVES);
    expect(next.leafPositions).toEqual(INITIAL_STATE.leafPositions);
    expect(next.monkeyAction).toBe(INITIAL_STATE.monkeyAction);
  });

  it('START_GAME resets the giraffe to the initial position', () => {
    const gameOver = makeGameOverState({ giraffePosition: 3 });
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
    const atTop = makePlayingState({ giraffePosition: 0 });
    const next = transition(atTop, { type: 'MOVE_UP' });
    expect(next.giraffePosition).toBe(0);
  });

  it('MOVE_DOWN is clamped at the bottom boundary', () => {
    const atBottom = makePlayingState({ giraffePosition: 3 });
    const next = transition(atBottom, { type: 'MOVE_DOWN' });
    expect(next.giraffePosition).toBe(3);
  });

  it('MOVE actions are ignored when not playing', () => {
    expect(transition(INITIAL_STATE, { type: 'MOVE_UP' })).toBe(INITIAL_STATE);
    expect(transition(INITIAL_STATE, { type: 'MOVE_DOWN' })).toBe(INITIAL_STATE);
  });

  it('EAT is ignored when not playing', () => {
    expect(transition(INITIAL_STATE, { type: 'EAT' })).toBe(INITIAL_STATE);
  });

  it('EAT on the active leaf awards score and updates leaves', () => {
    const state = makePlayingState({
      giraffePosition: 0,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'idle',
      score: 0,
      lives: 3,
    });
    const next = transition(state, { type: 'EAT' }, performance.now(), always(0.99));
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.score).toBe(SCORE_PER_LEAF);
      expect(next.lives).toBe(3);
      expect(next.leafPositions).not.toContain(0);
      expect(next.neckExtended).toBe(true);
    }
  });

  it('EAT off the active leaf costs a life with no score change', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'idle',
      score: 5,
      lives: 3,
    });
    const next = transition(state, { type: 'EAT' }, performance.now(), always(0));
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.lives).toBe(2);
      expect(next.score).toBe(5);
    }
  });

  it('EAT blocked by the monkey at the giraffe lane costs a life even on the active leaf', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      activeLeafPosition: 1,
      leafPositions: [1, 2],
      monkeyPosition: 1,
      monkeyAction: 'attacking',
      score: 5,
      lives: 3,
    });
    const next = transition(state, { type: 'EAT' }, performance.now(), always(0));
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.lives).toBe(2);
      expect(next.score).toBe(5);
    }
  });

  it('EAT that drops lives to 0 ends the game', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'idle',
      score: 30,
      lives: 1,
    });
    const next = transition(state, { type: 'EAT' }, performance.now(), always(0));
    expect(next.phase).toBe('game_over');
    if (next.phase === 'game_over') {
      expect(next.reason).toBe('starved');
      expect(next.finalScore).toBe(30);
      expect(next.lives).toBe(0);
    }
  });
});
