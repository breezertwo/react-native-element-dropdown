// Expo's default config detects the pnpm workspace and watches the library
// at the repository root. Metro reads the library's `react-native` field, so
// the example runs the library's TypeScript source directly.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
