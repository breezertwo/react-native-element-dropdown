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
 * The bottom inset when `safeAreaInsets.bottom` isn't given.
 *
 * With React Native's edge-to-edge flag, every Modal reaches under the
 * navigation bar (React Native forces `navigationBarTranslucent`), so the
 * list must stay above it. React Native doesn't report the bar's height in
 * that mode (the window is as tall as the screen), so this reserves the
 * tallest bar. Without the flag, the Modal ends above the navigation bar.
 */
export const defaultBottomInset = ({
  platform,
  isEdgeToEdgeFlagOn,
}: {
  platform: typeof Platform.OS;
  isEdgeToEdgeFlagOn: boolean;
}): number =>
  platform === 'android' && isEdgeToEdgeFlagOn
    ? ANDROID_NAVIGATION_BAR_HEIGHT
    : 0;

/** `defaultBottomInset` for the running app. */
export const getDefaultBottomInset = (): number =>
  defaultBottomInset({
    platform: Platform.OS,
    isEdgeToEdgeFlagOn: readEdgeToEdge().flag,
  });

/** `windowOffsetY` for the running app. */
export const getWindowOffsetY = (): number =>
  windowOffsetY({
    platform: Platform.OS,
    isEdgeToEdge: isAndroidEdgeToEdge(),
    statusBarHeight: StatusBar.currentHeight ?? 0,
  });
