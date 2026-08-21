import { describe, it, expect } from 'vitest';
import { pickRandomPosition, spawnInitialLeaves, eatLeaf } from './leaves';
import { LEAF_COUNT, MIN_LEAF_POSITION } from './constants';

const always = (value: number) => () => value;

describe('pickRandomPosition', () => {
  it('never returns the home position', () => {
    expect(pickRandomPosition([], always(0))).toBeGreaterThanOrEqual(MIN_LEAF_POSITION);
    expect(pickRandomPosition([], always(0.99))).toBeGreaterThanOrEqual(MIN_LEAF_POSITION);
  });

  it('returns the only available position when the others are excluded', () => {
    expect(pickRandomPosition([1, 2], always(0))).toBe(3);
    expect(pickRandomPosition([1, 2], always(0.99))).toBe(3);
  });

  it('picks across the reachable range based on random()', () => {
    expect(pickRandomPosition([], always(0))).toBe(1);
    expect(pickRandomPosition([], always(0.99))).toBe(3);
  });

  it('falls back to the full range when everything is excluded', () => {
    expect([1, 2, 3]).toContain(pickRandomPosition([1, 2, 3], always(0)));
  });
});

describe('spawnInitialLeaves', () => {
  it('returns LEAF_COUNT distinct reachable positions', () => {
    const leafPositions = spawnInitialLeaves(always(0));
    expect(leafPositions).toHaveLength(LEAF_COUNT);
    expect(new Set(leafPositions).size).toBe(LEAF_COUNT);
    leafPositions.forEach((position) => {
      expect(position).toBeGreaterThanOrEqual(MIN_LEAF_POSITION);
    });
  });

  it('is deterministic given a deterministic random source', () => {
    expect(spawnInitialLeaves(always(0))).toEqual([1, 2]);
    expect(spawnInitialLeaves(always(0.99))).toEqual([3, 2]);
  });
});

describe('eatLeaf', () => {
  it('removes the eaten position and reveals a new one, preserving count', () => {
    const leafPositions = eatLeaf([1, 3], 1, always(0.99));
    expect(leafPositions).toHaveLength(LEAF_COUNT);
    expect(leafPositions).not.toContain(1);
    expect(leafPositions).toContain(3);
  });

  it('never reveals a leaf at the home position', () => {
    const leafPositions = eatLeaf([1, 3], 3, always(0));
    leafPositions.forEach((position) => {
      expect(position).toBeGreaterThanOrEqual(MIN_LEAF_POSITION);
    });
  });
});
