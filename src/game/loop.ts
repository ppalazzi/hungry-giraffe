import { GameState, LeafPosition, PlayingState } from './types';
import {
  MS_PER_TICK,
  SCORE_PER_LEAF,
  COCONUT_STEP_TICKS,
  COCONUT_RESPAWN_TICKS,
} from './constants';
import { eatLeaf } from './leaves';
import { advanceCoconut, isCoconutHit } from './coconut';
import { transition } from './transitions';

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

  const dropped = advanceCoconut(
    state.coconutStep,
    state.coconutTicks,
    COCONUT_STEP_TICKS,
    COCONUT_RESPAWN_TICKS,
  );

  const struck =
    dropped.step !== null && isCoconutHit(state.giraffePosition, dropped.step);

  const next: PlayingState = {
    ...state,
    tickCount,
    deltaTime: MS_PER_TICK,
    lastTickTime: now,
    score,
    leafPositions,
    // A hit consumes the coconut so it cannot strike twice, and knocks the neck
    // back to home — the player has to climb again.
    giraffePosition: struck ? 0 : state.giraffePosition,
    lives: struck ? state.lives - 1 : state.lives,
    coconutStep: struck ? null : dropped.step,
    coconutTicks: struck ? COCONUT_RESPAWN_TICKS : dropped.ticks,
  };

  if (next.lives <= 0) {
    return transition(next, { type: 'GAME_OVER', reason: 'starved' }, now, random);
  }
  return next;
}
