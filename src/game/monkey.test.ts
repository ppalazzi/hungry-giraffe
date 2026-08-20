import { describe, it, expect } from 'vitest';
import {
  MONKEY_ACTION_SEQUENCE,
  isMonkeyThreatening,
  advanceMonkeyAction,
  pickMonkeyPosition,
} from './monkey';

const always = (value: number) => () => value;

describe('advanceMonkeyAction', () => {
  it('cycles idle -> moving -> blocking -> attacking -> idle', () => {
    expect(advanceMonkeyAction('idle')).toBe('moving');
    expect(advanceMonkeyAction('moving')).toBe('blocking');
    expect(advanceMonkeyAction('blocking')).toBe('attacking');
    expect(advanceMonkeyAction('attacking')).toBe('idle');
  });

  it('visits every action in MONKEY_ACTION_SEQUENCE exactly once per cycle', () => {
    let action = MONKEY_ACTION_SEQUENCE[0];
    const visited = [action];
    for (let i = 1; i < MONKEY_ACTION_SEQUENCE.length; i++) {
      action = advanceMonkeyAction(action);
      visited.push(action);
    }
    expect(visited).toEqual(MONKEY_ACTION_SEQUENCE);
  });
});

describe('isMonkeyThreatening', () => {
  it('is true only for blocking and attacking', () => {
    expect(isMonkeyThreatening('idle')).toBe(false);
    expect(isMonkeyThreatening('moving')).toBe(false);
    expect(isMonkeyThreatening('blocking')).toBe(true);
    expect(isMonkeyThreatening('attacking')).toBe(true);
  });
});

describe('pickMonkeyPosition', () => {
  it('returns a position in range 0-3', () => {
    expect(pickMonkeyPosition(always(0))).toBe(0);
    expect(pickMonkeyPosition(always(0.99))).toBe(3);
  });

  it('is deterministic given a deterministic random source', () => {
    expect(pickMonkeyPosition(always(0.5))).toBe(2);
  });
});
