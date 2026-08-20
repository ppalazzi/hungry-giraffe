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
        <span>Lives: {'♥'.repeat(Math.max(0, gameState.lives))}</span>
      </div>
      <div className="giraffe-track">
        {positions.map((lane) => {
          const hasLeaf = gameState.leafPositions.includes(lane);
          const isActiveLeaf = lane === gameState.activeLeafPosition;
          const isMonkeyLane = lane === gameState.monkeyPosition;
          const isGiraffeLane = lane === gameState.giraffePosition;
          const neckExtended = isGiraffeLane && gameState.neckExtended;
          const leafEmoji = hasLeaf ? (isActiveLeaf ? '🍃' : '🌿') : '';
          const monkeyEmoji = isMonkeyLane ? '🐵' : '';
          return (
            <div key={lane} className="giraffe-row">
              <div
                className={`tree-cell ${
                  isMonkeyLane ? `tree-cell--monkey-${gameState.monkeyAction}` : ''
                }`}
              >
                {leafEmoji}
                {monkeyEmoji}
              </div>
              <div className={`neck-cell ${neckExtended ? 'neck-cell--extended' : ''}`}>
                {neckExtended ? '────' : ''}
              </div>
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
