import type { UnlockingService } from "@/components/inventory/manage-services/unlocking-services-types";

export interface UnlockingProductFormValues {
  name: string;
  deliveryTime: string;
  manufacturer: string;
  description: string;
  apiStatus: "Disable" | "Enable";
  supplier: string;
  swapProduct: string;
  commission: boolean;
  showOnPos: boolean;
  retailPrice: string;
  costPrice: string;
  promotionalPrice: string;
  taxClass: string;
  taxInclusive: boolean;
}

export interface UnlockingProductRecord extends UnlockingProductFormValues {
  id: string;
  itemId: number;
  supportedDevices: string;
  closed?: boolean;
}

export const DEFAULT_UNLOCKING_PRODUCT_FORM: UnlockingProductFormValues = {
  name: "",
  deliveryTime: "",
  manufacturer: "",
  description: "",
  apiStatus: "Disable",
  supplier: "",
  swapProduct: "",
  commission: false,
  showOnPos: true,
  retailPrice: "0.00",
  costPrice: "0.00",
  promotionalPrice: "0.00",
  taxClass: "",
  taxInclusive: false,
};

export const MANUFACTURER_OPTIONS = ["Apple", "Samsung", "Huawei", "Google"];
export const API_STATUS_OPTIONS = ["Disable", "Enable"] as const;
export const TAX_CLASS_OPTIONS = ["Standard", "Reduced", "Zero"];
export const SUPPLIER_OPTIONS = ["Vendor A", "Vendor B"];
export const SWAP_PRODUCT_OPTIONS = ["Option 1", "Option 2"];

export const MOCK_UNLOCKING_PRODUCT_RECORDS: UnlockingProductRecord[] = [
  {
    id: "unlock-4650",
    itemId: 4650,
    name: "UK O2 All iPhone",
    supportedDevices: "N/A",
    deliveryTime: "",
    manufacturer: "Apple",
    description: "",
    apiStatus: "Disable",
    supplier: "",
    swapProduct: "",
    commission: false,
    showOnPos: true,
    retailPrice: "40.00",
    costPrice: "20.00",
    promotionalPrice: "0.00",
    taxClass: "",
    taxInclusive: false,
  },
  {
    id: "unlock-4651",
    itemId: 4651,
    name: "UK Vodafone All iPhone",
    supportedDevices: "N/A",
    deliveryTime: "",
    manufacturer: "",
    description: "",
    apiStatus: "Disable",
    supplier: "",
    swapProduct: "",
    commission: false,
    showOnPos: true,
    retailPrice: "50.00",
    costPrice: "25.00",
    promotionalPrice: "0.00",
    taxClass: "",
    taxInclusive: false,
  },
];

export function formatUnlockingPriceField(value: string): string {
  const parsed = Number.parseFloat(value);
  const amount = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  return amount.toFixed(2);
}

export function unlockingRecordToFormValues(
  record: UnlockingProductRecord,
): UnlockingProductFormValues {
  return {
    name: record.name,
    deliveryTime: record.deliveryTime,
    manufacturer: record.manufacturer,
    description: record.description,
    apiStatus: record.apiStatus,
    supplier: record.supplier,
    swapProduct: record.swapProduct,
    commission: record.commission,
    showOnPos: record.showOnPos,
    retailPrice: record.retailPrice,
    costPrice: record.costPrice,
    promotionalPrice: record.promotionalPrice,
    taxClass: record.taxClass,
    taxInclusive: record.taxInclusive,
  };
}

export function unlockingServiceToFormValues(
  row: UnlockingService | UnlockingProductRecord,
): UnlockingProductFormValues {
  if ("retailPrice" in row) {
    return unlockingRecordToFormValues(row);
  }
  return {
    ...DEFAULT_UNLOCKING_PRODUCT_FORM,
    name: row.name,
    retailPrice: row.price.toFixed(2),
    costPrice: row.cost.toFixed(2),
  };
}

export function recordToUnlockingService(record: UnlockingProductRecord): UnlockingService {
  return {
    id: record.id,
    itemId: record.itemId,
    name: record.name,
    supportedDevices: record.supportedDevices,
    price: Number.parseFloat(record.retailPrice) || 0,
    cost: Number.parseFloat(record.costPrice) || 0,
  };
}

export function getNextUnlockingItemId(existingRows: UnlockingProductRecord[]): number {
  const max = existingRows.reduce((highest, row) => Math.max(highest, row.itemId), 4650);
  return max + 1;
}

export function formValuesToUnlockingProduct(
  values: UnlockingProductFormValues,
  existing?: UnlockingProductRecord,
): UnlockingProductRecord {
  const retailPrice = formatUnlockingPriceField(values.retailPrice);
  const costPrice = formatUnlockingPriceField(values.costPrice);
  const promotionalPrice = formatUnlockingPriceField(values.promotionalPrice);

  if (existing) {
    return {
      ...existing,
      ...values,
      retailPrice,
      costPrice,
      promotionalPrice,
      name: values.name.trim(),
    };
  }

  return {
    ...values,
    id: `unlock-${Date.now()}`,
    itemId: 0,
    supportedDevices: "N/A",
    retailPrice,
    costPrice,
    promotionalPrice,
    name: values.name.trim(),
  };
}
