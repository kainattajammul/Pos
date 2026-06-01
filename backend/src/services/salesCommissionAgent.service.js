import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { SalesCommissionAgentModel } from "../models/salesCommissionAgent.model.js";
import { Prisma } from "@prisma/client";

function normalizeOptionalString(value) {
  if (value == null) return null;
  const t = String(value).trim();
  return t === "" ? null : t;
}

function parseCommissionPercent(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Sales commission percentage must be between 0 and 100",
    );
  }
  return new Prisma.Decimal(n.toFixed(2));
}

export async function getAllSalesCommissionAgents() {
  return SalesCommissionAgentModel.findAll();
}

export async function getSalesCommissionAgentById(id) {
  const agent = await SalesCommissionAgentModel.findById(id);
  if (!agent) {
    throw new ApiError(HTTP.NOT_FOUND, "Sales commission agent not found");
  }
  return agent;
}

export async function createSalesCommissionAgent({
  name,
  email,
  contactNumber,
  address,
  salesCommissionPercent,
}) {
  const trimmedName = String(name ?? "").trim();
  if (!trimmedName) {
    throw new ApiError(HTTP.BAD_REQUEST, "Name is required");
  }

  const normalizedEmail = normalizeOptionalString(email);
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Enter a valid email address");
  }

  return SalesCommissionAgentModel.create({
    name: trimmedName,
    email: normalizedEmail,
    contactNumber: normalizeOptionalString(contactNumber),
    address: normalizeOptionalString(address),
    salesCommissionPercent: parseCommissionPercent(salesCommissionPercent),
  });
}

export async function updateSalesCommissionAgent(
  id,
  { name, email, contactNumber, address, salesCommissionPercent },
) {
  const agent = await getSalesCommissionAgentById(id);
  const data = {};

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName) {
      throw new ApiError(HTTP.BAD_REQUEST, "Name is required");
    }
    data.name = trimmedName;
  }
  if (email !== undefined) {
    const normalizedEmail = normalizeOptionalString(email);
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new ApiError(HTTP.BAD_REQUEST, "Enter a valid email address");
    }
    data.email = normalizedEmail;
  }
  if (contactNumber !== undefined) {
    data.contactNumber = normalizeOptionalString(contactNumber);
  }
  if (address !== undefined) {
    data.address = normalizeOptionalString(address);
  }
  if (salesCommissionPercent !== undefined) {
    data.salesCommissionPercent = parseCommissionPercent(salesCommissionPercent);
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return agent;
  }

  return SalesCommissionAgentModel.update(id, data);
}

export async function deleteSalesCommissionAgent(id) {
  await getSalesCommissionAgentById(id);
  await SalesCommissionAgentModel.delete(id);
}
