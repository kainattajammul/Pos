import { BranchModel } from "../models/branch.model.js";
import { normalizeBranchCode } from "../utils/branchHelpers.js";

export async function generateBranchCode(shopId, { city, name } = {}) {
  const prefix = normalizeBranchCode(
    (city || name || "BR").slice(0, 3),
  ).replace(/[^A-Z]/g, "") || "BR";

  for (let attempt = 0; attempt < 999; attempt += 1) {
    const seq = String(attempt + 1).padStart(3, "0");
    const code = `BR-${prefix}-${seq}`;
    const existing = await BranchModel.findByCode(shopId, code);
    if (!existing) return code;
  }

  const fallback = `BR-${prefix}-${Date.now().toString().slice(-6)}`;
  return fallback;
}

export function resolveBranchCode(input, generated) {
  const normalized = normalizeBranchCode(input);
  return normalized || generated;
}
