import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchOperationsModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { BRANCH_OPERATIONS_PERMISSIONS } from "../constants/branchOperationsPermissions.js";

function toPublicVisibilityRules(rule) {
  return {
    visibility_mode: rule.visibilityMode.toLowerCase(),
    allow_cross_branch_search: rule.allowCrossBranchSearch,
    allow_contact_details_view: rule.allowContactDetailsView,
    allow_address_view: rule.allowAddressView,
    allow_activity_history_view: rule.allowActivityHistoryView,
    allow_sales_history_view: rule.allowSalesHistoryView,
    allow_repair_history_view: rule.allowRepairHistoryView,
    allow_warranty_history_view: rule.allowWarrantyHistoryView,
    allow_customer_export: rule.allowCustomerExport,
    mask_sensitive_fields: rule.maskSensitiveFields,
  };
}

export async function getVisibilityRules({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rule = await BranchOperationsModel.getVisibilityRule(branch.id, shopId);
  return toPublicVisibilityRules(rule);
}

export async function updateVisibilityRules({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchOperationsModel.getVisibilityRule(branch.id, shopId);

  const data = {};
  if (input.visibility_mode != null) data.visibilityMode = input.visibility_mode.toUpperCase();
  if (input.allow_cross_branch_search != null) data.allowCrossBranchSearch = input.allow_cross_branch_search;
  if (input.allow_contact_details_view != null) data.allowContactDetailsView = input.allow_contact_details_view;
  if (input.allow_address_view != null) data.allowAddressView = input.allow_address_view;
  if (input.allow_activity_history_view != null) data.allowActivityHistoryView = input.allow_activity_history_view;
  if (input.allow_sales_history_view != null) data.allowSalesHistoryView = input.allow_sales_history_view;
  if (input.allow_repair_history_view != null) data.allowRepairHistoryView = input.allow_repair_history_view;
  if (input.allow_warranty_history_view != null) data.allowWarrantyHistoryView = input.allow_warranty_history_view;
  if (input.allow_customer_export != null) data.allowCustomerExport = input.allow_customer_export;
  if (input.mask_sensitive_fields != null) data.maskSensitiveFields = input.mask_sensitive_fields;
  data.updatedById = userId;

  const updated = await prisma.branchCustomerVisibilityRule.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_customers.visibility_updated",
    entity: "branch_customer_visibility_rule",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicVisibilityRules(updated);
}

/**
 * Resolve visibility for a customer at a branch based on rules and permissions.
 */
export async function resolveCustomerVisibility({
  shopId,
  branchId,
  customerId,
  permissions = {},
  listMode = false,
}) {
  const rule = await BranchOperationsModel.getVisibilityRule(branchId, shopId);
  const hasCrossBranchPerm = permissions[BRANCH_OPERATIONS_PERMISSIONS.CUSTOMERS_VIEW_CROSS_BRANCH];
  const hasContactPerm = permissions[BRANCH_OPERATIONS_PERMISSIONS.CUSTOMERS_VIEW_CONTACT];

  let crossBranch = rule.allowCrossBranchSearch || hasCrossBranchPerm;
  let canView = true;
  let masked = rule.maskSensitiveFields;

  if (!listMode && customerId) {
    const link = await prisma.branchCustomer.findFirst({
      where: { customerId: Number(customerId), shopId: Number(shopId) },
    });

    switch (rule.visibilityMode) {
      case "SHOP_WIDE":
        break;
      case "HOME_BRANCH_ONLY":
      case "ASSIGNED_BRANCHES":
      case "INTERACTION_BRANCHES":
        if (!link || link.branchId !== Number(branchId)) {
          canView = crossBranch;
        }
        break;
      case "RESTRICTED":
        canView = Boolean(link && link.branchId === Number(branchId));
        break;
      default:
        break;
    }
  }

  if (!hasContactPerm && !rule.allowContactDetailsView) {
    masked = true;
  }

  return {
    canView,
    crossBranch,
    masked,
    canViewActivity: rule.allowActivityHistoryView,
    canViewSales: rule.allowSalesHistoryView,
    canViewRepairs: rule.allowRepairHistoryView,
    canViewWarranties: rule.allowWarrantyHistoryView,
    canExport: rule.allowCustomerExport,
  };
}
