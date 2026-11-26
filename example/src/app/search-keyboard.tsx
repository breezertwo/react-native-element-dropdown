import {
  Dropdown,
  MultiSelect,
} from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

export default function SearchKeyboard() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <Scenario
      scroll={false}
      description="Open a field and type in the search box. The list must stay above the keyboard and move when the keyboard opens, changes height or closes."
    >
      <View style={styles.bottom}>
        <Field label="Searchable dropdown">
          <Dropdown
            style={dropdownStyles.dropdown}
            data={fruits}
            labelField="label"
            valueField="value"
            value={fruit}
            search
            searchPlaceholder="Search fruits"
            placeholder="Select a fruit"
            accessibilityLabel="Searchable dropdown"
            onChange={(item: Option) => setFruit(item.value)}
          />
        </Field>
        <Field label="Searchable multi-select">
          <MultiSelect
            style={dropdownStyles.dropdown}
            data={fruits}
            labelField="label"
            valueField="value"
            value={selectedFruits}
            search
            searchPlaceholder="Search fruits"
            placeholder="Select fruits"
            accessibilityLabel="Searchable multi-select"
            onChange={setSelectedFruits}
          />
        </Field>
      </View>
    </Scenario>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 16,
  },
});
