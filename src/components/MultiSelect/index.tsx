/* eslint-disable @typescript-eslint/no-shadow */
import _get from 'lodash/get';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useDropdownPlacement,
  type TriggerInstance,
} from '../../internal/placement/useDropdownPlacement';
import { useDropdownState } from '../../internal/useDropdownState';
import { resolveAccessibilityStrings } from '../../internal/a11y';
import { DropdownList } from '../../internal/DropdownList';
import { DropdownModal } from '../../internal/DropdownModal';
import { DropdownOption } from '../../internal/DropdownOption';
import { DropdownSearch } from '../../internal/DropdownSearch';
import { DropdownTrigger } from '../../internal/DropdownTrigger';
import { useFullScreenMode } from '../../internal/useFullScreenMode';
import { createKeyExtractor } from '../../internal/keyExtractor';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import { IMultiSelectRef, MultiSelectProps } from './model';
import { InsideTrigger } from './InsideTrigger';
import { SelectedChips } from './SelectedChips';
import { toggleValue } from './toggleValue';
import { styles } from './styles';

const MultiSelectComponent = React.forwardRef<
  IMultiSelectRef,
  MultiSelectProps<any>
>((props, currentRef) => {
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
    accessibilityStrings,
    itemAccessibilityLabelField,
    visibleSelectedItem = true,
    mode = 'default',
    excludeItems = NO_ITEMS,
    excludeSearchItems = NO_ITEMS,
    safeAreaInsets,
  } = props;

  const ref = useRef<TriggerInstance>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const nativeId = useRef(
    `multiselectdropdown-${Math.random().toString(16).slice(2)}`
  ).current;

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

  const keyExtractor = useMemo(
    () => createKeyExtractor(valueField),
    [valueField]
  );

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

  const currentValue: any[] = value ?? NO_ITEMS;
  const strings = useMemo(
    () => resolveAccessibilityStrings(accessibilityStrings),
    [accessibilityStrings]
  );

  const onSelect = useCallback(
    (item: any) => {
      const { values, removed } = toggleValue(
        currentValue,
        _get(item, valueField),
        maxSelect
      );
      const confirm = removed ? confirmUnSelectItem : confirmSelectItem;
      if (onConfirmSelectItem && confirm) {
        onConfirmSelectItem(values);
      } else {
        onChange(values);
      }
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

  const _renderDropdown = () => (
    <DropdownTrigger
      visible={visible}
      onPress={showOrClose}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      accessibilityValue={
        currentValue.length > 0
          ? strings.selectedCount(currentValue.length)
          : undefined
      }
      disabled={disable}
      text={placeholder}
      textStyle={placeholderStyle}
      textProps={selectedTextProps}
      fontFamily={fontFamily}
      renderLeftIcon={renderLeftIcon}
      renderRightIcon={renderRightIcon}
      iconColor={iconColor}
      iconStyle={iconStyle}
    />
  );

  const checkSelected = useCallback(
    (item: any) => {
      const index = currentValue.findIndex((e) => e === _get(item, valueField));
      return index > -1;
    },
    [currentValue, valueField]
  );

  const _renderItem = useCallback(
    ({ item }: { item: any }) => (
      <DropdownOption
        item={item}
        label={_get(item, labelField)}
        selected={checkSelected(item)}
        onPress={() => onSelect(item)}
        testID={_get(item, itemTestIDField || labelField)}
        accessibilityLabel={_get(
          item,
          itemAccessibilityLabelField || labelField
        )}
        accessibilityRole="checkbox"
        activeColor={activeColor}
        selectedStyle={styles.wrapItem}
        itemContainerStyle={itemContainerStyle}
        itemTextStyle={itemTextStyle}
        fontFamily={fontFamily}
        renderItem={renderItem}
      />
    ),
    [
      accessibilityLabel,
      activeColor,
      checkSelected,
      fontFamily,
      itemAccessibilityLabelField,
      itemContainerStyle,
      itemTestIDField,
      itemTextStyle,
      labelField,
      onSelect,
      renderItem,
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
          captureTouches
          defaultListProps={{
            testID: testID + ' flatlist',
            accessibilityLabel: accessibilityLabel ?? placeholder,
          }}
          flatListProps={flatListProps}
          listProps={{
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

  const unSelect = (item: any) => {
    if (!disable) {
      onSelect(item);
    }
  };

  const _renderItemSelected = (inside: boolean) => {
    const selectedValues = value ?? [];
    return (
      <SelectedChips
        items={data.filter((item: any) =>
          selectedValues.includes(_get(item, valueField))
        )}
        inside={inside}
        onUnselect={unSelect}
        labelField={labelField}
        valueField={valueField}
        itemTestIDField={itemTestIDField}
        itemAccessibilityLabelField={itemAccessibilityLabelField}
        accessible={!!accessibilityLabel}
        selectedStyle={selectedStyle}
        selectedTextStyle={selectedTextStyle}
        fontFamily={fontFamily}
        renderSelectedItem={renderSelectedItem}
      />
    );
  };

  if (inside) {
    return (
      <View
        style={StyleSheet.flatten([styles.mainWrap, style])}
        ref={ref}
        onLayout={_measure}
      >
        <InsideTrigger
          visible={visible}
          onPress={showOrClose}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? placeholder}
          accessibilityValue={
            currentValue.length > 0
              ? strings.selectedCount(currentValue.length)
              : undefined
          }
          disabled={disable}
          chips={value && value.length > 0 ? _renderItemSelected(true) : null}
          placeholder={placeholder}
          placeholderStyle={placeholderStyle}
          fontFamily={fontFamily}
          renderLeftIcon={renderLeftIcon}
          renderRightIcon={renderRightIcon}
          iconColor={iconColor}
          iconStyle={iconStyle}
        />
        {_renderModal()}
      </View>
    );
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
