import { DEFAULT_GRAY } from '../../internal/colors';
import type { TextScaling } from '../../internal/a11y';
import _get from 'lodash/get';
import type { ReactElement } from 'react';
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { DropdownAccessibilityStrings } from '../../internal/a11y';

// Chips are about 35pt high; this makes the touch target at least 44pt.
const CHIP_HIT_SLOP = { top: 6, bottom: 6 };

interface SelectedChipsProps<T> {
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the texts. */
  textScaling?: TextScaling;
  /** The selected items, in data order. */
  items: T[];
  /** Disabled items can't be removed; their chips are dimmed. */
  isDisabled: (item: T) => boolean;
  /** Rendered inside the field instead of below it (`inside` prop). */
  inside: boolean;
  onUnselect: (item: T) => void;
  labelField: keyof T;
  valueField: keyof T;
  itemTestIDField?: keyof T;
  itemAccessibilityLabelField?: keyof T;
  strings: DropdownAccessibilityStrings;
  selectedStyle?: StyleProp<ViewStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  fontFamily?: string;
  renderSelectedItem?: (
    item: T,
    unSelect?: (item: T) => void
  ) => ReactElement | null;
}

/** A chip per selected item; pressing one unselects its item. */
export function SelectedChips<T>({
  textScaling,
  items,
  isDisabled,
  inside,
  onUnselect,
  labelField,
  valueField,
  itemTestIDField,
  itemAccessibilityLabelField,
  strings,
  selectedStyle,
  selectedTextStyle,
  fontFamily,
  renderSelectedItem,
}: SelectedChipsProps<T>) {
  return (
    <View style={StyleSheet.flatten([styles.chips, inside && styles.inside])}>
      {items.map((item) => {
        const label = _get(item, labelField);
        const disabled = isDisabled(item);
        return (
          <TouchableWithoutFeedback
            disabled={disabled}
            accessibilityState={{ disabled }}
            testID={_get(item, itemTestIDField || labelField)}
            accessibilityRole="button"
            accessibilityLabel={strings.removeItem(
              String(_get(item, itemAccessibilityLabelField || labelField))
            )}
            hitSlop={CHIP_HIT_SLOP}
            key={String(_get(item, valueField))}
            onPress={() => onUnselect(item)}
          >
            {renderSelectedItem ? (
              renderSelectedItem(
                item,
                disabled ? undefined : () => onUnselect(item)
              )
            ) : (
              <View
                style={StyleSheet.flatten([
                  styles.chip,
                  selectedStyle,
                  disabled && styles.disabled,
                ])}
              >
                <Text
                  {...textScaling}
                  style={StyleSheet.flatten([
                    styles.chipText,
                    selectedTextStyle,
                    fontFamily ? { fontFamily } : {},
                  ])}
                >
                  {label}
                </Text>
                <Text
                  {...textScaling}
                  style={StyleSheet.flatten([
                    styles.removeIcon,
                    selectedTextStyle,
                  ])}
                >
                  ⓧ
                </Text>
              </View>
            )}
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
  },
  inside: {
    flex: 1,
  },
  chip: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: DEFAULT_GRAY,
    paddingHorizontal: 8,
    marginVertical: 6,
    marginRight: 8,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  removeIcon: {
    marginLeft: 5,
    color: DEFAULT_GRAY,
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  chipText: {
    fontSize: 12,
    color: DEFAULT_GRAY,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
