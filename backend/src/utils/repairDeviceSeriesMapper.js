/** Public repair device series shape for API responses */
export function toPublicRepairDeviceSeries(series) {
  return {
    id: series.id,
    shopId: series.shopId,
    repairCategoryId: series.repairCategoryId,
    repairManufacturerId: series.repairManufacturerId,
    name: series.name,
    slug: series.slug,
    sortOrder: series.sortOrder,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };
}
