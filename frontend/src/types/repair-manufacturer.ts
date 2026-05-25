export interface ApiRepairManufacturer {
  id: number;
  shopId: number;
  repairCategoryId: number;
  name: string;
  slug: string;
  iconKey: string;
  imageUrl: string | null;
  logoSlug: string | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturerBrandOption {
  key: string;
  label: string;
  logoSlug: string;
}

export interface CreateRepairManufacturerPayload {
  shopId: number;
  repairCategoryId: number;
  name: string;
  iconKey?: string;
  imageUrl?: string | null;
  logoSlug?: string;
}

export interface UpdateRepairManufacturerPayload {
  name?: string;
  iconKey?: string;
  imageUrl?: string | null;
  logoSlug?: string;
}

export interface UploadRepairManufacturerImageResult {
  url: string;
  path: string;
}
