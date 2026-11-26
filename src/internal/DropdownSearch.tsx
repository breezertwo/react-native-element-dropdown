import type { ComponentRef, ReactElement, Ref } from 'react';
import { StyleSheet } from 'react-native';
import type { ImageStyle, StyleProp, TextInput, TextStyle } from 'react-native';
import type { DropdownAccessibilityStrings, TextScaling } from './a11y';
import SearchInput from './SearchInput';

interface DropdownSearchProps {
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the input. */
  textScaling?: TextScaling;
  /** The built-in input, for moving screen reader focus to it. */
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
  searchText: string;
  onSearch: (text: string) => void;
  /** Replaces the built-in input (`renderInputSearch` prop). */
  renderInputSearch?: (onSearch: (text: string) => void) => ReactElement | null;
  testID?: string;
  placeholder?: string;
  strings: DropdownAccessibilityStrings;
  placeholderTextColor: string;
  /** Applied to both the input's container and the input (2.x behaviour). */
  inputSearchStyle?: StyleProp<TextStyle>;
  fontFamily?: string;
  iconColor: string;
  iconStyle?: StyleProp<ImageStyle>;
}

/** The search input above (or below) the list. */
export function DropdownSearch({
  textScaling,
  inputRef,
  searchText,
  onSearch,
  renderInputSearch,
  testID,
  placeholder,
  strings,
  placeholderTextColor,
  inputSearchStyle,
  fontFamily,
  iconColor,
  iconStyle,
}: DropdownSearchProps) {
  if (renderInputSearch) {
    return renderInputSearch(onSearch);
  }

  return (
    <SearchInput
      {...textScaling}
      ref={inputRef}
      testID={testID + ' input'}
      accessibilityLabel={placeholder || strings.search}
      accessibilityRole="search"
      clearButtonLabel={strings.clearSearch}
      style={[styles.input, inputSearchStyle]}
      inputStyle={[inputSearchStyle, fontFamily ? { fontFamily } : {}]}
      value={searchText}
      autoCorrect={false}
      placeholder={placeholder}
      onChangeText={onSearch}
      placeholderTextColor={placeholderTextColor}
      showIcon
      iconStyle={[{ tintColor: iconColor }, iconStyle]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    paddingHorizontal: 8,
    marginBottom: 8,
    margin: 6,
    // A minimum, so large system font sizes aren't cut off.
    minHeight: 45,
  },
});
