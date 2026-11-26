import type { TextScaling } from './a11y';
import type { TriggerInstance } from './placement/useDropdownPlacement';
import type { ReactElement, ReactNode, Ref } from 'react';
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface DropdownOptionProps<T> {
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the texts. */
  textScaling?: TextScaling;
  /** The row, for moving screen reader focus to it. */
  ref?: Ref<TriggerInstance>;
  item: T;
  label: ReactNode;
  selected: boolean;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  /** radio (Dropdown) or checkbox (MultiSelect); reports `selected` as checked. */
  accessibilityRole: 'radio' | 'checkbox';
  /** Background while pressed and while selected. */
  activeColor: string;
  /** Extra style of the row while selected. */
  selectedStyle?: ViewStyle;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  fontFamily?: string;
  renderItem?: (item: T, selected?: boolean) => ReactElement | null;
}

/** One row in the list: `renderItem`, or the label in a padded row. */
export function DropdownOption<T>({
  textScaling,
  ref,
  item,
  label,
  selected,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityRole,
  activeColor,
  selectedStyle,
  itemContainerStyle,
  itemTextStyle,
  fontFamily,
  renderItem,
}: DropdownOptionProps<T>) {
  return (
    <TouchableHighlight
      ref={ref}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ checked: selected }}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      underlayColor={activeColor}
      onPress={onPress}
    >
      <View
        style={StyleSheet.flatten([
          itemContainerStyle,
          selected && { backgroundColor: activeColor, ...selectedStyle },
        ])}
      >
        {renderItem ? (
          renderItem(item, selected)
        ) : (
          <View style={styles.item}>
            <Text
              {...textScaling}
              style={StyleSheet.flatten([
                styles.text,
                itemTextStyle,
                fontFamily ? { fontFamily } : {},
              ])}
            >
              {label}
            </Text>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 17,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
