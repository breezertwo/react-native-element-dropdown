import type React from 'react';
import type { DropdownAccessibilityStrings } from '../../internal/a11y';
import type { DropdownSafeAreaInsets } from '../../internal/placement/useDropdownPlacement';
import type {
  FlatListProps,
  ImageStyle,
  Insets,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TextProps } from 'react-native';

export interface IMultiSelectRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface MultiSelectProps<T> {
  ref?:
    | React.RefObject<IMultiSelectRef>
    | React.MutableRefObject<IMultiSelectRef>
    | null
    | undefined;
  testID?: string;
  itemTestIDField?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Extends the field's touch area beyond its bounds, e.g. to reach the
   * recommended 44pt (iOS) / 48dp (Android) without making it taller.
   */
  hitSlop?: Insets | number;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  inputSearchStyle?: StyleProp<TextStyle>;
  selectedStyle?: StyleProp<ViewStyle>;
  selectedTextProps?: TextProps;
  selectedTextStyle?: StyleProp<TextStyle>;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
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
  activeColor?: string;
  data: T[];
  value?: string[] | null | undefined;
  placeholder?: string;
  labelField: keyof T;
  valueField: keyof T;
  searchField?: keyof T;
  search?: boolean;
  disable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  searchPlaceholder?: string;
  searchPlaceholderTextColor?: string;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  flatListProps?: Omit<FlatListProps<any>, 'renderItem' | 'data'>;
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
  itemAccessibilityLabelField?: string;
  inverted?: boolean;
  mode?: 'default' | 'modal' | 'auto';
  excludeItems?: T[];
  excludeSearchItems?: T[];
  onChange: (value: string[]) => void;
  renderLeftIcon?: (visible?: boolean) => React.ReactElement | null;
  renderRightIcon?: (visible?: boolean) => React.ReactElement | null;
  renderItem?: (item: T, selected?: boolean) => React.ReactElement | null;
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
  onConfirmSelectItem?: (item: any) => void;
}
