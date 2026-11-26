import type { TextScaling } from './a11y';
import type { TriggerInstance } from './placement/useDropdownPlacement';
import type { ReactElement, Ref } from 'react';
import {
  I18nManager,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { ImageStyle, StyleProp, TextProps, TextStyle } from 'react-native';

const chevronDown = require('../assets/down.png');

interface ChevronIconProps {
  color: string;
  style?: StyleProp<ImageStyle>;
}

/** The default right icon of the field. */
export function ChevronIcon({ color, style }: ChevronIconProps) {
  return (
    <Image
      source={chevronDown}
      style={StyleSheet.flatten([
        triggerStyles.icon,
        { tintColor: color },
        style,
      ])}
    />
  );
}

interface DropdownTriggerProps {
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the texts. */
  textScaling?: TextScaling;
  /** The accessibility element, for moving screen reader focus to it. */
  ref?: Ref<TriggerInstance>;
  /** The list's open state, for aria-expanded and the icon render props. */
  visible: boolean;
  onPress: () => void;
  testID?: string;
  /** The field's name for screen readers. */
  accessibilityLabel: string;
  /** What is selected, read after the name (e.g. "Banana", "2 selected"). */
  accessibilityValue?: string;
  disabled?: boolean;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  textProps?: TextProps;
  fontFamily?: string;
  renderLeftIcon?: (visible?: boolean) => ReactElement | null;
  renderRightIcon?: (visible?: boolean) => ReactElement | null;
  iconColor: string;
  iconStyle?: StyleProp<ImageStyle>;
}

/**
 * The field that opens the list: left icon, text and right icon. Screen
 * readers get it as one combo box with its name, the selection as its value,
 * and whether the list is expanded.
 */
export function DropdownTrigger({
  textScaling,
  ref,
  visible,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityValue,
  disabled = false,
  text,
  textStyle,
  textProps,
  fontFamily,
  renderLeftIcon,
  renderRightIcon,
  iconColor,
  iconStyle,
}: DropdownTriggerProps) {
  return (
    <TouchableWithoutFeedback
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="combobox"
      accessibilityValue={
        accessibilityValue ? { text: accessibilityValue } : undefined
      }
      aria-expanded={visible}
      aria-disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <View ref={ref} style={triggerStyles.dropdown}>
        {renderLeftIcon?.(visible)}
        <Text
          {...textScaling}
          style={[
            triggerStyles.text,
            textStyle,
            fontFamily ? { fontFamily } : {},
          ]}
          {...textProps}
        >
          {text}
        </Text>
        {renderRightIcon ? (
          renderRightIcon(visible)
        ) : (
          <ChevronIcon color={iconColor} style={iconStyle} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export const triggerStyles = StyleSheet.create({
  dropdown: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  icon: {
    width: 20,
    height: 20,
  },
});
