import { FIELD_ROLE, type TextScaling } from '../../internal/a11y';
import type { TriggerInstance } from '../../internal/placement/useDropdownPlacement';
import type { ReactElement, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { ImageStyle, Insets, StyleProp, TextStyle } from 'react-native';
import { ChevronIcon, triggerStyles } from '../../internal/DropdownTrigger';

interface InsideTriggerProps {
  /** Extends the touch area (`hitSlop` prop). */
  hitSlop?: Insets | number;
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the texts. */
  textScaling?: TextScaling;
  /** The accessibility element, for moving screen reader focus to it. */
  ref?: Ref<TriggerInstance>;
  /** The list's open state, for the icon render props. */
  visible: boolean;
  onPress: () => void;
  testID?: string;
  /** The field's name for screen readers. */
  accessibilityLabel: string;
  /** What is selected, read after the name (e.g. "2 selected"). */
  accessibilityValue?: string;
  disabled?: boolean;
  /**
   * The chips are inside this one accessibility element, so screen readers
   * can't reach them; offer removing each item as a custom action instead.
   */
  removeActions?: { label: string; onRemove: () => void }[];
  /** The chips; the placeholder shows when there are none. */
  chips: ReactNode;
  placeholder: string;
  placeholderStyle?: StyleProp<TextStyle>;
  fontFamily?: string;
  renderLeftIcon?: (visible?: boolean) => ReactElement | null;
  renderRightIcon?: (visible?: boolean) => ReactElement | null;
  iconColor: string;
  iconStyle?: StyleProp<ImageStyle>;
}

/** The field of `<MultiSelect inside />`: chips inside the field. */
export function InsideTrigger({
  hitSlop,
  textScaling,
  ref,
  visible,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityValue,
  disabled = false,
  removeActions = [],
  chips,
  placeholder,
  placeholderStyle,
  fontFamily,
  renderLeftIcon,
  renderRightIcon,
  iconColor,
  iconStyle,
}: InsideTriggerProps) {
  return (
    <Pressable
      ref={ref}
      style={styles.field}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={FIELD_ROLE}
      accessibilityValue={
        accessibilityValue ? { text: accessibilityValue } : undefined
      }
      aria-expanded={visible}
      aria-disabled={disabled}
      accessibilityActions={removeActions.map((action, index) => ({
        name: `remove-${index}`,
        label: action.label,
      }))}
      onAccessibilityAction={(event) => {
        const index = Number(event.nativeEvent.actionName.split('-')[1]);
        removeActions[index]?.onRemove();
      }}
      onPress={onPress}
    >
      {renderLeftIcon?.(visible)}
      {chips ?? (
        <Text
          {...textScaling}
          style={StyleSheet.flatten([
            triggerStyles.text,
            placeholderStyle,
            fontFamily ? { fontFamily } : {},
          ])}
        >
          {placeholder}
        </Text>
      )}
      {renderRightIcon ? (
        renderRightIcon(visible)
      ) : (
        <ChevronIcon color={iconColor} style={iconStyle} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 35,
  },
});
