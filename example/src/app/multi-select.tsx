import { MultiSelect } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits } from '../data';

export default function MultiSelectScreen() {
  const [below, setBelow] = useState<string[]>(['apple', 'banana']);
  const [inside, setInside] = useState<string[]>(['cherry']);
  const [limited, setLimited] = useState<string[]>([]);

  return (
    <Scenario description="Select and remove items in the list and with the chips. Chips must match the selection, and the limited field must stop at three items.">
      <Field label="Chips below the field">
        <MultiSelect
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={below}
          placeholder="Select fruits"
          accessibilityLabel="Chips below the field"
          onChange={setBelow}
        />
      </Field>
      <Field label="Chips inside the field">
        <MultiSelect
          style={dropdownStyles.dropdown}
          inside
          data={fruits}
          labelField="label"
          valueField="value"
          value={inside}
          placeholder="Select fruits"
          accessibilityLabel="Chips inside the field"
          onChange={setInside}
        />
      </Field>
      <Field label="At most three">
        <MultiSelect
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={limited}
          maxSelect={3}
          placeholder="Select up to three fruits"
          accessibilityLabel="At most three"
          onChange={setLimited}
        />
      </Field>
    </Scenario>
  );
}
