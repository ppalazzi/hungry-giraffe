import { useEffect } from 'react';
import { GameAction } from '../game/types';

/**
 * Maps keyboard input to game actions.
 * ArrowUp extends the neck one segment, ArrowDown retracts it.
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
