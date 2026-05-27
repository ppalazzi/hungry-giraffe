import { GameState } from './types';
import { MS_PER_TICK } from './constants';

export function update(state: GameState, now: number): GameState {
  if (state.phase !== 'playing') return state;

  return {
    ...state,
    tickCount: state.tickCount + 1,
    deltaTime: MS_PER_TICK,
    lastTickTime: now,
  };
}
