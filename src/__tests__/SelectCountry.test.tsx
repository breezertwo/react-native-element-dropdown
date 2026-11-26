import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { SelectCountry } from '../index';

const countries = [
  { code: 'de', name: 'Germany', flag: { uri: 'https://example.com/de.png' } },
  { code: 'fr', name: 'France', flag: { uri: 'https://example.com/fr.png' } },
];

const renderedImageSources = () =>
  (screen.root?.queryAll((node) => node.type === 'Image') ?? []).map(
    (node) => node.props.source
  );

beforeEach(() => {
  // SelectCountry is deprecated and warns once in development.
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SelectCountry', () => {
  it('shows the image of the selected item from imageField', async () => {
    await render(
      <SelectCountry
        data={countries}
        labelField="name"
        valueField="code"
        imageField="flag"
        value="fr"
        onChange={() => {}}
      />
    );

    expect(renderedImageSources()).toContainEqual(countries[1]!.flag);
    expect(renderedImageSources()).not.toContainEqual(countries[0]!.flag);
  });
});
