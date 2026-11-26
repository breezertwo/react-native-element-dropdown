import { describe, expect, it } from '@jest/globals';
import { getField, getFieldText, isEqualValue } from '../internal/fields';

type Item = { label: string; id: number; note?: string | null };

describe('getField', () => {
  it('reads a field of the item', () => {
    expect(getField<Item>({ label: 'A', id: 1 }, 'id')).toBe(1);
  });

  it('is undefined without an item', () => {
    expect(getField<Item>(null, 'id')).toBeUndefined();
    expect(getField<Item>(undefined, 'id')).toBeUndefined();
  });
});

describe('getFieldText', () => {
  it('turns the field into text', () => {
    expect(getFieldText<Item>({ label: 'A', id: 1 }, 'id')).toBe('1');
  });

  it('is undefined for missing values, not "undefined"', () => {
    expect(getFieldText<Item>({ label: 'A', id: 1 }, 'note')).toBeUndefined();
    expect(
      getFieldText<Item>({ label: 'A', id: 1, note: null }, 'note')
    ).toBeUndefined();
  });
});

describe('isEqualValue', () => {
  it.each([
    [1, 1],
    ['a', 'a'],
    [Number.NaN, Number.NaN],
    [null, null],
    [
      { id: 1, tags: ['a'] },
      { id: 1, tags: ['a'] },
    ],
    [
      [1, [2]],
      [1, [2]],
    ],
    [new Date(5), new Date(5)],
  ])('%p equals %p', (a, b) => {
    expect(isEqualValue(a, b)).toBe(true);
  });

  it.each([
    [1, '1'],
    [null, undefined],
    [{ id: 1 }, { id: 2 }],
    [{ id: 1 }, { id: 1, extra: true }],
    [{ id: undefined }, { other: undefined }],
    [[1], { 0: 1 }],
    [new Date(5), new Date(6)],
    [new Date(5), 5],
  ])('%p differs from %p', (a, b) => {
    expect(isEqualValue(a, b)).toBe(false);
  });
});
