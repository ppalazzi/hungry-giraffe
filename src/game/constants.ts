import { LeafPosition } from './types';

export const TARGET_FPS = 30;
export const MS_PER_TICK = 1000 / TARGET_FPS;
export const INITIAL_SCORE = 0;
export const INITIAL_HIGH_SCORE = 0;

// Neck extension: 4 fixed segment positions, 0 = home (retracted) ... 3 = fully extended.
export const GIRAFFE_POSITION_COUNT = 4;
export const MIN_GIRAFFE_POSITION = 0;
export const MAX_GIRAFFE_POSITION = GIRAFFE_POSITION_COUNT - 1;
export const INITIAL_GIRAFFE_POSITION = 0;

// Leaves only ever occupy the extended positions (1..3); the home position is safe.
export const MIN_LEAF_POSITION = 1;
export const MAX_LEAF_POSITION = MAX_GIRAFFE_POSITION;
export const LEAF_POSITION_COUNT = MAX_LEAF_POSITION - MIN_LEAF_POSITION + 1;

export const INITIAL_LIVES = 3;
export const SCORE_PER_LEAF = 1;
export const LEAF_COUNT = 2; // of the 3 reachable positions hold a leaf at once

// Static initial layout for INITIAL_STATE (the start-screen snapshot).
// START_GAME re-randomizes via spawnInitialLeaves().
export const INITIAL_LEAF_POSITIONS: readonly LeafPosition[] = [1, 3];
// The monkey is a static spawner in the canopy; it has no position state.
// Coconuts fall a fixed 4-step diagonal path toward the giraffe.
export const COCONUT_PATH_STEPS = 4;
export const COCONUT_STEP_TICKS = 15; // ~0.5s per step @ 30 TPS, so a ~2s fall
export const COCONUT_RESPAWN_TICKS = 30; // ~1s between drops

// Difficulty does not ramp yet: HG-26 replaces the fixed 30fps tick with the
// 600ms -> 250ms LCD clock, which is where speed scaling belongs.
