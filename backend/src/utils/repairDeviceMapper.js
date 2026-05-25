/** Public repair device shape for API responses */
export function toPublicRepairDevice(device) {
  return {
    id: device.id,
    shopId: device.shopId,
    repairCategoryId: device.repairCategoryId,
    repairManufacturerId: device.repairManufacturerId,
    name: device.name,
    slug: device.slug,
    imageUrl: device.imageUrl ?? null,
    iconVariant: device.iconVariant ?? null,
    sortOrder: device.sortOrder,
    isDefault: device.isDefault,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  };
}
