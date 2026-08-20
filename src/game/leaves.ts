import { GiraffePosition } from './types';
import { GIRAFFE_POSITION_COUNT, LEAF_COUNT } from './constants';

/** Random lane not present in `exclude`. */
export function pickRandomPosition(
  exclude: readonly GiraffePosition[],
  random: () => number,
): GiraffePosition {
  const available: GiraffePosition[] = [];
  for (let i = 0; i < GIRAFFE_POSITION_COUNT; i++) {
    const position = i as GiraffePosition;
    if (!exclude.includes(position)) {
      available.push(position);
    }
  }
  const pool = available.length > 0 ? available : Array.from(
    { length: GIRAFFE_POSITION_COUNT },
    (_, i) => i as GiraffePosition,
  );
  return pool[Math.floor(random() * pool.length)];
}

/** LEAF_COUNT leaves at distinct random lanes; activeLeafPosition is one of them. */
export function spawnInitialLeaves(
  random: () => number,
): { leafPositions: GiraffePosition[]; activeLeafPosition: GiraffePosition } {
  const leafPositions: GiraffePosition[] = [];
  for (let i = 0; i < LEAF_COUNT; i++) {
    leafPositions.push(pickRandomPosition(leafPositions, random));
  }
  const activeLeafPosition = leafPositions[Math.floor(random() * leafPositions.length)];
  return { leafPositions, activeLeafPosition };
}

/** New active lane from leafPositions, different from `current` when possible. */
export function cycleActiveLeaf(
  leafPositions: readonly GiraffePosition[],
  current: GiraffePosition,
  random: () => number,
): GiraffePosition {
  const candidates = leafPositions.filter((position) => position !== current);
  const pool = candidates.length > 0 ? candidates : leafPositions;
  return pool[Math.floor(random() * pool.length)];
}

/**
 * Removes `eatenPosition`, adds one new random unused lane (keeping
 * leafPositions.length === LEAF_COUNT), and picks a new activeLeafPosition
 * from the resulting set.
 */
export function eatLeaf(
  leafPositions: readonly GiraffePosition[],
  eatenPosition: GiraffePosition,
  random: () => number,
): { leafPositions: GiraffePosition[]; activeLeafPosition: GiraffePosition } {
  const remaining = leafPositions.filter((position) => position !== eatenPosition);
  const newPosition = pickRandomPosition(remaining, random);
  const nextLeafPositions = [...remaining, newPosition];
  const activeLeafPosition = nextLeafPositions[Math.floor(random() * nextLeafPositions.length)];
  return { leafPositions: nextLeafPositions, activeLeafPosition };
}
