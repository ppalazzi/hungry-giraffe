import { describe, it, expect } from 'vitest';
import { transition, INITIAL_STATE } from './transitions';
import { PlayingState, PausedState, GameOverState } from './types';
import {
  INITIAL_GIRAFFE_POSITION,
  INITIAL_LIVES,
  LEAF_COUNT,
  MIN_LEAF_POSITION,
  COCONUT_RESPAWN_TICKS,
} from './constants';

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
    leafPositions: [1, 3],
    coconutStep: null,
    coconutTicks: COCONUT_RESPAWN_TICKS,
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
    leafPositions: [1, 3],
    coconutStep: null,
    coconutTicks: COCONUT_RESPAWN_TICKS,
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
    leafPositions: [1, 3],
    coconutStep: null,
    coconutTicks: COCONUT_RESPAWN_TICKS,
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
    expect(transition(paused, { type: 'START_GAME' })).toBe(paused);
  });

  it('START_GAME spawns LEAF_COUNT leaves, none at the home position', () => {
    const next = transition(INITIAL_STATE, { type: 'START_GAME' }, 0, always(0));
    expect(next.leafPositions).toHaveLength(LEAF_COUNT);
    next.leafPositions.forEach((position) => {
      expect(position).toBeGreaterThanOrEqual(MIN_LEAF_POSITION);
    });
  });

  it('START_GAME sets up lives with no coconut in flight', () => {
    const next = transition(INITIAL_STATE, { type: 'START_GAME' });
    expect(next.lives).toBe(INITIAL_LIVES);
    expect(next.coconutStep).toBeNull();
    expect(next.coconutTicks).toBe(COCONUT_RESPAWN_TICKS);
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
    expect(transition(INITIAL_STATE, { type: 'PAUSE' }, 5000)).toBe(INITIAL_STATE);
  });

  it('RESUME from paused returns to playing', () => {
    const next = transition(makePausedState(), { type: 'RESUME' }, 3000);
    expect(next.phase).toBe('playing');
    if (next.phase === 'playing') {
      expect(next.score).toBe(5);
      expect(next.tickCount).toBe(20);
      expect(next.lastTickTime).toBe(3000);
    }
  });

  it('PAUSE then RESUME preserves lives, leaves and the coconut in flight', () => {
    const moved = makePlayingState({
      leafPositions: [2, 3],
      lives: 2,
      coconutStep: 2,
      coconutTicks: 7,
    });
    const paused = transition(moved, { type: 'PAUSE' }, 5000);
    expect(paused.leafPositions).toEqual([2, 3]);
    expect(paused.lives).toBe(2);
    expect(paused.coconutStep).toBe(2);
    const resumed = transition(paused, { type: 'RESUME' }, 6000);
    expect(resumed.leafPositions).toEqual([2, 3]);
    expect(resumed.lives).toBe(2);
    expect(resumed.coconutStep).toBe(2);
    expect(resumed.coconutTicks).toBe(7);
  });

  it('GAME_OVER updates highScore when finalScore is greater', () => {
    const next = transition(makePlayingState({ score: 42, highScore: 10 }), {
      type: 'GAME_OVER',
      reason: 'starved',
    });
    expect(next.phase).toBe('game_over');
    if (next.phase === 'game_over') {
      expect(next.finalScore).toBe(42);
      expect(next.highScore).toBe(42);
      expect(next.reason).toBe('starved');
    }
  });

  it('GAME_OVER preserves highScore when it is already higher', () => {
    const next = transition(makePlayingState({ score: 5, highScore: 100 }), {
      type: 'GAME_OVER',
      reason: 'timeout',
    });
    if (next.phase === 'game_over') {
      expect(next.highScore).toBe(100);
    }
  });

  it('GAME_OVER from non-playing is a no-op', () => {
    const next = transition(INITIAL_STATE, { type: 'GAME_OVER', reason: 'starved' });
    expect(next).toBe(INITIAL_STATE);
  });

  it('RESTART from game_over returns to start with preserved highScore', () => {
    const next = transition(makeGameOverState(), { type: 'RESTART' });
    expect(next.phase).toBe('start');
    expect(next.highScore).toBe(50);
    expect(next.score).toBe(0);
    expect(next.tickCount).toBe(0);
  });

  it('RESTART resets lives and the leaf layout', () => {
    const played = makePlayingState({ leafPositions: [2, 3], lives: 1 });
    const next = transition(played, { type: 'RESTART' });
    expect(next.lives).toBe(INITIAL_LIVES);
    expect(next.leafPositions).toEqual(INITIAL_STATE.leafPositions);
  });

  it('START_GAME resets the neck to the home position', () => {
    const next = transition(makeGameOverState({ giraffePosition: 3 }), { type: 'START_GAME' });
    expect(next.giraffePosition).toBe(INITIAL_GIRAFFE_POSITION);
  });

  it('RESTART resets the neck to the home position', () => {
    expect(transition(playingState, { type: 'RESTART' }).giraffePosition).toBe(
      INITIAL_GIRAFFE_POSITION,
    );
  });

  it('MOVE_UP while playing extends the neck one segment', () => {
    expect(transition(playingState, { type: 'MOVE_UP' }).giraffePosition).toBe(2);
  });

  it('MOVE_DOWN while playing retracts the neck one segment', () => {
    expect(transition(playingState, { type: 'MOVE_DOWN' }).giraffePosition).toBe(0);
  });

  it('MOVE_UP is clamped at full extension', () => {
    const extended = makePlayingState({ giraffePosition: 3 });
    expect(transition(extended, { type: 'MOVE_UP' }).giraffePosition).toBe(3);
  });

  it('MOVE_DOWN is clamped at the home position', () => {
    const home = makePlayingState({ giraffePosition: 0 });
    expect(transition(home, { type: 'MOVE_DOWN' }).giraffePosition).toBe(0);
  });

  it('PAUSE then RESUME preserves the neck position', () => {
    const moved = makePlayingState({ giraffePosition: 2 });
    const paused = transition(moved, { type: 'PAUSE' }, 5000);
    expect(paused.giraffePosition).toBe(2);
    expect(transition(paused, { type: 'RESUME' }, 6000).giraffePosition).toBe(2);
  });

  it('MOVE actions are ignored when not playing', () => {
    expect(transition(INITIAL_STATE, { type: 'MOVE_UP' })).toBe(INITIAL_STATE);
    expect(transition(INITIAL_STATE, { type: 'MOVE_DOWN' })).toBe(INITIAL_STATE);
  });
});
