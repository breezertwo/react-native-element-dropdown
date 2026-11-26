import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef, RefObject } from 'react';
import {
  Dimensions,
  I18nManager,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  TurboModuleRegistry,
} from 'react-native';
import type {
  EmitterSubscription,
  KeyboardEvent,
  KeyboardMetrics,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

const GAP = 2;
const EDGE_MARGIN = 8;
const TRACK_MIN_DURATION = 500;
const TRACK_MAX_DURATION = 1500;
const TRACK_STABLE_FRAMES = 3;

/** Host instance of the trigger `View` (what `measureInWindow` is called on). */
export type TriggerInstance = ComponentRef<typeof View>;

export type DropdownPosition = 'auto' | 'top' | 'bottom';

export interface DropdownSafeAreaInsets {
  top?: number;
  bottom?: number;
}

export interface DropdownPlacement {
  isReady: boolean;
  isTopPosition: boolean;
  left: number;
  width: number;
  maxHeight: number;
  wrapperStyle: ViewStyle;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

interface KeyboardFrame {
  screenY: number;
  height: number;
}

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

export const hiddenStyle = {
  opacity: 0,
  pointerEvents: 'none',
} as ViewStyle;

let edgeToEdge: boolean | undefined;

const isAndroidEdgeToEdge = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (edgeToEdge === undefined) {
    try {
      const deviceInfo = TurboModuleRegistry.get('DeviceInfo') as unknown as {
        getConstants?: () => { isEdgeToEdge?: boolean };
      } | null;
      edgeToEdge =
        TurboModuleRegistry.get('RNEdgeToEdge') != null ||
        deviceInfo?.getConstants?.().isEdgeToEdge === true;
    } catch {
      edgeToEdge = false;
    }
  }
  return edgeToEdge;
};

const getWindowOffsetY = (): number =>
  Platform.OS === 'android' && !isAndroidEdgeToEdge()
    ? (StatusBar.currentHeight ?? 0)
    : 0;

const toKeyboardFrame = (
  metrics: KeyboardMetrics | undefined | null
): KeyboardFrame | null => {
  if (!metrics || !(metrics.height > 0)) {
    return null;
  }
  if (Platform.OS === 'ios') {
    const screenHeight = Dimensions.get('screen').height;
    const isHidden = metrics.screenY >= screenHeight;
    const isUndocked = metrics.screenY + metrics.height < screenHeight - 1;
    if (isHidden || isUndocked) {
      return null;
    }
  }
  return { screenY: metrics.screenY, height: metrics.height };
};

const getCurrentKeyboardFrame = (): KeyboardFrame | null => {
  if (
    typeof Keyboard.isVisible !== 'function' ||
    typeof Keyboard.metrics !== 'function' ||
    !Keyboard.isVisible()
  ) {
    return null;
  }
  return toKeyboardFrame(Keyboard.metrics());
};

const firstNumber = (...values: unknown[]): number => {
  const value = values.find((candidate) => candidate !== undefined);
  return typeof value === 'number' ? value : 0;
};

const getVerticalMargins = (style: StyleProp<ViewStyle>): number => {
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

const isSameRect = (a: Rect | null, b: Rect) =>
  !!a &&
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

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
  visibleRef.current = visible;
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
      setIsTriggerFresh(false);
      setModalSize(null);
      setContentHeight(null);
      setKeyboard(null);
      return;
    }

    setKeyboard(getCurrentKeyboardFrame());
    trackTrigger();

    const onFrame = (e: KeyboardEvent) => {
      setKeyboard(toKeyboardFrame(e.endCoordinates));
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

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setContentHeight((prev) =>
      prev != null && prev >= height ? prev : height
    );
  }, []);

  const verticalMargins = getVerticalMargins(containerStyle);
  const insetTop = safeAreaInsets?.top;
  const insetBottom = safeAreaInsets?.bottom;

  const placement = useMemo((): DropdownPlacement | null => {
    if (!trigger || !(trigger.width > 0)) {
      return null;
    }

    const windowSize = Dimensions.get('window');
    const screenHeight = modalSize?.height ?? windowSize.height;
    const screenWidth = modalSize?.width ?? windowSize.width;
    const isReady =
      modalSize != null &&
      isTriggerFresh &&
      (isFull || dropdownPosition !== 'auto' || contentHeight != null);

    const left = I18nManager.isRTL
      ? screenWidth - trigger.width - trigger.x
      : trigger.x;

    const topInset =
      insetTop ??
      (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
    const bottomInset = insetBottom ?? 0;
    const keyboardTop =
      keyboardAvoiding && keyboard
        ? Math.min(
            screenHeight,
            keyboard.screenY > 0
              ? keyboard.screenY
              : screenHeight - keyboard.height
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

    if (dropdownPosition !== 'auto') {
      const isTopPosition = dropdownPosition === 'top';
      return {
        isReady,
        isTopPosition,
        left,
        width: trigger.width,
        maxHeight,
        wrapperStyle: isTopPosition
          ? {
              justifyContent: 'flex-end',
              paddingBottom: Math.max(0, screenHeight - (trigger.y - GAP)),
            }
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
      maxHeight: Math.max(
        minHeight,
        Math.min(maxHeight, Math.floor(available))
      ),
      wrapperStyle: isTopPosition
        ? {
            justifyContent: 'flex-end',
            paddingBottom: Math.max(0, screenHeight - aboveEnd),
          }
        : { paddingTop: belowStart },
    };
  }, [
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
  ]);

  return {
    measure,
    placement,
    isKeyboardVisible: keyboard != null,
    onModalLayout,
    onContainerLayout,
  };
};
