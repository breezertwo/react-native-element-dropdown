import { describe, expect, it } from '@jest/globals';
import { createKeyExtractor } from '../internal/keyExtractor';

describe('createKeyExtractor', () => {
  const keyOf = createKeyExtractor('value');

  it('keys items by their value', () => {
    expect(keyOf({ value: 'apple' }, 3)).toBe('value-apple');
    expect(keyOf({ value: 0 }, 3)).toBe('value-0');
  });

  it('falls back to the position for items without a value', () => {
    expect(keyOf({ value: null }, 3)).toBe('index-3');
    expect(keyOf({}, 4)).toBe('index-4');
  });

  it("doesn't mix up a value and a position", () => {
    expect(keyOf({ value: '1' }, 0)).not.toBe(keyOf({}, 1));
  });
});
