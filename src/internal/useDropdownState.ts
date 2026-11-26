import {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
} from 'react';
import type { Ref } from 'react';
import { Keyboard } from 'react-native';

/** The methods both components expose through their ref. */
export interface DropdownHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface UseDropdownStateParams {
  ref?: Ref<DropdownHandle>;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  disable: boolean;
  /** Re-measures the trigger before the list opens. */
  measure: () => void;
  isKeyboardVisible: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Called when the user closes the list (trigger, backdrop or back button). */
  onDismiss?: () => void;
}

/**
 * Opening and closing the list, for the ref methods and for the user.
 * A disabled dropdown ignores all of them.
 */
export const useDropdownState = ({
  ref,
  visible,
  setVisible,
  disable,
  measure,
  isKeyboardVisible,
  onFocus,
  onBlur,
  onDismiss,
}: UseDropdownStateParams) => {
  const open = useCallback(() => {
    if (disable) {
      return;
    }
    measure();
    setVisible(true);
    onFocus?.();
  }, [disable, measure, setVisible, onFocus]);

  const close = useCallback(() => {
    if (disable) {
      return;
    }
    setVisible(false);
    onBlur?.();
  }, [disable, setVisible, onBlur]);

  const toggle = useCallback(() => {
    if (visible) {
      close();
    } else {
      open();
    }
  }, [visible, close, open]);

  /**
   * The trigger, the backdrop and the Android back button. While the
   * keyboard is open, the first press only dismisses the keyboard.
   */
  const onPress = useCallback(() => {
    if (disable) {
      return;
    }
    const nextVisible = !visible;
    if (isKeyboardVisible && !nextVisible) {
      Keyboard.dismiss();
      return;
    }
    if (!nextVisible) {
      onDismiss?.();
    }
    measure();
    setVisible(nextVisible);
    if (nextVisible) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  }, [
    disable,
    visible,
    isKeyboardVisible,
    onDismiss,
    measure,
    setVisible,
    onFocus,
    onBlur,
  ]);

  useImperativeHandle(ref, () => ({ open, close, toggle }));

  const blurIfOpen = useEffectEvent(() => {
    if (visible) {
      onBlur?.();
    }
  });
  useEffect(() => () => blurIfOpen(), []);

  return { open, close, toggle, onPress };
};
