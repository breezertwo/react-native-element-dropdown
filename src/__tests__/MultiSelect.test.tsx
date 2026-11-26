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
import { MultiSelect } from '../index';
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

describe('MultiSelect', () => {
  it('does not mutate the items passed in data', () => {
    const data = [
      { label: 'Apple', value: '1' },
      { label: 'Banana', value: '2' },
    ];
    const snapshot = JSON.parse(JSON.stringify(data));

    render(
      <MultiSelect
        accessibilityLabel="Fruits"
        data={data}
        labelField="label"
        valueField="value"
        value={['2']}
        onChange={() => {}}
      />
    );
    // The MultiSelect trigger doesn't receive testID, so find it by its label.
    fireEvent.press(screen.getByLabelText('Fruits'));

    // The list stays hidden until the modal has been laid out, which never
    // happens in tests, so include hidden elements.
    expect(
      screen.getByText('Apple', { includeHiddenElements: true })
    ).toBeTruthy();
    expect(data).toEqual(snapshot);
  });
});
