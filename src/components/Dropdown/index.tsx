/* eslint-disable @typescript-eslint/no-shadow */
import _debounce from 'lodash/debounce';
import _findIndex from 'lodash/findIndex';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { useDetectDevice } from '../../toolkits';
import { useDeviceOrientation } from '../../useDeviceOrientation';
import {
  hiddenStyle,
  useDropdownPlacement,
  type TriggerInstance,
} from '../../internal/placement/useDropdownPlacement';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import CInput from '../TextInput';
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

    const { width: W } = Dimensions.get('window');
    const styleContainerVertical: ViewStyle = useMemo(() => {
      return {
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
      };
    }, []);
    const styleHorizontal: ViewStyle = useMemo(() => {
      return {
        width: orientation === 'LANDSCAPE' ? W / 2 : '100%',
        alignSelf: 'center',
      };
    }, [W, orientation]);

    useImperativeHandle(currentRef, () => {
      return { open: eventOpen, close: eventClose, toggle: eventToggle };
    });

    useEffect(() => {
      return eventClose;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const eventOpen = useCallback(() => {
      if (!disable) {
        _measure();
        setVisible(true);
        if (onFocus) {
          onFocus();
        }
      }
    }, [disable, onFocus, _measure]);

    const eventClose = useCallback(() => {
      if (!disable) {
        setVisible(false);
        if (onBlur) {
          onBlur();
        }
      }
    }, [disable, onBlur]);

    const eventToggle = useCallback(() => {
      if (visible) {
        eventClose();
      } else {
        eventOpen();
      }
    }, [visible, eventClose, eventOpen]);

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

    const showOrClose = useCallback(() => {
      if (!disable) {
        const visibleStatus = !visible;

        if (isKeyboardVisible && !visibleStatus) {
          return Keyboard.dismiss();
        }

        if (!visibleStatus) {
          onChangeText?.('');
          clearSearch();
        }

        _measure();
        setVisible(visibleStatus);

        if (visibleStatus) {
          if (onFocus) {
            onFocus();
          }
        } else {
          if (onBlur) {
            onBlur();
          }
        }
      }
    }, [
      disable,
      isKeyboardVisible,
      visible,
      _measure,
      onChangeText,
      clearSearch,
      onFocus,
      onBlur,
    ]);

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
              placeholderTextColor={searchPlaceholderTextColor}
              showIcon
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
      testID,
      searchText,
    ]);

    const _renderList = useCallback(
      (isTopPosition: boolean) => {
        const isInverted = !inverted ? false : isTopPosition;

        const _renderListHelper = () => {
          return (
            <FlatList
              accessibilityRole="radiogroup"
              testID={testID + ' flatlist'}
              accessibilityLabel={accessibilityLabel + ' flatlist'}
              {...flatListProps}
              keyboardShouldPersistTaps="handled"
              ref={refList}
              onContentSizeChange={scrollIndex}
              onScrollToIndexFailed={scrollIndex}
              data={listData}
              inverted={isTopPosition ? inverted : false}
              nativeID={nativeId}
              renderItem={_renderItem}
              keyExtractor={(_item, index) => index.toString()}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            />
          );
        };

        return (
          <View style={styles.flexShrink}>
            {isInverted && _renderListHelper()}
            {renderSearch()}
            {!isInverted && _renderListHelper()}
          </View>
        );
      },
      [
        _renderItem,
        accessibilityLabel,
        flatListProps,
        listData,
        inverted,
        renderSearch,
        scrollIndex,
        showsVerticalScrollIndicator,
        testID,
        nativeId,
      ]
    );

    const _renderModal = useCallback(() => {
      if (!visible || !placement) {
        return null;
      }

      const {
        isReady,
        isTopPosition,
        left,
        width,
        maxHeight: containerMaxHeight,
        wrapperStyle,
      } = placement;

      const styleVertical: ViewStyle = {
        left: left,
        maxHeight: containerMaxHeight,
        minHeight: minHeight,
      };

      return (
        <Modal
          transparent
          statusBarTranslucent
          visible={visible}
          supportedOrientations={['landscape', 'portrait']}
          onRequestClose={showOrClose}
        >
          <View
            onStartShouldSetResponder={() => true}
            onResponderRelease={showOrClose}
            onLayout={onModalLayout}
            style={styles.flex1}
          >
            <View
              style={StyleSheet.flatten([
                styles.flex1,
                isFull && styleContainerVertical,
                !!backgroundColor && { backgroundColor: backgroundColor },
              ])}
            >
              <View
                style={StyleSheet.flatten([
                  styles.flex1,
                  wrapperStyle,
                  isFull && styles.fullScreen,
                ])}
              >
                <View
                  onLayout={onContainerLayout}
                  accessibilityElementsHidden={!isReady}
                  importantForAccessibility={
                    isReady ? 'auto' : 'no-hide-descendants'
                  }
                  style={StyleSheet.flatten([
                    styles.container,
                    isFull
                      ? [styleHorizontal, { maxHeight: containerMaxHeight }]
                      : styleVertical,
                    {
                      width,
                    },
                    containerStyle,
                    !isReady && hiddenStyle,
                  ])}
                >
                  {_renderList(isTopPosition)}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      );
    }, [
      visible,
      placement,
      minHeight,
      isFull,
      showOrClose,
      onModalLayout,
      onContainerLayout,
      styleContainerVertical,
      backgroundColor,
      containerStyle,
      styleHorizontal,
      _renderList,
    ]);

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
