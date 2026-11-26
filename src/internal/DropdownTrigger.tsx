import { FIELD_ROLE, type TextScaling } from './a11y';
import type { TriggerInstance } from './placement/useDropdownPlacement';
import type { ReactElement, Ref } from 'react';
import { I18nManager, Image, Pressable, StyleSheet, Text } from 'react-native';
import type {
  ImageStyle,
  Insets,
  LayoutChangeEvent,
  StyleProp,
  TextProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

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
  /**
   * The style of the field (`style` prop). The field itself is the pressable
   * element, so its whole box, padding included, opens the list.
   */
  style?: StyleProp<ViewStyle>;
  /** Re-measures the field when its layout changes. */
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Extends the touch area (`hitSlop` prop). */
  hitSlop?: Insets | number;
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
  style,
  onLayout,
  hitSlop,
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
    <Pressable
      ref={ref}
      style={StyleSheet.flatten([triggerStyles.dropdown, style])}
      onLayout={onLayout}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={FIELD_ROLE}
      accessibilityValue={
        accessibilityValue ? { text: accessibilityValue } : undefined
      }
      aria-expanded={visible}
      aria-disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
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
    </Pressable>
  );
}

export const triggerStyles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
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
