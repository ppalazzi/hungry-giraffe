import { GiraffePosition } from './types';
import { MIN_GIRAFFE_POSITION, MAX_GIRAFFE_POSITION } from './constants';

export type MoveDirection = 'up' | 'down';

/**
 * Extend or retract the neck by exactly one segment.
 *
 * The axis runs from the body outward: 'up' extends toward the tree (higher
 * index), 'down' retracts toward home (0). Movement is discrete — no
 * interpolation — and clamped to [MIN, MAX].
 */
export function moveGiraffe(
  position: GiraffePosition,
  direction: MoveDirection,
): GiraffePosition {
  const next = direction === 'up' ? position + 1 : position - 1;
  const clamped = Math.min(
    MAX_GIRAFFE_POSITION,
    Math.max(MIN_GIRAFFE_POSITION, next),
  );
  return clamped as GiraffePosition;
}
