import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { numbers, type Option } from '../data';

export default function LargeList() {
  const [value, setValue] = useState<string | null>('750');

  return (
    <Scenario description="Item 750 is selected. Opening the list must scroll straight to it without jumping back, and scrolling must stay smooth.">
      <Field label="1,000 items">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={numbers}
          labelField="label"
          valueField="value"
          value={value}
          search
          searchPlaceholder="Search items"
          placeholder="Select an item"
          accessibilityLabel="1,000 items"
          onChange={(item: Option) => setValue(item.value)}
        />
      </Field>
    </Scenario>
  );
}
