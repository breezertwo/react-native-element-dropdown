import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, shortList, type Option } from '../data';

function FruitDropdown({
  label,
  position,
  data = fruits,
}: {
  label: string;
  position: 'auto' | 'top' | 'bottom';
  data?: Option[];
}) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Field label={label}>
      <Dropdown
        style={dropdownStyles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        value={value}
        placeholder="Select a fruit"
        accessibilityLabel={label}
        dropdownPosition={position}
        onChange={(item: Option) => setValue(item.value)}
      />
    </Field>
  );
}

export default function Placement() {
  return (
    <Scenario
      scroll={false}
      description="The auto dropdowns should open where there is more room: down at the top of the screen, up at the bottom. Forced positions must stay put. Nothing may overlap the status bar or navigation bar."
    >
      <View style={styles.edges}>
        <FruitDropdown label="Auto, near the top" position="auto" />
        <View style={styles.row}>
          <View style={styles.cell}>
            <FruitDropdown label="Always top" position="top" />
          </View>
          <View style={styles.cell}>
            <FruitDropdown label="Always bottom" position="bottom" />
          </View>
        </View>
        <FruitDropdown
          label="Auto, short list near the bottom"
          position="auto"
          data={shortList}
        />
        <FruitDropdown label="Auto, near the bottom" position="auto" />
      </View>
    </Scenario>
  );
}

const styles = StyleSheet.create({
  edges: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
  },
});
