export function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

export function serializeJson(data: unknown): string {
  return JSON.stringify(data, jsonReplacer);
}
