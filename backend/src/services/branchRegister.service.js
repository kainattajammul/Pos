import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchRegisterModel, BranchRegisterSessionModel } from "../models/branchFinance.model.js";
import { toPublicRegister, toPublicRegisterSession } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { generateDocumentNumber, parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";
import { OPEN_REGISTER_SESSION_STATUSES } from "../constants/financeEnums.js";

export async function listRegisters({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, sort, direction } = parsePagination(query);
  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    archivedAt: null,
  };
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { registerCode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const orderBy = { [sort === "name" ? "name" : "createdAt"]: direction };
  const [rows, total] = await prisma.$transaction([
    BranchRegisterModel.list(where, { skip, take: limit, orderBy }),
    BranchRegisterModel.count(where),
  ]);

  return {
    data: rows.map(toPublicRegister),
    meta: paginationMeta(page, limit, total),
  };
}

export async function createRegister({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const registerCode = String(input.register_code).trim().toUpperCase();

  const existing = await prisma.branchRegister.findFirst({
    where: { branchId: branch.id, registerCode },
  });
  if (existing) throw new ApiError(HTTP.CONFLICT, "Register code already exists");

  const register = await prisma.$transaction(async (tx) => {
    if (input.is_default) {
      await tx.branchRegister.updateMany({
        where: { branchId: branch.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await BranchRegisterModel.create(
      {
        shopId: Number(shopId),
        branchId: branch.id,
        registerCode,
        name: input.name,
        description: input.description ?? null,
        location: input.location ?? null,
        isDefault: Boolean(input.is_default),
        supportedPaymentMethods: input.supported_payment_methods ?? null,
        deviceIdentifier: input.device_identifier ?? null,
        createdById: userId ?? null,
      },
      tx,
    );

    if (input.create_default_drawer !== false) {
      await tx.branchCashDrawer.create({
        data: {
          shopId: Number(shopId),
          branchId: branch.id,
          registerId: created.id,
          drawerCode: "MAIN",
          name: "Main drawer",
        },
      });
    }

    if (input.is_default) {
      await tx.branchFinanceSettings.upsert({
        where: { branchId: branch.id },
        create: { branchId: branch.id, shopId: Number(shopId), defaultRegisterId: created.id },
        update: { defaultRegisterId: created.id },
      });
    }

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_registers.created",
    entity: "branch_register",
    entityId: register.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const full = await BranchRegisterModel.findByUuid(register.uuid, branch.id, shopId);
  return toPublicRegister(full);
}

export async function updateRegister({ shopId, branchUuid, registerUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const register = await BranchRegisterModel.findByUuid(registerUuid, branch.id, shopId);
  if (!register) throw new ApiError(HTTP.NOT_FOUND, "Register not found");

  const data = {};
  if (input.name != null) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.location !== undefined) data.location = input.location;
  if (input.status != null) data.status = String(input.status).toUpperCase();
  if (input.device_identifier !== undefined) data.deviceIdentifier = input.device_identifier;
  if (input.supported_payment_methods !== undefined) {
    data.supportedPaymentMethods = input.supported_payment_methods;
  }
  data.updatedById = userId ?? null;

  if (input.is_default) {
    await prisma.branchRegister.updateMany({
      where: { branchId: branch.id, isDefault: true },
      data: { isDefault: false },
    });
    data.isDefault = true;
    await prisma.branchFinanceSettings.upsert({
      where: { branchId: branch.id },
      create: { branchId: branch.id, shopId: Number(shopId), defaultRegisterId: register.id },
      update: { defaultRegisterId: register.id },
    });
  }

  await BranchRegisterModel.update(register.id, data);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_registers.updated",
    entity: "branch_register",
    entityId: register.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const full = await BranchRegisterModel.findByUuid(registerUuid, branch.id, shopId);
  return toPublicRegister(full);
}

export async function archiveRegister({ shopId, branchUuid, registerUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const register = await BranchRegisterModel.findByUuid(registerUuid, branch.id, shopId);
  if (!register) throw new ApiError(HTTP.NOT_FOUND, "Register not found");

  const openSession = await BranchRegisterSessionModel.findOpenForRegister(register.id);
  if (openSession) throw new ApiError(HTTP.CONFLICT, "Cannot archive register with open session");

  await BranchRegisterModel.update(register.id, { status: "ARCHIVED", archivedAt: new Date() });
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_registers.archived",
    entity: "branch_register",
    entityId: register.uuid,
    ...getClientMeta(req),
  });

  const full = await prisma.branchRegister.findFirst({ where: { id: register.id } });
  return toPublicRegister({ ...full, sessions: [], cashDrawers: [] });
}

export async function openRegisterSession({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const register = await BranchRegisterModel.findByUuid(input.register_id, branch.id, shopId);
  if (!register) throw new ApiError(HTTP.NOT_FOUND, "Register not found");
  if (register.status === "ARCHIVED") throw new ApiError(HTTP.CONFLICT, "Register is archived");

  const drawer = await prisma.branchCashDrawer.findFirst({
    where: {
      uuid: input.cash_drawer_id,
      registerId: register.id,
      branchId: branch.id,
      archivedAt: null,
    },
  });
  if (!drawer) throw new ApiError(HTTP.NOT_FOUND, "Cash drawer not found");

  const session = await prisma.$transaction(async (tx) => {
    const existingRegister = await BranchRegisterSessionModel.findOpenForRegister(register.id, tx);
    if (existingRegister) throw new ApiError(HTTP.CONFLICT, "Register already has an open session");

    const existingDrawer = await tx.branchRegisterSession.findFirst({
      where: {
        cashDrawerId: drawer.id,
        status: { in: OPEN_REGISTER_SESSION_STATUSES },
      },
    });
    if (existingDrawer) throw new ApiError(HTTP.CONFLICT, "Cash drawer already in use");

    const openingFloat = toDecimal(input.opening_float ?? 0);
    const created = await tx.branchRegisterSession.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        registerId: register.id,
        cashDrawerId: drawer.id,
        assignedStaffId: input.assigned_staff_id ?? userId ?? null,
        openingFloat,
        openingNotes: input.opening_notes ?? null,
        openedById: userId ?? null,
      },
      include: { register: true, cashDrawer: true },
    });

    await tx.branchCashMovement.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        registerSessionId: created.id,
        movementType: "OPENING_FLOAT",
        amount: openingFloat,
        notes: input.opening_notes ?? null,
        performedById: userId ?? null,
      },
    });

    await tx.branchCashDrawer.update({
      where: { id: drawer.id },
      data: { status: "IN_USE", lastOpenedAt: new Date() },
    });

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_register_sessions.opened",
    entity: "branch_register_session",
    entityId: session.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicRegisterSession(session);
}

export async function closeRegisterSession({ shopId, branchUuid, sessionUuid, input, userId, req, force = false }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const session = await BranchRegisterSessionModel.findByUuid(sessionUuid, branch.id, shopId);
  if (!session) throw new ApiError(HTTP.NOT_FOUND, "Register session not found");
  if (!OPEN_REGISTER_SESSION_STATUSES.includes(session.status)) {
    throw new ApiError(HTTP.CONFLICT, "Session is not open");
  }

  const countedCash = toDecimal(input.counted_cash);
  const expectedCash = await calculateExpectedCash(session.id);
  const cashDifference = countedCash.sub(expectedCash);

  const closed = await prisma.$transaction(async (tx) => {
    const updated = await tx.branchRegisterSession.update({
      where: { id: session.id },
      data: {
        status: force ? "FORCED_CLOSED" : "CLOSED",
        expectedCash,
        countedCash,
        cashDifference,
        closingNotes: input.closing_notes ?? null,
        discrepancyReason: input.discrepancy_reason ?? null,
        closedAt: new Date(),
        closedById: userId ?? null,
      },
      include: { register: true, cashDrawer: true },
    });

    await tx.branchCashMovement.create({
      data: {
        shopId: Number(shopId),
        branchId: branch.id,
        registerSessionId: session.id,
        movementType: "CLOSING_COUNT",
        amount: countedCash,
        notes: input.closing_notes ?? null,
        performedById: userId ?? null,
      },
    });

    await tx.branchCashDrawer.update({
      where: { id: session.cashDrawerId },
      data: { status: "AVAILABLE", lastClosedAt: new Date() },
    });

    return updated;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: force ? "branch_register_sessions.force_closed" : "branch_register_sessions.closed",
    entity: "branch_register_session",
    entityId: session.uuid,
    newValues: { ...input, expected_cash: expectedCash.toString(), cash_difference: cashDifference.toString() },
    ...getClientMeta(req),
  });

  return toPublicRegisterSession(closed);
}

async function calculateExpectedCash(sessionId) {
  const movements = await prisma.branchCashMovement.findMany({
    where: { registerSessionId: Number(sessionId), reversalOfId: null },
  });

  let expected = toDecimal(0);
  for (const m of movements) {
    const amount = toDecimal(m.amount);
    if (["OPENING_FLOAT", "CASH_SALE", "CASH_IN"].includes(m.movementType)) {
      expected = expected.add(amount);
    } else if (["CASH_REFUND", "CASH_OUT", "SAFE_DROP", "PETTY_CASH"].includes(m.movementType)) {
      expected = expected.sub(amount);
    }
  }
  return expected;
}

export async function listRegisterSessions({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.register_id) {
    const reg = await prisma.branchRegister.findFirst({
      where: { uuid: query.register_id, branchId: branch.id },
    });
    if (reg) where.registerId = reg.id;
  }

  const [rows, total] = await prisma.$transaction([
    BranchRegisterSessionModel.list(where, { skip, take: limit, orderBy: { openedAt: direction } }),
    BranchRegisterSessionModel.count(where),
  ]);

  return { data: rows.map(toPublicRegisterSession), meta: paginationMeta(page, limit, total) };
}

export async function getCurrentSessions({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await BranchRegisterSessionModel.list(
    {
      shopId: Number(shopId),
      branchId: branch.id,
      status: { in: OPEN_REGISTER_SESSION_STATUSES },
    },
    { take: 50, orderBy: { openedAt: "desc" } },
  );
  return rows.map(toPublicRegisterSession);
}

export async function recordCashMovement({ shopId, branchUuid, sessionUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const session = await BranchRegisterSessionModel.findByUuid(sessionUuid, branch.id, shopId);
  if (!session || !OPEN_REGISTER_SESSION_STATUSES.includes(session.status)) {
    throw new ApiError(HTTP.CONFLICT, "Register session is not open");
  }

  const movement = await prisma.branchCashMovement.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      registerSessionId: session.id,
      movementType: String(input.movement_type).toUpperCase(),
      amount: toDecimal(input.amount),
      reasonCode: input.reason_code ?? null,
      notes: input.notes ?? null,
      performedById: userId ?? null,
      approvedById: input.approved_by_id ?? null,
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: `branch_cash_movements.${String(input.movement_type).toLowerCase()}`,
    entity: "branch_cash_movement",
    entityId: movement.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return {
    id: movement.uuid,
    movement_type: movement.movementType.toLowerCase(),
    amount: movement.amount.toFixed(2),
    created_at: movement.createdAt.toISOString(),
  };
}
