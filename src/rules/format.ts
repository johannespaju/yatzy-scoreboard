export function formatValidValues(values: readonly number[]): string {
  if (values.length === 0) return "";
  const contiguous = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
  if (contiguous && values.length > 2) return `${values[0]}–${values[values.length - 1]}`;
  return values.join(", ");
}
