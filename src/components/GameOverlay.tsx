import { GameState, GameAction } from '../game/types';

interface GameOverlayProps {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

export function GameOverlay({ gameState, dispatch }: GameOverlayProps) {
  const { phase } = gameState;

  if (phase === 'start') {
    return <button onClick={() => dispatch({ type: 'START_GAME' })}>Start</button>;
  }
  if (phase === 'playing') {
    return <button onClick={() => dispatch({ type: 'PAUSE' })}>Pause</button>;
  }
  if (phase === 'paused') {
    return <button onClick={() => dispatch({ type: 'RESUME' })}>Resume</button>;
  }
  if (phase === 'game_over') {
    return (
      <div>
        <p>Game Over — Score: {gameState.finalScore}</p>
        <button onClick={() => dispatch({ type: 'RESTART' })}>Play Again</button>
      </div>
    );
  }
  return null;
}
