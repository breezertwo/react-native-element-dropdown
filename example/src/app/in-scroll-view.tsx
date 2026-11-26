import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

const fields = Array.from({ length: 8 }, (_, index) => `Field ${index + 1}`);

function FormDropdown({ label }: { label: string }) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Field label={label}>
      <Dropdown
        style={dropdownStyles.dropdown}
        data={fruits}
        labelField="label"
        valueField="value"
        value={value}
        placeholder="Select a fruit"
        accessibilityLabel={label}
        onChange={(item: Option) => setValue(item.value)}
      />
    </Field>
  );
}

export default function InScrollView() {
  return (
    <Scenario description="Scroll to different positions, then open a field. The list must line up with the field wherever it is on screen.">
      {fields.map((label, index) => (
        <View key={label} style={styles.block}>
          <FormDropdown label={label} />
          {index % 2 === 0 && (
            <Text style={styles.filler}>
              Some text between the fields so the form needs scrolling.
            </Text>
          )}
        </View>
      ))}
    </Scenario>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 16,
  },
  filler: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    paddingVertical: 32,
  },
});
