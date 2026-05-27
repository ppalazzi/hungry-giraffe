import { GameState, GameAction, StartState } from './types';
import { INITIAL_SCORE, INITIAL_HIGH_SCORE } from './constants';

export const INITIAL_STATE: StartState = {
  phase: 'start',
  score: INITIAL_SCORE,
  highScore: INITIAL_HIGH_SCORE,
  tickCount: 0,
  lastTickTime: 0,
};

export function transition(
  state: GameState,
  action: GameAction,
  now: number = performance.now()
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
        finalScore,
        reason: action.reason,
      };
    }
    case 'RESTART': {
      return { ...INITIAL_STATE, highScore: state.highScore };
    }
  }
}
