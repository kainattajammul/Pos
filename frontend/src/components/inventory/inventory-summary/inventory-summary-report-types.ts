import type { InventoryProduct } from "@/types/inventory-product";
import { DEMO_INVENTORY_PRODUCTS } from "@/lib/inventory-products-demo-data";
import { formatCurrency } from "@/utils/format";

export type InventorySummaryCriteria =
  | ""
  | "all-items"
  | "category"
  | "manufacturer"
  | "device"
  | "sku";

export interface InventorySummaryFilters {
  store: string;
  date: string;
  criteria: InventorySummaryCriteria;
}

export interface InventorySummaryRow {
  id: string;
  sku: string;
  category: string;
  manufacturer: string;
  device: string;
  productName: string;
  onHand: number;
  averageCostPrice: number;
  totalValue: number;
  onPo: number;
}

export interface InventorySummaryMetrics {
  totalInventoryValue: number;
  totalItems: number;
}

export interface InventorySummaryTotals {
  onHand: number;
  averageCostPrice: number;
  totalValue: number;
  onPo: number;
}

export const DEFAULT_INVENTORY_SUMMARY_FILTERS: InventorySummaryFilters = {
  store: "",
  date: "",
  criteria: "",
};

export const INVENTORY_SUMMARY_CRITERIA_OPTIONS: {
  value: InventorySummaryCriteria;
  label: string;
}[] = [
  { value: "", label: "Please Select" },
  { value: "all-items", label: "All Items" },
  { value: "category", label: "Category" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "device", label: "Device" },
  { value: "sku", label: "SKU" },
];

export function formatSummaryMoney(amount: number): string {
  return formatCurrency(amount);
}

export function mapProductToSummaryRow(product: InventoryProduct): InventorySummaryRow {
  const totalValue = product.stock * product.costPrice;
  return {
    id: product.id,
    sku: product.sku,
    category: product.category,
    manufacturer: product.brand,
    device: product.model,
    productName: product.name,
    onHand: product.stock,
    averageCostPrice: product.costPrice,
    totalValue,
    onPo: product.inPurchaseOrder ?? 0,
  };
}

export function getInventorySummarySourceProducts(): InventoryProduct[] {
  return DEMO_INVENTORY_PRODUCTS;
}

export function buildInventorySummaryReport(
  products: InventoryProduct[],
  filters: InventorySummaryFilters,
  defaultStoreName: string,
): InventorySummaryRow[] {
  const storeFilter = filters.store.trim() || defaultStoreName;
  if (storeFilter && storeFilter !== defaultStoreName) {
    return [];
  }

  let rows = products.map(mapProductToSummaryRow);

  switch (filters.criteria) {
    case "all-items":
      break;
    case "category":
      rows = rows.filter((row) => Boolean(row.category));
      break;
    case "manufacturer":
      rows = rows.filter((row) => Boolean(row.manufacturer));
      break;
    case "device":
      rows = rows.filter((row) => Boolean(row.device));
      break;
    case "sku":
      rows = rows.filter((row) => Boolean(row.sku));
      break;
    default:
      return [];
  }

  return rows;
}

export function computeSummaryMetrics(rows: InventorySummaryRow[]): InventorySummaryMetrics {
  const totalInventoryValue = rows.reduce((sum, row) => sum + row.totalValue, 0);
  const totalItems = rows.reduce((sum, row) => sum + row.onHand, 0);
  return { totalInventoryValue, totalItems };
}

export function computeSummaryTotals(rows: InventorySummaryRow[]): InventorySummaryTotals {
  const onHand = rows.reduce((sum, row) => sum + row.onHand, 0);
  const totalValue = rows.reduce((sum, row) => sum + row.totalValue, 0);
  const onPo = rows.reduce((sum, row) => sum + row.onPo, 0);
  const averageCostPrice = onHand > 0 ? totalValue / onHand : 0;
  return { onHand, averageCostPrice, totalValue, onPo };
}
