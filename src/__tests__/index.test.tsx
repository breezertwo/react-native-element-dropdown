import { describe, expect, it, jest } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Dropdown, MultiSelect, SelectCountry } from '../index';
import { SELECT_COUNTRY_DEPRECATION_MESSAGE } from '../components/SelectCountry';

const countries = [
  {
    value: '1',
    label: 'Country 1',
    image: { uri: 'https://example.com/1.png' },
  },
  {
    value: '2',
    label: 'Country 2',
    image: { uri: 'https://example.com/2.png' },
  },
];

describe('package exports', () => {
  it('exports the components', () => {
    expect(Dropdown).toBeDefined();
    expect(MultiSelect).toBeDefined();
    expect(SelectCountry).toBeDefined();
  });
});

describe('SelectCountry deprecation', () => {
  it('warns once in development, no matter how many instances render', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const renderSelectCountry = () =>
      renderer.create(
        <SelectCountry
          data={countries}
          labelField="label"
          valueField="value"
          imageField="image"
          value="1"
          onChange={() => {}}
        />
      );

    act(() => {
      renderSelectCountry();
      renderSelectCountry();
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(SELECT_COUNTRY_DEPRECATION_MESSAGE);

    warn.mockRestore();
  });
});
