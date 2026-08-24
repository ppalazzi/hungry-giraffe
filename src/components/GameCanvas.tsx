import { GameState, LeafPosition } from '../game/types';
import { coconutPositionForStep } from '../game/coconut';
import { cellForPosition, isNeckSegmentLit, POSITIONS_TOP_DOWN } from '../game/segments';
import { GIRAFFE_POSITION_COUNT, MIN_GIRAFFE_POSITION } from '../game/constants';

interface GameCanvasProps {
  gameState: GameState;
}

/**
 * The CG-91 segment grid.
 *
 * The giraffe body is fixed bottom-left, the neck runs diagonally up and to the
 * right, and the tree with the monkey in its canopy fills the right-hand
 * column. Coconuts fall down the same diagonal the neck climbs, which is what
 * makes an extended neck a target.
 *
 * Every element is a segment that is either on or off — no interpolation, no
 * transitions, no intermediate frames.
 */
export function GameCanvas({ gameState }: GameCanvasProps) {
  const { giraffePosition, leafPositions, coconutStep } = gameState;
  const coconutPosition = coconutStep === null ? null : coconutPositionForStep(coconutStep);
  const treeColumn = GIRAFFE_POSITION_COUNT + 1;

  return (
    <div className="lcd">
      {/*
        Plain-text readout for now. HG-28 replaces this with the real HUD: a
        7-segment score and giraffe-shaped life icons. Kept here so the game
        stays playable in the meantime.
      */}
      <div className="lcd__hud">
        <span className="lcd__lives">{'\u25AE'.repeat(Math.max(0, gameState.lives))}</span>
        <span className="lcd__score">{String(gameState.score).padStart(3, '0')}</span>
      </div>
      <div
        className="lcd__grid"
        style={{
          gridTemplateColumns: `repeat(${treeColumn}, 1fr)`,
          gridTemplateRows: `repeat(${GIRAFFE_POSITION_COUNT}, 1fr) 0.6fr`,
        }}
      >
        {/* Tree: a static trunk down the right-hand column. */}
        <div
          className="seg seg--trunk seg--on"
          style={{ gridColumn: treeColumn, gridRow: `2 / ${GIRAFFE_POSITION_COUNT + 1}` }}
          aria-hidden
        />

        {/* Monkey: permanently stationed in the canopy, top-right. */}
        <div
          className="cell"
          style={{ gridColumn: treeColumn, gridRow: 1 }}
          aria-label="monkey"
        >
          <span className="seg seg--monkey seg--on" />
        </div>

        {POSITIONS_TOP_DOWN.map((position) => {
          const { row, column } = cellForPosition(position);
          const isBody = position === MIN_GIRAFFE_POSITION;
          const hasLeaf = leafPositions.includes(position as LeafPosition);
          const hasCoconut = position === coconutPosition;
          const isHead = position === giraffePosition;
          const isLit = isNeckSegmentLit(position, giraffePosition);

          return (
            <div key={position} className="cell" style={{ gridColumn: column, gridRow: row }}>
              {isBody ? (
                <span className="seg seg--body seg--on" />
              ) : (
                <span className={`seg seg--neck ${isLit ? 'seg--on' : ''}`} />
              )}
              <span className={`seg seg--leaf ${hasLeaf ? 'seg--on' : ''}`} />
              <span className={`seg seg--head ${isHead && !isBody ? 'seg--on' : ''}`} />
              <span className={`seg seg--coconut ${hasCoconut ? 'seg--on' : ''}`} />
            </div>
          );
        })}

        {/* Ground lane, reserved for the Phase 2 obstacles in HG-29. */}
        <div
          className="seg seg--ground seg--on"
          style={{ gridColumn: `1 / ${treeColumn + 1}`, gridRow: GIRAFFE_POSITION_COUNT + 1 }}
          aria-hidden
        />
      </div>
    </div>
  );
}
