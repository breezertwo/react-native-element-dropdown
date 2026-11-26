import { describe, expect, it } from '@jest/globals';
import {
  defaultAccessibilityStrings,
  fieldRoleFor,
  resolveAccessibilityStrings,
} from '../internal/a11y';

describe('fieldRoleFor', () => {
  it.each([
    ['ios', 'button'],
    ['android', 'dropdownlist'],
    ['web', 'combobox'],
  ] as const)('%p → %p', (platform, role) => {
    expect(fieldRoleFor(platform)).toBe(role);
  });
});

describe('resolveAccessibilityStrings', () => {
  it('keeps the English defaults for strings that are not passed', () => {
    const strings = resolveAccessibilityStrings({ search: 'Suche' });

    expect(strings.search).toBe('Suche');
    expect(strings.clearSearch).toBe('Clear search');
    expect(strings.searchResults(1)).toBe('1 result');
    expect(strings.searchResults(3)).toBe('3 results');
  });

  it('returns the defaults without strings', () => {
    expect(resolveAccessibilityStrings()).toBe(defaultAccessibilityStrings);
  });
});
