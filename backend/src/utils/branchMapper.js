import {
  branchStatusFromDb,
  branchTypeFromDb,
  closureTypeFromDb,
  dayOfWeekFromDb,
  manualOpeningStatusFromDb,
} from "../constants/branchEnums.js";
import { BRANCH_PERMISSIONS } from "../constants/branchPermissions.js";

function mapUserRef(user) {
  if (!user) return null;
  return { id: user.id, full_name: user.fullName, email: user.email };
}

export function branchAvailableActions(branch, permissions) {
  if (!permissions) {
    return [
      "view",
      "update",
      "manage_status",
      "manage_opening_hours",
      "manage_closures",
      "archive",
      "restore",
      "activate",
      "deactivate",
    ];
  }

  const actions = [];
  const isArchived = branch.status === "ARCHIVED" || branch.archivedAt;

  if (permissions.includes(BRANCH_PERMISSIONS.VIEW)) actions.push("view");
  if (!isArchived && permissions.includes(BRANCH_PERMISSIONS.UPDATE)) {
    actions.push("update");
  }
  if (!isArchived && permissions.includes(BRANCH_PERMISSIONS.MANAGE_STATUS)) {
    actions.push("manage_status");
    if (branch.status !== "ACTIVE") actions.push("activate");
    if (branch.status === "ACTIVE") actions.push("deactivate");
  }
  if (!isArchived && permissions.includes(BRANCH_PERMISSIONS.MANAGE_OPENING_HOURS)) {
    actions.push("manage_opening_hours");
  }
  if (!isArchived && permissions.includes(BRANCH_PERMISSIONS.MANAGE_CLOSURES)) {
    actions.push("manage_closures");
  }
  if (!isArchived && permissions.includes(BRANCH_PERMISSIONS.ARCHIVE)) {
    actions.push("archive");
  }
  if (isArchived && permissions.includes(BRANCH_PERMISSIONS.RESTORE)) {
    actions.push("restore");
  }

  return actions;
}

export function toPublicOpeningHour(row) {
  return {
    day_of_week: dayOfWeekFromDb(row.dayOfWeek),
    is_closed: row.isClosed,
    opens_at: row.opensAt,
    closes_at: row.closesAt,
    break_starts_at: row.breakStartsAt,
    break_ends_at: row.breakEndsAt,
  };
}

export function toPublicClosure(row) {
  return {
    id: row.id,
    title: row.title,
    reason: row.reason,
    closure_type: closureTypeFromDb(row.closureType),
    starts_at: row.startsAt.toISOString(),
    ends_at: row.endsAt.toISOString(),
    all_day: row.allDay,
    is_recurring: row.isRecurring,
    recurrence_rule: row.recurrenceRule,
    created_by: mapUserRef(row.createdBy),
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function toPublicBranchListItem(branch, openingStatus, permissions) {
  return {
    uuid: branch.uuid,
    branch_code: branch.branchCode,
    name: branch.name,
    branch_type: branchTypeFromDb(branch.branchType),
    address_line_1: branch.addressLine1,
    address_line_2: branch.addressLine2,
    city: branch.city,
    county: branch.county,
    postcode: branch.postcode,
    country: branch.country,
    phone: branch.phone,
    email: branch.email,
    contact_person_name: branch.contactPersonName,
    status: branchStatusFromDb(branch.status),
    opening_status: openingStatus,
    is_primary: branch.isPrimary,
    is_active: branch.isActive,
    archived_at: branch.archivedAt?.toISOString() ?? null,
    created_at: branch.createdAt.toISOString(),
    updated_at: branch.updatedAt.toISOString(),
    available_actions: branchAvailableActions(branch, permissions),
  };
}

export function toPublicBranchProfile(branch, openingStatus, upcomingClosures = []) {
  return {
    uuid: branch.uuid,
    branch_code: branch.branchCode,
    name: branch.name,
    slug: branch.slug,
    branch_type: branchTypeFromDb(branch.branchType),
    status: branchStatusFromDb(branch.status),
    is_primary: branch.isPrimary,
    is_active: branch.isActive,
    archived_at: branch.archivedAt?.toISOString() ?? null,
    address: {
      line_1: branch.addressLine1,
      line_2: branch.addressLine2,
      city: branch.city,
      county: branch.county,
      postcode: branch.postcode,
      country: branch.country,
      latitude: branch.latitude != null ? Number(branch.latitude) : null,
      longitude: branch.longitude != null ? Number(branch.longitude) : null,
    },
    contact: {
      phone: branch.phone,
      alternative_phone: branch.alternativePhone,
      email: branch.email,
      contact_person_name: branch.contactPersonName,
      contact_person_phone: branch.contactPersonPhone,
      contact_person_email: branch.contactPersonEmail,
    },
    timezone: branch.timezone,
    manual_opening_status: branch.manualOpeningStatus
      ? manualOpeningStatusFromDb(branch.manualOpeningStatus)
      : null,
    manual_status_expires_at: branch.manualStatusExpiresAt?.toISOString() ?? null,
    opening_status: openingStatus,
    opening_hours: (branch.openingHours ?? []).map(toPublicOpeningHour),
    upcoming_closures: upcomingClosures.map(toPublicClosure),
    created_by: mapUserRef(branch.createdBy),
    updated_by: mapUserRef(branch.updatedBy),
    created_at: branch.createdAt.toISOString(),
    updated_at: branch.updatedAt.toISOString(),
  };
}
