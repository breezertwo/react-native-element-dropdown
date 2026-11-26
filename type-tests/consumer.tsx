// Compiled in CI against the packed library and the oldest and newest
// supported React Native / React types. It must keep compiling.
import { useRef, useState, type ComponentProps } from 'react';
import {
  Dropdown,
  MultiSelect,
  type DropdownProps,
  type IDropdownRef,
  type IMultiSelectRef,
  type MultiSelectProps,
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
  AssertNotAny<IsAny<DropdownProps<Fruit, 'value'>['onChange']>>,
  AssertNotAny<IsAny<MultiSelectProps<Fruit, 'value'>['onChange']>>,
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

type Size = { label: string; id: number };

const sizes: Size[] = [
  { label: 'Small', id: 1 },
  { label: 'Large', id: 2 },
];

// Items, fields and values are typed from `data` and `valueField`.
export function TypedConsumer() {
  const [size, setSize] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);

  return (
    <>
      <Dropdown
        data={sizes}
        labelField="label"
        valueField="id"
        value={size}
        onChange={(item) => setSize(item.id)}
      />
      <Dropdown
        data={sizes}
        // @ts-expect-error: labelField must be a field of the items
        labelField="name"
        valueField="id"
        onChange={() => {}}
      />
      <Dropdown
        data={sizes}
        labelField="label"
        valueField="id"
        // @ts-expect-error: the value has the type of the value field
        value="1"
        onChange={() => {}}
      />
      <MultiSelect
        data={sizes}
        labelField="label"
        valueField="id"
        value={selectedSizes}
        onChange={setSelectedSizes}
      />
      <MultiSelect
        data={sizes}
        labelField="label"
        valueField="id"
        value={selectedSizes}
        // @ts-expect-error: the values are numbers (`id`), not strings
        onChange={(values: string[]) => values}
      />
      <MultiSelect
        // Read-only data, e.g. frozen state or `as const`
        data={Object.freeze([...sizes])}
        labelField="label"
        valueField="id"
        onChange={setSelectedSizes}
      />
    </>
  );
}
