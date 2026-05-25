/** Public repair category shape for API responses */
export function toPublicRepairCategory(category) {
  return {
    id: category.id,
    shopId: category.shopId,
    name: category.name,
    slug: category.slug,
    iconKey: category.iconKey,
    imageUrl: category.imageUrl ?? null,
    sortOrder: category.sortOrder,
    isDefault: category.isDefault,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
