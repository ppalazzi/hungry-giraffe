import { GameState } from './types';
import { MS_PER_TICK, ACTIVE_LEAF_CYCLE_TICKS } from './constants';
import { cycleActiveLeaf } from './leaves';

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

  return {
    ...state,
    tickCount,
    deltaTime: MS_PER_TICK,
    lastTickTime: now,
    activeLeafPosition,
  };
}
