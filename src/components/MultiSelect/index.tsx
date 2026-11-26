/* eslint-disable @typescript-eslint/no-shadow */
import { DEFAULT_GRAY } from '../../internal/colors';
import { getField, getFieldText } from '../../internal/fields';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import type { TextInput } from 'react-native';
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
import { useAccessibilityFocus } from '../../internal/useAccessibilityFocus';
import { useAnnounceSearchResults } from '../../internal/useAnnounceSearchResults';
import { DropdownTrigger } from '../../internal/DropdownTrigger';
import { useFullScreenMode } from '../../internal/useFullScreenMode';
import { createKeyExtractor } from '../../internal/keyExtractor';
import { NO_ITEMS, useSearch } from '../../internal/useSearch';
import type { MultiSelectProps } from './model';
import { InsideTrigger } from './InsideTrigger';
import { SelectedChips } from './SelectedChips';
import { toggleValue } from './toggleValue';
import { styles } from './styles';

/**
 * A dropdown to pick several items. `T` (the item type) is inferred from
 * `data`, `V` from `valueField`; the value is an array of `T[V]`.
 */
function MultiSelectComponent<T, V extends keyof T = keyof T>(
  props: MultiSelectProps<T, V>
) {
  const {
    ref: currentRef,
    testID,
    itemTestIDField,
    onChange,
    data = NO_ITEMS,
    value,
    style = {},
    hitSlop,
    labelField,
    valueField,
    disabledField,
    disabledItemStyle,
    searchField,
    chipsContainerStyle,
    chipsOverflow = 'grow',
    renderChipsOverflow,
    selectedStyle,
    selectedTextStyle,
    chipRemoveIconStyle,
    renderChipRemoveIcon,
    itemContainerStyle,
    itemTextStyle,
    selectedItemTextStyle,
    iconStyle,
    selectedTextProps = {},
    activeColor = '#F6F7F8',
    containerStyle,
    fontFamily,
    allowFontScaling,
    maxFontSizeMultiplier,
    placeholderStyle,
    selectedPlaceholderStyle,
    iconColor = DEFAULT_GRAY,
    selectedIconColor,
    renderSelectedIcon,
    searchContainerStyle,
    inputSearchStyle,
    renderSearchClearIcon,
    searchPlaceholder,
    searchPlaceholderTextColor = DEFAULT_GRAY,
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
  const nativeId = `multiselectdropdown-${useId()}`;

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
    prepareOpen,
    isKeyboardVisible,
    onFocus,
    onBlur,
    onDismiss: clearSearch,
  });

  const currentValue: readonly T[V][] = value ?? NO_ITEMS;
  const strings = useMemo(
    () => resolveAccessibilityStrings(accessibilityStrings),
    [accessibilityStrings]
  );
  const textScaling = useMemo(
    () => ({ allowFontScaling, maxFontSizeMultiplier }),
    [allowFontScaling, maxFontSizeMultiplier]
  );

  useAnnounceSearchResults({
    searchText,
    resultCount: listData.length,
    message: strings.searchResults,
  });

  const onSelect = useCallback(
    (item: T) => {
      const { values, removed } = toggleValue(
        currentValue,
        item[valueField],
        maxSelect
      );
      const confirm = removed ? confirmUnSelectItem : confirmSelectItem;
      if (onConfirmSelectItem && confirm) {
        // The app decides whether the change happens, so don't announce it.
        onConfirmSelectItem(values);
        return;
      }
      onChange(values);

      if (values.length !== currentValue.length) {
        const label =
          getFieldText(item, itemAccessibilityLabelField || labelField) ?? '';
        AccessibilityInfo.announceForAccessibility(
          removed ? strings.itemRemoved(label) : strings.itemSelected(label)
        );
      }
    },
    [
      confirmSelectItem,
      confirmUnSelectItem,
      currentValue,
      itemAccessibilityLabelField,
      labelField,
      maxSelect,
      onChange,
      onConfirmSelectItem,
      strings,
      valueField,
    ]
  );

  const _renderDropdown = () => (
    <DropdownTrigger
      hitSlop={hitSlop}
      textScaling={textScaling}
      ref={triggerFocusRef}
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
      textStyle={[
        placeholderStyle,
        currentValue.length > 0 && selectedPlaceholderStyle,
      ]}
      textProps={selectedTextProps}
      fontFamily={fontFamily}
      renderLeftIcon={renderLeftIcon}
      renderRightIcon={renderRightIcon}
      iconColor={iconColor}
      iconStyle={iconStyle}
    />
  );

  const isDisabledItem = useCallback(
    (item: T) => disabledField != null && !!getField(item, disabledField),
    [disabledField]
  );

  const checkSelected = useCallback(
    (item: T) => currentValue.includes(item[valueField]),
    [currentValue, valueField]
  );

  // Screen reader focus: into the list when it is shown (search input,
  // else the selected or first row), back to the field when it closes.
  const triggerFocusRef = useRef<TriggerInstance>(null);
  const searchInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const focusRowRef = useRef<TriggerInstance>(null);
  const focusRowIndex = Math.max(0, listData.findIndex(checkSelected));
  useAccessibilityFocus({
    visible,
    isReady: placement?.isReady ?? false,
    getListTarget: () => searchInputRef.current ?? focusRowRef.current,
    triggerRef: triggerFocusRef,
  });

  const _renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <DropdownOption
        selectedIconColor={selectedIconColor ?? iconColor}
        renderSelectedIcon={renderSelectedIcon}
        textScaling={textScaling}
        ref={index === focusRowIndex ? focusRowRef : undefined}
        item={item}
        label={getFieldText(item, labelField)}
        selected={checkSelected(item)}
        disabled={isDisabledItem(item)}
        disabledStyle={disabledItemStyle}
        onPress={() => onSelect(item)}
        testID={getFieldText(item, itemTestIDField || labelField)}
        accessibilityLabel={getFieldText(
          item,
          itemAccessibilityLabelField || labelField
        )}
        accessibilityRole="checkbox"
        activeColor={activeColor}
        selectedStyle={styles.wrapItem}
        itemContainerStyle={itemContainerStyle}
        itemTextStyle={itemTextStyle}
        selectedItemTextStyle={selectedItemTextStyle}
        fontFamily={fontFamily}
        renderItem={renderItem}
      />
    ),
    [
      activeColor,
      checkSelected,
      disabledItemStyle,
      isDisabledItem,
      focusRowIndex,
      fontFamily,
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

  // Disabled items stay selected: their chips can't remove them.
  const unSelect = (item: T) => {
    if (!disable && !isDisabledItem(item)) {
      onSelect(item);
    }
  };

  const selectedItems = data.filter((item) =>
    currentValue.includes(item[valueField])
  );

  const removableItems = selectedItems.filter((item) => !isDisabledItem(item));

  const _renderItemSelected = (inside: boolean) => {
    return (
      <SelectedChips
        testID={testID}
        overflow={chipsOverflow}
        renderChipsOverflow={renderChipsOverflow}
        onPressMore={inside ? undefined : showOrClose}
        textScaling={textScaling}
        items={selectedItems}
        isDisabled={isDisabledItem}
        inside={inside}
        onUnselect={unSelect}
        labelField={labelField}
        valueField={valueField}
        itemTestIDField={itemTestIDField}
        itemAccessibilityLabelField={itemAccessibilityLabelField}
        strings={strings}
        containerStyle={chipsContainerStyle}
        selectedStyle={selectedStyle}
        selectedTextStyle={selectedTextStyle}
        chipRemoveIconStyle={chipRemoveIconStyle}
        renderChipRemoveIcon={renderChipRemoveIcon}
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
          hitSlop={hitSlop}
          textScaling={textScaling}
          ref={triggerFocusRef}
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
          removeActions={removableItems.map((item) => ({
            label: strings.removeItem(
              getFieldText(item, itemAccessibilityLabelField || labelField) ??
                ''
            ),
            onRemove: () => unSelect(item),
          }))}
          chips={selectedItems.length > 0 ? _renderItemSelected(true) : null}
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
}

export default MultiSelectComponent;
