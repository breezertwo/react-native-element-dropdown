// Characterisation tests: they describe how MultiSelect behaves in 2.13, so
// the v3 refactor can't change behaviour by accident. Known bugs are written
// as the desired behaviour and marked `it.failing`; fixing one flips its test.
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
import { Text } from 'react-native';
import { MultiSelect, type IMultiSelectRef } from '../index';
import { layoutOpenList, mockTriggerLayout } from '../__fixtures__/testUtils';

type Fruit = { label: string; value: string };

const fruits: Fruit[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

const renderMultiSelect = (
  props: Partial<React.ComponentProps<typeof MultiSelect>> = {}
) =>
  render(
    <MultiSelect
      testID="multiselect"
      data={fruits}
      labelField="label"
      valueField="value"
      onChange={() => {}}
      {...props}
    />
  );

const pressTrigger = () => fireEvent.press(screen.getByTestId('multiselect'));

const open = async () => {
  await pressTrigger();
  await layoutOpenList();
};

// The list counts as open while it waits for its layout and is still hidden.
const isOpen = () =>
  screen.queryByTestId('multiselect flatlist', {
    includeHiddenElements: true,
  }) !== null;

beforeEach(() => {
  jest.useFakeTimers();
  mockTriggerLayout();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('MultiSelect', () => {
  describe('opening and closing', () => {
    it('always shows the placeholder in the field', async () => {
      await renderMultiSelect({ value: ['apple'] });

      expect(screen.getByText('Select item')).toBeTruthy();
    });

    it('opens on press, calls onFocus, and closes on a second press calling onBlur', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      await renderMultiSelect({ onFocus, onBlur });

      await open();
      expect(isOpen()).toBe(true);
      expect(onFocus).toHaveBeenCalledTimes(1);

      await pressTrigger();
      expect(isOpen()).toBe(false);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('can be opened, closed and toggled through its ref', async () => {
      const ref = createRef<IMultiSelectRef>();
      await renderMultiSelect({ ref });

      await act(async () => ref.current?.open());
      expect(isOpen()).toBe(true);

      await act(async () => ref.current?.close());
      expect(isOpen()).toBe(false);

      await act(async () => ref.current?.toggle());
      expect(isOpen()).toBe(true);
    });

    it('does nothing when disabled', async () => {
      await renderMultiSelect({ disable: true });

      await pressTrigger();

      expect(isOpen()).toBe(false);
    });

    it('does not call onBlur when it unmounts while closed', async () => {
      const onBlur = jest.fn();
      const { unmount } = await renderMultiSelect({ onBlur });
      await open();
      await pressTrigger();
      expect(onBlur).toHaveBeenCalledTimes(1);

      await unmount();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur once when it unmounts while open', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { unmount } = await renderMultiSelect({ onFocus, onBlur });
      await open();

      await unmount();

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls the latest onBlur when it unmounts while open', async () => {
      const firstOnBlur = jest.fn();
      const latestOnBlur = jest.fn();
      const { rerender, unmount } = await renderMultiSelect({
        onBlur: firstOnBlur,
      });
      await open();

      await rerender(
        <MultiSelect
          testID="multiselect"
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
    it('adds an item to the selection and stays open', async () => {
      const onChange = jest.fn();
      await renderMultiSelect({ value: ['apple'], onChange });
      await open();

      await fireEvent.press(screen.getByText('Banana'));

      expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
      expect(isOpen()).toBe(true);
    });

    it('removes a selected item from the selection', async () => {
      const onChange = jest.fn();
      await renderMultiSelect({ value: ['apple', 'banana'], onChange });
      await open();

      await fireEvent.press(screen.getByText('Apple'));

      expect(onChange).toHaveBeenCalledWith(['banana']);
    });

    it('stops adding at maxSelect but still calls onChange', async () => {
      const onChange = jest.fn();
      await renderMultiSelect({
        value: ['apple', 'banana'],
        maxSelect: 2,
        onChange,
      });
      await open();

      await fireEvent.press(screen.getByText('Cherry'));

      expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
    });

    it('calls onConfirmSelectItem instead of onChange when confirmSelectItem is set', async () => {
      const onChange = jest.fn();
      const onConfirmSelectItem = jest.fn();
      await renderMultiSelect({
        value: ['apple'],
        confirmSelectItem: true,
        onConfirmSelectItem,
        onChange,
      });
      await open();

      await fireEvent.press(screen.getByText('Banana'));
      expect(onConfirmSelectItem).toHaveBeenCalledWith(['apple', 'banana']);
      expect(onChange).not.toHaveBeenCalled();

      // Unselecting still goes through onChange without confirmUnSelectItem.
      await fireEvent.press(screen.getByText('Apple'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('calls onConfirmSelectItem for unselecting when confirmUnSelectItem is set', async () => {
      const onChange = jest.fn();
      const onConfirmSelectItem = jest.fn();
      await renderMultiSelect({
        value: ['apple'],
        confirmUnSelectItem: true,
        onConfirmSelectItem,
        onChange,
      });
      await open();

      await fireEvent.press(screen.getByText('Apple'));

      expect(onConfirmSelectItem).toHaveBeenCalledWith([]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('passes item and selected state to renderItem', async () => {
      await renderMultiSelect({
        value: ['banana'],
        renderItem: (item: Fruit, selected?: boolean) => (
          <Text>{`${item.label}${selected ? ' (selected)' : ''}`}</Text>
        ),
      });
      await open();

      expect(screen.getByText('Apple')).toBeTruthy();
      expect(screen.getByText('Banana (selected)')).toBeTruthy();
    });
  });

  describe('chips', () => {
    // While the list is closed, item labels only appear as chips.
    it.each([undefined, null, []])(
      'shows no chips when value is %p',
      async (value) => {
        await renderMultiSelect({ value });

        expect(screen.queryByText('Apple')).toBeNull();
        expect(screen.queryByText('Banana')).toBeNull();
      }
    );

    it('shows a chip for each selected item below the field', async () => {
      await renderMultiSelect({ value: ['banana', 'cherry'] });

      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.getByText('Cherry')).toBeTruthy();
    });

    it('renders chips for items with the same label', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      await renderMultiSelect({
        data: [
          { label: 'Apple', value: 'red' },
          { label: 'Apple', value: 'green' },
        ],
        value: ['red', 'green'],
      });

      expect(screen.getAllByText('Apple')).toHaveLength(2);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('unselects an item when its chip is pressed', async () => {
      const onChange = jest.fn();
      await renderMultiSelect({ value: ['banana', 'cherry'], onChange });

      await fireEvent.press(screen.getByText('Banana'));

      expect(onChange).toHaveBeenCalledWith(['cherry']);
    });

    it('hides the chips while the list is open', async () => {
      await renderMultiSelect({ value: ['banana'] });
      await open();

      // Only the list row is left.
      expect(screen.getAllByText('Banana')).toHaveLength(1);
    });

    it('keeps the chips while open with alwaysRenderSelectedItem', async () => {
      await renderMultiSelect({
        value: ['banana'],
        alwaysRenderSelectedItem: true,
      });
      await open();

      expect(screen.getAllByText('Banana')).toHaveLength(2);
    });

    it('shows no chips with visibleSelectedItem={false}', async () => {
      await renderMultiSelect({
        value: ['banana'],
        visibleSelectedItem: false,
      });

      expect(screen.queryByText('Banana')).toBeNull();
    });

    it('shows chips inside the field instead of the placeholder with inside', async () => {
      await renderMultiSelect({ value: ['banana'], inside: true });

      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Select item')).toBeNull();
    });

    it('passes the open state to the icon render props with inside', async () => {
      await renderMultiSelect({
        inside: true,
        renderLeftIcon: (visible?: boolean) => <Text>{`left ${visible}`}</Text>,
        renderRightIcon: (visible?: boolean) => (
          <Text>{`right ${visible}`}</Text>
        ),
      });

      expect(screen.getByText('left false')).toBeTruthy();
      expect(screen.getByText('right false')).toBeTruthy();

      await pressTrigger();

      expect(screen.getByText('left true')).toBeTruthy();
      expect(screen.getByText('right true')).toBeTruthy();
    });

    it('renders custom chips with renderSelectedItem', async () => {
      const onChange = jest.fn();
      await renderMultiSelect({
        value: ['banana'],
        onChange,
        renderSelectedItem: (item: Fruit, unSelect) => (
          <Text onPress={() => unSelect?.(item)}>{`chip ${item.label}`}</Text>
        ),
      });

      await fireEvent.press(screen.getByText('chip Banana'));

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('search', () => {
    it('filters by label, ignoring case, whitespace and accents', async () => {
      await renderMultiSelect({
        search: true,
        data: [...fruits, { label: 'Crème brûlée', value: 'creme' }],
      });
      await open();

      await fireEvent.changeText(
        screen.getByTestId('multiselect input'),
        'CREME BRU'
      );

      expect(screen.getByText('Crème brûlée')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('filters and reports the text when onChangeText is set', async () => {
      const onChangeText = jest.fn();
      await renderMultiSelect({ search: true, onChangeText });
      await open();

      await fireEvent.changeText(
        screen.getByTestId('multiselect input'),
        'ban'
      );

      expect(onChangeText).toHaveBeenLastCalledWith('ban');
      expect(screen.getByText('Banana')).toBeTruthy();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('starts with an empty search and the full list after reopening', async () => {
      const onChangeText = jest.fn();
      await renderMultiSelect({ search: true, onChangeText });
      await open();
      await fireEvent.changeText(
        screen.getByTestId('multiselect input'),
        'ban'
      );

      await pressTrigger();
      await open();

      expect(screen.getByTestId('multiselect input').props.value).toBe('');
      expect(screen.getByText('Apple')).toBeTruthy();
      // Unlike Dropdown, closing doesn't report an empty search text.
      expect(onChangeText).not.toHaveBeenCalledWith('');
    });

    it('hides excludeItems from the list', async () => {
      await renderMultiSelect({ excludeItems: [fruits[0]!] });
      await open();

      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.getByText('Banana')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    describe('field', () => {
      it('is a combo box named by accessibilityLabel that reports whether it is expanded', async () => {
        await renderMultiSelect({ accessibilityLabel: 'Fruits' });

        expect(
          screen.getByRole('combobox', { name: 'Fruits', expanded: false })
        ).toBeTruthy();

        await open();

        expect(
          screen.getByRole('combobox', { name: 'Fruits', expanded: true })
        ).toBeTruthy();
      });

      it('is named by the placeholder and reports the number selected', async () => {
        await renderMultiSelect({
          placeholder: 'Pick fruits',
          value: ['apple', 'banana'],
        });

        expect(
          screen.getByRole('combobox', {
            name: 'Pick fruits',
            value: { text: '2 selected' },
          })
        ).toBeTruthy();
      });

      it('uses accessibilityStrings for the value', async () => {
        await renderMultiSelect({
          accessibilityLabel: 'Obst',
          value: ['apple'],
          accessibilityStrings: { selectedCount: (n) => `${n} ausgewählt` },
        });

        expect(
          screen.getByRole('combobox', {
            name: 'Obst',
            value: { text: '1 ausgewählt' },
          })
        ).toBeTruthy();
      });

      it('has the same semantics with inside', async () => {
        await renderMultiSelect({
          inside: true,
          accessibilityLabel: 'Fruits',
          value: ['apple'],
          disable: true,
        });

        expect(
          screen.getByRole('combobox', {
            name: 'Fruits',
            value: { text: '1 selected' },
            expanded: false,
            disabled: true,
          })
        ).toBeTruthy();
      });
    });

    it('names rows by their label, without a role, when accessibilityLabel is set', async () => {
      await renderMultiSelect({ accessibilityLabel: 'Fruits' });
      await open();

      expect(screen.getByLabelText('Banana')).toBeTruthy();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('puts testID on the trigger', async () => {
      await renderMultiSelect();

      expect(screen.getByTestId('multiselect')).toBeTruthy();
    });

    // Target behaviour (v3 plan, phase 5).
    it.failing(
      'exposes rows as checkboxes with their checked state',
      async () => {
        await renderMultiSelect({ value: ['banana'] });
        await open();

        expect(
          screen.getByRole('checkbox', { name: 'Banana', checked: true })
        ).toBeTruthy();
        expect(
          screen.getByRole('checkbox', { name: 'Apple', checked: false })
        ).toBeTruthy();
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

      await renderMultiSelect({ data, value: ['2'] });
      await open();

      expect(screen.getByText('Apple')).toBeTruthy();
      expect(data).toEqual(snapshot);
    });
  });
});
