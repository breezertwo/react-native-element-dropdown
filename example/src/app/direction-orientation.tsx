import {
  Dropdown,
  MultiSelect,
} from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import {
  DevSettings,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

function toggleRTL() {
  const nextIsRTL = !I18nManager.isRTL;
  I18nManager.allowRTL(nextIsRTL);
  I18nManager.forceRTL(nextIsRTL);
  // The layout direction only changes after a reload.
  DevSettings.reload();
}

export default function DirectionOrientation() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <Scenario description="Switch the layout direction (the app reloads), then rotate the device. The list must line up with the field in both directions and orientations.">
      <Pressable role="button" style={styles.button} onPress={toggleRTL}>
        <Text style={styles.buttonText}>
          {I18nManager.isRTL
            ? 'Switch to left-to-right'
            : 'Switch to right-to-left'}
        </Text>
      </Pressable>

      <Field label="Dropdown">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={fruit}
          search
          placeholder="Select a fruit"
          accessibilityLabel="Dropdown"
          onChange={(item: Option) => setFruit(item.value)}
        />
      </Field>
      <Field label="MultiSelect">
        <MultiSelect
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={selectedFruits}
          placeholder="Select fruits"
          accessibilityLabel="MultiSelect"
          onChange={setSelectedFruits}
        />
      </Field>
    </Scenario>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1f5fbf',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
