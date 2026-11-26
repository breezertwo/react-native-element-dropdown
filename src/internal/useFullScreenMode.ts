import { PixelRatio, useWindowDimensions } from 'react-native';

export type DropdownMode = 'default' | 'modal' | 'auto';

type WindowSize = { width: number; height: number; pixelRatio: number };

/** Whether a window this size is a tablet, judged by its size in pixels. */
export const isTabletWindow = ({ width, height, pixelRatio }: WindowSize) => {
  const pixelWidth = width * pixelRatio;
  const pixelHeight = height * pixelRatio;
  if (pixelRatio < 2) {
    return pixelWidth >= 1000 || pixelHeight >= 1000;
  }
  return pixelRatio === 2 && (pixelWidth >= 1824 || pixelHeight >= 1824);
};

/**
 * Whether the list opens full screen (centered on a dimmed backdrop) instead
 * of next to the trigger: with `mode="modal"`, and on phones in landscape.
 * Tablets and `mode="auto"` never do. Follows window size changes (rotation,
 * split view, foldables).
 */
export const useFullScreenMode = (mode: DropdownMode) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = isTabletWindow({
    width,
    height,
    pixelRatio: PixelRatio.get(),
  });
  const isFull =
    !isTablet && mode !== 'auto' && (mode === 'modal' || isLandscape);
  return { isFull, isLandscape };
};
