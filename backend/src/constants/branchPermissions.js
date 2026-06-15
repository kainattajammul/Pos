export const BRANCH_PERMISSIONS = {
  VIEW: "branches.view",
  CREATE: "branches.create",
  UPDATE: "branches.update",
  MANAGE_STATUS: "branches.manage_status",
  MANAGE_OPENING_HOURS: "branches.manage_opening_hours",
  MANAGE_CLOSURES: "branches.manage_closures",
  ARCHIVE: "branches.archive",
  RESTORE: "branches.restore",
  DELETE: "branches.delete",
};

export const BRANCH_PERMISSION_SEED = [
  { key: BRANCH_PERMISSIONS.VIEW, module: "branches" },
  { key: BRANCH_PERMISSIONS.CREATE, module: "branches" },
  { key: BRANCH_PERMISSIONS.UPDATE, module: "branches" },
  { key: BRANCH_PERMISSIONS.MANAGE_STATUS, module: "branches" },
  { key: BRANCH_PERMISSIONS.MANAGE_OPENING_HOURS, module: "branches" },
  { key: BRANCH_PERMISSIONS.MANAGE_CLOSURES, module: "branches" },
  { key: BRANCH_PERMISSIONS.ARCHIVE, module: "branches" },
  { key: BRANCH_PERMISSIONS.RESTORE, module: "branches" },
  { key: BRANCH_PERMISSIONS.DELETE, module: "branches" },
];

/** Dev bypass and unauthenticated local dev get full branch access. */
export const BRANCH_DEV_PERMISSIONS = Object.values(BRANCH_PERMISSIONS);
