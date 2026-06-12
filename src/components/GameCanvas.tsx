import { GameState } from '../game/types';
import { GIRAFFE_POSITION_COUNT } from '../game/constants';

interface GameCanvasProps {
  gameState: GameState;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const positions = Array.from({ length: GIRAFFE_POSITION_COUNT }, (_, i) => i);

  return (
    <div className="game-canvas">
      <div className="giraffe-track">
        {positions.map((index) => (
          <div
            key={index}
            className={
              index === gameState.giraffePosition
                ? 'giraffe-cell giraffe-cell--active'
                : 'giraffe-cell'
            }
          >
            {index === gameState.giraffePosition ? '🦒' : ''}
          </div>
        ))}
      </div>
      <div className="game-hud">
        <p>Phase: {gameState.phase}</p>
        <p>Score: {gameState.score}</p>
        <p>Tick: {gameState.tickCount}</p>
      </div>
    </div>
  );
}
