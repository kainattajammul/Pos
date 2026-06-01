export interface ApiRepairDeviceSeries {
  id: number;
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairDeviceSeriesPayload {
  shopId: number;
  repairCategoryId: number;
  repairManufacturerId: number;
  name: string;
  sortOrder?: number;
}

export interface UpdateRepairDeviceSeriesPayload {
  name?: string;
  sortOrder?: number;
}
