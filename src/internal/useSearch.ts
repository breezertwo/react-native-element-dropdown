import _differenceWith from 'lodash/differenceWith';
import _get from 'lodash/get';
import { useCallback, useMemo, useState } from 'react';

/** Stable default for the exclude props, so the list isn't recomputed on every render. */
export const NO_ITEMS: readonly never[] = [];

/** Lowercase, without whitespace and accents, so "Crème Brûlée" matches "cremebru". */
export const normalizeSearchText = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface UseSearchParams<T> {
  data: readonly T[];
  labelField: keyof T;
  valueField: keyof T;
  searchField?: keyof T;
  searchQuery?: (keyword: string, labelValue: string) => boolean;
  /** Never shown. */
  excludeItems: readonly T[];
  /** Not shown while searching. */
  excludeSearchItems: readonly T[];
  onChangeText?: (search: string) => void;
}

/**
 * Search text and the list to show for it. The list is derived from the
 * data, the search text and the excluded items during render; keeping it in
 * state that an effect re-filtered broke search before (it reset or looped).
 */
export const useSearch = <T>({
  data,
  labelField,
  valueField,
  searchField,
  searchQuery,
  excludeItems,
  excludeSearchItems,
  onChangeText,
}: UseSearchParams<T>) => {
  const [searchText, setSearchText] = useState('');

  const isSameItem = useCallback(
    (a: T, b: T) =>
      _get(a, valueField as string) === _get(b, valueField as string),
    [valueField]
  );

  const listData = useMemo(() => {
    const available =
      excludeItems.length > 0
        ? _differenceWith(data, excludeItems, isSameItem)
        : data;
    if (searchText.length === 0) {
      return available;
    }

    const key = normalizeSearchText(searchText);
    const matches = available.filter((item) => {
      const label = _get(item, (searchField || labelField) as string);
      return searchQuery
        ? !!searchQuery(searchText, label)
        : normalizeSearchText(String(label ?? '')).includes(key);
    });
    return excludeSearchItems.length > 0
      ? _differenceWith(matches, excludeSearchItems, isSameItem)
      : matches;
  }, [
    data,
    excludeItems,
    excludeSearchItems,
    isSameItem,
    labelField,
    searchField,
    searchQuery,
    searchText,
  ]);

  /** For the search input: updates the text and reports it. */
  const onSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      onChangeText?.(text);
    },
    [onChangeText]
  );

  /** Clears the text without reporting it through onChangeText. */
  const clearSearch = useCallback(() => setSearchText(''), []);

  return { searchText, listData, onSearch, clearSearch };
};
