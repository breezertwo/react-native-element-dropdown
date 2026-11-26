import type { ReactElement, ReactNode } from 'react';
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { ImageStyle, StyleProp, TextStyle } from 'react-native';
import { ChevronIcon, triggerStyles } from '../../internal/DropdownTrigger';

interface InsideTriggerProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  /** The chips; the placeholder shows when there are none. */
  chips: ReactNode;
  placeholder: string;
  placeholderStyle?: StyleProp<TextStyle>;
  fontFamily?: string;
  // 2.x behaviour: unlike the default trigger, the icons don't get `visible`.
  renderLeftIcon?: () => ReactElement | null;
  renderRightIcon?: () => ReactElement | null;
  iconColor: string;
  iconStyle?: StyleProp<ImageStyle>;
}

/** The field of `<MultiSelect inside />`: chips inside the field. */
export function InsideTrigger({
  onPress,
  testID,
  accessibilityLabel,
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
    <TouchableWithoutFeedback
      testID={testID}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <View style={styles.field}>
        {renderLeftIcon?.()}
        {chips ?? (
          <Text
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
          renderRightIcon()
        ) : (
          <ChevronIcon color={iconColor} style={iconStyle} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 35,
  },
});
