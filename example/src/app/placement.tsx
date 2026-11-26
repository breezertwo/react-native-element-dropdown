import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, shortList, type Option } from '../data';

function FruitDropdown({
  label,
  position,
  data = fruits,
  maxHeight,
}: {
  label: string;
  position: 'auto' | 'top' | 'bottom';
  data?: Option[];
  maxHeight?: number;
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
        maxHeight={maxHeight}
        onChange={(item: Option) => setValue(item.value)}
      />
    </Field>
  );
}

export default function Placement() {
  return (
    <Scenario
      scroll={false}
      description="The auto dropdowns should open where there is more room: down at the top of the screen, up at the bottom. Forced positions must stay put; their lists may grow up to the status bar and down to the navigation bar, but never under them."
    >
      <View style={styles.edges}>
        <FruitDropdown label="Auto, near the top" position="auto" />
        <View style={styles.row}>
          <View style={styles.cell}>
            <FruitDropdown label="Always top" position="top" maxHeight={1000} />
          </View>
          <View style={styles.cell}>
            <FruitDropdown
              label="Always bottom"
              position="bottom"
              maxHeight={1000}
            />
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
