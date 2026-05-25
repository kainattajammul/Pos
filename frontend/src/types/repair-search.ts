export interface RepairSearchResultRepair {
  repair_type_id: number;
  repair_name: string;
  price: string;
  catalog_key: string | null;
}

export interface RepairSearchResultGroup {
  device_id: number;
  device_name: string;
  device_catalog_key: string | null;
  category_slug: string;
  category_name: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  repairs: RepairSearchResultRepair[];
}

export interface RepairSearchSelection {
  deviceId: number;
  repairTypeId: number;
  deviceCatalogKey: string | null;
  problemCatalogKey: string | null;
  categorySlug: string;
  manufacturerSlug: string;
  deviceName: string;
  repairName: string;
}
