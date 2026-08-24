import { describe, it, expect } from 'vitest';
import { coconutPositionForStep, isCoconutHit, advanceCoconut } from './coconut';
import { CoconutStep } from './types';
import { COCONUT_PATH_STEPS } from './constants';

describe('coconutPositionForStep', () => {
  it('inverts the neck axis: step 1 is level with full extension', () => {
    expect(coconutPositionForStep(1)).toBe(3);
    expect(coconutPositionForStep(2)).toBe(2);
    expect(coconutPositionForStep(3)).toBe(1);
  });

  it('puts the final step at ground level', () => {
    expect(coconutPositionForStep(COCONUT_PATH_STEPS as 4)).toBe(0);
  });
});

describe('isCoconutHit', () => {
  it('never hits a giraffe retracted to home', () => {
    expect(isCoconutHit(0, 1)).toBe(false);
    expect(isCoconutHit(0, 2)).toBe(false);
    expect(isCoconutHit(0, 3)).toBe(false);
    expect(isCoconutHit(0, 4)).toBe(false);
  });

  it('hits any lit neck segment on the way down (neck-structure rule)', () => {
    // Fully extended lights segments 1, 2 and 3, so steps 1-3 all connect.
    expect(isCoconutHit(3, 1)).toBe(true);
    expect(isCoconutHit(3, 2)).toBe(true);
    expect(isCoconutHit(3, 3)).toBe(true);
  });

  it('misses segments the neck has not reached yet', () => {
    // Extended only to 1: the coconut is still above the lit part at steps 1-2.
    expect(isCoconutHit(1, 1)).toBe(false);
    expect(isCoconutHit(1, 2)).toBe(false);
    expect(isCoconutHit(1, 3)).toBe(true);
  });

  it('treats the landed frame as harmless', () => {
    expect(isCoconutHit(1, 4)).toBe(false);
    expect(isCoconutHit(3, 4)).toBe(false);
  });
});

describe('advanceCoconut', () => {
  it('counts down without changing step', () => {
    expect(advanceCoconut(2, 5, 10, 20)).toEqual({ step: 2, ticks: 4 });
  });

  it('spawns a coconut when the respawn delay elapses', () => {
    expect(advanceCoconut(null, 1, 10, 20)).toEqual({ step: 1, ticks: 10 });
  });

  it('advances to the next step when the dwell time elapses', () => {
    expect(advanceCoconut(1, 1, 10, 20)).toEqual({ step: 2, ticks: 10 });
    expect(advanceCoconut(3, 1, 10, 20)).toEqual({ step: 4, ticks: 10 });
  });

  it('despawns after the final step and starts the respawn delay', () => {
    expect(advanceCoconut(4, 1, 10, 20)).toEqual({ step: null, ticks: 20 });
  });

  it('completes a full cycle in the expected number of ticks', () => {
    let step: CoconutStep | null = null;
    let ticks = 2;
    const seen: (number | null)[] = [];
    for (let i = 0; i < 30; i++) {
      ({ step, ticks } = advanceCoconut(step, ticks, 2, 2));
      seen.push(step);
    }
    expect(seen).toContain(1);
    expect(seen).toContain(4);
    expect(seen).toContain(null);
  });
});
