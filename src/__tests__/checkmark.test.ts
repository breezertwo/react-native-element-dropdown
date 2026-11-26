import { describe, expect, it } from '@jest/globals';
import { checkmarkStrokeFor } from '../internal/DropdownOption';

describe('checkmarkStrokeFor', () => {
  it.each([
    [
      'left-to-right',
      { isRTL: false, swapsLeftAndRight: true },
      'borderRightWidth',
    ],
    // React Native swaps left and right styles: left is drawn on the right.
    [
      'right-to-left',
      { isRTL: true, swapsLeftAndRight: true },
      'borderLeftWidth',
    ],
    [
      'right-to-left without swapping',
      { isRTL: true, swapsLeftAndRight: false },
      'borderRightWidth',
    ],
  ] as const)(
    'draws the stroke on the physical right in %s',
    (_, context, side) => {
      expect(checkmarkStrokeFor(context)).toEqual({ [side]: 2 });
    }
  );
});
