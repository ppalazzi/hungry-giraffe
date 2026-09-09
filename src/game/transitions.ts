import { GameState, GameAction, StartState, GiraffePosition } from './types';
import {
  INITIAL_SCORE,
  INITIAL_HIGH_SCORE,
  INITIAL_GIRAFFE_POSITION,
  INITIAL_LIVES,
  INITIAL_LEAF_POSITIONS,
  COCONUT_RESPAWN_TICKS,
  PHASE_TWO_SCORE_INTERVAL,
  GROUND_RESPAWN_TICKS,
  JUMP_TICKS,
} from './constants';
import { moveGiraffe } from './movement';
import { spawnInitialLeaves } from './leaves';

export const INITIAL_STATE: StartState = {
  phase: 'start',
  score: INITIAL_SCORE,
  highScore: INITIAL_HIGH_SCORE,
  tickCount: 0,
  lastTickTime: 0,
  giraffePosition: INITIAL_GIRAFFE_POSITION as GiraffePosition,
  lives: INITIAL_LIVES,
  leafPositions: INITIAL_LEAF_POSITIONS,
  coconutStep: null,
  coconutTicks: COCONUT_RESPAWN_TICKS,
  mode: 'leaves',
  nextGroundModeScore: PHASE_TWO_SCORE_INTERVAL,
  obstacleStep: null,
  obstacleTicks: GROUND_RESPAWN_TICKS,
  obstaclesSurvived: 0,
  jumpTicksRemaining: 0,
};

export function transition(
  state: GameState,
  action: GameAction,
  now: number = performance.now(),
  random: () => number = Math.random,
): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'start' && state.phase !== 'game_over') return state;
      return {
        phase: 'playing',
        isPaused: false,
        score: INITIAL_SCORE,
        highScore: state.highScore,
        tickCount: 0,
        lastTickTime: 0,
        deltaTime: 0,
        giraffePosition: INITIAL_GIRAFFE_POSITION as GiraffePosition,
        lives: INITIAL_LIVES,
        leafPositions: spawnInitialLeaves(random),
        coconutStep: null,
        coconutTicks: COCONUT_RESPAWN_TICKS,
        mode: 'leaves',
        nextGroundModeScore: PHASE_TWO_SCORE_INTERVAL,
        obstacleStep: null,
        obstacleTicks: GROUND_RESPAWN_TICKS,
        obstaclesSurvived: 0,
        jumpTicksRemaining: 0,
      };
    }
    case 'PAUSE': {
      if (state.phase !== 'playing') return state;
      return {
        phase: 'paused',
        score: state.score,
        highScore: state.highScore,
        tickCount: state.tickCount,
        lastTickTime: state.lastTickTime,
        giraffePosition: state.giraffePosition,
        lives: state.lives,
        leafPositions: state.leafPositions,
        coconutStep: state.coconutStep,
        coconutTicks: state.coconutTicks,
        mode: state.mode,
        nextGroundModeScore: state.nextGroundModeScore,
        obstacleStep: state.obstacleStep,
        obstacleTicks: state.obstacleTicks,
        obstaclesSurvived: state.obstaclesSurvived,
        jumpTicksRemaining: state.jumpTicksRemaining,
        pausedAt: now,
      };
    }
    case 'RESUME': {
      if (state.phase !== 'paused') return state;
      return {
        phase: 'playing',
        isPaused: false,
        score: state.score,
        highScore: state.highScore,
        tickCount: state.tickCount,
        lastTickTime: now,
        deltaTime: 0,
        giraffePosition: state.giraffePosition,
        lives: state.lives,
        leafPositions: state.leafPositions,
        coconutStep: state.coconutStep,
        coconutTicks: state.coconutTicks,
        mode: state.mode,
        nextGroundModeScore: state.nextGroundModeScore,
        obstacleStep: state.obstacleStep,
        obstacleTicks: state.obstacleTicks,
        obstaclesSurvived: state.obstaclesSurvived,
        jumpTicksRemaining: state.jumpTicksRemaining,
      };
    }
    case 'GAME_OVER': {
      if (state.phase !== 'playing') return state;
      const finalScore = state.score;
      return {
        phase: 'game_over',
        score: finalScore,
        highScore: Math.max(finalScore, state.highScore),
        tickCount: state.tickCount,
        lastTickTime: state.lastTickTime,
        giraffePosition: state.giraffePosition,
        lives: state.lives,
        leafPositions: state.leafPositions,
        coconutStep: state.coconutStep,
        coconutTicks: state.coconutTicks,
        mode: state.mode,
        nextGroundModeScore: state.nextGroundModeScore,
        obstacleStep: state.obstacleStep,
        obstacleTicks: state.obstacleTicks,
        obstaclesSurvived: state.obstaclesSurvived,
        jumpTicksRemaining: state.jumpTicksRemaining,
        finalScore,
        reason: action.reason,
      };
    }
    case 'MOVE_UP':
    case 'MOVE_DOWN': {
      // The neck locks at home during Phase 2 — HG-23's "Neck Lock".
      if (state.phase !== 'playing' || state.mode === 'ground') return state;
      const direction = action.type === 'MOVE_UP' ? 'up' : 'down';
      return {
        ...state,
        giraffePosition: moveGiraffe(state.giraffePosition, direction),
      };
    }
    case 'JUMP': {
      if (state.phase !== 'playing' || state.mode !== 'ground') return state;
      if (state.jumpTicksRemaining > 0) return state;
      return { ...state, jumpTicksRemaining: JUMP_TICKS };
    }
    case 'RESTART': {
      return { ...INITIAL_STATE, highScore: state.highScore };
    }
  }
}
