import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useAccessibilityFocus } from '../internal/useAccessibilityFocus';

type Target = Parameters<typeof AccessibilityInfo.sendAccessibilityEvent>[0];

const list = { name: 'list' } as unknown as Target;
const trigger = { name: 'trigger' } as unknown as Target;
const sendEvent = jest.mocked(AccessibilityInfo.sendAccessibilityEvent);

const renderFocus = (visible: boolean, isReady: boolean) =>
  renderHook(
    (props: { visible: boolean; isReady: boolean }) =>
      useAccessibilityFocus({
        ...props,
        getListTarget: () => list,
        triggerRef: { current: trigger },
      }),
    { initialProps: { visible, isReady } }
  );

beforeEach(() => {
  sendEvent.mockClear();
});

describe('useAccessibilityFocus', () => {
  it('focuses the list target once the open list is ready, once', async () => {
    const { rerender } = await renderFocus(true, false);
    expect(sendEvent).not.toHaveBeenCalled();

    await rerender({ visible: true, isReady: true });
    await rerender({ visible: true, isReady: true });

    expect(sendEvent.mock.calls).toEqual([[list, 'focus']]);
  });

  it('focuses the field when the list closes after it was shown', async () => {
    const { rerender } = await renderFocus(true, true);

    await rerender({ visible: false, isReady: false });

    expect(sendEvent.mock.calls).toEqual([
      [list, 'focus'],
      [trigger, 'focus'],
    ]);
  });

  it('does nothing when the list closes before it was shown', async () => {
    const { rerender } = await renderFocus(true, false);

    await rerender({ visible: false, isReady: false });

    expect(sendEvent).not.toHaveBeenCalled();
  });
});
