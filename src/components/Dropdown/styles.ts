import { I18nManager, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainWrap: {
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    padding: 17,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  icon: {
    width: 20,
    height: 20,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    paddingHorizontal: 8,
    marginBottom: 8,
    margin: 6,
    height: 45,
  },
});
