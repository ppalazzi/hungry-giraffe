import { describe, it, expect } from 'vitest';
import {
  cellForPosition,
  isNeckSegmentLit,
  litNeckSegments,
  POSITIONS_TOP_DOWN,
} from './segments';

describe('cellForPosition', () => {
  it('puts the body at the bottom-left', () => {
    expect(cellForPosition(0)).toEqual({ row: 4, column: 1 });
  });

  it('puts full extension at the top, further right', () => {
    expect(cellForPosition(3)).toEqual({ row: 1, column: 4 });
  });

  it('steps one row up and one column right per segment', () => {
    expect(cellForPosition(1)).toEqual({ row: 3, column: 2 });
    expect(cellForPosition(2)).toEqual({ row: 2, column: 3 });
  });

  it('is strictly diagonal across every position', () => {
    const cells = POSITIONS_TOP_DOWN.map(cellForPosition);
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i].row - cells[i - 1].row).toBe(1);
      expect(cells[i].column - cells[i - 1].column).toBe(-1);
    }
  });
});

describe('isNeckSegmentLit', () => {
  it('lights nothing when retracted home', () => {
    expect(isNeckSegmentLit(1, 0)).toBe(false);
    expect(isNeckSegmentLit(2, 0)).toBe(false);
    expect(isNeckSegmentLit(3, 0)).toBe(false);
  });

  it('lights every segment up to the head', () => {
    expect(isNeckSegmentLit(1, 2)).toBe(true);
    expect(isNeckSegmentLit(2, 2)).toBe(true);
    expect(isNeckSegmentLit(3, 2)).toBe(false);
  });

  it('never treats the body position as a lit segment', () => {
    expect(isNeckSegmentLit(0, 0)).toBe(false);
    expect(isNeckSegmentLit(0, 3)).toBe(false);
  });
});

describe('litNeckSegments', () => {
  it('lights exactly as many segments as the head is extended', () => {
    expect(litNeckSegments(0)).toEqual([]);
    expect(litNeckSegments(1)).toEqual([1]);
    expect(litNeckSegments(2)).toEqual([1, 2]);
    expect(litNeckSegments(3)).toEqual([1, 2, 3]);
  });

  it('counts segments equal to the head position', () => {
    ([0, 1, 2, 3] as const).forEach((head) => {
      expect(litNeckSegments(head)).toHaveLength(head);
    });
  });
});
