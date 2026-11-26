import { Platform } from 'react-native';

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
  /** Label of the "+N" chip of `chipsOverflow="collapse"`. */
  moreSelected: (count: number) => string;
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
  moreSelected: (count) => `${count} more selected`,
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

/** How texts follow the system font size (`allowFontScaling`, `maxFontSizeMultiplier`). */
export interface TextScaling {
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
}

type FieldRole = 'button' | 'dropdownlist' | 'combobox';

/**
 * The field's role, per platform, so screen readers announce it like a native
 * dropdown and as something to activate:
 * - iOS: `button`. VoiceOver has no combo box trait, and React Native gives
 *   `combobox` no trait or announcement there, so the field wouldn't sound
 *   activatable. (Like a native pop-up button: name, value, "button".)
 * - Android: `dropdownlist`, which React Native maps to the native Spinner
 *   class; TalkBack announces it as a drop-down list.
 * - Elsewhere (web): `combobox`.
 */
export const fieldRoleFor = (platform: typeof Platform.OS): FieldRole =>
  platform === 'ios'
    ? 'button'
    : platform === 'android'
      ? 'dropdownlist'
      : 'combobox';

export const FIELD_ROLE = fieldRoleFor(Platform.OS);
