import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      {/* An opaque header, so screens start below it (on iOS 26 content
          otherwise scrolls under the glass header). */}
      <Stack screenOptions={{ headerTransparent: false }}>
        <Stack.Screen name="index" options={{ title: 'Element Dropdown' }} />
        <Stack.Screen name="placement" options={{ title: 'Placement' }} />
        <Stack.Screen
          name="search-keyboard"
          options={{ title: 'Search and keyboard' }}
        />
        <Stack.Screen name="in-modal" options={{ title: 'Inside a Modal' }} />
        <Stack.Screen
          name="in-scroll-view"
          options={{ title: 'Inside a ScrollView' }}
        />
        <Stack.Screen
          name="form-sheet"
          options={{
            title: 'Form sheet',
            presentation: 'formSheet',
            sheetAllowedDetents: [0.6, 1],
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="direction-orientation"
          options={{ title: 'RTL and landscape' }}
        />
        <Stack.Screen name="multi-select" options={{ title: 'MultiSelect' }} />
        <Stack.Screen name="large-list" options={{ title: 'Large list' }} />
        <Stack.Screen name="frozen-data" options={{ title: 'Frozen data' }} />
        <Stack.Screen name="large-text" options={{ title: 'Large text' }} />
        <Stack.Screen
          name="country-picker"
          options={{ title: 'Country picker recipe' }}
        />
      </Stack>
    </>
  );
}
