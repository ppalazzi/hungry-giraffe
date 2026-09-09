/**
 * Segments of a classic 7-segment digit display:
 *
 *    _a_
 *   f   b
 *    _g_
 *   e   c
 *    _d_
 */
export type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

const DIGIT_SEGMENTS: Readonly<Record<number, readonly Segment[]>> = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'd', 'e', 'g'],
  3: ['a', 'b', 'c', 'd', 'g'],
  4: ['b', 'c', 'f', 'g'],
  5: ['a', 'c', 'd', 'f', 'g'],
  6: ['a', 'c', 'd', 'e', 'f', 'g'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};

export function segmentsForDigit(digit: number): readonly Segment[] {
  return DIGIT_SEGMENTS[digit] ?? [];
}

export function isSegmentLit(digit: number, segment: Segment): boolean {
  return segmentsForDigit(digit).includes(segment);
}

export const SCORE_DIGIT_COUNT = 3;
const MAX_DISPLAYABLE_SCORE = 10 ** SCORE_DIGIT_COUNT - 1;

/**
 * Score split into SCORE_DIGIT_COUNT digits, most significant first, for a
 * fixed-width 7-segment readout. Clamped rather than overflowing the display.
 */
export function scoreToDigits(score: number): number[] {
  const clamped = Math.max(0, Math.min(MAX_DISPLAYABLE_SCORE, Math.floor(score)));
  return String(clamped)
    .padStart(SCORE_DIGIT_COUNT, '0')
    .split('')
    .map(Number);
}
