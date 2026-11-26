import {
  Dropdown,
  MultiSelect,
} from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { deepFreeze, fruits, type Option } from '../data';

const frozenFruits = deepFreeze(fruits.map((fruit) => ({ ...fruit })));

export default function FrozenData() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <Scenario description="The items are deeply frozen, like Immer or Redux Toolkit state in development. Opening, searching and selecting must work without errors.">
      <Field label="Dropdown with frozen items">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={frozenFruits}
          labelField="label"
          valueField="value"
          value={fruit}
          search
          placeholder="Select a fruit"
          accessibilityLabel="Dropdown with frozen items"
          onChange={(item: Option) => setFruit(item.value)}
        />
      </Field>
      <Field label="MultiSelect with frozen items">
        <MultiSelect
          style={dropdownStyles.dropdown}
          data={frozenFruits}
          labelField="label"
          valueField="value"
          value={selectedFruits}
          search
          placeholder="Select fruits"
          accessibilityLabel="MultiSelect with frozen items"
          onChange={setSelectedFruits}
        />
      </Field>
    </Scenario>
  );
}
