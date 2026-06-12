import { describe, it, expect } from 'vitest';
import { moveGiraffe } from './movement';

describe('moveGiraffe', () => {
  it('moves up one position', () => {
    expect(moveGiraffe(2, 'up')).toBe(1);
  });

  it('moves down one position', () => {
    expect(moveGiraffe(1, 'down')).toBe(2);
  });

  it('snaps by exactly one cell (no interpolation)', () => {
    expect(moveGiraffe(1, 'down') - 1).toBe(1);
  });

  it('clamps at the top boundary', () => {
    expect(moveGiraffe(0, 'up')).toBe(0);
  });

  it('clamps at the bottom boundary', () => {
    expect(moveGiraffe(3, 'down')).toBe(3);
  });
});
