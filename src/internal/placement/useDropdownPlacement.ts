import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ComponentRef, RefObject } from 'react';
import {
  Dimensions,
  I18nManager,
  Keyboard,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import type {
  EmitterSubscription,
  KeyboardEvent,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  computePlacement,
  getVerticalMargins,
  type DropdownPlacement,
  type DropdownPosition,
  type DropdownSafeAreaInsets,
  type Rect,
  type Size,
} from './computePlacement';
import { getWindowOffsetY } from './edgeToEdge';
import {
  getCurrentKeyboardFrame,
  readKeyboardFrame,
  type KeyboardFrame,
} from './keyboard';

export type {
  DropdownPlacement,
  DropdownPosition,
  DropdownSafeAreaInsets,
} from './computePlacement';

// After opening (or a keyboard or window change), keep re-measuring the
// trigger every frame until it stops moving, e.g. while a screen transition
// or the keyboard animation moves it.
const TRACK_MIN_DURATION = 500;
const TRACK_MAX_DURATION = 1500;
const TRACK_STABLE_FRAMES = 3;

/** Host instance of the trigger `View` (what `measureInWindow` is called on). */
export type TriggerInstance = ComponentRef<typeof View>;

interface UseDropdownPlacementParams {
  triggerRef: RefObject<TriggerInstance | null>;
  visible: boolean;
  isFull: boolean;
  dropdownPosition: DropdownPosition;
  maxHeight: number;
  minHeight: number;
  keyboardAvoiding: boolean;
  safeAreaInsets?: DropdownSafeAreaInsets;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Keeps the list invisible and untouchable until its placement is ready. */
export const hiddenStyle = {
  opacity: 0,
  pointerEvents: 'none',
} as ViewStyle;

const isSameRect = (a: Rect | null, b: Rect) =>
  !!a &&
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

/**
 * Measures the trigger, the modal and the list content, follows the keyboard
 * and window changes while the list is open, and returns where to put the
 * list (see `computePlacement`).
 */
export const useDropdownPlacement = ({
  triggerRef,
  visible,
  isFull,
  dropdownPosition,
  maxHeight,
  minHeight,
  keyboardAvoiding,
  safeAreaInsets,
  containerStyle,
}: UseDropdownPlacementParams) => {
  const [trigger, setTrigger] = useState<Rect | null>(null);
  const [isTriggerFresh, setIsTriggerFresh] = useState(false);
  const [modalSize, setModalSize] = useState<Size | null>(null);
  const [keyboard, setKeyboard] = useState<KeyboardFrame | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const visibleRef = useRef(visible);
  useLayoutEffect(() => {
    visibleRef.current = visible;
  }, [visible]);
  const trackingRef = useRef(0);

  const measureTrigger = useCallback(
    (onMeasured?: (rect: Rect) => void) => {
      const node = triggerRef.current;
      if (!node) {
        return false;
      }
      node.measureInWindow((x, y, width, height) => {
        const next = { x, y: y + getWindowOffsetY(), width, height };
        setTrigger((prev) => (isSameRect(prev, next) ? prev : next));
        if (visibleRef.current) {
          setIsTriggerFresh(true);
        }
        onMeasured?.(next);
      });
      return true;
    },
    [triggerRef]
  );

  const measure = useCallback(() => {
    measureTrigger();
  }, [measureTrigger]);

  /**
   * Call right before opening: forgets the measurements of the last opening
   * and measures the trigger and the keyboard again. It runs in the same
   * event as the opening, so the list never renders with stale sizes.
   */
  const prepareOpen = useCallback(() => {
    setIsTriggerFresh(false);
    setModalSize(null);
    setContentHeight(null);
    setKeyboard(getCurrentKeyboardFrame());
    measureTrigger();
  }, [measureTrigger]);

  const stopTracking = useCallback(() => {
    trackingRef.current += 1;
  }, []);

  const trackTrigger = useCallback(() => {
    const id = ++trackingRef.current;
    const startedAt = Date.now();
    let last: Rect | null = null;
    let stableFrames = 0;

    const tick = () => {
      if (id !== trackingRef.current || !visibleRef.current) {
        return;
      }
      const hasNode = measureTrigger((rect) => {
        if (id !== trackingRef.current) {
          return;
        }
        stableFrames = isSameRect(last, rect) ? stableFrames + 1 : 0;
        last = rect;
        const elapsed = Date.now() - startedAt;
        const isSettled =
          elapsed >= TRACK_MIN_DURATION && stableFrames >= TRACK_STABLE_FRAMES;
        if (!isSettled && elapsed < TRACK_MAX_DURATION) {
          requestAnimationFrame(tick);
        }
      });
      if (!hasNode) {
        stopTracking();
      }
    };

    tick();
  }, [measureTrigger, stopTracking]);

  useEffect(() => stopTracking, [stopTracking]);

  useEffect(() => {
    if (!visible) {
      stopTracking();
      return;
    }

    trackTrigger();

    const onFrame = (e: KeyboardEvent) => {
      setKeyboard(readKeyboardFrame(e.endCoordinates));
      trackTrigger();
    };
    const onHide = () => {
      setKeyboard(null);
      trackTrigger();
    };

    const subscriptions: (EmitterSubscription | undefined)[] = [
      Keyboard.addListener('keyboardDidShow', onFrame),
      Keyboard.addListener('keyboardDidHide', onHide),
      Dimensions.addEventListener('change', trackTrigger),
    ];
    if (Platform.OS === 'ios') {
      subscriptions.push(
        Keyboard.addListener('keyboardWillChangeFrame', onFrame),
        Keyboard.addListener('keyboardWillHide', onHide)
      );
    }

    return () => {
      subscriptions.forEach((subscription) => subscription?.remove?.());
    };
  }, [visible, trackTrigger, stopTracking]);

  const onModalLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setModalSize((prev) =>
      prev && prev.width === width && prev.height === height
        ? prev
        : { width, height }
    );
  }, []);

  // Only grows: the measured content height feeds back into maxHeight, so a
  // shrinking value could make the list jump between above and below.
  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setContentHeight((prev) =>
      prev != null && prev >= height ? prev : height
    );
  }, []);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const verticalMargins = getVerticalMargins(containerStyle);
  const insetTop = safeAreaInsets?.top;
  const insetBottom = safeAreaInsets?.bottom;

  const placement = useMemo(
    (): DropdownPlacement | null =>
      computePlacement({
        trigger,
        isTriggerFresh,
        modalSize,
        windowSize: { width: windowWidth, height: windowHeight },
        contentHeight,
        keyboard: keyboardAvoiding ? keyboard : null,
        isFull,
        isRTL: I18nManager.isRTL,
        dropdownPosition,
        maxHeight,
        minHeight,
        safeAreaInsets: { top: insetTop, bottom: insetBottom },
        defaultTopInset:
          Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
        verticalMargins,
      }),
    [
      trigger,
      modalSize,
      isTriggerFresh,
      isFull,
      contentHeight,
      insetTop,
      insetBottom,
      keyboardAvoiding,
      keyboard,
      minHeight,
      maxHeight,
      verticalMargins,
      dropdownPosition,
      windowWidth,
      windowHeight,
    ]
  );

  return {
    measure,
    prepareOpen,
    placement,
    // Keyboard events are only followed while the list is open.
    isKeyboardVisible: visible && keyboard != null,
    onModalLayout,
    onContainerLayout,
  };
};
