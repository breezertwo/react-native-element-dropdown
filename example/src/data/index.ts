export type Option = { label: string; value: string };

export const fruits: Option[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Grape', value: 'grape' },
  { label: 'Kiwi', value: 'kiwi' },
  { label: 'Lemon', value: 'lemon' },
  { label: 'Mango', value: 'mango' },
  { label: 'Orange', value: 'orange' },
  { label: 'Peach', value: 'peach' },
  { label: 'Pear', value: 'pear' },
  { label: 'Pineapple', value: 'pineapple' },
  { label: 'Plum', value: 'plum' },
  { label: 'Strawberry', value: 'strawberry' },
];

export const shortList: Option[] = fruits.slice(0, 4);

export const numbers: Option[] = Array.from({ length: 1000 }, (_, index) => ({
  label: `Item ${index + 1}`,
  value: String(index + 1),
}));

export type Country = { code: string; name: string; flag: string };

export const countries: Country[] = [
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
];

/** Recursively freezes data, like Immer or Redux Toolkit state in development. */
export const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};
