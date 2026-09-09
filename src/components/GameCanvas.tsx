import { useEffect, useRef, useState } from 'react';
import { GameState, LeafPosition } from '../game/types';
import { coconutPositionForStep } from '../game/coconut';
import { cellForPosition, isNeckSegmentLit, POSITIONS_TOP_DOWN } from '../game/segments';
import { obstacleColumn } from '../game/ground';
import { GIRAFFE_POSITION_COUNT, MIN_GIRAFFE_POSITION, INITIAL_LIVES } from '../game/constants';
import { isSegmentLit, scoreToDigits, Segment } from '../game/sevenSegment';

interface GameCanvasProps {
  gameState: GameState;
}

const SEGMENTS: readonly Segment[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const HIT_FLASH_MS = 180;

function SevenSegmentDigit({ digit }: { digit: number }) {
  return (
    <span className="digit">
      {SEGMENTS.map((segment) => (
        <span
          key={segment}
          className={`digit__seg digit__seg--${segment} ${
            isSegmentLit(digit, segment) ? 'digit__seg--on' : ''
          }`}
        />
      ))}
    </span>
  );
}

function LifeIcons({ lives }: { lives: number }) {
  const slots = Array.from({ length: INITIAL_LIVES }, (_, i) => i);
  return (
    <div className="lcd__lives" aria-label={`${lives} lives remaining`}>
      {slots.map((slot) => (
        <span key={slot} className={`life-icon ${slot < lives ? 'life-icon--on' : ''}`} />
      ))}
    </div>
  );
}

/** Flashes true for one beat right after `lives` drops, then clears itself. */
function useHitFlash(lives: number): boolean {
  const [flashing, setFlashing] = useState(false);
  const previousLives = useRef(lives);

  useEffect(() => {
    if (lives < previousLives.current) {
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), HIT_FLASH_MS);
      previousLives.current = lives;
      return () => clearTimeout(timer);
    }
    previousLives.current = lives;
  }, [lives]);

  return flashing;
}

/**
 * The CG-91 segment grid.
 *
 * The giraffe body is fixed bottom-left, the neck runs diagonally up and to the
 * right, and the tree with the monkey in its canopy fills the right-hand
 * column. Coconuts fall down the same diagonal the neck climbs, which is what
 * makes an extended neck a target.
 *
 * The neck is a structural segment: always in the DOM, switched on or off, the
 * way an LCD digit's segments are all etched and only some are powered. The
 * leaf, coconut and head are transient sprites instead — they only mount when
 * present, so an empty cell stays empty rather than showing faint outlines of
 * everything that could be there.
 *
 * The one exception to "on or off, no interpolation" is the hit flash, which
 * is itself a discrete toggle held for a fixed beat rather than an eased
 * animation — it snaps, same as every segment.
 *
 * Phase 2 (mode === 'ground') repurposes the same grid: the neck locks at
 * home, a log slides along the ground lane, and JUMP hops the body segment
 * for a fixed window — the giraffe's own answer to the coconut's dodge.
 */
export function GameCanvas({ gameState }: GameCanvasProps) {
  const { giraffePosition, leafPositions, coconutStep, score, lives, mode } = gameState;
  const coconutPosition = coconutStep === null ? null : coconutPositionForStep(coconutStep);
  const treeColumn = GIRAFFE_POSITION_COUNT + 1;
  const isFlashing = useHitFlash(lives);
  const isGroundMode = mode === 'ground';
  const isJumping = isGroundMode && gameState.jumpTicksRemaining > 0;
  const groundRow = GIRAFFE_POSITION_COUNT + 1;

  return (
    <div className={`lcd ${isFlashing ? 'lcd--flash' : ''}`}>
      <div className="lcd__hud">
        <LifeIcons lives={lives} />
        <div className="lcd__score" aria-label={`score ${score}`}>
          {scoreToDigits(score).map((digit, index) => (
            <SevenSegmentDigit key={index} digit={digit} />
          ))}
        </div>
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
                <span className={`seg seg--body seg--on ${isJumping ? 'seg--body--jump' : ''}`} />
              ) : (
                <span className={`seg seg--neck ${isLit ? 'seg--on' : ''}`} />
              )}
              {hasLeaf && <span className="seg seg--leaf seg--on" />}
              {isHead && !isBody && <span className="seg seg--head seg--on" />}
              {hasCoconut && <span className="seg seg--coconut seg--on" />}
            </div>
          );
        })}

        {/* Ground lane: the floor itself, plus Phase 2's sliding obstacle. */}
        <div
          className="seg seg--ground seg--on"
          style={{ gridColumn: `1 / ${treeColumn + 1}`, gridRow: groundRow }}
          aria-hidden
        />

        {isGroundMode && gameState.obstacleStep !== null && (
          <div
            className="cell"
            style={{ gridColumn: obstacleColumn(gameState.obstacleStep), gridRow: groundRow }}
          >
            <span className="seg seg--obstacle seg--on" />
          </div>
        )}
      </div>
    </div>
  );
}
