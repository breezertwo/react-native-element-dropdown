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

interface SelectedChipsProps<T> {
  /** The selected items, in data order. */
  items: T[];
  /** Rendered inside the field instead of below it (`inside` prop). */
  inside: boolean;
  onUnselect: (item: T) => void;
  labelField: keyof T;
  valueField: keyof T;
  itemTestIDField?: string;
  itemAccessibilityLabelField?: string;
  /** Chips are only accessibility elements when the field has a label (2.x). */
  accessible: boolean;
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
  items,
  inside,
  onUnselect,
  labelField,
  valueField,
  itemTestIDField,
  itemAccessibilityLabelField,
  accessible,
  selectedStyle,
  selectedTextStyle,
  fontFamily,
  renderSelectedItem,
}: SelectedChipsProps<T>) {
  return (
    <View style={StyleSheet.flatten([styles.chips, inside && styles.inside])}>
      {items.map((item) => {
        const label = _get(item, labelField as string);
        return (
          <TouchableWithoutFeedback
            testID={_get(item, itemTestIDField || (labelField as string))}
            accessible={accessible}
            accessibilityLabel={_get(
              item,
              itemAccessibilityLabelField || (labelField as string)
            )}
            key={String(_get(item, valueField as string))}
            onPress={() => onUnselect(item)}
          >
            {renderSelectedItem ? (
              renderSelectedItem(item, () => onUnselect(item))
            ) : (
              <View style={StyleSheet.flatten([styles.chip, selectedStyle])}>
                <Text
                  style={StyleSheet.flatten([
                    styles.chipText,
                    selectedTextStyle,
                    fontFamily ? { fontFamily } : {},
                  ])}
                >
                  {label}
                </Text>
                <Text
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
    borderColor: 'gray',
    paddingHorizontal: 8,
    marginVertical: 6,
    marginRight: 8,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  removeIcon: {
    marginLeft: 5,
    color: 'gray',
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  chipText: {
    fontSize: 12,
    color: 'gray',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
