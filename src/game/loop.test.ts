import { describe, it, expect } from 'vitest';
import { update } from './loop';
import {
  MS_PER_TICK,
  BASE_ACTIVE_LEAF_CYCLE_TICKS,
  BASE_MONKEY_CYCLE_TICKS,
  MIN_CYCLE_TICKS,
  SPEED_SCORE_STEP,
  CYCLE_TICKS_PER_SPEED_LEVEL,
  INITIAL_LIVES,
} from './constants';
import { PlayingState, StartState } from './types';

const always = (value: number) => () => value;

function effectiveCycleTicks(base: number, score: number): number {
  const reduction = Math.floor(score / SPEED_SCORE_STEP) * CYCLE_TICKS_PER_SPEED_LEVEL;
  return Math.max(MIN_CYCLE_TICKS, base - reduction);
}

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
    leafPositions: [0, 2],
    activeLeafPosition: 0,
    monkeyPosition: 3,
    monkeyAction: 'idle',
    neckExtended: false,
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
      leafPositions: [0, 2],
      activeLeafPosition: 0,
      monkeyPosition: 3,
      monkeyAction: 'idle',
      neckExtended: false,
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

  it('resets neckExtended to false after one tick', () => {
    const state = makePlayingState({ neckExtended: true });
    const result = update(state, 1000);
    expect(result.neckExtended).toBe(false);
  });

  it('cycles activeLeafPosition exactly at the active-leaf cycle boundary', () => {
    const cycle = effectiveCycleTicks(BASE_ACTIVE_LEAF_CYCLE_TICKS, 0);

    const beforeBoundary = makePlayingState({ tickCount: cycle - 2 });
    const before = update(beforeBoundary, 1000, always(0));
    expect(before.activeLeafPosition).toBe(0);

    const atBoundary = makePlayingState({ tickCount: cycle - 1 });
    const at = update(atBoundary, 1000, always(0));
    expect(at.activeLeafPosition).toBe(2);
  });

  it('advances monkeyAction on its cycle boundary and picks a position only when it becomes moving', () => {
    const cycle = effectiveCycleTicks(BASE_MONKEY_CYCLE_TICKS, 0);

    const becomingMoving = makePlayingState({
      tickCount: cycle - 1,
      monkeyAction: 'idle',
      monkeyPosition: 3,
    });
    const moving = update(becomingMoving, 1000, always(0.5));
    expect(moving.monkeyAction).toBe('moving');
    expect(moving.monkeyPosition).toBe(2);

    const becomingBlocking = makePlayingState({
      tickCount: cycle * 2 - 1,
      monkeyAction: 'moving',
      monkeyPosition: 2,
    });
    const blocking = update(becomingBlocking, 1000, always(0));
    expect(blocking.monkeyAction).toBe('blocking');
    expect(blocking.monkeyPosition).toBe(2);
  });

  it('shortens the active-leaf cycle as score rises', () => {
    const fastCycle = effectiveCycleTicks(BASE_ACTIVE_LEAF_CYCLE_TICKS, SPEED_SCORE_STEP);
    expect(fastCycle).toBeLessThan(BASE_ACTIVE_LEAF_CYCLE_TICKS);

    const sped = makePlayingState({ tickCount: fastCycle - 1, score: SPEED_SCORE_STEP });
    const spedResult = update(sped, 1000, always(0));
    expect(spedResult.activeLeafPosition).toBe(2);

    const unsped = makePlayingState({ tickCount: fastCycle - 1, score: 0 });
    const unspedResult = update(unsped, 1000, always(0));
    expect(unspedResult.activeLeafPosition).toBe(0);
  });

  it('never shortens the active-leaf cycle below MIN_CYCLE_TICKS', () => {
    const highScore = SPEED_SCORE_STEP * 100;
    expect(effectiveCycleTicks(BASE_ACTIVE_LEAF_CYCLE_TICKS, highScore)).toBe(MIN_CYCLE_TICKS);

    const state = makePlayingState({ tickCount: MIN_CYCLE_TICKS - 1, score: highScore });
    const result = update(state, 1000, always(0));
    expect(result.activeLeafPosition).toBe(2);
  });
});
