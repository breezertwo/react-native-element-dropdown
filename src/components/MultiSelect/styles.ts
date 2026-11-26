import { I18nManager, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainWrap: {
    justifyContent: 'center',
  },
  dropdownInside: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 35,
  },
  wrapItem: {
    marginBottom: 0.5,
  },
});
