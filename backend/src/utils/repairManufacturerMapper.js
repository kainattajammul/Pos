/** Public repair manufacturer shape for API responses */
export function toPublicRepairManufacturer(manufacturer) {
  return {
    id: manufacturer.id,
    shopId: manufacturer.shopId,
    repairCategoryId: manufacturer.repairCategoryId,
    name: manufacturer.name,
    slug: manufacturer.slug,
    iconKey: manufacturer.iconKey,
    imageUrl: manufacturer.imageUrl ?? null,
    logoSlug: manufacturer.logoSlug ?? null,
    sortOrder: manufacturer.sortOrder,
    isDefault: manufacturer.isDefault,
    createdAt: manufacturer.createdAt,
    updatedAt: manufacturer.updatedAt,
  };
}
