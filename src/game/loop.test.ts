import { describe, it, expect } from 'vitest';
import { update } from './loop';
import {
  BASE_TICK_MS,
  SCORE_PER_LEAF,
  INITIAL_LIVES,
  LEAF_COUNT,
  COCONUT_STEP_TICKS,
  COCONUT_RESPAWN_TICKS,
  PHASE_TWO_SCORE_INTERVAL,
  PHASE_TWO_OBSTACLES_TO_CLEAR,
  GROUND_RESPAWN_TICKS,
  GROUND_PATH_STEPS,
  JUMP_TICKS,
} from './constants';
import { PlayingState, StartState } from './types';
import { tickIntervalMs } from './clock';

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
    mode: 'leaves',
    nextGroundModeScore: PHASE_TWO_SCORE_INTERVAL,
    obstacleStep: null,
    obstacleTicks: GROUND_RESPAWN_TICKS,
    obstaclesSurvived: 0,
    jumpTicksRemaining: 0,
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
      mode: 'leaves',
      nextGroundModeScore: PHASE_TWO_SCORE_INTERVAL,
      obstacleStep: null,
      obstacleTicks: GROUND_RESPAWN_TICKS,
      obstaclesSurvived: 0,
      jumpTicksRemaining: 0,
    };
    expect(update(startState, 1000)).toBe(startState);
  });

  it('increments tickCount by 1 on each call', () => {
    expect(update(playingState, 1033).tickCount).toBe(1);
  });

  it('sets deltaTime to the current clock interval', () => {
    const result = update(playingState, 1033);
    expect(result.phase === 'playing' && result.deltaTime).toBe(BASE_TICK_MS);
  });

  it('reports a shorter deltaTime once the score crosses a speed boundary', () => {
    const fast = makePlayingState({ score: 200, giraffePosition: 2 });
    const result = update(fast, 1000, always(0));
    expect(result.phase === 'playing' && result.deltaTime).toBe(tickIntervalMs(200));
    expect(tickIntervalMs(200)).toBeLessThan(BASE_TICK_MS);
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
      state = update(state, i * BASE_TICK_MS) as PlayingState;
    }
    expect(state.lives).toBe(INITIAL_LIVES - 1);
  });

  it('leaves a retracted giraffe untouched for a whole drop', () => {
    let state = makePlayingState({ giraffePosition: 0, coconutStep: 1, coconutTicks: 1 });
    for (let i = 0; i < COCONUT_STEP_TICKS * 6; i++) {
      state = update(state, i * BASE_TICK_MS) as PlayingState;
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

describe('Phase 2', () => {
  it('enters ground mode once score reaches the trigger, locking the neck home', () => {
    const aboutToTrigger = makePlayingState({
      giraffePosition: 3,
      leafPositions: [3],
      score: PHASE_TWO_SCORE_INTERVAL - SCORE_PER_LEAF,
    });
    const result = update(aboutToTrigger, 1000, always(0)) as PlayingState;
    expect(result.score).toBe(PHASE_TWO_SCORE_INTERVAL);
    expect(result.mode).toBe('ground');
    expect(result.giraffePosition).toBe(0);
    expect(result.obstacleStep).toBeNull();
    expect(result.obstaclesSurvived).toBe(0);
  });

  it('advances the next trigger past the current score, not by a fixed step', () => {
    const result = update(
      makePlayingState({
        giraffePosition: 3,
        leafPositions: [3],
        score: PHASE_TWO_SCORE_INTERVAL - SCORE_PER_LEAF,
      }),
      1000,
      always(0),
    ) as PlayingState;
    expect(result.nextGroundModeScore).toBe(PHASE_TWO_SCORE_INTERVAL * 2);
  });

  it('does not eat leaves or advance the coconut while in ground mode', () => {
    const grounded = makePlayingState({
      mode: 'ground',
      giraffePosition: 0,
      leafPositions: [1, 3],
      coconutStep: 2,
      coconutTicks: 5,
    });
    const result = update(grounded, 1000, always(0)) as PlayingState;
    expect(result.leafPositions).toEqual([1, 3]);
    expect(result.coconutStep).toBe(2);
    expect(result.coconutTicks).toBe(5);
  });

  it('ignores MOVE actions while the neck is locked (covered in transitions, sanity-checked here via loop)', () => {
    const grounded = makePlayingState({ mode: 'ground', giraffePosition: 0 });
    const result = update(grounded, 1000, always(0)) as PlayingState;
    expect(result.giraffePosition).toBe(0);
  });

  it('costs a life when an obstacle arrives while not jumping', () => {
    const arriving = makePlayingState({
      mode: 'ground',
      obstacleStep: (GROUND_PATH_STEPS - 1) as 3,
      obstacleTicks: 1,
      jumpTicksRemaining: 0,
    });
    const result = update(arriving, 1000, always(0)) as PlayingState;
    expect(result.lives).toBe(INITIAL_LIVES - 1);
    expect(result.obstaclesSurvived).toBe(0);
    expect(result.obstacleStep).toBeNull();
  });

  it('survives an arriving obstacle without losing a life while jumping', () => {
    const arriving = makePlayingState({
      mode: 'ground',
      obstacleStep: (GROUND_PATH_STEPS - 1) as 3,
      obstacleTicks: 1,
      jumpTicksRemaining: 1,
    });
    const result = update(arriving, 1000, always(0)) as PlayingState;
    expect(result.lives).toBe(INITIAL_LIVES);
    expect(result.obstaclesSurvived).toBe(1);
  });

  it('counts down the jump window and auto-lands', () => {
    const jumping = makePlayingState({ mode: 'ground', jumpTicksRemaining: JUMP_TICKS });
    const result = update(jumping, 1000, always(0)) as PlayingState;
    expect(result.jumpTicksRemaining).toBe(JUMP_TICKS - 1);
  });

  it('returns to leaves mode once PHASE_TWO_OBSTACLES_TO_CLEAR are survived', () => {
    let state = makePlayingState({ mode: 'ground', obstaclesSurvived: PHASE_TWO_OBSTACLES_TO_CLEAR - 1 });
    state = {
      ...state,
      obstacleStep: (GROUND_PATH_STEPS - 1) as 3,
      obstacleTicks: 1,
      jumpTicksRemaining: 1,
    };
    const result = update(state, 1000, always(0)) as PlayingState;
    expect(result.mode).toBe('leaves');
    expect(result.obstaclesSurvived).toBe(0);
  });

  it('resumes leaves mode with leaf and coconut state exactly as it paused', () => {
    let state = makePlayingState({
      mode: 'ground',
      obstaclesSurvived: PHASE_TWO_OBSTACLES_TO_CLEAR - 1,
      leafPositions: [2, 3],
      coconutStep: 3,
      coconutTicks: 7,
    });
    state = {
      ...state,
      obstacleStep: (GROUND_PATH_STEPS - 1) as 3,
      obstacleTicks: 1,
      jumpTicksRemaining: 1,
    };
    const result = update(state, 1000, always(0)) as PlayingState;
    expect(result.mode).toBe('leaves');
    expect(result.leafPositions).toEqual([2, 3]);
    expect(result.coconutStep).toBe(3);
    expect(result.coconutTicks).toBe(7);
  });

  it('ends the game if the last life is lost to a ground obstacle', () => {
    const arriving = makePlayingState({
      mode: 'ground',
      lives: 1,
      obstacleStep: (GROUND_PATH_STEPS - 1) as 3,
      obstacleTicks: 1,
      jumpTicksRemaining: 0,
    });
    const result = update(arriving, 1000, always(0));
    expect(result.phase).toBe('game_over');
  });
});
