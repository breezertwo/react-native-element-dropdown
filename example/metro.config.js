// Expo's default config detects the pnpm workspace and watches the library
// at the repository root. Metro resolves the library's `react-native` export
// condition, so the example runs the library's TypeScript source directly.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
