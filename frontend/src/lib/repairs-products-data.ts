export const PRODUCT_STOCK_STATUSES = [
  "in_stock",
  "out_of_stock",
  "limited_stock",
] as const;

export type ProductStockStatus = (typeof PRODUCT_STOCK_STATUSES)[number];

export const PRODUCT_STOCK_LABEL: Record<ProductStockStatus, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  limited_stock: "Limited Stock",
};

export interface RepairAccessoryProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stockStatus: ProductStockStatus;
  /** Optional image URL; UI falls back to category placeholder */
  imageUrl?: string;
  /** Manufacturer slugs for optional filtering when a device is selected */
  manufacturerTags?: string[];
}

export const REPAIR_ACCESSORY_PRODUCTS: RepairAccessoryProduct[] = [
  {
    id: "glass-tempered",
    name: "Tempered Glass Screen Protector",
    category: "Screen Protectors",
    description: "9H hardness, bubble-free install kit included.",
    price: 14.99,
    stockStatus: "in_stock",
    manufacturerTags: ["apple", "samsung", "google"],
  },
  {
    id: "cable-fast",
    name: "Fast Charging Cable",
    category: "Charging Cables",
    description: "USB-C to Lightning, 6ft braided cable.",
    price: 19.99,
    stockStatus: "in_stock",
    manufacturerTags: ["apple"],
  },
  {
    id: "case-slim",
    name: "Slim Protective Phone Case",
    category: "Phone Cases",
    description: "Shock-absorbing bumper with matte finish.",
    price: 24.99,
    stockStatus: "limited_stock",
    manufacturerTags: ["apple", "samsung", "oneplus"],
  },
  {
    id: "battery-oem",
    name: "Original Replacement Battery",
    category: "Batteries",
    description: "OEM-grade cell with 12-month warranty.",
    price: 49.99,
    stockStatus: "limited_stock",
    manufacturerTags: ["samsung", "google", "motorola"],
  },
  {
    id: "adapter-25w",
    name: "25W Charging Adapter",
    category: "Chargers",
    description: "Wall adapter with over-voltage protection.",
    price: 29.99,
    stockStatus: "in_stock",
  },
  {
    id: "lens-protector",
    name: "Camera Lens Protector",
    category: "Accessories",
    description: "Aluminum ring lens guards for rear cameras.",
    price: 12.99,
    stockStatus: "in_stock",
    manufacturerTags: ["apple", "samsung"],
  },
  {
    id: "earbuds-basic",
    name: "Wired Earphones",
    category: "Earphones",
    description: "In-ear buds with inline microphone.",
    price: 15.99,
    stockStatus: "out_of_stock",
  },
  {
    id: "part-screen",
    name: "Replacement LCD Screen",
    category: "Replacement Parts",
    description: "Aftermarket display assembly — professional install recommended.",
    price: 89.99,
    stockStatus: "limited_stock",
    manufacturerTags: ["samsung", "google", "motorola", "lg"],
  },
];

export function filterProductsForManufacturer(
  products: RepairAccessoryProduct[],
  manufacturerId: string | null,
): RepairAccessoryProduct[] {
  if (!manufacturerId) return products;
  const tagged = products.filter(
    (p) =>
      !p.manufacturerTags?.length ||
      p.manufacturerTags.includes(manufacturerId),
  );
  return tagged.length > 0 ? tagged : products;
}
