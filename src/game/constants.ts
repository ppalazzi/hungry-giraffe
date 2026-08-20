import { GiraffePosition } from './types';

export const TARGET_FPS = 30;
export const MS_PER_TICK = 1000 / TARGET_FPS;
export const INITIAL_SCORE = 0;
export const INITIAL_HIGH_SCORE = 0;

// Giraffe vertical movement: 4 fixed LCD positions, 0 = top ... 3 = bottom.
export const GIRAFFE_POSITION_COUNT = 4;
export const MIN_GIRAFFE_POSITION = 0;
export const MAX_GIRAFFE_POSITION = GIRAFFE_POSITION_COUNT - 1;
export const INITIAL_GIRAFFE_POSITION = 0;

export const LEAF_COUNT = 2; // of GIRAFFE_POSITION_COUNT (4) lanes have a leaf at once

// Static initial layout for INITIAL_STATE (the start-screen snapshot).
// START_GAME re-randomizes via spawnInitialLeaves().
export const INITIAL_LEAF_POSITIONS: readonly GiraffePosition[] = [0, 2];
export const INITIAL_ACTIVE_LEAF_POSITION: GiraffePosition = 0;

// How often the active leaf moves to another lane.
export const ACTIVE_LEAF_CYCLE_TICKS = 60; // ~2s @ 30 TPS
