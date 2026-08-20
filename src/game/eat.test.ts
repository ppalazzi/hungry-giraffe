import { describe, it, expect } from 'vitest';
import { resolveEat } from './eat';
import { PlayingState } from './types';
import { SCORE_PER_LEAF } from './constants';

const always = (value: number) => () => value;

function makePlayingState(overrides: Partial<PlayingState> = {}): PlayingState {
  return {
    phase: 'playing',
    isPaused: false,
    score: 0,
    highScore: 0,
    tickCount: 0,
    lastTickTime: 0,
    deltaTime: 0,
    giraffePosition: 0,
    lives: 3,
    leafPositions: [0, 2],
    activeLeafPosition: 0,
    monkeyPosition: 3,
    monkeyAction: 'idle',
    neckExtended: false,
    ...overrides,
  };
}

describe('resolveEat', () => {
  it('costs a life with no score change when the monkey is blocking the giraffe lane', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      monkeyPosition: 1,
      monkeyAction: 'blocking',
      activeLeafPosition: 2,
      leafPositions: [1, 2],
      score: 5,
      lives: 3,
    });
    const result = resolveEat(state, always(0));
    expect(result.lives).toBe(2);
    expect(result.score).toBe(5);
    expect(result.leafPositions).toBe(state.leafPositions);
    expect(result.activeLeafPosition).toBe(state.activeLeafPosition);
    expect(result.neckExtended).toBe(true);
  });

  it('costs a life with no score change when the monkey is attacking the giraffe lane', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      monkeyPosition: 1,
      monkeyAction: 'attacking',
      activeLeafPosition: 2,
      leafPositions: [1, 2],
      score: 5,
      lives: 3,
    });
    const result = resolveEat(state, always(0));
    expect(result.lives).toBe(2);
    expect(result.score).toBe(5);
  });

  it('awards score and updates leaves on a successful eat', () => {
    const state = makePlayingState({
      giraffePosition: 0,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'idle',
      score: 0,
      lives: 3,
    });
    const result = resolveEat(state, always(0.99));
    expect(result.score).toBe(SCORE_PER_LEAF);
    expect(result.lives).toBe(3);
    expect(result.leafPositions).toHaveLength(2);
    expect(result.leafPositions).not.toContain(0);
    expect(result.leafPositions).toContain(result.activeLeafPosition);
  });

  it('a monkey threatening a different lane does not block the eat', () => {
    const state = makePlayingState({
      giraffePosition: 0,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'blocking',
      score: 0,
      lives: 3,
    });
    const result = resolveEat(state, always(0.99));
    expect(result.score).toBe(SCORE_PER_LEAF);
    expect(result.lives).toBe(3);
  });

  it('costs a life with no score change on a miss', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      activeLeafPosition: 0,
      leafPositions: [0, 2],
      monkeyPosition: 3,
      monkeyAction: 'idle',
      score: 5,
      lives: 3,
    });
    const result = resolveEat(state, always(0));
    expect(result.lives).toBe(2);
    expect(result.score).toBe(5);
    expect(result.leafPositions).toBe(state.leafPositions);
    expect(result.activeLeafPosition).toBe(state.activeLeafPosition);
  });

  it('a monkey blocking the giraffe lane wins over an eat on the active leaf', () => {
    const state = makePlayingState({
      giraffePosition: 1,
      activeLeafPosition: 1,
      leafPositions: [1, 2],
      monkeyPosition: 1,
      monkeyAction: 'attacking',
      score: 5,
      lives: 3,
    });
    const result = resolveEat(state, always(0));
    expect(result.lives).toBe(2);
    expect(result.score).toBe(5);
    expect(result.leafPositions).toBe(state.leafPositions);
  });
});
