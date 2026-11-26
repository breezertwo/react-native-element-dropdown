import { describe, expect, it } from '@jest/globals';
import {
  computePlacement,
  getVerticalMargins,
  type PlacementInput,
} from '../internal/placement/computePlacement';
import { windowOffsetY } from '../internal/placement/edgeToEdge';
import { toKeyboardFrame } from '../internal/placement/keyboard';

// 400 x 800 screen, trigger 200 x 40 at x = 16, list content 200 high,
// maxHeight 340. GAP = 2, EDGE_MARGIN = 8.
const input = (overrides: Partial<PlacementInput> = {}): PlacementInput => ({
  trigger: { x: 16, y: 100, width: 200, height: 40 },
  isTriggerFresh: true,
  modalSize: { width: 400, height: 800 },
  windowSize: { width: 400, height: 800 },
  contentHeight: 200,
  keyboard: null,
  isFull: false,
  isRTL: false,
  dropdownPosition: 'auto',
  maxHeight: 340,
  minHeight: 0,
  safeAreaInsets: {},
  defaultTopInset: 0,
  verticalMargins: 0,
  ...overrides,
});

const at = (y: number) => ({ x: 16, y, width: 200, height: 40 });

describe('computePlacement', () => {
  it('returns null until the trigger is measured with a width', () => {
    expect(computePlacement(input({ trigger: null }))).toBeNull();
    expect(
      computePlacement(input({ trigger: { ...at(100), width: 0 } }))
    ).toBeNull();
  });

  describe('readiness', () => {
    it.each([
      ['the modal is not laid out', { modalSize: null }],
      [
        'the trigger is not re-measured since opening',
        { isTriggerFresh: false },
      ],
      ['auto placement has no content height yet', { contentHeight: null }],
    ])('is not ready while %s', (_, overrides) => {
      expect(computePlacement(input(overrides))).toEqual({
        isReady: false,
        isTopPosition: false,
        left: 16,
        width: 200,
        maxHeight: 340,
        wrapperStyle: {},
      });
    });

    it('does not wait for the content height with a forced position', () => {
      expect(
        computePlacement(
          input({ contentHeight: null, dropdownPosition: 'bottom' })
        )?.isReady
      ).toBe(true);
    });

    it('uses the window size until the modal is laid out', () => {
      expect(
        computePlacement(
          input({
            modalSize: null,
            windowSize: { width: 500, height: 800 },
            isRTL: true,
          })
        )?.left
      ).toBe(284); // 500 - 200 - 16
    });
  });

  describe('auto position', () => {
    it.each([
      // [trigger y, expected top position, wrapper style, maxHeight]
      [100, false, { paddingTop: 142 }, 340],
      [300, false, { paddingTop: 342 }, 340],
      // below: 792 - 742 = 50 < 200; above: 698 - 8 = 690
      [700, true, { justifyContent: 'flex-end', paddingBottom: 102 }, 340],
      // below: 792 - 602 = 190 < 200; above: 558 - 8 = 550
      [560, true, { justifyContent: 'flex-end', paddingBottom: 242 }, 340],
    ])(
      'places a trigger at y=%p (top: %p)',
      (y, isTopPosition, wrapperStyle, maxHeight) => {
        expect(computePlacement(input({ trigger: at(y) }))).toEqual({
          isReady: true,
          isTopPosition,
          left: 16,
          width: 200,
          maxHeight,
          wrapperStyle,
        });
      }
    );

    it('stays below when the content fits, even if above is larger', () => {
      // below: 792 - 542 = 250 >= 200
      expect(computePlacement(input({ trigger: at(500) }))?.isTopPosition).toBe(
        false
      );
    });

    it('stays below when neither side fits but below is larger', () => {
      // below: 792 - 342 = 450; above: 298 - 8 = 290; content 600
      const placement = computePlacement(
        input({ trigger: at(300), contentHeight: 600, maxHeight: 600 })
      );
      expect(placement?.isTopPosition).toBe(false);
      expect(placement?.maxHeight).toBe(450);
    });

    it('caps the height at the available space and never below minHeight', () => {
      expect(
        computePlacement(input({ trigger: at(700), maxHeight: 1000 }))
          ?.maxHeight
      ).toBe(690);
      expect(
        computePlacement(
          input({
            trigger: at(380),
            contentHeight: 600,
            maxHeight: 600,
            minHeight: 500,
          })
        )?.maxHeight
      ).toBe(500);
    });

    it('subtracts the container margins from the available space', () => {
      // below: 792 - 342 - 20 = 430
      expect(
        computePlacement(
          input({
            trigger: at(300),
            maxHeight: 600,
            contentHeight: 300,
            verticalMargins: 20,
          })
        )?.maxHeight
      ).toBe(430);
    });
  });

  describe('forced position', () => {
    it('opens above with dropdownPosition="top", even without room', () => {
      expect(
        computePlacement(input({ dropdownPosition: 'top' }))
      ).toMatchObject({
        isTopPosition: true,
        maxHeight: 340,
        wrapperStyle: { justifyContent: 'flex-end', paddingBottom: 702 },
      });
    });

    it('opens below with dropdownPosition="bottom", even without room', () => {
      expect(
        computePlacement(
          input({ trigger: at(700), dropdownPosition: 'bottom' })
        )
      ).toMatchObject({
        isTopPosition: false,
        maxHeight: 340,
        wrapperStyle: { paddingTop: 742 },
      });
    });
  });

  describe('insets and keyboard', () => {
    it('keeps the list clear of the bottom inset', () => {
      // below: 800 - 34 - 8 - 602 = 156 < 200
      expect(
        computePlacement(
          input({ trigger: at(560), safeAreaInsets: { bottom: 34 } })
        )?.isTopPosition
      ).toBe(true);
    });

    it('keeps the list clear of the top inset', () => {
      // above: 698 - (50 + 8) = 640
      expect(
        computePlacement(
          input({
            trigger: at(700),
            maxHeight: 1000,
            safeAreaInsets: { top: 50 },
          })
        )?.maxHeight
      ).toBe(640);
    });

    it('uses defaultTopInset (Android status bar) when no top inset is given', () => {
      expect(
        computePlacement(
          input({ trigger: at(700), maxHeight: 1000, defaultTopInset: 24 })
        )?.maxHeight
      ).toBe(666); // 698 - (24 + 8)
      expect(
        computePlacement(
          input({
            trigger: at(700),
            maxHeight: 1000,
            defaultTopInset: 24,
            safeAreaInsets: { top: 0 },
          })
        )?.maxHeight
      ).toBe(690);
    });

    it('opens above when the keyboard covers the space below', () => {
      // keyboard top 500: below 498 - 342 = 156 < 200; above 298 - 8 = 290
      expect(
        computePlacement(
          input({ trigger: at(300), keyboard: { screenY: 500, height: 300 } })
        )
      ).toMatchObject({
        isTopPosition: true,
        maxHeight: 290,
        wrapperStyle: { justifyContent: 'flex-end', paddingBottom: 502 },
      });
    });

    it('derives the keyboard top from its height when screenY is 0', () => {
      expect(
        computePlacement(
          input({ trigger: at(300), keyboard: { screenY: 0, height: 300 } })
        )?.isTopPosition
      ).toBe(true);
    });
  });

  describe('full-screen mode', () => {
    it('fills the screen between the insets and the keyboard', () => {
      expect(
        computePlacement(
          input({
            isFull: true,
            contentHeight: null,
            safeAreaInsets: { top: 50, bottom: 34 },
            keyboard: { screenY: 500, height: 300 },
          })
        )
      ).toEqual({
        isReady: true,
        isTopPosition: false,
        left: 16,
        width: 200,
        maxHeight: 440, // 498 - 58
        wrapperStyle: { paddingTop: 58, paddingBottom: 302 },
      });
    });
  });

  it('mirrors the horizontal position in right-to-left layouts', () => {
    expect(computePlacement(input({ isRTL: true }))?.left).toBe(184); // 400 - 200 - 16
  });
});

describe('windowOffsetY', () => {
  it.each([
    ['iOS', { platform: 'ios', isEdgeToEdge: false }, 0],
    ['Android, edge-to-edge', { platform: 'android', isEdgeToEdge: true }, 0],
    [
      'Android, not edge-to-edge',
      { platform: 'android', isEdgeToEdge: false },
      24,
    ],
  ] as const)('is %p → %p', (_, context, expected) => {
    expect(windowOffsetY({ ...context, statusBarHeight: 24 })).toBe(expected);
  });
});

describe('toKeyboardFrame', () => {
  const ios = { platform: 'ios', screenHeight: 800 } as const;
  const android = { platform: 'android', screenHeight: 800 } as const;
  const metrics = (screenY: number, height: number) => ({
    screenX: 0,
    screenY,
    width: 400,
    height,
  });

  it('ignores missing metrics and empty keyboards', () => {
    expect(toKeyboardFrame(null, ios)).toBeNull();
    expect(toKeyboardFrame(metrics(800, 0), android)).toBeNull();
  });

  it('returns a docked iOS keyboard', () => {
    expect(toKeyboardFrame(metrics(500, 300), ios)).toEqual({
      screenY: 500,
      height: 300,
    });
  });

  it('ignores hidden and undocked iOS keyboards', () => {
    expect(toKeyboardFrame(metrics(800, 300), ios)).toBeNull();
    expect(toKeyboardFrame(metrics(300, 300), ios)).toBeNull();
  });

  it('returns Android keyboards as reported', () => {
    expect(toKeyboardFrame(metrics(300, 300), android)).toEqual({
      screenY: 300,
      height: 300,
    });
  });
});

describe('getVerticalMargins', () => {
  it.each([
    [undefined, 0],
    [{ margin: 4 }, 8],
    [{ marginVertical: 6 }, 12],
    [{ marginTop: 3, marginBottom: 5 }, 8],
    [{ margin: 4, marginTop: 10 }, 14],
    [{ marginBlock: 2, marginBlockEnd: 7 }, 9],
    [{ margin: '10%' }, 0],
    [[{ margin: 4 }, { marginBottom: 1 }], 5],
  ])('%p → %p', (style, expected) => {
    expect(getVerticalMargins(style as never)).toBe(expected);
  });
});
