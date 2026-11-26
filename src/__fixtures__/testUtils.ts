import { jest } from '@jest/globals';
import { View } from 'react-native';

type MeasureInWindowCallback = (
  x: number,
  y: number,
  width: number,
  height: number
) => void;

/**
 * The React Native Jest preset mocks `measureInWindow` without ever calling
 * back, so the dropdown never gets a placement and never renders its list.
 * Report a fixed trigger rect instead.
 */
export const mockTriggerLayout = (
  rect = { x: 0, y: 100, width: 200, height: 40 }
) =>
  jest
    .spyOn(
      View.prototype as unknown as {
        measureInWindow: (callback: MeasureInWindowCallback) => void;
      },
      'measureInWindow'
    )
    .mockImplementation((callback) =>
      callback(rect.x, rect.y, rect.width, rect.height)
    );
