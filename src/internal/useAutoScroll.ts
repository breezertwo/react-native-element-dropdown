import _debounce from 'lodash/debounce';
import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';
import { useCallback, useRef } from 'react';
import type { FlatList } from 'react-native';

interface UseAutoScrollParams<T> {
  autoScroll: boolean;
  data: T[];
  listData: T[];
  value: unknown;
  valueField: keyof T;
}

/**
 * Scrolls the open list to the selected item (Dropdown's `autoScroll`).
 * Called when the list's content size changes and when scrolling to an item
 * that isn't rendered yet fails.
 *
 * 2.x behaviour, rewritten in v3 plan phase 4: the debounce is recreated on
 * every render, the callback keeps the `listData` of the render where its
 * dependencies last changed, and passing a ref-reading callback to
 * `_debounce` during render breaks the React Compiler rules (react/refs).
 */
export const useAutoScroll = <T>({
  autoScroll,
  data,
  listData,
  value,
  valueField,
}: UseAutoScrollParams<T>) => {
  const listRef = useRef<FlatList<T>>(null);

  const scrollToValue = _debounce(
    // oxlint-disable-next-line react/exhaustive-deps, react/refs -- 2.x behaviour, see above
    useCallback(() => {
      if (
        autoScroll &&
        data?.length > 0 &&
        listData?.length === data?.length &&
        listRef.current
      ) {
        const selectedValue =
          typeof value === 'object' ? _get(value, valueField as string) : value;
        const index = _findIndex(listData, (item) =>
          _isEqual(selectedValue, _get(item, valueField as string))
        );
        if (listData.length > 0 && index > -1 && index <= listData.length - 1) {
          try {
            listRef.current.scrollToIndex({ index, animated: false });
          } catch (error) {
            console.warn(`scrollToIndex error: ${error}`);
          }
        }
      }
    }, [autoScroll, data.length, value, valueField]),
    200
  );

  return { listRef, scrollToValue };
};
