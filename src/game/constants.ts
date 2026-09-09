import { LeafPosition } from './types';

// The LCD clock. The game advances on this slow discrete beat, not on frames.
export const BASE_TICK_MS = 600;
export const MIN_TICK_MS = 250;
export const TICK_SPEED_SCORE_STEP = 50; // every N points the clock speeds up
export const TICK_MS_PER_SPEED_LEVEL = 50; // ms shaved per speed level

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
export const COCONUT_STEP_TICKS = 1; // one segment per clock tick
export const COCONUT_RESPAWN_TICKS = 2; // beats between drops

// Phase 2: a timed ground-obstacle interruption of the leaf-eating loop.
// HG-23 gives no exit condition at all, and its trigger figure ("every 100
// points") assumes the old +10-per-leaf scoring, which no longer applies.
// Both figures below are assumptions, confirmed as: exit on a survived-
// obstacle count rather than a fixed duration.
export const PHASE_TWO_SCORE_INTERVAL = 25; // score points between Phase 2 entries
export const PHASE_TWO_OBSTACLES_TO_CLEAR = 5; // successful jumps before returning to Phase 1
export const GROUND_PATH_STEPS = 4;
export const GROUND_STEP_TICKS = 1; // one segment per clock tick, same cadence as the coconut
export const GROUND_RESPAWN_TICKS = 2;
export const JUMP_TICKS = 2; // ticket assumption: ticks (not ms), so the window scales with the clock
