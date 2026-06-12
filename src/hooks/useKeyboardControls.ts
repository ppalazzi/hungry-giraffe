import { useEffect } from 'react';
import { GameAction } from '../game/types';

/**
 * Maps the keyboard arrow keys to discrete giraffe movement actions.
 * ArrowUp moves the giraffe up one position, ArrowDown moves it down.
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
