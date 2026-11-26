import { Platform, StatusBar, TurboModuleRegistry } from 'react-native';

type WindowOffsetInput = {
  platform: typeof Platform.OS;
  isEdgeToEdge: boolean;
  statusBarHeight: number;
};

/**
 * How far `measureInWindow` coordinates are below the top of the screen.
 *
 * The list renders in a `statusBarTranslucent` Modal, which starts at the top
 * of the screen. On Android without edge-to-edge, React Native measures from
 * below the status bar, so its height has to be added. With edge-to-edge, and
 * on iOS, the measurement already starts at the top of the screen.
 */
export const windowOffsetY = ({
  platform,
  isEdgeToEdge,
  statusBarHeight,
}: WindowOffsetInput): number =>
  platform === 'android' && !isEdgeToEdge ? statusBarHeight : 0;

type EdgeToEdgeState = { flag: boolean; library: boolean };
let edgeToEdge: EdgeToEdgeState | undefined;

/**
 * React Native's own edge-to-edge flag (`edgeToEdgeEnabled`, on in Expo
 * SDK 54+ builds) and the react-native-edge-to-edge library. Read once;
 * neither can change while the app runs.
 */
const readEdgeToEdge = (): EdgeToEdgeState => {
  if (Platform.OS !== 'android') {
    return { flag: false, library: false };
  }
  if (edgeToEdge === undefined) {
    try {
      const deviceInfo = TurboModuleRegistry.get('DeviceInfo') as unknown as {
        getConstants?: () => { isEdgeToEdge?: boolean };
      } | null;
      edgeToEdge = {
        flag: deviceInfo?.getConstants?.().isEdgeToEdge === true,
        library: TurboModuleRegistry.get('RNEdgeToEdge') != null,
      };
    } catch {
      edgeToEdge = { flag: false, library: false };
    }
  }
  return edgeToEdge;
};

/** Whether the Android app draws edge-to-edge, through the flag or the library. */
export const isAndroidEdgeToEdge = (): boolean => {
  const { flag, library } = readEdgeToEdge();
  return flag || library;
};

/**
 * Height of the Android navigation bar on phones with 3-button navigation,
 * the tallest kind; gesture navigation is lower.
 */
export const ANDROID_NAVIGATION_BAR_HEIGHT = 48;

/**
 * The bottom inset when `safeAreaInsets.bottom` isn't given: on Android,
 * the navigation bar when the list's Modal reaches under it.
 *
 * With React Native's edge-to-edge flag, every Modal ends up covering the
 * whole screen, navigation bar included (React Native forces
 * `navigationBarTranslucent`), and React Native doesn't report the bar's
 * height then, so this reserves the tallest bar. Whether the Modal covers
 * it is read from its measured height, not from the flag: the Modal is
 * first laid out without the system bars and only then grows to the full
 * screen, and reserving the bar during that first layout (where the bar is
 * already excluded) put the list too high for a frame. Without the flag the
 * Modal always ends above the navigation bar.
 */
export const defaultBottomInset = ({
  platform,
  modalHeight,
  screenHeight,
}: {
  platform: typeof Platform.OS;
  modalHeight: number | undefined;
  screenHeight: number;
}): number =>
  platform === 'android' &&
  modalHeight !== undefined &&
  modalHeight >= screenHeight - 1
    ? ANDROID_NAVIGATION_BAR_HEIGHT
    : 0;

/** `windowOffsetY` for the running app. */
export const getWindowOffsetY = (): number =>
  windowOffsetY({
    platform: Platform.OS,
    isEdgeToEdge: isAndroidEdgeToEdge(),
    statusBarHeight: StatusBar.currentHeight ?? 0,
  });
