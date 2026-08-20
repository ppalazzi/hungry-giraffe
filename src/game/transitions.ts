import { GameState, GameAction, StartState, GiraffePosition } from './types';
import {
  INITIAL_SCORE,
  INITIAL_HIGH_SCORE,
  INITIAL_GIRAFFE_POSITION,
  INITIAL_LEAF_POSITIONS,
  INITIAL_ACTIVE_LEAF_POSITION,
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
  leafPositions: INITIAL_LEAF_POSITIONS,
  activeLeafPosition: INITIAL_ACTIVE_LEAF_POSITION,
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
      const { leafPositions, activeLeafPosition } = spawnInitialLeaves(random);
      return {
        phase: 'playing',
        isPaused: false,
        score: INITIAL_SCORE,
        highScore: state.highScore,
        tickCount: 0,
        lastTickTime: 0,
        deltaTime: 0,
        giraffePosition: INITIAL_GIRAFFE_POSITION as GiraffePosition,
        leafPositions,
        activeLeafPosition,
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
        leafPositions: state.leafPositions,
        activeLeafPosition: state.activeLeafPosition,
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
        leafPositions: state.leafPositions,
        activeLeafPosition: state.activeLeafPosition,
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
        leafPositions: state.leafPositions,
        activeLeafPosition: state.activeLeafPosition,
        finalScore,
        reason: action.reason,
      };
    }
    case 'MOVE_UP':
    case 'MOVE_DOWN': {
      if (state.phase !== 'playing') return state;
      const direction = action.type === 'MOVE_UP' ? 'up' : 'down';
      return {
        ...state,
        giraffePosition: moveGiraffe(state.giraffePosition, direction),
      };
    }
    case 'RESTART': {
      return { ...INITIAL_STATE, highScore: state.highScore };
    }
  }
}
