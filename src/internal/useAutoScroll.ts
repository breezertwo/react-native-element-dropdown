import { useCallback, useEffect, useRef } from 'react';
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

interface UseAutoScrollParams<T> {
  /** The `autoScroll` prop. */
  enabled: boolean;
  visible: boolean;
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
 * Shows the selected item when the list opens, once its content is laid out
 * (still before the list becomes visible).
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

  const cancelRetry = useCallback(() => {
    if (retryTimerRef.current != null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      hasScrolledRef.current = false;
      retriesRef.current = 0;
      cancelRetry();
    }
  }, [visible, cancelRetry]);

  useEffect(() => cancelRetry, [cancelRetry]);

  const onContentSizeChange = useCallback(() => {
    if (hasScrolledRef.current) {
      return;
    }
    hasScrolledRef.current = true;
    if (targetIndex > 0) {
      listRef.current?.scrollToIndex({ index: targetIndex, animated: false });
    }
  }, [targetIndex]);

  // Fallback when the row still isn't measured: jump close to it using the
  // average row height (unknown until the first rows are measured), then try
  // again once FlatList has rendered rows there.
  const onScrollToIndexFailed = useCallback(
    ({ index, averageItemLength }: ScrollToIndexFailedInfo) => {
      const list = listRef.current;
      if (!list || retriesRef.current >= MAX_RETRIES) {
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
        listRef.current?.scrollToIndex({ index, animated: false });
      }, RETRY_DELAY_MS);
    },
    [cancelRetry]
  );

  return {
    listRef,
    initialNumToRender: firstBatchSize,
    onContentSizeChange,
    onScrollToIndexFailed,
  };
};
