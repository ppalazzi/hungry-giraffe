import {
  BASE_TICK_MS,
  MIN_TICK_MS,
  TICK_SPEED_SCORE_STEP,
  TICK_MS_PER_SPEED_LEVEL,
} from './constants';

/**
 * Length of one LCD clock tick at the given score.
 *
 * The handheld runs on a slow, discrete beat rather than an animation frame
 * loop: it starts at BASE_TICK_MS and shortens by TICK_MS_PER_SPEED_LEVEL for
 * every TICK_SPEED_SCORE_STEP points, down to a floor of MIN_TICK_MS.
 *
 * Everything — coconut steps, leaf changes, obstacle movement — advances on
 * this single tick, so the whole game accelerates together.
 */
export function tickIntervalMs(score: number): number {
  const level = Math.floor(Math.max(0, score) / TICK_SPEED_SCORE_STEP);
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - level * TICK_MS_PER_SPEED_LEVEL);
}
