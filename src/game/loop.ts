import { GameState } from './types';
import { MS_PER_TICK, ACTIVE_LEAF_CYCLE_TICKS, MONKEY_CYCLE_TICKS } from './constants';
import { cycleActiveLeaf } from './leaves';
import { advanceMonkeyAction, pickMonkeyPosition } from './monkey';

export function update(
  state: GameState,
  now: number,
  random: () => number = Math.random,
): GameState {
  if (state.phase !== 'playing') return state;

  const tickCount = state.tickCount + 1;

  const activeLeafPosition =
    tickCount % ACTIVE_LEAF_CYCLE_TICKS === 0
      ? cycleActiveLeaf(state.leafPositions, state.activeLeafPosition, random)
      : state.activeLeafPosition;

  const shouldAdvanceMonkey = tickCount % MONKEY_CYCLE_TICKS === 0;
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
