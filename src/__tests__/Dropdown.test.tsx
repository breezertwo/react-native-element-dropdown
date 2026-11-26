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
import { Text, TextInput } from 'react-native';
import { Dropdown, type IDropdownRef } from '../index';
import { layoutOpenList, mockTriggerLayout } from '../__fixtures__/testUtils';

type Fruit = { label: string; value: string };

const fruits: Fruit[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Crème brûlée', value: 'creme' },
  { label: 'Dragon fruit', value: 'dragon' },
];

const renderDropdown = (
  props: Partial<React.ComponentProps<typeof Dropdown>> = {}
) =>
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

const open = async () => {
  await fireEvent.press(trigger());
  await layoutOpenList();
};

// The list counts as open while it waits for its layout and is still hidden.
const isOpen = () =>
  screen.queryByTestId('dropdown flatlist', { includeHiddenElements: true }) !==
  null;

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

    it('does not call onBlur when it unmounts', async () => {
      const onBlur = jest.fn();
      const { unmount } = await renderDropdown({ onBlur });

      await unmount();

      expect(onBlur).not.toHaveBeenCalled();
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
          <TextInput testID="custom search" onChangeText={onSearch} />
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

  describe('accessibility (2.13 behaviour)', () => {
    it('exposes the trigger as an expandable button when accessibilityLabel is set', async () => {
      await renderDropdown({ accessibilityLabel: 'Fruit' });

      expect(
        screen.getByRole('button', { name: 'Fruit', expanded: false })
      ).toBeTruthy();

      await open();

      expect(
        screen.getByRole('button', { name: 'Fruit', expanded: true })
      ).toBeTruthy();
    });

    it('exposes rows as radio buttons named by their label when accessibilityLabel is set', async () => {
      await renderDropdown({ accessibilityLabel: 'Fruit' });
      await open();

      expect(screen.getAllByRole('radio')).toHaveLength(fruits.length);
      expect(screen.getByRole('radio', { name: 'Banana' })).toBeTruthy();
    });

    // Target behaviour (v3 plan, phase 5): accessible without a label.
    it.failing(
      'exposes the trigger and rows without an accessibilityLabel',
      async () => {
        await renderDropdown();
        await open();

        expect(screen.getByRole('button')).toBeTruthy();
        expect(screen.getAllByRole('radio')).toHaveLength(fruits.length);
      }
    );
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
