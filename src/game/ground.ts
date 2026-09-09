import { ObstacleStep } from './types';
import { GROUND_PATH_STEPS, GIRAFFE_POSITION_COUNT } from './constants';

/**
 * Advances a ground obstacle by one clock tick.
 *
 * Same stepped-path shape as the coconut's advanceCoconut(): `ticks` counts
 * down to the next transition, the respawn delay with no obstacle in flight
 * or the dwell time on the current step otherwise.
 */
export function advanceObstacle(
  step: ObstacleStep | null,
  ticks: number,
  stepTicks: number,
  respawnTicks: number,
): { step: ObstacleStep | null; ticks: number } {
  const remaining = ticks - 1;
  if (remaining > 0) return { step, ticks: remaining };

  if (step === null) return { step: 1, ticks: stepTicks };
  if (step < GROUND_PATH_STEPS) {
    return { step: (step + 1) as ObstacleStep, ticks: stepTicks };
  }
  return { step: null, ticks: respawnTicks };
}

/**
 * The obstacle only threatens the giraffe once it reaches the final,
 * leftmost segment — the ground lane has no extension axis to climb, so
 * unlike the coconut there is nothing to hit before that.
 */
export function isObstacleAtGiraffe(step: ObstacleStep | null): boolean {
  return step === GROUND_PATH_STEPS;
}

/**
 * Grid column for a step, purely for rendering: the obstacle spawns one
 * column short of the tree and slides left one column per step, arriving at
 * the giraffe's column (1) on the step that triggers a collision check.
 */
export function obstacleColumn(step: ObstacleStep): number {
  const treeColumn = GIRAFFE_POSITION_COUNT + 1;
  return treeColumn - step;
}
