/** An item's field (`labelField`, `valueField`, …); undefined without an item. */
export const getField = <T>(
  item: T | null | undefined,
  field: keyof T
): T[keyof T] | undefined => (item == null ? undefined : item[field]);

/** An item's field as text, e.g. for labels and testIDs; undefined if unset. */
export const getFieldText = <T>(
  item: T | null | undefined,
  field: keyof T
): string | undefined => {
  const value = getField(item, field);
  return value == null ? undefined : String(value);
};

const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Whether two values are equal: primitives by identity (NaN equals NaN),
 * dates by time, arrays and plain objects by their contents. Used to match
 * values that may be objects, e.g. `{ id: 1 }`.
 */
export const isEqualValue = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }
  if (!isObject(a) || !isObject(b)) {
    return false;
  }
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && isEqualValue(a[key], b[key]))
  );
};
