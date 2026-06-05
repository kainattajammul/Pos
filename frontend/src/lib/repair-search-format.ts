import { formatCurrency } from "@/utils/format";

export function formatRepairSearchPrice(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(n)) return formatCurrency(0);
  return formatCurrency(n);
}
