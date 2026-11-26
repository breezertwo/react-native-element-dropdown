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

export type IDropdownRef = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/**
 * Props of `Dropdown`. `T` is the item type, inferred from `data`; `V` is the
 * key of the value field, inferred from `valueField`.
 */
export interface DropdownProps<T, V extends keyof T = keyof T> {
  ref?: React.Ref<IDropdownRef>;
  testID?: string;
  /** Item field with the row's testID (default: the label). */
  itemTestIDField?: keyof T;
  style?: StyleProp<ViewStyle>;
  /**
   * Extends the field's touch area beyond its bounds, e.g. to reach the
   * recommended 44pt (iOS) / 48dp (Android) without making it taller.
   */
  hitSlop?: Insets | number;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  selectedTextProps?: TextProps;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  /** Style of the label in selected rows, on top of itemTextStyle. */
  selectedItemTextStyle?: StyleProp<TextStyle>;
  inputSearchStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  maxHeight?: number;
  minHeight?: number;
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
  /** The selected item, or its value (the `valueField` of an item). */
  value?: T | T[V] | null;
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
  searchPlaceholder?: string;
  searchPlaceholderTextColor?: string;
  disable?: boolean;
  autoScroll?: boolean;
  showsVerticalScrollIndicator?: boolean;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  flatListProps?: Omit<FlatListProps<T>, 'renderItem' | 'data'>;
  keyboardAvoiding?: boolean;
  safeAreaInsets?: DropdownSafeAreaInsets;
  backgroundColor?: string;
  confirmSelectItem?: boolean;
  accessibilityLabel?: string;
  /**
   * Texts for screen readers (search label, chip labels, announcements).
   * Pass the ones to translate or reword; the rest keep their English
   * defaults.
   */
  accessibilityStrings?: Partial<DropdownAccessibilityStrings>;
  /** Item field with the row's screen reader label (default: the label). */
  itemAccessibilityLabelField?: keyof T;
  inverted?: boolean;
  mode?: 'default' | 'modal' | 'auto';
  closeModalWhenSelectedItem?: boolean;
  excludeItems?: readonly T[];
  excludeSearchItems?: readonly T[];
  onChange: (item: T) => void;
  renderLeftIcon?: (visible?: boolean) => React.ReactElement | null;
  renderRightIcon?: (visible?: boolean) => React.ReactElement | null;
  renderItem?: (item: T, selected?: boolean) => React.ReactElement | null;
  renderInputSearch?: (
    onSearch: (text: string) => void
  ) => React.ReactElement | null;
  onFocus?: () => void;
  onBlur?: () => void;
  searchQuery?: (keyword: string, labelValue: string) => boolean;
  onChangeText?: (search: string) => void;
  onConfirmSelectItem?: (item: T) => void;
}
