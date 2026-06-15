/** @param {{ quantityOnHand: number; quantityReserved?: number; quantityDamaged?: number; quantityInRepair?: number }} inv */
export function quantityAvailable(inv) {
  return (
    (inv.quantityOnHand ?? 0) -
    (inv.quantityReserved ?? 0) -
    (inv.quantityDamaged ?? 0) -
    (inv.quantityInRepair ?? 0)
  );
}

export function isLowStock(available, reorderPoint) {
  return reorderPoint != null && available <= reorderPoint;
}

export function isOutOfStock(available) {
  return available <= 0;
}

export function assertQuantityNonNegative(value, field, allowNegative = false) {
  if (!allowNegative && value < 0) {
    const err = new Error(`${field} cannot be negative`);
    err.statusCode = 400;
    throw err;
  }
}
