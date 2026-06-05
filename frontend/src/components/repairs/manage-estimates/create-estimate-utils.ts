import type { EstimateLineItem } from "@/components/repairs/manage-estimates/create-estimate-types";
import { formatCurrency } from "@/utils/format";

const TAX_RATES: Record<string, number> = {
  Standard: 0.2,
  Reduced: 0.05,
  Zero: 0,
};

export function formatEstimateDateTime(d = new Date()): string {
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEstimateDate(d = new Date()): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMoney(amount: number): string {
  return formatCurrency(amount);
}

export function createEmptyLineItem(): EstimateLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "Service",
    category: "",
    device: "",
    productService: "",
    description: "",
    notes: "",
    internalNotes: "",
    qty: 1,
    price: 0,
    taxClass: "",
    discount: 0,
    discountReason: "",
  };
}

export function calculateLineTotal(item: EstimateLineItem): number {
  const qty = item.qty > 0 ? item.qty : 0;
  const base = qty * (item.price >= 0 ? item.price : 0);
  const afterDiscount = Math.max(0, base - (item.discount >= 0 ? item.discount : 0));
  const rate = item.taxClass ? (TAX_RATES[item.taxClass] ?? 0) : 0;
  return afterDiscount * (1 + rate);
}

export function calculateTotals(
  items: EstimateLineItem[],
  estimateDiscount: number,
): { subTotal: number; tax: number; discount: number; total: number } {
  let subTotal = 0;
  let tax = 0;

  for (const item of items) {
    const qty = item.qty > 0 ? item.qty : 0;
    const base = qty * (item.price >= 0 ? item.price : 0);
    const afterLineDiscount = Math.max(0, base - (item.discount >= 0 ? item.discount : 0));
    subTotal += afterLineDiscount;
    const rate = item.taxClass ? (TAX_RATES[item.taxClass] ?? 0) : 0;
    tax += afterLineDiscount * rate;
  }

  const discount = estimateDiscount >= 0 ? estimateDiscount : 0;
  const total = Math.max(0, subTotal - discount + tax);

  return { subTotal, tax, discount, total };
}

export const NEW_ESTIMATES_STORAGE_KEY = "pos-pending-estimates";
export const ESTIMATE_SEQ_KEY = "pos-estimate-seq";

export function allocateEstimateNumber(): string {
  if (typeof window === "undefined") return "001";
  const current = Number.parseInt(sessionStorage.getItem(ESTIMATE_SEQ_KEY) || "0", 10);
  const next = current + 1;
  sessionStorage.setItem(ESTIMATE_SEQ_KEY, String(next));
  return String(next).padStart(3, "0");
}
