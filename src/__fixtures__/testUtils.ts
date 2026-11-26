import { jest } from '@jest/globals';
import { Text, View } from 'react-native';
import { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';

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

type PropsMatcher = Record<string, unknown>;

const findPressable = (tree: ReactTestRenderer, matcher: PropsMatcher) => {
  const [pressable] = tree.root.findAll(
    (node: ReactTestInstance) =>
      typeof node.props.onPress === 'function' &&
      Object.entries(matcher).every(([key, value]) => node.props[key] === value)
  );
  if (!pressable) {
    throw new Error(`No pressable element with ${JSON.stringify(matcher)}`);
  }
  return pressable;
};

/** Presses the first element with an `onPress` handler whose props match. */
export const press = (tree: ReactTestRenderer, matcher: PropsMatcher) => {
  act(() => {
    findPressable(tree, matcher).props.onPress();
  });
};

/** All strings rendered by `Text` elements, in render order. */
export const renderedTexts = (tree: ReactTestRenderer): unknown[] =>
  tree.root
    .findAllByType(Text)
    .map((node: ReactTestInstance) => node.props.children);
