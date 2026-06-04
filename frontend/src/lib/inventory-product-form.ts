import { z } from "zod";
import type { InventoryProduct, ProductStockStatus } from "@/types/inventory-product";

export const productStockStatuses = [
  "In Stock",
  "Low Stock",
  "Out of Stock",
  "Draft",
] as const;

export const inventoryProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string(),
  category: z.string().min(1, "Category is required"),
  brand: z.string(),
  productType: z.string().min(1, "Product type is required"),
  costPrice: z
    .string()
    .min(1, "Cost price is required")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
      message: "Enter a valid cost price",
    }),
  salePrice: z
    .string()
    .min(1, "Sale price is required")
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
      message: "Enter a valid sale price",
    }),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: "Enter a valid quantity",
    }),
  lowStockAlert: z
    .string()
    .min(1, "Low stock alert is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: "Enter a valid alert quantity",
    }),
  description: z.string(),
  status: z.enum(productStockStatuses),
  imageUrl: z.string().optional(),
  imagePath: z.string().optional(),
  imageStorageProvider: z.enum(["supabase", "local"]).optional(),
  imageMimeType: z.string().optional(),
  imageSize: z.number().optional(),
});

export type InventoryProductFormValues = z.infer<typeof inventoryProductFormSchema>;

export const INVENTORY_PRODUCT_FORM_DEFAULTS: InventoryProductFormValues = {
  name: "",
  sku: "",
  barcode: "",
  category: "Phones",
  brand: "",
  productType: "Device",
  costPrice: "",
  salePrice: "",
  quantity: "0",
  lowStockAlert: "5",
  description: "",
  status: "In Stock",
  imageUrl: "",
  imagePath: "",
};

export function deriveProductStatus(
  stock: number,
  lowStockAlert: number,
  explicitStatus: ProductStockStatus,
): ProductStockStatus {
  if (explicitStatus === "Draft") return "Draft";
  if (stock <= 0) return "Out of Stock";
  if (stock <= lowStockAlert) return "Low Stock";
  return "In Stock";
}

export function mapProductToFormValues(product: InventoryProduct): InventoryProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    category: product.category,
    brand: product.brand,
    productType: product.type,
    costPrice: String(product.costPrice),
    salePrice: String(product.salePrice),
    quantity: String(product.stock),
    lowStockAlert: String(product.lowStockAlert),
    description: product.description ?? "",
    status: product.status,
    imageUrl: product.imageUrl ?? "",
    imagePath: product.imagePath ?? "",
    imageStorageProvider: product.imageStorageProvider,
    imageMimeType: product.imageMimeType,
    imageSize: product.imageSize,
  };
}

export function formValuesToProduct(
  values: InventoryProductFormValues,
  existingProduct?: InventoryProduct,
): InventoryProduct {
  const stock = Number(values.quantity);
  const lowStockAlert = Number(values.lowStockAlert);
  const status = deriveProductStatus(stock, lowStockAlert, values.status);
  const nextNumericId = Number(String(Date.now()).slice(-4));
  const imageUrl = values.imageUrl?.trim() || existingProduct?.imageUrl;
  const imagePath = values.imagePath?.trim() || existingProduct?.imagePath;

  return {
    id: existingProduct?.id ?? `prod-${Date.now()}`,
    numericId: existingProduct?.numericId ?? nextNumericId,
    name: values.name.trim(),
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    category: values.category,
    brand: values.brand.trim(),
    model: existingProduct?.model ?? values.name.trim(),
    type: values.productType,
    stockWarning: stock <= lowStockAlert ? 1 : 0,
    reorderLevel: existingProduct?.reorderLevel ?? lowStockAlert,
    stock,
    lowStockAlert,
    costPrice: Number(values.costPrice),
    salePrice: Number(values.salePrice),
    status,
    description: values.description.trim() || undefined,
    imageUrl: imageUrl || undefined,
    imagePath: imagePath || undefined,
    imageStorageProvider: values.imageStorageProvider ?? existingProduct?.imageStorageProvider,
    imageMimeType: values.imageMimeType ?? existingProduct?.imageMimeType,
    imageSize: values.imageSize ?? existingProduct?.imageSize,
    imei: existingProduct?.imei,
    serial: existingProduct?.serial,
    supplier: existingProduct?.supplier,
    valuationMethod: existingProduct?.valuationMethod,
    inPurchaseOrder: existingProduct?.inPurchaseOrder,
  };
}
