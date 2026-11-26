import {
  Dropdown,
  MultiSelect,
} from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

export default function LargeText() {
  const [fruit, setFruit] = useState<string | null>('pineapple');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([
    'strawberry',
    'blueberry',
  ]);

  return (
    <Scenario description="Set the system text size to the largest setting (iOS: Settings → Accessibility → Display & Text Size → Larger Text; Android: Settings → Display → Font size). No text may be cut off in the fields, the list, the search box or the chips.">
      <Field label="Dropdown">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={fruit}
          search
          searchPlaceholder="Search fruits"
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
          search
          searchPlaceholder="Search fruits"
          placeholder="Select fruits"
          accessibilityLabel="MultiSelect"
          onChange={setSelectedFruits}
        />
      </Field>
    </Scenario>
  );
}
