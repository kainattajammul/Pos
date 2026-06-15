import {
  permissionEffectFromDb,
  staffStatusFromDb,
} from "../constants/branchStaffEnums.js";
import { BRANCH_STAFF_PERMISSIONS } from "../constants/branchStaffPermissions.js";
import { hasPermission } from "../services/branchAuthorization.service.js";

export function toPublicRoleRef(role) {
  return {
    id: role.uuid,
    name: role.name,
    code: role.code,
  };
}

export function toPublicStaffUser(user) {
  return {
    id: user.uuid,
    name: user.fullName,
    email: user.email,
    avatar_url: null,
  };
}

export async function buildStaffAvailableActions(assignment, authUserId, shopId, branchId, shopPermissions) {
  const opts = { shopPermissions };
  const check = async (key) =>
    hasPermission(authUserId, branchId, shopId, key, opts);

  const [canEdit, canManageRoles, canManagePermissions, canDeactivate, canArchive] =
    await Promise.all([
      check(BRANCH_STAFF_PERMISSIONS.UPDATE),
      check(BRANCH_STAFF_PERMISSIONS.ROLES_ASSIGN),
      check(BRANCH_STAFF_PERMISSIONS.PERMISSIONS_ASSIGN),
      check(BRANCH_STAFF_PERMISSIONS.DEACTIVATE),
      check(BRANCH_STAFF_PERMISSIONS.ARCHIVE),
    ]);

  if (shopPermissions === null) {
    return {
      can_edit: true,
      can_manage_roles: true,
      can_manage_permissions: true,
      can_deactivate: true,
      can_archive: true,
    };
  }

  return {
    can_edit: canEdit,
    can_manage_roles: canManageRoles,
    can_manage_permissions: canManagePermissions,
    can_deactivate: canDeactivate && assignment.status === "ACTIVE",
    can_archive: canArchive && assignment.status !== "ARCHIVED",
  };
}

export function toPublicStaffListItem(assignment, extras = {}) {
  return {
    id: assignment.uuid,
    user: toPublicStaffUser(assignment.user),
    employee_code: assignment.employeeCode,
    employment_title: assignment.employmentTitle,
    roles: (assignment.roles ?? []).map((r) => toPublicRoleRef(r.role)),
    status: staffStatusFromDb(assignment.status),
    is_primary_branch: assignment.isPrimaryBranch,
    start_date: assignment.startDate?.toISOString() ?? null,
    end_date: assignment.endDate?.toISOString() ?? null,
    next_shift: extras.nextShift
      ? {
          starts_at: extras.nextShift.startsAt.toISOString(),
          ends_at: extras.nextShift.endsAt.toISOString(),
        }
      : null,
    performance_summary: extras.performanceSummary ?? null,
    available_actions: extras.availableActions ?? {},
    created_at: assignment.createdAt.toISOString(),
    updated_at: assignment.updatedAt.toISOString(),
  };
}

export function toPublicStaffDetail(assignment, extras = {}) {
  return {
    ...toPublicStaffListItem(assignment, extras),
    permissions: (assignment.permissions ?? []).map((p) => ({
      key: p.permission.key,
      effect: permissionEffectFromDb(p.effect),
      expires_at: p.expiresAt?.toISOString() ?? null,
    })),
    effective_permissions: extras.effectivePermissions ?? null,
  };
}

export function toPublicShift(shift) {
  const hoursMs = shift.endsAt - shift.startsAt;
  const totalHours = Math.max(0, hoursMs / 3600000 - (shift.breakMinutes ?? 0) / 60);
  return {
    id: shift.uuid,
    staff_assignment_id: shift.staffAssignment?.uuid ?? null,
    staff_name: shift.staffAssignment?.user?.fullName ?? null,
    title: shift.title,
    shift_date: shift.shiftDate.toISOString().slice(0, 10),
    starts_at: shift.startsAt.toISOString(),
    ends_at: shift.endsAt.toISOString(),
    break_minutes: shift.breakMinutes,
    status: shift.status.toLowerCase(),
    notes: shift.notes,
    total_scheduled_hours: Number(totalHours.toFixed(2)),
    payable_hours: Number(Math.max(0, totalHours).toFixed(2)),
  };
}

export function toPublicPerformance(row) {
  return {
    id: row.uuid,
    staff_assignment_id: row.staffAssignment?.uuid ?? null,
    staff_name: row.staffAssignment?.user?.fullName ?? null,
    period_type: row.periodType.toLowerCase(),
    period_start: row.periodStart.toISOString().slice(0, 10),
    period_end: row.periodEnd.toISOString().slice(0, 10),
    scheduled_hours: row.scheduledHours != null ? Number(row.scheduledHours) : null,
    worked_hours: row.workedHours != null ? Number(row.workedHours) : null,
    attendance_rate: row.attendanceRate != null ? Number(row.attendanceRate) : null,
    sales_count: row.salesCount || null,
    sales_value: row.salesValue != null ? Number(row.salesValue) : null,
    repairs_assigned: row.repairsAssigned || null,
    repairs_completed: row.repairsCompleted || null,
    repair_success_rate: row.repairSuccessRate != null ? Number(row.repairSuccessRate) : null,
    refunds_count: row.refundsCount || null,
    customer_rating: row.customerRating != null ? Number(row.customerRating) : null,
    target_value: row.targetValue != null ? Number(row.targetValue) : null,
    achieved_value: row.achievedValue != null ? Number(row.achievedValue) : null,
    target_percentage: row.targetPercentage != null ? Number(row.targetPercentage) : null,
    custom_metrics: row.customMetrics ?? null,
    notes: row.notes,
    calculated_at: row.calculatedAt?.toISOString() ?? null,
  };
}

export function toPublicSecurityRule(rule) {
  return {
    rule_key: rule.ruleKey,
    name: rule.name,
    description: rule.description,
    value: rule.value,
    is_enabled: rule.isEnabled,
    updated_at: rule.updatedAt.toISOString(),
  };
}

export function toPublicBranchRole(role) {
  return {
    id: role.uuid,
    name: role.name,
    code: role.code,
    description: role.description,
    is_system: role.isSystem,
    is_active: role.isActive,
    permissions: (role.permissions ?? []).map((rp) => ({
      key: rp.permission.key,
      module: rp.permission.module,
    })),
  };
}
