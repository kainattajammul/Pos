/** Public repair device part shape for API responses */
export function toPublicRepairDevicePart(part) {
  return {
    id: part.id,
    shopId: part.shopId,
    repairCategoryId: part.repairCategoryId,
    repairManufacturerId: part.repairManufacturerId,
    repairDeviceId: part.repairDeviceId,
    name: part.name,
    slug: part.slug,
    price: Number(part.price),
    onHand: part.onHand,
    imageVariant: part.imageVariant,
    imageUrl: part.imageUrl ?? null,
    sortOrder: part.sortOrder,
    isDefault: part.isDefault,
    createdAt: part.createdAt,
    updatedAt: part.updatedAt,
  };
}
