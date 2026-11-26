import { I18nManager, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainWrap: {
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  dropdown: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  rowSelectedItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
  },
  selectedItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'gray',
    paddingHorizontal: 8,
    marginVertical: 6,
    marginRight: 8,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  selectedTextItem: {
    marginLeft: 5,
    color: 'gray',
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  selectedTextLeftItem: {
    fontSize: 12,
    color: 'gray',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
