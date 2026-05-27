import { GameState } from '../game/types';

interface GameCanvasProps {
  gameState: GameState;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  return (
    <div className="game-canvas">
      <p>Phase: {gameState.phase}</p>
      <p>Score: {gameState.score}</p>
      <p>Tick: {gameState.tickCount}</p>
    </div>
  );
}
