import { describe, expect, it } from '@jest/globals';
import { fitChips } from '../components/MultiSelect/fitChips';

describe('fitChips', () => {
  it('fits all chips when they fit, without room for "+N"', () => {
    expect(fitChips([50, 50, 50], 150, 40)).toBe(3);
  });

  it('fits no chips when there are none', () => {
    expect(fitChips([], 100, 40)).toBe(0);
  });

  it('leaves room for "+N" when not all chips fit', () => {
    // 50 + 50 + "+N" (40) = 140 fits; 50 + 50 + 50 + "+N" doesn't.
    expect(fitChips([50, 50, 50, 50], 160, 40)).toBe(2);
  });

  it('keeps the last chip instead of "+1" when it fits exactly', () => {
    expect(fitChips([50, 50, 50], 150, 60)).toBe(3);
  });

  it('shows only "+N" when not even the first chip fits next to it', () => {
    expect(fitChips([200, 50], 150, 40)).toBe(0);
  });

  it('keeps chip order: a later, narrower chip does not jump ahead', () => {
    expect(fitChips([50, 120, 10], 150, 40)).toBe(1);
  });
});
