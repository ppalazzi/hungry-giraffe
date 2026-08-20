import { GiraffePosition, MonkeyAction } from './types';
import { GIRAFFE_POSITION_COUNT } from './constants';

export const MONKEY_ACTION_SEQUENCE: readonly MonkeyAction[] = [
  'idle',
  'moving',
  'blocking',
  'attacking',
];

export function isMonkeyThreatening(action: MonkeyAction): boolean {
  return action === 'blocking' || action === 'attacking';
}

/** Cycles to the next action in MONKEY_ACTION_SEQUENCE, wrapping. */
export function advanceMonkeyAction(action: MonkeyAction): MonkeyAction {
  const currentIndex = MONKEY_ACTION_SEQUENCE.indexOf(action);
  const nextIndex = (currentIndex + 1) % MONKEY_ACTION_SEQUENCE.length;
  return MONKEY_ACTION_SEQUENCE[nextIndex];
}

export function pickMonkeyPosition(random: () => number): GiraffePosition {
  return Math.floor(random() * GIRAFFE_POSITION_COUNT) as GiraffePosition;
}
