import { REPAIR_STATUS_LABELS, SALE_STATUS_LABELS, APPOINTMENT_STATUS_LABELS, WARRANTY_CLAIM_STATUS_LABELS } from "../constants/operationsEnums.js";
import { decimalToString } from "../utils/inventoryDecimal.js";

export function toApiStatus(status, labels) {
  const value = status.toLowerCase();
  return { value, label: labels[status] ?? status };
}

export function toPublicOperationsSettings(settings, stats) {
  return {
    sales_today: decimalToString(stats.salesToday, 2) ?? "0.00",
    open_repair_tickets: stats.openRepairTickets,
    appointment_slots_per_day: settings.appointmentSlotsPerDay,
    pickup_enabled: settings.pickupEnabled,
    delivery_radius_km: String(settings.deliveryRadiusKm),
    warranty_claims_open: stats.warrantyClaimsOpen,
  };
}

export function toPublicRepairSummary(ticket, { technician, permissions = {} } = {}) {
  const now = new Date();
  const isOverdue =
    ticket.estimatedCompletionAt &&
    ticket.estimatedCompletionAt < now &&
    !["COMPLETED", "COLLECTED", "DELIVERED", "CANCELLED", "ARCHIVED"].includes(ticket.status);

  return {
    id: ticket.uuid,
    ticket_number: ticket.ticketNumber,
    customer: ticket.customer
      ? { id: ticket.customer.uuid, name: ticket.customer.displayName, phone: ticket.customer.phone }
      : null,
    device: {
      category: ticket.deviceCategory,
      manufacturer: ticket.manufacturer,
      model: ticket.model,
      imei: ticket.imei,
      serial_number: ticket.serialNumber,
    },
    status: toApiStatus(ticket.status, REPAIR_STATUS_LABELS),
    priority: { value: ticket.priority.toLowerCase(), label: ticket.priority },
    technician: technician ? { id: technician.uuid, name: technician.fullName } : null,
    estimated_completion_at: ticket.estimatedCompletionAt?.toISOString() ?? null,
    is_overdue: Boolean(isOverdue),
    final_cost: decimalToString(ticket.finalCost, 2),
    available_actions: {
      can_view: Boolean(permissions.canView),
      can_edit: Boolean(permissions.canUpdate),
      can_assign: Boolean(permissions.canAssign),
      can_change_status: Boolean(permissions.canChangeStatus),
      can_complete: Boolean(permissions.canComplete),
      can_cancel: Boolean(permissions.canCancel),
    },
  };
}

export function toPublicSaleSummary(sale) {
  return {
    id: sale.uuid,
    sale_number: sale.saleNumber,
    status: toApiStatus(sale.status, SALE_STATUS_LABELS),
    channel: sale.channel.toLowerCase(),
    customer: sale.customer ? { id: sale.customer.uuid, name: sale.customer.displayName } : null,
    total: decimalToString(sale.total, 2),
    payment_status: sale.paymentStatus.toLowerCase(),
    created_at: sale.createdAt.toISOString(),
    completed_at: sale.completedAt?.toISOString() ?? null,
  };
}

export function toPublicAppointmentSummary(appt) {
  return {
    id: appt.uuid,
    appointment_number: appt.appointmentNumber,
    status: toApiStatus(appt.status, APPOINTMENT_STATUS_LABELS),
    appointment_type: appt.appointmentType.toLowerCase(),
    starts_at: appt.startsAt.toISOString(),
    ends_at: appt.endsAt.toISOString(),
    customer_name: appt.customerName ?? appt.customer?.displayName,
    customer_phone: appt.customerPhone ?? appt.customer?.phone,
  };
}

export function toPublicCustomer(row, { masked = false } = {}) {
  const phone = masked && row.phone ? maskPhone(row.phone) : row.phone;
  const email = masked && row.email ? maskEmail(row.email) : row.email;
  return {
    id: row.uuid,
    display_name: row.displayName,
    first_name: row.firstName,
    last_name: row.lastName,
    email,
    phone,
    mobile: row.mobile,
    postcode: row.postcode,
    total_spend: row.branchLink?.totalSpend != null ? decimalToString(row.branchLink.totalSpend, 2) : undefined,
    last_interaction_at: row.branchLink?.lastInteractionAt?.toISOString(),
    is_blocked: row.branchLink?.isBlocked ?? false,
  };
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return "****";
  return `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
}

function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (!domain) return "****";
  return `${user[0]}***@${domain}`;
}

export function toPublicWarrantyClaim(claim) {
  return {
    id: claim.uuid,
    claim_number: claim.claimNumber,
    status: toApiStatus(claim.status, WARRANTY_CLAIM_STATUS_LABELS),
    claim_reason: claim.claimReason,
    reported_issue: claim.reportedIssue,
    submitted_at: claim.submittedAt.toISOString(),
  };
}
