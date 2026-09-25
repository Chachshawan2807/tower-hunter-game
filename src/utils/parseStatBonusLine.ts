/** Splits engine stat preview lines like `ATK +12` into label and bonus suffix. */
export function parseStatBonusLine(line: string): {
  label: string;
  value: string | null;
} {
  const match = line.match(/^(.+?)\s(\+.+)$/);
  if (!match) {
    return { label: line, value: null };
  }
  return { label: match[1], value: match[2] };
}
