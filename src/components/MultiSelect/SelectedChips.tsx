import { DEFAULT_GRAY } from '../../internal/colors';
import type { TextScaling } from '../../internal/a11y';
import { getFieldText } from '../../internal/fields';
import { useState, type ReactElement } from 'react';
import { fitChips } from './fitChips';
import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { DropdownAccessibilityStrings } from '../../internal/a11y';

// Chips are about 35pt high; this makes the touch target at least 44pt.
const CHIP_HIT_SLOP = { top: 6, bottom: 6 };

/** How chips that don't fit in one row are shown (`chipsOverflow` prop). */
export type ChipsOverflow = 'grow' | 'collapse';

interface SelectedChipsProps<T> {
  /** Prefix of the testIDs of the "+N" chip and the measuring views. */
  testID?: string;
  /** Wrap onto more rows, or one row with a "+N" chip for the rest. */
  overflow?: ChipsOverflow;
  /**
   * Pressing the "+N" chip. Without it (inside the field) the "+N" chip is
   * not pressable on its own; the field around it handles the press.
   */
  onPressMore?: () => void;
  /** Replaces the "+N" chip. */
  renderChipsOverflow?: (hiddenCount: number) => ReactElement | null;
  /** `allowFontScaling` and `maxFontSizeMultiplier` for the texts. */
  textScaling?: TextScaling;
  /** The selected items, in data order. */
  items: T[];
  /** Disabled items can't be removed; their chips are dimmed. */
  isDisabled: (item: T) => boolean;
  /** Rendered inside the field instead of below it (`inside` prop). */
  inside: boolean;
  onUnselect: (item: T) => void;
  labelField: keyof T;
  valueField: keyof T;
  itemTestIDField?: keyof T;
  itemAccessibilityLabelField?: keyof T;
  strings: DropdownAccessibilityStrings;
  /** The view around the chips. */
  containerStyle?: StyleProp<ViewStyle>;
  selectedStyle?: StyleProp<ViewStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  /** Style of the default ⓧ icon, on top of selectedTextStyle. */
  chipRemoveIconStyle?: StyleProp<TextStyle>;
  /** Replaces the ⓧ icon of the default chip; return null to hide it. */
  renderChipRemoveIcon?: (item: T) => ReactElement | null;
  fontFamily?: string;
  renderSelectedItem?: (
    item: T,
    unSelect?: (item: T) => void
  ) => ReactElement | null;
}

/** Widths of the chips (by value), the "+N" chip and the row. */
interface Measurements {
  chips: Record<string, number>;
  more?: number;
  row?: number;
}

const layoutWidth = (event: LayoutChangeEvent) =>
  event.nativeEvent.layout.width;

/**
 * A chip per selected item; pressing one unselects its item.
 *
 * With `overflow="collapse"` the chips stay in one row: as many as fit,
 * followed by a "+N" chip for the rest. The widths come from a measuring
 * copy of the chips, laid out invisibly behind the row.
 */
export function SelectedChips<T>({
  testID,
  overflow = 'grow',
  onPressMore,
  renderChipsOverflow,
  textScaling,
  items,
  isDisabled,
  inside,
  onUnselect,
  labelField,
  valueField,
  itemTestIDField,
  itemAccessibilityLabelField,
  strings,
  containerStyle,
  selectedStyle,
  selectedTextStyle,
  chipRemoveIconStyle,
  renderChipRemoveIcon,
  fontFamily,
  renderSelectedItem,
}: SelectedChipsProps<T>) {
  const [measured, setMeasured] = useState<Measurements>({ chips: {} });
  const collapse = overflow === 'collapse';

  const keyOf = (item: T) => String(getFieldText(item, valueField));

  const textStyle = StyleSheet.flatten([
    styles.chipText,
    selectedTextStyle,
    fontFamily ? { fontFamily } : {},
  ]);

  // What a chip looks like; the same for the row and the measuring copy.
  const chipContent = (item: T) => {
    const disabled = isDisabled(item);
    if (renderSelectedItem) {
      return renderSelectedItem(
        item,
        disabled ? undefined : () => onUnselect(item)
      );
    }
    return (
      <View
        style={StyleSheet.flatten([
          styles.chip,
          selectedStyle,
          disabled && styles.disabled,
        ])}
      >
        <Text {...textScaling} style={textStyle}>
          {getFieldText(item, labelField)}
        </Text>
        {renderChipRemoveIcon ? (
          renderChipRemoveIcon(item)
        ) : (
          <Text
            {...textScaling}
            style={StyleSheet.flatten([
              styles.removeIcon,
              selectedTextStyle,
              chipRemoveIconStyle,
            ])}
          >
            ⓧ
          </Text>
        )}
      </View>
    );
  };

  const moreContent = (hiddenCount: number) =>
    renderChipsOverflow ? (
      renderChipsOverflow(hiddenCount)
    ) : (
      <View style={StyleSheet.flatten([styles.chip, selectedStyle])}>
        <Text {...textScaling} style={textStyle}>
          {`+${hiddenCount}`}
        </Text>
      </View>
    );

  const chip = (item: T) => {
    const disabled = isDisabled(item);
    return (
      <TouchableWithoutFeedback
        disabled={disabled}
        accessibilityState={{ disabled }}
        testID={getFieldText(item, itemTestIDField || labelField)}
        accessibilityRole="button"
        accessibilityLabel={strings.removeItem(
          getFieldText(item, itemAccessibilityLabelField || labelField) ?? ''
        )}
        hitSlop={CHIP_HIT_SLOP}
        key={keyOf(item)}
        onPress={() => onUnselect(item)}
      >
        {chipContent(item)}
      </TouchableWithoutFeedback>
    );
  };

  const widths = items.map((item) => measured.chips[keyOf(item)]);
  const isMeasured =
    measured.row !== undefined &&
    measured.more !== undefined &&
    widths.every((width) => width !== undefined);
  const visibleCount =
    collapse && isMeasured
      ? fitChips(widths as number[], measured.row ?? 0, measured.more ?? 0)
      : items.length;
  const hiddenCount = items.length - visibleCount;

  const more =
    hiddenCount === 0 ? null : onPressMore ? (
      <TouchableWithoutFeedback
        testID={testID ? `${testID} chips more` : undefined}
        accessibilityRole="button"
        accessibilityLabel={strings.moreSelected(hiddenCount)}
        hitSlop={CHIP_HIT_SLOP}
        onPress={onPressMore}
      >
        {moreContent(hiddenCount)}
      </TouchableWithoutFeedback>
    ) : (
      <View
        testID={testID ? `${testID} chips more` : undefined}
        style={styles.moreWrapper}
      >
        {moreContent(hiddenCount)}
      </View>
    );

  // Layout events repeat on every layout pass; only store changed widths.
  const setChipWidth = (key: string, width: number) =>
    setMeasured((current) =>
      current.chips[key] === width
        ? current
        : { ...current, chips: { ...current.chips, [key]: width } }
    );
  const setWidth = (field: 'more' | 'row', width: number) =>
    setMeasured((current) =>
      current[field] === width ? current : { ...current, [field]: width }
    );

  // Invisible copy of the chips and of a "+N" chip at its widest, to
  // measure them. Hidden from screen readers and touches.
  const measuring = collapse ? (
    <View
      style={styles.measuring}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {items.map((item) => {
        const key = keyOf(item);
        return (
          <View
            key={key}
            testID={testID ? `${testID} chips measure` : undefined}
            onLayout={(event) => setChipWidth(key, layoutWidth(event))}
          >
            {chipContent(item)}
          </View>
        );
      })}
      <View
        testID={testID ? `${testID} chips measure more` : undefined}
        onLayout={(event) => setWidth('more', layoutWidth(event))}
      >
        {moreContent(items.length)}
      </View>
    </View>
  ) : null;

  return (
    <View
      testID={testID ? `${testID} chips` : undefined}
      onLayout={
        collapse ? (event) => setWidth('row', layoutWidth(event)) : undefined
      }
      style={StyleSheet.flatten([
        styles.chips,
        collapse && styles.collapse,
        inside && styles.inside,
        containerStyle,
      ])}
    >
      {measuring}
      {items.slice(0, visibleCount).map(chip)}
      {more}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
  },
  collapse: {
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  // A row, so the "+N" chip stretches to the height of the other chips
  // like they do as direct children of the chips row.
  moreWrapper: {
    flexDirection: 'row',
  },
  measuring: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    opacity: 0,
  },
  inside: {
    flex: 1,
  },
  chip: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: DEFAULT_GRAY,
    paddingHorizontal: 8,
    marginVertical: 6,
    marginRight: 8,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  removeIcon: {
    marginLeft: 5,
    color: DEFAULT_GRAY,
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  chipText: {
    fontSize: 12,
    color: DEFAULT_GRAY,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
