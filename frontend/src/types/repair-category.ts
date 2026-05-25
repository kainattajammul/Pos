export interface ApiRepairCategory {
  id: number;
  shopId: number;
  name: string;
  slug: string;
  iconKey: string;
  imageUrl: string | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepairCategoryIconOption {
  key: string;
  label: string;
}

export interface CreateRepairCategoryPayload {
  shopId: number;
  name: string;
  iconKey?: string;
  imageUrl?: string | null;
}

export interface UpdateRepairCategoryPayload {
  name?: string;
  iconKey?: string;
  imageUrl?: string | null;
}

export interface UploadRepairCategoryImageResult {
  url: string;
  path: string;
}
