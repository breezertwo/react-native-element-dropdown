import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

export default function FormSheet() {
  const [fruit, setFruit] = useState<string | null>(null);

  return (
    <Scenario description="This screen is a native form sheet. Open the dropdown at both sheet heights (drag the grabber). The list must line up with the field.">
      <Field label="Fruit in a form sheet">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={fruits}
          labelField="label"
          valueField="value"
          value={fruit}
          placeholder="Select a fruit"
          accessibilityLabel="Fruit in a form sheet"
          onChange={(item: Option) => setFruit(item.value)}
        />
      </Field>
    </Scenario>
  );
}
