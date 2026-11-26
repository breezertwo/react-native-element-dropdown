import type { ReactNode } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import type { DropdownPlacement } from './placement/computePlacement';
import { hiddenStyle } from './placement/useDropdownPlacement';

interface DropdownModalProps {
  placement: DropdownPlacement;
  /** Full-screen mode: the list is centered on a dimmed backdrop. */
  isFull: boolean;
  isLandscape: boolean;
  minHeight: number;
  /** Backdrop color (`backgroundColor` prop). */
  backgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Backdrop press and Android back button. */
  onRequestClose: () => void;
  onModalLayout: (event: LayoutChangeEvent) => void;
  onContainerLayout: (event: LayoutChangeEvent) => void;
  children: ReactNode;
}

/**
 * The open list: a transparent full-screen Modal with a backdrop that closes
 * on press, and the list container at the computed placement. The container
 * stays invisible and hidden from screen readers until the placement is
 * ready.
 */
export function DropdownModal({
  placement,
  isFull,
  isLandscape,
  minHeight,
  backgroundColor,
  containerStyle,
  onRequestClose,
  onModalLayout,
  onContainerLayout,
  children,
}: DropdownModalProps) {
  const { isReady, left, width, maxHeight, wrapperStyle } = placement;
  const windowWidth = Dimensions.get('window').width;

  const positionStyle: ViewStyle = isFull
    ? {
        width: isLandscape ? windowWidth / 2 : '100%',
        alignSelf: 'center',
        maxHeight,
      }
    : { left, maxHeight, minHeight };

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible
      supportedOrientations={['landscape', 'portrait']}
      onRequestClose={onRequestClose}
    >
      <View
        onStartShouldSetResponder={() => true}
        onResponderRelease={onRequestClose}
        onLayout={onModalLayout}
        style={styles.flex1}
      >
        <View
          style={StyleSheet.flatten([
            styles.flex1,
            isFull && styles.fullScreenBackdrop,
            !!backgroundColor && { backgroundColor },
          ])}
        >
          <View
            style={StyleSheet.flatten([
              styles.flex1,
              wrapperStyle,
              isFull && styles.fullScreen,
            ])}
          >
            <View
              onLayout={onContainerLayout}
              accessibilityElementsHidden={!isReady}
              importantForAccessibility={
                isReady ? 'auto' : 'no-hide-descendants'
              }
              style={StyleSheet.flatten([
                styles.container,
                positionStyle,
                { width },
                containerStyle,
                !isReady && hiddenStyle,
              ])}
            >
              {children}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  fullScreenBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  fullScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexShrink: 1,
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
