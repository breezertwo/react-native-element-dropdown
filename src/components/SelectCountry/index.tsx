import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import Dropdown from '../Dropdown';
import { ISelectCountryRef, SelectCountryProps } from './model';
import { styles } from './styles';

export const SELECT_COUNTRY_DEPRECATION_MESSAGE =
  '[@breezertwo/react-native-element-dropdown] `SelectCountry` is deprecated ' +
  'and will be removed in v3.0.0. Use `Dropdown` with `renderLeftIcon` and ' +
  '`renderItem` instead: ' +
  'https://github.com/breezertwo/react-native-element-dropdown#selectcountry-deprecated';

let hasWarnedDeprecation = false;

const warnDeprecationOnce = () => {
  if (__DEV__ && !hasWarnedDeprecation) {
    hasWarnedDeprecation = true;
    console.warn(SELECT_COUNTRY_DEPRECATION_MESSAGE);
  }
};

/**
 * @deprecated `SelectCountry` will be removed in v3.0.0. Use `Dropdown` with
 * `renderLeftIcon` (selected image) and `renderItem` (image + label rows)
 * instead.
 */
const SelectCountryComponent = React.forwardRef<
  ISelectCountryRef,
  SelectCountryProps<any>
>((props, currentRef) => {
  useEffect(() => {
    warnDeprecationOnce();
  }, []);

  const {
    data,
    value,
    valueField,
    labelField,
    imageField,
    selectedTextStyle,
    imageStyle,
  } = props;
  const ref: any = useRef(null);

  useImperativeHandle(currentRef, () => {
    return { open: eventOpen, close: eventClose, toggle: eventToggle };
  });

  const eventOpen = () => {
    ref.current.open();
  };

  const eventClose = () => {
    ref.current.close();
  };

  const eventToggle = () => {
    ref.current.toggle();
  };

  const _renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        <Image source={item[imageField]} style={[styles.image, imageStyle]} />
        <Text style={[styles.selectedTextStyle, selectedTextStyle]}>
          {item[labelField]}
        </Text>
      </View>
    );
  };

  const selectItem: any = useMemo(() => {
    const index = data.findIndex((e: any) => e[valueField] === value);
    return data[index];
  }, [data, valueField, value]);

  return (
    <Dropdown
      ref={ref}
      {...props}
      renderItem={_renderItem}
      renderLeftIcon={() => {
        if (selectItem?.image) {
          return (
            <Image
              source={selectItem.image}
              style={[styles.image, imageStyle]}
            />
          );
        } else {
          return null;
        }
      }}
    />
  );
});

export default SelectCountryComponent;
