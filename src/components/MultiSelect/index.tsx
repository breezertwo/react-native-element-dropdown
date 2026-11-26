/* eslint-disable @typescript-eslint/no-shadow */
import _get from 'lodash/get';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDetectDevice } from '../../toolkits';
import { useDeviceOrientation } from '../../useDeviceOrientation';
import {
  useDropdownPlacement,
  type TriggerInstance,
} from '../../internal/placement/useDropdownPlacement';
import { useDropdownState } from '../../internal/useDropdownState';
import { DropdownList } from '../../internal/DropdownList';
import { DropdownModal } from '../../internal/DropdownModal';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import CInput from '../TextInput';
import { IMultiSelectRef, MultiSelectProps } from './model';
import { styles } from './styles';

const { isTablet } = useDetectDevice;
const ic_down = require('../../assets/down.png');

const MultiSelectComponent = React.forwardRef<
  IMultiSelectRef,
  MultiSelectProps<any>
>((props, currentRef) => {
  const orientation = useDeviceOrientation();
  const {
    testID,
    itemTestIDField,
    onChange,
    data = [],
    value,
    style = {},
    labelField,
    valueField,
    searchField,
    selectedStyle,
    selectedTextStyle,
    itemContainerStyle,
    itemTextStyle,
    iconStyle,
    selectedTextProps = {},
    activeColor = '#F6F7F8',
    containerStyle,
    fontFamily,
    placeholderStyle,
    iconColor = 'gray',
    inputSearchStyle,
    searchPlaceholder,
    searchPlaceholderTextColor = 'gray',
    placeholder = 'Select item',
    search = false,
    maxHeight = 340,
    minHeight = 0,
    maxSelect,
    disable = false,
    keyboardAvoiding = true,
    inside = false,
    inverted = true,
    renderItem,
    renderLeftIcon,
    renderRightIcon,
    renderSelectedItem,
    renderInputSearch,
    onFocus,
    onBlur,
    showsVerticalScrollIndicator = true,
    dropdownPosition = 'auto',
    flatListProps,
    alwaysRenderSelectedItem = false,
    searchQuery,
    backgroundColor,
    onChangeText,
    confirmSelectItem,
    confirmUnSelectItem,
    onConfirmSelectItem,
    accessibilityLabel,
    itemAccessibilityLabelField,
    visibleSelectedItem = true,
    mode = 'default',
    excludeItems = NO_ITEMS,
    excludeSearchItems = NO_ITEMS,
    safeAreaInsets,
  } = props;

  const ref = useRef<TriggerInstance>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<any[]>([]);
  const [, setKey] = useState<number>(Math.random());
  const nativeId = useRef(
    `multiselectdropdown-${Math.random().toString(16).slice(2)}`
  ).current;

  const isFull =
    !isTablet &&
    mode !== 'auto' &&
    (mode === 'modal' || orientation === 'LANDSCAPE');

  const {
    measure: _measure,
    placement,
    isKeyboardVisible,
    onModalLayout,
    onContainerLayout,
  } = useDropdownPlacement({
    triggerRef: ref,
    visible,
    isFull,
    dropdownPosition,
    maxHeight,
    minHeight,
    keyboardAvoiding,
    safeAreaInsets,
    containerStyle,
  });

  const { searchText, listData, onSearch, clearSearch } = useSearch({
    data,
    labelField,
    valueField,
    searchField,
    searchQuery,
    excludeItems,
    excludeSearchItems,
    onChangeText,
  });

  const { onPress: showOrClose } = useDropdownState({
    ref: currentRef,
    visible,
    setVisible,
    disable,
    measure: _measure,
    isKeyboardVisible,
    onFocus,
    onBlur,
    onDismiss: clearSearch,
  });

  const font = useCallback(() => {
    if (fontFamily) {
      return {
        fontFamily: fontFamily,
      };
    } else {
      return {};
    }
  }, [fontFamily]);

  const getValue = useCallback(() => {
    setCurrentValue(value ? [...value] : []);
  }, [value]);

  useEffect(() => {
    getValue();
  }, [getValue, value]);

  const onSelect = useCallback(
    (item: any) => {
      const newCurrentValue = [...currentValue];
      const index = newCurrentValue.findIndex(
        (e) => e === _get(item, valueField)
      );
      if (index > -1) {
        newCurrentValue.splice(index, 1);
      } else {
        if (maxSelect) {
          if (newCurrentValue.length < maxSelect) {
            newCurrentValue.push(_get(item, valueField));
          }
        } else {
          newCurrentValue.push(_get(item, valueField));
        }
      }

      if (onConfirmSelectItem) {
        if (index > -1) {
          if (confirmUnSelectItem) {
            onConfirmSelectItem(newCurrentValue);
          } else {
            onChange(newCurrentValue);
          }
        } else {
          if (confirmSelectItem) {
            onConfirmSelectItem(newCurrentValue);
          } else {
            onChange(newCurrentValue);
          }
        }
      } else {
        onChange(newCurrentValue);
      }

      setKey(Math.random());
    },
    [
      confirmSelectItem,
      confirmUnSelectItem,
      currentValue,
      maxSelect,
      onChange,
      onConfirmSelectItem,
      valueField,
    ]
  );

  const _renderDropdown = () => {
    return (
      <TouchableWithoutFeedback
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessible={!!accessibilityLabel}
        aria-controls={nativeId}
        aria-expanded={visible}
        onPress={showOrClose}
      >
        <View style={styles.dropdown}>
          {renderLeftIcon?.(visible)}
          <Text
            style={StyleSheet.flatten([
              styles.textItem,
              placeholderStyle,
              font(),
            ])}
            {...selectedTextProps}
          >
            {placeholder}
          </Text>
          {renderRightIcon ? (
            renderRightIcon(visible)
          ) : (
            <Image
              source={ic_down}
              style={StyleSheet.flatten([
                styles.icon,
                { tintColor: iconColor },
                iconStyle,
              ])}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const checkSelected = useCallback(
    (item: any) => {
      const index = currentValue.findIndex((e) => e === _get(item, valueField));
      return index > -1;
    },
    [currentValue, valueField]
  );

  const _renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const selected = checkSelected(item);
      return (
        <TouchableHighlight
          key={index.toString()}
          testID={_get(item, itemTestIDField || labelField)}
          accessible={!!accessibilityLabel}
          accessibilityLabel={_get(
            item,
            itemAccessibilityLabelField || labelField
          )}
          underlayColor={activeColor}
          onPress={() => onSelect(item)}
        >
          <View
            style={StyleSheet.flatten([
              itemContainerStyle,
              selected && {
                backgroundColor: activeColor,
                ...styles.wrapItem,
              },
            ])}
          >
            {renderItem ? (
              renderItem(item, selected)
            ) : (
              <View style={styles.item}>
                <Text
                  style={StyleSheet.flatten([
                    styles.textItem,
                    itemTextStyle,
                    font(),
                  ])}
                >
                  {_get(item, labelField)}
                </Text>
              </View>
            )}
          </View>
        </TouchableHighlight>
      );
    },
    [
      accessibilityLabel,
      activeColor,
      checkSelected,
      font,
      itemAccessibilityLabelField,
      itemContainerStyle,
      itemTestIDField,
      itemTextStyle,
      labelField,
      onSelect,
      renderItem,
    ]
  );

  const renderSearch = useCallback(() => {
    if (search) {
      if (renderInputSearch) {
        return renderInputSearch(onSearch);
      } else {
        return (
          <CInput
            testID={testID + ' input'}
            accessibilityLabel={accessibilityLabel + ' input'}
            style={[styles.input, inputSearchStyle]}
            inputStyle={[inputSearchStyle, font()]}
            value={searchText}
            autoCorrect={false}
            placeholder={searchPlaceholder}
            onChangeText={onSearch}
            showIcon
            placeholderTextColor={searchPlaceholderTextColor}
            iconStyle={[{ tintColor: iconColor }, iconStyle]}
          />
        );
      }
    }
    return null;
  }, [
    accessibilityLabel,
    font,
    iconColor,
    iconStyle,
    inputSearchStyle,
    onSearch,
    renderInputSearch,
    search,
    searchPlaceholder,
    searchPlaceholderTextColor,
    searchText,
    testID,
  ]);

  const _renderModal = () => {
    if (!visible || !placement) {
      return null;
    }

    return (
      <DropdownModal
        placement={placement}
        isFull={isFull}
        isLandscape={orientation === 'LANDSCAPE'}
        minHeight={minHeight}
        backgroundColor={backgroundColor}
        containerStyle={containerStyle}
        onRequestClose={showOrClose}
        onModalLayout={onModalLayout}
        onContainerLayout={onContainerLayout}
      >
        <DropdownList
          isTopPosition={placement.isTopPosition}
          inverted={inverted}
          search={renderSearch()}
          captureTouches
          defaultListProps={{
            testID: testID + ' flatlist',
            accessibilityLabel: accessibilityLabel + ' flatlist',
          }}
          flatListProps={flatListProps}
          listProps={{
            data: listData,
            nativeID: nativeId,
            renderItem: _renderItem,
            keyExtractor: (_item, index) => index.toString(),
            showsVerticalScrollIndicator,
          }}
        />
      </DropdownModal>
    );
  };

  const unSelect = (item: any) => {
    if (!disable) {
      onSelect(item);
    }
  };

  const _renderItemSelected = (inside: boolean) => {
    const selectedValues = value ?? [];
    const list = data.filter((e: any) =>
      selectedValues.includes(_get(e, valueField))
    );

    return (
      <View
        style={StyleSheet.flatten([
          styles.rowSelectedItem,
          inside && styles.flex1,
        ])}
      >
        {list.map((e) => {
          if (renderSelectedItem) {
            return (
              <TouchableWithoutFeedback
                testID={_get(e, itemTestIDField || labelField)}
                accessible={!!accessibilityLabel}
                accessibilityLabel={_get(
                  e,
                  itemAccessibilityLabelField || labelField
                )}
                key={_get(e, labelField)}
                onPress={() => unSelect(e)}
              >
                {renderSelectedItem(e, () => {
                  unSelect(e);
                })}
              </TouchableWithoutFeedback>
            );
          } else {
            return (
              <TouchableWithoutFeedback
                testID={_get(e, itemTestIDField || labelField)}
                accessible={!!accessibilityLabel}
                accessibilityLabel={_get(
                  e,
                  itemAccessibilityLabelField || labelField
                )}
                key={_get(e, labelField)}
                onPress={() => unSelect(e)}
              >
                <View
                  style={StyleSheet.flatten([
                    styles.selectedItem,
                    selectedStyle,
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.selectedTextLeftItem,
                      selectedTextStyle,
                      font(),
                    ])}
                  >
                    {_get(e, labelField)}
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.selectedTextItem,
                      selectedTextStyle,
                    ])}
                  >
                    ⓧ
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            );
          }
        })}
      </View>
    );
  };

  const _renderInside = () => {
    return (
      <View
        style={StyleSheet.flatten([styles.mainWrap, style])}
        ref={ref}
        onLayout={_measure}
      >
        {_renderDropdownInside()}
        {_renderModal()}
      </View>
    );
  };

  const _renderDropdownInside = () => {
    return (
      <TouchableWithoutFeedback
        testID={testID}
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        onPress={showOrClose}
      >
        <View style={styles.dropdownInside}>
          {renderLeftIcon?.()}
          {value && value?.length > 0 ? (
            _renderItemSelected(true)
          ) : (
            <Text
              style={StyleSheet.flatten([
                styles.textItem,
                placeholderStyle,
                font(),
              ])}
            >
              {placeholder}
            </Text>
          )}
          {renderRightIcon ? (
            renderRightIcon()
          ) : (
            <Image
              source={ic_down}
              style={StyleSheet.flatten([
                styles.icon,
                { tintColor: iconColor },
                iconStyle,
              ])}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  if (inside) {
    return _renderInside();
  }

  return (
    <>
      <View
        style={StyleSheet.flatten([styles.mainWrap, style])}
        ref={ref}
        onLayout={_measure}
      >
        {_renderDropdown()}
        {_renderModal()}
      </View>
      {(!visible || alwaysRenderSelectedItem) &&
        visibleSelectedItem &&
        _renderItemSelected(false)}
    </>
  );
});

export default MultiSelectComponent;
