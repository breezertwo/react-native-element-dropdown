import { useCallback, useEffect, useRef } from 'react';
import type { FlatList } from 'react-native';

/** Retries when the selected row isn't rendered yet. */
const MAX_RETRIES = 3;

interface UseAutoScrollParams<T> {
  /** The `autoScroll` prop. */
  enabled: boolean;
  visible: boolean;
  /** The items the list shows. */
  listData: T[];
  isSelected: (item: T) => boolean;
}

type ScrollToIndexFailedInfo = {
  index: number;
  averageItemLength: number;
};

/**
 * Scrolls the list to the selected item once each time it opens, as soon as
 * its content is laid out (still before the list becomes visible). Later
 * content changes, e.g. more rows rendering while the user scrolls, don't
 * scroll again. The index comes from the items the list shows, so it is
 * always in range, also while searching.
 */
export const useAutoScroll = <T>({
  enabled,
  visible,
  listData,
  isSelected,
}: UseAutoScrollParams<T>) => {
  const listRef = useRef<FlatList<T>>(null);
  const hasScrolledRef = useRef(false);
  const retriesRef = useRef(0);
  const retryFrameRef = useRef<number | null>(null);

  const cancelRetry = useCallback(() => {
    if (retryFrameRef.current != null) {
      cancelAnimationFrame(retryFrameRef.current);
      retryFrameRef.current = null;
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
    if (!enabled || hasScrolledRef.current) {
      return;
    }
    hasScrolledRef.current = true;
    const index = listData.findIndex(isSelected);
    if (index > -1) {
      listRef.current?.scrollToIndex({ index, animated: false });
    }
  }, [enabled, listData, isSelected]);

  // FlatList can only scroll to rows it has rendered. Jump close to the row
  // using the average row height, then try again on the next frame.
  const onScrollToIndexFailed = useCallback(
    ({ index, averageItemLength }: ScrollToIndexFailedInfo) => {
      const list = listRef.current;
      if (!list || retriesRef.current >= MAX_RETRIES) {
        return;
      }
      retriesRef.current += 1;
      list.scrollToOffset({
        offset: averageItemLength * index,
        animated: false,
      });
      cancelRetry();
      retryFrameRef.current = requestAnimationFrame(() => {
        retryFrameRef.current = null;
        listRef.current?.scrollToIndex({ index, animated: false });
      });
    },
    [cancelRetry]
  );

  return { listRef, onContentSizeChange, onScrollToIndexFailed };
};
