import type { ReactElement, ReactNode } from 'react';
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import type {
  AccessibilityRole,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

interface DropdownOptionProps<T> {
  item: T;
  label: ReactNode;
  selected: boolean;
  onPress: () => void;
  testID?: string;
  /** Only an accessibility element when the dropdown has a label (2.x). */
  accessible: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
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
  item,
  label,
  selected,
  onPress,
  testID,
  accessible,
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
      accessibilityRole={accessibilityRole}
      testID={testID}
      accessible={accessible}
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
