import { useEffect, useEffectEvent } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Wait after the last keystroke, so typing isn't interrupted by every count. */
export const SEARCH_ANNOUNCE_DELAY_MS = 700;

/**
 * Tells screen reader users how many items match while they search; they
 * can't see the list shrink.
 */
export const useAnnounceSearchResults = ({
  searchText,
  resultCount,
  message,
}: {
  searchText: string;
  resultCount: number;
  message: (count: number) => string;
}) => {
  // Reads the result count when the announcement is due, not when typed.
  const announce = useEffectEvent(() => {
    AccessibilityInfo.announceForAccessibility(message(resultCount));
  });

  useEffect(() => {
    if (searchText.length === 0) {
      return undefined;
    }
    const timer = setTimeout(announce, SEARCH_ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);
};
