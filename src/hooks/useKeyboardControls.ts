import { useEffect } from 'react';
import { GameAction } from '../game/types';

/**
 * Maps keyboard input to game actions.
 * ArrowUp/ArrowDown move the giraffe up/down one lane; Space/Enter triggers EAT.
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
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        dispatch({ type: 'EAT' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
