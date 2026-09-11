import { GameAction, GameState } from '../game/types';

interface TouchControlsProps {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

/**
 * On-screen buttons for mobile: UP, DOWN and JUMP. They dispatch the exact
 * same actions as the keyboard (useKeyboardControls) — no separate input
 * path — so JUMP is a harmless no-op outside Phase 2's ground mode, per the
 * reducer's own guard.
 *
 * There is deliberately no EAT button: a leaf is cleared automatically when
 * the head lights up on its position.
 *
 * Only shown while playing — Start/Pause/Resume/Restart already have their
 * own buttons in GameOverlay, and showing UP/DOWN/JUMP on those screens
 * would just be dead clutter.
 */
export function TouchControls({ gameState, dispatch }: TouchControlsProps) {
  if (gameState.phase !== 'playing') return null;

  return (
    <div className="touch-controls">
      <button
        type="button"
        className="touch-controls__button"
        aria-label="Extend neck up"
        onClick={() => dispatch({ type: 'MOVE_UP' })}
      >
        ▲
      </button>
      <button
        type="button"
        className="touch-controls__button"
        aria-label="Retract neck down"
        onClick={() => dispatch({ type: 'MOVE_DOWN' })}
      >
        ▼
      </button>
      <button
        type="button"
        className="touch-controls__button touch-controls__button--jump"
        aria-label="Jump"
        onClick={() => dispatch({ type: 'JUMP' })}
      >
        JUMP
      </button>
    </div>
  );
}
