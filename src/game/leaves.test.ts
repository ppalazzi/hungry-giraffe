import { describe, it, expect } from 'vitest';
import { pickRandomPosition, spawnInitialLeaves, cycleActiveLeaf, eatLeaf } from './leaves';
import { LEAF_COUNT } from './constants';

const always = (value: number) => () => value;

describe('pickRandomPosition', () => {
  it('returns the only available position when all others are excluded', () => {
    expect(pickRandomPosition([0, 1, 2], always(0))).toBe(3);
    expect(pickRandomPosition([0, 1, 2], always(0.99))).toBe(3);
  });

  it('picks from the full range based on random()', () => {
    expect(pickRandomPosition([], always(0))).toBe(0);
    expect(pickRandomPosition([], always(0.99))).toBe(3);
  });

  it('falls back to the full range when everything is excluded', () => {
    const result = pickRandomPosition([0, 1, 2, 3], always(0));
    expect([0, 1, 2, 3]).toContain(result);
  });
});

describe('spawnInitialLeaves', () => {
  it('returns LEAF_COUNT distinct positions with activeLeafPosition among them', () => {
    const { leafPositions, activeLeafPosition } = spawnInitialLeaves(always(0));
    expect(leafPositions).toHaveLength(LEAF_COUNT);
    expect(new Set(leafPositions).size).toBe(LEAF_COUNT);
    expect(leafPositions).toContain(activeLeafPosition);
  });

  it('is deterministic given a deterministic random source', () => {
    expect(spawnInitialLeaves(always(0))).toEqual({
      leafPositions: [0, 1],
      activeLeafPosition: 0,
    });
    expect(spawnInitialLeaves(always(0.99))).toEqual({
      leafPositions: [3, 2],
      activeLeafPosition: 2,
    });
  });
});

describe('cycleActiveLeaf', () => {
  it('returns a different position when possible', () => {
    expect(cycleActiveLeaf([0, 2], 0, always(0))).toBe(2);
  });

  it('returns the same position when it is the only leaf', () => {
    expect(cycleActiveLeaf([2], 2, always(0))).toBe(2);
  });
});

describe('eatLeaf', () => {
  it('removes the eaten position and adds one new position, preserving count', () => {
    const { leafPositions, activeLeafPosition } = eatLeaf([0, 2], 0, always(0.99));
    expect(leafPositions).toHaveLength(LEAF_COUNT);
    expect(leafPositions).not.toContain(0);
    expect(leafPositions).toContain(2);
    expect(leafPositions).toContain(activeLeafPosition);
  });
});
