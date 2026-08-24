import { describe, it, expect } from 'vitest';
import { update } from './loop';
import {
  MS_PER_TICK,
  SCORE_PER_LEAF,
  INITIAL_LIVES,
  LEAF_COUNT,
  COCONUT_STEP_TICKS,
  COCONUT_RESPAWN_TICKS,
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
    coconutStep: null,
    coconutTicks: COCONUT_RESPAWN_TICKS,
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
      coconutStep: null,
      coconutTicks: COCONUT_RESPAWN_TICKS,
    };
    expect(update(startState, 1000)).toBe(startState);
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
    const offLeaf = makePlayingState({ giraffePosition: 2 });
    const result = update(offLeaf, 1000, always(0));
    expect(result.score).toBe(0);
    expect(result.leafPositions).toEqual([1, 3]);
  });

  it('never scores at the home position', () => {
    const result = update(makePlayingState({ giraffePosition: 0 }), 1000, always(0));
    expect(result.score).toBe(0);
  });

  it('costs a life when a coconut strikes the extended neck', () => {
    // One tick from advancing onto step 3, which sits at position 1.
    const exposed = makePlayingState({
      giraffePosition: 3,
      coconutStep: 2,
      coconutTicks: 1,
    });
    const result = update(exposed, 1000, always(0));
    expect(result.lives).toBe(INITIAL_LIVES - 1);
  });

  it('knocks the neck back home and consumes the coconut on a hit', () => {
    const exposed = makePlayingState({
      giraffePosition: 3,
      coconutStep: 2,
      coconutTicks: 1,
    });
    const result = update(exposed, 1000, always(0));
    expect(result.giraffePosition).toBe(0);
    expect(result.coconutStep).toBeNull();
    expect(result.coconutTicks).toBe(COCONUT_RESPAWN_TICKS);
  });

  it('costs exactly one life per coconut, not one per tick', () => {
    const struck = update(
      makePlayingState({ giraffePosition: 3, coconutStep: 2, coconutTicks: 1 }),
      1000,
      always(0),
    ) as PlayingState;
    expect(struck.lives).toBe(INITIAL_LIVES - 1);
    // The neck is home now, so the following ticks are safe.
    let state = struck;
    for (let i = 0; i < 10; i++) {
      state = update(state, i * MS_PER_TICK) as PlayingState;
    }
    expect(state.lives).toBe(INITIAL_LIVES - 1);
  });

  it('leaves a retracted giraffe untouched for a whole drop', () => {
    let state = makePlayingState({ giraffePosition: 0, coconutStep: 1, coconutTicks: 1 });
    for (let i = 0; i < COCONUT_STEP_TICKS * 6; i++) {
      state = update(state, i * MS_PER_TICK) as PlayingState;
    }
    expect(state.lives).toBe(INITIAL_LIVES);
  });

  it('ends the game when the last life is lost', () => {
    const lastLife = makePlayingState({
      giraffePosition: 3,
      lives: 1,
      coconutStep: 2,
      coconutTicks: 1,
    });
    const result = update(lastLife, 1000, always(0));
    expect(result.phase).toBe('game_over');
    if (result.phase === 'game_over') {
      expect(result.reason).toBe('starved');
    }
  });
});
