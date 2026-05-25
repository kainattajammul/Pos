export interface ApiRepairDevicePart {
  id: number;
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  name: string;
  slug: string;
  price: number;
  onHand: number;
  imageVariant: string;
  imageUrl: string | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairDevicePartPayload {
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceId: number;
  name: string;
  price: number;
  onHand?: number;
  imageVariant?: string;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UpdateRepairDevicePartPayload {
  name?: string;
  price?: number;
  onHand?: number;
  imageVariant?: string;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UploadRepairDevicePartImageResult {
  url: string;
  path: string;
}
