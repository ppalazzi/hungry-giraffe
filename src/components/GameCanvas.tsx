import { GameState, GiraffePosition } from '../game/types';
import { GIRAFFE_POSITION_COUNT } from '../game/constants';

interface GameCanvasProps {
  gameState: GameState;
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const positions = Array.from(
    { length: GIRAFFE_POSITION_COUNT },
    (_, i) => i as GiraffePosition,
  );

  return (
    <div className="game-canvas">
      <div className="game-hud">
        <span>Score: {gameState.score}</span>
      </div>
      <div className="giraffe-track">
        {positions.map((lane) => {
          const hasLeaf = gameState.leafPositions.includes(lane);
          const isActiveLeaf = lane === gameState.activeLeafPosition;
          const isGiraffeLane = lane === gameState.giraffePosition;
          const leafEmoji = hasLeaf ? (isActiveLeaf ? '🍃' : '🌿') : '';
          return (
            <div key={lane} className="giraffe-row">
              <div className="tree-cell">{leafEmoji}</div>
              <div className={`giraffe-cell ${isGiraffeLane ? 'giraffe-cell--active' : ''}`}>
                {isGiraffeLane ? '🦒' : ''}
              </div>
            </div>
          );
        })}
      </div>
      <div className="game-hud game-hud--bottom">
        <p>Phase: {gameState.phase}</p>
        <p>Tick: {gameState.tickCount}</p>
      </div>
    </div>
  );
}
