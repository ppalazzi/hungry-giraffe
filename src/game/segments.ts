import { GiraffePosition } from './types';
import { MIN_GIRAFFE_POSITION, MAX_GIRAFFE_POSITION } from './constants';

/**
 * Cell on the segment grid occupied by a neck position.
 *
 * The body is fixed at the bottom-left and the neck runs diagonally up and to
 * the right, so each step out is one row up and one column right. Row and
 * column are 1-based to line up with CSS grid lines.
 */
export interface GridCell {
  readonly row: number;
  readonly column: number;
}

/** Positions ordered as they appear on screen, fully extended first. */
export const POSITIONS_TOP_DOWN: readonly GiraffePosition[] = [3, 2, 1, 0];

export function cellForPosition(position: GiraffePosition): GridCell {
  return {
    row: MAX_GIRAFFE_POSITION - position + 1,
    column: position + 1,
  };
}

/**
 * Whether the neck segment at `position` is lit for a head at `headPosition`.
 *
 * Extending to N lights every segment from 1 up to N. Position 0 is the body
 * rather than a neck segment, so it is never "lit" in this sense — which is
 * exactly why a retracted giraffe cannot be struck.
 */
export function isNeckSegmentLit(
  position: GiraffePosition,
  headPosition: GiraffePosition,
): boolean {
  return position > MIN_GIRAFFE_POSITION && position <= headPosition;
}

/** Every lit neck segment, nearest the body first. */
export function litNeckSegments(headPosition: GiraffePosition): GiraffePosition[] {
  const lit: GiraffePosition[] = [];
  for (let i = MIN_GIRAFFE_POSITION + 1; i <= MAX_GIRAFFE_POSITION; i++) {
    const position = i as GiraffePosition;
    if (isNeckSegmentLit(position, headPosition)) lit.push(position);
  }
  return lit;
}
