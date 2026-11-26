import { Dropdown } from '@breezertwo/react-native-element-dropdown';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Field, Scenario, dropdownStyles } from '../components/Scenario';
import { fruits, type Option } from '../data';

export default function InModal() {
  const [visible, setVisible] = useState(false);
  const [fruit, setFruit] = useState<string | null>(null);

  return (
    <Scenario description="Open the modal and the dropdown inside it. The list must sit directly below (or above) the field, with no offset by the status bar height.">
      <Pressable
        role="button"
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>Open modal</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Field label="Fruit in a modal">
              <Dropdown
                style={dropdownStyles.dropdown}
                data={fruits}
                labelField="label"
                valueField="value"
                value={fruit}
                placeholder="Select a fruit"
                accessibilityLabel="Fruit in a modal"
                onChange={(item: Option) => setFruit(item.value)}
              />
            </Field>
            <Pressable
              role="button"
              style={styles.button}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.buttonText}>Close modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Scenario>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1f5fbf',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
});
