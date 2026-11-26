// Recipe: a country picker built with Dropdown. It replaces the deprecated
// SelectCountry component: `renderLeftIcon` shows the selected country's flag
// and `renderItem` shows flag + name per row.
import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { countries, type Country } from '../data';

export default function CountryPicker() {
  const [code, setCode] = useState<string | null>('de');
  const selected = countries.find((country) => country.code === code);

  return (
    <Scenario description="SelectCountry is deprecated. This screen shows how to build the same thing with Dropdown. The selected flag appears in the field, and every row shows flag and name.">
      <Field label="Country">
        <Dropdown
          style={dropdownStyles.dropdown}
          selectedTextStyle={styles.label}
          data={countries}
          labelField="name"
          valueField="code"
          value={code}
          search
          searchPlaceholder="Search countries"
          placeholder="Select a country"
          accessibilityLabel="Country"
          onChange={(country: Country) => setCode(country.code)}
          renderLeftIcon={() =>
            selected ? (
              <Text style={styles.flag} accessible={false}>
                {selected.flag}
              </Text>
            ) : null
          }
          renderItem={(country: Country) => (
            <View style={styles.item}>
              <Text style={styles.flag} accessible={false}>
                {country.flag}
              </Text>
              <Text style={styles.label}>{country.name}</Text>
            </View>
          )}
        />
      </Field>
    </Scenario>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  flag: {
    fontSize: 20,
    marginEnd: 8,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
});
