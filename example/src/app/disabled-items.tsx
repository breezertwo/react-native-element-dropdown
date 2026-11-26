import {
  Dropdown,
  MultiSelect,
} from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits } from '../data';

// Out of season: can't be picked, and can't be removed once selected.
const outOfSeason = new Set(['banana', 'kiwi', 'mango']);
const seasonalFruits = fruits.map((fruit) => ({
  ...fruit,
  outOfSeason: outOfSeason.has(fruit.value),
}));

export default function DisabledItems() {
  const [fruit, setFruit] = useState<string | null>(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([
    'apple',
    'banana',
  ]);

  return (
    <Scenario description="Banana, Kiwi and Mango are disabled: their rows are dimmed and can't be pressed. In the MultiSelect, Banana is selected and its chip can't remove it.">
      <Field label="Dropdown">
        <Dropdown
          style={dropdownStyles.dropdown}
          data={seasonalFruits}
          labelField="label"
          valueField="value"
          disabledField="outOfSeason"
          value={fruit}
          placeholder="Select a fruit"
          accessibilityLabel="Dropdown"
          onChange={(item) => setFruit(item.value)}
        />
      </Field>
      <Field label="MultiSelect">
        <MultiSelect
          style={dropdownStyles.dropdown}
          data={seasonalFruits}
          labelField="label"
          valueField="value"
          disabledField="outOfSeason"
          value={selectedFruits}
          placeholder="Select fruits"
          accessibilityLabel="MultiSelect"
          onChange={setSelectedFruits}
        />
      </Field>
    </Scenario>
  );
}
