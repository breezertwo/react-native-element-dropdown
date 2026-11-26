import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import SearchInput from '../internal/SearchInput';

describe('SearchInput', () => {
  it('follows its value, including back to empty', async () => {
    const { rerender } = await render(
      <SearchInput testID="search" value="ban" />
    );
    expect(screen.getByTestId('search').props.value).toBe('ban');

    await rerender(<SearchInput testID="search" value="" />);

    expect(screen.getByTestId('search').props.value).toBe('');
  });

  it('keeps its own text without a value', async () => {
    const onChangeText = jest.fn();
    await render(<SearchInput testID="search" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByTestId('search'), 'app');

    expect(screen.getByTestId('search').props.value).toBe('app');
    expect(onChangeText).toHaveBeenCalledWith('app');
  });
});
