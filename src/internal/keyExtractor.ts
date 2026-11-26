import _get from 'lodash/get';

/**
 * Keys list rows by their value, so a row keeps its identity when the list is
 * filtered or reordered. Items without a value fall back to their position.
 */
export const createKeyExtractor =
  (valueField: PropertyKey) =>
  (item: unknown, index: number): string => {
    const value = _get(item, valueField as string);
    return value != null ? `value-${String(value)}` : `index-${index}`;
  };
