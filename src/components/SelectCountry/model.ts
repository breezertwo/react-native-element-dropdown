import type { ImageStyle } from 'react-native';
import type { DropdownProps } from '../Dropdown/model';

/**
 * @deprecated `SelectCountry` will be removed in v3.0.0. Use `Dropdown` with
 * `renderLeftIcon` and `renderItem` instead, and `IDropdownRef` for its ref.
 * See the README section "SelectCountry (deprecated)".
 */
export type ISelectCountryRef = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/**
 * @deprecated `SelectCountry` will be removed in v3.0.0. Use `Dropdown` with
 * `renderLeftIcon` and `renderItem` instead, and `DropdownProps` for its
 * props. See the README section "SelectCountry (deprecated)".
 */
export interface SelectCountryProps<T> extends DropdownProps<T> {
  imageField: string;
  imageStyle?: ImageStyle;
}
