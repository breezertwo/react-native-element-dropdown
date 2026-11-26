import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react-native';
import React from 'react';
import { FlatList } from 'react-native';
import { Dropdown, type DropdownProps } from '../index';
import { REVEAL_TIMEOUT_MS, useAutoScroll } from '../internal/useAutoScroll';
import { layoutOpenList, mockTriggerLayout } from '../__fixtures__/testUtils';

type Item = { label: string; value: string };

const items: Item[] = Array.from({ length: 100 }, (_, index) => ({
  label: `Item ${index}`,
  value: `item-${index}`,
}));

const renderDropdown = (props: Partial<DropdownProps<Item, 'value'>> = {}) =>
  render(
    <Dropdown
      testID="dropdown"
      data={items}
      labelField="label"
      valueField="value"
      value="item-60"
      onChange={() => {}}
      {...props}
    />
  );

// The tests report the content size themselves.
const open = async () => {
  await fireEvent.press(screen.getByTestId('dropdown'));
  await layoutOpenList({ layOutContent: false });
};

const close = () => fireEvent.press(screen.getByTestId('dropdown'));

/** FlatList reports its content size, e.g. after rendering more rows. */
const contentSizeChange = (height: number) =>
  fireEvent(
    // Still hidden: the list is shown once it is scrolled.
    screen.getByTestId('dropdown flatlist', { includeHiddenElements: true }),
    'contentSizeChange',
    200,
    height
  );

let scrollToIndex: ReturnType<typeof jest.spyOn>;
let scrollToOffset: ReturnType<typeof jest.spyOn>;

beforeEach(() => {
  jest.useFakeTimers();
  mockTriggerLayout();
  scrollToIndex = jest
    .spyOn(FlatList.prototype, 'scrollToIndex')
    .mockImplementation(() => {});
  scrollToOffset = jest
    .spyOn(FlatList.prototype, 'scrollToOffset')
    .mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Dropdown autoScroll', () => {
  it('scrolls to the selected item once its content is laid out', async () => {
    await renderDropdown();
    await open();

    await contentSizeChange(2000);

    expect(scrollToIndex).toHaveBeenCalledTimes(1);
    expect(scrollToIndex).toHaveBeenCalledWith({
      index: 60,
      animated: false,
      viewPosition: 0.5,
    });
  });

  describe('showing the list', () => {
    const isListShown = () =>
      screen.queryByTestId('dropdown flatlist') !== null;
    const advanceFrames = (ms: number) =>
      act(async () => {
        jest.advanceTimersByTime(ms);
      });

    it('keeps the list hidden until the scroll is on screen', async () => {
      await renderDropdown();
      await open();
      expect(isListShown()).toBe(false);

      await contentSizeChange(2000);
      expect(isListShown()).toBe(false);

      // Two frames for the native scroll and the rows to appear.
      await advanceFrames(40);
      expect(isListShown()).toBe(true);
    });

    it('shows the list right away without a selection', async () => {
      await renderDropdown({ value: null });
      await open();

      expect(isListShown()).toBe(true);
    });

    it('shows the list right away with autoScroll={false}', async () => {
      await renderDropdown({ autoScroll: false });
      await open();

      expect(isListShown()).toBe(true);
    });

    it('shows the list in time even if the scroll never happens', async () => {
      await renderDropdown();
      await open();

      // No content size reported, e.g. nothing laid out.
      await advanceFrames(REVEAL_TIMEOUT_MS - 1);
      expect(isListShown()).toBe(false);
      await advanceFrames(1);
      expect(isListShown()).toBe(true);
    });
  });

  it("doesn't scroll back when more content is laid out", async () => {
    await renderDropdown();
    await open();

    await contentSizeChange(2000);
    await contentSizeChange(4000);
    await contentSizeChange(6000);

    expect(scrollToIndex).toHaveBeenCalledTimes(1);
  });

  it('uses the index in the shown list', async () => {
    await renderDropdown({ excludeItems: items.slice(0, 10) });
    await open();

    await contentSizeChange(2000);

    expect(scrollToIndex).toHaveBeenCalledWith({
      index: 50,
      animated: false,
      viewPosition: 0.5,
    });
  });

  it('scrolls to an item selected without updating value', async () => {
    await renderDropdown({ value: null, closeModalWhenSelectedItem: false });
    await open();
    await contentSizeChange(2000);
    expect(scrollToIndex).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Item 3'));
    await close();
    await open();
    await contentSizeChange(2000);

    expect(scrollToIndex).toHaveBeenCalledWith({
      index: 3,
      animated: false,
      viewPosition: 0.5,
    });
  });

  it('scrolls again each time the list opens', async () => {
    await renderDropdown();
    await open();
    await contentSizeChange(2000);
    await close();

    await open();
    await contentSizeChange(2000);

    expect(scrollToIndex).toHaveBeenCalledTimes(2);
  });

  it("doesn't scroll with autoScroll={false} or without a selection", async () => {
    await renderDropdown({ autoScroll: false });
    await open();
    await contentSizeChange(2000);

    await close();
    await renderDropdown({ value: 'not-in-the-list' });
    await open();
    await contentSizeChange(2000);

    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('retries later when the row is not measured yet, at most ten times', async () => {
    let failures = 0;
    scrollToIndex.mockImplementation(function (
      this: FlatList,
      ...args: unknown[]
    ) {
      const { index } = args[0] as { index: number };
      failures += 1;
      // No row is measured on the first attempt, so the average is unknown.
      this.props.onScrollToIndexFailed?.({
        index,
        highestMeasuredFrameIndex: 10,
        averageItemLength: failures === 1 ? 0 : 50,
      });
    });
    await renderDropdown();
    await open();

    await contentSizeChange(2000);
    expect(scrollToIndex).toHaveBeenCalledTimes(1);
    expect(scrollToOffset).not.toHaveBeenCalled();

    // The retry waits about one FlatList render batch.
    await act(async () => {
      jest.advanceTimersByTime(49);
    });
    expect(scrollToIndex).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(scrollToIndex).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.runAllTimers();
    });

    // Shown where it is once the retries are used up.
    expect(screen.queryByTestId('dropdown flatlist')).not.toBeNull();
    // The first attempt plus ten retries; from the second failure on, each
    // jumps close to the row first.
    expect(scrollToIndex).toHaveBeenCalledTimes(11);
    expect(scrollToOffset).toHaveBeenCalledTimes(9);
    expect(scrollToOffset).toHaveBeenCalledWith({
      offset: 3000,
      animated: false,
    });
  });
});

describe('useAutoScroll first render batch', () => {
  const data = items;
  const isSelected = (index: number) => (item: (typeof items)[number]) =>
    item.value === `item-${index}`;

  it.each([
    // [selected index, consumer initialNumToRender, getItemLayout, expected]
    [60, undefined, false, 71], // every row up to 60, plus ten after it
    [5, undefined, false, 10], // within FlatList's default batch of 10
    [60, 100, false, 100], // within the consumer's batch
    [60, undefined, true, 10], // getItemLayout: FlatList can scroll anywhere
    [-1, undefined, false, 10], // nothing selected
  ])(
    'selected %p, initialNumToRender %p, getItemLayout %p → %p',
    async (index, initialNumToRender, hasItemLayout, expected) => {
      const { result } = await renderHook(() =>
        useAutoScroll({
          enabled: true,
          visible: true,
          openingId: 1,
          listData: data,
          isSelected: isSelected(index),
          initialNumToRender,
          hasItemLayout,
        })
      );

      expect(result.current.initialNumToRender).toBe(expected);
    }
  );

  it('renders every row up to the selected one in the list', async () => {
    await renderDropdown();
    await open();

    // Item 60 is also in the field, so check rows just above it.
    for (const label of ['Item 0', 'Item 30', 'Item 59']) {
      expect(
        screen.getByText(label, { includeHiddenElements: true })
      ).toBeTruthy();
    }
  });
});
