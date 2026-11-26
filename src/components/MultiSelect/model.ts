import type React from 'react';
import type { DropdownAccessibilityStrings } from '../../internal/a11y';
import type { DropdownSafeAreaInsets } from '../../internal/placement/useDropdownPlacement';
import type {
  FlatListProps,
  ImageStyle,
  Insets,
  StyleProp,
  TextProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export interface IMultiSelectRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Props of `MultiSelect`. `T` is the item type, inferred from `data`; `V` is
 * the key of the value field, inferred from `valueField`. The value is an
 * array of `T[V]`.
 */
export interface MultiSelectProps<T, V extends keyof T = keyof T> {
  ref?: React.Ref<IMultiSelectRef>;
  testID?: string;
  /** Item field with the row's and chip's testID (default: the label). */
  itemTestIDField?: keyof T;
  style?: StyleProp<ViewStyle>;
  /**
   * Extends the field's touch area beyond its bounds, e.g. to reach the
   * recommended 44pt (iOS) / 48dp (Android) without making it taller.
   */
  hitSlop?: Insets | number;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  /**
   * Style of the placeholder in the field while items are selected, on top
   * of placeholderStyle (the field keeps showing the placeholder; the
   * selection is in the chips). Not used with `inside`, where chips replace
   * the placeholder.
   */
  selectedPlaceholderStyle?: StyleProp<TextStyle>;
  /** The box around the search input and its clear button. */
  searchContainerStyle?: StyleProp<ViewStyle>;
  /** The search text input. */
  inputSearchStyle?: StyleProp<TextStyle>;
  /** Replaces the icon of the search's clear button (the button stays). */
  renderSearchClearIcon?: () => React.ReactElement | null;
  selectedStyle?: StyleProp<ViewStyle>;
  selectedTextProps?: TextProps;
  selectedTextStyle?: StyleProp<TextStyle>;
  /** Style of the chips' ⓧ icon, on top of selectedTextStyle. */
  chipRemoveIconStyle?: StyleProp<TextStyle>;
  /**
   * Replaces the ⓧ icon of a chip; return null to hide it. Not used with
   * renderSelectedItem, which replaces the whole chip.
   */
  renderChipRemoveIcon?: (item: T) => React.ReactElement | null;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  /** Style of the label in selected rows, on top of itemTextStyle. */
  selectedItemTextStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  maxHeight?: number;
  minHeight?: number;
  maxSelect?: number;
  fontFamily?: string;
  /**
   * Whether texts follow the system font size (default: true). Keep it on
   * for accessibility; use maxFontSizeMultiplier to cap very large sizes.
   */
  allowFontScaling?: boolean;
  /** Largest font scale for the texts, e.g. 1.5. */
  maxFontSizeMultiplier?: number;
  iconColor?: string;
  /** Color of the checkmark on selected rows (default: iconColor). */
  selectedIconColor?: string;
  /**
   * Replaces the checkmark on selected rows; return null to hide it. Not
   * used with renderItem, which gets `selected` to draw its own mark.
   */
  renderSelectedIcon?: () => React.ReactElement | null;
  activeColor?: string;
  data: readonly T[];
  /** The values (the `valueField` of the items) of the selected items. */
  value?: readonly T[V][] | null;
  placeholder?: string;
  labelField: keyof T;
  valueField: V;
  /**
   * Item field that disables the item when truthy: its row can't be
   * pressed, is dimmed and is reported as disabled to screen readers.
   */
  disabledField?: keyof T;
  /** Style of disabled rows (default: half opacity). */
  disabledItemStyle?: StyleProp<ViewStyle>;
  searchField?: keyof T;
  search?: boolean;
  disable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  searchPlaceholder?: string;
  searchPlaceholderTextColor?: string;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  flatListProps?: Omit<FlatListProps<T>, 'renderItem' | 'data'>;
  alwaysRenderSelectedItem?: boolean;
  visibleSelectedItem?: boolean;
  keyboardAvoiding?: boolean;
  safeAreaInsets?: DropdownSafeAreaInsets;
  inside?: boolean;
  backgroundColor?: string;
  confirmSelectItem?: boolean;
  confirmUnSelectItem?: boolean;
  accessibilityLabel?: string;
  /**
   * Texts for screen readers (search label, chip labels, announcements).
   * Pass the ones to translate or reword; the rest keep their English
   * defaults.
   */
  accessibilityStrings?: Partial<DropdownAccessibilityStrings>;
  /** Item field with the screen reader label of rows and chips (default: the label). */
  itemAccessibilityLabelField?: keyof T;
  inverted?: boolean;
  mode?: 'default' | 'modal' | 'auto';
  excludeItems?: readonly T[];
  excludeSearchItems?: readonly T[];
  onChange: (values: T[V][]) => void;
  renderLeftIcon?: (visible?: boolean) => React.ReactElement | null;
  renderRightIcon?: (visible?: boolean) => React.ReactElement | null;
  renderItem?: (item: T, selected?: boolean) => React.ReactElement | null;
  /**
   * Replaces a chip. `unSelect` removes the item; it is undefined for
   * disabled items, which can't be removed.
   */
  renderSelectedItem?: (
    item: T,
    unSelect?: (item: T) => void
  ) => React.ReactElement | null;
  renderInputSearch?: (
    onSearch: (text: string) => void
  ) => React.ReactElement | null;
  onFocus?: () => void;
  onBlur?: () => void;
  searchQuery?: (keyword: string, labelValue: string) => boolean;
  onChangeText?: (search: string) => void;
  /**
   * With `confirmSelectItem` / `confirmUnSelectItem`: called instead of
   * `onChange`, with the values the selection would change to. Update your
   * state once the user confirmed.
   */
  onConfirmSelectItem?: (values: T[V][]) => void;
}
