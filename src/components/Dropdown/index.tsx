/* eslint-disable @typescript-eslint/no-shadow */
import _debounce from 'lodash/debounce';
import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
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
import { DropdownSearch } from '../../internal/DropdownSearch';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import { DropdownProps, IDropdownRef } from './model';
import { styles } from './styles';

const { isTablet } = useDetectDevice;
const ic_down = require('../../assets/down.png');

const DropdownComponent = React.forwardRef<IDropdownRef, DropdownProps<any>>(
  (props, currentRef) => {
    const orientation = useDeviceOrientation();
    const {
      testID,
      itemTestIDField,
      onChange,
      style = {},
      containerStyle,
      placeholderStyle,
      selectedTextStyle,
      itemContainerStyle,
      itemTextStyle,
      inputSearchStyle,
      iconStyle,
      selectedTextProps = {},
      data = [],
      labelField,
      valueField,
      searchField,
      value,
      activeColor = '#F6F7F8',
      fontFamily,
      iconColor = 'gray',
      searchPlaceholder,
      searchPlaceholderTextColor = 'gray',
      placeholder = 'Select item',
      search = false,
      maxHeight = 340,
      minHeight = 0,
      disable = false,
      keyboardAvoiding = true,
      inverted = true,
      renderLeftIcon,
      renderRightIcon,
      renderItem,
      renderInputSearch,
      onFocus,
      onBlur,
      autoScroll = true,
      showsVerticalScrollIndicator = true,
      dropdownPosition = 'auto',
      flatListProps,
      searchQuery,
      backgroundColor,
      onChangeText,
      confirmSelectItem,
      onConfirmSelectItem,
      accessibilityLabel,
      itemAccessibilityLabelField,
      mode = 'default',
      closeModalWhenSelectedItem = true,
      excludeItems = NO_ITEMS,
      excludeSearchItems = NO_ITEMS,
      safeAreaInsets,
    } = props;

    const ref = useRef<TriggerInstance>(null);
    const refList = useRef<FlatList>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [currentValue, setCurrentValue] = useState<any>(null);
    const nativeId = useRef(
      `dropdown-${Math.random().toString(16).slice(2)}`
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

    const dismissSearch = useCallback(() => {
      onChangeText?.('');
      clearSearch();
    }, [onChangeText, clearSearch]);

    const { close: eventClose, onPress: showOrClose } = useDropdownState({
      ref: currentRef,
      visible,
      setVisible,
      disable,
      measure: _measure,
      isKeyboardVisible,
      onFocus,
      onBlur,
      onDismiss: dismissSearch,
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
      const defaultValue =
        typeof value === 'object' ? _get(value, valueField) : value;

      const getItem = data.filter((e) =>
        _isEqual(defaultValue, _get(e, valueField))
      );

      if (getItem.length > 0) {
        setCurrentValue(getItem[0]);
      } else {
        setCurrentValue(null);
      }
    }, [data, value, valueField]);

    useEffect(() => {
      getValue();
    }, [value, data, getValue]);

    const scrollIndex = _debounce(
      useCallback(() => {
        if (
          autoScroll &&
          data?.length > 0 &&
          listData?.length === data?.length
        ) {
          if (refList && refList?.current) {
            const defaultValue =
              typeof value === 'object' ? _get(value, valueField) : value;

            const index = _findIndex(listData, (e) =>
              _isEqual(defaultValue, _get(e, valueField))
            );
            if (
              listData?.length > 0 &&
              index > -1 &&
              index <= listData?.length - 1
            ) {
              try {
                refList.current.scrollToIndex({
                  index: index,
                  animated: false,
                });
              } catch (error) {
                console.warn(`scrollToIndex error: ${error}`);
              }
            }
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [autoScroll, data.length, value, valueField]), // to fix Maximum Depth Exceeded warning | removed listData from dependency array
      200
    );

    const onSelect = useCallback(
      (item: any) => {
        if (confirmSelectItem && onConfirmSelectItem) {
          return onConfirmSelectItem(item);
        }

        setCurrentValue(item);
        onChange(item);

        if (closeModalWhenSelectedItem) {
          onChangeText?.('');
          clearSearch();
          eventClose();
        }
      },
      [
        confirmSelectItem,
        eventClose,
        onChange,
        onChangeText,
        clearSearch,
        onConfirmSelectItem,
        closeModalWhenSelectedItem,
      ]
    );

    const _renderDropdown = () => {
      const isSelected = currentValue && _get(currentValue, valueField);
      return (
        <TouchableWithoutFeedback
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessible={!!accessibilityLabel}
          aria-controls={nativeId}
          aria-expanded={visible}
          onPress={showOrClose}
          testID={testID}
        >
          <View style={styles.dropdown}>
            {renderLeftIcon?.(visible)}
            <Text
              style={[
                styles.textItem,
                isSelected !== null ? selectedTextStyle : placeholderStyle,
                font(),
              ]}
              {...selectedTextProps}
            >
              {isSelected !== null
                ? _get(currentValue, labelField)
                : placeholder}
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

    const _renderItem = useCallback(
      ({ item, index }: { item: any; index: number }) => {
        const isSelected = currentValue && _get(currentValue, valueField);
        const selected = _isEqual(_get(item, valueField), isSelected);
        return (
          <TouchableHighlight
            accessibilityRole="radio"
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
        currentValue,
        font,
        itemAccessibilityLabelField,
        itemContainerStyle,
        itemTestIDField,
        itemTextStyle,
        labelField,
        onSelect,
        renderItem,
        valueField,
      ]
    );

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
            search={
              search ? (
                <DropdownSearch
                  searchText={searchText}
                  onSearch={onSearch}
                  renderInputSearch={renderInputSearch}
                  testID={testID}
                  accessibilityLabel={accessibilityLabel}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={searchPlaceholderTextColor}
                  inputSearchStyle={inputSearchStyle}
                  fontFamily={fontFamily}
                  iconColor={iconColor}
                  iconStyle={iconStyle}
                />
              ) : null
            }
            defaultListProps={{
              accessibilityRole: 'radiogroup',
              testID: testID + ' flatlist',
              accessibilityLabel: accessibilityLabel + ' flatlist',
            }}
            flatListProps={flatListProps}
            listProps={{
              ref: refList,
              onContentSizeChange: scrollIndex,
              onScrollToIndexFailed: scrollIndex,
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

    return (
      <View
        style={StyleSheet.flatten([styles.mainWrap, style])}
        ref={ref}
        onLayout={_measure}
      >
        {_renderDropdown()}
        {_renderModal()}
      </View>
    );
  }
);

export default DropdownComponent;
