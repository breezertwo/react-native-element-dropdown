import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { CTextInput } from './model';
import { styles } from './styles';

const ic_close = require('../../assets/close.png');

// The icon is 20pt; this makes the touch target 44pt.
const CLEAR_HIT_SLOP = 12;

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
    renderClearIcon,
    onChangeText = (_value: string) => {},
    renderLeftIcon,
    renderRightIcon,
  } = props;

  // Controlled when a value is given; it used to ignore an empty value, so
  // clearing the text from outside didn't clear the input.
  const [ownText, setOwnText] = useState<string>('');
  const isControlled = value !== undefined;
  const text = isControlled ? value : ownText;

  const onChange = (nextText: string) => {
    if (!isControlled) {
      setOwnText(nextText);
    }
    onChangeText(nextText);
  };

  const _renderRightIcon = () => {
    if (showIcon) {
      if (renderRightIcon) {
        return renderRightIcon();
      }
      if (text.length > 0) {
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearButtonLabel}
            hitSlop={CLEAR_HIT_SLOP}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => onChange('')}
          >
            {renderClearIcon ? (
              renderClearIcon()
            ) : (
              <Image
                source={ic_close}
                style={StyleSheet.flatten([styles.icon, iconStyle])}
              />
            )}
          </Pressable>
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
    // Claims touches around the input. Not an accessibility element: only
    // the input and the clear button are.
    <Pressable accessible={false} style={style}>
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
    </Pressable>
  );
};

export default TextInputComponent;
