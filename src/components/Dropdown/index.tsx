import { DEFAULT_GRAY } from '../../internal/colors';
import { getField, getFieldText, isEqualValue } from '../../internal/fields';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
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
    selectedItemTextStyle,
    searchContainerStyle,
    inputSearchStyle,
    renderSearchClearIcon,
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
  // The item the user picked, kept while `value` and `data` are the ones it
  // was picked with; it shows the selection before (or without) the app
  // updating `value`.
  const [picked, setPicked] = useState<{
    item: T;
    value: typeof value;
    data: typeof data;
  } | null>(null);
  const nativeId = `dropdown-${useId()}`;

  const { isFull, isLandscape } = useFullScreenMode(mode);

  const {
    measure: _measure,
    prepareOpen,
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

  const {
    close: eventClose,
    onPress: showOrClose,
    openingId,
  } = useDropdownState({
    ref: currentRef,
    visible,
    setVisible,
    disable,
    prepareOpen,
    isKeyboardVisible,
    onFocus,
    onBlur,
    onDismiss: dismissSearch,
  });

  // `value` is an item or its value; the selection is the item in `data`.
  const valueItem = useMemo(() => {
    const selectedValue =
      typeof value === 'object' ? getField(value as T, valueField) : value;
    return (
      data.find((item) =>
        isEqualValue(selectedValue, getField(item, valueField))
      ) ?? null
    );
  }, [data, value, valueField]);
  const currentValue =
    picked && picked.value === value && picked.data === data
      ? picked.item
      : valueItem;

  const isDisabledItem = useCallback(
    (item: T) => disabledField != null && !!getField(item, disabledField),
    [disabledField]
  );

  const isSelectedItem = useCallback(
    (item: T) =>
      currentValue != null &&
      isEqualValue(
        getField(item, valueField),
        getField(currentValue, valueField)
      ),
    [currentValue, valueField]
  );

  const {
    isScrolled,
    listRef,
    initialNumToRender,
    onContentSizeChange,
    onScrollToIndexFailed,
  } = useAutoScroll({
    enabled: autoScroll,
    visible,
    openingId,
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

      setPicked({ item, value, data });
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
      value,
      data,
    ]
  );

  const _renderDropdown = () => {
    const hasSelection = currentValue != null;
    return (
      <DropdownTrigger
        hitSlop={hitSlop}
        textScaling={textScaling}
        ref={ref}
        style={style}
        onLayout={_measure}
        visible={visible}
        onPress={showOrClose}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityValue={
          hasSelection ? getFieldText(currentValue, labelField) : undefined
        }
        disabled={disable}
        text={
          hasSelection
            ? (getFieldText(currentValue, labelField) ?? '')
            : placeholder
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
  const searchInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const focusRowRef = useRef<TriggerInstance>(null);
  const focusRowIndex = Math.max(0, listData.findIndex(isSelectedItem));
  useAccessibilityFocus({
    visible,
    isReady: (placement?.isReady ?? false) && isScrolled,
    getListTarget: () => searchInputRef.current ?? focusRowRef.current,
    triggerRef: ref,
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
          label={getFieldText(item, labelField)}
          selected={selected}
          disabled={isDisabledItem(item)}
          disabledStyle={disabledItemStyle}
          onPress={() => onSelect(item)}
          testID={getFieldText(item, itemTestIDField || labelField)}
          accessibilityLabel={getFieldText(
            item,
            itemAccessibilityLabelField || labelField
          )}
          accessibilityRole="radio"
          activeColor={activeColor}
          itemContainerStyle={itemContainerStyle}
          itemTextStyle={itemTextStyle}
          selectedItemTextStyle={selectedItemTextStyle}
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
      selectedItemTextStyle,
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
        isContentReady={isScrolled}
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
                searchContainerStyle={searchContainerStyle}
                inputSearchStyle={inputSearchStyle}
                renderSearchClearIcon={renderSearchClearIcon}
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

  // The list's Modal is absolutely positioned, so the field stays the only
  // element in the layout.
  return (
    <>
      {_renderDropdown()}
      {_renderModal()}
    </>
  );
}

export default DropdownComponent;
