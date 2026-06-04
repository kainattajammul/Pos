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
  /** Public URL returned by POST /api/v1/upload */
  imageUrl?: string;
  /** Storage path/key (not the binary) */
  imagePath?: string;
  imageStorageProvider?: "supabase" | "local";
  imageMimeType?: string;
  imageSize?: number;
}
