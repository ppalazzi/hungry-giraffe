import { describe, it, expect } from 'vitest';
import { segmentsForDigit, isSegmentLit, scoreToDigits, SCORE_DIGIT_COUNT } from './sevenSegment';

describe('segmentsForDigit', () => {
  it('lights all but the middle segment for 0', () => {
    expect([...segmentsForDigit(0)].sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('lights only the two right segments for 1', () => {
    expect([...segmentsForDigit(1)].sort()).toEqual(['b', 'c']);
  });

  it('lights every segment for 8', () => {
    expect([...segmentsForDigit(8)].sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  });

  it('returns no segments for an out-of-range digit', () => {
    expect(segmentsForDigit(10)).toEqual([]);
    expect(segmentsForDigit(-1)).toEqual([]);
  });
});

describe('isSegmentLit', () => {
  it('agrees with segmentsForDigit in both directions', () => {
    for (let digit = 0; digit <= 9; digit++) {
      const lit = segmentsForDigit(digit);
      (['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).forEach((segment) => {
        expect(isSegmentLit(digit, segment)).toBe(lit.includes(segment));
      });
    }
  });
});

describe('scoreToDigits', () => {
  it('pads a single digit to the full width', () => {
    expect(scoreToDigits(7)).toEqual([0, 0, 7]);
  });

  it('splits a multi-digit score most-significant first', () => {
    expect(scoreToDigits(42)).toEqual([0, 4, 2]);
    expect(scoreToDigits(123)).toEqual([1, 2, 3]);
  });

  it('clamps at the display width rather than overflowing', () => {
    expect(scoreToDigits(10 ** SCORE_DIGIT_COUNT)).toEqual([9, 9, 9]);
    expect(scoreToDigits(999999)).toEqual([9, 9, 9]);
  });

  it('floors a fractional score and treats a negative one as zero', () => {
    expect(scoreToDigits(4.9)).toEqual([0, 0, 4]);
    expect(scoreToDigits(-5)).toEqual([0, 0, 0]);
  });

  it('produces SCORE_DIGIT_COUNT digits for every input', () => {
    [0, 5, 50, 500, 5000].forEach((score) => {
      expect(scoreToDigits(score)).toHaveLength(SCORE_DIGIT_COUNT);
    });
  });
});
