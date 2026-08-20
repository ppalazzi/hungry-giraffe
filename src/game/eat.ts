import { GiraffePosition, PlayingState } from './types';
import { SCORE_PER_LEAF } from './constants';
import { isMonkeyThreatening } from './monkey';
import { eatLeaf } from './leaves';

export interface EatResult {
  score: number;
  lives: number;
  leafPositions: readonly GiraffePosition[];
  activeLeafPosition: GiraffePosition;
  neckExtended: true;
}

/**
 * Resolution order:
 * 1. Monkey threatening (blocking/attacking) at the giraffe's current lane
 *    -> lose a life, no score change, leaves unchanged.
 * 2. giraffePosition === activeLeafPosition -> eat: score += SCORE_PER_LEAF,
 *    leafPositions/activeLeafPosition updated via eatLeaf().
 * 3. Otherwise -> miss: lose a life, leaves unchanged.
 */
export function resolveEat(state: PlayingState, random: () => number): EatResult {
  const monkeyBlocksGiraffe =
    state.monkeyPosition === state.giraffePosition && isMonkeyThreatening(state.monkeyAction);

  if (monkeyBlocksGiraffe) {
    return {
      score: state.score,
      lives: state.lives - 1,
      leafPositions: state.leafPositions,
      activeLeafPosition: state.activeLeafPosition,
      neckExtended: true,
    };
  }

  if (state.giraffePosition === state.activeLeafPosition) {
    const { leafPositions, activeLeafPosition } = eatLeaf(
      state.leafPositions,
      state.activeLeafPosition,
      random,
    );
    return {
      score: state.score + SCORE_PER_LEAF,
      lives: state.lives,
      leafPositions,
      activeLeafPosition,
      neckExtended: true,
    };
  }

  return {
    score: state.score,
    lives: state.lives - 1,
    leafPositions: state.leafPositions,
    activeLeafPosition: state.activeLeafPosition,
    neckExtended: true,
  };
}
