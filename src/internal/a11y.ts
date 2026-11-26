/**
 * Texts the dropdowns give to screen readers. Pass `accessibilityStrings` to
 * translate or reword any of them.
 */
export interface DropdownAccessibilityStrings {
  /** Label of the search input when there is no `searchPlaceholder`. */
  search: string;
  /** Label of the button that clears the search input. */
  clearSearch: string;
  /** Value of a MultiSelect field, e.g. "2 selected". */
  selectedCount: (count: number) => string;
  /** Label of a MultiSelect chip, which removes its item. */
  removeItem: (label: string) => string;
  /** Announced after an item was added to a MultiSelect. */
  itemSelected: (label: string) => string;
  /** Announced after an item was removed from a MultiSelect. */
  itemRemoved: (label: string) => string;
  /** Announced after the search text changed. */
  searchResults: (count: number) => string;
}

export const defaultAccessibilityStrings: DropdownAccessibilityStrings = {
  search: 'Search',
  clearSearch: 'Clear search',
  selectedCount: (count) => `${count} selected`,
  removeItem: (label) => `Remove ${label}`,
  itemSelected: (label) => `${label} selected`,
  itemRemoved: (label) => `${label} removed`,
  searchResults: (count) => (count === 1 ? '1 result' : `${count} results`),
};

export const resolveAccessibilityStrings = (
  strings?: Partial<DropdownAccessibilityStrings>
): DropdownAccessibilityStrings =>
  strings
    ? { ...defaultAccessibilityStrings, ...strings }
    : defaultAccessibilityStrings;
