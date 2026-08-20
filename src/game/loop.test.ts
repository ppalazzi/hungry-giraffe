import { describe, it, expect } from 'vitest';
import { update } from './loop';
import { MS_PER_TICK, ACTIVE_LEAF_CYCLE_TICKS } from './constants';
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
    leafPositions: [0, 2],
    activeLeafPosition: 0,
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
      leafPositions: [0, 2],
      activeLeafPosition: 0,
    };
    const result = update(startState, 1000);
    expect(result).toBe(startState);
  });

  it('increments tickCount by 1 on each call', () => {
    const result = update(playingState, 1033);
    expect(result.tickCount).toBe(1);
  });

  it('sets deltaTime to MS_PER_TICK', () => {
    const result = update(playingState, 1033);
    expect(result.phase === 'playing' && result.deltaTime).toBe(MS_PER_TICK);
  });

  it('sets lastTickTime to the provided now value', () => {
    const result = update(playingState, 9999);
    expect(result.lastTickTime).toBe(9999);
  });

  it('accumulates tickCount correctly over 30 calls', () => {
    let state = playingState;
    for (let i = 0; i < 30; i++) {
      state = update(state, i * MS_PER_TICK) as PlayingState;
    }
    expect(state.tickCount).toBe(30);
  });

  it('does not mutate the input state', () => {
    const original = { ...playingState };
    update(playingState, 1000);
    expect(playingState.tickCount).toBe(original.tickCount);
  });

  it('cycles activeLeafPosition exactly at the active-leaf cycle boundary', () => {
    const beforeBoundary = makePlayingState({ tickCount: ACTIVE_LEAF_CYCLE_TICKS - 2 });
    const before = update(beforeBoundary, 1000, always(0));
    expect(before.activeLeafPosition).toBe(0);

    const atBoundary = makePlayingState({ tickCount: ACTIVE_LEAF_CYCLE_TICKS - 1 });
    const at = update(atBoundary, 1000, always(0));
    expect(at.activeLeafPosition).toBe(2);
  });

  it('leaves activeLeafPosition untouched between cycle boundaries', () => {
    const state = makePlayingState({ tickCount: 5 });
    const result = update(state, 1000, always(0));
    expect(result.activeLeafPosition).toBe(0);
  });
});
