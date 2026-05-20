/** Maps numeric role_id from the database to frontend role strings. */
export const ROLE_ID_TO_NAME = {
  1: "ADMIN",
  2: "MANAGER",
  3: "CASHIER",
  4: "TECHNICIAN",
  5: "INVENTORY_MANAGER",
  6: "ACCOUNTANT",
};

export const DEFAULT_ROLE_ID = 3; // CASHIER

export function roleNameFromId(roleId) {
  if (roleId == null) return "CASHIER";
  return ROLE_ID_TO_NAME[roleId] ?? "CASHIER";
}
