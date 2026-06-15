import { Prisma } from "@prisma/client";

const { Decimal } = Prisma;

export function toDecimal(value) {
  if (value == null) return null;
  if (value instanceof Decimal) return value;
  return new Decimal(String(value));
}

export function decimalToString(value, places = 4) {
  if (value == null) return null;
  const d = toDecimal(value);
  return d.toFixed(places);
}

export function multiplyDecimal(a, b) {
  return toDecimal(a).mul(toDecimal(b));
}

export function addDecimal(a, b) {
  return toDecimal(a).add(toDecimal(b));
}

export function subtractDecimal(a, b) {
  return toDecimal(a).sub(toDecimal(b));
}

/** Weighted average: (currentQty * currentCost + receivedQty * unitCost) / (currentQty + receivedQty) */
export function weightedAverageCost(currentQty, currentCost, receivedQty, unitCost) {
  if (receivedQty <= 0) return currentCost != null ? toDecimal(currentCost) : null;
  const totalQty = currentQty + receivedQty;
  if (totalQty <= 0) return toDecimal(unitCost);
  const current = currentCost != null ? toDecimal(currentCost) : new Decimal(0);
  const numerator = current.mul(currentQty).add(toDecimal(unitCost).mul(receivedQty));
  return numerator.div(totalQty);
}
