import { GiraffePosition } from './types';
import { MIN_GIRAFFE_POSITION, MAX_GIRAFFE_POSITION } from './constants';

export type MoveDirection = 'up' | 'down';

/**
 * Snap the giraffe one fixed LCD position in the given direction.
 *
 * Movement is discrete (no interpolation): 'up' decreases the index toward the
 * top (0), 'down' increases it toward the bottom. The result is clamped to the
 * [MIN, MAX] range, enforcing the top/bottom boundaries.
 */
export function moveGiraffe(
  position: GiraffePosition,
  direction: MoveDirection,
): GiraffePosition {
  const next = direction === 'up' ? position - 1 : position + 1;
  const clamped = Math.min(
    MAX_GIRAFFE_POSITION,
    Math.max(MIN_GIRAFFE_POSITION, next),
  );
  return clamped as GiraffePosition;
}
