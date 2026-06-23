import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta, normalizeText } from "../utils/branchHelpers.js";
import { decimalToString, toDecimal } from "../utils/inventoryDecimal.js";
import { normalisePostcode } from "../utils/postcode.js";

function toPublicServiceArea(area) {
  return {
    id: area.uuid,
    name: area.name,
    area_type: area.areaType.toLowerCase(),
    is_enabled: area.isEnabled,
    priority: area.priority,
    postcode: area.postcode,
    postcode_prefix: area.postcodePrefix,
    city: area.city,
    county: area.county,
    country: area.country,
    latitude: area.latitude != null ? String(area.latitude) : null,
    longitude: area.longitude != null ? String(area.longitude) : null,
    radius_km: decimalToString(area.radiusKm, 2),
    allow_pickup: area.allowPickup,
    allow_delivery: area.allowDelivery,
    pickup_fee: decimalToString(area.pickupFee, 2),
    delivery_fee: decimalToString(area.deliveryFee, 2),
    minimum_order_value: decimalToString(area.minimumOrderValue, 2),
    estimated_delivery_minutes: area.estimatedDeliveryMinutes,
    available_from: area.availableFrom?.toISOString() ?? null,
    available_until: area.availableUntil?.toISOString() ?? null,
  };
}

function isExcludedArea(area, normalisedPostcode, city, county, country) {
  if (area.areaType !== "EXCLUDED_AREA" || !area.isEnabled) return false;
  if (area.postcode && normalisePostcode(area.postcode, country) === normalisedPostcode) return true;
  if (area.postcodePrefix && normalisedPostcode.startsWith(normalisePostcode(area.postcodePrefix, country))) {
    return true;
  }
  if (area.city && city && area.city.toLowerCase() === city.toLowerCase()) return true;
  if (area.county && county && area.county.toLowerCase() === county.toLowerCase()) return true;
  return false;
}

function matchesPostcodeArea(area, normalisedPostcode, city, county, country) {
  if (!area.isEnabled || area.areaType === "EXCLUDED_AREA") return false;

  const now = new Date();
  if (area.availableFrom && now < area.availableFrom) return false;
  if (area.availableUntil && now > area.availableUntil) return false;

  switch (area.areaType) {
    case "POSTCODE":
      return area.postcode && normalisePostcode(area.postcode, country) === normalisedPostcode;
    case "POSTCODE_PREFIX":
      return area.postcodePrefix && normalisedPostcode.startsWith(normalisePostcode(area.postcodePrefix, country));
    case "CITY":
      return area.city && city && area.city.toLowerCase() === city.toLowerCase();
    case "COUNTY":
      return area.county && county && area.county.toLowerCase() === county.toLowerCase();
    default:
      return false;
  }
}

export async function listServiceAreas({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    isEnabled: query.include_disabled === "true" ? undefined : true,
  };
  if (query.area_type) where.areaType = query.area_type.toUpperCase();

  const areas = await prisma.branchServiceArea.findMany({
    where,
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });

  return { data: areas.map(toPublicServiceArea) };
}

export async function getServiceArea({ shopId, branchUuid, areaUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const area = await prisma.branchServiceArea.findFirst({
    where: { uuid: areaUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!area) throw new ApiError(HTTP.NOT_FOUND, "Service area not found");
  return toPublicServiceArea(area);
}

export async function createServiceArea({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);

  const area = await prisma.branchServiceArea.create({
    data: {
      shopId: Number(shopId),
      branchId: branch.id,
      name: normalizeText(input.name),
      areaType: (input.area_type ?? "POSTCODE").toUpperCase(),
      isEnabled: input.is_enabled ?? true,
      priority: input.priority ?? 100,
      postcode: normalizeText(input.postcode),
      postcodePrefix: normalizeText(input.postcode_prefix),
      city: normalizeText(input.city),
      county: normalizeText(input.county),
      country: normalizeText(input.country) ?? "United Kingdom",
      latitude: input.latitude != null ? toDecimal(input.latitude) : null,
      longitude: input.longitude != null ? toDecimal(input.longitude) : null,
      radiusKm: input.radius_km != null ? toDecimal(input.radius_km) : null,
      allowPickup: input.allow_pickup ?? false,
      allowDelivery: input.allow_delivery ?? false,
      pickupFee: input.pickup_fee != null ? toDecimal(input.pickup_fee) : null,
      deliveryFee: input.delivery_fee != null ? toDecimal(input.delivery_fee) : null,
      minimumOrderValue: input.minimum_order_value != null ? toDecimal(input.minimum_order_value) : null,
      estimatedDeliveryMinutes: input.estimated_delivery_minutes ?? null,
      availableFrom: input.available_from ? new Date(input.available_from) : null,
      availableUntil: input.available_until ? new Date(input.available_until) : null,
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.service_area_created",
    entity: "branch_service_area",
    entityId: area.uuid,
    ...getClientMeta(req),
  });

  return toPublicServiceArea(area);
}

export async function updateServiceArea({ shopId, branchUuid, areaUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchServiceArea.findFirst({
    where: { uuid: areaUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Service area not found");

  const data = {};
  if (input.name !== undefined) data.name = normalizeText(input.name);
  if (input.area_type !== undefined) data.areaType = input.area_type.toUpperCase();
  if (input.is_enabled !== undefined) data.isEnabled = input.is_enabled;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.postcode !== undefined) data.postcode = normalizeText(input.postcode);
  if (input.postcode_prefix !== undefined) data.postcodePrefix = normalizeText(input.postcode_prefix);
  if (input.city !== undefined) data.city = normalizeText(input.city);
  if (input.county !== undefined) data.county = normalizeText(input.county);
  if (input.country !== undefined) data.country = normalizeText(input.country);
  if (input.latitude !== undefined) data.latitude = input.latitude != null ? toDecimal(input.latitude) : null;
  if (input.longitude !== undefined) data.longitude = input.longitude != null ? toDecimal(input.longitude) : null;
  if (input.radius_km !== undefined) data.radiusKm = input.radius_km != null ? toDecimal(input.radius_km) : null;
  if (input.allow_pickup !== undefined) data.allowPickup = input.allow_pickup;
  if (input.allow_delivery !== undefined) data.allowDelivery = input.allow_delivery;
  if (input.pickup_fee !== undefined) data.pickupFee = input.pickup_fee != null ? toDecimal(input.pickup_fee) : null;
  if (input.delivery_fee !== undefined) data.deliveryFee = input.delivery_fee != null ? toDecimal(input.delivery_fee) : null;
  if (input.minimum_order_value !== undefined) {
    data.minimumOrderValue = input.minimum_order_value != null ? toDecimal(input.minimum_order_value) : null;
  }
  if (input.estimated_delivery_minutes !== undefined) {
    data.estimatedDeliveryMinutes = input.estimated_delivery_minutes;
  }
  if (input.available_from !== undefined) {
    data.availableFrom = input.available_from ? new Date(input.available_from) : null;
  }
  if (input.available_until !== undefined) {
    data.availableUntil = input.available_until ? new Date(input.available_until) : null;
  }

  const updated = await prisma.branchServiceArea.update({ where: { id: existing.id }, data });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.service_area_updated",
    entity: "branch_service_area",
    entityId: areaUuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicServiceArea(updated);
}

export async function deleteServiceArea({ shopId, branchUuid, areaUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await prisma.branchServiceArea.findFirst({
    where: { uuid: areaUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Service area not found");

  await prisma.branchServiceArea.delete({ where: { id: existing.id } });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.service_area_deleted",
    entity: "branch_service_area",
    entityId: areaUuid,
    ...getClientMeta(req),
  });

  return { id: areaUuid, deleted: true };
}

export async function checkPostcodeCoverage({ shopId, branchUuid, postcode, city, county, country }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const resolvedCountry = country ?? "United Kingdom";
  const normalised = normalisePostcode(postcode, resolvedCountry);

  if (!normalised) {
    throw new ApiError(HTTP.BAD_REQUEST, "Postcode is required");
  }

  const areas = await prisma.branchServiceArea.findMany({
    where: { shopId: Number(shopId), branchId: branch.id, isEnabled: true },
    orderBy: { priority: "asc" },
  });

  const excluded = areas.some((a) =>
    isExcludedArea(a, normalised, city, county, resolvedCountry),
  );

  if (excluded) {
    return {
      postcode: normalised,
      is_covered: false,
      allow_pickup: false,
      allow_delivery: false,
      reason: "Postcode is in an excluded service area",
      matched_area: null,
    };
  }

  const matched = areas.find(
    (a) =>
      a.areaType !== "EXCLUDED_AREA" &&
      matchesPostcodeArea(a, normalised, city, county, resolvedCountry),
  );

  const settings = await prisma.branchOperationSettings.findUnique({
    where: { branchId: branch.id },
  });

  return {
    postcode: normalised,
    is_covered: Boolean(matched),
    allow_pickup: matched?.allowPickup ?? false,
    allow_delivery: matched?.allowDelivery ?? false,
    pickup_fee: decimalToString(matched?.pickupFee, 2),
    delivery_fee: decimalToString(matched?.deliveryFee, 2),
    minimum_order_value: decimalToString(matched?.minimumOrderValue, 2),
    estimated_delivery_minutes: matched?.estimatedDeliveryMinutes ?? null,
    delivery_radius_km: decimalToString(settings?.deliveryRadiusKm, 2),
    matched_area: matched ? toPublicServiceArea(matched) : null,
    reason: matched ? null : "No matching service area for this postcode",
  };
}
