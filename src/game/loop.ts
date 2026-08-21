import { GameState, LeafPosition } from './types';
import {
  MS_PER_TICK,
  SCORE_PER_LEAF,
  BASE_MONKEY_CYCLE_TICKS,
  MIN_CYCLE_TICKS,
  SPEED_SCORE_STEP,
  CYCLE_TICKS_PER_SPEED_LEVEL,
} from './constants';
import { eatLeaf } from './leaves';
import { advanceMonkeyAction, pickMonkeyPosition } from './monkey';

export function update(
  state: GameState,
  now: number,
  random: () => number = Math.random,
): GameState {
  if (state.phase !== 'playing') return state;

  const tickCount = state.tickCount + 1;

  // Eating is automatic: the leaf is cleared when the head segment lights up on
  // the same position. There is no eat action to press.
  const eaten = state.leafPositions.includes(state.giraffePosition as LeafPosition)
    ? (state.giraffePosition as LeafPosition)
    : null;
  const leafPositions =
    eaten === null ? state.leafPositions : eatLeaf(state.leafPositions, eaten, random);
  const score = eaten === null ? state.score : state.score + SCORE_PER_LEAF;

  const monkeyCycle = effectiveCycleTicks(BASE_MONKEY_CYCLE_TICKS, score);
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
    score,
    leafPositions,
    monkeyAction,
    monkeyPosition,
  };
}

function effectiveCycleTicks(base: number, score: number): number {
  const reduction = Math.floor(score / SPEED_SCORE_STEP) * CYCLE_TICKS_PER_SPEED_LEVEL;
  return Math.max(MIN_CYCLE_TICKS, base - reduction);
}
