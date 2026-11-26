import type { ReactNode, Ref } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { FlatListProps } from 'react-native';

type ListOwnProps<T> = Pick<
  FlatListProps<T>,
  | 'data'
  | 'renderItem'
  | 'keyExtractor'
  | 'nativeID'
  | 'showsVerticalScrollIndicator'
  | 'onContentSizeChange'
  | 'onScrollToIndexFailed'
> & { ref?: Ref<FlatList<T>> };

interface DropdownListProps<T> {
  isTopPosition: boolean;
  /** Invert the list when it opens above the trigger (`inverted` prop). */
  inverted: boolean;
  /** The search input, rendered on the side of the list next to the trigger. */
  search: ReactNode;
  /**
   * Claim touches inside the list area, so they don't reach the backdrop and
   * close the list. 2.x does this for MultiSelect only.
   */
  captureTouches?: boolean;
  /** Defaults that the consumer's flatListProps may override. */
  defaultListProps: Partial<FlatListProps<T>>;
  flatListProps?: Partial<FlatListProps<T>>;
  /** What the list needs to work; flatListProps can't override these. */
  listProps: ListOwnProps<T>;
}

/** The FlatList of options plus the search input. */
export function DropdownList<T>({
  isTopPosition,
  inverted,
  search,
  captureTouches = false,
  defaultListProps,
  flatListProps,
  listProps,
}: DropdownListProps<T>) {
  const isInverted = inverted && isTopPosition;

  const list = (
    <FlatList
      {...defaultListProps}
      {...flatListProps}
      keyboardShouldPersistTaps="handled"
      {...listProps}
      inverted={isInverted}
    />
  );

  const content = (
    <View style={styles.flexShrink}>
      {isInverted && list}
      {search}
      {!isInverted && list}
    </View>
  );

  return captureTouches ? (
    <TouchableWithoutFeedback>{content}</TouchableWithoutFeedback>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  flexShrink: {
    flexShrink: 1,
  },
});
