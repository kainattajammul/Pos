import type { InventoryProduct } from "@/types/inventory-product";
import { DEMO_INVENTORY_PRODUCTS } from "@/lib/inventory-products-demo-data";

export type LowStockCriteria = "" | "all-low-stock" | "below-reorder" | "below-stock-warning";

export interface LowStockReportFilters {
  store: string;
  criteria: LowStockCriteria;
}

export interface LowStockReportRow {
  id: string;
  itemId: number;
  sku: string;
  category: string;
  manufacturer: string;
  device: string;
  productName: string;
  supplier: string;
  onHand: number;
  stockWarning: number;
  reorderLevel: number;
  onPo: number;
  requiredQty: number;
}

export const DEFAULT_LOW_STOCK_FILTERS: LowStockReportFilters = {
  store: "",
  criteria: "",
};

export const LOW_STOCK_CRITERIA_OPTIONS: { value: LowStockCriteria; label: string }[] = [
  { value: "", label: "Please Select" },
  { value: "all-low-stock", label: "All Low Stock" },
  { value: "below-reorder", label: "Below Reorder Level" },
  { value: "below-stock-warning", label: "Below Stock Warning" },
];

export function isLowStockProduct(product: InventoryProduct): boolean {
  return (
    product.status === "Low Stock" ||
    (product.stock > 0 && product.stock <= product.lowStockAlert) ||
    product.stock <= product.reorderLevel
  );
}

export function matchesLowStockCriteria(
  product: InventoryProduct,
  criteria: LowStockCriteria,
): boolean {
  if (!isLowStockProduct(product)) return false;
  if (criteria === "" || criteria === "all-low-stock") return true;
  if (criteria === "below-reorder") return product.stock <= product.reorderLevel;
  if (criteria === "below-stock-warning") {
    const warning =
      product.stockWarning > 0 ? product.stockWarning : product.lowStockAlert;
    return product.stock <= warning;
  }
  return true;
}

export function computeRequiredQty(product: InventoryProduct): number {
  return Math.max(0, product.reorderLevel - product.stock);
}

export function mapProductToLowStockRow(product: InventoryProduct): LowStockReportRow {
  return {
    id: product.id,
    itemId: product.numericId,
    sku: product.sku,
    category: product.category,
    manufacturer: product.brand,
    device: product.model,
    productName: product.name,
    supplier: product.supplier ?? "—",
    onHand: product.stock,
    stockWarning: product.stockWarning > 0 ? product.stockWarning : product.lowStockAlert,
    reorderLevel: product.reorderLevel,
    onPo: product.inPurchaseOrder ?? 0,
    requiredQty: computeRequiredQty(product),
  };
}

export function buildLowStockReport(
  products: InventoryProduct[],
  filters: LowStockReportFilters,
  defaultStoreName: string,
): LowStockReportRow[] {
  const storeFilter = filters.store.trim() || defaultStoreName;

  return products
    .filter((product) => {
      if (storeFilter && storeFilter !== defaultStoreName) {
        return false;
      }
      return matchesLowStockCriteria(product, filters.criteria);
    })
    .map(mapProductToLowStockRow);
}

export function getLowStockSourceProducts(): InventoryProduct[] {
  return DEMO_INVENTORY_PRODUCTS;
}
