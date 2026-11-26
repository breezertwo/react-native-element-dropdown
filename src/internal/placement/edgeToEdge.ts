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

let edgeToEdge: boolean | undefined;

/**
 * Whether the Android app draws edge-to-edge: through React Native's own
 * flag (`edgeToEdgeEnabled`) or the react-native-edge-to-edge library.
 * Read once; it can't change while the app runs.
 */
export const isAndroidEdgeToEdge = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (edgeToEdge === undefined) {
    try {
      const deviceInfo = TurboModuleRegistry.get('DeviceInfo') as unknown as {
        getConstants?: () => { isEdgeToEdge?: boolean };
      } | null;
      edgeToEdge =
        TurboModuleRegistry.get('RNEdgeToEdge') != null ||
        deviceInfo?.getConstants?.().isEdgeToEdge === true;
    } catch {
      edgeToEdge = false;
    }
  }
  return edgeToEdge;
};

/** `windowOffsetY` for the running app. */
export const getWindowOffsetY = (): number =>
  windowOffsetY({
    platform: Platform.OS,
    isEdgeToEdge: isAndroidEdgeToEdge(),
    statusBarHeight: StatusBar.currentHeight ?? 0,
  });
