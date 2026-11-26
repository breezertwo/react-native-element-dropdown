import { Link, type Href } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

type Scenario = { href: Href; title: string; summary: string };

const scenarios: Scenario[] = [
  {
    href: '/placement',
    title: 'Placement',
    summary: 'Top, bottom and auto placement near the screen edges.',
  },
  {
    href: '/search-keyboard',
    title: 'Search and keyboard',
    summary: 'Searchable list low on the screen while the keyboard is open.',
  },
  {
    href: '/in-modal',
    title: 'Inside a Modal',
    summary: 'Dropdown rendered inside a React Native Modal.',
  },
  {
    href: '/in-scroll-view',
    title: 'Inside a ScrollView',
    summary: 'Dropdowns in a long scrolling form.',
  },
  {
    href: '/form-sheet',
    title: 'Form sheet',
    summary: 'Dropdown inside a native form sheet (react-navigation).',
  },
  {
    href: '/direction-orientation',
    title: 'RTL and landscape',
    summary: 'Right-to-left layout and device rotation.',
  },
  {
    href: '/multi-select',
    title: 'MultiSelect',
    summary: 'Chips below the field and inside the field.',
  },
  {
    href: '/large-list',
    title: 'Large list',
    summary: '1,000 items with auto-scroll to the selected item.',
  },
  {
    href: '/frozen-data',
    title: 'Frozen data',
    summary: 'Deeply frozen items, like Immer or Redux Toolkit state.',
  },
  {
    href: '/large-text',
    title: 'Large text',
    summary: 'Layout at the largest system font size.',
  },
  {
    href: '/country-picker',
    title: 'Country picker recipe',
    summary: 'Replacement for the SelectCountry component of 2.x.',
  },
];

export default function Home() {
  return (
    <FlatList
      data={scenarios}
      keyExtractor={(item) => item.title}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Link href={item.href} asChild>
          <Pressable
            role="link"
            accessibilityHint={item.summary}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  summary: {
    fontSize: 14,
    color: '#444',
  },
});
