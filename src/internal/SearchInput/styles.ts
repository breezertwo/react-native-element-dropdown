import { I18nManager, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    fontSize: 16,
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  // Like TouchableOpacity's default feedback.
  pressed: {
    opacity: 0.2,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
