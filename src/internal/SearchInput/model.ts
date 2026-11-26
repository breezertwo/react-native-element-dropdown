import type React from 'react';
import type {
  ImageStyle,
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

interface Props extends TextInputProps {
  fontFamily?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  showIcon?: boolean;
  /** Screen reader label of the clear button. */
  clearButtonLabel?: string;
  renderRightIcon?: () => React.ReactElement | null;
  renderLeftIcon?: () => React.ReactElement | null;
}

export type CTextInput = React.FC<Props>;
