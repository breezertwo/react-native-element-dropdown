// Compiled in CI against the packed library and the oldest and newest
// supported React Native / React types. It must keep compiling.
import { useRef, useState, type ComponentProps } from 'react';
import {
  Dropdown,
  MultiSelect,
  type IDropdownRef,
  type IMultiSelectRef,
} from '@breezertwo/react-native-element-dropdown';

// Fail if a type resolves to `any`, e.g. because a React Native type that
// the library's declarations import doesn't exist in this version.
type IsAny<T> = 0 extends 1 & T ? true : false;
type AssertNotAny<T extends false> = T;
export type Checks = [
  AssertNotAny<IsAny<IDropdownRef>>,
  AssertNotAny<IsAny<IMultiSelectRef>>,
  AssertNotAny<IsAny<ComponentProps<typeof Dropdown>['style']>>,
  AssertNotAny<IsAny<ComponentProps<typeof Dropdown>['flatListProps']>>,
  AssertNotAny<IsAny<ComponentProps<typeof MultiSelect>['selectedStyle']>>,
];

type Fruit = { label: string; value: string };

const fruits: Fruit[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

export function Consumer() {
  const dropdownRef = useRef<IDropdownRef>(null);
  const multiSelectRef = useRef<IMultiSelectRef>(null);
  const [fruit, setFruit] = useState<string | null>(null);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <>
      <Dropdown
        ref={dropdownRef}
        data={fruits}
        labelField="label"
        valueField="value"
        value={fruit}
        search
        accessibilityLabel="Fruit"
        onChange={(item: Fruit) => setFruit(item.value)}
        onFocus={() => multiSelectRef.current?.close()}
      />
      <MultiSelect
        ref={multiSelectRef}
        data={fruits}
        labelField="label"
        valueField="value"
        value={selectedFruits}
        accessibilityLabel="Fruits"
        onChange={setSelectedFruits}
        onFocus={() => dropdownRef.current?.close()}
      />
    </>
  );
}
