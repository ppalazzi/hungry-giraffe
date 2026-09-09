import { GameState, LeafPosition, PlayingState } from './types';
import {
  SCORE_PER_LEAF,
  COCONUT_STEP_TICKS,
  COCONUT_RESPAWN_TICKS,
  PHASE_TWO_SCORE_INTERVAL,
  PHASE_TWO_OBSTACLES_TO_CLEAR,
  GROUND_STEP_TICKS,
  GROUND_RESPAWN_TICKS,
} from './constants';
import { eatLeaf } from './leaves';
import { advanceCoconut, isCoconutHit } from './coconut';
import { advanceObstacle, isObstacleAtGiraffe } from './ground';
import { tickIntervalMs } from './clock';
import { transition } from './transitions';

export function update(
  state: GameState,
  now: number,
  random: () => number = Math.random,
): GameState {
  if (state.phase !== 'playing') return state;

  const patch = state.mode === 'ground' ? updateGroundMode(state) : updateLeavesMode(state, random);

  const next: PlayingState = {
    ...state,
    ...patch,
    tickCount: state.tickCount + 1,
    deltaTime: tickIntervalMs(patch.score ?? state.score),
    lastTickTime: now,
  };

  if (next.lives <= 0) {
    return transition(next, { type: 'GAME_OVER', reason: 'starved' }, now, random);
  }
  return next;
}

/**
 * Phase 1: eat leaves automatically on contact, dodge the falling coconut by
 * retracting. Watches the score for the next Phase 2 trigger.
 */
function updateLeavesMode(state: PlayingState, random: () => number): Partial<PlayingState> {
  const eaten = state.leafPositions.includes(state.giraffePosition as LeafPosition)
    ? (state.giraffePosition as LeafPosition)
    : null;
  const leafPositions =
    eaten === null ? state.leafPositions : eatLeaf(state.leafPositions, eaten, random);
  const score = eaten === null ? state.score : state.score + SCORE_PER_LEAF;

  const dropped = advanceCoconut(
    state.coconutStep,
    state.coconutTicks,
    COCONUT_STEP_TICKS,
    COCONUT_RESPAWN_TICKS,
  );
  const struck = dropped.step !== null && isCoconutHit(state.giraffePosition, dropped.step);

  const enteringGroundMode = score >= state.nextGroundModeScore;

  return {
    score,
    leafPositions,
    // A coconut hit or a Phase 2 entry both knock/lock the neck to home.
    giraffePosition: struck || enteringGroundMode ? 0 : state.giraffePosition,
    lives: struck ? state.lives - 1 : state.lives,
    coconutStep: struck ? null : dropped.step,
    coconutTicks: struck ? COCONUT_RESPAWN_TICKS : dropped.ticks,
    mode: enteringGroundMode ? 'ground' : 'leaves',
    nextGroundModeScore: enteringGroundMode
      ? state.nextGroundModeScore + PHASE_TWO_SCORE_INTERVAL
      : state.nextGroundModeScore,
    obstacleStep: enteringGroundMode ? null : state.obstacleStep,
    obstacleTicks: enteringGroundMode ? GROUND_RESPAWN_TICKS : state.obstacleTicks,
    obstaclesSurvived: enteringGroundMode ? 0 : state.obstaclesSurvived,
    jumpTicksRemaining: enteringGroundMode ? 0 : state.jumpTicksRemaining,
  };
}

/**
 * Phase 2: the neck is locked at home (enforced in transitions.ts, which
 * ignores MOVE_UP/MOVE_DOWN in this mode). Ground obstacles slide toward the
 * giraffe; JUMP is the only way to survive one. The coconut and leaves are
 * frozen for the duration, not reset — Phase 1 resumes exactly where it
 * paused once PHASE_TWO_OBSTACLES_TO_CLEAR have been survived.
 */
function updateGroundMode(state: PlayingState): Partial<PlayingState> {
  // Whether the giraffe is airborne *for this tick* depends on the ticks
  // remaining as the tick starts, not after counting down — a jump entering
  // its last tick (jumpTicksRemaining: 1) must still dodge a collision that
  // happens on this same tick before landing on the next one.
  const isJumping = state.jumpTicksRemaining > 0;
  const jumpTicksRemaining = Math.max(0, state.jumpTicksRemaining - 1);

  const advanced = advanceObstacle(
    state.obstacleStep,
    state.obstacleTicks,
    GROUND_STEP_TICKS,
    GROUND_RESPAWN_TICKS,
  );
  const arrived = isObstacleAtGiraffe(advanced.step);
  const dodged = arrived && isJumping;
  const hit = arrived && !isJumping;

  const obstaclesSurvived = dodged ? state.obstaclesSurvived + 1 : state.obstaclesSurvived;
  const clearedPhaseTwo = obstaclesSurvived >= PHASE_TWO_OBSTACLES_TO_CLEAR;

  return {
    lives: hit ? state.lives - 1 : state.lives,
    obstacleStep: arrived ? null : advanced.step,
    obstacleTicks: arrived ? GROUND_RESPAWN_TICKS : advanced.ticks,
    obstaclesSurvived: clearedPhaseTwo ? 0 : obstaclesSurvived,
    jumpTicksRemaining,
    mode: clearedPhaseTwo ? 'leaves' : 'ground',
  };
}
