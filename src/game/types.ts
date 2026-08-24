export type GamePhase = 'start' | 'playing' | 'paused' | 'game_over';

/**
 * Neck extension, not a lane. The giraffe body is fixed at the bottom-left of
 * the segment grid and "movement" lights consecutive neck segments toward the
 * tree:
 *
 *   0 = home / fully retracted (safe; never holds a leaf)
 *   1 = mid-low, 2 = mid-high, 3 = fully extended (top-centre)
 */
export type GiraffePosition = 0 | 1 | 2 | 3;

/** The extended positions only — leaves can never appear at the home position. */
export type LeafPosition = Exclude<GiraffePosition, 0>;

/**
 * Position of a falling coconut along its fixed diagonal path.
 *   1 = top-right, beside the monkey
 *   2 = mid-high air (centre-right)
 *   3 = mid-low air (centre-left)
 *   4 = ground level / impact zone (bottom-left)
 */
export type CoconutStep = 1 | 2 | 3 | 4;

export interface GameStateBase {
  readonly phase: GamePhase;
  readonly score: number;
  readonly highScore: number;
  readonly tickCount: number;
  readonly lastTickTime: number;
  readonly giraffePosition: GiraffePosition;
  readonly lives: number;
  readonly leafPositions: readonly LeafPosition[];
  readonly coconutStep: CoconutStep | null;
  readonly coconutTicks: number;
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

/** The neck is lit whenever the head is away from home. */
export function isNeckExtended(position: GiraffePosition): boolean {
  return position > 0;
}
