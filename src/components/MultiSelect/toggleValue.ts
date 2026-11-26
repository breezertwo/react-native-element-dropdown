/**
 * The selected values after pressing an item: removes its value if it is
 * selected, otherwise adds it unless `maxSelect` values are selected already.
 * Always returns a new array.
 */
export const toggleValue = <V>(
  values: V[],
  value: V,
  maxSelect?: number
): { values: V[]; removed: boolean } => {
  const index = values.indexOf(value);
  if (index > -1) {
    return { values: values.filter((_, i) => i !== index), removed: true };
  }
  if (maxSelect && values.length >= maxSelect) {
    return { values: [...values], removed: false };
  }
  return { values: [...values, value], removed: false };
};
