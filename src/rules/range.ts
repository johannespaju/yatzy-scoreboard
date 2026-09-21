export function range(from: number, to: number, step = 1): number[] {
  const values: number[] = [];
  for (let n = from; n <= to; n += step) values.push(n);
  return values;
}
