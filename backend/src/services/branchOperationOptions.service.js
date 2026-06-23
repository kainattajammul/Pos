import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchOperationsModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { decimalToString, toDecimal } from "../utils/inventoryDecimal.js";

function toPublicOperationOptions(options) {
  return {
    id: options.uuid,
    allow_customer_collection: options.allowCustomerCollection,
    allow_home_pickup: options.allowHomePickup,
    allow_courier_pickup: options.allowCourierPickup,
    allow_postal_dropoff: options.allowPostalDropoff,
    allow_branch_delivery: options.allowBranchDelivery,
    allow_courier_delivery: options.allowCourierDelivery,
    allow_postal_return: options.allowPostalReturn,
    pickup_fee: decimalToString(options.pickupFee, 2),
    delivery_fee: decimalToString(options.deliveryFee, 2),
    free_pickup_minimum: decimalToString(options.freePickupMinimum, 2),
    free_delivery_minimum: decimalToString(options.freeDeliveryMinimum, 2),
    minimum_pickup_notice_minutes: options.minimumPickupNoticeMinutes,
    minimum_delivery_notice_minutes: options.minimumDeliveryNoticeMinutes,
    pickup_instructions: options.pickupInstructions,
    collection_instructions: options.collectionInstructions,
    delivery_instructions: options.deliveryInstructions,
  };
}

export async function getOperationOptions({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const options = await BranchOperationsModel.getOperationOptions(branch.id, shopId);
  return toPublicOperationOptions(options);
}

export async function updateOperationOptions({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchOperationsModel.getOperationOptions(branch.id, shopId);

  const data = {};
  if (input.allow_customer_collection != null) data.allowCustomerCollection = input.allow_customer_collection;
  if (input.allow_home_pickup != null) data.allowHomePickup = input.allow_home_pickup;
  if (input.allow_courier_pickup != null) data.allowCourierPickup = input.allow_courier_pickup;
  if (input.allow_postal_dropoff != null) data.allowPostalDropoff = input.allow_postal_dropoff;
  if (input.allow_branch_delivery != null) data.allowBranchDelivery = input.allow_branch_delivery;
  if (input.allow_courier_delivery != null) data.allowCourierDelivery = input.allow_courier_delivery;
  if (input.allow_postal_return != null) data.allowPostalReturn = input.allow_postal_return;
  if (input.pickup_fee !== undefined) data.pickupFee = input.pickup_fee != null ? toDecimal(input.pickup_fee) : null;
  if (input.delivery_fee !== undefined) data.deliveryFee = input.delivery_fee != null ? toDecimal(input.delivery_fee) : null;
  if (input.free_pickup_minimum !== undefined) {
    data.freePickupMinimum = input.free_pickup_minimum != null ? toDecimal(input.free_pickup_minimum) : null;
  }
  if (input.free_delivery_minimum !== undefined) {
    data.freeDeliveryMinimum = input.free_delivery_minimum != null ? toDecimal(input.free_delivery_minimum) : null;
  }
  if (input.minimum_pickup_notice_minutes !== undefined) {
    data.minimumPickupNoticeMinutes = input.minimum_pickup_notice_minutes;
  }
  if (input.minimum_delivery_notice_minutes !== undefined) {
    data.minimumDeliveryNoticeMinutes = input.minimum_delivery_notice_minutes;
  }
  if (input.pickup_instructions !== undefined) data.pickupInstructions = input.pickup_instructions;
  if (input.collection_instructions !== undefined) data.collectionInstructions = input.collection_instructions;
  if (input.delivery_instructions !== undefined) data.deliveryInstructions = input.delivery_instructions;

  const updated = await prisma.branchOperationOption.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_operations.options_updated",
    entity: "branch_operation_option",
    entityId: updated.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicOperationOptions(updated);
}
