export function getRange(start: number, size: number) {
  const result = [];

  for (let i = 0; i < size; i++) {
    result[i] = start + i;
  }
  return result;
}
