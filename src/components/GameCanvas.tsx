import { GameState, GiraffePosition, LeafPosition, isNeckExtended } from '../game/types';
import { MIN_GIRAFFE_POSITION, MAX_GIRAFFE_POSITION } from '../game/constants';

interface GameCanvasProps {
  gameState: GameState;
}

/** Highest extension first, so position 0 (home) renders at the bottom. */
const POSITIONS: GiraffePosition[] = [];
for (let i = MAX_GIRAFFE_POSITION; i >= MIN_GIRAFFE_POSITION; i--) {
  POSITIONS.push(i as GiraffePosition);
}

export function GameCanvas({ gameState }: GameCanvasProps) {
  const extended = isNeckExtended(gameState.giraffePosition);

  return (
    <div className="game-canvas">
      <div className="game-hud">
        <span>Score: {gameState.score}</span>
        <span>Lives: {'♥'.repeat(Math.max(0, gameState.lives))}</span>
      </div>
      <div className="giraffe-track">
        {POSITIONS.map((position) => {
          const isHome = position === MIN_GIRAFFE_POSITION;
          const hasLeaf = gameState.leafPositions.includes(position as LeafPosition);
          const isMonkeyPosition = position === gameState.monkeyPosition;
          const isHead = position === gameState.giraffePosition;
          // The neck lights every segment from home up to the head.
          const isNeckSegment = extended && position > 0 && position <= gameState.giraffePosition;
          return (
            <div key={position} className={`giraffe-row ${isHome ? 'giraffe-row--home' : ''}`}>
              <div className="tree-cell">
                {hasLeaf ? '🍃' : ''}
                {isMonkeyPosition ? '🐵' : ''}
              </div>
              <div className={`neck-cell ${isNeckSegment ? 'neck-cell--lit' : ''}`}>
                {isNeckSegment ? '────' : ''}
              </div>
              <div className={`giraffe-cell ${isHead ? 'giraffe-cell--active' : ''}`}>
                {isHead ? '🦒' : ''}
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
