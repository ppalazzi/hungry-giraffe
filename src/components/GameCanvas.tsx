import { useEffect, useRef, useState } from 'react';
import { GameState, LeafPosition } from '../game/types';
import { coconutPositionForStep } from '../game/coconut';
import { cellForPosition, isNeckSegmentLit, POSITIONS_TOP_DOWN } from '../game/segments';
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
 * Every element is a segment that is either on or off — no interpolation, no
 * transitions, no intermediate frames. The one exception is the hit flash,
 * which is itself a discrete on/off toggle held for a fixed beat rather than
 * an eased animation.
 */
export function GameCanvas({ gameState }: GameCanvasProps) {
  const { giraffePosition, leafPositions, coconutStep, score, lives } = gameState;
  const coconutPosition = coconutStep === null ? null : coconutPositionForStep(coconutStep);
  const treeColumn = GIRAFFE_POSITION_COUNT + 1;
  const isFlashing = useHitFlash(lives);

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
