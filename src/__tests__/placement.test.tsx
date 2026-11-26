// Characterisation tests for useDropdownPlacement as rendered by Dropdown
// (iOS in the test environment): where the open list goes and how tall it may
// get. The v3 refactor extracts this math into a pure function; these numbers
// must not change.
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
import { Dimensions, Keyboard } from 'react-native';
import { Dropdown, type DropdownProps, type IDropdownRef } from '../index';
import {
  layoutOpenList,
  mockTriggerLayout,
  openListStyle,
  openListWrapperStyle,
} from '../__fixtures__/testUtils';

type Item = { label: string; value: string };

const items: Item[] = Array.from({ length: 20 }, (_, index) => ({
  label: `Item ${index + 1}`,
  value: String(index + 1),
}));

// 400 x 800 screen; trigger 200 x 40 at x = 16; list content 200 high;
// maxHeight defaults to 340; gap between trigger and list: 2; edge margin: 8.
const screenSize = { width: 400, height: 800 };

const openAt = async (
  y: number,
  props: Partial<DropdownProps<Item, 'value'>> = {}
) => {
  mockTriggerLayout({ x: 16, y, width: 200, height: 40 });
  await render(
    <Dropdown
      testID="dropdown"
      data={items}
      labelField="label"
      valueField="value"
      onChange={() => {}}
      {...props}
    />
  );
  await fireEvent.press(screen.getByTestId('dropdown'));
  await layoutOpenList({ screenSize, contentHeight: 200 });
};

type KeyboardListener = (event: unknown) => void;
let keyboardListeners: Map<string, KeyboardListener[]>;

/** Calls the Keyboard listeners the dropdown registered, like a native event. */
const emitKeyboardEvent = (eventName: string, event: unknown) =>
  act(async () => {
    keyboardListeners.get(eventName)?.forEach((listener) => listener(event));
  });

const keyboardDidShow = (screenY: number, height: number) =>
  emitKeyboardEvent('keyboardDidShow', {
    endCoordinates: { screenX: 0, screenY, width: 400, height },
  });

beforeEach(() => {
  jest.useFakeTimers();
  // Same screen as the modal layout, so the keyboard frame (which iOS checks
  // against the screen height) is consistent with it.
  jest
    .spyOn(Dimensions, 'get')
    .mockReturnValue({ ...screenSize, scale: 2, fontScale: 1 });
  keyboardListeners = new Map();
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((
    eventName: string,
    listener: KeyboardListener
  ) => {
    keyboardListeners.set(eventName, [
      ...(keyboardListeners.get(eventName) ?? []),
      listener,
    ]);
    return { remove: () => {} };
  }) as unknown as typeof Keyboard.addListener);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('dropdown placement', () => {
  it('opens below the trigger when there is room', async () => {
    await openAt(100);

    // 100 + 40 + 2
    expect(openListWrapperStyle()).toMatchObject({ paddingTop: 142 });
    expect(openListStyle()).toMatchObject({
      left: 16,
      width: 200,
      maxHeight: 340,
    });
  });

  it('opens above the trigger near the bottom of the screen', async () => {
    await openAt(700);

    // Below: 800 - 8 - 742 = 50 < 200 needed; above: 698 - 8 = 690.
    expect(openListWrapperStyle()).toMatchObject({
      justifyContent: 'flex-end',
      paddingBottom: 102, // 800 - (700 - 2)
    });
    expect(openListStyle()).toMatchObject({ maxHeight: 340 });
  });

  it('shrinks the list to the space below when that is still the larger side', async () => {
    await openAt(300, { maxHeight: 600 });

    // Below: 792 - 342 = 450; above: 298 - 8 = 290. Content (200) fits below,
    // and the list may grow to the 450 below, not to maxHeight (600).
    expect(openListWrapperStyle()).toMatchObject({ paddingTop: 342 });
    expect(openListStyle()).toMatchObject({ maxHeight: 450 });
  });

  it('keeps dropdownPosition="top" even when there is no room above', async () => {
    await openAt(100, { dropdownPosition: 'top' });

    expect(openListWrapperStyle()).toMatchObject({
      justifyContent: 'flex-end',
      paddingBottom: 702, // 800 - (100 - 2)
    });
  });

  it('keeps dropdownPosition="bottom" even near the bottom of the screen', async () => {
    await openAt(700, { dropdownPosition: 'bottom' });

    expect(openListWrapperStyle()).toMatchObject({ paddingTop: 742 });
  });

  it('respects safeAreaInsets at the bottom', async () => {
    await openAt(560, { safeAreaInsets: { bottom: 34 } });

    // Below: 800 - 34 - 8 - 602 = 156 < 200; above: 558 - 8 = 550.
    expect(openListWrapperStyle()).toMatchObject({
      justifyContent: 'flex-end',
      paddingBottom: 242, // 800 - (560 - 2)
    });
  });

  it('opens above the trigger when the keyboard covers the space below', async () => {
    await openAt(300);
    expect(openListWrapperStyle()).toMatchObject({ paddingTop: 342 });

    await keyboardDidShow(500, 300);

    // Keyboard top 500: below 498 - 342 = 156 < 200; above 298 - 8 = 290.
    expect(openListWrapperStyle()).toMatchObject({
      justifyContent: 'flex-end',
      paddingBottom: 502, // 800 - (300 - 2)
    });
    expect(openListStyle()).toMatchObject({ maxHeight: 290 });
  });

  describe('opening again', () => {
    it('keeps the list hidden until it is laid out again', async () => {
      await openAt(100);
      expect(openListStyle()).not.toMatchObject({ opacity: 0 });

      await fireEvent.press(screen.getByTestId('dropdown'));
      await fireEvent.press(screen.getByTestId('dropdown'));

      // The sizes of the last opening are gone: hidden until measured.
      expect(openListStyle()).toMatchObject({ opacity: 0 });
      await layoutOpenList({ screenSize, contentHeight: 200 });
      expect(openListStyle()).not.toMatchObject({ opacity: 0 });
      expect(openListWrapperStyle()).toMatchObject({ paddingTop: 142 });
    });

    it('forgets the keyboard of the last opening', async () => {
      const ref = createRef<IDropdownRef>();
      await openAt(300, { ref });
      await keyboardDidShow(500, 300);
      await act(async () => ref.current?.close());

      // Opens on the first press: no keyboard left to dismiss first.
      await fireEvent.press(screen.getByTestId('dropdown'));
      await layoutOpenList({ screenSize, contentHeight: 200 });

      expect(openListWrapperStyle()).toMatchObject({ paddingTop: 342 });
    });
  });

  it('ignores the keyboard with keyboardAvoiding={false}', async () => {
    await openAt(300, { keyboardAvoiding: false });

    await keyboardDidShow(500, 300);

    expect(openListWrapperStyle()).toMatchObject({ paddingTop: 342 });
  });
});
