import { Dimensions, Keyboard, Platform } from 'react-native';
import type { KeyboardMetrics } from 'react-native';

/** The part of the keyboard's frame the placement needs. */
export interface KeyboardFrame {
  /** Top edge of the keyboard; 0 if the platform doesn't report it. */
  screenY: number;
  height: number;
}

type KeyboardFrameContext = {
  platform: typeof Platform.OS;
  screenHeight: number;
};

/**
 * The keyboard frame that covers the screen, or null if no keyboard does.
 * On iOS, a hidden keyboard (below the screen) and an undocked or floating
 * keyboard (not reaching the bottom edge) don't cover the space below the
 * trigger, so they are ignored.
 */
export const toKeyboardFrame = (
  metrics: KeyboardMetrics | undefined | null,
  { platform, screenHeight }: KeyboardFrameContext
): KeyboardFrame | null => {
  if (!metrics || !(metrics.height > 0)) {
    return null;
  }
  if (platform === 'ios') {
    const isHidden = metrics.screenY >= screenHeight;
    const isUndocked = metrics.screenY + metrics.height < screenHeight - 1;
    if (isHidden || isUndocked) {
      return null;
    }
  }
  return { screenY: metrics.screenY, height: metrics.height };
};

/** `toKeyboardFrame` for the running app. */
export const readKeyboardFrame = (
  metrics: KeyboardMetrics | undefined | null
): KeyboardFrame | null =>
  toKeyboardFrame(metrics, {
    platform: Platform.OS,
    screenHeight: Dimensions.get('screen').height,
  });

/** The frame of the keyboard that is open right now, if any. */
export const getCurrentKeyboardFrame = (): KeyboardFrame | null => {
  if (
    typeof Keyboard.isVisible !== 'function' ||
    typeof Keyboard.metrics !== 'function' ||
    !Keyboard.isVisible()
  ) {
    return null;
  }
  return readKeyboardFrame(Keyboard.metrics());
};
