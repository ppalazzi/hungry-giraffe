import { describe, it, expect } from 'vitest';
import { moveGiraffe } from './movement';

describe('moveGiraffe', () => {
  it('extends one segment on up', () => {
    expect(moveGiraffe(1, 'up')).toBe(2);
  });

  it('retracts one segment on down', () => {
    expect(moveGiraffe(2, 'down')).toBe(1);
  });

  it('snaps by exactly one segment (no interpolation)', () => {
    expect(moveGiraffe(1, 'up') - 1).toBe(1);
  });

  it('clamps at full extension', () => {
    expect(moveGiraffe(3, 'up')).toBe(3);
  });

  it('clamps at the home position', () => {
    expect(moveGiraffe(0, 'down')).toBe(0);
  });

  it('retracting from position 1 reaches home', () => {
    expect(moveGiraffe(1, 'down')).toBe(0);
  });
});
