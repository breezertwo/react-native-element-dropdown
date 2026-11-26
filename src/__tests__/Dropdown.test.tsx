// Characterisation tests: they describe how Dropdown behaves in 2.13, so the
// v3 refactor can't change behaviour by accident. Known bugs are written as
// the desired behaviour and marked `it.failing`; fixing one flips its test.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React, { createRef } from 'react';
import { AccessibilityInfo, Text, TextInput } from 'react-native';
import { Dropdown, type DropdownProps, type IDropdownRef } from '../index';
import { FIELD_ROLE } from '../internal/a11y';
import { layoutOpenList, mockTriggerLayout } from '../__fixtures__/testUtils';

type Fruit = { label: string; value: string; soldOut?: boolean };

const fruits: Fruit[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Crème brûlée', value: 'creme' },
  { label: 'Dragon fruit', value: 'dragon' },
];

const renderDropdown = (props: Partial<DropdownProps<Fruit, 'value'>> = {}) =>
  render(
    <Dropdown
      testID="dropdown"
      data={fruits}
      labelField="label"
      valueField="value"
      onChange={() => {}}
      {...props}
    />
  );

const trigger = () => screen.getByTestId('dropdown');
const pressTrigger = () => fireEvent.press(trigger());

const open = async () => {
  await fireEvent.press(trigger());
  await layoutOpenList();
};

// The list counts as open while it waits for its layout and is still hidden.
const isOpen = () =>
  screen.queryByTestId('dropdown flatlist', { includeHiddenElements: true }) !==
  null;

// The view inside a row's touchable, which carries the row's style.
const rowContent = (name: string) => {
  const [content] = screen.getByRole('radio', { name }).children;
  if (typeof content !== 'object') {
    throw new Error(`Row ${name} has no content view`);
  }
  return content;
};

beforeEach(() => {
  jest.useFakeTimers();
  mockTriggerLayout();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Dropdown', () => {
  describe('trigger', () => {
    it('shows the placeholder when nothing is selected', async () => {
      await renderDropdown({ placeholder: 'Pick a fruit' });

      expect(screen.getByText('Pick a fruit')).toBeTruthy();
    });

    it('shows "Select item" as the default placeholder', async () => {
      await renderDropdown();

      expect(screen.getByText('Select item')).toBeTruthy();
    });

    it('shows the label of the item matching value', async () => {
      await renderDropdown({ value: 'banana' });

      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Select item')).toBeNull();
    });

    it('accepts an item object as value', async () => {
      await renderDropdown({
        value: { label: 'Other label', value: 'banana' },
      });

      expect(screen.getByText('Banana')).toBeTruthy();
    });

    it('shows the placeholder when value matches no item', async () => {
      await renderDropdown({ value: 'cherry' });

      expect(screen.getByText('Select item')).toBeTruthy();
    });

    it('passes the open state to renderLeftIcon and renderRightIcon', async () => {
      await renderDropdown({
        renderLeftIcon: (visible?: boolean) => <Text>{`left ${visible}`}</Text>,
        renderRightIcon: (visible?: boolean) => (
          <Text>{`right ${visible}`}</Text>
        ),
      });

      expect(screen.getByText('left false')).toBeTruthy();
      expect(screen.getByText('right false')).toBeTruthy();

      await open();

      expect(screen.getByText('left true')).toBeTruthy();
      expect(screen.getByText('right true')).toBeTruthy();
    });
  });

  describe('opening and closing', () => {
    it('opens on press and calls onFocus', async () => {
      const onFocus = jest.fn();
      await renderDropdown({ onFocus });

      await open();

      expect(isOpen()).toBe(true);
      expect(screen.getByText('Apple')).toBeTruthy();
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('closes on a second press and calls onBlur', async () => {
      const onBlur = jest.fn();
      await renderDropdown({ onBlur });
      await open();

      await fireEvent.press(trigger());

      expect(isOpen()).toBe(false);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('can be opened, closed and toggled through its ref', async () => {
      const ref = createRef<IDropdownRef>();
      await renderDropdown({ ref });

      await act(async () => ref.current?.open());
      expect(isOpen()).toBe(true);

      await act(async () => ref.current?.close());
      expect(isOpen()).toBe(false);

      await act(async () => ref.current?.toggle());
      expect(isOpen()).toBe(true);
    });

    it('does nothing when disabled', async () => {
      const onFocus = jest.fn();
      await renderDropdown({ disable: true, onFocus });

      await fireEvent.press(trigger());

      expect(isOpen()).toBe(false);
      expect(onFocus).not.toHaveBeenCalled();
    });

    it('does not call onBlur when it unmounts while closed', async () => {
      const onBlur = jest.fn();
      const { unmount } = await renderDropdown({ onBlur });
      await open();
      await pressTrigger();
      expect(onBlur).toHaveBeenCalledTimes(1);

      await unmount();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur once when it unmounts while open', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { unmount } = await renderDropdown({ onFocus, onBlur });
      await open();

      await unmount();

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls the latest onBlur when it unmounts while open', async () => {
      const firstOnBlur = jest.fn();
      const latestOnBlur = jest.fn();
      const { rerender, unmount } = await renderDropdown({
        onBlur: firstOnBlur,
      });
      await open();

      await rerender(
        <Dropdown
          testID="dropdown"
          data={fruits}
          labelField="label"
          valueField="value"
          onChange={() => {}}
          onBlur={latestOnBlur}
        />
      );
      await unmount();

      expect(firstOnBlur).not.toHaveBeenCalled();
      expect(latestOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('selecting', () => {
    it('calls onChange with the item and closes', async () => {
      const onChange = jest.fn();
      const onBlur = jest.fn();
      await renderDropdown({ onChange, onBlur });
      await open();

      await fireEvent.press(screen.getByText('Banana'));

      expect(onChange).toHaveBeenCalledWith(fruits[1]);
      expect(isOpen()).toBe(false);
      expect(onBlur).toHaveBeenCalledTimes(1);
      // Uncontrolled: the trigger shows the selection although `value` was
      // never updated.
      expect(screen.getByText('Banana')).toBeTruthy();
    });

    it('stays open when closeModalWhenSelectedItem is false', async () => {
      const onChange = jest.fn();
      await renderDropdown({ onChange, closeModalWhenSelectedItem: false });
      await open();

      await fireEvent.press(screen.getByText('Banana'));

      expect(onChange).toHaveBeenCalledWith(fruits[1]);
      expect(isOpen()).toBe(true);
    });

    it('only calls onConfirmSelectItem when confirmSelectItem is set', async () => {
      const onChange = jest.fn();
      const onConfirmSelectItem = jest.fn();
      await renderDropdown({
        onChange,
        confirmSelectItem: true,
        onConfirmSelectItem,
      });
      await open();

      await fireEvent.press(screen.getByText('Banana'));

      expect(onConfirmSelectItem).toHaveBeenCalledWith(fruits[1]);
      expect(onChange).not.toHaveBeenCalled();
      expect(isOpen()).toBe(true);
    });

    it('passes item and selected state to renderItem', async () => {
      await renderDropdown({
        value: 'banana',
        renderItem: (item: Fruit, selected?: boolean) => (
          <Text>{`${item.label}${selected ? ' (selected)' : ''}`}</Text>
        ),
      });
      await open();

      expect(screen.getByText('Apple')).toBeTruthy();
      expect(screen.getByText('Banana (selected)')).toBeTruthy();
    });

    it('does not mark an item with a null value as selected when nothing is selected', async () => {
      await renderDropdown({
        data: [...fruits, { label: 'None', value: null as never }],
        renderItem: (item: Fruit, selected?: boolean) => (
          <Text>{`${item.label}${selected ? ' (selected)' : ''}`}</Text>
        ),
      });
      await open();

      expect(screen.getByText('None')).toBeTruthy();
    });
    it('shows the label when the selected item has a null value', async () => {
      await renderDropdown({
        data: [...fruits, { label: 'None', value: null as never }],
        value: { label: 'None', value: null as never },
        renderItem: (item: Fruit, selected?: boolean) => (
          <Text>{`${item.label}${selected ? ' (selected)' : ''}`}</Text>
        ),
      });

      expect(screen.getByText('None')).toBeTruthy();
      expect(screen.queryByText('Select item')).toBeNull();

      await open();

      expect(screen.getByText('None (selected)')).toBeTruthy();
    });
  });

  describe('search', () => {
    const search = async (text: string) => {
      await fireEvent.changeText(screen.getByTestId('dropdown input'), text);
    };

    it('filters by label, ignoring case, whitespace and accents', async () => {
      await renderDropdown({ search: true });
      await open();

      await search('CREME BRU');

      expect(screen.getByText('Crème brûlée')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('filters by searchField instead of the label', async () => {
      await renderDropdown({ search: true, searchField: 'value' });
      await open();

      await search('drag');

      expect(screen.getByText('Dragon fruit')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('uses searchQuery when given', async () => {
      const searchQuery = jest.fn(
        (keyword: string, labelValue: string) => labelValue === keyword
      );
      await renderDropdown({ search: true, searchQuery });
      await open();

      await search('Banana');

      expect(searchQuery).toHaveBeenCalledWith('Banana', 'Apple');
      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('reports the search text through onChangeText and clears it on close', async () => {
      const onChangeText = jest.fn();
      await renderDropdown({ search: true, onChangeText });
      await open();

      await search('ban');
      expect(onChangeText).toHaveBeenLastCalledWith('ban');

      await fireEvent.press(trigger());
      expect(onChangeText).toHaveBeenLastCalledWith('');
    });

    it('filters the list while onChangeText is set', async () => {
      await renderDropdown({ search: true, onChangeText: () => {} });
      await open();

      await search('ban');

      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('filters through a custom input from renderInputSearch', async () => {
      await renderDropdown({
        search: true,
        renderInputSearch: (onSearch) => (
          <TextInput
            testID="custom search"
            accessibilityRole="search"
            onChangeText={onSearch}
          />
        ),
      });
      await open();

      await fireEvent.changeText(screen.getByTestId('custom search'), 'ban');

      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('keeps filtering when data changes during a search', async () => {
      const { rerender } = await renderDropdown({ search: true });
      await open();
      await search('an');

      await rerender(
        <Dropdown
          testID="dropdown"
          search
          data={[...fruits, { label: 'Mango', value: 'mango' }]}
          labelField="label"
          valueField="value"
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.getByText('Mango')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });
  });

  describe('excluding items', () => {
    it('hides excludeItems from the list', async () => {
      await renderDropdown({ excludeItems: [fruits[0]!] });
      await open();

      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.getByText('Banana')).toBeTruthy();
    });

    it('hides excludeSearchItems only from search results', async () => {
      await renderDropdown({
        search: true,
        excludeSearchItems: [fruits[0]!],
      });
      await open();

      expect(screen.getByText('Apple')).toBeTruthy();

      await fireEvent.changeText(screen.getByTestId('dropdown input'), 'a');

      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.getByText('Banana')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    describe('field', () => {
      it('is named by accessibilityLabel that reports whether it is expanded', async () => {
        await renderDropdown({ accessibilityLabel: 'Fruit' });

        expect(
          screen.getByRole(FIELD_ROLE, { name: 'Fruit', expanded: false })
        ).toBeTruthy();

        await open();

        expect(
          screen.getByRole(FIELD_ROLE, { name: 'Fruit', expanded: true })
        ).toBeTruthy();
      });

      it('is named by the placeholder without an accessibilityLabel', async () => {
        await renderDropdown({ placeholder: 'Pick a fruit' });

        expect(
          screen.getByRole(FIELD_ROLE, { name: 'Pick a fruit' })
        ).toBeTruthy();
      });

      it('reports the selected item as its value', async () => {
        await renderDropdown({ accessibilityLabel: 'Fruit', value: 'banana' });

        expect(
          screen.getByRole(FIELD_ROLE, {
            name: 'Fruit',
            value: { text: 'Banana' },
          })
        ).toBeTruthy();
      });

      it('reports when it is disabled', async () => {
        await renderDropdown({ accessibilityLabel: 'Fruit', disable: true });

        expect(
          screen.getByRole(FIELD_ROLE, { name: 'Fruit', disabled: true })
        ).toBeTruthy();
      });
    });

    it('exposes rows as radio buttons named by their label when accessibilityLabel is set', async () => {
      await renderDropdown({ accessibilityLabel: 'Fruit' });
      await open();

      expect(screen.getAllByRole('radio')).toHaveLength(fruits.length);
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeTruthy();
    });

    it('exposes rows as radio buttons without an accessibilityLabel and checks the selected one', async () => {
      await renderDropdown({ value: 'banana' });
      await open();

      expect(screen.getAllByRole('radio')).toHaveLength(fruits.length);
      expect(
        screen.getByRole('radio', { name: 'Banana', checked: true })
      ).toBeTruthy();
      expect(
        screen.getByRole('radio', { name: 'Apple', checked: false })
      ).toBeTruthy();
    });

    describe('search', () => {
      it('is a search field named by searchPlaceholder, or "Search"', async () => {
        await renderDropdown({ search: true, searchPlaceholder: 'Find fruit' });
        await open();
        expect(screen.getByRole('search', { name: 'Find fruit' })).toBeTruthy();
      });

      it('falls back to "Search" and has a "Clear search" button', async () => {
        await renderDropdown({ search: true });
        await open();
        const input = screen.getByRole('search', { name: 'Search' });

        await fireEvent.changeText(input, 'ban');
        await fireEvent.press(
          screen.getByRole('button', { name: 'Clear search' })
        );

        expect(input.props.value).toBe('');
        expect(screen.getByText('Apple')).toBeTruthy();
      });

      it('uses accessibilityStrings', async () => {
        await renderDropdown({
          search: true,
          accessibilityStrings: { search: 'Suche', clearSearch: 'Löschen' },
        });
        await open();
        await fireEvent.changeText(
          screen.getByRole('search', { name: 'Suche' }),
          'ban'
        );

        expect(screen.getByRole('button', { name: 'Löschen' })).toBeTruthy();
      });
    });

    it('moves screen reader focus into the list when shown, and back to the field when closed', async () => {
      const sendEvent = jest.mocked(AccessibilityInfo.sendAccessibilityEvent);
      sendEvent.mockClear();
      await renderDropdown({ value: 'banana' });

      await open();
      expect(sendEvent).toHaveBeenCalledTimes(1);
      expect(sendEvent.mock.calls[0]?.[1]).toBe('focus');

      await pressTrigger();
      expect(sendEvent).toHaveBeenCalledTimes(2);
      expect(sendEvent.mock.calls[1]?.[1]).toBe('focus');
    });

    it('keeps screen readers inside the open list and closes it on the escape gesture', async () => {
      await renderDropdown();
      await open();
      const container = screen.root?.queryAll(
        (node) => node.props.accessibilityViewIsModal === true
      )[0];

      expect(container?.props['aria-modal']).toBe(true);

      await fireEvent(container!, 'accessibilityEscape');

      expect(isOpen()).toBe(false);
    });

    it('names the list like the field', async () => {
      await renderDropdown({ accessibilityLabel: 'Fruit' });
      await open();

      // A radiogroup, but not an accessibility element itself (that would
      // merge the rows into one element), so check its props.
      const list = screen.getByTestId('dropdown flatlist');
      expect(list.props.accessibilityRole).toBe('radiogroup');
      expect(list.props.accessibilityLabel).toBe('Fruit');
    });
  });

  it('uses a gray with WCAG AA contrast for the icon and search placeholder by default', async () => {
    await renderDropdown({ search: true });
    await open();

    const icon = screen.root?.queryAll((node) => node.type === 'Image')[0];
    expect(icon?.props.style).toMatchObject({ tintColor: '#767676' });
    expect(screen.getByRole('search').props.placeholderTextColor).toBe(
      '#767676'
    );
  });

  describe('selected checkmark', () => {
    const checkmarks = () =>
      screen.queryAllByTestId('dropdown-selected-icon', {
        includeHiddenElements: true,
      });

    it('marks the selected row, in iconColor by default', async () => {
      await renderDropdown({ value: 'banana', iconColor: '#333333' });
      await open();

      expect(checkmarks()).toHaveLength(1);
      expect(checkmarks()[0]?.props.style).toContainEqual({
        borderColor: '#333333',
      });
    });

    it('uses selectedIconColor', async () => {
      await renderDropdown({ value: 'banana', selectedIconColor: 'green' });
      await open();

      expect(checkmarks()[0]?.props.style).toContainEqual({
        borderColor: 'green',
      });
    });

    it('is replaced by renderSelectedIcon, or hidden when it returns null', async () => {
      await renderDropdown({
        value: 'banana',
        renderSelectedIcon: () => <Text>✔︎ custom</Text>,
      });
      await open();
      expect(screen.getByText('✔︎ custom')).toBeTruthy();
      expect(checkmarks()).toHaveLength(0);
    });

    it('is not added to rows from renderItem', async () => {
      await renderDropdown({
        value: 'banana',
        renderItem: (item: Fruit) => <Text>{item.label}</Text>,
      });
      await open();

      expect(checkmarks()).toHaveLength(0);
    });

    it('is hidden from screen readers', async () => {
      await renderDropdown({ value: 'banana' });
      await open();

      expect(screen.queryAllByTestId('dropdown-selected-icon')).toHaveLength(0);
    });
  });

  describe('hitSlop', () => {
    it('extends the touch area of the field', async () => {
      const hitSlop = { top: 4, bottom: 4, left: 0, right: 0 };
      await renderDropdown({ accessibilityLabel: 'Fruit', hitSlop });

      expect(
        screen.getByRole(FIELD_ROLE, { name: 'Fruit' }).props.hitSlop
      ).toEqual(hitSlop);
    });
  });

  describe('text scaling', () => {
    it('applies allowFontScaling and maxFontSizeMultiplier to every text and the search input', async () => {
      await renderDropdown({
        value: 'banana',
        search: true,
        allowFontScaling: false,
        maxFontSizeMultiplier: 1.5,
      });
      await open();

      const texts =
        screen.root?.queryAll(
          (node) => node.type === 'Text' || node.type === 'TextInput'
        ) ?? [];
      expect(texts.length).toBeGreaterThan(3);
      for (const text of texts) {
        expect(text.props).toMatchObject({
          allowFontScaling: false,
          maxFontSizeMultiplier: 1.5,
        });
      }
    });
  });

  describe('row style', () => {
    it('pads rows by default', async () => {
      await renderDropdown();
      await open();

      expect(rowContent('Apple')).toHaveStyle({ padding: 17 });
    });

    it('replaces the default padding with the one in itemContainerStyle', async () => {
      await renderDropdown({ itemContainerStyle: { padding: 4 } });
      await open();

      expect(rowContent('Apple')).toHaveStyle({ padding: 4 });
      // Not added on top by an inner view either.
      const [inner] = rowContent('Apple').children;
      expect(inner).not.toHaveStyle({ padding: 17 });
    });

    it('does not pad rows of renderItem', async () => {
      await renderDropdown({
        renderItem: (item) => <Text>{item.label}</Text>,
      });
      await open();

      expect(rowContent('Apple')).not.toHaveStyle({ padding: 17 });
    });
  });

  describe('disabled items', () => {
    const withSoldOut = fruits.map((fruit) =>
      fruit.value === 'banana' ? { ...fruit, soldOut: true } : fruit
    );

    it('ignores presses on disabled rows and reports them as disabled', async () => {
      const onChange = jest.fn();
      await renderDropdown({
        data: withSoldOut,
        disabledField: 'soldOut',
        onChange,
      });
      await open();

      const banana = screen.getByRole('radio', { name: 'Banana' });
      expect(banana).toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Apple' })).toBeEnabled();

      await fireEvent.press(banana);
      expect(onChange).not.toHaveBeenCalled();
      expect(isOpen()).toBe(true);
    });

    it('dims disabled rows, with a custom style if given', async () => {
      await renderDropdown({
        data: withSoldOut,
        disabledField: 'soldOut',
        disabledItemStyle: { backgroundColor: 'pink' },
      });
      await open();

      expect(rowContent('Banana')).toHaveStyle({
        opacity: 0.5,
        backgroundColor: 'pink',
      });
      expect(rowContent('Apple')).not.toHaveStyle({ opacity: 0.5 });
    });
  });

  describe('data', () => {
    it('does not mutate the items passed in data', async () => {
      const data = [
        { label: 'Apple', value: '1' },
        { label: 'Banana', value: '2' },
      ];
      const snapshot = JSON.parse(JSON.stringify(data));

      await renderDropdown({ data, value: '2' });
      await open();

      expect(screen.getByText('Apple')).toBeTruthy();
      expect(data).toEqual(snapshot);
    });
  });
});
