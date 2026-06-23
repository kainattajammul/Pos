import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchAppointmentModel, CustomerModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toPublicAppointmentSummary } from "../mappers/branchOperations.mapper.js";
import { assertSlotAvailable } from "./branchAppointmentAvailability.service.js";
import { ensureBranchCustomerLink } from "./branchCustomer.service.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

async function generateAppointmentNumber(tx, branchCode) {
  const year = new Date().getFullYear();
  const prefix = `APT-${branchCode}-${year}-`;
  const last = await tx.branchAppointment.findFirst({
    where: { appointmentNumber: { startsWith: prefix } },
    orderBy: { appointmentNumber: "desc" },
  });
  const seq = last ? Number(last.appointmentNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function resolveCustomer(shopId, customerUuid) {
  if (!customerUuid) return null;
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
  return customer;
}

async function getAppointmentOrThrow(uuid, branchId, shopId) {
  const appt = await BranchAppointmentModel.findByUuid(uuid, branchId, shopId);
  if (!appt) throw new ApiError(HTTP.NOT_FOUND, "Appointment not found");
  return appt;
}

export async function createAppointment({
  shopId,
  branchUuid,
  input,
  userId,
  req,
  overrideCapacity = false,
}) {
  const branch = await ensureBranch(shopId, branchUuid);

  if (input.idempotency_key) {
    const existing = await prisma.branchAppointment.findUnique({
      where: { idempotencyKey: input.idempotency_key },
      include: { customer: true },
    });
    if (existing && existing.branchId === branch.id) {
      return toPublicAppointmentSummary(existing);
    }
  }

  const customer = await resolveCustomer(shopId, input.customer_id);
  const startsAt = new Date(input.starts_at);
  const durationMinutes = input.duration_minutes ?? 30;
  const endsAt = input.ends_at
    ? new Date(input.ends_at)
    : new Date(startsAt.getTime() + durationMinutes * 60000);

  let repairTicketId = null;
  if (input.repair_ticket_id) {
    const ticket = await prisma.branchRepairTicket.findFirst({
      where: { uuid: input.repair_ticket_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!ticket) throw new ApiError(HTTP.NOT_FOUND, "Repair ticket not found");
    repairTicketId = ticket.id;
  }

  if (endsAt <= startsAt) {
    throw new ApiError(HTTP.BAD_REQUEST, "Appointment end time must be after start time");
  }

  if (!overrideCapacity) {
    await assertSlotAvailable({
      shopId,
      branchUuid,
      startsAt,
      endsAt,
      appointmentType: input.appointment_type,
      deviceCategory: input.device_category,
    });
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const appointmentNumber = await generateAppointmentNumber(tx, branch.branchCode);
    return tx.branchAppointment.create({
      data: {
        appointmentNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        customerId: customer?.id ?? null,
        serviceId: input.service_id ?? null,
        repairTicketId: repairTicketId,
        appointmentType: (input.appointment_type ?? "IN_STORE").toUpperCase(),
        status: (input.status ?? "CONFIRMED").toUpperCase(),
        startsAt,
        endsAt,
        durationMinutes,
        bufferMinutes: input.buffer_minutes ?? 0,
        customerName: input.customer_name ?? customer?.displayName ?? null,
        customerEmail: input.customer_email ?? customer?.email ?? null,
        customerPhone: input.customer_phone ?? customer?.phone ?? null,
        deviceCategory: input.device_category ?? null,
        manufacturer: input.manufacturer ?? null,
        model: input.model ?? null,
        issueSummary: input.issue_summary ?? null,
        customerNotes: input.customer_notes ?? null,
        internalNotes: input.internal_notes ?? null,
        idempotencyKey: input.idempotency_key ?? null,
        createdById: userId,
      },
      include: { customer: true },
    });
  });

  if (customer) {
    await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });
    await prisma.branchCustomer.update({
      where: { branchId_customerId: { branchId: branch.id, customerId: customer.id } },
      data: { totalAppointmentsCount: { increment: 1 } },
    });
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: customer.id,
      activityType: "APPOINTMENT_BOOKED",
      title: `Appointment ${appointment.appointmentNumber} booked`,
      referenceType: "appointment",
      referenceId: appointment.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.created",
    entity: "branch_appointment",
    entityId: appointment.uuid,
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(appointment);
}

export async function getAppointment({ shopId, branchUuid, appointmentUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);
  return toPublicAppointmentSummary(appt);
}

export async function listAppointments({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.from) where.startsAt = { ...(where.startsAt ?? {}), gte: new Date(query.from) };
  if (query.to) where.startsAt = { ...(where.startsAt ?? {}), lte: new Date(query.to) };

  const [rows, total] = await Promise.all([
    prisma.branchAppointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startsAt: "asc" },
      include: { customer: true },
    }),
    prisma.branchAppointment.count({ where }),
  ]);

  return {
    data: rows.map((a) => toPublicAppointmentSummary(a)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function rescheduleAppointment({
  shopId,
  branchUuid,
  appointmentUuid,
  input,
  userId,
  req,
  overrideCapacity = false,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);

  if (!ACTIVE_STATUSES.includes(appt.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Appointment cannot be rescheduled in its current status");
  }

  const startsAt = new Date(input.starts_at);
  const durationMinutes = input.duration_minutes ?? appt.durationMinutes;
  const endsAt = input.ends_at
    ? new Date(input.ends_at)
    : new Date(startsAt.getTime() + durationMinutes * 60000);

  if (!overrideCapacity) {
    await assertSlotAvailable({
      shopId,
      branchUuid,
      startsAt,
      endsAt,
      appointmentType: appt.appointmentType,
      deviceCategory: appt.deviceCategory,
      excludeAppointmentId: appt.id,
    });
  }

  const updated = await prisma.branchAppointment.update({
    where: { id: appt.id },
    data: {
      startsAt,
      endsAt,
      durationMinutes,
      status: "CONFIRMED",
      updatedById: userId,
      cancellationReason: null,
      cancelledAt: null,
    },
    include: { customer: true },
  });

  if (appt.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: appt.customerId,
      activityType: "APPOINTMENT_RESCHEDULED",
      title: `Appointment ${appt.appointmentNumber} rescheduled`,
      referenceType: "appointment",
      referenceId: appt.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.rescheduled",
    entity: "branch_appointment",
    entityId: appointmentUuid,
    newValues: { starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() },
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(updated);
}

export async function cancelAppointment({ shopId, branchUuid, appointmentUuid, reason, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);

  if (!ACTIVE_STATUSES.includes(appt.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Appointment cannot be cancelled in its current status");
  }

  const cancelled = await prisma.branchAppointment.update({
    where: { id: appt.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedById: userId,
    },
    include: { customer: true },
  });

  if (appt.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: appt.customerId,
      activityType: "APPOINTMENT_CANCELLED",
      title: `Appointment ${appt.appointmentNumber} cancelled`,
      referenceType: "appointment",
      referenceId: appt.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.cancelled",
    entity: "branch_appointment",
    entityId: appointmentUuid,
    reason,
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(cancelled);
}

export async function checkInAppointment({ shopId, branchUuid, appointmentUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);

  if (!["PENDING", "CONFIRMED"].includes(appt.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Only pending or confirmed appointments can be checked in");
  }

  const updated = await prisma.branchAppointment.update({
    where: { id: appt.id },
    data: { status: "CHECKED_IN", checkedInAt: new Date(), updatedById: userId },
    include: { customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.checked_in",
    entity: "branch_appointment",
    entityId: appointmentUuid,
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(updated);
}

export async function completeAppointment({ shopId, branchUuid, appointmentUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);

  if (!["CHECKED_IN", "IN_PROGRESS", "CONFIRMED"].includes(appt.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Appointment cannot be completed in its current status");
  }

  const updated = await prisma.branchAppointment.update({
    where: { id: appt.id },
    data: { status: "COMPLETED", completedAt: new Date(), updatedById: userId },
    include: { customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.completed",
    entity: "branch_appointment",
    entityId: appointmentUuid,
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(updated);
}

export async function markAppointmentNoShow({ shopId, branchUuid, appointmentUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const appt = await getAppointmentOrThrow(appointmentUuid, branch.id, shopId);

  if (!["PENDING", "CONFIRMED"].includes(appt.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Only pending or confirmed appointments can be marked no-show");
  }

  const updated = await prisma.branchAppointment.update({
    where: { id: appt.id },
    data: { status: "NO_SHOW", updatedById: userId },
    include: { customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_appointments.no_show",
    entity: "branch_appointment",
    entityId: appointmentUuid,
    ...getClientMeta(req),
  });

  return toPublicAppointmentSummary(updated);
}
