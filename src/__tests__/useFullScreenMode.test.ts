import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { Dimensions, PixelRatio } from 'react-native';
import {
  isTabletWindow,
  useFullScreenMode,
} from '../internal/useFullScreenMode';

const setWindow = (width: number, height: number) => {
  const size = { width, height, scale: 2, fontScale: 1 };
  Dimensions.set({ window: size, screen: size });
};

// Back to the Jest preset's window, inside act because the hooks of the test
// are still mounted.
afterEach(async () => {
  jest.restoreAllMocks();
  await act(async () => setWindow(750, 1334));
});

describe('isTabletWindow', () => {
  it.each([
    // [width, height, pixel ratio, tablet]
    [390, 844, 3, false], // phone
    [375, 667, 2, false], // small phone
    [1024, 1366, 2, true], // iPad Pro
    [768, 1024, 2, true], // iPad
    [800, 1280, 1, true], // low-density tablet
    [320, 568, 1.5, false],
  ])('%p x %p @%px → %p', (width, height, pixelRatio, expected) => {
    expect(isTabletWindow({ width, height, pixelRatio })).toBe(expected);
  });
});

describe('useFullScreenMode', () => {
  it('follows rotation on a phone', async () => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
    setWindow(390, 844);
    const { result } = await renderHook(() => useFullScreenMode('default'));

    expect(result.current).toEqual({ isFull: false, isLandscape: false });

    await act(async () => setWindow(844, 390));

    expect(result.current).toEqual({ isFull: true, isLandscape: true });
  });

  it('always opens full screen with mode="modal" on a phone', async () => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
    setWindow(390, 844);
    const { result } = await renderHook(() => useFullScreenMode('modal'));

    expect(result.current.isFull).toBe(true);
  });

  it('never opens full screen on a tablet or with mode="auto"', async () => {
    jest.spyOn(PixelRatio, 'get').mockReturnValue(2);
    setWindow(1366, 1024);
    const tablet = await renderHook(() => useFullScreenMode('modal'));
    expect(tablet.result.current.isFull).toBe(false);

    jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
    setWindow(844, 390);
    const auto = await renderHook(() => useFullScreenMode('auto'));
    expect(auto.result.current.isFull).toBe(false);
  });
});
