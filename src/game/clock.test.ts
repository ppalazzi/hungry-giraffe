import { describe, it, expect } from 'vitest';
import { tickIntervalMs } from './clock';
import {
  BASE_TICK_MS,
  MIN_TICK_MS,
  TICK_SPEED_SCORE_STEP,
  TICK_MS_PER_SPEED_LEVEL,
} from './constants';

describe('tickIntervalMs', () => {
  it('runs at the base interval before the first speed boundary', () => {
    expect(tickIntervalMs(0)).toBe(BASE_TICK_MS);
    expect(tickIntervalMs(TICK_SPEED_SCORE_STEP - 1)).toBe(BASE_TICK_MS);
  });

  it('shortens by one level exactly at each boundary', () => {
    expect(tickIntervalMs(TICK_SPEED_SCORE_STEP)).toBe(
      BASE_TICK_MS - TICK_MS_PER_SPEED_LEVEL,
    );
    expect(tickIntervalMs(TICK_SPEED_SCORE_STEP * 2)).toBe(
      BASE_TICK_MS - TICK_MS_PER_SPEED_LEVEL * 2,
    );
  });

  it('never drops below the floor', () => {
    expect(tickIntervalMs(100000)).toBe(MIN_TICK_MS);
  });

  it('reaches the floor and stays there', () => {
    const levelsToFloor = (BASE_TICK_MS - MIN_TICK_MS) / TICK_MS_PER_SPEED_LEVEL;
    const scoreAtFloor = levelsToFloor * TICK_SPEED_SCORE_STEP;
    expect(tickIntervalMs(scoreAtFloor)).toBe(MIN_TICK_MS);
    expect(tickIntervalMs(scoreAtFloor + TICK_SPEED_SCORE_STEP)).toBe(MIN_TICK_MS);
  });

  it('decreases monotonically as the score rises', () => {
    let previous = tickIntervalMs(0);
    for (let score = 0; score <= 500; score += 10) {
      const current = tickIntervalMs(score);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('treats a negative score as zero rather than speeding up', () => {
    expect(tickIntervalMs(-50)).toBe(BASE_TICK_MS);
  });
});
