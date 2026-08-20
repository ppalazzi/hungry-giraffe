import { GameState } from './types';
import {
  MS_PER_TICK,
  BASE_ACTIVE_LEAF_CYCLE_TICKS,
  BASE_MONKEY_CYCLE_TICKS,
  MIN_CYCLE_TICKS,
  SPEED_SCORE_STEP,
  CYCLE_TICKS_PER_SPEED_LEVEL,
} from './constants';
import { cycleActiveLeaf } from './leaves';
import { advanceMonkeyAction, pickMonkeyPosition } from './monkey';

export function update(
  state: GameState,
  now: number,
  random: () => number = Math.random,
): GameState {
  if (state.phase !== 'playing') return state;

  const tickCount = state.tickCount + 1;

  const leafCycle = effectiveCycleTicks(BASE_ACTIVE_LEAF_CYCLE_TICKS, state.score);
  const activeLeafPosition =
    tickCount % leafCycle === 0
      ? cycleActiveLeaf(state.leafPositions, state.activeLeafPosition, random)
      : state.activeLeafPosition;

  const monkeyCycle = effectiveCycleTicks(BASE_MONKEY_CYCLE_TICKS, state.score);
  const shouldAdvanceMonkey = tickCount % monkeyCycle === 0;
  const monkeyAction = shouldAdvanceMonkey
    ? advanceMonkeyAction(state.monkeyAction)
    : state.monkeyAction;
  const monkeyPosition =
    shouldAdvanceMonkey && monkeyAction === 'moving'
      ? pickMonkeyPosition(random)
      : state.monkeyPosition;

  return {
    ...state,
    tickCount,
    deltaTime: MS_PER_TICK,
    lastTickTime: now,
    activeLeafPosition,
    monkeyAction,
    monkeyPosition,
    neckExtended: false,
  };
}

function effectiveCycleTicks(base: number, score: number): number {
  const reduction = Math.floor(score / SPEED_SCORE_STEP) * CYCLE_TICKS_PER_SPEED_LEVEL;
  return Math.max(MIN_CYCLE_TICKS, base - reduction);
}
