import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Dropdown } from '../index';
import { mockTriggerLayout } from '../__fixtures__/testUtils';

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
  it('does not mutate the items passed in data', () => {
    const data = [
      { label: 'Apple', value: '1' },
      { label: 'Banana', value: '2' },
    ];
    const snapshot = JSON.parse(JSON.stringify(data));

    render(
      <Dropdown
        testID="dropdown"
        data={data}
        labelField="label"
        valueField="value"
        value="2"
        onChange={() => {}}
      />
    );
    fireEvent.press(screen.getByTestId('dropdown'));

    // The list stays hidden until the modal has been laid out, which never
    // happens in tests, so include hidden elements.
    expect(
      screen.getByText('Apple', { includeHiddenElements: true })
    ).toBeTruthy();
    expect(data).toEqual(snapshot);
  });
});
