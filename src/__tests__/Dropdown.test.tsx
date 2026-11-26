import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { Dropdown } from '../index';
import {
  mockTriggerLayout,
  press,
  renderedTexts,
} from '../__fixtures__/testUtils';

let tree: ReactTestRenderer | undefined;

beforeEach(() => {
  jest.useFakeTimers();
  mockTriggerLayout();
});

afterEach(() => {
  act(() => {
    tree?.unmount();
    jest.runOnlyPendingTimers();
  });
  tree = undefined;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Dropdown', () => {
  it('does not mutate the items passed in data', () => {
    const data = [
      { label: 'Apple', value: '1' },
      { label: 'Banana', value: '2' },
    ];
    const snapshot = JSON.parse(JSON.stringify(data));

    act(() => {
      tree = renderer.create(
        <Dropdown
          testID="dropdown"
          data={data}
          labelField="label"
          valueField="value"
          value="2"
          onChange={() => {}}
        />
      );
    });
    press(tree!, { testID: 'dropdown' });

    expect(renderedTexts(tree!)).toEqual(
      expect.arrayContaining(['Apple', 'Banana'])
    );
    expect(data).toEqual(snapshot);
  });
});
