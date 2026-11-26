import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { KeyboardFrame } from './keyboard';

/** Space between the trigger and the list. */
export const GAP = 2;
/** Minimum distance between the list and the screen edges or insets. */
export const EDGE_MARGIN = 8;

export type DropdownPosition = 'auto' | 'top' | 'bottom';

export interface DropdownSafeAreaInsets {
  top?: number;
  bottom?: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DropdownPlacement {
  /** False until everything needed for the final position is measured. */
  isReady: boolean;
  /** Whether the list opens above the trigger. */
  isTopPosition: boolean;
  left: number;
  width: number;
  maxHeight: number;
  /**
   * Style of the view that positions the list inside the Modal: padding
   * from the top for a list below the trigger, a height down to the trigger
   * for a list above it.
   */
  wrapperStyle: ViewStyle;
}

export interface PlacementInput {
  /** Trigger rect relative to the top of the screen; null until measured. */
  trigger: Rect | null;
  /** Whether `trigger` was measured since the list opened. */
  isTriggerFresh: boolean;
  /** Size of the modal the list renders in; null until it is laid out. */
  modalSize: Size | null;
  /** Window size, used until the modal is laid out. */
  windowSize: Size;
  /** Height of the list content; null until it is laid out. */
  contentHeight: number | null;
  /** The keyboard covering the screen; null if none, or if it is ignored. */
  keyboard: KeyboardFrame | null;
  isFull: boolean;
  isRTL: boolean;
  dropdownPosition: DropdownPosition;
  maxHeight: number;
  minHeight: number;
  safeAreaInsets?: DropdownSafeAreaInsets;
  /** Top inset when `safeAreaInsets.top` isn't given (Android: status bar). */
  defaultTopInset: number;
  /**
   * Bottom inset when `safeAreaInsets.bottom` isn't given (Android with
   * React Native's edge-to-edge flag: the navigation bar).
   */
  defaultBottomInset?: number;
  /** Vertical margins of the list container (`containerStyle`). */
  verticalMargins: number;
}

/**
 * Where the open list goes and how tall it may get. Returns null while the
 * trigger hasn't been measured.
 *
 * With `dropdownPosition="auto"`, the list opens below the trigger unless the
 * space below (above the keyboard and bottom inset) is too small for its
 * content and the space above is larger.
 */
export const computePlacement = ({
  trigger,
  isTriggerFresh,
  modalSize,
  windowSize,
  contentHeight,
  keyboard,
  isFull,
  isRTL,
  dropdownPosition,
  maxHeight,
  minHeight,
  safeAreaInsets,
  defaultTopInset,
  defaultBottomInset = 0,
  verticalMargins,
}: PlacementInput): DropdownPlacement | null => {
  if (!trigger || !(trigger.width > 0)) {
    return null;
  }

  const screenHeight = modalSize?.height ?? windowSize.height;
  const screenWidth = modalSize?.width ?? windowSize.width;
  const isReady =
    modalSize != null &&
    isTriggerFresh &&
    (isFull || dropdownPosition !== 'auto' || contentHeight != null);

  const left = isRTL ? screenWidth - trigger.width - trigger.x : trigger.x;

  const topInset = safeAreaInsets?.top ?? defaultTopInset;
  const bottomInset = safeAreaInsets?.bottom ?? defaultBottomInset;
  const keyboardTop = keyboard
    ? Math.min(
        screenHeight,
        keyboard.screenY > 0 ? keyboard.screenY : screenHeight - keyboard.height
      )
    : Infinity;

  const topLimit = topInset + EDGE_MARGIN;
  const bottomLimit = Math.min(
    screenHeight - bottomInset - EDGE_MARGIN,
    keyboardTop - GAP
  );

  if (isFull) {
    return {
      isReady,
      isTopPosition: false,
      left,
      width: trigger.width,
      maxHeight: Math.max(
        minHeight,
        Math.floor(bottomLimit - topLimit - verticalMargins)
      ),
      wrapperStyle: {
        paddingTop: topLimit,
        paddingBottom: Math.max(0, screenHeight - bottomLimit),
      },
    };
  }

  if (!isReady) {
    return {
      isReady,
      isTopPosition: false,
      left,
      width: trigger.width,
      maxHeight,
      wrapperStyle: {},
    };
  }

  // A forced position keeps its side even without room, but the list only
  // gets the space on that side, so it never reaches under the system bars,
  // the keyboard or off the screen.
  if (dropdownPosition !== 'auto') {
    const isTopPosition = dropdownPosition === 'top';
    const available = isTopPosition
      ? trigger.y - GAP - topLimit - verticalMargins
      : bottomLimit - (trigger.y + trigger.height + GAP) - verticalMargins;
    return {
      isReady,
      isTopPosition,
      left,
      width: trigger.width,
      maxHeight: Math.max(
        minHeight,
        Math.min(maxHeight, Math.floor(available))
      ),
      wrapperStyle: isTopPosition
        ? endingAt(trigger.y - GAP)
        : { paddingTop: trigger.y + trigger.height + GAP },
    };
  }

  const belowStart = Math.max(trigger.y + trigger.height + GAP, topLimit);
  const aboveEnd = Math.min(trigger.y - GAP, bottomLimit);
  const spaceBelow = bottomLimit - belowStart - verticalMargins;
  const spaceAbove = aboveEnd - topLimit - verticalMargins;
  const needed = Math.min(contentHeight ?? maxHeight, maxHeight);

  const isTopPosition = spaceBelow < needed && spaceAbove > spaceBelow;
  const available = isTopPosition ? spaceAbove : spaceBelow;

  return {
    isReady,
    isTopPosition,
    left,
    width: trigger.width,
    maxHeight: Math.max(minHeight, Math.min(maxHeight, Math.floor(available))),
    wrapperStyle: isTopPosition
      ? endingAt(aboveEnd)
      : { paddingTop: belowStart },
  };
};

/**
 * A wrapper from the top of the Modal down to `end`, with the list at its
 * bottom: a list above the trigger ends at `end`. Measured from the top,
 * not as padding from the bottom, because the Modal's height can still
 * change after the list is shown (on Android it is first laid out without
 * the system bars), and the list must not move when it does.
 */
const endingAt = (end: number): ViewStyle => ({
  flex: 0,
  height: Math.max(0, end),
  justifyContent: 'flex-end',
});

const firstNumber = (...values: unknown[]): number => {
  const value = values.find((candidate) => candidate !== undefined);
  return typeof value === 'number' ? value : 0;
};

/**
 * Top plus bottom margin of a style, with the same precedence as React
 * Native's layout: the most specific property wins. Non-numeric margins
 * (percentages, "auto") count as 0.
 */
export const getVerticalMargins = (style: StyleProp<ViewStyle>): number => {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  return (
    firstNumber(
      flat.marginTop,
      flat.marginBlockStart,
      flat.marginBlock,
      flat.marginVertical,
      flat.margin
    ) +
    firstNumber(
      flat.marginBottom,
      flat.marginBlockEnd,
      flat.marginBlock,
      flat.marginVertical,
      flat.margin
    )
  );
};
