import { GiraffePosition, MonkeyAction } from './types';

export const TARGET_FPS = 30;
export const MS_PER_TICK = 1000 / TARGET_FPS;
export const INITIAL_SCORE = 0;
export const INITIAL_HIGH_SCORE = 0;

// Giraffe vertical movement: 4 fixed LCD positions, 0 = top ... 3 = bottom.
export const GIRAFFE_POSITION_COUNT = 4;
export const MIN_GIRAFFE_POSITION = 0;
export const MAX_GIRAFFE_POSITION = GIRAFFE_POSITION_COUNT - 1;
export const INITIAL_GIRAFFE_POSITION = 0;

export const INITIAL_LIVES = 3;
export const SCORE_PER_LEAF = 10;
export const LEAF_COUNT = 2; // of GIRAFFE_POSITION_COUNT (4) lanes have a leaf at once

// Static initial layout for INITIAL_STATE (the start-screen snapshot).
// START_GAME re-randomizes via spawnInitialLeaves().
export const INITIAL_LEAF_POSITIONS: readonly GiraffePosition[] = [0, 2];
export const INITIAL_ACTIVE_LEAF_POSITION: GiraffePosition = 0;
export const INITIAL_MONKEY_POSITION: GiraffePosition = 3;
export const INITIAL_MONKEY_ACTION: MonkeyAction = 'idle';

// Active-leaf / monkey cycle timing, scaled down as score rises.
export const BASE_ACTIVE_LEAF_CYCLE_TICKS = 60; // ~2s @ 30 TPS
export const BASE_MONKEY_CYCLE_TICKS = 45; // ~1.5s
export const MIN_CYCLE_TICKS = 15; // ~0.5s floor

export const SPEED_SCORE_STEP = 100; // every N points, speed increases
export const CYCLE_TICKS_PER_SPEED_LEVEL = 5; // reduction per speed level
