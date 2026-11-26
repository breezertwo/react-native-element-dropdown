import { useEffect, useEffectEvent, useRef } from 'react';
import type { RefObject } from 'react';
import { AccessibilityInfo } from 'react-native';

type FocusTarget = Parameters<
  typeof AccessibilityInfo.sendAccessibilityEvent
>[0];

interface UseAccessibilityFocusParams {
  visible: boolean;
  /** Whether the open list is laid out and visible to screen readers. */
  isReady: boolean;
  /** Where focus goes in the open list: the search input or a row. */
  getListTarget: () => FocusTarget | null;
  /** The field, which gets focus back when the list closes. */
  triggerRef: RefObject<FocusTarget | null>;
}

const focus = (target: FocusTarget | null) => {
  if (target) {
    AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  }
};

/**
 * Moves screen reader focus into the list once it is shown, and back to the
 * field when it closes, so screen reader users don't have to search for
 * either. Does nothing visible without a screen reader.
 */
export const useAccessibilityFocus = ({
  visible,
  isReady,
  getListTarget,
  triggerRef,
}: UseAccessibilityFocusParams) => {
  const wasShownRef = useRef(false);
  const focusList = useEffectEvent(() => focus(getListTarget()));
  const focusTrigger = useEffectEvent(() => focus(triggerRef.current));

  useEffect(() => {
    if (visible && isReady && !wasShownRef.current) {
      wasShownRef.current = true;
      focusList();
    } else if (!visible && wasShownRef.current) {
      wasShownRef.current = false;
      focusTrigger();
    }
  }, [visible, isReady]);
};
