/* eslint-disable @typescript-eslint/no-shadow */
import { DEFAULT_GRAY } from '../../internal/colors';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';

import {
  useCallback,
  useId,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TextInput } from 'react-native';
import {
  useDropdownPlacement,
  type TriggerInstance,
} from '../../internal/placement/useDropdownPlacement';
import { useAutoScroll } from '../../internal/useAutoScroll';
import { useDropdownState } from '../../internal/useDropdownState';
import { resolveAccessibilityStrings } from '../../internal/a11y';
import { DropdownList } from '../../internal/DropdownList';
import { DropdownModal } from '../../internal/DropdownModal';
import { DropdownOption } from '../../internal/DropdownOption';
import { DropdownSearch } from '../../internal/DropdownSearch';
import { useAccessibilityFocus } from '../../internal/useAccessibilityFocus';
import { useAnnounceSearchResults } from '../../internal/useAnnounceSearchResults';
import { DropdownTrigger } from '../../internal/DropdownTrigger';
import { useFullScreenMode } from '../../internal/useFullScreenMode';
import { createKeyExtractor } from '../../internal/keyExtractor';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import type { DropdownProps } from './model';
import { styles } from './styles';

/**
 * A dropdown to pick one item. `T` (the item type) is inferred from `data`,
 * `V` from `valueField`.
 */
function DropdownComponent<T, V extends keyof T = keyof T>(
  props: DropdownProps<T, V>
) {
  const {
    ref: currentRef,
    testID,
    itemTestIDField,
    onChange,
    style = {},
    hitSlop,
    containerStyle,
    placeholderStyle,
    selectedTextStyle,
    itemContainerStyle,
    itemTextStyle,
    inputSearchStyle,
    iconStyle,
    selectedTextProps = {},
    data = NO_ITEMS,
    labelField,
    valueField,
    disabledField,
    disabledItemStyle,
    searchField,
    value,
    activeColor = '#F6F7F8',
    fontFamily,
    allowFontScaling,
    maxFontSizeMultiplier,
    iconColor = DEFAULT_GRAY,
    selectedIconColor,
    renderSelectedIcon,
    searchPlaceholder,
    searchPlaceholderTextColor = DEFAULT_GRAY,
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
    accessibilityStrings,
    itemAccessibilityLabelField,
    mode = 'default',
    closeModalWhenSelectedItem = true,
    excludeItems = NO_ITEMS,
    excludeSearchItems = NO_ITEMS,
    safeAreaInsets,
  } = props;

  const ref = useRef<TriggerInstance>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<T | null>(null);
  const nativeId = `dropdown-${useId()}`;

  const { isFull, isLandscape } = useFullScreenMode(mode);

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

  const strings = useMemo(
    () => resolveAccessibilityStrings(accessibilityStrings),
    [accessibilityStrings]
  );
  const textScaling = useMemo(
    () => ({ allowFontScaling, maxFontSizeMultiplier }),
    [allowFontScaling, maxFontSizeMultiplier]
  );

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
  useAnnounceSearchResults({
    searchText,
    resultCount: listData.length,
    message: strings.searchResults,
  });

  const keyExtractor = useMemo(
    () => createKeyExtractor(valueField),
    [valueField]
  );

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

  const getValue = useCallback(() => {
    const defaultValue =
      typeof value === 'object' ? _get(value, valueField) : value;

    const getItem = data.filter((e) =>
      _isEqual(defaultValue, _get(e, valueField))
    );

    setCurrentValue(getItem[0] ?? null);
  }, [data, value, valueField]);

  useEffect(() => {
    getValue();
  }, [getValue]);

  const isDisabledItem = useCallback(
    (item: T) => disabledField != null && !!_get(item, disabledField),
    [disabledField]
  );

  const isSelectedItem = useCallback(
    (item: T) =>
      currentValue != null &&
      _isEqual(_get(item, valueField), _get(currentValue, valueField)),
    [currentValue, valueField]
  );

  const {
    listRef,
    initialNumToRender,
    onContentSizeChange,
    onScrollToIndexFailed,
  } = useAutoScroll({
    enabled: autoScroll,
    visible,
    listData,
    isSelected: isSelectedItem,
    initialNumToRender: flatListProps?.initialNumToRender ?? undefined,
    hasItemLayout: flatListProps?.getItemLayout != null,
  });

  const onSelect = useCallback(
    (item: T) => {
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
    const hasSelection = currentValue != null;
    return (
      <DropdownTrigger
        hitSlop={hitSlop}
        textScaling={textScaling}
        ref={triggerFocusRef}
        visible={visible}
        onPress={showOrClose}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityValue={
          hasSelection ? String(_get(currentValue, labelField)) : undefined
        }
        disabled={disable}
        text={
          hasSelection ? String(_get(currentValue, labelField)) : placeholder
        }
        textStyle={hasSelection ? selectedTextStyle : placeholderStyle}
        textProps={selectedTextProps}
        fontFamily={fontFamily}
        renderLeftIcon={renderLeftIcon}
        renderRightIcon={renderRightIcon}
        iconColor={iconColor}
        iconStyle={iconStyle}
      />
    );
  };

  // Screen reader focus: into the list when it is shown (search input,
  // else the selected or first row), back to the field when it closes.
  const triggerFocusRef = useRef<TriggerInstance>(null);
  const searchInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const focusRowRef = useRef<TriggerInstance>(null);
  const focusRowIndex = Math.max(0, listData.findIndex(isSelectedItem));
  useAccessibilityFocus({
    visible,
    isReady: placement?.isReady ?? false,
    getListTarget: () => searchInputRef.current ?? focusRowRef.current,
    triggerRef: triggerFocusRef,
  });

  const _renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const selected = isSelectedItem(item);
      return (
        <DropdownOption
          selectedIconColor={selectedIconColor ?? iconColor}
          renderSelectedIcon={renderSelectedIcon}
          textScaling={textScaling}
          ref={index === focusRowIndex ? focusRowRef : undefined}
          item={item}
          label={_get(item, labelField)}
          selected={selected}
          disabled={isDisabledItem(item)}
          disabledStyle={disabledItemStyle}
          onPress={() => onSelect(item)}
          testID={_get(item, itemTestIDField || labelField)}
          accessibilityLabel={_get(
            item,
            itemAccessibilityLabelField || labelField
          )}
          accessibilityRole="radio"
          activeColor={activeColor}
          itemContainerStyle={itemContainerStyle}
          itemTextStyle={itemTextStyle}
          fontFamily={fontFamily}
          renderItem={renderItem}
        />
      );
    },
    [
      activeColor,
      disabledItemStyle,
      focusRowIndex,
      isDisabledItem,
      fontFamily,
      isSelectedItem,
      itemAccessibilityLabelField,
      itemContainerStyle,
      itemTestIDField,
      itemTextStyle,
      labelField,
      onSelect,
      renderItem,
      iconColor,
      renderSelectedIcon,
      selectedIconColor,
      textScaling,
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
        isLandscape={isLandscape}
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
                textScaling={textScaling}
                inputRef={searchInputRef}
                searchText={searchText}
                onSearch={onSearch}
                renderInputSearch={renderInputSearch}
                testID={testID}
                strings={strings}
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
            accessibilityLabel: accessibilityLabel ?? placeholder,
          }}
          flatListProps={flatListProps}
          listProps={{
            ref: listRef,
            initialNumToRender,
            onContentSizeChange,
            onScrollToIndexFailed,
            data: listData,
            nativeID: nativeId,
            renderItem: _renderItem,
            keyExtractor,
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

export default DropdownComponent;
