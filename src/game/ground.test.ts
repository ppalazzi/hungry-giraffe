import { describe, it, expect } from 'vitest';
import { advanceObstacle, isObstacleAtGiraffe, obstacleColumn } from './ground';
import { GROUND_PATH_STEPS } from './constants';

describe('advanceObstacle', () => {
  it('counts down without changing step', () => {
    expect(advanceObstacle(2, 5, 10, 20)).toEqual({ step: 2, ticks: 4 });
  });

  it('spawns an obstacle when the respawn delay elapses', () => {
    expect(advanceObstacle(null, 1, 10, 20)).toEqual({ step: 1, ticks: 10 });
  });

  it('advances to the next step when the dwell time elapses', () => {
    expect(advanceObstacle(1, 1, 10, 20)).toEqual({ step: 2, ticks: 10 });
    expect(advanceObstacle(3, 1, 10, 20)).toEqual({ step: 4, ticks: 10 });
  });

  it('despawns after the final step and starts the respawn delay', () => {
    expect(advanceObstacle(4, 1, 10, 20)).toEqual({ step: null, ticks: 20 });
  });
});

describe('isObstacleAtGiraffe', () => {
  it('is false everywhere except the final step', () => {
    expect(isObstacleAtGiraffe(null)).toBe(false);
    expect(isObstacleAtGiraffe(1)).toBe(false);
    expect(isObstacleAtGiraffe(2)).toBe(false);
    expect(isObstacleAtGiraffe(3)).toBe(false);
  });

  it('is true at the final step', () => {
    expect(isObstacleAtGiraffe(GROUND_PATH_STEPS as 4)).toBe(true);
  });
});

describe('obstacleColumn', () => {
  it('arrives at the giraffe column (1) on the final step', () => {
    expect(obstacleColumn(GROUND_PATH_STEPS as 4)).toBe(1);
  });

  it('moves left by exactly one column per step', () => {
    const columns = ([1, 2, 3, 4] as const).map(obstacleColumn);
    for (let i = 1; i < columns.length; i++) {
      expect(columns[i] - columns[i - 1]).toBe(-1);
    }
  });
});
