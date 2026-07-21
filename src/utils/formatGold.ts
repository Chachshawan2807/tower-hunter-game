/** Format gold/item prices with thousands separators from 1,000 upward. */
export function formatGoldAmount(value: bigint | string | number): string {
  const raw =
    typeof value === "bigint" ? value.toString() : String(value).trim();
  if (!/^\d+$/.test(raw)) return raw;
  if (BigInt(raw) < 1000n) return raw;
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
