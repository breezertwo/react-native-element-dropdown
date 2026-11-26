import { describe, expect, it } from '@jest/globals';
import { toggleValue } from '../components/MultiSelect/toggleValue';

describe('toggleValue', () => {
  it.each([
    // [values, value, maxSelect, expected values, removed]
    [[], 'a', undefined, ['a'], false],
    [['a'], 'b', undefined, ['a', 'b'], false],
    [['a', 'b'], 'a', undefined, ['b'], true],
    [['a', 'b'], 'c', 2, ['a', 'b'], false],
    [['a', 'b'], 'b', 2, ['a'], true],
    [['a'], 'b', 0, ['a', 'b'], false], // 0 means no limit
    [[1, 2], 2, undefined, [1], true],
  ])(
    'toggles %p with %p (maxSelect %p)',
    (values, value, maxSelect, expected, removed) => {
      expect(toggleValue<string | number>(values, value, maxSelect)).toEqual({
        values: expected,
        removed,
      });
    }
  );

  it('returns a new array, also when nothing changes', () => {
    const values = ['a', 'b'];
    const result = toggleValue(values, 'c', 2);
    expect(result.values).not.toBe(values);
    expect(values).toEqual(['a', 'b']);
  });
});
