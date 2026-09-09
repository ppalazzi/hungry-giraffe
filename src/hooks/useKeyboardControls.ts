import { useEffect } from 'react';
import { GameAction } from '../game/types';

/**
 * Maps keyboard input to game actions.
 * ArrowUp extends the neck one segment, ArrowDown retracts it.
 * Space triggers JUMP — a no-op outside Phase 2's ground mode, per the
 * reducer's own guard, so it's safe to always dispatch it.
 *
 * There is deliberately no eat key: a leaf is cleared automatically when the
 * head lights up on its position.
 *
 * `dispatch` from `useGameLoop` is stable (useCallback), so the listener is
 * attached once and cleaned up on unmount.
 */
export function useKeyboardControls(dispatch: (action: GameAction) => void): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        dispatch({ type: 'MOVE_UP' });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        dispatch({ type: 'MOVE_DOWN' });
      } else if (event.key === ' ') {
        event.preventDefault();
        dispatch({ type: 'JUMP' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
