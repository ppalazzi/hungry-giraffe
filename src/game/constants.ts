import { LeafPosition, MonkeyAction } from './types';

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
export const INITIAL_MONKEY_POSITION = 3;
export const INITIAL_MONKEY_ACTION: MonkeyAction = 'idle';

// Monkey cycle timing, scaled down as score rises.
export const BASE_MONKEY_CYCLE_TICKS = 45; // ~1.5s @ 30 TPS
export const MIN_CYCLE_TICKS = 15; // ~0.5s floor

export const SPEED_SCORE_STEP = 100; // every N points, speed increases
export const CYCLE_TICKS_PER_SPEED_LEVEL = 5; // reduction per speed level
