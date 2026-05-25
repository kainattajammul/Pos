/** Public repair device issue shape for API responses */
export function toPublicRepairDeviceIssue(issue) {
  return {
    id: issue.id,
    shopId: issue.shopId,
    repairCategoryId: issue.repairCategoryId,
    repairManufacturerId: issue.repairManufacturerId,
    repairDeviceId: issue.repairDeviceId,
    name: issue.name,
    slug: issue.slug,
    price: Number(issue.price),
    iconKey: issue.iconKey,
    imageUrl: issue.imageUrl ?? null,
    sortOrder: issue.sortOrder,
    isDefault: issue.isDefault,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}
