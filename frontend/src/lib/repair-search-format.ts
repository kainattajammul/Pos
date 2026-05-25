const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "£";

export function formatRepairSearchPrice(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(n)) return `${CURRENCY_SYMBOL}0.00`;
  return `${CURRENCY_SYMBOL}${n.toFixed(2)}`;
}
