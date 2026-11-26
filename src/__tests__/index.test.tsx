import { describe, expect, it } from '@jest/globals';
import * as library from '../index';

describe('package exports', () => {
  it('exports the components', () => {
    expect(library.Dropdown).toBeDefined();
    expect(library.MultiSelect).toBeDefined();
  });

  it('no longer exports SelectCountry (removed in 3.0)', () => {
    expect('SelectCountry' in library).toBe(false);
  });
});
