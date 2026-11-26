import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

/** FlatList's default `initialNumToRender`. */
const DEFAULT_INITIAL_NUM_TO_RENDER = 10;
/** Rows rendered after the selected one, to fill the list below it. */
const ROWS_AFTER_TARGET = 10;
/** Retries when the selected row isn't rendered yet. */
const MAX_RETRIES = 10;
/**
 * Wait between retries: about one FlatList render batch, so rows at the new
 * position are rendered and measured before the next attempt.
 */
const RETRY_DELAY_MS = 50;
/** Shows the list anyway after this long, e.g. when every retry failed. */
export const REVEAL_TIMEOUT_MS = MAX_RETRIES * RETRY_DELAY_MS + 100;
/** The selected row ends up in the middle of the list, with context around. */
const VIEW_POSITION = 0.5;

interface UseAutoScrollParams<T> {
  /** The `autoScroll` prop. */
  enabled: boolean;
  visible: boolean;
  /** Changes on every opening (`useDropdownState`). */
  openingId: number;
  /** The items the list shows. */
  listData: readonly T[];
  isSelected: (item: T) => boolean;
  /** The list's `initialNumToRender`, if the consumer sets it. */
  initialNumToRender?: number;
  /** Whether the consumer passes `getItemLayout` through flatListProps. */
  hasItemLayout?: boolean;
}

type ScrollToIndexFailedInfo = {
  index: number;
  averageItemLength: number;
};

/**
 * Opens the list at the selected item: once its content is laid out, it
 * scrolls the item to the middle, and `isScrolled` keeps the list hidden
 * until that scroll is on screen, so the list never visibly jumps.
 *
 * FlatList can only scroll to rows it has measured: without `getItemLayout`
 * it caps the space for unrendered rows at the last measured row, and
 * `initialScrollIndex` estimates the rows above, so scrolling up jumps. So
 * the first render batch includes every row up to the selected one (plus a
 * page after it). FlatList keeps that batch mounted, the scroll is exact and
 * scrolling up stays smooth. With `getItemLayout`, FlatList can scroll
 * anywhere and the batch stays as configured.
 *
 * Later content changes don't scroll again, so the list never snaps back.
 * The index comes from the items the list shows, so it is always in range.
 */
export const useAutoScroll = <T>({
  enabled,
  visible,
  openingId,
  listData,
  isSelected,
  initialNumToRender = DEFAULT_INITIAL_NUM_TO_RENDER,
  hasItemLayout = false,
}: UseAutoScrollParams<T>) => {
  const listRef = useRef<FlatList<T>>(null);
  const hasScrolledRef = useRef(false);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetIndex = enabled ? listData.findIndex(isSelected) : -1;
  // Only read by FlatList when it mounts, i.e. each time the list opens.
  const firstBatchSize =
    !hasItemLayout && targetIndex >= initialNumToRender
      ? targetIndex + 1 + ROWS_AFTER_TARGET
      : initialNumToRender;

  const failedRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  // The opening whose list is scrolled and may be shown.
  const [shownOpeningId, setShownOpeningId] = useState<number | null>(null);
  const isScrolled =
    !enabled || targetIndex <= 0 || shownOpeningId === openingId;
  const reveal = useCallback(() => setShownOpeningId(openingId), [openingId]);

  const cancelRetry = useCallback(() => {
    if (retryTimerRef.current != null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const cancelReveal = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      hasScrolledRef.current = false;
      retriesRef.current = 0;
      cancelRetry();
      cancelReveal();
    }
  }, [visible, cancelRetry, cancelReveal]);

  useEffect(
    () => () => {
      cancelRetry();
      cancelReveal();
    },
    [cancelRetry, cancelReveal]
  );

  // Never keep the list hidden for long, whatever happens to the scroll.
  useEffect(() => {
    if (!visible || isScrolled) {
      return;
    }
    const timer = setTimeout(reveal, REVEAL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [visible, isScrolled, reveal]);

  // The native scroll and the rows at the new position need about two
  // frames to appear on screen (seen in a screen recording on Android).
  const revealAfterFrames = useCallback(() => {
    cancelReveal();
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        reveal();
      });
    });
  }, [cancelReveal, reveal]);

  /** Scrolls to the row; shows the list unless FlatList can't reach it yet. */
  const scrollTo = useCallback(
    (index: number) => {
      failedRef.current = false;
      listRef.current?.scrollToIndex({
        index,
        animated: false,
        viewPosition: VIEW_POSITION,
      });
      // onScrollToIndexFailed runs during scrollToIndex.
      if (!failedRef.current) {
        revealAfterFrames();
      }
    },
    [revealAfterFrames]
  );

  const onContentSizeChange = useCallback(() => {
    if (hasScrolledRef.current) {
      return;
    }
    hasScrolledRef.current = true;
    if (targetIndex > 0) {
      scrollTo(targetIndex);
    } else {
      reveal();
    }
  }, [targetIndex, scrollTo, reveal]);

  // Fallback when the row still isn't measured: jump close to it using the
  // average row height (unknown until the first rows are measured), then try
  // again once FlatList has rendered rows there.
  const onScrollToIndexFailed = useCallback(
    ({ index, averageItemLength }: ScrollToIndexFailedInfo) => {
      failedRef.current = true;
      const list = listRef.current;
      if (!list || retriesRef.current >= MAX_RETRIES) {
        // Show the list where it is rather than keep it hidden.
        reveal();
        return;
      }
      retriesRef.current += 1;
      if (averageItemLength > 0) {
        list.scrollToOffset({
          offset: averageItemLength * index,
          animated: false,
        });
      }
      cancelRetry();
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        scrollTo(index);
      }, RETRY_DELAY_MS);
    },
    [cancelRetry, reveal, scrollTo]
  );

  return {
    isScrolled,
    listRef,
    initialNumToRender: firstBatchSize,
    onContentSizeChange,
    onScrollToIndexFailed,
  };
};
