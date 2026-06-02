export type ProductStockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Draft";

export interface InventoryProduct {
  id: string;
  numericId: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  model: string;
  type: string;
  imei?: string;
  serial?: string;
  supplier?: string;
  valuationMethod?: string;
  stock: number;
  stockWarning: number;
  reorderLevel: number;
  lowStockAlert: number;
  costPrice: number;
  salePrice: number;
  inPurchaseOrder?: number;
  status: ProductStockStatus;
  description?: string;
  imageUrl?: string;
}
