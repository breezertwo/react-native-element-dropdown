import { jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { REVEAL_TIMEOUT_MS } from '../internal/useAutoScroll';

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

type Size = { width: number; height: number };

const layoutEvent = ({ width, height }: Size) => ({
  nativeEvent: { layout: { x: 0, y: 0, width, height } },
});

/**
 * The open list stays hidden until the modal and the list container report
 * their layout, which never happens in tests. Fire both layout events, like
 * the native side does when the list opens.
 */
export const layoutOpenList = async ({
  screenSize = { width: 400, height: 800 },
  contentHeight = 200,
  layOutContent = true,
}: {
  screenSize?: Size;
  contentHeight?: number;
  /**
   * Also report the list's content size, which Dropdown waits for to scroll
   * to the selected item, and wait until the list is shown: two frames
   * after the scroll, or, since rows are never measured in tests and
   * scrolling to one fails, after Dropdown's safety timeout. Turn it off to
   * report the content size yourself.
   */
  layOutContent?: boolean;
} = {}) => {
  // The whole tree: the list's Modal is a sibling of the field.
  const root = screen.container;
  // The modal's full-screen backdrop is the only view that reports its
  // layout and handles touches without being an accessibility element (the
  // field is one); the list container is the only one that reports its
  // layout and toggles its accessibility visibility.
  const [modalRoot] = root.queryAll(
    (node) =>
      typeof node.props.onLayout === 'function' &&
      typeof node.props.onStartShouldSetResponder === 'function' &&
      node.props.accessible !== true
  );
  const [container] = root.queryAll(
    (node) =>
      typeof node.props.onLayout === 'function' &&
      node.props.importantForAccessibility !== undefined
  );
  if (!modalRoot || !container) {
    throw new Error('The dropdown list is not open');
  }
  await fireEvent(modalRoot, 'layout', layoutEvent(screenSize));
  await fireEvent(
    container,
    'layout',
    layoutEvent({ width: 200, height: contentHeight })
  );
  if (layOutContent) {
    const [list] = root.queryAll((node) =>
      String(node.props.testID ?? '').endsWith(' flatlist')
    );
    if (list) {
      await fireEvent(list, 'contentSizeChange', 200, contentHeight);
    }
    await act(async () => {
      jest.advanceTimersByTime(REVEAL_TIMEOUT_MS);
    });
  }
};

const openListContainer = () => {
  const [container] =
    screen.container.queryAll(
      (node) =>
        typeof node.props.onLayout === 'function' &&
        node.props.importantForAccessibility !== undefined
    ) ?? [];
  if (!container) {
    throw new Error('The dropdown list is not open');
  }
  return container;
};

/** The flattened style of the open list container (position and size). */
export const openListStyle = (): Record<string, unknown> =>
  openListContainer().props.style;

/**
 * The flattened style of the view wrapping the list container, which places
 * it above or below the trigger through padding.
 */
export const openListWrapperStyle = (): Record<string, unknown> => {
  const wrapper = openListContainer().parent;
  if (!wrapper) {
    throw new Error('The dropdown list has no wrapper');
  }
  return wrapper.props.style;
};
