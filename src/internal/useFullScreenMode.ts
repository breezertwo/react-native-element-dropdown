import { Dimensions, PixelRatio } from 'react-native';
import { useDeviceOrientation } from './useDeviceOrientation';

export type DropdownMode = 'default' | 'modal' | 'auto';

// 2.x behaviour, fixed in v3 plan phase 4: the window size is read once at
// import, so rotating, split view and foldables don't update it.
const { width, height } = Dimensions.get('window');

const detectTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = width * pixelDensity;
  const adjustedHeight = height * pixelDensity;
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  return (
    pixelDensity === 2 && (adjustedWidth >= 1824 || adjustedHeight >= 1824)
  );
};

const isTablet = detectTablet();

/**
 * Whether the list opens full screen (centered on a dimmed backdrop) instead
 * of next to the trigger: with `mode="modal"`, and on phones in landscape.
 * Tablets and `mode="auto"` never do.
 */
export const useFullScreenMode = (mode: DropdownMode) => {
  const isLandscape = useDeviceOrientation() === 'LANDSCAPE';
  const isFull =
    !isTablet && mode !== 'auto' && (mode === 'modal' || isLandscape);
  return { isFull, isLandscape };
};
