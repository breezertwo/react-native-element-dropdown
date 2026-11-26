/**
 * How many chips fit in one row of `available` width, in order, leaving room
 * for the "+N" chip when not all of them fit.
 *
 * @param widths Width of each chip, margins included.
 * @param available Width of the row.
 * @param moreWidth Width of the "+N" chip, margins included.
 */
export const fitChips = (
  widths: readonly number[],
  available: number,
  moreWidth: number
): number => {
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= available) {
    return widths.length;
  }

  let used = 0;
  for (let index = 0; index < widths.length; index++) {
    const width = widths[index] ?? 0;
    if (used + width + moreWidth > available) {
      return index;
    }
    used += width;
  }

  return widths.length;
};
