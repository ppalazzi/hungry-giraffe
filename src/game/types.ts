export type GamePhase = 'start' | 'playing' | 'paused' | 'game_over';

/** One of the 4 fixed vertical LCD positions: 0 = top ... 3 = bottom. */
export type GiraffePosition = 0 | 1 | 2 | 3;

export interface GameStateBase {
  readonly phase: GamePhase;
  readonly score: number;
  readonly highScore: number;
  readonly tickCount: number;
  readonly lastTickTime: number;
  readonly giraffePosition: GiraffePosition;
}

export interface StartState extends GameStateBase {
  readonly phase: 'start';
}

export interface PlayingState extends GameStateBase {
  readonly phase: 'playing';
  readonly isPaused: false;
  readonly deltaTime: number;
}

export interface PausedState extends GameStateBase {
  readonly phase: 'paused';
  readonly pausedAt: number;
}

export interface GameOverState extends GameStateBase {
  readonly phase: 'game_over';
  readonly finalScore: number;
  readonly reason: 'starved' | 'timeout';
}

export type GameState = StartState | PlayingState | PausedState | GameOverState;

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAME_OVER'; reason: GameOverState['reason'] }
  | { type: 'RESTART' }
  | { type: 'MOVE_UP' }
  | { type: 'MOVE_DOWN' };
