import { describe, it, expect } from 'vitest';
import { update } from './loop';
import {
  MS_PER_TICK,
  SCORE_PER_LEAF,
  BASE_MONKEY_CYCLE_TICKS,
  INITIAL_LIVES,
  LEAF_COUNT,
} from './constants';
import { PlayingState, StartState } from './types';

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
    lives: INITIAL_LIVES,
    leafPositions: [1, 3],
    monkeyPosition: 3,
    monkeyAction: 'idle',
    ...overrides,
  };
}

const playingState = makePlayingState();

describe('update', () => {
  it('returns state unchanged when phase is not playing', () => {
    const startState: StartState = {
      phase: 'start',
      score: 0,
      highScore: 0,
      tickCount: 0,
      lastTickTime: 0,
      giraffePosition: 0,
      lives: INITIAL_LIVES,
      leafPositions: [1, 3],
      monkeyPosition: 3,
      monkeyAction: 'idle',
    };
    const result = update(startState, 1000);
    expect(result).toBe(startState);
  });

  it('increments tickCount by 1 on each call', () => {
    expect(update(playingState, 1033).tickCount).toBe(1);
  });

  it('sets deltaTime to MS_PER_TICK', () => {
    const result = update(playingState, 1033);
    expect(result.phase === 'playing' && result.deltaTime).toBe(MS_PER_TICK);
  });

  it('sets lastTickTime to the provided now value', () => {
    expect(update(playingState, 9999).lastTickTime).toBe(9999);
  });

  it('does not mutate the input state', () => {
    const original = { ...playingState };
    update(playingState, 1000);
    expect(playingState.tickCount).toBe(original.tickCount);
  });

  it('eats automatically when the head shares a leaf position', () => {
    const onLeaf = makePlayingState({ giraffePosition: 1 });
    const result = update(onLeaf, 1000, always(0.99));
    expect(result.score).toBe(SCORE_PER_LEAF);
    expect(result.leafPositions).not.toContain(1);
    expect(result.leafPositions).toHaveLength(LEAF_COUNT);
  });

  it('does not score while the head is away from every leaf', () => {
    const offLeaf = makePlayingState({ giraffePosition: 2, leafPositions: [1, 3] });
    const result = update(offLeaf, 1000, always(0));
    expect(result.score).toBe(0);
    expect(result.leafPositions).toEqual([1, 3]);
  });

  it('never scores at the home position', () => {
    const home = makePlayingState({ giraffePosition: 0 });
    const result = update(home, 1000, always(0));
    expect(result.score).toBe(0);
    expect(result.leafPositions).toEqual([1, 3]);
  });

  it('never costs a life — the coconut hazard lands in HG-25', () => {
    let state = makePlayingState({ giraffePosition: 1 });
    for (let i = 0; i < 200; i++) {
      state = update(state, i * MS_PER_TICK) as PlayingState;
    }
    expect(state.lives).toBe(INITIAL_LIVES);
  });

  it('advances monkeyAction on its cycle boundary and repositions only when it becomes moving', () => {
    const becomingMoving = makePlayingState({
      tickCount: BASE_MONKEY_CYCLE_TICKS - 1,
      monkeyAction: 'idle',
      monkeyPosition: 3,
    });
    const moving = update(becomingMoving, 1000, always(0.5));
    expect(moving.monkeyAction).toBe('moving');
    expect(moving.monkeyPosition).toBe(2);

    const becomingBlocking = makePlayingState({
      tickCount: BASE_MONKEY_CYCLE_TICKS * 2 - 1,
      monkeyAction: 'moving',
      monkeyPosition: 2,
    });
    const blocking = update(becomingBlocking, 1000, always(0));
    expect(blocking.monkeyAction).toBe('blocking');
    expect(blocking.monkeyPosition).toBe(2);
  });
});
