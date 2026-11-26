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
  /** Can't be pressed; dimmed and reported as disabled. */
  disabled?: boolean;
  /** Style of the row while disabled (default: half opacity). */
  disabledStyle?: StyleProp<ViewStyle>;
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
  /** Color of the default checkmark on selected rows. */
  selectedIconColor: string;
  /** Replaces the checkmark; return null to hide it. */
  renderSelectedIcon?: () => ReactElement | null;
}

/**
 * The default mark of a selected row, drawn with two borders so it takes the
 * color directly. Decorative: screen readers get the checked state instead.
 */
function Checkmark({ color }: { color: string }) {
  return (
    <View
      testID="dropdown-selected-icon"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.checkmark, { borderColor: color }]}
    />
  );
}

/** One row in the list: `renderItem`, or the label in a padded row. */
export function DropdownOption<T>({
  textScaling,
  ref,
  item,
  label,
  selected,
  disabled = false,
  disabledStyle,
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
  selectedIconColor,
  renderSelectedIcon,
}: DropdownOptionProps<T>) {
  return (
    <TouchableHighlight
      ref={ref}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      underlayColor={activeColor}
      onPress={onPress}
    >
      <View
        style={StyleSheet.flatten([
          itemContainerStyle,
          selected && { backgroundColor: activeColor, ...selectedStyle },
          disabled && [styles.disabled, disabledStyle],
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
            {selected &&
              (renderSelectedIcon ? (
                renderSelectedIcon()
              ) : (
                <Checkmark color={selectedIconColor} />
              ))}
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
  disabled: {
    opacity: 0.5,
  },
  checkmark: {
    width: 7,
    height: 13,
    marginHorizontal: 4,
    marginBottom: 3,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});
