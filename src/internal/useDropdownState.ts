import {
  useCallback,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useState,
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
  /** Called right before the list opens (re-measures the trigger). */
  prepareOpen: () => void;
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
  prepareOpen,
  isKeyboardVisible,
  onFocus,
  onBlur,
  onDismiss,
}: UseDropdownStateParams) => {
  // Counts openings, so per-opening state can tell this opening from the
  // last one without resetting it in an effect.
  const [openingId, setOpeningId] = useState(0);

  const open = useCallback(() => {
    if (disable) {
      return;
    }
    prepareOpen();
    setOpeningId((id) => id + 1);
    setVisible(true);
    onFocus?.();
  }, [disable, prepareOpen, setVisible, onFocus]);

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
    if (nextVisible) {
      prepareOpen();
      setOpeningId((id) => id + 1);
    }
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
    prepareOpen,
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

  return { open, close, toggle, onPress, openingId };
};
