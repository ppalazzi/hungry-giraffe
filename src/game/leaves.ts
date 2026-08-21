import { LeafPosition } from './types';
import { MIN_LEAF_POSITION, LEAF_POSITION_COUNT, LEAF_COUNT } from './constants';

/** Random reachable position (1..3) not present in `exclude`. */
export function pickRandomPosition(
  exclude: readonly LeafPosition[],
  random: () => number,
): LeafPosition {
  const all: LeafPosition[] = [];
  for (let i = 0; i < LEAF_POSITION_COUNT; i++) {
    all.push((MIN_LEAF_POSITION + i) as LeafPosition);
  }
  const available = all.filter((position) => !exclude.includes(position));
  const pool = available.length > 0 ? available : all;
  return pool[Math.floor(random() * pool.length)];
}

/** LEAF_COUNT leaves at distinct random reachable positions. */
export function spawnInitialLeaves(random: () => number): LeafPosition[] {
  const leafPositions: LeafPosition[] = [];
  for (let i = 0; i < LEAF_COUNT; i++) {
    leafPositions.push(pickRandomPosition(leafPositions, random));
  }
  return leafPositions;
}

/**
 * Removes `eatenPosition` and reveals one new leaf at a free position, keeping
 * leafPositions.length === LEAF_COUNT.
 */
export function eatLeaf(
  leafPositions: readonly LeafPosition[],
  eatenPosition: LeafPosition,
  random: () => number,
): LeafPosition[] {
  const remaining = leafPositions.filter((position) => position !== eatenPosition);
  return [...remaining, pickRandomPosition(remaining, random)];
}
