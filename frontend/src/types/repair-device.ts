import type { DeviceIconVariant } from "@/components/repairs/device-preview-icon";

export interface ApiRepairDevice {
  id: number;
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceSeriesId: number | null;
  name: string;
  slug: string;
  imageUrl: string | null;
  iconVariant: DeviceIconVariant | null;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairDevicePayload {
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  repairDeviceSeriesId?: number | null;
  name: string;
  imageUrl?: string | null;
  iconVariant?: DeviceIconVariant | null;
  sortOrder?: number;
}

export interface UpdateRepairDevicePayload {
  name?: string;
  imageUrl?: string | null;
  iconVariant?: DeviceIconVariant | null;
  sortOrder?: number;
  repairDeviceSeriesId?: number | null;
}

export interface UploadRepairDeviceImageResult {
  url: string;
  path: string;
}
