import { GiraffePosition, CoconutStep } from './types';
import { COCONUT_PATH_STEPS } from './constants';

/**
 * The coconut descends while the neck ascends, so the two axes are inverted
 * against each other: step 1 is level with full extension (position 3), and
 * step 4 is level with the body at home (position 0).
 */
export function coconutPositionForStep(step: CoconutStep): GiraffePosition {
  return (COCONUT_PATH_STEPS - step) as GiraffePosition;
}

/**
 * Whether a coconut at `step` strikes a giraffe whose head is at `headPosition`.
 *
 * HG-23 gives two contradictory readings. This implements the **neck-structure**
 * rule: extending to position N lights every segment from 1 up to N, and the
 * coconut hits if it passes over any of them ("if the neck remains extended,
 * the coconut will hit the neck structure on its way down"). Retracting to
 * home lights nothing and is therefore always safe.
 *
 * The alternative head-only reading ("the exact same position index") would be
 * `position === headPosition` instead of `position <= headPosition`. That is the
 * single line to change if the decision goes the other way.
 *
 * Step 4 is the landed frame at position 0; it never hits, which is what makes
 * the home position a genuine safe state.
 */
export function isCoconutHit(
  headPosition: GiraffePosition,
  step: CoconutStep,
): boolean {
  const position = coconutPositionForStep(step);
  return position >= 1 && position <= headPosition;
}

/**
 * Advances the drop by one clock tick.
 *
 * `ticks` counts down to the next transition. With no coconut in flight it is
 * the respawn delay; in flight it is the dwell time on the current step.
 */
export function advanceCoconut(
  step: CoconutStep | null,
  ticks: number,
  stepTicks: number,
  respawnTicks: number,
): { step: CoconutStep | null; ticks: number } {
  const remaining = ticks - 1;
  if (remaining > 0) return { step, ticks: remaining };

  if (step === null) return { step: 1, ticks: stepTicks };
  if (step < COCONUT_PATH_STEPS) {
    return { step: (step + 1) as CoconutStep, ticks: stepTicks };
  }
  return { step: null, ticks: respawnTicks };
}
