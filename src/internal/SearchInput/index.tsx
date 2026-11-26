/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState } from 'react';
import {
  Image,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import type { CTextInput } from './model';
import { styles } from './styles';

const ic_close = require('../../assets/close.png');

const TextInputComponent: CTextInput = (props) => {
  const {
    fontFamily,
    style,
    value,
    placeholderTextColor = '#000',
    placeholder = '',
    showIcon,
    clearButtonLabel = 'Clear search',
    inputStyle,
    iconStyle,
    onChangeText = (_value: string) => {},
    renderLeftIcon,
    renderRightIcon,
  } = props;

  // Controlled when a value is given; it used to ignore an empty value, so
  // clearing the text from outside didn't clear the input.
  const [ownText, setOwnText] = useState<string>('');
  const isControlled = value !== undefined;
  const text = isControlled ? value : ownText;

  const onChange = (text: string) => {
    if (!isControlled) {
      setOwnText(text);
    }
    onChangeText(text);
  };

  const _renderRightIcon = () => {
    if (showIcon) {
      if (renderRightIcon) {
        return renderRightIcon();
      }
      if (text.length > 0) {
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={clearButtonLabel}
            onPress={() => onChange('')}
          >
            <Image
              source={ic_close}
              style={StyleSheet.flatten([styles.icon, iconStyle])}
            />
          </TouchableOpacity>
        );
      }
      return null;
    }
    return null;
  };

  const font = () => {
    if (fontFamily) {
      return {
        fontFamily: fontFamily,
      };
    } else {
      return {};
    }
  };

  return (
    // Not an accessibility element: only the input and the clear button are.
    <TouchableWithoutFeedback accessible={false}>
      <View style={[style]}>
        <View style={styles.textInput}>
          {renderLeftIcon?.()}
          <TextInput
            {...props}
            style={StyleSheet.flatten([styles.input, inputStyle, font()])}
            value={text}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            onChangeText={onChange}
          />
          {_renderRightIcon()}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TextInputComponent;
