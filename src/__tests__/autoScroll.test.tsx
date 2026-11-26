import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { FlatList } from 'react-native';
import { Dropdown } from '../index';
import { layoutOpenList, mockTriggerLayout } from '../__fixtures__/testUtils';

const items = Array.from({ length: 100 }, (_, index) => ({
  label: `Item ${index}`,
  value: `item-${index}`,
}));

const renderDropdown = (
  props: Partial<React.ComponentProps<typeof Dropdown>> = {}
) =>
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

const open = async () => {
  await fireEvent.press(screen.getByTestId('dropdown'));
  await layoutOpenList();
};

const close = () => fireEvent.press(screen.getByTestId('dropdown'));

/** FlatList reports its content size, e.g. after rendering more rows. */
const contentSizeChange = (height: number) =>
  fireEvent(
    screen.getByTestId('dropdown flatlist'),
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
    expect(scrollToIndex).toHaveBeenCalledWith({ index: 60, animated: false });
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

    expect(scrollToIndex).toHaveBeenCalledWith({ index: 50, animated: false });
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

    expect(scrollToIndex).toHaveBeenCalledWith({ index: 3, animated: false });
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

  it('retries a few times when the row is not rendered yet', async () => {
    let failScroll: (index: number) => void = () => {};
    scrollToIndex.mockImplementation(function (
      this: FlatList,
      ...args: unknown[]
    ) {
      const { index } = args[0] as { index: number };
      failScroll = (i) =>
        this.props.onScrollToIndexFailed?.({
          index: i,
          highestMeasuredFrameIndex: 10,
          averageItemLength: 50,
        });
      failScroll(index);
    });
    await renderDropdown();
    await open();

    await contentSizeChange(2000);
    await act(async () => {
      jest.runAllTimers();
    });

    // The first attempt plus three retries, each after jumping close to the row.
    expect(scrollToIndex).toHaveBeenCalledTimes(4);
    expect(scrollToOffset).toHaveBeenCalledTimes(3);
    expect(scrollToOffset).toHaveBeenCalledWith({
      offset: 3000,
      animated: false,
    });
  });
});
