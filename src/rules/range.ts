/** Inclusive list of numbers from `from` to `to`, e.g. range(2, 10, 2) = [2, 4, 6, 8, 10]. */
export function range(from: number, to: number, step = 1): number[] {
  const values: number[] = [];
  for (let n = from; n <= to; n += step) values.push(n);
  return values;
}
